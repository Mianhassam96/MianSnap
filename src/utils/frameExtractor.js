/**
 * Extracts frames from a video file using canvas snapshots.
 * Returns array of { time, dataUrl } objects.
 */
export async function extractFrames(videoUrl, count = 12) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    video.muted = true

    video.addEventListener('loadedmetadata', async () => {
      const duration = video.duration
      const interval = duration / count
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const frames = []

      canvas.width = 1280
      canvas.height = 720

      for (let i = 0; i < count; i++) {
        const time = interval * i + interval * 0.5
        await seekTo(video, time)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        frames.push({ time: time.toFixed(2), dataUrl: canvas.toDataURL('image/jpeg', 0.85) })
      }

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
