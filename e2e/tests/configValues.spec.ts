import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('handles the DEFAULT key by removing it from the generated class name', async ({
  page,
  testRepos
}) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: 'blue'
            }
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            colors: {
              primary: {
                DEFAULT: 'red'
              }
            }
          }
        }
      ]
    })
    .open()

  await expect(page).toHaveScreenshot()

  await root.addClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

// TODO: fix this test's snapshots
test('handles the DEFAULT key even when nested', async ({
  page,
  testRepos
}) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: {
                500: {
                  DEFAULT: 'blue'
                }
              }
            }
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            colors: {
              primary: {
                DEFAULT: {
                  500: {
                    DEFAULT: 'red'
                  }
                }
              }
            }
          }
        }
      ]
    })
    .open()

  await root.item.overwriteClassTo('bg-primary-500')

  await expect(page).toHaveScreenshot()

  await root.addClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('allows for fonts to be styled', async ({ page, testRepos }) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: 'blue'
          },
          fontFamily: {
            title: 'Helvetica'
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            fontFamily: {
              title: 'Times New Roman'
            }
          }
        }
      ]
    })
    .open()

  await root.item.addClass('font-title')

  await expect(page).toHaveScreenshot()

  await root.addClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('allows for array values to be styled', async ({ page, testRepos }) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: 'blue'
          },
          fontFamily: {
            title: ['Helvetica']
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            fontFamily: {
              title: ['Times New Roman']
            }
          }
        }
      ]
    })
    .open()

  await root.item.addClass('font-title')

  await expect(page).toHaveScreenshot()

  await root.addClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

// TODO fix this test's snapshots
test('overwrites tailwind config on collision', async ({ page, testRepos }) => {
  const { root } = await testRepos
    .builder()
    .withBaseTailwindConfig({
      theme: {
        extend: {
          colors: {
            primary: 'green'
          }
        }
      }
    })
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

  await root.addClass('darkTheme')

  await expect(page).toHaveScreenshot()
})
