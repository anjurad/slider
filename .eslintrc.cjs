/* ESLint config: enable TypeScript parsing and add test overrides to silence test globals. */
module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2021, sourceType: 'module', tsconfigRootDir: __dirname },
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
    // TypeScript-specific override: enable project parsing for TS files only
    {
      files: ['**/*.ts', 'tests/**/*.ts', 'unit/**/*.ts', 'scripts/**/*.ts'],
      parserOptions: { project: './tsconfig.json', tsconfigRootDir: __dirname },
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
    },
    // JS/test scripts override: do not apply parserOptions.project to plain JS
    {
      files: ['tests/**/*.js', 'scripts/**/*.js'],
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
