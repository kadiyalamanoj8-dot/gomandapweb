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
          primary: '#D4AF37',
          'primary-hover': '#C9A227',
          secondary: '#FACC15',
          gold: '#D4AF37',
          'gold-light': '#FACC15',
          black: '#111111'
        }
      }
    },
  },
  plugins: [],
}
