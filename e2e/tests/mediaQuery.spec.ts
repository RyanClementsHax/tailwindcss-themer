import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can enable a theme using a media query', async ({ page, testRepos }) => {
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
          mediaQuery: '@media (prefers-color-scheme: dark)',
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await page.emulateMedia({ colorScheme: 'dark' })

  await expect(page).toHaveScreenshot()
})

// TODO fix this test's snapshots
test('cant enable a theme using the theme name as a class if a media query provided', async ({
  page,
  testRepos
}) => {
  const { root } = await testRepos
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
          mediaQuery: '@media (prefers-color-scheme: dark)',
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await root.addClass('darkTheme')

  await expect(page).toHaveScreenshot()
})
