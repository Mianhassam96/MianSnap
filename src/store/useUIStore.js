import { create } from 'zustand'
import { darkTheme, lightTheme } from '../theme/theme'

const useUIStore = create((set, get) => ({
  isDark: false,
  theme: lightTheme,
  activeLeftPanel: 'text',
  activeRightPanel: 'layers',
  showSafeZone: false,
  activePlatform: 'youtube',
  showBottomPanel: true,
  focusMode: false,
  fitMode: 'cover',   // 'cover' | 'contain' — shared between CanvasEditor and BottomPanel

  toggleTheme: () => set((s) => ({
    isDark: !s.isDark,
    theme: s.isDark ? lightTheme : darkTheme,
  })),
  setActiveLeftPanel: (p) => set({ activeLeftPanel: p }),
  setActiveRightPanel: (p) => set({ activeRightPanel: p }),
  toggleSafeZone: () => set((s) => ({ showSafeZone: !s.showSafeZone })),
  setActivePlatform: (p) => set({ activePlatform: p }),
  toggleBottomPanel: () => set((s) => ({ showBottomPanel: !s.showBottomPanel })),
  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  setFitMode: (m) => set({ fitMode: m }),
}))

export default useUIStore
