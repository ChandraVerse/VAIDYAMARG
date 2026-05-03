/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#01696f', hover: '#004f55', active: '#0f3638', light: '#4f98a3', highlight: '#cedcd8' },
        surface:  { DEFAULT: '#f9f8f5', 2: '#fbfbf9', offset: '#f3f0ec' },
        border:   '#d4d1ca',
        divider:  '#dcd9d5',
        text:     { DEFAULT: '#28251d', muted: '#7a7974', faint: '#bab9b4', inverse: '#f9f8f4' },
        success:  { DEFAULT: '#437a22', hover: '#2e5c10', light: '#d4dfcc' },
        warning:  { DEFAULT: '#964219', hover: '#713417', light: '#ddcfc6' },
        error:    { DEFAULT: '#a12c7b', hover: '#7d1e5e', light: '#e0ced7' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm:  '0.375rem',
        md:  '0.5rem',
        lg:  '0.75rem',
        xl:  '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
