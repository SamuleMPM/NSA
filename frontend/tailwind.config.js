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
          950: '#060913', // Deep cosmic background
          900: '#0B1220', // Main surface container
          850: '#0F172A', // Elevated cards / telemetry panels
          800: '#1E293B', // Border subtle / input surface
          750: '#27354E', // Active state surface
          700: '#334155', // Hairline borders
          600: '#475569', // Muted text / icons
        },
        telemetry: {
          cyan: '#00E5FF',     // Nominal link / Primary accent
          sky: '#38BDF8',      // Active indicator
          blue: '#3B82F6',     // Auxiliary / Navigation
          green: '#10B981',    // Physiological nominal
          amber: '#F59E0B',    // Warning
          crimson: '#EF4444',  // Critical alert
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'hud': '0 0 0 1px rgba(0, 229, 255, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.6)',
        'hud-glow': '0 0 0 1px rgba(0, 229, 255, 0.4), 0 0 16px -2px rgba(0, 229, 255, 0.2)',
        'hud-danger': '0 0 0 1px rgba(239, 68, 68, 0.5), 0 0 16px -2px rgba(239, 68, 68, 0.25)',
        'hud-warning': '0 0 0 1px rgba(245, 158, 11, 0.5), 0 0 16px -2px rgba(245, 158, 11, 0.2)',
      }
    },
  },
  plugins: [],
}
