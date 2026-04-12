import { create } from 'zustand'

const useStore = create((set) => ({
  // Video state
  videoFile: null,
  videoUrl: null,
  frames: [],
  selectedFrame: null,

  // Canvas state
  fabricCanvas: null,
  exportQuality: '720p',

  // UI state
  activePlatform: 'youtube',
  showSafeZone: false,
  activePanel: 'frames', // frames | packs | score | layers

  // Viral score
  viralScore: null,

  // Actions
  setVideoFile: (file) => set({ videoFile: file, videoUrl: URL.createObjectURL(file) }),
  setFrames: (frames) => set({ frames }),
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),
  setFabricCanvas: (canvas) => set({ fabricCanvas: canvas }),
  setExportQuality: (q) => set({ exportQuality: q }),
  setActivePlatform: (p) => set({ activePlatform: p }),
  toggleSafeZone: () => set((s) => ({ showSafeZone: !s.showSafeZone })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setViralScore: (score) => set({ viralScore: score }),
}))

export default useStore
