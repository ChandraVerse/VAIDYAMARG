/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#01696f', hover: '#0c4e54', light: '#cedcd8' },
        success:   '#437a22',
        warning:   '#964219',
        error:     '#a12c7b',
        surface:   '#f9f8f5',
        muted:     '#7a7974',
      },
    },
  },
  plugins: [],
};
