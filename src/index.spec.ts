import { when } from 'jest-when'
import { Theme } from 'tailwindcss'
import { Helpers } from 'tailwindcss/plugin'
import multiThemePlugin from '.'
import { MultiThemePluginOptions } from './utils/optionsUtils'
import { defaultThemeName } from './utils/optionsUtils'

describe('multiThemePlugin', () => {
  describe('handler', () => {
    let config: MultiThemePluginOptions, helpers: Helpers

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
              }
            }
          }
        ]
      }

      helpers = {
        addBase: jest.fn(),
        addVariant: jest.fn(),
        config: jest.fn(() => ''),
        e: jest.fn(x => x),
        theme: jest.fn(x => x)
      }
      when(helpers.config).calledWith('separator').mockReturnValue('_')
    })

    it('adds variants for each theme', () => {
      multiThemePlugin(config).handler(helpers)

      for (const themeName of [
        defaultThemeName,
        ...(config?.themes?.map(x => x.name) ?? [])
      ]) {
        expect(helpers.addVariant).toHaveBeenCalledWith(
          themeName,
          expect.func()
        )
      }
    })

    it('adds the custom vars for each theme', () => {
      multiThemePlugin(config).handler(helpers)

      expect(helpers.addBase).toHaveBeenCalledWith({
        ':root': {
          '--colors-primary': 'thing'
        }
      })
      for (const theme of config.themes ?? []) {
        expect(helpers.addBase).toHaveBeenCalledWith({
          [`.${theme.name}`]: {
            '--colors-primary': 'another',
            '--colors-secondary': 'something'
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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-expect-error
              colors: {
                primary: (theme: Theme) => theme('thing')
              }
            }
          }
        })
      ).toThrow()
    })
  })
})
