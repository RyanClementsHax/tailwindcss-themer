import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can enable a theme using the theme name as a class if no selectors explicitly provided', async ({
  page,
  testRepo
}) => {
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

  await testRepo.setClassOnRoot('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('cant enable a theme using the theme name as a class if any selectors provided', async ({
  page,
  testRepo
}) => {
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
        selectors: ['.dark-mode'],
        extend: {
          colors: {
            primary: 'red'
          }
        }
      }
    ]
  })

  await testRepo.setClassOnRoot('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('can enable the theme with a custom selector', async ({
  page,
  testRepo
}) => {
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
        selectors: ['.dark-mode'],
        extend: {
          colors: {
            primary: 'red'
          }
        }
      }
    ]
  })

  await testRepo.setClassOnRoot('dark-mode')

  await expect(page).toHaveScreenshot()
})

test('can enable the theme with multiple selectors', async ({
  page,
  testRepo
}) => {
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
        selectors: ['.dark-mode', '[data-theme="dark"]'],
        extend: {
          colors: {
            primary: 'red'
          }
        }
      }
    ]
  })

  await testRepo.setClassOnRoot('dark-mode')

  await expect(page).toHaveScreenshot()

  await testRepo.removeClassOnRoot('dark-mode')

  await expect(page).toHaveScreenshot()

  await testRepo.setAttributeOnRoot('data-theme', 'dark')

  await expect(page).toHaveScreenshot()
})
