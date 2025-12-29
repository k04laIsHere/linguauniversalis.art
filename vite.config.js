import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true
  },
  build: {
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline small assets < 4kb
    rollupOptions: {
      output: {
        // Better chunking for caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
        }
      }
    }
  },
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react']
  }
})
