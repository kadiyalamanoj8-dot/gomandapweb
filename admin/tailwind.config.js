/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#EF4444',
          secondary: '#F59E0B',
          gold: '#B8860B',
          black: '#111111'
        }
      }
    },
  },
  plugins: [],
}
