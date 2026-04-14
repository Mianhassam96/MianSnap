/**
 * Smart frame suggestions — detects motion peaks and face frames
 * by analyzing pixel difference between consecutive frames
 */

export async function getSuggestedFrames(videoUrl, totalFrames = 20) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    video.muted = true

    video.addEventListener('loadedmetadata', async () => {
      const duration = video.duration
      const canvas = document.createElement('canvas')
      canvas.width = 320  // small for speed
      canvas.height = 180
      const ctx = canvas.getContext('2d')

      const interval = duration / totalFrames
      const frames = []
      let prevData = null

      for (let i = 0; i < totalFrames; i++) {
        const time = interval * i + interval * 0.3
        await seekTo(video, time)
        ctx.drawImage(video, 0, 0, 320, 180)

        const imageData = ctx.getImageData(0, 0, 320, 180)
        const score = scoreFrame(imageData.data, prevData)
        prevData = imageData.data.slice()

        // Full-res capture for display
        const fullCanvas = document.createElement('canvas')
        fullCanvas.width = 1280
        fullCanvas.height = 720
        fullCanvas.getContext('2d').drawImage(video, 0, 0, 1280, 720)

        frames.push({
          time: parseFloat(time.toFixed(2)),
          dataUrl: fullCanvas.toDataURL('image/jpeg', 0.8),
          score,
          isBest: false,
        })
      }

      // Mark top 4 as "best"
      const sorted = [...frames].sort((a, b) => b.score - a.score)
      const bestTimes = new Set(sorted.slice(0, 4).map((f) => f.time))
      frames.forEach((f) => { f.isBest = bestTimes.has(f.time) })

      resolve(frames)
    })

    video.addEventListener('error', reject)
    video.load()
  })
}

function seekTo(video, time) {
  return new Promise((res) => {
    video.currentTime = time
    video.addEventListener('seeked', res, { once: true })
  })
}

function scoreFrame(data, prevData) {
  if (!prevData) return 50

  let motionScore = 0
  let brightnessScore = 0
  let skinScore = 0

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2]

    // Motion: pixel difference from previous frame
    if (prevData) {
      const diff = Math.abs(r - prevData[i]) + Math.abs(g - prevData[i + 1]) + Math.abs(b - prevData[i + 2])
      motionScore += diff
    }

    // Brightness variety (not too dark, not blown out)
    const brightness = r * 0.299 + g * 0.587 + b * 0.114
    if (brightness > 40 && brightness < 220) brightnessScore++

    // Skin tone presence (face indicator)
    if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) skinScore++
  }

  const pixels = data.length / 4
  const normalizedMotion = Math.min(motionScore / pixels / 3, 100)
  const normalizedBrightness = (brightnessScore / (pixels / 16)) * 40
  const normalizedSkin = Math.min((skinScore / (pixels / 16)) * 3, 30)

  return Math.round(normalizedMotion * 0.4 + normalizedBrightness + normalizedSkin)
}
