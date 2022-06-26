import { isColor, toRgb, withOpacity } from './colorUtils'

describe('colorUtils', () => {
  describe('toRgb', () => {
    it('converts a hex shorthand', () => {
      expect(toRgb('#fff')).toBe('255, 255, 255')
    })

    it('converts a hex longhand', () => {
      expect(toRgb('#945b38')).toBe('148, 91, 56')
    })

    it('converts a rgb', () => {
      expect(toRgb('rgb(0, 204, 119)')).toBe('0, 204, 119')
    })

    it('converts a rgba', () => {
      expect(toRgb('rgba(20, 0, 204, 0.72)')).toBe('20, 0, 204')
    })

    it('converts a hsl', () => {
      expect(toRgb('hsl(297, 100%, 24%)')).toBe(
        '116.2799999999999, 0, 122.39999999999999'
      )
    })

    it('converts a hsla', () => {
      expect(toRgb('hsla(38, 100%, 75%, 0.78)')).toBe('255, 208.25, 127.5')
    })
  })

  describe('withOpacity', () => {
    const customPropName = '--test'
    const opacityValue = 'value'
    const opacityVariable = 'variable'

    it('configures with opacityValue when defined', () => {
      expect(
        withOpacity(customPropName)({
          opacityValue
        })
      ).toBe(`rgba(var(${customPropName}), ${opacityValue})`)
    })

    it('configures with opacityValue when both defined', () => {
      expect(
        withOpacity(customPropName)({
          opacityVariable,
          opacityValue
        })
      ).toBe(`rgba(var(${customPropName}), ${opacityValue})`)
    })

    it('configures with opacityVariable when only opacityVariable defined', () => {
      expect(
        withOpacity(customPropName)({
          opacityVariable
        })
      ).toBe(`rgba(var(${customPropName}), var(${opacityVariable}, 1))`)
    })

    it('configures with no opacity when neither defined', () => {
      expect(withOpacity(customPropName)({})).toBe(
        `rgb(var(${customPropName}))`
      )
    })
  })

  describe('isColor', () => {
    it('returns true when the value is a valid color', () => {
      expect(isColor('#fff')).toBe(true)
    })

    it('returns false when the value is a number', () => {
      expect(isColor(4)).toBe(false)
    })

    it('returns false when the value is not a valid color', () => {
      expect(isColor('not valid')).toBe(false)
    })
  })
})
