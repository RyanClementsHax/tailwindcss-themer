import {
  asCustomProp,
  toCustomPropName,
  toCustomPropValue
} from './customPropUtils'

describe('customPropUtils', () => {
  describe('toCustomPropValue', () => {
    it('if given a number it converts it to a string', () => {
      expect(toCustomPropValue(4)).toBe('4')
    })

    it('converts the value to rgb if it is a color', () => {
      expect(toCustomPropValue('#fff')).toBe('255 255 255')
    })

    it('returns the value if it is not a color', () => {
      expect(toCustomPropValue('not a color')).toBe('not a color')
    })
  })

  describe('toCustomPropName', () => {
    it('concats the values as a kebab cased custom prop', () => {
      expect(toCustomPropName(['this', 'that', '0', 'someOtherThing'])).toBe(
        '--this-that-0-someOtherThing'
      )
    })

    it('removes default leaf path step case sensitively', () => {
      expect(
        toCustomPropName([
          'default',
          'that',
          'DEFAULT',
          'someOtherThing',
          'DEFAULT'
        ])
      ).toBe('--default-that-DEFAULT-someOtherThing')
      expect(
        toCustomPropName([
          'default',
          'that',
          'DEFAULT',
          'someOtherThing',
          'default'
        ])
      ).toBe('--default-that-DEFAULT-someOtherThing-default')
    })

    it('throws when whitespace is encountered', () => {
      expect(() =>
        toCustomPropName(['thing', '   has whitespace   '])
      ).toThrow()
    })
  })

  describe('asCustomProp', () => {
    describe('colors', () => {
      it('when given a number without an alpha, converts to custom prop with <alpha-value> as its alpha value', () => {
        expect(asCustomProp('#fff', ['this', 'that'])).toBe(
          'rgb(var(--this-that) / <alpha-value>)'
        )
      })

      it('when given a number with an alpha, converts to custom prop with the alpha value as its alpha value', () => {
        expect(asCustomProp('rgba(20, 0, 204, 0.72)', ['this', 'that'])).toBe(
          'rgb(var(--this-that) / 0.72)'
        )
      })
    })

    it('converts the value to a custom prop if passed a string that is not a color', () => {
      expect(asCustomProp('not a color', ['this', 'that'])).toBe(
        'var(--this-that)'
      )
    })

    it('converts the value to a custom prop if passed a number', () => {
      expect(asCustomProp(4, ['this', 'that'])).toBe('var(--this-that)')
    })
  })
})
