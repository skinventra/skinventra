import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Serve from root when using NestJS static serving
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: true,
    // Configure HMR for tunnel access
    hmr: {
      clientPort: 443, // Use HTTPS port for tunnel
      protocol: 'wss', // Use secure WebSocket
    },
    // Allow access from Cloudflare Tunnel domain
    allowedHosts: [
      'skinventra.org',
      '.skinventra.org', // Allow all subdomains
    ],
    // Proxy API requests to backend in development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
