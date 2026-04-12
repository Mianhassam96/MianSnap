import { create } from 'zustand'

const useCanvasStore = create((set) => ({
  fabricCanvas: null,
  exportQuality: '720p',
  exportFormat: 'jpg',
  viralScore: null,

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  setExportQuality: (q) => set({ exportQuality: q }),
  setExportFormat: (f) => set({ exportFormat: f }),
  setViralScore: (score) => set({ viralScore: score }),
}))

export default useCanvasStore
