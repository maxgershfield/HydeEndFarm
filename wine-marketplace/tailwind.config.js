const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Hyde End Vineyard (aligned with passport.html) */
        'hev-void':    '#0c0608',
        'hev-panel':   'rgba(22,12,14,0.92)',
        'hev-moss':    '#8b3a4a',
        'hev-moss2':   '#c4786c',
        'hev-gold':    '#c9a84c',
        'hev-gold2':   '#e8d4a0',
        'hev-teal':    '#5a9b8c',
        'hev-text':    '#e8f0e4',
        'hev-muted':   'rgba(245,236,228,0.55)',
        'hev-border':  'rgba(196,120,108,0.4)',
        /* Legacy Union tokens — map to Hyde for existing components */
        'union-black':       '#0c0608',
        'union-panel':       'rgba(22,12,14,0.92)',
        'union-gold':        '#c9a84c',
        'union-gold-bright': '#e8d4a0',
        'union-gold-dim':    'rgba(201,168,76,0.15)',
        'union-red':         '#c4786c',
        'union-cyan':        '#5a9b8c',
        'union-green':       '#5a9b8c',
        'union-text':        '#e8f0e4',
        'union-muted':       'rgba(245,236,228,0.55)',
        'union-border':      'rgba(196,120,108,0.4)',
        'union-glow':        'rgba(139,58,74,0.22)',
      },
      fontFamily: {
        display: ['var(--font-libre)', 'Libre Baskerville', 'Georgia', 'serif'],
        mono:    ['var(--font-dm)', 'DM Sans', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-dm)', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 }
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        blink: {
          '0%':   { opacity: 0.2 },
          '20%':  { opacity: 1 },
          '100%': { opacity: 0.2 }
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        fadeIn:   'fadeIn .3s ease-in-out',
        carousel: 'marquee 60s linear infinite',
        blink:    'blink 1.4s both infinite',
        shimmer:  'shimmer 2s linear infinite'
      }
    }
  },
  future: {
    hoverOnlyWhenSupported: true
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography'),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'animation-delay': (value) => ({ 'animation-delay': value })
        },
        { values: theme('transitionDelay') }
      );
    })
  ]
};
