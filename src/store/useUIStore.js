import { create } from 'zustand'
import { darkTheme, lightTheme } from '../theme/theme'

const useUIStore = create((set, get) => ({
  isDark: false,
  theme: lightTheme,
  activeLeftPanel: 'text',   // text | shapes | presets | branding
  activeRightPanel: 'layers', // layers | properties
  showSafeZone: false,
  activePlatform: 'youtube',
  showBottomPanel: true,

  toggleTheme: () => set((s) => ({
    isDark: !s.isDark,
    theme: s.isDark ? lightTheme : darkTheme,
  })),
  setActiveLeftPanel: (p) => set({ activeLeftPanel: p }),
  setActiveRightPanel: (p) => set({ activeRightPanel: p }),
  toggleSafeZone: () => set((s) => ({ showSafeZone: !s.showSafeZone })),
  setActivePlatform: (p) => set({ activePlatform: p }),
  toggleBottomPanel: () => set((s) => ({ showBottomPanel: !s.showBottomPanel })),
}))

export default useUIStore
