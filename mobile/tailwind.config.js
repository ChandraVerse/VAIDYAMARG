/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:    '#01696f',
        'primary-dark': '#004f55',
        'primary-light': '#4f98a3',
        'primary-highlight': '#cedcd8',
        gold:       '#d4920a',
        'gold-light': '#f5c842',
        bg:         '#f7f6f2',
        surface:    '#f9f8f5',
        border:     '#d4d1ca',
        text:       '#28251d',
        'text-muted': '#7a7974',
        'text-faint': '#bab9b4',
        error:      '#a12c7b',
        success:    '#437a22',
        warning:    '#964219',
      },
      fontFamily: {
        sans:    ['System'],
        display: ['System'],
      },
    },
  },
  plugins: [],
};
