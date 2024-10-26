const typescriptRules = {
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-unused-vars': 'warn'
}

module.exports = {
  extends: [
    // js/ts specific
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'typescript',
    // must be last for prettier to work well with eslint
    'prettier'
  ],
  env: {
    es6: true,
    node: true
  },
  rules: {
    quotes: [
      'warn',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false }
    ],
    'no-console': 'warn'
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      excludedFiles: ['e2e/**'],
      parserOptions: {
        project: './tsconfig.json'
      },
      rules: typescriptRules
    },
    {
      files: ['e2e/**/*.ts?(x)'],
      parserOptions: {
        project: './e2e/tsconfig.json'
      },
      rules: typescriptRules
    }
  ]
}
