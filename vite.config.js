import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/MianSnap/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@xenova/transformers', 'fabric']
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: ['fabric'],
      output: {
        globals: {
          fabric: 'fabric'
        }
      }
    }
  }
})
