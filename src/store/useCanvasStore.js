import { create } from 'zustand'
import { prefs } from '../utils/prefs'

const useCanvasStore = create((set) => ({
  fabricCanvas: null,
  exportQuality: prefs.getExportQuality(),
  exportFormat: prefs.getExportFormat(),
  viralScore: null,
  prevScore: null,       // score before last Make Viral
  sessionBest: null,     // best score this session
  canUndo: false,
  canRedo: false,

  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  setExportQuality: (q) => { prefs.setExportQuality(q); set({ exportQuality: q }) },
  setExportFormat:  (f) => { prefs.setExportFormat(f);  set({ exportFormat: f }) },
  setViralScore: (score) => set((s) => ({
    viralScore: score,
    sessionBest: s.sessionBest === null || (score?.score ?? 0) > (s.sessionBest?.score ?? 0) ? score : s.sessionBest,
  })),
  setPrevScore: (score) => set({ prevScore: score }),
  setUndoRedo: (canUndo, canRedo) => set({ canUndo, canRedo }),
}))

export default useCanvasStore
