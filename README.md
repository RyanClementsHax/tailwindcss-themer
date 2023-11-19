# Tailwindcss Themer <!-- omit in toc -->

An unopinionated, scalable, [tailwindcss](https://tailwindcss.com/) theming solution

[![current version](https://img.shields.io/npm/v/tailwindcss-themer.svg)](https://www.npmjs.com/package/tailwindcss-themer)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow_small.svg)](https:///pr.new/RyanClementsHax/tailwindcss-themer)

## Key Features <!-- omit in toc -->

**🎨 Theme anything**: Anything that extends tailwind's config and can be expressed in css variables is something you can theme with this plugin, even other plugins

**🍨 Unlimited themes**: You can have as many themes as you want! This plugin doesn't care!

**💫 Automatic variants**: Automatically generate variants for all of your themes (i.e. use classes like `my-theme:font-black`) to enable classes only when certain themes active.

**🌑 Trivial dark theme**: Because dark theme is _just another theme_ implementing dark theme is as easy, no special config

**🤖 Automatically handles colors and opacity**: Using [tailwind with css variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables) can get tricky with colors, but this plugin handles all of that for you!

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
  - [Apply variants if you want](#apply-variants-if-you-want)
- [Config documentation](#config-documentation)
- [Migration documentation](#migration-documentation)
- [Enabling your theme](#enabling-your-theme)
  - [Selectors](#selectors)
  - [Media query](#media-query)
  - [Fallback class of theme's name](#fallback-class-of-themes-name)
  - [SSR](#ssr)
  - [Simultaneous themes](#simultaneous-themes)
- [How it works](#how-it-works)
  - [CSS variable generation](#css-variable-generation)
    - [defaultTheme](#defaulttheme)
    - [themes](#themes)
    - [Variants](#variants)
  - [Naming](#naming)
- [Typescript](#typescript)
- [Common problems](#common-problems)
  - [The generated css is missing classes and variables](#the-generated-css-is-missing-classes-and-variables)
  - [This plugin doesn't theme {some config option}](#this-plugin-doesnt-theme-some-config-option)
- [Want to suggest additional features?](#want-to-suggest-additional-features)
- [Didn't find what you were looking for?](#didnt-find-what-you-were-looking-for)

## Examples

- Basic - [Source](./examples/basic/README.md)
- Create React App - [Source](./examples/create-react-app/README.md)
- Create React App with Typescript - [Source](./examples/create-react-app-typescript/README.md)

## Getting Started

### Installation

Install `tailwindcss-themer` using [`npm`](https://www.npmjs.com/package/tailwindcss-themer):

```bash
npm install --save-dev tailwindcss-themer
```

or [`yarn`](https://yarnpkg.com/en/package/tailwindcss-themer):

```bash
yarn add --dev tailwindcss-themer
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

Pass the plugin a config object representing your theme configuration (see [Config](docs/config.md#config) for details)

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
          // name your theme anything that could be a valid css class name
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
<!doctype html>
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

You do this by adding a class of the theme's name to whatever you want themed. See [Enabling your theme](#enabling-your-theme) for more details.

```html
<!-- this example uses pure html for demonstration purposes -->
<!doctype html>
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

This plugin doesn't care _how_ you apply the class. That's up to you. All this plugin cares about is _that the class is applied_.

> There are lots of other ways to enable the theme. To see all options see [Enabling Your Theme](#enabling-your-theme).

### Apply variants if you want

If for some reason you need to apply classes only when certain themes are active and you can't express what you want via the normal theming process shown, you can use the automatically generated variants for each of your themes!

```html
<!-- this class will only activate when the "my-theme" class is active -->
<h1 class="my-theme:font-bold">Hello world!</h1>
```

See [Variants](#variants) for more details.

## Config documentation

- [Config](docs/config.md#config)
- [Theming Colors](docs/themingColors.md#theming-colors)

## Migration documentation

See [migrating.md](./docs/migrating.md) for instructions on how to migrate between major versions.

## Enabling your theme

By default, the config in the `defaultTheme` section of the config will apply (i.e. if no class is applied).

There are three ways to enable your theme.

1. Configure your theme with selectors
2. Configure your theme with a media query
3. If neither selectors nor a media query is given, you can enable your theme by applying a class of the name of the theme you want to enable.

### Selectors

You can provide a `selectors` array on your theme. The theme will be enabled within any element that matches any of those selectors.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: 'red'
      }
    }
  },
  themes: [
    {
      name: 'darkTheme',
      selectors: ['.dark-mode', '[data-theme="dark"]']
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    }
  ]
})
```

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- The default theme config would apply here -->
    <h1 class="text-primary">Hello world!</h1>
  </body>
</html>
```

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="dark-mode">
    <!-- The "darkTheme" config would apply here -->
    <h1 class="text-primary">Hello world!</h1>
  </body>
</html>
```

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body data-theme="dark">
    <!-- The "darkTheme" config would apply here -->
    <h1 class="text-primary">Hello world!</h1>
  </body>
</html>
```

### Media query

You can specify a media query within the `mediaQuery` field on the theme. The theme will be enabled when the given media query evaluates to true.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: 'red'
      }
    }
  },
  themes: [
    {
      name: 'darkTheme',
      mediaQuery: '@media (prefers-color-scheme: dark)',
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    }
  ]
})
```

If both `selectors` and `mediaQuery` is specified at the same time, the `selectors` will take precedence.

### Fallback class of theme's name

If neither a `selectors` array nor a `mediaQuery` given, a default `selectors` array will be added with one value as a class selector of the theme's name.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: 'red'
      }
    }
  },
  themes: [
    {
      name: 'darkTheme',
      // selectors: ['.darkTheme'] // this is implicit given no selectors or mediaQuery given
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    }
  ]
})
```

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- The default theme config would apply here -->
    <h1 class="text-primary">Hello world!</h1>
  </body>
</html>
```

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="darkTheme">
    <!-- The "darkTheme" config would apply here -->
    <h1 class="text-primary">Hello world!</h1>
  </body>
</html>
```

If you don't want this fallback to be generated, set `selectors` to an empty array `[]`.

```js
require('tailwindcss-themer')({
  defaultTheme: {
    extend: {
      colors: {
        primary: 'red'
      }
    }
  },
  themes: [
    {
      name: 'darkTheme',
      selectors: [] // turns off fallback selector
      extend: {
        colors: {
          primary: 'blue'
        }
      }
    }
  ]
})
```

### SSR

In order to prevent a [flash of unstyled content](https://css-tricks.com/flash-of-inaccurate-color-theme-fart/), you need to make sure that the class is applied before the first paint. [Josh Comeau writes a great article about this](https://www.joshwcomeau.com/react/dark-mode/).

### Simultaneous themes

Because this plugin enables themes in part based on existance of classes, it is possible to have multiple themes enabled at the same time. They can be overlapping or not. Its all up to how you apply the classes!

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <div class="theme1">
      <!-- everything in this div will have theme1 styles -->
    </div>
    <div class="theme2">
      <!-- everything in this div will have theme2 styles -->
    </div>
    <div class="theme1 theme2">
      <!-- everything in this div will have both styles applied -->
      <!-- which one has higher specificity is determined by the order of the themes in the "themes" section of the config -->
    </div>
  </body>
</html>
```

If you apply two themes at the same time, the specificity is determined by the order of the themes in the `themes` array of the config. Later defined themes override earlier configs i.e. theme in index 1 takes precedence over theme in index 0.

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
      name: 'theme1',
      extend: {
        // ...
      }
    },
    {
      // this theme will win out over theme1 if an element has both theme1 and theme2 clases on it because it is defined later in the "themes" array
      name: 'theme2',
      extend: {
        // ...
      }
    }
  ]
})
```

## How it works

This plugin works by first creating a custom tailwind extension configured to replace any values you specify with css variables. Then it generates css variables with proper scoping for all of your themes. It also creates variants for each one of your themes as a bonus.

In short it automates [everything you would need to do to do this yourself](https://www.youtube.com/watch?v=MAtaT8BZEAo) plus adds theme variants for you.

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

For example, the above configuration creates a theme extension equivalent to the following hand written version.

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(255 0 0 / <alpha-value>)'
      },
      fontFamily: {
        title: 'var(--font-family-title)'
      }
    }
  }
}
```

It also injects css variables with proper scoping into tailwind's [base layer](https://tailwindcss.com/docs/adding-custom-styles#using-css-and-layer).

```css
/* this is configured by "defaultTheme" */
:root {
  --colors-primary: 255 0 0;
  --font-family-title: Helvetica;
}

/* this is configured by the "my-theme" configuration */
.my-theme {
  --colors-primary: 0 0 255;
  --font-family-title: ui-monospace;
}
```

> Notice how the css variable for the color we specified is broken up into rgb values. We need to do this to support opacity modifiers. See [Opacity](docs/themingColors.md#opacity) for more details.

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
  color: rgb(255 0 0 / var(--tw-text-opacity));
}
```

This plugin adds variants for each one of your themes, should you need them when applying classes.

Taking, again, the above configuration as an example, the `my-theme` variant is generated for `my-theme`. So now you can use classes like `my-theme:font-title` which will enable the classes only when the theme is enabled. The generated css for this example is the following:

```css
.my-theme .my-theme\:font-title,
.my-theme.my-theme\:font-title {
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
  --colors-primary: 255 0 0;
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
  --colors-primary: 255 0 0;
  --font-family-title: Helvetica;
}

.my-theme-2 {
  --colors-primary: 0 0 255;
  --font-family-title: ui-monospace;
}
```

#### Variants

As specified above, variants are generated for every named theme you make, even for the default theme. This is so you can use them as class modifiers to enable certain styles only when that theme is enabled. It works like [hover and focus variants](https://tailwindcss.com/docs/font-family#hover-focus-and-other-states), but activated with the theme. This lets you write classes like `my-theme:rounded-sm` if you need fine grained control to apply some styles when a theme is activated and you can't cleanly express what you want with css variables alone.

> Do note that because tailwind automatically adds the `dark` variant, if you name one of your themes `dark`, the variant this plugin creates for it will conflict with what tailwind automatically creates for you. It is recommended that you name your dark theme something else like `darkTheme` to avoid the conflict. Not all config options work for themes named `dark`.
> \
> \
> See [Themes named dark](docs/config.md#themes-named-dark) for additional details.

The theme variant generated for the default theme is `defaultTheme` (e.g. `defaultTheme:rounded-sm`), but this now requires that instead of omitting any theme class to enable the default theme, you explicitly declare you are using the default theme by adding the class of `defaultTheme` to the place you want themed (no other feature is affected by this, using the default theme variant is the only feature that requires you to add the `defaultTheme` class to use). This is because I haven't been able to create a css selector that excludes all parents with any of the other theme classes. If you can make one, feel free to [open up an issue](https://github.com/RyanClementsHax/tailwindcss-themer/issues).

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body>
    <!-- this won't work because it doesn't have a parent with the "defaultTheme" class -->
    <!-- I would love to make this work, but I haven't come up with a css selector that would work -->
    <h1 class="defaultTheme:font-bold">Hello world!</h1>
  </body>
</html>
```

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="defaultTheme">
    <!-- this now works -->
    <h1 class="defaultTheme:font-bold">Hello world!</h1>
  </body>
</html>
```

```html
<!doctype html>
<html lang="en">
  <head>
    <!-- ... -->
  </head>
  <body class="neon">
    <!-- this is turned off because it doesnt have a parent with a class of "defaultTheme" -->
    <h1 class="defaultTheme:font-bold">Hello world!</h1>
  </body>
</html>
```

### Naming

As you probably could tell from above, the names of the generated css variables are the [kebab-cased](https://www.theserverside.com/definition/Kebab-case) version of the variable's path on the config object.

Naming works the same for all theme configs (default theme and named themes).

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

The above config would generate a css variable of the name `--colors-myBrand-primary-500`. If for some reason, [camelCasing](https://en.wikipedia.org/wiki/Camel_case) is converted to [kebab-casing](https://www.theserverside.com/definition/Kebab-case), make sure you have tailwind `v3.0.12` or later installed as that version fixed that bug.

If you use `DEFAULT` as a leaf value, it is dropped off of the generated css variable name.

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

The above config would generate a css variable of the name `--colors-brand1-DEFAULT-primary`. See [Default key](docs/config.md#default-key) for more details.

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

## Typescript

This plugin comes with types. In order to take advantage of them, make sure the files that use this plugin are type checked. For most use cases, this means making sure your `tailwind.config.js` file is type checked. The easiest way to do this is by adding `//@ts-check` at the top of the file. See the [typescript example](examples/create-react-app-typescript/README.md) for a reference implementation. You can also write your config as a `tailwind.config.ts` file to achieve type checking.

## Common problems

### The generated css is missing classes and variables

Those styles are probably getting purged which happens by default in tailwindcss. Read the [tailwind docs on how to control what gets purged and what doesn't](https://tailwindcss.com/docs/content-configuration) for details on how this works.

If you're expecting the `defaultTheme` to automatically contain tailwind defaults implicitly, read the section on [Overwriting tailwind defaults](docs/config.md#overwriting-tailwind-defaults) for how to do this properly.

### This plugin doesn't theme {some config option}

This plugin can only theme config values that can be expressed as CSS variables. It can't theme config that tunes how tailwind or other plugins generate their css. Check the kind of value you're trying to theme in order to resolve your issue.

For example, this plugin can't theme tailwind's [theme.container.center](https://tailwindcss.com/docs/container#centering-by-default) config value. This is because it configures how tailwind configures its `.container` class, not a particular style within that class.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    container: {
      center: true // 👈🏼 this is the value I'm talking about
    }
  }
}
```

```css
/* when false or undefined */
.container {
  width: 100%;
}

/* when true */
.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
}
```

Instead, the kinds of values this plugin can configure are values like [theme.contaner.padding](https://tailwindcss.com/docs/container#adding-horizontal-padding) because their values that can be expressed as CSS variables and aren't used to configure how tailwind or another plugin generates CSS.

## Want to suggest additional features?

Feel free to [start a discussion](https://github.com/RyanClementsHax/tailwindcss-themer/discussions).

## Didn't find what you were looking for?

Was this documentation insufficient for you?

Was it confusing?

Was it ... dare I say ... inaccurate?

If any of the above describes your feelings of this documentation. Feel free to [open up an issue](https://github.com/RyanClementsHax/tailwindcss-themer/issues).
