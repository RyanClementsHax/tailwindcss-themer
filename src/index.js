/* eslint-disable @typescript-eslint/no-var-requires */
const plugin = require('tailwindcss/plugin')
const {
  transformAllSelectors,
  updateLastClasses
} = require('tailwindcss/lib/util/pluginUtils')
const prefixSelector = require('tailwindcss/lib/util/prefixSelector').default

const {
  getThemesFromOptions,
  defaultThemeName
} = require('./utils/optionsUtils')
const {
  resolveThemeExtensionsAsTailwindExtension,
  resolveThemeExtensionAsCustomProps
} = require('./utils/themeUtils')

/**
 * @typedef {import('tailwindcss/plugin').Helpers} Helpers
 * @typedef {import('./utils/optionsUtils').MultiThemePluginOptions} MultiThemePluginOptions
 * @typedef {import('./utils/optionsUtils').ThemeConfig} ThemeConfig
 */

/**
 * @type {MultiThemePluginOptions}
 */
const defaultOptions = {
  defaultTheme: { extend: {} },
  themes: []
}

// I copied the way tailwind does dark themeing internally, but modified it to handle any theme name
// It is on the developer to make sure the theme name doesn't conflict with any other variants
/**
 * @param {ThemeConfig[]} themes
 * @param {Helpers} helpers
 * @return {void}
 */
const addThemeVariants = (themes, { addVariant, config, e }) => {
  themes.map(({ name }) =>
    addVariant(
      name,
      transformAllSelectors(selector => {
        let variantSelector = updateLastClasses(selector, className => {
          return `${name}${config('separator')}${className}`
        })

        if (variantSelector === selector) {
          return null
        }

        let themeSelector = prefixSelector(config('prefix'), `.${e(name)}`)

        return `${themeSelector} ${variantSelector}`
      })
    )
  )
}
/**
 * @param {ThemeConfig[]} themes
 * @param {Helpers} helpers
 * @return {void}
 */
const addThemeStyles = (themes, helpers) => {
  const { addBase, e, config } = helpers
  themes.forEach(({ name, extend }) =>
    addBase({
      [name === defaultThemeName
        ? ':root'
        : prefixSelector(config('prefix'), `.${e(name)}`)]:
        resolveThemeExtensionAsCustomProps(extend, helpers)
    })
  )
}

/**
 * @callback MultiThemePlugin
 * @param {MultiThemePluginOptions} options
 * @return {any}
 * @throws {Error} if the options are invalid
 * @throws {Error} if any callbacks are found in places not supported by tailwind
 */

/** @type {MultiThemePlugin} */
const multiThemePlugin = plugin.withOptions(
  (/** @type {MultiThemePluginOptions} */ options = defaultOptions) =>
    helpers => {
      const themes = getThemesFromOptions(options)
      addThemeVariants(themes, helpers)
      addThemeStyles(themes, helpers)
    },
  (/** @type {MultiThemePluginOptions} */ options = defaultOptions) => ({
    theme: {
      extend: resolveThemeExtensionsAsTailwindExtension(
        getThemesFromOptions(options)
      )
    }
  })
)

module.exports = multiThemePlugin
