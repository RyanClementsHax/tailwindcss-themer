/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'tailwindcss/plugin' {
  import { TailwindPlugin } from '@/plugin'

  const plugin: TailwindPlugin

  export = plugin
}

declare module 'tailwindcss/lib/util/pluginUtils' {
  import { AddVariantCb } from '@/plugin'

  export function transformAllSelectors(
    cb: (selector: string) => void
  ): AddVariantCb
  export function updateLastClasses(
    selector: string,
    cb: (className: string) => string
  ): string
}

declare module 'tailwindcss/lib/util/prefixSelector' {
  function prefixSelector(prefix: string, selector: string): string
  export default prefixSelector
}
