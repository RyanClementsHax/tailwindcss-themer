import { expect } from '@playwright/test'
import { test } from '../test_repos/test'
import colors from 'tailwindcss/colors.js'

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
  test('overwrites tailwind config on collision', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withBaseTailwindConfig({
        theme: {
          colors: {
            ...colors,
            primary: 'green'
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

  test('does not override the tailwind extension on collision', async ({
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

  test('supports hex with alpha', async ({ page, testRepos }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: '#0000ff80'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: '#ff000080'
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

  test('supports hex with alpha and an opacity modifier', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: '#0000ff80'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: '#ff000080'
              }
            }
          }
        ]
      })
      .open()

    await root.item.overwriteClassTo('bg-primary/75')

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

  test('supports rgba', async ({ page, testRepos }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'rgba(0, 0, 255, 0.5)'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'rgba(255, 0, 0, 0.5)'
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

  test('supports rgba with an opacity modifier', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'rgba(0, 0, 255, 0.5)'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'rgba(255, 0, 0, 0.5)'
              }
            }
          }
        ]
      })
      .open()

    await root.item.overwriteClassTo('bg-primary/75')

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

  // https://github.com/RyanClementsHax/tailwindcss-themer/issues/74
  test('supports hsla', async ({ page, testRepos }) => {
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

  test('supports hsla with an opacity modifier', async ({
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

    await root.item.overwriteClassTo('bg-primary/75')

    await expect(page).toHaveScreenshot()

    await root.addClass('darkTheme')

    await expect(page).toHaveScreenshot()
  })

  // https://github.com/RyanClementsHax/tailwindcss-themer/issues/77
  test('supports transparent', async ({ page, testRepos }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'blue',
              textColor: 'orange'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'red',
                textColor: 'transparent'
              }
            }
          }
        ]
      })
      .open()

    await root.item.addClass('text-textColor')

    await expect(page).toHaveScreenshot()

    await root.addClass('darkTheme')

    await expect(page).toHaveScreenshot()
  })

  test('supports transparent with opacity modifier', async ({
    page,
    testRepos
  }) => {
    const { root } = await testRepos
      .builder()
      .withThemerConfig({
        defaultTheme: {
          extend: {
            colors: {
              primary: 'blue',
              textColor: 'orange'
            }
          }
        },
        themes: [
          {
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'red',
                textColor: 'transparent'
              }
            }
          }
        ]
      })
      .open()

    await root.item.addClass('text-textColor/50')

    await expect(page).toHaveScreenshot()

    await root.addClass('darkTheme')

    await expect(page).toHaveScreenshot()
  })
})
