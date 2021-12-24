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
- [How it works](#how-it-works)
  - [CSS variable generation](#css-variable-generation)
    - [defaultTheme](#defaulttheme)
    - [themes](#themes)
    - [Variants](#variants)
  - [Naming](#naming)
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
    - [Config mismatches](#config-mismatches)
    - [Referencing tailwind's default theme](#referencing-tailwinds-default-theme)
    - [Overwriting tailwind defaults](#overwriting-tailwind-defaults)
- [Common problems](#common-problems)
- [The generated css is missing classes and variables](#the-generated-css-is-missing-classes-and-variables)
- [Want to suggest additional features?](#want-to-suggest-additional-features)
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

This plugin doesn't care _how_ you apply the class. That's up to you. All this plugin cares about is that the _class is applied_.

## How it works

This plugin works by generating css variables for all of the configuration you want themed. It also creates variants for each one of your themes.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: 'red'
      },
      fontFamily: {
        title: 'Helvetica'
      }
    }
  },
  themes: [
    {
      name: 'my-theme',
      extend: {
        colors: {
          primary: 'blue'
        },
        fontFamily: {
          title: 'ui-monospace'
        }
      }
    }
  ]
})
```

For example, the above configuration injects the following css into tailwind's [base layer](https://tailwindcss.com/docs/adding-custom-styles#using-css-and-layer).

```css
/* this is configured by "defaultTheme" */
:root {
  --colors-primary: 255, 0, 0;
  --font-family-title: Helvetica;
}

/* this is configured by the "my-theme" configuration */
.my-theme {
  --colors-primary: 0, 0, 255;
  --font-family-title: ui-monospace;
}
```

> Notice how the css variable for the color we specified is broken up into rgb values. We need to do this to support opacity modifiers. See [Opacity](#opacity) for more details.

Now, classes like `text-primary` and `font-title` are generated like the following:

```css
.font-title {
  font-family: var(--font-family-title);
}

.text-primary {
  --tw-text-opacity: 1;
  color: rgba(var(--colors-primary), var(--tw-text-opacity));
}
```

For comparison, this is what those classes looked like before without theming:

```css
.font-title {
  font-family: Helvetica;
}

.text-primary {
  --tw-text-opacity: 1;
  color: rgb(255 0 0 1 / var(--tw-text-opacity));
}
```

This plugin adds variants for each one of your themes, should you need them when applying classes.

Taking, again, the above configuration as an example, the `my-theme` variant is generated for `my-theme`. So now you can use classes like `my-theme:font-title` which will enable the classes only when the theme is enabled. The generated css for this example is the following:

```css
.my-theme .my-theme\:font-title {
  font-family: var(--font-family-title);
}
```

### CSS variable generation

All css variables are injected in tailwind's [base layer](https://tailwindcss.com/docs/adding-custom-styles#using-css-and-layer).

#### defaultTheme

All of the configuration in the `defaultTheme` config generates css variables scoped to `:root`.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: 'red'
      },
      fontFamily: {
        title: 'Helvetica'
      }
    }
  }
  // ...
})
```

For example the above `defaultTheme` config generates the following css variables in the `:root` scope.

```css
/* this is configured by "defaultTheme" */
:root {
  --colors-primary: 255, 0, 0;
  --font-family-title: Helvetica;
}
```

#### themes

For each theme specified in the `themes` section of the config, its config generates css variables scoped to a class of the `name` field.

```js
require('tailwindcss-themer')({
  // ...
  themes: [
    {
      name: 'my-theme-1',
      extend: {
        colors: {
          primary: 'red'
        },
        fontFamily: {
          title: 'Helvetica'
        }
      }
    },
    {
      name: 'my-theme-2',
      extend: {
        colors: {
          primary: 'blue'
        },
        fontFamily: {
          title: 'ui-monospace'
        }
      }
    }
  ]
})
```

For example, the above config in the `themes` section of the config generates the following css:

```css
.my-theme-1 {
  --colors-primary: 255, 0, 0;
  --font-family-title: Helvetica;
}

.my-theme-2 {
  --colors-primary: 0, 0, 255;
  --font-family-title: ui-monospace;
}
```

#### Variants

As specified above, variants are generated for every named theme you make. This is so you can use them as class modifiers to enable certain styles only when that theme is enabled. It works like [hover and focus variants](https://tailwindcss.com/docs/font-family#hover-focus-and-other-states), but activated with the theme. This lets you write classes like `my-theme:rounded-sm` if you need fine grained control to apply some styles when a theme is activated and you can't cleanly express what you want with css variables alone.

Do note that because tailwind automatically adds the `dark` variant, if you name one of your themes `dark`, the variant this plugin creates for it will conflict with what tailwind automatically creates for you. It is recommended that you name your dark theme something else like `darkTheme` to avoid the conflict.

### Naming

As you probably could tell from above, the names of the generated css variables are the [kebab-cased](https://www.theserverside.com/definition/Kebab-case) version of the variable's path on the config object.

Naming works the same for all theme configs (default theme and named themes).

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        brand1: {
          primary: {
            500: 'red'
          }
        }
      }
    }
  }
  // ...
})
```

The above config would generate a css variable of the name `--colors-brand1-primary-500`.

[camelCased](https://en.wikipedia.org/wiki/Camel_case) fields are automatically converted to [kebab-case](https://www.theserverside.com/definition/Kebab-case) even though the classes that are generated remain [camelCased](https://en.wikipedia.org/wiki/Camel_case) and [camelCasing](https://en.wikipedia.org/wiki/Camel_case) is valid in css variable names. This is a limitation in tailwind. I'm not sure why it converts all css variables to [kebab-case](https://www.theserverside.com/definition/Kebab-case), but it does.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        myBrand: {
          primary: {
            500: 'red'
          }
        }
      }
    }
  }
  // ...
})
```

The above config generates the following css variable:

```css
:root {
  // myBrand was converted to my-brand
  --colors-my-brand-primary-500: 255, 0, 0;
}
```

The class that is generated remains unaffected though.

```css
.text-myBrand-primary-500 {
  --tw-text-opacity: 1;
  color: rgba(var(--colors-my-brand-primary-500), var(--tw-text-opacity));
}
```

If you use `DEFAULT` anywhere on a path to a variable, it is dropped off of the generated css variable name.

```js
require('tailwindcss-themer')({
  defaultTheme: {
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
  // ...
})
```

The above config would generate a css variable of the name `--colors-brand1-primary`.

Because of the way `DEFAULT` works, it is possible to have naming collisions. It is on the user of this plugin to ensure that none happen.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        brand1: {
          DEFAULT: {
            primary: {
              DEFAULT: 'red'
            }
          },
          primary: 'blue'
        }
      }
    }
  }
  // ...
})
```

`colors.brand1.DEFAULT.primary.DEFAULT` and `colors.brand1.primary` both would generate a css variable named `--colors-brand1-primary`. See [Default key](#default-key) for more details.

If anywhere in the path, an array is encountered, the index is used in the generated css variable name.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      fontFamily: {
        title: ['ui-sans-serif', 'system-ui']
      }
    }
  }
  // ...
})
```

The example above creates the following css variables:

```css
:root {
  --font-family-title-0: ui-sans-serif;
  --font-family-title-1: system-ui;
}
```

## Colors

The way color values are handled is particular since colors need to work with opacity modifiers like `bg-primary/75`. They are parsed into individual rgb channels with their alpha value dropped. See [Opacity](#opacity) for details.

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

The above generates the following css variables:

```css
:root {
  --colors-primary: 255, 255, 255;
  --foo-bar-bazz: 35, 0, 75;
}
```

> As you can see, the way we need to parse colors into individual channels like this makes it hard to tell what color is being represented. It doesn't work well with tooling like the vscode [Color Highlight](https://marketplace.visualstudio.com/items?itemName=naumovs.color-highlight) extension. This was a motivating factor in creating this plugin. `primary: '#fff' is easier to read and works better with tooling.

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

The above config generates the following css variables:

```css
:root {
  --colors-primary: 34, 51, 255;
  --colors-secondary: 153, 153, 153;
}
```

Now classes like `text-primary` can work with opacity modifiers like `text-primary/75` and classes like `text-opacity-50`

```css
.text-primary {
  --tw-text-opacity: 1;
  color: rgba(var(--colors-primary), var(--tw-text-opacity));
}

.text-secondary {
  --tw-text-opacity: 1;
  color: rgba(var(--colors-secondary), var(--tw-text-opacity));
}

.text-primary\/75 {
  color: rgba(var(--colors-primary), 0.75);
}

.text-opacity-50 {
  --tw-text-opacity: 0.5;
}
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
        quarternary: 'hsla(132, 67%, 39%, 0.66)', // also ok, but the alpha value will be stripped (thus the value will functionally be hsl(132, 67%, 39%))
        quinary: 'blue' // also ok
        // etc...
      }
    }
  }
  // ...
})
```

All of the colors get parsed down to rgb channels.

```css
:root {
  --colors-primary: 255, 51, 255;
  --colors-secondary: 0, 21, 255;
  --colors-tertiary: 193.239, 189.1335, 213.7665;
  --colors-quarternary: 32.81850000000001, 166.0815, 59.4711; /* notice how the alpha value is dropped */
  --colors-quinary: 0, 0, 255;
}
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

`primary: 'blue'` gets clobbered by anything overriting it in the plugin's config. In this case it is when the default theme specifies `primary: 'red'`. This is because the plugin needs to replace `colors.primary` with `var(--colors-primary)` in order to get theming to work.

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

#### Config mismatches

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

## Common problems

## The generated css is missing classes and variables

Those styles are probably getting purged which happens by default in tailwindcss. Read the [tailwind docs on how to control what gets purged and what doesn't](https://tailwindcss.com/docs/content-configuration) for details on how this works.

If you're expecting the `defaultTheme` to automatically contain tailwind defaults implicitly, read the section on [Overwriting tailwind defaults](#overwriting-tailwind-defaults) for how to do this properly.

## Want to suggest additional features?

I'm open to discussion. Feel free to [open up an issue](https://github.com/RyanClementsHax/tailwindcss-themer/issues).

## Didn't find what you were looking for?

Was this documentation insufficient for you?

Was it confusing?

Was it ... dare I say ... inaccurate?

If any of the above describes your feelings of this documentation. Feel free to [open up an issue](https://github.com/RyanClementsHax/tailwindcss-themer/issues).
