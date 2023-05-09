import plugin from 'tailwindcss/plugin'
import { Config, PluginAPI } from 'tailwindcss/types/config'

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
  { addVariant, e }: PluginAPI
) => {
  for (const { name, selectors: _selectors, mediaQuery } of themes) {
    const variantName = name === defaultThemeName ? 'defaultTheme' : name
    const shouldAddNameBasedVariant = !_selectors && !mediaQuery
    const selectors =
      _selectors ?? (shouldAddNameBasedVariant ? [`.${e(variantName)}`] : [])

    if (selectors.length > 0) {
      addVariant(
        variantName,
        selectors.map(x => `${x} &`)
      )
    }

    if (mediaQuery) {
      addVariant(variantName, mediaQuery)
    }
  }
}

/**
 * @param themes the themes to add as variants
 * @param api the tailwind plugin helpers
 */
const addThemeStyles = (themes: ThemeConfig[], api: PluginAPI): void => {
  const { addBase, e } = api
  for (const { name, selectors: _selectors, extend, mediaQuery } of themes) {
    const selectors =
      _selectors ?? (name === defaultThemeName ? [':root'] : [`.${e(name)}`])
    if (selectors.length > 0) {
      addBase({
        [selectors.join(', ')]: resolveThemeExtensionAsCustomProps(extend, api)
      })
    }
    if (mediaQuery) {
      addBase({
        [mediaQuery]: {
          ':root': resolveThemeExtensionAsCustomProps(extend, api)
        }
      })
    }
  }
}

const multiThemePlugin = plugin.withOptions<MultiThemePluginOptions>(
  (options = defaultOptions) =>
    api => {
      const themes = getThemesFromOptions(options)
      addThemeVariants(themes, api)
      addThemeStyles(themes, api)
    },
  (options = defaultOptions) =>
    ({
      theme: {
        extend: resolveThemeExtensionsAsTailwindExtension(
          getThemesFromOptions(options)
        )
      }
    } as Config)
)

export = multiThemePlugin
