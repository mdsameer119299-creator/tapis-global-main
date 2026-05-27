import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        // Brand reds
        crimson:     '#6B1F1F',
        'crimson-d': '#4A1414',
        'crimson-l': '#8B3030',
        // Gold spectrum
        gold:        '#C09B4A',
        'gold-l':    '#D4B574',
        'gold-p':    '#EDD99A',
        'gold-d':    '#896828',
        // Ivory / cream
        ivory:       '#F8F4EE',
        'ivory-d':   '#EDE3D0',
        'ivory-k':   '#E0D3BC',
        // Ink spectrum
        ink:         '#1A1310',
        'ink-s':     '#3A2A20',
        'ink-m':     '#6B5545',
        'ink-l':     '#9C8878',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['"Outfit"', 'sans-serif'],
        serif:   ['"EB Garamond"', 'serif'],
      },
      letterSpacing: {
        wide:    '0.1em',
        wider:   '0.2em',
        widest:  '0.38em',
        ultra:   '0.42em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        ldfade: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        ldbar: {
          from: { width: '0' },
          to:   { width: '110px' },
        },
        kbzoom: {
          from: { transform: 'scale(1.06)' },
          to:   { transform: 'scale(1)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulse2: {
          '0%,100%': { opacity: '0.35' },
          '50%':     { opacity: '1' },
        },
        floatup: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        ldfade:  'ldfade 0.6s ease forwards',
        ldbar:   'ldbar 0.9s ease 0.6s forwards',
        kbzoom:  'kbzoom 10s ease forwards',
        ticker:  'ticker 28s linear infinite',
        pulse2:  'pulse2 2.2s ease infinite',
        floatup: 'floatup 3s ease infinite',
      },
    },
  },
  plugins: [],
}
export default config
