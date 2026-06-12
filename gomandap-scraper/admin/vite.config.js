import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: { 
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['olamaps-web-sdk', 'react-window', 'react-virtualized-auto-sizer'],
  },
  define: {
    'process.env': {},
    'import.meta.env.VITE_OLA_MAPS_API_KEY': JSON.stringify('H0NKbjwH3YFcVwyDZBpxtIlGsdrZsxXPjoX0yutE'),
  },
  build: {
    chunkSizeWarningLimit: 30000,
  }
})
