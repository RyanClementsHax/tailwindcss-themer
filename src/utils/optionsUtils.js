/* eslint-disable @typescript-eslint/no-var-requires */
const unique = require('just-unique')

/**
 * @typedef {import('tailwindcss').TailwindExtension} TailwindExtension
 * @typedef {{name: string, extend: TailwindExtension}} ThemeConfig
 * @typedef {Omit<ThemeConfig, 'name'>} DefaultThemeConfig
 * @typedef {{defaultTheme?: DefaultThemeConfig, themes?: ThemeConfig[]}} MultiThemePluginOptions
 */

const defaultThemeName = '__default'

/**
 * @param {MultiThemePluginOptions} options
 * @throws {Error} if the options are invalid
 */
const validateOptions = ({ themes = [] }) => {
  if (themes.some(x => !x.name)) {
    throw new Error(
      'Every theme in the themes array in the multiThemePlugin options must have a name property set to a unique string'
    )
  }
  const names = themes.map(x => x.name)
  if (unique(names).length != names.length) {
    throw new Error(
      'Every theme in the themes array in the multiThemePlugin options must have a unique name'
    )
  }
  if (themes.some(x => x.name === defaultThemeName)) {
    throw new Error(
      `No theme in the themes array in the multiThemePlugin options cannot have a name of "${defaultThemeName}"`
    )
  }
}

/**
 * @param {MultiThemePluginOptions} options
 * @return {ThemeConfig[]} the theme options reduced down to an array of themes
 * @throws {Error} if the options are invalid
 */
const getThemesFromOptions = options => {
  validateOptions(options)
  const { defaultTheme, themes = [] } = options
  return [
    {
      extend: {},
      ...defaultTheme,
      name: defaultThemeName
    },
    ...themes.map(x => ({ ...{ extend: {} }, ...x }))
  ]
}
module.exports.defaultThemeName = defaultThemeName
module.exports.validateOptions = validateOptions
module.exports.getThemesFromOptions = getThemesFromOptions
