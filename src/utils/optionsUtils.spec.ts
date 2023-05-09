import {
  defaultThemeName,
  getThemesFromOptions,
  validateOptions
} from './optionsUtils'

describe('themeUtils', () => {
  describe('getThemesFromOptions', () => {
    it('returns an empty default theme if none provided', () => {
      expect(getThemesFromOptions({ themes: [] })).toEqual([
        {
          name: defaultThemeName,
          extend: {}
        }
      ])
    })

    it('adds an empty extend config to the default theme when none provided', () => {
      expect(
        getThemesFromOptions({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          defaultTheme: {}
        })
      ).toEqual([
        {
          name: defaultThemeName,
          extend: {}
        }
      ])
    })

    it('only returns the default theme if no themes provided', () => {
      expect(getThemesFromOptions({ defaultTheme: { extend: {} } })).toEqual([
        {
          name: defaultThemeName,
          extend: {}
        }
      ])
    })

    it('adds an empty extend config for themes without one', () => {
      expect(
        getThemesFromOptions({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          themes: [{ name: 'first' }, { name: 'second' }]
        })
      ).toEqual([
        {
          name: defaultThemeName,
          extend: {}
        },
        {
          name: 'first',
          extend: {}
        },
        {
          name: 'second',
          extend: {}
        }
      ])
    })

    it('throws if the config is invalid', () => {
      expect(() =>
        getThemesFromOptions({
          defaultTheme: { extend: {} },
          themes: [
            { name: 'same', extend: {} },
            { name: 'same', extend: {} }
          ]
        })
      ).toThrow()
    })
  })

  describe('validateOptions', () => {
    it('throws an error if a theme doesnt have a name', () => {
      expect(() =>
        validateOptions({
          defaultTheme: { extend: {} },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          themes: [{ extend: {} }]
        })
      ).toThrow()
    })

    it('throws an error if theme names are not unique', () => {
      expect(() =>
        validateOptions({
          defaultTheme: { extend: {} },
          themes: [
            { name: 'same', extend: {} },
            { name: 'same', extend: {} }
          ]
        })
      ).toThrow()
    })

    it('throws an error if a theme is configured with the default theme name', () => {
      expect(() =>
        validateOptions({
          defaultTheme: { extend: {} },
          themes: [{ name: defaultThemeName, extend: {} }]
        })
      ).toThrow()
    })

    it('throws an error if the default theme has a selectors array', () => {
      expect(() =>
        validateOptions({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          defaultTheme: { selectors: ['default'], extend: {} },
          themes: [{ name: defaultThemeName, extend: {} }]
        })
      ).toThrow()
    })
  })
})
