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
          primary: '#e63946',
          secondary: '#f4a261',
          gold: '#d4af37',
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
