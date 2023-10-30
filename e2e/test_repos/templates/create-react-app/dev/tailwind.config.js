module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [
    require('tailwindcss-themer')({
      defaultTheme: { extend: { colors: { primary: 'blue' } } },
      themes: [{ name: 'darkTheme', extend: { colors: { primary: 'red' } } }]
    })
  ]
}
