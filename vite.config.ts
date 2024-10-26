/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    dir: 'src',
    coverage: {
      enabled: true,
      include: ['src'],
      // defaults https://vitest.dev/guide/coverage.html#coverage-setup
      // the json-summary and json reporters are for reporting in PR
      // https://github.com/marketplace/actions/vitest-coverage-report#usage
      reporter: [
        ...(configDefaults.coverage.reporter ?? []),
        'json-summary',
        'json'
      ],
      // So we get coverage reports even if tests fail
      reportOnFailure: true
    }
  }
})
