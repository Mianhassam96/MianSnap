import { create } from 'zustand'
import { prefs } from '../utils/prefs'

const useCanvasStore = create((set) => ({
  fabricCanvas: null,
  exportQuality: prefs.getExportQuality(),
  exportFormat: prefs.getExportFormat(),
  viralScore: null,
  canUndo: false,
  canRedo: false,

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  setExportQuality: (q) => { prefs.setExportQuality(q); set({ exportQuality: q }) },
  setExportFormat:  (f) => { prefs.setExportFormat(f);  set({ exportFormat: f }) },
  setViralScore: (score) => set({ viralScore: score }),
  setUndoRedo: (canUndo, canRedo) => set({ canUndo, canRedo }),
}))

export default useCanvasStore
