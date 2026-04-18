/**
 * Lazy-loaded background removal — model only downloads on first use.
 * Shows clear progress so users know what's happening.
 */
let pipeline = null
let loading = false

export async function removeBackground(imageDataUrl, onProgress) {
  // Already loading — prevent double-load
  if (loading && !pipeline) {
    onProgress?.('AI model loading...')
    await new Promise(r => setTimeout(r, 500))
  }

  if (!pipeline) {
    loading = true
    onProgress?.('⏳ Loading AI model (first time only, ~20MB)...')
    try {
      const { pipeline: createPipeline, env } = await import(
        /* @vite-ignore */
        'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'
      )
      env.allowLocalModels = false
      pipeline = await createPipeline(
        'image-segmentation',
        'Xenova/segformer-b0-finetuned-ade-512-512',
        {
          progress_callback: (p) => {
            if (p.status === 'downloading') {
              const pct = Math.round(p.progress || 0)
              onProgress?.(`📥 Downloading AI model: ${pct}%`)
            }
          },
        }
      )
    } catch (err) {
      loading = false
      pipeline = null
      throw new Error('Failed to load AI model. Check your connection and try again.')
    }
    loading = false
  }

  onProgress?.('✂️ Removing background...')

  try {
    const result = await pipeline(imageDataUrl)
    const mask = result.find(r => r.label === 'background') || result[0]
    if (!mask?.mask) return imageDataUrl
    return await applyMask(imageDataUrl, mask.mask)
  } catch (err) {
    throw new Error('Background removal failed. Try a different image.')
  }
}

function applyMask(imageDataUrl, mask) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < mask.data.length; i++) {
          if (mask.data[i] === 0) data[i * 4 + 3] = 0
        }
        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = reject
    img.src = imageDataUrl
  })
}
