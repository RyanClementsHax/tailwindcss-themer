# Tailwindcss Themer <!-- omit in toc -->

An unopinionated, scalable, [tailwindcss](https://tailwindcss.com/) theming solution

[![current version](https://img.shields.io/npm/v/tailwindcss-themer.svg)](https://www.npmjs.com/package/tailwindcss-themer)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

## Key Features <!-- omit in toc -->

**🎨 Theme anything**: Anything that extends tailwind's config and can be expressed in css variables is something you can theme with this plugin

**🍨 Unlimited themes**: You can have as many themes as you want! This plugin doesn't care!

**🌑 Trivial dark theme**: Because dark theme is _just another theme_ implementing dark theme is as easy as naming the theme you create as "dark", no special config

**🤖 Automatically handles colors and opacity**: Using [tailwind with css variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables) can get [tricky with colors](https://www.youtube.com/watch?v=MAtaT8BZEAo), but this plugin handles all of that for you!

**😅 Easy theme management**: A simple, declarative api that lets you easily create and modify themes

**👋 Familiar api**: The way you declare themes is the exact same way you [extend tailwind](https://tailwindcss.com/docs/theme#extending-the-default-theme) with the exact same features

**💻 Modern**: Powered by css variables under the hood

**🚀 Designed to reduce bundle size**: Instead of duplicating all of your style definitions, the use of css variables lets you declare styles once

## Table of Contents <!-- omit in toc -->

- [Examples](#examples)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Add the Plugin](#add-the-plugin)
  - [Configure your themes](#configure-your-themes)
  - [Use the classes like normal](#use-the-classes-like-normal)
  - [Enable your other theme](#enable-your-other-theme)
- [Colors](#colors)
  - [Opacity](#opacity)
  - [Supported color representations](#supported-color-representations)
- [Config](#config)
  - [This plugin's config overwrites what is in the normal tailwind config](#this-plugins-config-overwrites-what-is-in-the-normal-tailwind-config)
  - [Extend](#extend)
    - [DEFAULT key](#default-key)
      - [Shorthand](#shorthand)
      - [Gotcha's](#gotchas)
    - [Callbacks](#callbacks)
    - [Referencing tailwind's default theme](#referencing-tailwinds-default-theme)
    - [Overwriting tailwind defaults](#overwriting-tailwind-defaults)
- [Didn't find what you were looking for?](#didnt-find-what-you-were-looking-for)

## Examples

- Basic - [Source](./examples/basic/README.md)

## Getting Started

### Installation

Install `tailwindcss-themer` using [`yarn`](https://yarnpkg.com/en/package/tailwindcss-themer):

```bash
yarn add --dev tailwindcss-themer
```

Or [`npm`](https://www.npmjs.com/package/tailwindcss-themer):

```bash
npm install --save-dev tailwindcss-themer
```

### Add the Plugin

In your `tailwind.config.js` file, add `tailwindcss-themer` to the `plugins` array

```js
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('tailwindcss-themer')
    // ...
  ]
}
```

### Configure your themes

Pass the plugin a config object representing your theme configuration (see [Config](#config) for details)

```js
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('tailwindcss-themer')({
      defaultTheme: {
        // put the default values of any config you want themed
        // just as if you were to extend tailwind's theme like normal https://tailwindcss.com/docs/theme#extending-the-default-theme
        extend: {
          // colors is used here for demonstration purposes
          colors: {
            primary: 'red'
          }
        }
      },
      themes: [
        {
          // name your theme anything that could be a valid css selector
          // remember what you named your theme because you will use it as a class to enable the theme
          name: 'my-theme',
          // put any overrides your theme has here
          // just as if you were to extend tailwind's theme like normal https://tailwindcss.com/docs/theme#extending-the-default-theme
          extend: {
            colors: {
              primary: 'blue'
            }
          }
        }
      ]
    })
    // ...
  ]
}
```

### Use the classes like normal

```html
<!-- this example uses pure html for demonstration purposes -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- this has "color: 'red'" assigned to it because that's what was specified as the default-->
    <h1 class="text-primary">Hello world!</h1>
  </body>
</html>
```

### Enable your other theme

You do this by adding a class of the theme's name to whatever you want themed

```html
<!-- this example uses pure html for demonstration purposes -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <!-- everything within this tag now has the "my-theme" config applied to it -->
  <body class="my-theme">
    <!-- this has "color: 'blue'" assigned to it because that's what was specified in the "my-theme" config -->
    <h1 class="text-primary">Hello world!</h1>
  </body>
</html>
```

## Colors

The way color values are handled is particular since colors need to work with opacity modifiers like `bg-primary/75`. See [Opacity](#opacity) for details.

Any value that can be parsed as a color will be treated as a color. This holds for any value found anywhere on the theme object.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: '#fff' // parsed as a color
      },
      foo: {
        bar: {
          DEFAULT: {
            bazz: 'rgb(35, 0, 75)' // also parsed as a color
          }
        }
      }
    }
  }
  // ...
})
```

### Opacity

When [theming color values in tailwindcss](https://tailwindcss.com/docs/customizing-colors#using-css-variables), you cannot naively theme them because they depend on opacity custom properties. [This video](https://www.youtube.com/watch?v=MAtaT8BZEAo) goes further into why.

This plugin takes care of all of that complexity for you under the hood! All you have to do is specify the colors themselves.

```js
// all colors automatically are configured to work with opacity
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: '#2233ff',
        secondary: '#999999'
        // etc...
      }
    }
  }
  // ...
})
```

### Supported color representations

You can use any color representation that can be parsed by [color](https://www.npmjs.com/package/color). Alpha channels are stripped though to support opacity. See [Opacity](#opacity) for details.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: '#f3f', // fine
        secondary: 'rgb(0, 21, 742)', // also fine
        tertiary: 'hsl(250, 23%, 79%)', // yup
        quarternary: 'hsla(132, 67%, 39%, 0.66)' // also ok, but the alpha value will be stripped (thus the value will functionally be hsl(132, 67%, 39%))
        // etc...
      }
    }
  }
  // ...
})
```

## Config

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
  - This is essentially just another theme config, but without a `name` (since its the default)
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
    - `extend` (**Required**)
      - This takes an object representing a [tailwind extension](https://tailwindcss.com/docs/theme#extending-the-default-theme)
      - Anything you can express in a tailwind extension, you can put here
      - See [extend](#extend) for more details

### This plugin's config overwrites what is in the normal tailwind config

Any config specified in this plugin's config, overwrites what is in the normal tailwind config.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // clobbered
        primary: 'blue'
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

`primary: 'blue'` gets clobbered by anything overriting it in the plugin's config. In this case it is when the default theme specifies `primary: 'red'`.

If you want to use the default tailwind config in your theme configuration, see [Overwriting tailwind defaults](#overwriting-tailwind-defaults) and [Referencing tailwind's default theme](#referencing-tailwinds-default-theme).

### Extend

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
      name: 'dark',
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
  <body class="dark">
    <!-- this has a color of "darkblue" since that is what the dark config specifies -->
    <h1 class="text-primary-500">This is colored as my primary 500 color</h1>
    <!-- this has a color of "darkred" since that is what the dark config specifies -->
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

#### DEFAULT key

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

##### Shorthand

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

##### Gotcha's

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

#### Callbacks

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

#### Referencing tailwind's default theme

If you need to reference the default theme, [import it](https://tailwindcss.com/docs/theme#referencing-the-default-theme), then use it in your theme configs.

#### Overwriting tailwind defaults

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

## Didn't find what you were looking for?

Was this documentation insufficient for you?

Was it confusing?

Was it ... dare I say ... inaccurate?

If any of the above describes your feelings of this documentation. Feel free to [open up an issue](https://github.com/RyanClementsHax/tailwindcss-themer/issues).
