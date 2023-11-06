import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can use the theme name as a variant', async ({ page, testRepo }) => {
  const node = await testRepo.openWithConfig({
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

  await node.setClass('darkTheme')

  await node.setClass('darkTheme:bg-primary')

  await expect(page).toHaveScreenshot()
})

test('can use the theme name as a variant and styles apply to the element with the class on it', async ({
  page,
  testRepo
}) => {
  const node = await testRepo.openWithConfig({
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

  await node.setClasses(['darkTheme', 'darkTheme:bg-primary'])

  await expect(page).toHaveScreenshot()
})
