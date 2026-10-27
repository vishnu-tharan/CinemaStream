const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');
const hooks = require('eslint-plugin-react-hooks');

module.exports = [
  { ignores: ['node_modules/**', '.expo/**', 'dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,cjs,mjs}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, __DEV__: 'readonly' },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': hooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
];
