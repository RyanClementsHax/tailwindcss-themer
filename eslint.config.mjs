import eslint from '@eslint/js'
import vitest from 'eslint-plugin-vitest'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['lib', 'examples', 'e2e', 'coverage']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    ...vitest.configs.recommended
  },
  {
    rules: {
      quotes: ['warn', 'single'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', ignoreRestSiblings: true }
      ],
      'no-unused-vars': 'off'
    }
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      '@typescript-eslint/no-floating-promises': ['error']
    }
  }
)
