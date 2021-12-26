import plugin from 'tailwindcss/plugin'
import { Helpers, MultiThemePlugin } from './plugin'

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
  { addVariant, e }: Helpers
): void =>
  void themes.map(({ name }) =>
    addVariant(
      name === defaultThemeName ? 'defaultTheme' : name,
      `.${e(name === defaultThemeName ? 'defaultTheme' : name)} &`
    )
  )

/**
 * @param themes the themes to add as variants
 * @param helpers the tailwind plugin helpers
 */
const addThemeStyles = (themes: ThemeConfig[], helpers: Helpers): void => {
  const { addBase, e, prefix } = helpers
  themes.forEach(({ name, extend }) => {
    addBase({
      [name === defaultThemeName ? ':root' : prefix(`.${e(name)}`)]:
        resolveThemeExtensionAsCustomProps(extend, helpers)
    })
  })
}

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

export = multiThemePlugin
