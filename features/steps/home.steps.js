const { Given, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

let html;

Given('I load the home view markup', function () {
  const file = path.join(process.cwd(), 'views', 'index.html');
  html = fs.readFileSync(file, 'utf8');
});

Then('it contains the title {string}', function (title) {
  assert.ok(html.includes(title));
});

Then('it contains a login link to {string}', function (href) {
  assert.ok(html.includes(`<a href="${href}">`));
});
