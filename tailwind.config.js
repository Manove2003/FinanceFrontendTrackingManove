/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#121833',
          light: '#1c2444',
        },
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: {
          orange: '#f97316',
          purple: '#7c3aed',
          pink: '#ec4899',
        },
        text: {
          light: '#f8fafc',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}