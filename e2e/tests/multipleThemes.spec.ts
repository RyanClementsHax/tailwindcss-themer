import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can enable multiple themes at the same time in separate trees', async ({
  page,
  testRepos
}) => {
  const { repo, root: root1 } = await testRepos
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
    .open()

  await root1.addClass('themeOne')

  const root2 = await repo.createRoot()

  await root2.addClass('themeTwo')

  await expect(page).toHaveScreenshot({ fullPage: true })
})

test('if multiple themes enabled on same root, the last one defined in the config shows', async ({
  page,
  testRepos
}) => {
  const { root: root1 } = await testRepos
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
    .open()

  await root1.addClasses(['themeOne', 'themeTwo'])

  await expect(page).toHaveScreenshot()

  const { root: root2 } = await testRepos
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
    .open()
  await root2.addClasses(['themeOne', 'themeTwo'])

  await expect(page).toHaveScreenshot()
})

test('themes can be overwritten by themes enabled higher in the tree by using class names regardless of theme declaration order', async ({
  page,
  testRepos
}) => {
  const { root: root1 } = await testRepos
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
    .open()

  await root1.addClass('themeOne')

  const root2 = await root1.createRoot()

  await root2.addClass('themeTwo')

  await expect(page).toHaveScreenshot({ fullPage: true })

  const { root: root3 } = await testRepos
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
    .open()

  await root3.addClass('themeOne')

  const root4 = await root1.createRoot()

  await root4.addClass('themeTwo')

  await expect(page).toHaveScreenshot({ fullPage: true })
})
