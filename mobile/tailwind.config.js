/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#01696f', dark: '#4f98a3', light: '#cedcd8' },
        surface:   { DEFAULT: '#f9f8f5', dark: '#1c1b19' },
        text:      { DEFAULT: '#28251d', muted: '#7a7974', faint: '#bab9b4' },
        error:     '#a12c7b',
        success:   '#437a22',
        warning:   '#964219',
      },
      fontFamily: {
        sans:    ['GeneralSans-Regular'],
        medium:  ['GeneralSans-Medium'],
        semibold:['GeneralSans-Semibold'],
        bold:    ['GeneralSans-Bold'],
      },
    },
  },
  plugins: [],
};
