import { create } from 'zustand'

const useLayerStore = create((set) => ({
  layers: [],        // [{ id, name, type, visible, locked }]
  selectedId: null,

  setLayers: (layers) => set({ layers }),
  setSelectedId: (id) => set({ selectedId: id }),

  toggleVisibility: (id) => set((s) => ({
    layers: s.layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l)
  })),
  toggleLock: (id) => set((s) => ({
    layers: s.layers.map((l) => l.id === id ? { ...l, locked: !l.locked } : l)
  })),
}))

export default useLayerStore
