import merge from 'lodash.merge'
import mergeWith from 'lodash.mergewith'
import { MergeWithCustomizer } from 'lodash'
import {
  asCustomProp,
  toCustomPropName,
  toCustomPropValue
} from './customPropUtils'
import { ResolutionCallback, TailwindExtension } from '../config'
import { ThemeConfig } from './optionsUtils'
import { PluginAPI } from 'tailwindcss/types/config'

/**
 * @param themeExtensionValue - the value to convert to custom props
 * @param api - the tailwind plugin helpers
 * @param pathSteps - the path to the value
 * @return the theme extension value resolved as custom props
 * @throws an {@link Error} if the value received is invalid
 */
const resolveThemeExtensionAsCustomPropsRecursionHelper = (
  // because we don't know where we are on the config object and types for it aren't that great
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themeExtensionValue: any,
  api: PluginAPI,
  pathSteps: string[] = []
): { [key: string]: string } =>
  typeof themeExtensionValue === 'undefined' || themeExtensionValue === null
    ? {}
    : Array.isArray(themeExtensionValue)
    ? themeExtensionValue
        .map((x, i) =>
          resolveThemeExtensionAsCustomPropsRecursionHelper(x, api, [
            ...pathSteps,
            i.toString()
          ])
        )
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})
    : typeof themeExtensionValue === 'function'
    ? (() => {
        if (pathSteps.length === 1) {
          return resolveThemeExtensionAsCustomPropsRecursionHelper(
            themeExtensionValue({ theme: api.theme }),
            api,
            pathSteps
          )
        } else {
          throw new Error(
            `callback found on path "${pathSteps.join(
              '.'
            )}" and they are only allowed at the top level`
          )
        }
      })()
    : typeof themeExtensionValue === 'object'
    ? Object.entries(themeExtensionValue).reduce(
        (acc, [key, value]) => ({
          ...acc,
          ...resolveThemeExtensionAsCustomPropsRecursionHelper(value, api, [
            ...pathSteps,
            key
          ])
        }),
        {}
      )
    : typeof themeExtensionValue === 'string' ||
      typeof themeExtensionValue === 'number'
    ? {
        [toCustomPropName(pathSteps)]: toCustomPropValue(themeExtensionValue)
      }
    : (() => {
        throw new Error(
          `unusable value found in config on path "${pathSteps.join('.')}"`
        )
      })()

/**
 * @param themeExtension - the theme extension to convert to custom props
 * @param api - the tailwind plugin helpers
 * @return the theme extension resolved as custom props
 */
export const resolveThemeExtensionAsCustomProps = (
  themeExtension: TailwindExtension,
  api: PluginAPI
): { [key: string]: string } =>
  resolveThemeExtensionAsCustomPropsRecursionHelper(themeExtension, api)

/**
 * @template T
 * @param value - the theme callback
 * @param valuePath - the path to the value
 * @return a function that will resolve the theme extension provided by the callback when given the tailwind theme helper
 */
const toThemeExtensionResolverCallback =
  <T>(
    value: ResolutionCallback<T>,
    valuePath: string[]
  ): ResolutionCallback<T> =>
  theme => {
    const config = value(theme)
    return resolveThemeExtensionsAsTailwindExtensionRecursionHelper(
      config,
      valuePath
    )
  }

/**
 * @param themeExtensionValue - the value to convert to a tailwind extension
 * @param pathSteps - the path to the value
 * @return the resolved tailwind extension from the given theme
 * @throws an {@link Error} if any callbacks are found in places not supported by tailwind
 */
const resolveThemeExtensionsAsTailwindExtensionRecursionHelper = (
  // because we don't know where we are on the config object and types for it aren't that great
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  themeExtensionValue: any,
  pathSteps: string[] = []
  // because we don't know where we are on the config object and types for it aren't that great
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any =>
  typeof themeExtensionValue === 'undefined' || themeExtensionValue === null
    ? themeExtensionValue
    : Array.isArray(themeExtensionValue)
    ? themeExtensionValue.map((x, i) =>
        resolveThemeExtensionsAsTailwindExtensionRecursionHelper(x, [
          ...pathSteps,
          i.toString()
        ])
      )
    : typeof themeExtensionValue === 'function'
    ? (() => {
        if (pathSteps.length === 1) {
          return toThemeExtensionResolverCallback(
            themeExtensionValue,
            pathSteps
          )
        } else {
          throw new Error(
            `callback found on path "${pathSteps.join(
              '.'
            )}" and they are only allowed at the top level`
          )
        }
      })()
    : typeof themeExtensionValue === 'object'
    ? Object.entries(themeExtensionValue).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: resolveThemeExtensionsAsTailwindExtensionRecursionHelper(
            value,
            [...pathSteps, key]
          )
        }),
        {}
      )
    : asCustomProp(themeExtensionValue, pathSteps)

const mergeAndResolveCallbacks: MergeWithCustomizer = (objectVal, srcVal) => {
  if (typeof objectVal === 'undefined') {
    return
  } else if (typeof objectVal === 'function' || typeof srcVal === 'function') {
    return (...params: unknown[]) => {
      const objectValResolved =
        typeof objectVal === 'function' ? objectVal(...params) : objectVal
      const srcValResolved =
        typeof srcVal === 'function' ? srcVal(...params) : srcVal
      if (
        typeof objectValResolved === 'function' ||
        typeof srcValResolved === 'function'
      ) {
        throw new Error('nested callbacks are not supported in tailwind config')
      } else if (typeof objectValResolved !== typeof srcValResolved) {
        throw new Error(
          'all callbacks must return values with types mergable with other themes e.g. a callback that returns a string must be set to a property that other themes dont have objects set to it'
        )
      }
      return merge(objectValResolved, srcValResolved)
    }
  } else if (
    typeof objectVal !== typeof srcVal &&
    (typeof objectVal === 'object' || typeof srcVal === 'object')
  ) {
    const objectValResolved =
      typeof objectVal === 'object' ? objectVal : { DEFAULT: objectVal }
    const srcValResolved =
      typeof srcVal === 'object' ? srcVal : { DEFAULT: srcVal }
    return merge(objectValResolved, srcValResolved)
  } else {
    return undefined
  }
}

/**
 * @param themes - the themes to convert to a tailwind extension
 * @return the resolved tailwind extension from the given theme
 * @throws an {@link Error} if any callbacks are found in places not supported by tailwind
 */
export const resolveThemeExtensionsAsTailwindExtension = (
  themes: ThemeConfig[]
): TailwindExtension => {
  const mergedThemeExtension: TailwindExtension = mergeWith(
    {},
    ...themes.map(x => x.extend),
    mergeAndResolveCallbacks
  )
  return resolveThemeExtensionsAsTailwindExtensionRecursionHelper(
    mergedThemeExtension
  )
}
