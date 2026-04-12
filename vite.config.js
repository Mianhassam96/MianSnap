import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/MianSnap/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@xenova/transformers']
  }
})
