import { mock } from 'jest-mock-extended'
import { PluginAPI } from 'tailwindcss/types/config'
import multiThemePlugin from '.'
import { Theme } from './config'
import { MultiThemePluginOptions } from './utils/optionsUtils'

describe('multiThemePlugin', () => {
  let api: PluginAPI

  beforeEach(() => {
    api = mock<PluginAPI>({
      e: jest.fn(x => `escaped-${x}`),
      theme: jest.fn(x => x) as PluginAPI['theme']
    })
  })

  describe('variants', () => {
    it('adds variants for each theme using name as a class if no selectors or mediaQuery provided', () => {
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
            name: 'darkTheme',
            extend: {
              colors: {
                primary: 'dark'
              }
            }
          },
          {
            name: 'light',
            selectors: ['[data-theme="light"]'],
            extend: {
              colors: {
                primary: 'light'
              }
            }
          },
          {
            name: 'neon',
            mediaQuery: '@media (prefers-color-scheme: dark)',
            extend: {
              colors: {
                primary: 'neon'
              }
            }
          },
          {
            name: 'soft',
            selectors: ['[data-theme="light"]'],
            mediaQuery: '@media (prefers-color-scheme: dark)',
            extend: {
              colors: {
                primary: 'soft'
              }
            }
          }
        ]
      }

      multiThemePlugin(config).handler(api)

      expect(api.addVariant).toHaveBeenCalledWith('defaultTheme', [
        '.escaped-defaultTheme &',
        '&.escaped-defaultTheme'
      ])
      expect(api.addVariant).toHaveBeenCalledWith('darkTheme', [
        '.escaped-darkTheme &',
        '&.escaped-darkTheme'
      ])
      expect(api.addVariant).not.toHaveBeenCalledWith('light', [
        '.escaped-light &',
        '&.escaped-light'
      ])
      expect(api.addVariant).not.toHaveBeenCalledWith('neon', [
        '.escaped-neon &',
        '&.escaped-neon'
      ])
      expect(api.addVariant).not.toHaveBeenCalledWith('soft', [
        '.escaped-soft &',
        '&.escaped-soft'
      ])
    })

    it('adds variants for each theme using selectors if present', () => {
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
            name: 'darkTheme',
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
          },
          {
            name: 'soft',
            extend: {
              colors: {
                primary: 'third'
              }
            }
          }
        ]
      }

      multiThemePlugin(config).handler(api)

      expect(api.addVariant).toHaveBeenCalledWith('darkTheme', [
        '.dark-mode &',
        '&.dark-mode',
        '[data-theme="dark"] &',
        '&[data-theme="dark"]'
      ])
      expect(api.addVariant).toHaveBeenCalledWith('neon', [
        '.high-contrast &',
        '&.high-contrast',
        '[data-theme="high-contrast"] &',
        '&[data-theme="high-contrast"]'
      ])
      expect(api.addVariant).toHaveBeenCalledWith('soft', [
        '.escaped-soft &',
        '&.escaped-soft'
      ])
    })

    it('doesnt add any selector based variants when none provided', () => {
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
            name: 'darkTheme',
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
          },
          {
            name: 'soft',
            selectors: [],
            extend: {
              colors: {
                primary: 'third'
              }
            }
          }
        ]
      }

      multiThemePlugin(config).handler(api)

      expect(api.addVariant).not.toHaveBeenCalledWith('soft', expect.anything())
    })

    it('adds a media based variant when one provided', () => {
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
            name: 'darkTheme',
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

      expect(api.addVariant).toHaveBeenCalledWith(
        'darkTheme',
        '@media (prefers-color-scheme: dark)'
      )
    })
  })

  describe('styles', () => {
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
            name: 'darkTheme',
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
            name: 'darkTheme',
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
            name: 'darkTheme',
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
            name: 'darkTheme',
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
