/**
 * Frame extractor — always uses native video resolution (videoWidth/videoHeight)
 * to avoid blurry/stretched frames. Falls back to 1280x720 if not available.
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
      // Use native resolution
      const vw = video.videoWidth  || 1280
      const vh = video.videoHeight || 720
      const canvas = document.createElement('canvas')
      canvas.width  = vw
      canvas.height = vh
      const ctx = canvas.getContext('2d')
      const frames = []

      for (let i = 0; i < count; i++) {
        const time = interval * i + interval * 0.5
        await seekTo(video, time)
        ctx.clearRect(0, 0, vw, vh)
        ctx.drawImage(video, 0, 0, vw, vh)
        frames.push({
          time: parseFloat(time.toFixed(2)),
          dataUrl: canvas.toDataURL('image/jpeg', 0.92),
          width: vw,
          height: vh,
        })
      }
      resolve(frames)
    })

    video.addEventListener('error', reject)
    video.load()
  })
}

export function seekTo(video, time) {
  return new Promise((res) => {
    video.currentTime = time
    video.addEventListener('seeked', res, { once: true })
  })
}

export function captureFrame(video) {
  const vw = video.videoWidth  || 1280
  const vh = video.videoHeight || 720
  const canvas = document.createElement('canvas')
  canvas.width  = vw
  canvas.height = vh
  canvas.getContext('2d').drawImage(video, 0, 0, vw, vh)
  return canvas.toDataURL('image/jpeg', 0.95)
}

export function stepFrame(video, fps, direction) {
  const step = 1 / (fps || 30)
  video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + step * direction))
}
