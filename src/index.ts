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
): void =>
  void themes.map(({ name }) =>
    addVariant(
      name === defaultThemeName ? 'defaultTheme' : name,
      `.${e(name === defaultThemeName ? 'defaultTheme' : name)} &`
    )
  )

/**
 * @param themes the themes to add as variants
 * @param api the tailwind plugin helpers
 */
const addThemeStyles = (themes: ThemeConfig[], api: PluginAPI): void => {
  const { addBase, e } = api
  themes.forEach(({ name, selectors, extend, mediaQuery }) => {
    selectors ??= name === defaultThemeName ? [':root'] : [`.${e(name)}`]
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
  })
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
