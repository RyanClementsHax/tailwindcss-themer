import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can enable multiple themes at the same time in separate trees', async ({
  page,
  testRepo
}) => {
  const node1 = await testRepo.openWithConfig({
    defaultTheme: {
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    },
    themes: [
      {
        name: 'themeOne',
        extend: {
          colors: {
            primary: 'red'
          }
        }
      },
      {
        name: 'themeTwo',
        extend: {
          colors: {
            primary: 'green'
          }
        }
      }
    ]
  })

  await node1.setClass('themeOne')

  const node2 = await testRepo.createNode()

  await node2.setClass('themeTwo')

  await expect(page).toHaveScreenshot({ fullPage: true })
})

test('if multiple themes enabled on same node, the last one defined in the config shows', async ({
  page,
  testRepo
}) => {
  const node1 = await testRepo.openWithConfig({
    defaultTheme: {
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    },
    themes: [
      {
        name: 'themeOne',
        extend: {
          colors: {
            primary: 'red'
          }
        }
      },
      {
        name: 'themeTwo',
        extend: {
          colors: {
            primary: 'green'
          }
        }
      }
    ]
  })

  await node1.setClasses(['themeOne', 'themeTwo'])

  await expect(page).toHaveScreenshot()

  const node2 = await testRepo.openWithConfig({
    defaultTheme: {
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    },
    themes: [
      {
        name: 'themeTwo',
        extend: {
          colors: {
            primary: 'green'
          }
        }
      },
      {
        name: 'themeOne',
        extend: {
          colors: {
            primary: 'red'
          }
        }
      }
    ]
  })

  await node2.setClasses(['themeOne', 'themeTwo'])

  await expect(page).toHaveScreenshot()
})
