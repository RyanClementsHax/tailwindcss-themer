import { mock } from 'jest-mock-extended'
import { PluginAPI } from 'tailwindcss/types/config'
import multiThemePlugin from '.'
import { Theme } from './config'
import { MultiThemePluginOptions, defaultThemeName } from './utils/optionsUtils'

describe('multiThemePlugin', () => {
  describe('handler', () => {
    let config: MultiThemePluginOptions, api: PluginAPI

    beforeEach(() => {
      config = {
        defaultTheme: {
          extend: {
            colors: {
              primary: 'thing'
            }
          }
        },
        themes: [
          {
            name: 'dark',
            extend: {
              colors: {
                primary: 'another',
                secondary: 'something'
              },
              spacing: {
                '0.5': '10px'
              }
            }
          }
        ]
      }

      api = mock<PluginAPI>({
        e: jest.fn(x => `escaped-${x}`),
        theme: jest.fn(x => x) as PluginAPI['theme']
      })
    })

    it('adds variants for each theme', () => {
      multiThemePlugin(config).handler(api)

      for (const themeName of [
        defaultThemeName,
        ...(config?.themes?.map(x => x.name) ?? [])
      ]) {
        expect(api.addVariant).toHaveBeenCalledWith(
          themeName === defaultThemeName ? 'defaultTheme' : themeName,
          `.escaped-${
            themeName === defaultThemeName ? 'defaultTheme' : themeName
          } &`
        )
      }
    })
  })

  describe('styles', () => {
    let api: PluginAPI

    beforeEach(() => {
      api = mock<PluginAPI>({
        e: jest.fn(x => `escaped-${x}`),
        theme: jest.fn(x => x) as PluginAPI['theme']
      })
    })

    it('adds the custom vars for each theme', () => {
      const config: MultiThemePluginOptions = {
        defaultTheme: {
          extend: {
            colors: {
              primary: 'thing'
            }
          }
        },
        themes: [
          {
            name: 'dark',
            extend: {
              colors: {
                primary: 'another',
                secondary: 'something'
              },
              spacing: {
                '0.5': '10px'
              }
            }
          },
          {
            name: 'neon',
            extend: {
              colors: {
                primary: 'another',
                secondary: 'something'
              },
              spacing: {
                '0.5': '10px'
              }
            }
          }
        ]
      }
      multiThemePlugin(config).handler(api)

      expect(api.addBase).toHaveBeenCalledWith({
        ':root': {
          '--colors-primary': 'thing'
        }
      })
      for (const theme of config.themes ?? []) {
        expect(api.addBase).toHaveBeenCalledWith({
          [`.escaped-${theme.name}`]: {
            '--colors-primary': 'another',
            '--colors-secondary': 'something',
            '--spacing-0\\.5': '10px'
          }
        })
      }
    })

    it('adds the custom vars for each theme using selectors if provided', () => {
      const config: MultiThemePluginOptions = {
        defaultTheme: {
          extend: {
            colors: {
              primary: 'thing'
            }
          }
        },
        themes: [
          {
            name: 'dark',
            selectors: ['.dark-mode', '[data-theme="dark"]'],
            extend: {
              colors: {
                primary: 'first'
              }
            }
          },
          {
            name: 'neon',
            selectors: ['.high-contrast', '[data-theme="high-contrast"]'],
            extend: {
              colors: {
                primary: 'second'
              }
            }
          }
        ]
      }

      multiThemePlugin(config).handler(api)

      expect(api.addBase).toHaveBeenCalledWith({
        '.dark-mode, [data-theme="dark"]': {
          '--colors-primary': 'first'
        }
      })
      expect(api.addBase).toHaveBeenCalledWith({
        '.high-contrast, [data-theme="high-contrast"]': {
          '--colors-primary': 'second'
        }
      })
    })

    it('doesnt add a style when no selectors given', () => {
      const config: MultiThemePluginOptions = {
        defaultTheme: {
          extend: {
            colors: {
              primary: 'thing'
            }
          }
        },
        themes: [
          {
            name: 'dark',
            selectors: [],
            extend: {
              colors: {
                primary: 'first'
              }
            }
          }
        ]
      }

      multiThemePlugin(config).handler(api)

      expect(api.addBase).toHaveBeenCalledWith({
        ':root': {
          '--colors-primary': 'thing'
        }
      })
      expect(api.addBase).toHaveBeenCalledTimes(1)
    })

    it('adds a media query if one given', () => {
      const config: MultiThemePluginOptions = {
        defaultTheme: {
          extend: {
            colors: {
              primary: 'thing'
            }
          }
        },
        themes: [
          {
            name: 'dark',
            selectors: ['[data-theme="dark"]'],
            mediaQuery: '@media (prefers-color-scheme: dark)',
            extend: {
              colors: {
                primary: 'first'
              }
            }
          }
        ]
      }

      multiThemePlugin(config).handler(api)

      expect(api.addBase).toHaveBeenCalledWith({
        '@media (prefers-color-scheme: dark)': {
          ':root': {
            '--colors-primary': 'first'
          }
        }
      })
    })

    it('does not a media query if none given', () => {
      const config: MultiThemePluginOptions = {
        defaultTheme: {
          extend: {
            colors: {
              primary: 'thing'
            }
          }
        },
        themes: [
          {
            name: 'dark',
            selectors: ['[data-theme="dark"]'],
            extend: {
              colors: {
                primary: 'first'
              }
            }
          }
        ]
      }

      multiThemePlugin(config).handler(api)

      expect(api.addBase).not.toHaveBeenCalledWith({
        '@media (prefers-color-scheme: dark)': expect.anything()
      })
    })
  })

  describe('config', () => {
    it('extends the theme', () => {
      expect(
        multiThemePlugin({
          defaultTheme: {
            extend: {
              colors: {
                primary: 'thing'
              }
            }
          },
          themes: [
            {
              name: 'dark',
              extend: {
                colors: {
                  primary: 'another',
                  secondary: 'something'
                }
              }
            }
          ]
        }).config
      ).toEqual({
        theme: {
          extend: {
            colors: {
              primary: 'var(--colors-primary)',
              secondary: 'var(--colors-secondary)'
            }
          }
        }
      })
    })

    it('throws when the config is bad', () => {
      expect(() =>
        multiThemePlugin({
          defaultTheme: {
            extend: {
              colors: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-expect-error
                primary: ({ theme }: { theme: Theme }) => theme('thing')
              }
            }
          }
        })
      ).toThrow()
    })
  })
})
