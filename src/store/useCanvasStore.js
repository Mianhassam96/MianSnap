import { create } from 'zustand'

const useCanvasStore = create((set) => ({
  fabricCanvas: null,
  exportQuality: '720p',
  exportFormat: 'jpg',
  viralScore: null,
  canUndo: false,
  canRedo: false,

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  setExportQuality: (q) => set({ exportQuality: q }),
  setExportFormat: (f) => set({ exportFormat: f }),
  setViralScore: (score) => set({ viralScore: score }),
  setUndoRedo: (canUndo, canRedo) => set({ canUndo, canRedo }),
}))

export default useCanvasStore
