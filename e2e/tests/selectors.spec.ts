import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can enable a theme using the theme name as a class if no selectors explicitly provided', async ({
  page,
  testRepo
}) => {
  const root = await testRepo.openWithConfig({
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

  await root.setClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('cant enable a theme using the theme name as a class if any selectors provided', async ({
  page,
  testRepo
}) => {
  const root = await testRepo.openWithConfig({
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

  await root.setClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('cant enable theme with theme name if selectors configured with empty array', async ({
  page,
  testRepo
}) => {
  const root = await testRepo.openWithConfig({
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

  await root.setClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('can enable the theme with a custom selector', async ({
  page,
  testRepo
}) => {
  const root = await testRepo.openWithConfig({
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

  await root.setClass('dark-mode')

  await expect(page).toHaveScreenshot()
})

test('can enable the theme with multiple selectors', async ({
  page,
  testRepo
}) => {
  const root = await testRepo.openWithConfig({
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

  await root.setClass('dark-mode')

  await expect(page).toHaveScreenshot()

  await root.removeClass('dark-mode')

  await expect(page).toHaveScreenshot()

  await root.setAttribute('data-theme', 'dark')

  await expect(page).toHaveScreenshot()
})
