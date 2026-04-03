import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        union: {
          gold: '#C9A84C',
          'gold-light': '#D4B561',
          'gold-dim': '#7D6730',
          'gold-muted': 'rgba(201,168,76,0.12)',
          black: '#090909',
          surface: '#111111',
          'surface-2': '#171717',
          border: '#1C1C1C',
          'border-2': '#262626',
          text: '#F0F0F0',
          muted: '#5C5C5C',
          subtle: '#2A2A2A',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

export default config
