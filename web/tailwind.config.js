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
          50:  '#edfafa',
          100: '#d5f5f6',
          200: '#a8e8ea',
          300: '#71d6da',
          400: '#34bdc3',
          500: '#01969e',
          600: '#01696f',
          700: '#015158',
          800: '#013c42',
          900: '#012830',
          950: '#011820',
        },
        ink: {
          DEFAULT: '#0d1117',
          soft:    '#1c2128',
          muted:   '#57606a',
          faint:   '#d0d7de',
          ghost:   '#f6f8fa',
        },
        surface: {
          DEFAULT: '#fafaf8',
          warm:    '#f5f3ee',
          card:    '#ffffff',
          dark:    '#0d1117',
        },
      },
      fontSize: {
        'display-2xl': ['clamp(3rem,6vw,5.5rem)',   { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-xl':  ['clamp(2.2rem,4vw,3.75rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-lg':  ['clamp(1.75rem,3vw,2.75rem)',{ lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'display-md':  ['clamp(1.4rem,2.5vw,2rem)',  { lineHeight: '1.2',  letterSpacing: '-0.015em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-brand': '0 0 40px -8px rgba(1,150,158,0.35)',
        'glow-sm':    '0 0 20px -4px rgba(1,150,158,0.2)',
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.1)',
        'float':      '0 20px 60px -12px rgba(1,105,111,0.25)',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':    'fadeIn 0.5s ease both',
        'float':      'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
        'pulse-brand':'pulseBrand 2s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        pulseBrand: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(1,150,158,0.4)' },
          '50%':     { boxShadow: '0 0 0 12px rgba(1,150,158,0)' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundImage: {
        'mesh-hero':      'radial-gradient(ellipse at 20% 50%, rgba(1,150,158,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(1,105,111,0.08) 0%, transparent 50%)',
        'mesh-subtle':    'radial-gradient(ellipse at 10% 30%, rgba(1,150,158,0.06) 0%, transparent 55%), radial-gradient(ellipse at 90% 70%, rgba(1,105,111,0.04) 0%, transparent 50%)',
        'gradient-brand': 'linear-gradient(135deg, #01696f 0%, #01969e 100%)',
        'gradient-dark':  'linear-gradient(160deg, #0d1117 0%, #012830 100%)',
        'shimmer-text':   'linear-gradient(90deg, #01696f 0%, #34bdc3 40%, #01696f 80%)',
      },
    },
  },
  plugins: [],
}
