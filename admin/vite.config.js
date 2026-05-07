import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/admin/',   // 🔥 REQUIRED
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom'],
          // Routing
          'vendor-router': ['react-router-dom'],
          // Charts
          'vendor-charts': ['recharts'],
          // Excel export
          'vendor-xlsx': ['xlsx'],
          // PDF export
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Misc utilities
          'vendor-utils': ['axios', 'country-state-city', 'react-phone-input-2'],
        },
      },
    },
    // Raise warning threshold slightly since we're now properly chunked
    chunkSizeWarningLimit: 600,
  },
})