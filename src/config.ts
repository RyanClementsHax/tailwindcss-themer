import { ResolvableTo, ThemeConfig } from 'tailwindcss/types/config'

export type PluginUtils = Parameters<Exclude<ResolvableTo<string>, string>>[0]
export type Theme = PluginUtils['theme']
export type ResolutionCallback<T> = (utils: PluginUtils) => T
export type TailwindExtension = Partial<ThemeConfig>
