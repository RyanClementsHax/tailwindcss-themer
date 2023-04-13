import { mock } from 'jest-mock-extended'
import { PluginAPI } from 'tailwindcss/types/config'
import { PluginUtils, TailwindExtension, Theme } from '../config'
import { escape } from './customPropUtils'
import {
  resolveThemeExtensionAsCustomProps,
  resolveThemeExtensionsAsTailwindExtension
} from './themeUtils'

describe('themeUtils', () => {
  let pluginUtils: PluginUtils
  let opacityConfig: { opacityVariable: string; opacityValue: string }

  beforeEach(() => {
    pluginUtils = mock<PluginUtils>({
      theme: jest.fn(x => x)
    })
    opacityConfig = {
      opacityValue: 'opacityValue',
      opacityVariable: '--opacity-variable'
    }
  })

  const resolveOpacityCallbacks = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    themeExtensionValue: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    if (
      typeof themeExtensionValue === 'string' ||
      typeof themeExtensionValue === 'number' ||
      typeof themeExtensionValue === 'undefined' ||
      Array.isArray(themeExtensionValue)
    ) {
      return themeExtensionValue
    }
    if (typeof themeExtensionValue === 'function') {
      return themeExtensionValue(opacityConfig)
    }
    return Object.entries(themeExtensionValue).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: resolveOpacityCallbacks(value)
      }),
      {}
    )
  }

  const resolveCallbacks = (
    extension: TailwindExtension
  ): TailwindExtension => {
    const extensionWithResolvedThemeCbs = Object.entries(extension).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: typeof value === 'function' ? value(pluginUtils) : value
      }),
      {}
    ) as TailwindExtension

    if (extensionWithResolvedThemeCbs.colors) {
      extensionWithResolvedThemeCbs.colors = resolveOpacityCallbacks(
        extensionWithResolvedThemeCbs.colors
      )
    }

    return extensionWithResolvedThemeCbs
  }

  describe('resolveThemeExtensionsAsTailwindExtension', () => {
    it('resolves an empty themes array as an empty config', () => {
      expect(resolveThemeExtensionsAsTailwindExtension([])).toEqual({})
    })

    it('resolves and merges top level values as custom props', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              top1: 'level',
              same: 'prop'
            }
          },
          {
            name: 'second',
            extend: {
              top2: 'level',
              same: 'prop'
            }
          },
          {
            name: 'third',
            extend: {
              top3: 'level',
              same: 'prop'
            }
          }
        ])
      ).toEqual({
        top1: 'var(--top1)',
        top2: 'var(--top2)',
        top3: 'var(--top3)',
        same: 'var(--same)'
      })
    })

    it('resolves and merges nested values as custom props', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              colors: {
                primary: 'first'
              },
              foo: {
                bar: {
                  bing: 'bazz'
                }
              }
            }
          },
          {
            name: 'second',
            extend: {
              colors: {
                secondary: 'second'
              },
              foo: {
                bar: {
                  different: 'bazz'
                },
                thing: 'value1'
              }
            }
          },
          {
            name: 'third',
            extend: {
              colors: {
                secondary: 'third'
              },
              veryDifferent: {
                bar: {
                  different: 'bazz'
                },
                thing: 'value2'
              }
            }
          }
        ])
      ).toEqual({
        colors: {
          primary: 'var(--colors-primary)',
          secondary: 'var(--colors-secondary)'
        },
        foo: {
          bar: {
            bing: 'var(--foo-bar-bing)',
            different: 'var(--foo-bar-different)'
          },
          thing: 'var(--foo-thing)'
        },
        veryDifferent: {
          bar: {
            different: 'var(--veryDifferent-bar-different)'
          },
          thing: 'var(--veryDifferent-thing)'
        }
      })
    })

    it('resolves non overlapping arrays', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              myArray1: [
                {
                  thing: 1
                },
                {
                  thing: 2
                }
              ]
            }
          },
          {
            name: 'second',
            extend: {
              myArray2: [
                {
                  thing: 1
                },
                {
                  thing: 2
                }
              ]
            }
          }
        ])
      ).toEqual({
        myArray1: [
          {
            thing: 'var(--myArray1-0-thing)'
          },
          {
            thing: 'var(--myArray1-1-thing)'
          }
        ],
        myArray2: [
          {
            thing: 'var(--myArray2-0-thing)'
          },
          {
            thing: 'var(--myArray2-1-thing)'
          }
        ]
      })
    })

    it('resolves overlapping arrays', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              myArray: [
                {
                  thing1: 1
                },
                {
                  thing1: 2
                }
              ]
            }
          },
          {
            name: 'second',
            extend: {
              myArray: [
                {
                  thing2: 1
                },
                {
                  thing2: 2
                }
              ]
            }
          }
        ])
      ).toEqual({
        myArray: [
          {
            thing1: 'var(--myArray-0-thing1)',
            thing2: 'var(--myArray-0-thing2)'
          },
          {
            thing1: 'var(--myArray-1-thing1)',
            thing2: 'var(--myArray-1-thing2)'
          }
        ]
      })
    })

    it('resolves arrays with string values', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              fontFamily: {
                serif: ['Times New Roman', 'Times', 'serif']
              }
            }
          },
          {
            name: 'second',
            extend: {
              fontFamily: {
                serif: ['Times New Roman', 'Times', 'serif']
              }
            }
          }
        ])
      ).toEqual({
        fontFamily: {
          serif: [
            'var(--fontFamily-serif-0)',
            'var(--fontFamily-serif-1)',
            'var(--fontFamily-serif-2)'
          ]
        }
      })
    })

    it('drops DEFAULT keys from custom vars when resolving', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              colors: {
                red: {
                  DEFAULT: 'thing'
                }
              },
              foo: {
                DEFAULT: 'thing'
              }
            }
          },
          {
            name: 'second',
            extend: {
              myArray: [
                {
                  DEFAULT: 1
                }
              ]
            }
          }
        ])
      ).toEqual({
        colors: {
          red: {
            DEFAULT: 'var(--colors-red)'
          }
        },
        foo: {
          DEFAULT: 'var(--foo)'
        },
        myArray: [
          {
            DEFAULT: 'var(--myArray-0)'
          }
        ]
      })
    })

    it('merges primitive values as DEFAULT values on that key', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              colors: {
                red: 'primitive'
              },
              foo: {
                bar: {
                  DEFAULT: 'primitive'
                }
              }
            }
          },
          {
            name: 'second',
            extend: {
              colors: {
                red: {
                  DEFAULT: 'non primitive'
                }
              },
              foo: {
                bar: 'primitive'
              }
            }
          }
        ])
      ).toEqual({
        colors: {
          red: {
            DEFAULT: 'var(--colors-red)'
          }
        },
        foo: {
          bar: {
            DEFAULT: 'var(--foo-bar)'
          }
        }
      })
    })

    it('doesnt convert primitives to DEFAULT values if no conflict with other themes', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              colors: {
                red: 'primitive'
              }
            }
          },
          {
            name: 'second',
            extend: {
              foo: {
                bar: {
                  DEFAULT: 'primitive'
                }
              }
            }
          }
        ])
      ).toEqual({
        colors: {
          red: 'var(--colors-red)'
        },
        foo: {
          bar: {
            DEFAULT: 'var(--foo-bar)'
          }
        }
      })
    })

    it('ignores null values', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              colors: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-expect-error
                primary: null
              }
            }
          },
          {
            name: 'second',
            extend: {
              foo: {
                secondary: null
              }
            }
          }
        ])
      ).toEqual({
        colors: {
          primary: null
        },
        foo: {
          secondary: null
        }
      })
    })

    it('ignores undefined values', () => {
      expect(
        resolveThemeExtensionsAsTailwindExtension([
          {
            name: 'first',
            extend: {
              colors: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-expect-error
                secondary: undefined
              }
            }
          },
          {
            name: 'second',
            extend: {
              foo: {
                secondary: undefined
              }
            }
          }
        ])
      ).toEqual({
        colors: {
          secondary: undefined
        },
        foo: {
          secondary: undefined
        }
      })
    })

    describe('callbacks', () => {
      it('resolves non overlapping callbacks', () => {
        expect(
          resolveCallbacks(
            resolveThemeExtensionsAsTailwindExtension([
              {
                name: 'first',
                extend: {
                  colors: ({ theme }) => ({
                    primary: theme('some.key')
                  })
                }
              },
              {
                name: 'second',
                extend: {
                  fontFamily: ({ theme }) => ({
                    foo: theme('some.different.key')
                  })
                }
              }
            ])
          )
        ).toEqual({
          colors: {
            primary: 'var(--colors-primary)'
          },
          fontFamily: {
            foo: 'var(--fontFamily-foo)'
          }
        })
      })

      it('resolves overlapping callbacks', () => {
        expect(
          resolveCallbacks(
            resolveThemeExtensionsAsTailwindExtension([
              {
                name: 'first',
                extend: {
                  colors: ({ theme }) => ({
                    primary: theme('some.key')
                  })
                }
              },
              {
                name: 'second',
                extend: {
                  colors: ({ theme }) => ({
                    secondary: theme('some.different.key')
                  })
                }
              }
            ])
          )
        ).toEqual({
          colors: {
            primary: 'var(--colors-primary)',
            secondary: 'var(--colors-secondary)'
          }
        })
      })

      it('resolves callbacks when they overlap with static values', () => {
        expect(
          resolveCallbacks(
            resolveThemeExtensionsAsTailwindExtension([
              {
                name: 'first',
                extend: {
                  colors: {
                    primary: 'first'
                  }
                }
              },
              {
                name: 'second',
                extend: {
                  colors: ({ theme }) => ({
                    secondary: theme('some.different.key')
                  })
                }
              }
            ])
          )
        ).toEqual({
          colors: {
            primary: 'var(--colors-primary)',
            secondary: 'var(--colors-secondary)'
          }
        })
      })

      it('throws when a callback resolves to a type mismatch with a different theme', () => {
        expect(() =>
          resolveCallbacks(
            resolveThemeExtensionsAsTailwindExtension([
              {
                name: 'first',
                extend: {
                  colors: {
                    primary: 'first'
                  }
                }
              },
              {
                name: 'second',
                extend: {
                  colors: ({ theme }) => theme('some.other.key')
                }
              }
            ])
          )
        ).toThrow()
      })

      it('throws when a callback resolves to a type mismatch with another callback defined in a different theme', () => {
        expect(() =>
          resolveCallbacks(
            resolveThemeExtensionsAsTailwindExtension([
              {
                name: 'first',
                extend: {
                  colors: ({ theme }) => ({
                    primary: theme('first')
                  })
                }
              },
              {
                name: 'second',
                extend: {
                  colors: ({ theme }) => theme('some.other.key')
                }
              }
            ])
          )
        ).toThrow()
      })

      it('throws if it finds a callback not on the top level', () => {
        expect(() =>
          resolveThemeExtensionsAsTailwindExtension([
            {
              name: 'first',
              extend: {
                foo: {
                  bar: {
                    primary: 'orange'
                  }
                }
              }
            },
            {
              name: 'second',
              extend: {
                foo: {
                  bar: ({ theme }: { theme: Theme }) => ({
                    primary: theme('some.key')
                  })
                }
              }
            }
          ])
        ).toThrow()
      })

      it('resolves color properties with opacity', () => {
        expect(
          resolveCallbacks(
            resolveThemeExtensionsAsTailwindExtension([
              {
                name: 'first',
                extend: {
                  colors: {
                    primary: 'orange'
                  }
                }
              },
              {
                name: 'second',
                extend: {
                  colors: {
                    secondary: 'purple'
                  }
                }
              }
            ])
          )
        ).toEqual({
          colors: {
            primary: 'rgba(var(--colors-primary), opacityValue)',
            secondary: 'rgba(var(--colors-secondary), opacityValue)'
          }
        })
      })
    })
  })

  describe('resolveThemeExtensionAsCustomProps', () => {
    let helpers: PluginAPI

    beforeEach(() => {
      helpers = mock<PluginAPI>({
        e: jest.fn(x => `escaped-${x}`),
        theme: jest.fn(x => x) as PluginAPI['theme']
      })
    })

    it('resolves an empty extension as no custom props', () => {
      expect(resolveThemeExtensionAsCustomProps({}, helpers)).toEqual({})
    })

    it('resolves top level props', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            foo: 'thing'
          },
          helpers
        )
      ).toEqual({
        [escape('--foo')]: 'thing'
      })
    })

    it('resolves nested props', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            colors: {
              primary: 'thing'
            },
            foo: {
              bar: {
                bazz: 'value'
              }
            }
          },
          helpers
        )
      ).toEqual({
        [escape('--colors-primary')]: 'thing',
        [escape('--foo-bar-bazz')]: 'value'
      })
    })

    it('resolves arrays', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            foo: {
              bar: [
                {
                  thing: 1
                },
                {
                  thing: 2
                }
              ]
            }
          },
          helpers
        )
      ).toEqual({
        [escape('--foo-bar-0-thing')]: '1',
        [escape('--foo-bar-1-thing')]: '2'
      })
    })

    it('resolves arrays with strings', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            fontFamily: {
              serif: ['Times New Roman', 'Times', 'serif']
            }
          },
          helpers
        )
      ).toEqual({
        [escape('--fontFamily-serif-0')]: 'Times New Roman',
        [escape('--fontFamily-serif-1')]: 'Times',
        [escape('--fontFamily-serif-2')]: 'serif'
      })
    })

    it('resolves colors as rgb', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            colors: {
              primary: '#114611'
            }
          },
          helpers
        )
      ).toEqual({
        [escape('--colors-primary')]: '17, 70, 17'
      })
    })

    it('drops DEFAULT keys from custom vars when resolving', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            colors: {
              red: {
                DEFAULT: 'thing'
              }
            },
            foo: {
              DEFAULT: 'thing'
            },
            myArray: [
              {
                DEFAULT: 1
              }
            ]
          },
          helpers
        )
      ).toEqual({
        [escape('--colors-red')]: 'thing',
        [escape('--foo')]: 'thing',
        [escape('--myArray-0')]: '1'
      })
    })

    it('ignores null values', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            colors: {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-expect-error
              primary: null
            },
            foo: {
              secondary: null
            }
          },
          helpers
        )
      ).toEqual({})
    })

    it('ignores undefined values', () => {
      expect(
        resolveThemeExtensionAsCustomProps(
          {
            colors: {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-expect-error
              primary: undefined
            },
            foo: {
              secondary: undefined
            }
          },
          helpers
        )
      ).toEqual({})
    })

    describe('callbacks', () => {
      it('resolves top level callbacks', () => {
        expect(
          resolveThemeExtensionAsCustomProps(
            {
              colors: ({ theme }) => ({
                primary: theme('some.key')
              })
            },
            helpers
          )
        ).toEqual({
          [escape('--colors-primary')]: 'some.key'
        })
      })

      it('throws if it finds a callback not at the top level', () => {
        expect(() =>
          resolveThemeExtensionAsCustomProps(
            {
              foo: {
                bar: ({ theme }: { theme: Theme }) => ({
                  primary: theme('some.key')
                })
              }
            },
            helpers
          )
        ).toThrow()
      })
    })
  })
})
