/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#070B14',
        bgCard: '#111827',
        accentOrange: '#F97316',
        accentPurple: '#A855F7',
        accentGreen: '#22C55E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
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
