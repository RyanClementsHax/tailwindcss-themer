import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test.describe('DEFAULT key', () => {
  test('removes the DEFAULT field name when it is a leaf', async ({
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

  test('doesnt remove the DEFAULT field name when not a leaf', async ({
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
                  500: 'blue'
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
                    500: 'red'
                  }
                }
              }
            }
          }
        ]
      })
      .open()

    await root.item.overwriteClassTo('bg-primary-DEFAULT-500')

    await expect(page).toHaveScreenshot()

    await root.addClass('darkTheme')

    await expect(page).toHaveScreenshot()
  })

  test('doesnt remove the DEFAULT field name when not a leaf even if one of its leaves has a DEFAULT field name', async ({
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

    await root.item.overwriteClassTo('bg-primary-DEFAULT-500')

    await expect(page).toHaveScreenshot()

    await root.addClass('darkTheme')

    await expect(page).toHaveScreenshot()
  })
})

test.describe('fonts', () => {
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
              title: 'Arial'
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
              title: ['Arial']
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
})

test.describe('tailwind config collision', () => {
  // TODO fix this test's snapshots
  test('overwrites tailwind config on collision', async ({
    page,
    testRepos
  }) => {
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
})

test.describe('merging config', () => {
  test('supports top level callbacks', async ({ page, testRepos }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: () => ({
              primary: 'blue'
            })
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: () => ({
                primary: 'red'
              })
            }
          }
        ]
      })
      .open()

    await expect(page).toHaveScreenshot()

    await root.addClass('darkTheme')

    await expect(page).toHaveScreenshot()
  })

  test('merges top level callback output with static values', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: () => ({
              primary: 'blue'
            })
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

  test('merges objects with primitive values as defaults', async ({
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
})

test.describe('colors', () => {
  test('supports hex', async ({ page, testRepos }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: '#00f'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: '#f00'
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

  test('supports hex with alpha but strips alpha channel', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: '#00f0'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: '#f000'
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

  test('supports rgb', async ({ page, testRepos }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'rgb(0, 0, 255)'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'rgb(255, 0, 0)'
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

  test('supports rgba but strips alpha channel', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'rgb(0, 0, 255, 0.5)'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'rgb(255, 0, 0, 0.5)'
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

  test('supports hsl', async ({ page, testRepos }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'hsla(240, 100%, 50%)'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'hsla(0, 100%, 50%)'
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

  test('supports hsla but strips alpha channel', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'hsla(240, 100%, 50%, 0.5)'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'hsla(0, 100%, 50%, 0.5)'
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
})
