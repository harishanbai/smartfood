/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#E5C158',
          500: '#D4AF37',
          600: '#B8962E',
        },
        darkBg: '#041d14',
        sidebarBg: 'var(--sidebar-bg)',
        bgMain: 'var(--bg-main)',
        bgCard: 'var(--bg-card)',
        bgElevated: 'var(--bg-elevated)',
        sidebarText: 'var(--sidebar-text)',
        sidebarTextMuted: 'var(--sidebar-text-muted)',
        sidebarHover: 'var(--sidebar-hover)',
        sidebarActive: 'var(--sidebar-active)',
        sidebarBorder: 'var(--sidebar-border)',
        accentOrange: 'var(--accent-orange)',
        accentPurple: 'var(--accent-purple)',
        accentGreen: 'var(--accent-green)',
      },
      textColor: {
        title: 'var(--text-title)',
        body: 'var(--text-body)',
        muted: 'var(--text-muted)',
        sidebarText: 'var(--sidebar-text)',
        sidebarTextMuted: 'var(--sidebar-text-muted)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glowGold: '0 0 20px rgba(212, 175, 55, 0.3)',
        glowGreen: '0 0 20px rgba(34, 197, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
