# Theming Colors <!-- omit in toc -->

- [Opacity](#opacity)
- [Supported color representations](#supported-color-representations)

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
          bazz: 'rgb(35, 0, 75)' // also parsed as a color
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

## Opacity

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

## Supported color representations

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

> If you want to see colors with alpha channels supported, hop on [this discussion](https://github.com/RyanClementsHax/tailwindcss-themer/discussions/95)!
