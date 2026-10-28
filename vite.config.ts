/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg', 'cars/placeholder.svg'],
      manifest: {
        name: 'Forza 6 Randomizer',
        short_name: 'F6 Roll',
        description: 'Roll a random car from your Forza Horizon 6 garage.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell, the car catalog (bundled in JS) and every list thumbnail work offline from first load.
        globPatterns: ['**/*.{js,css,html,svg,png}', 'cars/*-160.webp'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            // Hero photos are large; cache each the first time it's shown.
            urlPattern: ({ url }) => url.pathname.startsWith('/cars/') && url.pathname.endsWith('-720.webp'),
            handler: 'CacheFirst',
            options: { cacheName: 'car-heroes', expiration: { maxEntries: 700 } },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
