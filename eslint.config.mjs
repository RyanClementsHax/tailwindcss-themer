import eslint from '@eslint/js'
import vitest from 'eslint-plugin-vitest'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['lib', 'examples', 'coverage', 'e2e']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        project: './tsconfig.json'
      }
    }
  },
  {
    files: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    ...vitest.configs.recommended
  },
  {
    rules: {
      quotes: ['warn', 'single'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', ignoreRestSiblings: true }
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off'
    }
  }
)
