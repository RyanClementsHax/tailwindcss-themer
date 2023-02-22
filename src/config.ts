/* eslint-disable @typescript-eslint/no-explicit-any */

import { ResolvableTo, ThemeConfig } from 'tailwindcss/types/config'

export type OpacityCb = ({
  opacityVariable,
  opacityValue
}: {
  opacityVariable?: string
  opacityValue?: string
}) => string
export type PluginUtils = Parameters<Exclude<ResolvableTo<string>, string>>[0]
export type Theme = PluginUtils['theme']
export type ResolutionCallback<T> = (utils: PluginUtils) => T
export type TailwindExtension = Partial<ThemeConfig>
