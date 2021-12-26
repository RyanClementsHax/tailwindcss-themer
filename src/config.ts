/* eslint-disable @typescript-eslint/no-explicit-any */

// tailwind doesn't have type definitions so we need to create them on our own until types are added

export type WithExtensions<T, U = any> = T & { [key: string]: T[keyof T] | U }

export type OpacityCb = ({
  opacityVariable,
  opacityValue
}: {
  opacityVariable?: string
  opacityValue?: string
}) => string

export type ExtensionValue =
  | string
  | number
  | { [key: string]: ExtensionValue }
  | ExtensionValue[]

export type Theme = (key: string) => any
export type ThemeCb<T> = ({ theme }: { theme: Theme }) => T
export type WithThemeCb<T> = T | ThemeCb<T>

export type TailwindExtension = WithExtensions<
  Partial<{
    colors?: WithThemeCb<ExtensionValue>
  }>,
  WithThemeCb<ExtensionValue>
>
export type TailwindTheme = WithExtensions<
  Partial<{
    colors: WithThemeCb<ExtensionValue>
    extend: TailwindExtension
  }>,
  WithThemeCb<ExtensionValue>
>
export type TailwindConfig = WithExtensions<{
  theme: TailwindTheme
}>
