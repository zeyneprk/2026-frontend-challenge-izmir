import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Avoid browser CORS when calling Jotform from the dev client; set VITE_JOTFORM_API_BASE in .env to override.
      '/jotform-api': {
        target: 'https://api.jotform.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/jotform-api/, ''),
      },
    },
  },
})
