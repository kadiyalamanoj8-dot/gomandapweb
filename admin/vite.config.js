import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // TEMPORARILY DISABLED TO FIX CACHING ISSUES
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     cleanupOutdatedCaches: true,
    //     clientsClaim: true,
    //     skipWaiting: true
    //   },
    //   includeAssets: ['favicon.svg'],
    //   manifest: {
    //     name: 'Gomandap Admin',
    //     short_name: 'Admin',
    //     description: 'Gomandap Admin Dashboard',
    //     theme_color: '#111111',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: 'favicon.svg',
    //         sizes: '192x192 512x512',
    //         type: 'image/svg+xml',
    //         purpose: 'any maskable'
    //       }
    //     ]
    //   }
    // })
  ],
  server: {
    port: 5175
  },
  build: {
    chunkSizeWarningLimit: 2000
  }
})
