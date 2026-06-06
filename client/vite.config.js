import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import Sitemap from 'vite-plugin-sitemap'

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
    //     name: 'Gomandap',
    //     short_name: 'Gomandap',
    //     description: 'Find the perfect venue and vendors for your event.',
    //     theme_color: '#EF4444',
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
    // }),
    viteCompression({ algorithm: 'brotliCompress' }),
    Sitemap({
      hostname: 'https://gomandap.com',
      dynamicRoutes: ['/', '/search', '/profile'],
      exclude: ['/404']
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
