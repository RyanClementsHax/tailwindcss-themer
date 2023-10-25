import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('displays the default theme by default', async ({ page, testRepo }) => {
  await testRepo.openWithConfig({
    defaultTheme: {
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    },
    themes: [
      {
        name: 'darkTheme',
        extend: {
          colors: {
            primary: 'red'
          }
        }
      }
    ]
  })

  await expect(page).toHaveScreenshot()
})
