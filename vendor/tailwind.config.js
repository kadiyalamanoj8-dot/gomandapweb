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
          black: '#111111',
        }
      },
      boxShadow: {
        '3d': '0 10px 30px -10px rgba(0,0,0,0.1)',
        '3d-hover': '0 20px 40px -10px rgba(0,0,0,0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
