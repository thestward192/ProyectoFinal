require('dotenv').config();

'use strict';

// Imports
const express = require('express');
const session = require('express-session');
const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const nunjucks = require('nunjucks');
var path = require('path');
let app = express();

// Security: hide X-Powered-By header
app.disable('x-powered-by');

// Limit request body sizes to avoid expensive allocations
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));
app.use(express.urlencoded({ extended: false, limit: process.env.REQUEST_BODY_LIMIT || '100kb' }));

// Globals (load from environment to avoid hardcoding secrets)
const OKTA_ISSUER_URI = process.env.OKTA_ISSUER_URI || 'https://una-infosec.us.auth0.com/';
const OKTA_CLIENT_ID = process.env.OKTA_CLIENT_ID || 'mlIokKRjb5CGf8FbKpDIOKE36e7BjDLA';
const OKTA_CLIENT_SECRET = process.env.OKTA_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/dashboard';
const PORT = process.env.PORT || '3000';
const SECRET = process.env.SESSION_SECRET || '';

//  Esto se los dará Okta.
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: SECRET || 'dev-secret', // fallback only for local development
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  clientID: OKTA_CLIENT_ID,
  issuerBaseURL: OKTA_ISSUER_URI
};

// Only initialize OIDC if credentials are provided (allows running in dev without OIDC)
const AUTH_ENABLED = Boolean(OKTA_CLIENT_SECRET && OKTA_CLIENT_ID);
let oidc;
if (AUTH_ENABLED) {
  oidc = new ExpressOIDC({
    issuer: OKTA_ISSUER_URI,
    client_id: OKTA_CLIENT_ID,
    client_secret: OKTA_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    routes: { callback: { defaultRedirect: REDIRECT_URI } },
    scope: 'openid profile'
  });

  // auth router attaches /login, /logout, and /callback routes to the baseURL
  app.use(auth(config));
} else {
  console.warn('Auth not configured: OKTA_CLIENT_SECRET or OKTA_CLIENT_ID missing. Running in development mode without OIDC.');
}

// MVC View Setup (use Nunjucks instead of unmaintained Swig)
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  noCache: process.env.NODE_ENV !== 'production'
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// App middleware
app.use('/static', express.static('static'));

// Session config: hardened defaults
app.use(session({
  name: 'sid',
  secret: SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: (process.env.NODE_ENV === 'production'),
    sameSite: 'lax',
    path: '/',
    // session max age (ms) - configurable via env var, default 24h
    maxAge: parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 24 * 60 * 60 * 1000
  }
}));

// App routes
if (AUTH_ENABLED && oidc) {
  app.use(oidc.router);
}

app.get('/',  (req, res) => {
  res.render('index');  
});

// choose requiresAuth middleware depending on whether auth is enabled
const requiresAuthMiddleware = AUTH_ENABLED ? requiresAuth : () => (req, res, next) => next();

app.get('/dashboard', requiresAuthMiddleware() ,(req, res) => {
  // Prefer the user information provided by the OIDC middleware
  try {
    const userInfo = (req.oidc && req.oidc.user) || null;
    if (userInfo) {
      return res.render('dashboard', { user: userInfo });
    }

    // Fallback: safe parsing if middleware user is not available
    const token = (req.appSession && req.appSession.id_token) || null;
    if (!token) {
      return res.status(401).send('No token available');
    }
    const parts = token.split('.');
    if (!Array.isArray(parts) || parts.length < 2) {
      return res.status(400).send('Malformed token');
    }
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    const parsed = JSON.parse(payload);
    return res.render('dashboard', { user: parsed });
  } catch (err) {
    console.error('Failed to build user info for dashboard', err);
    return res.status(500).send('Internal error');
  }
});

const openIdClient = require('openid-client');
openIdClient.Issuer.defaultHttpOptions.timeout = 20000;

if (AUTH_ENABLED && oidc) {
  oidc.on('ready', () => {
    console.log('Server running on port: ' + PORT);
    app.listen(parseInt(PORT));
  });

  oidc.on('error', err => {
    console.error(err);
  });
} else {
  // Start server immediately when auth is not enabled (dev mode)
  app.listen(parseInt(PORT), () => {
    console.log('Server running (dev mode, no OIDC) on port: ' + PORT);
  });
}