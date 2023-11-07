import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can use the theme name as a variant', async ({ page, testRepo }) => {
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

  await root.setClass('darkTheme:bg-primary')

  await expect(page).toHaveScreenshot()
})

test('can use the theme name as a variant and styles apply to the element with the class on it', async ({
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

  await root.setClasses(['darkTheme', 'darkTheme:bg-primary'])

  await expect(page).toHaveScreenshot()
})
