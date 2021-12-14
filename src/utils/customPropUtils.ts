import { isColor, toRgb, withOpacity } from './colorUtils'
import kebabCase from 'just-kebab-case'

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
      `cannot have whitespace in any property in a theme config, found "${valuePath.find(
        x => whitespaceRegex.test(x)
      )}"`
    )
  }
  return `--${valuePath
    .filter(step => step.toLowerCase() !== 'default')
    .map(kebabCase)
    .join('-')}`
}

/**
 * @param value - the value of the custom prop to generate
 * @param valuePath - the path to get to the value
 * @return a normal custom prop generated from valuePath if the value is not a color else it is a function that generates custom prop configured with opacity when called with opacity configuration
 */
export const asCustomProp = (
  value: string | number,
  valuePath: string[]
): string | ReturnType<typeof withOpacity> => {
  const customPropName = toCustomPropName(valuePath)
  if (isColor(value)) {
    return withOpacity(customPropName)
  } else {
    return `var(${customPropName})`
  }
}
