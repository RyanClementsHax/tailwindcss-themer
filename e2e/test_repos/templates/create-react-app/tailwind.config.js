// @ts-nocheck
// TODO make whole config an env var
module.exports = {
  ...require(process.env['TAILWIND_CONFIG_PATH']),
  plugins: [
    require('tailwindcss-themer')(require(process.env['THEMER_CONFIG_PATH']))
  ]
}
