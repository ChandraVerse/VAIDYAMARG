/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#01696f', hover: '#004f55', light: '#4f98a3', highlight: '#cedcd8' },
        surface:  { DEFAULT: '#f9f8f5', 2: '#fbfbf9', offset: '#f3f0ec' },
        border:   '#d4d1ca',
        text:     { DEFAULT: '#28251d', muted: '#7a7974', faint: '#bab9b4' },
        success:  { DEFAULT: '#437a22', light: '#d4dfcc' },
        warning:  { DEFAULT: '#964219', light: '#ddcfc6' },
        error:    { DEFAULT: '#a12c7b', light: '#e0ced7' },
        gold:     { DEFAULT: '#d4920a', light: '#f5c842' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
