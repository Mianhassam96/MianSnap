/**
 * Lazy-loaded background removal using @xenova/transformers via CDN.
 * Model is only downloaded when user triggers the feature.
 */
let pipeline = null

export async function removeBackground(imageDataUrl, onProgress) {
  if (!pipeline) {
    onProgress?.('Loading AI model (first time only)...')
    const { pipeline: createPipeline, env } = await import(
      /* @vite-ignore */
      'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'
    )
    env.allowLocalModels = false
    pipeline = await createPipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      progress_callback: (p) => {
        if (p.status === 'downloading') {
          onProgress?.(`Downloading AI model: ${Math.round(p.progress || 0)}%`)
        }
      }
    })
  }

  onProgress?.('Removing background...')

  const result = await pipeline(imageDataUrl)

  // Find the background mask and invert it
  const mask = result.find((r) => r.label === 'background') || result[0]
  if (!mask?.mask) return imageDataUrl

  return applyMask(imageDataUrl, mask.mask)
}

function applyMask(imageDataUrl, mask) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < mask.data.length; i++) {
        // mask.data[i] = 0 means background → make transparent
        if (mask.data[i] === 0) data[i * 4 + 3] = 0
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = imageDataUrl
  })
}
