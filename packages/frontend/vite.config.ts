import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow access from Cloudflare Tunnel domain
    allowedHosts: [
      'skinventra.org',
      '.skinventra.org', // Allow all subdomains
    ],
  },
})
