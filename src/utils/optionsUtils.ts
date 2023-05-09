import unique from 'just-unique'
import { TailwindExtension } from '../config'

export interface ThemeConfig {
  name: string
  selectors?: string[]
  mediaQuery?: string
  extend: TailwindExtension
}

export type DefaultThemeConfig = Omit<ThemeConfig, 'name' | 'selectors'>

export interface MultiThemePluginOptions {
  defaultTheme?: DefaultThemeConfig
  themes?: ThemeConfig[]
}

export const defaultThemeName = '__default'

/**
 * @param options
 * @throws an {@link Error} if the options are invalid
 */
export const validateOptions = ({
  defaultTheme,
  themes = []
}: MultiThemePluginOptions): void => {
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
  if ((defaultTheme as ThemeConfig)?.selectors) {
    throw new Error('The default theme cannot have any selectors')
  }
  const darkTheme = themes.find(x => x.name === 'dark')
  if (darkTheme?.selectors) {
    throw new Error(
      'Tailwind configures "dark" theme automatically which prevents any attempt to use custom selectors. This is a limitation of tailwind, not tailwindcss-themer. Please rename your "dark" theme to something else or remove the "selectors" field from your "dark" theme.'
    )
  }
  if (darkTheme?.mediaQuery || darkTheme?.mediaQuery?.length === 0) {
    throw new Error(
      'Tailwind configures "dark" theme automatically which prevents any attempt to use a custom media query. This is a limitation of tailwind, not tailwindcss-themer. Please rename your "dark" theme to something else or remove the "mediaQuery" field from your "dark" theme.'
    )
  }
}

/**
 * @param options
 * @return the theme options reduced down to an array of themes
 * @throws an {@link Error} if the options are invalid
 */
export const getThemesFromOptions = (
  options: MultiThemePluginOptions
): ThemeConfig[] => {
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
