/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05080F', // deep space
          925: '#070C16',
          900: '#0A111D', // console base
          850: '#0E1828', // panel
          800: '#132238', // raised
          750: '#1A2C45', // active
          700: '#1B2C44', // hairline
          600: '#2A405C', // strong border
          500: '#3D5A78',
        },
        telemetry: {
          cyan: '#22D3EE',
          ice: '#67E8F9',
          sky: '#38BDF8',
          blue: '#60A5FA',
          green: '#34D399',
          mint: '#6EE7B7',
          amber: '#FBBF24',
          crimson: '#FB7185',
          red: '#F87171',
          violet: '#A78BFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'hud': '0 0 0 1px rgba(34, 211, 238, 0.16), 0 18px 48px -24px rgba(0, 0, 0, 0.85)',
        'hud-glow': '0 0 0 1px rgba(34, 211, 238, 0.34), 0 0 34px -12px rgba(34, 211, 238, 0.34)',
        'hud-danger': '0 0 0 1px rgba(251, 113, 133, 0.36), 0 0 30px -14px rgba(251, 113, 133, 0.45)',
        'hud-warning': '0 0 0 1px rgba(251, 191, 36, 0.32), 0 0 30px -14px rgba(251, 191, 36, 0.35)',
        'panel': '0 22px 60px -36px rgba(0, 0, 0, 0.95)',
      },
      backgroundImage: {
        'console-grid': 'linear-gradient(rgba(96, 165, 250, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.045) 1px, transparent 1px)',
        'panel-sheen': 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 42%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
