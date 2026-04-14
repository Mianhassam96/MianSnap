import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/MianSnap/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@xenova/transformers']
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-fabric': ['fabric'],
          'vendor-zustand': ['zustand'],
        }
      }
    }
  }
})
