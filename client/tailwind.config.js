/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: 'var(--bg-main)',
        bgCard: 'var(--bg-card)',
        bgElevated: 'var(--bg-elevated)',
        sidebarBg: 'var(--sidebar-bg)',
        sidebarHover: 'var(--sidebar-hover)',
        sidebarActive: 'var(--sidebar-active)',
        sidebarBorder: 'var(--sidebar-border)',
        accentOrange: 'var(--accent-orange)',
        accentPurple: 'var(--accent-purple)',
        accentGreen: 'var(--accent-green)',
      },
      textColor: {
        white: 'var(--text-title)',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: 'var(--text-body)',
          300: 'var(--text-body-muted)',
          400: 'var(--text-muted)',
          500: 'var(--text-muted-dark)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glowOrange: '0 0 20px rgba(249, 115, 22, 0.3)',
        glowPurple: '0 0 20px rgba(168, 85, 247, 0.3)',
        glowGreen: '0 0 20px rgba(34, 197, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
