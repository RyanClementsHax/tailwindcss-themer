import color from 'color'

/**
 * @param value - a color represented as a string (hex, rgb, rgba, hsl, hsla, etc)
 * @return the color represented as its rgb values with alpha channel stripped
 */
export const toRgb = (value: string): string => {
  const [r, g, b] = color(value).rgb().array()
  return `${r} ${g} ${b}`
}

/**
 * @param value - a color represented as a string (hex, rgb, rgba, hsl, hsla, etc)
 * @return the alpha channel of the color
 */
export const getAlpha = (value: string | number): number => {
  return color(value).alpha()
}

/**
 * @param value - the value to test if it is a valid color string
 * @return whether the value passed in is a valid color string
 */
export const isColor = (value: string | number): boolean => {
  if (typeof value === 'number') {
    return false
  }
  try {
    color(value)
    return true
  } catch {
    return false
  }
}
