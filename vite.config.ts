import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'], // Varmistaa että ikonit menevät välimuistiin
      manifest: {
        name: 'Corbè Wealth Management',
        short_name: 'Corbè',
        description: 'Quantitative Executive Stock Screener',
        theme_color: '#18181a', // Yökerhon hiilenharmaa (värjää puhelimen yläpalkin!)
        background_color: '#18181a',
        display: 'standalone', // TÄMÄ poistaa selaimen osoiterivit!
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})