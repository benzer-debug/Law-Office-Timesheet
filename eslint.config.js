const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: ['node_modules/', 'dist/', '.firebase/', '.github/', 'public/', 'coverage/']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'max-len': ['warn', { code: 100 }],
      'operator-linebreak': 'off',
      'object-curly-spacing': ['error', 'always'],
      'indent': ['error', 2],
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js', 'jest.setup.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'max-len': ['warn', { code: 100 }],
      'operator-linebreak': 'off',
      'object-curly-spacing': ['error', 'always'],
      'indent': ['error', 2],
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['google-apps-script.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ContentService: 'readonly',
        Utilities: 'readonly',
        GmailApp: 'readonly',
        Logger: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  },
  {
    files: ['firebaseConfig.js'],
    rules: {
      'max-len': 'off' // Firebase config URLs are inherently long
    }
  }
];

