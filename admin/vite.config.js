import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    'import.meta.env.VITE_OLA_MAPS_API_KEY': JSON.stringify('H0NKbjwH3YFcVwyDZBpxtIlGsdrZsxXPjoX0yutE')
  },
  plugins: [
    react(),
  ],
  server: {
    port: 5175
  },
  build: {
    chunkSizeWarningLimit: 2000
  }
})
