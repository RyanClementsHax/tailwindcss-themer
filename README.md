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

**🤖 Automatically handles colors and opacity**: Using tailwind with css variables can get [tricky with colors](https://www.youtube.com/watch?v=MAtaT8BZEAo), but this plugin handles all of that for you!

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
- [Config](#config)
  - [Extend](#extend)

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
        }
      }
    }
  },
  themes: [
    {
      name: 'dark',
      extend: {
        colors: {
          // here I'm overriding a tailwind default
          red: {
            500: 'darkred'
          },
          // here I'm overriding a custom default
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
          red: {
            // here I'm overwriting a tailwind default again
            500: '#ff0000' // as red as it gets
          }
          // im not overwriting the custom color I made ... I wonder what will happen ??? 🤔🤔🤔
        }
      }
    }
    // ...
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
    <!-- this has a color of "#ef4444" since that is what the tailwind default specifies -->
    <p class="text-red-500">This is colored as my red 500 color</p>
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
    <p class="text-red-500">This is colored as my red 500 color</p>
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
    <!-- this has a color of "#ff0000" since that is what the neon config specifies -->
    <p class="text-red-500">This is colored as my red 500 color</p>
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
