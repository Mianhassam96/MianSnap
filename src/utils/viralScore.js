/**
 * Local viral score engine — no API needed.
 * Analyzes canvas data and returns score + feedback.
 */
export function calculateViralScore(fabricCanvas) {
  if (!fabricCanvas) return null

  const objects = fabricCanvas.getObjects()
  const canvasW = fabricCanvas.width
  const canvasH = fabricCanvas.height
  const totalPixels = canvasW * canvasH

  let score = 50
  const feedback = []

  // --- Text analysis ---
  const textObjects = objects.filter((o) => o.type === 'textbox' || o.type === 'text' || o.type === 'i-text')
  if (textObjects.length === 0) {
    feedback.push({ type: 'warn', msg: 'No text detected — thumbnails with text get 2x more clicks' })
    score -= 10
  } else {
    const bigText = textObjects.some((t) => t.fontSize >= 48)
    if (!bigText) {
      feedback.push({ type: 'warn', msg: 'Text too small for mobile — use 48px+ for main headline' })
      score -= 8
    } else {
      score += 10
      feedback.push({ type: 'good', msg: 'Text size is mobile-friendly' })
    }
  }

  // --- Image/subject analysis ---
  const images = objects.filter((o) => o.type === 'image')
  if (images.length === 0) {
    feedback.push({ type: 'warn', msg: 'No focal subject detected — add a face or key visual' })
    score -= 12
  } else {
    score += 15
    feedback.push({ type: 'good', msg: 'Focal subject detected' })

    // Check if subject is large enough (covers >15% of canvas)
    const largeImage = images.some((img) => {
      const area = (img.width * img.scaleX) * (img.height * img.scaleY)
      return area / totalPixels > 0.15
    })
    if (!largeImage) {
      feedback.push({ type: 'warn', msg: 'Subject too small — zoom in for higher CTR' })
      score -= 5
    }
  }

  // --- Object count (clutter check) ---
  if (objects.length > 10) {
    feedback.push({ type: 'warn', msg: 'Too many elements — simplify for faster visual processing' })
    score -= 8
  } else if (objects.length >= 2) {
    score += 5
    feedback.push({ type: 'good', msg: 'Clean composition detected' })
  }

  // --- Contrast check via pixel sampling ---
  try {
    const ctx = fabricCanvas.getContext()
    const sample = ctx.getImageData(0, 0, canvasW, canvasH)
    const contrast = estimateContrast(sample.data)
    if (contrast < 60) {
      feedback.push({ type: 'warn', msg: 'Low contrast — low contrast = low CTR risk' })
      score -= 10
    } else {
      score += 10
      feedback.push({ type: 'good', msg: 'Good contrast ratio' })
    }
  } catch (_) {
    // cross-origin canvas — skip pixel check
  }

  score = Math.max(0, Math.min(100, score))

  return { score, feedback }
}

function estimateContrast(data) {
  let min = 255, max = 0
  for (let i = 0; i < data.length; i += 16) {
    const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    if (brightness < min) min = brightness
    if (brightness > max) max = brightness
  }
  return max - min
}
