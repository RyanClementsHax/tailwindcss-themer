/* eslint-disable @typescript-eslint/no-var-requires */
const { isColor, toRgb, withOpacity } = require('./colorUtils')
const kebabCase = require('just-kebab-case')

/**
 * @typedef {import('./colorUtils').withOpacity} withOpacity
 */

/**
 * @param {string | number} value - a custom prop value
 * @return {string} the value converted to a string of its rgb components comma separated if it is a color else it returns the value unaltered
 */
const toCustomPropValue = value => {
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
 * @param {string[]} valuePath - the path to get to the value
 * @return {string} valuePath concatenated as a kebab cased custom property
 */
const toCustomPropName = valuePath => {
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
 * @param {string | number} value - the value of the custom prop to generate
 * @param {string[]} valuePath - the path to get to the value
 * @return {string | ReturnType<typeof withOpacity>} a normal custom prop generated from valuePath if the value is not a color else it is a function that generates custom prop configured with opacity when called with opacity configuration
 */
const asCustomProp = (value, valuePath) => {
  const customPropName = toCustomPropName(valuePath)
  if (isColor(value)) {
    return withOpacity(customPropName)
  } else {
    return `var(${customPropName})`
  }
}

module.exports.toCustomPropValue = toCustomPropValue
module.exports.toCustomPropName = toCustomPropName
module.exports.asCustomProp = asCustomProp
