import { defineConfig, devices } from '@playwright/test'
import { getRepos } from './test_repos'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'tests',
  // some tests time out on slower laptops
  timeout: 60_000,
  testMatch: ['**/*.spec.ts'],
  globalSetup: './test_repos/setup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: ['tailwindv3'].flatMap(repo => {
    const initProject = {
      name: `chromium - ${repo}`,
      use: { ...devices['Desktop Chrome'] },
      metadata: { repo }
    }
    return [
      // Runs before all other projects to initialize all int tests builds without concurrency problems
      initProject,
      {
        name: `firefox - ${repo}`,
        use: { ...devices['Desktop Firefox'] },
        metadata: { repo },
        // Counts on the first project to initialize all int test builds to reuse for a performance boost
        dependencies: [initProject.name]
      },
      {
        name: `webKit - ${repo}`,
        use: { ...devices['Desktop Safari'] },
        metadata: { repo },
        // Counts on the first project to initialize all int test builds to reuse for a performance boost
        dependencies: [initProject.name]
      }

      /* Test against mobile viewports. */
      // {
      //   name: 'Mobile Chrome',
      //   use: { ...devices['Pixel 5'] },
      // },
      // {
      //   name: 'Mobile Safari',
      //   use: { ...devices['iPhone 12'] },
      // },

      /* Test against branded browsers. */
      // {
      //   name: 'Microsoft Edge',
      //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
      // },
      // {
      //   name: 'Google Chrome',
      //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
      // },
    ]
  })

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
