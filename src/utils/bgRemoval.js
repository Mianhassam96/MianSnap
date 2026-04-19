/**
 * Lazy-loaded background removal — model only downloads on first use.
 * Uses Xenova/modnet for accurate person/subject removal.
 */
let pipeline = null
let loading = false

export async function removeBackground(imageDataUrl, onProgress) {
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
        'Xenova/segformer-b2-clothes',
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
    // Find the foreground/subject mask (not background)
    const mask = result.find(r => r.label !== 'background') || result[0]
    if (!mask?.mask) return imageDataUrl
    return await applyMask(imageDataUrl, mask.mask, true)
  } catch (err) {
    throw new Error('Background removal failed. Try a different image.')
  }
}

function applyMask(imageDataUrl, mask, invert = false) {
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
          // invert=true: keep subject (non-zero), remove background (zero)
          // invert=false: remove background label pixels
          const keep = invert ? mask.data[i] > 0 : mask.data[i] === 0
          if (!keep) data[i * 4 + 3] = 0
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
