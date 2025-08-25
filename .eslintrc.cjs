/* Minimal ESLint config to enable gradual linting. */
module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    // Keep relaxed; tighten later
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-constant-condition': ['warn', { checkLoops: false }],
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};
