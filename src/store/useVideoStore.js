import { create } from 'zustand'

const useVideoStore = create((set) => ({
  videoFile: null,
  videoUrl: null,
  frames: [],
  selectedFrame: null,
  isExtracting: false,
  currentTime: 0,
  duration: 0,
  fps: 30,

  setVideoFile: (file) => set({ videoFile: file, videoUrl: URL.createObjectURL(file) }),
  clearVideo: () => set({ videoFile: null, videoUrl: null, frames: [], selectedFrame: null }),
  setFrames: (frames) => set({ frames }),
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),
  setIsExtracting: (v) => set({ isExtracting: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setFps: (fps) => set({ fps }),
}))

export default useVideoStore
