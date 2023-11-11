import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can enable a theme using the theme name as a class if no selectors explicitly provided', async ({
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

test('cant enable a theme using the theme name as a class if any selectors provided', async ({
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
          selectors: ['.dark-mode'],
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

test('cant enable theme with theme name if selectors configured with empty array', async ({
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
          selectors: [],
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

test('can enable the theme with a custom selector', async ({
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
          selectors: ['.dark-mode'],
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await root.addClass('dark-mode')

  await expect(page).toHaveScreenshot()
})

test('can enable the theme with multiple selectors', async ({
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
          selectors: ['.dark-mode', '[data-theme="dark"]'],
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await root.addClass('dark-mode')

  await expect(page).toHaveScreenshot()

  await root.removeClass('dark-mode')

  await expect(page).toHaveScreenshot()

  await root.setAttribute('data-theme', 'dark')

  await expect(page).toHaveScreenshot()
})
