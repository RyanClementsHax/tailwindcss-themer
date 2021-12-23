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
