import { create } from 'zustand'

const MAX_FRAMES = 30 // cap to prevent memory leak on long sessions

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
  setFrames: (frames) => set({ frames: frames.slice(0, MAX_FRAMES) }),
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),
  setIsExtracting: (v) => set({ isExtracting: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setFps: (fps) => set({ fps }),
  clearFrames: () => set({ frames: [], selectedFrame: null }),
}))

export default useVideoStore
