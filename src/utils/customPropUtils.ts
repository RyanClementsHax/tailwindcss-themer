import { getAlpha, isColor, toRgb } from './colorUtils'

/**
 * Code copied from the tailwind official codebase
 * @link https://github.com/tailwindlabs/tailwindcss/blob/fbbba6f67f73c3a4f9571649c3fc27006446d8f4/src/lib/regex.js#L70
 */
const REGEX_SPECIAL = /[\\^$.*+?()[\]{}|]/g
const REGEX_HAS_SPECIAL = RegExp(REGEX_SPECIAL.source)
export const escape = (string?: string): string => {
  return string && REGEX_HAS_SPECIAL.test(string)
    ? string.replace(REGEX_SPECIAL, '\\$&')
    : string || ''
}

/**
 * @param value - a custom prop value
 * @return the value converted to a string of its rgb components comma separated if it is a color else it returns the value unaltered
 */
export const toCustomPropValue = (value: string | number): string => {
  if (typeof value === 'number') {
    return value.toString()
  } else if (isColor(value)) {
    return toRgb(value)
  } else {
    return value
  }
}

const whitespaceRegex = /\s/g
/**
 * @param valuePath - the path to get to the value
 * @return valuePath concatenated as a kebab cased custom property
 */
export const toCustomPropName = (valuePath: string[]): string => {
  if (valuePath.some(x => whitespaceRegex.test(x))) {
    throw new Error(
      `Cannot have whitespace in any property in a theme config, found "${valuePath.find(
        x => whitespaceRegex.test(x)
      )}"`
    )
  }
  return escape(
    `--${valuePath
      .filter((step, i) => !(i == valuePath.length - 1 && step == 'DEFAULT'))
      .join('-')}`
  )
}

/**
 * @param value - the value of the custom prop to generate
 * @param valuePath - the path to get to the value
 * @return a normal custom prop generated from valuePath if the value is not a color else it is a function that generates custom prop configured with opacity when called with opacity configuration
 */
export const asCustomProp = (
  value: string | number,
  valuePath: string[]
): string => {
  const customPropName = toCustomPropName(valuePath)
  if (isColor(value)) {
    const alpha = getAlpha(value)
    return `rgb(var(${customPropName}) / ${
      alpha == 1 ? '<alpha-value>' : alpha
    })`
  } else {
    return `var(${customPropName})`
  }
}
