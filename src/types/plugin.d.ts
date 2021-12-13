/* eslint-disable @typescript-eslint/no-explicit-any */

import { TailwindConfig } from './config'

// tailwind doesn't have type definitions so we need to create them on our own until types are added

export type AddVariantCb = (
  modifySelectors: ({
    className,
    selector
  }: {
    className: string
    selector: string
  }) => void,
  separator: string,
  container: any
) => void
export interface Helpers {
  theme(key: string): any
  addVariant(variant: string, cb: AddVariantCb): void
  config(key: string): any
  addBase(styles: Record<string, any>): any
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
