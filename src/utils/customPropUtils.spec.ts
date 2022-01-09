/* eslint-disable jest/no-conditional-expect */
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
      expect(toCustomPropValue('#fff')).toBe('255, 255, 255')
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

    it('removes default path steps case insensitvely', () => {
      expect(
        toCustomPropName(['default', 'that', 'DEFAULT', 'someOtherThing'])
      ).toBe('--that-someOtherThing')
    })

    it('throws when whitespace is encountered', () => {
      expect(() =>
        toCustomPropName(['thing', '   has whitespace   '])
      ).toThrow()
    })
  })

  describe('asCustomProp', () => {
    it('converts the value to a custom prop with configured with opacity if it is a color', () => {
      const result = asCustomProp('#fff', ['this', 'that'])

      if (typeof result === 'function') {
        expect(result({ opacityValue: 'value' })).toBe(
          'rgba(var(--this-that), value)'
        )
      } else {
        throw new Error('expected to receive a function')
      }
    })

    it('converts the value to a custom prop if passed a string that is not a color', () => {
      const result = asCustomProp('not a color', ['this', 'that'])

      if (typeof result === 'string') {
        expect(result).toBe('var(--this-that)')
      } else {
        throw new Error('expected to receive a string')
      }
    })

    it('converts the value to a custom prop if passed a number', () => {
      const result = asCustomProp(4, ['this', 'that'])

      if (typeof result === 'string') {
        expect(result).toBe('var(--this-that)')
      } else {
        throw new Error('expected to receive a string')
      }
    })
  })
})
