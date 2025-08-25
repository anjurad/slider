/* ESLint config: enable TypeScript parsing and add test overrides to silence test globals. */
module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2021, sourceType: 'module', project: './tsconfig.json', tsconfigRootDir: __dirname },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  globals: {
    CONFIG: 'readonly',
    splitSlides: 'readonly',
    renderSlides: 'readonly',
    applyDeckFrontmatter: 'readonly',
    applyConfig: 'readonly',
    parseMarkdown: 'readonly'
  },
  rules: {
    // keep a relaxed baseline; we'll tighten rules over time
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*.ts', 'tests/**/*.js', 'unit/**/*.ts', 'scripts/**/*.js'],
      env: { node: true, browser: true },
      globals: {
        CONFIG: 'readonly',
        splitSlides: 'readonly',
        renderSlides: 'readonly',
        applyDeckFrontmatter: 'readonly',
        applyConfig: 'readonly',
        parseMarkdown: 'readonly'
      },
      rules: {
        'no-undef': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-comment': 'off'
      }
    }
  ],
  ignorePatterns: ['dist/', 'node_modules/'],
};
