module.exports = {
  root: true,
  env: { browser: true, es2021: true, jest: true },
  globals: { process: 'readonly' },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  settings: { react: { version: 'detect' } },
  rules: { 'react/prop-types': 'off', 'react/react-in-jsx-scope': 'off' },
};
