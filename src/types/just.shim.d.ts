// these are verbatim what the packages export, but they exported the types as default instead of "export =" (they screwed up)
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require

declare module 'just-unique' {
  function unique(
    arr: string[],
    sorted: boolean | null,
    strings: true
  ): string[]
  function unique<T>(
    arr: T[],
    sorted?: boolean | null,
    strings?: false | null
  ): T[]
  export = unique
}
