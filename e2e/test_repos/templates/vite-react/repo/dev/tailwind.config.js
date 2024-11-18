module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: ['darkTheme'],
  theme: { extend: {} },
  plugins: [
    require('tailwindcss-themer')({
      defaultTheme: { extend: { colors: { primary: 'blue' } } },
      themes: [{ name: 'darkTheme', extend: { colors: { primary: 'red' } } }]
    })
  ]
}
