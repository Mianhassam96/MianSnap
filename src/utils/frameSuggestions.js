/**
 * Smart frame suggestions — uses native video resolution for full-res captures.
 * Analysis canvas stays small (320x180) for speed.
 */
import { seekTo } from './frameExtractor'

export async function getSuggestedFrames(videoUrl, totalFrames = 20) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    video.muted = true

    video.addEventListener('loadedmetadata', async () => {
      const duration = video.duration
      const vw = video.videoWidth  || 1280
      const vh = video.videoHeight || 720

      // Small canvas for fast analysis
      const analyseCanvas = document.createElement('canvas')
      analyseCanvas.width  = 320
      analyseCanvas.height = 180
      const analyseCtx = analyseCanvas.getContext('2d')

      // Full-res canvas for display
      const fullCanvas = document.createElement('canvas')
      fullCanvas.width  = vw
      fullCanvas.height = vh
      const fullCtx = fullCanvas.getContext('2d')

      const interval = duration / totalFrames
      const frames = []
      let prevData = null

      for (let i = 0; i < totalFrames; i++) {
        const time = interval * i + interval * 0.3
        await seekTo(video, time)

        // Analyse at low res
        analyseCtx.drawImage(video, 0, 0, 320, 180)
        const imageData = analyseCtx.getImageData(0, 0, 320, 180)
        const score = scoreFrame(imageData.data, prevData)
        prevData = imageData.data.slice()

        // Capture at native res
        fullCtx.clearRect(0, 0, vw, vh)
        fullCtx.drawImage(video, 0, 0, vw, vh)

        frames.push({
          time: parseFloat(time.toFixed(2)),
          dataUrl: fullCanvas.toDataURL('image/jpeg', 0.88),
          score,
          isBest: false,
          width: vw,
          height: vh,
        })
      }

      // Mark top 4 as best
      const sorted = [...frames].sort((a, b) => b.score - a.score)
      const bestTimes = new Set(sorted.slice(0, 4).map(f => f.time))
      frames.forEach(f => { f.isBest = bestTimes.has(f.time) })

      resolve(frames)
    })

    video.addEventListener('error', reject)
    video.load()
  })
}

function scoreFrame(data, prevData) {
  if (!prevData) return 50
  let motion = 0, brightness = 0, skin = 0
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i+1], b = data[i+2]
    motion += Math.abs(r - prevData[i]) + Math.abs(g - prevData[i+1]) + Math.abs(b - prevData[i+2])
    const lum = r * 0.299 + g * 0.587 + b * 0.114
    if (lum > 40 && lum < 220) brightness++
    if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r-g) > 15) skin++
  }
  const px = data.length / 4
  return Math.round(
    Math.min(motion / px / 3, 100) * 0.4 +
    (brightness / (px / 16)) * 40 +
    Math.min((skin / (px / 16)) * 3, 30)
  )
}
