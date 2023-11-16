# Config <!-- omit in toc -->

- [Themes named `"dark"`](#themes-named-dark)
- [This plugin's config overwrites what is in the normal tailwind config on collision](#this-plugins-config-overwrites-what-is-in-the-normal-tailwind-config-on-collision)
- [Extend](#extend)
  - [Valid primitives](#valid-primitives)
  - [DEFAULT key](#default-key)
    - [Shorthand](#shorthand)
    - [Gotcha's](#gotchas)
  - [Callbacks](#callbacks)
  - [Config mismatches](#config-mismatches)
  - [Referencing tailwind's default theme](#referencing-tailwinds-default-theme)
  - [Overwriting tailwind defaults](#overwriting-tailwind-defaults)

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      // whatever you want to serve as the defaults
    }
  }
  // ...
})
```

- `defaultTheme`

  - This contains all of the defaults (i.e. what styles are applied when no theme is active)
  - This is fine to leave out if you don't have any defaults you want to apply
  - This is essentially just another theme config, but without a `name` , `selectors`, or a `mediaQuery` since it is applied by default
  - `extend` (**Required**)
    - This takes an object representing a [tailwind extension](https://tailwindcss.com/docs/theme#extending-the-default-theme)
    - Anything you can express in a tailwind extension, you can put here
    - See [extend](#extend) for more details

```js
require('tailwindcss-themer')({
  // ...
  themes: [
    {
      name: 'my-theme-1',
      extend: {
        // whatever styles you want to apply for my-theme-1
      }
    },
    {
      name: 'my-theme-2',
      extend: {
        // whatever styles you want to apply for my-theme-2
      }
    }
  ]
})
```

- `themes`

  - An array of theme configurations
  - theme configuration
    - `name` (**Required**)
      - This uniquely identifies a theme from all other themes
      - This must be a valid css selector
      - The value given here is the name of the class you add to enable the theme
      - See [Themes named dark](#themes-named-dark) for a caveat for themes named `dark`
    - `selectors`
      - The selectors the theme is enabled within
    - `mediaQuery`
      - A media query the theme is enabled during
    - `extend` (**Required**)
      - This takes an object representing a [tailwind extension](https://tailwindcss.com/docs/theme#extending-the-default-theme)
      - Anything you can express in a tailwind extension, you can put here
      - See [extend](#extend) for more details

## Themes named `"dark"`

Because tailwind automatically adds the `dark` variant for users, defining a theme for this plugin with the same name leads to problems. There is no way for a theme named `dark` to be enabled under different conditions than specified in tailwind's config as specified on [tailwind's docs](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually).

Therefore, attempting to use `selectors` or `mediaQuery` for a theme named `dark` won't work at all. To prevent users of this plugin from encountering these silent bugs, this plugin crashes when that happens.

## This plugin's config overwrites what is in the normal tailwind config on collision

Any config specified in this plugin's config, overwrites what is in the normal tailwind config if there is a collision.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // clobbered
        primary: 'blue',
        // not clobbered
        secondary: 'green'
      }
    }
  },
  plugins: [
    require('tailwindcss-themer')({
      defaultTheme: {
        extend: {
          colors: {
            primary: 'red'
          }
        }
      }
      // ...
    })
    // ...
  ]
}
```

`primary: 'blue'` gets clobbered by anything overriting it in the plugin's config. In this case it is when the default theme specifies `primary: 'red'`. This is because the plugin needs to replace `colors.primary` with `var(--colors-primary)` in order to get theming to work.

If you want to use the default tailwind config in your theme configuration, see [Overwriting tailwind defaults](#overwriting-tailwind-defaults) and [Referencing tailwind's default theme](#referencing-tailwinds-default-theme).

## Extend

- This takes an object representing a [tailwind extension](https://tailwindcss.com/docs/theme#extending-the-default-theme)
- Anything you can express in a tailwind extension, you can put here

For example, you could add colors to your theme

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: {
          // here I'm specifying a custom default
          500: 'blue'
        },
        secondary: {
          500: 'red'
        }
      }
    }
  },
  themes: [
    {
      name: 'darkTheme',
      extend: {
        colors: {
          // here I'm overriding a custom default
          secondary: {
            500: 'darkred'
          },
          // here I'm overriding a custom default too
          primary: {
            500: 'darkblue'
          }
        }
      }
    },
    {
      name: 'neon',
      extend: {
        color: {
          secondary: {
            // here I'm overwriting a custom default again
            500: '#90A040' // as red as it gets
          }
          // im not overwriting the custom primary color I made ... I wonder what will happen ??? 🤔🤔🤔
        }
      }
    }
  ]
})
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- this has a color of "blue" since that is what the default config specifies -->
    <h1 class="text-primary-500">This is colored as my primary 500 color</h1>
    <!-- this has a color of "red" since that is what the default default specifies -->
    <p class="text-secondary-500">This is colored as my secondary 500 color</p>
  </body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="darkTheme">
    <!-- this has a color of "darkblue" since that is what the darkTheme config specifies -->
    <h1 class="text-primary-500">This is colored as my primary 500 color</h1>
    <!-- this has a color of "darkred" since that is what the darkTheme config specifies -->
    <p class="text-secondary-500">This is colored as my secondary 500 color</p>
  </body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="neon">
    <!-- this has a color of "blue" since that is what the default config specifies and the neon theme doesn't overwrite it -->
    <h1 class="text-primary-500">This is colored as my primary 500 color</h1>
    <!-- this has a color of "#90A040" since that is what the neon config specifies -->
    <p class="text-secondary-500">This is colored as my secondary 500 color</p>
  </body>
</html>
```

Theming doesn't have to be just for colors. It can be for anything you want, even borders, fonts, spacing, etc. Anything you can substitute for a css variable, you can theme with this plugin.

Here is an example of theming border radius.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      borderRadius: {
        nope: '0',
        tiny: '.1rem',
        DEFAULT: '.125rem',
        woahh: '.25rem'
      }
    }
  },
  themes: [
    {
      name: 'special-border-radius',
      extend: {
        borderRadius: {
          nope: '0',
          tiny: '.125rem',
          DEFAULT: '.25rem',
          woahh: '.5rem'
        }
      }
    },
    {
      name: 'double-border-radius',
      extend: {
        borderRadius: {
          nope: '0',
          tiny: '.25rem',
          DEFAULT: '.5rem',
          woahh: '1rem'
        }
      }
    }
    // ...
  ]
})
```

You would then use the tailwind classes as normal

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- this has a border radius of .25rem since that is the default -->
    <input aria-label="my input" class="border rounded-woahh" />
  </body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="special-border-radius">
    <!-- this has a border radius of .5rem as specified in the special-border-radius config -->
    <input aria-label="my input" class="border rounded-woahh" />
  </body>
</html>
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="double-border-radius">
    <!-- this has a border radius of 1rem as specified in the double-border-radius config -->
    <input aria-label="my input" class="border rounded-woahh" />
  </body>
</html>
```

> Notice the only thing that has to change in order to enable a theme is to apply the theme name as a class to the section of the dom you want to apply it to

You can also specify arrays:

```js
// 👍👍👍
// ok
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      fontFamily: {
        title: ['ui-sans-serif', 'system-ui']
      },
      someConfig: {
        foo: [
          {
            key: 'value'
          }
        ]
      }
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        fontFamily: {
          title: ['ui-monospace', 'system-ui']
        },
        someConfig: {
          foo: [
            {
              key: 'another value'
            }
          ]
        }
      }
    }
  ]
})
```

You aren't limited to theming just tailwind config. You can theme plugins too! If it takes in values in the tailwind `extend` object and the plugin can handle css variable interpolations, you can theme it with this plugin.

```js
// 👍👍👍
// ok
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      somePluginConfig: {
        key: 'value1'
      }
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        somePluginConfig: {
          key: 'value2'
        }
      }
    }
  ],
  require('somePlugin')
})
```

The `somePlugin` plugin will now receive `var(--some-plugin-config-key)` as a value for `somePluginConfig.key`.

### Valid primitives

The "leaves of config" (i.e. the actual values that get replaced with css variables) must be strings or numbers. Other primitives like regexes aren't supported. If you have a use case though, feel free to [open up an issue](https://github.com/RyanClementsHax/tailwindcss-themer/issues).

Anything that can be parsed as a color is handled in a special way. See [Theming Colors](./themingColors.md#theming-colors) for more details.

### DEFAULT key

Tailwind lets you specify default values for certain configuration.

For example, if you had a palette, but wanted to specify a default value for that palette, you could use the `DEFAULT` key.

```js
module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        primary: {
          100: /* ... */,
          200: /* ... */,
          // ...
          800: /* ... */,
          900: /* ... */,
          DEFAULT: /* ... */
        }
      }
    }
  }
}
```

This will let you use classes like `text-primary`, not just `text-primary-100` or `text-primary-700`. In this case `text-primary` would use whatever color value is specified by the `DEFAULT` key.

Just like tailwind, this plugin's configuration supports that too.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: {
          100: /* ... */,
          200: /* ... */,
          // ...
          800: /* ... */,
          900: /* ... */,
          DEFAULT: /* ... */
        }
      }
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          primary: {
            100: /* ... */,
            200: /* ... */,
            // ...
            800: /* ... */,
            900: /* ... */,
            DEFAULT: /* ... */
          }
        }
      }
    }
  ]
})
```

Styles like `text-primary` will now be themed.

`DEFAULT` doesn't have to be set to a string. It could also be set to other values like objects.

```js
require('tailwindcss-themer')({
  // ...
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          primary: {
            DEFAULT: {
              100: '#000111'
              //...
            },
            brand1: {
              // ...
            },
            brand2: {
              // ...
            }
          }
        }
      }
    }
  ]
})
```

This generates classes like `text-primary-100`, `text-primary-brand1-200`, etc.

You can even nest them.

```js
require('tailwindcss-themer')({
  // ...
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          brand1: {
            DEFAULT: {
              primary: {
                DEFAULT: 'red'
              }
            }
          }
        }
      }
    }
  ]
})
```

This will generate classess like `text-brand1-primary`.

#### Shorthand

Because of how `DEFAULT` works, you can specify single default values as strings if that is the only value in the object.

The following two extensions are semantically the same.

```js
require('tailwindcss-themer')({
  // ...
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          primary: {
            DEFAULT: 'red'
          }
        }
      }
    }
    // ...
  ]
})
```

```js
require('tailwindcss-themer')({
  // ...
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          primary: 'red'
        }
      }
    }
    // ...
  ]
})
```

#### Gotcha's

Because of how `DEFAULT` works, it is possible to have naming collisions.

Take the following for an example.

```js
require('tailwindcss-themer')({
  // ...
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          primary: {
            DEFAULT: {
              fontColor: 'red'
            },
            fontColor: {
              DEFAULT: 'red'
            }
          }
        }
      }
    }
    // ...
  ]
})
```

`colors.primary.DEFAULT.fontColor` and `colors.primary.fontColor.DEFAULT` both create classes like `text-primary-fontColor`. It is on the consumer of this plugin to make sure these naming collisions don't happen.

### Callbacks

Tailwind [supports top level callbacks](https://tailwindcss.com/docs/theme#referencing-other-values) for referrencing other values in your config. This plugin supports that too.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      sizes: ({ theme }) => theme('spacing')
    }
  },
  // ...
  themes: [
    {
      name: 'chunky',
      extend: {
        // pretend doubleEveryValue is a function defined elsewhere
        sizes: ({ theme }) => doubleEveryValue(theme('spacing'))
      }
    },
    {
      name: 'wonky',
      extend: {
        // you don't have to use the callback for every definition of your config if used elsewhere
        // this will be themed just fine with whatever the callbacks return
        sizes: {
          1: '20px',
          2: '2px',
          3: '7px',
          4: '50px',
          5: '15px',
          6: '34px'
        }
      }
    }
    // ...
  ]
})
```

Just like tailwind, this plugin doesn't and can't support functions for individual values

```js
// don't do
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      fill: {
        // 🚨🚨🚨🚨🚨
        // can't do this
        gray: ({ theme }) => theme('colors.gray')
      }
    }
  },
  // ...
  themes: [
    {
      name: 'my-theme',
      extend: {
        fill: {
          // 🚨🚨🚨🚨🚨
          // still no
          gray: ({ theme }) => theme('colors.coolGray')
        }
      }
    }
  ]
})
```

Just like tailwind, it is possible to create infinite loops.

```js
// don't do
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: ({ theme }) => ({
        // the lookup of the colors object within the colors object causes an infinite loop
        primary: theme('colors.red')
      })
    }
  }
})
```

In this example, in order for tailwind to resolve the `colors` config, it needs to call your function. Before returning a value, it asks tailwind to grab the `colors.red` config off of the theme. To resolve the `colors` config, it needs to call your function. And there you have it, an infinite loop.

If you need to reference the default theme, [import it](https://tailwindcss.com/docs/theme#referencing-the-default-theme).

If you need to reference other config of yours, break them out into variables.

```js
const DEFAULT_SIZES = {
  1: '1px',
  2: '2px'
  // ...
}

require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      sizes: {
        base: DEFAULT_SIZES
      }
    }
  }
})
```

### Config mismatches

The configs must be "mergable" in order for the underlying css variables to be matched up properly for theming to work.

The following are examples of unmergable config:

```js
🚨🚨🚨
// dont do
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      myConfig: {
        field: 'value'
      }
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        // I use an array for this value here, but an object for the default theme
        // The plugin can't handle this
        myConfig: [
          {
            somethingElse: 'value'
          }
        ]
      }
    }
  ]
})
```

```js
// 🚨🚨🚨
// dont do
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      myConfig: 'value'
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        // I use an array for this value here, but a string for the default theme
        // The plugin can't handle this
        myConfig: [
          {
            field: 'value'
          }
        ]
      }
    }
  ]
})
```

Return values from functions are also checked.

The following is fine:

```js
// 👍👍👍
// ok
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      myConfig: ({ theme }) => ({
        field: 'value'
      })
    }
  },
  themes: [
    {
      name: 'my-theme-1',
      extend: {
        myConfig: {
          somethingElse: 'value'
        }
      }
    },
    {
      name: 'my-theme-2',
      extend: {
        myConfig: ({ theme }) => ({
          another: 'another'
        })
      }
    }
  ]
})
```

The following is not fine:

```js
// 🚨🚨🚨
// dont do
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      myConfig: ({ theme }) => [theme('hello')]
    }
  },
  themes: [
    {
      name: 'my-theme-1',
      extend: {
        // we have an object here
        // but the default config and 'my-theme-2' functions return arrays
        myConfig: {
          thing: 'var'
        }
      }
    },
    {
      name: 'my-theme-2',
      extend: {
        // we return an array from this function
        // it can't be merged with what the my-theme-1 specifies
        myConfig: ({ theme }) => [theme('something')]
      }
    }
  ]
})
```

Supported primitives like numbers and strings are mergable with objects because they're short hand for objects with a `DEFAULT` key (see [Shorthand](#shorthand) for more detail).

The following is fine:

```js
// 👍👍👍
// ok
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      myConfig: {
        field: 'value'
      }
    }
  },
  themes: [
    {
      name: 'my-theme-1',
      extend: {
        myConfig: 'some default value'
        // the above is expanded to
        // {
        //    DEFAULT: 'some default value'
        // }
        // so its mergable with other objects
      }
    },
    {
      name: 'my-theme-2',
      extend: {
        myConfig: ({ theme }) => 'something'
      }
    }
  ]
})
```

### Referencing tailwind's default theme

If you need to reference the default theme, [import it](https://tailwindcss.com/docs/theme#referencing-the-default-theme), then use it in your theme configs.

### Overwriting tailwind defaults

In order for tailwind defaults to be themed, they need to be specified explicitly in `defaultTheme.extend`. Not doing so breaks the default theme.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      // here we've omitted the colors.red config
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          red: {
            // this value works fine when 'my-theme' is enabled
            // but classes like text-red-500 are broken when the default theme is active
            500: '#ff0000'
          }
        }
      }
    }
  ]
})
```

Classes like `text-red-500` works as expected when `my-theme` is enabled, but broken on the default theme since the css variable generated doesn't point to anything (since it isn't specified in the default theme config).

Instead, import the default theme, and reference it in the default theme config.

```js
const defaultTheme = require('tailwindcss/defaultTheme')

require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        red: {
          500: defaultTheme.colors.red[500]
        }
      }
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          red: {
            500: '#ff0000'
          }
        }
      }
    }
  ]
})
```

To be safe you could reference more of the tailwind default theme in the default theme config. This may come at the cost of performance (haven't checked).

```js
const defaultTheme = require('tailwindcss/defaultTheme')

require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: defaultTheme.colors
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          red: {
            // this value works fine when 'my-theme' is enabled
            // but classes like text-red-500 are broken when the default theme is active
            500: '#ff0000'
          }
        }
      }
    }
  ]
})
```

> There's no reason why the plugin can't automatically plug in the tailwind defaults if overwritten elsewhere in the config. I just haven't built in that feature yet. If you want to see it, feel free to [open up an issue](https://github.com/RyanClementsHax/tailwindcss-themer/issues).
