/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Tokens oficiales Clean Orbit */
        co: {
          background: 'var(--co-background)',
          surface: 'var(--co-surface)',
          border: 'var(--co-border)',
          'text-primary': 'var(--co-text-primary)',
          'text-secondary': 'var(--co-text-secondary)',
          primary: 'var(--co-primary)',
          'primary-deep': 'var(--co-primary-deep)',
          cyan: 'var(--co-cyan)',
          'blue-soft': 'var(--co-blue-soft)',
          accent: 'var(--co-accent)',
          'accent-text': 'var(--co-accent-text)',
          nominal: 'var(--co-nominal)',
          warning: 'var(--co-warning)',
          high: 'var(--co-high)',
          critical: 'var(--co-critical)',
          emergency: 'var(--co-emergency)',
          simulated: 'var(--co-simulated)',
        },
        /* Adaptación de la escala heredada a Clean Orbit */
        space: {
          950: '#EAF1FE', // fondo general Clean Orbit
          925: '#EFF5FE',
          900: '#F5F8FE',
          850: '#FFFFFF', // superficie principal
          800: '#C9D9F5', // bordes y separadores
          750: '#DBEAFE', // azul suave
          700: '#C9D9F5', // bordes
          600: '#A8C4F0',
          500: '#47598A', // texto secundario
        },
        telemetry: {
          cyan: '#0EA5E9',   // azul de apoyo / cian Clean Orbit
          ice: '#DBEAFE',    // fondo azul suave
          sky: '#38BDF8',    // cian celeste
          blue: '#1D4ED8',   // azul primario Clean Orbit
          green: '#047857',  // nominal Clean Orbit
          mint: '#10B981',
          amber: '#0369A1',  // advertencia Clean Orbit
          crimson: '#C2410C',// alto Clean Orbit
          red: '#E11D48',    // emergencia Clean Orbit
          violet: '#6D28D9', // simulado Clean Orbit
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
        'hud': '0 1px 2px rgba(11,27,58,.06)',
        'hud-glow': '0 8px 24px rgba(29,78,216,.14)',
        'hud-danger': '0 8px 24px rgba(225,29,72,.14)',
        'hud-warning': '0 8px 24px rgba(3,105,161,.14)',
        'panel': '0 1px 2px rgba(11,27,58,.06)',
        'co-sm': '0 1px 2px rgba(11,27,58,.06)',
        'co-md': '0 8px 24px rgba(29,78,216,.14)',
      },
      backgroundImage: {
        'console-grid': 'linear-gradient(rgba(201, 217, 245, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 217, 245, 0.4) 1px, transparent 1px)',
        'panel-sheen': 'none',
      },
    },
  },
  plugins: [],
}
