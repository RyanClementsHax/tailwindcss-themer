import plugin from 'tailwindcss/plugin'
import {
  transformAllSelectors,
  updateLastClasses
} from 'tailwindcss/lib/util/pluginUtils'
import prefixSelector from 'tailwindcss/lib/util/prefixSelector'
import { Helpers } from '@/plugin'

import {
  getThemesFromOptions,
  defaultThemeName,
  MultiThemePluginOptions,
  ThemeConfig
} from './utils/optionsUtils'
import {
  resolveThemeExtensionsAsTailwindExtension,
  resolveThemeExtensionAsCustomProps
} from './utils/themeUtils'

const defaultOptions: MultiThemePluginOptions = {
  defaultTheme: { extend: {} },
  themes: []
}

// I copied the way tailwind does dark themeing internally, but modified it to handle any theme name
// It is on the developer to make sure the theme name doesn't conflict with any other variants
/**
 * @param themes the themes to add as variants
 * @param helpers the tailwind plugin helpers
 */
const addThemeVariants = (
  themes: ThemeConfig[],
  { addVariant, config, e }: Helpers
): void => {
  themes.map(({ name }) =>
    addVariant(
      name,
      transformAllSelectors(selector => {
        const variantSelector = updateLastClasses(selector, className => {
          return `${name}${config('separator')}${className}`
        })

        if (variantSelector === selector) {
          return null
        }

        const themeSelector = prefixSelector(config('prefix'), `.${e(name)}`)

        return `${themeSelector} ${variantSelector}`
      })
    )
  )
}
/**
 * @param themes the themes to add as variants
 * @param helpers the tailwind plugin helpers
 */
const addThemeStyles = (themes: ThemeConfig[], helpers: Helpers): void => {
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
 * @throws an {@link Error} if the options are invalid
 * @throws an {@link Error} if any callbacks are found in places not supported by tailwind
 */
// because there aren't any official tailwind plugin types, I'm not sure how to type this return value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MultiThemePlugin = (options: MultiThemePluginOptions) => any

const multiThemePlugin: MultiThemePlugin =
  plugin.withOptions<MultiThemePluginOptions>(
    (options = defaultOptions) =>
      helpers => {
        const themes = getThemesFromOptions(options)
        addThemeVariants(themes, helpers)
        addThemeStyles(themes, helpers)
      },
    (options = defaultOptions) => ({
      theme: {
        extend: resolveThemeExtensionsAsTailwindExtension(
          getThemesFromOptions(options)
        )
      }
    })
  )

export default multiThemePlugin
