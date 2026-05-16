/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Satoshi', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#edf7f7',
          100: '#d0ecec',
          200: '#a3d8d9',
          300: '#70c0c2',
          400: '#3aa6a9',
          500: '#01696f',   // primary
          600: '#015d63',
          700: '#014e54',
          800: '#013d42',
          900: '#012e31',
        },
        ink: {
          DEFAULT: '#1a1a1a',
          muted:   '#6b7280',
          faint:   '#d1d5db',
        },
        surface: {
          DEFAULT: '#f8f7f4',
          2:       '#f2f0ec',
          offset:  '#ebe8e3',
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(at 20% 20%, rgba(1,105,111,0.06) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(1,105,111,0.04) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
