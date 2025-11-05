const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      indent: ['error', 2, { SwitchCase: 1 }],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'max-len': ['error', { code: 100, ignoreStrings: true, ignoreTemplateLiterals: true }],
      curly: ['error', 'all'],
      'no-var': 'off'
    }
  }
];
