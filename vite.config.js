// vite.config.js
import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls in dev to your Express server
    proxy: {
      '/api/active-profile': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
