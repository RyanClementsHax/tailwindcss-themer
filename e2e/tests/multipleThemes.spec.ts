import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can enable multiple themes at the same time in separate trees', async ({
  page,
  testRepo
}) => {
  const root1 = await testRepo.openWithConfig({
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

  await root1.setClass('themeOne')

  const root2 = await testRepo.createRoot()

  await root2.setClass('themeTwo')

  await expect(page).toHaveScreenshot({ fullPage: true })
})

test('if multiple themes enabled on same root, the last one defined in the config shows', async ({
  page,
  testRepo
}) => {
  const root1 = await testRepo.openWithConfig({
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

  await root1.setClasses(['themeOne', 'themeTwo'])

  await expect(page).toHaveScreenshot()

  const root2 = await testRepo.openWithConfig({
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

  await root2.setClasses(['themeOne', 'themeTwo'])

  await expect(page).toHaveScreenshot()
})

test('themes can be overwritten by themes enabled higher in the tree by using class names regardless of theme declaration order', async ({
  page,
  testRepo
}) => {
  const root1 = await testRepo.openWithConfig({
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

  await root1.setClass('themeOne')

  const root2 = await root1.createRoot()

  await root2.setClass('themeTwo')

  await expect(page).toHaveScreenshot({ fullPage: true })

  const root3 = await testRepo.openWithConfig({
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

  await root3.setClass('themeOne')

  const root4 = await root1.createRoot()

  await root4.setClass('themeTwo')

  await expect(page).toHaveScreenshot({ fullPage: true })
})
