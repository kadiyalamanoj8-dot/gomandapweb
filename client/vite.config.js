import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  define: {
    'import.meta.env.VITE_OLA_MAPS_API_KEY': JSON.stringify('H0NKbjwH3YFcVwyDZBpxtIlGsdrZsxXPjoX0yutE')
  },
  plugins: [
    react(),
    viteCompression({ algorithm: 'brotliCompress' }),
    Sitemap({
      hostname: 'https://gomandap.com',
      dynamicRoutes: ['/', '/search', '/profile'],
      exclude: ['/404'],
      generateRobotsTxt: false,
      robots: []
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'maps';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
