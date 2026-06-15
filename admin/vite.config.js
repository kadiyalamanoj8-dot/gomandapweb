import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  define: {
    'import.meta.env.VITE_OLA_MAPS_API_KEY': JSON.stringify('H0NKbjwH3YFcVwyDZBpxtIlGsdrZsxXPjoX0yutE')
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Gomandap Admin',
        short_name: 'Gomandap Admin',
        description: 'Admin Panel for Gomandap',
        theme_color: '#111111',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 5175
  },
  build: {
    chunkSizeWarningLimit: 2000
  }
})
