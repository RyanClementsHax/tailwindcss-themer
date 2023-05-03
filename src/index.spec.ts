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

    it('adds the custom vars for each theme', () => {
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
