/* eslint-disable @typescript-eslint/no-explicit-any */

import { TailwindConfig } from './config'
import { MultiThemePluginOptions } from './utils/optionsUtils'

// tailwind doesn't have type definitions packaged with them
// and the ones in @types/tailwind aren't complete as of making this
// so we need to create them on our own until types are added

export interface Helpers {
  theme(key: string): any
  addVariant(variant: string, selector: string): void
  addBase(styles: Record<string, any>): void
  prefix(selector: string): string
  e(selector: string): string
}
export type PluginCb = (helpers: Helpers) => void
export type PluginWithOptionsCb<TOptions> = (options: TOptions) => PluginCb
export type PluginTailwindExtensionWithOptionsCb<TOptions> = (
  options: TOptions
) => TailwindConfig
export interface TailwindPlugin {
  withOptions<TOptions>(
    pluginWithOptionsCb: PluginWithOptionsCb<TOptions>,
    pluginTailwindExtensionWithOptionsCb: PluginTailwindExtensionWithOptionsCb<TOptions>
  ): any
}

/**
 * @throws an {@link Error} if the options are invalid
 * @throws an {@link Error} if any callbacks are found in places not supported by tailwind
 */
// because there aren't any official tailwind plugin types, I'm not sure how to type this return value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MultiThemePlugin = (options: MultiThemePluginOptions) => any
