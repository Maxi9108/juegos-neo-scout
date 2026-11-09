/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neofaro: {
          deep: '#070e1c',      // Dark midnight ocean
          navy: '#0c1b33',      // Primary navy
          surface: '#112240',   // Card surface
          card: '#162b50',      // Card hover/highlight
          cyan: '#00b4d8',      // NeoFaro Cyan / Electric Blue
          sky: '#38bdf8',       // Light cyan
          beam: '#ffc400',      // Lighthouse Golden Beam
          gold: '#f59e0b',      // Accent gold
          amber: '#fbbf24'      // Warm light
        },
        scout: {
          dark: '#0c1b33',
          forest: '#1e3a5f',
          primary: '#0284c7',
          light: '#38bdf8',
          accent: '#ffc400',
          leather: '#78350f'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        heading: ['Fredoka', 'Plus Jakarta Sans', 'sans-serif']
      }
    },
  },
  plugins: [],
}
