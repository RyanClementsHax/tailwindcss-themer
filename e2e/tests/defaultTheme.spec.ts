import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('displays the default theme when no theme enabled', async ({
  page,
  testRepos
}) => {
  await testRepos
    .builder()
    .withThemerConfig({
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
    .open()

  await expect(page).toHaveScreenshot()
})
