// @ts-nocheck
console.log(require(process.env['TAILWIND_CONFIG_PATH']))
console.log(require(process.env['THEMER_CONFIG_PATH']))
module.exports = {
  ...require(process.env['TAILWIND_CONFIG_PATH']),
  plugins: [
    require('tailwindcss-themer')(require(process.env['THEMER_CONFIG_PATH']))
  ]
}
