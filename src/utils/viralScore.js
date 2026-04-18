/**
 * Local viral score engine — no API needed.
 * Returns score + categorized feedback with fix actions.
 */
export function calculateViralScore(fabricCanvas) {
  if (!fabricCanvas) return null

  const objects = fabricCanvas.getObjects().filter(o => !o._isGuide && !o._viralGlow && !o._viralVignette && !o._vignette && !o._bgRect && !o._depthGlow && !o._depthShadow)
  const canvasW = fabricCanvas.width
  const canvasH = fabricCanvas.height
  const totalPixels = canvasW * canvasH

  let score = 50
  const categories = []

  // ── 1. TEXT SIZE ─────────────────────────────────────────────
  const textObjects = objects.filter(o => o.type === 'textbox' || o.type === 'text' || o.type === 'i-text')
  if (textObjects.length === 0) {
    categories.push({
      key: 'text',
      label: 'Text',
      status: 'warn',
      msg: 'No text — thumbnails with text get 2× more clicks',
      fix: 'add_text',
      fixLabel: 'Add Text',
    })
    score -= 10
  } else {
    const bigText = textObjects.some(t => t.fontSize >= 48)
    if (!bigText) {
      categories.push({
        key: 'text_size',
        label: 'Text Size',
        status: 'warn',
        msg: 'Text too small for mobile — use 48px+',
        fix: 'boost_text',
        fixLabel: 'Boost Size',
      })
      score -= 8
    } else {
      categories.push({ key: 'text_size', label: 'Text Size', status: 'good', msg: 'Mobile-friendly text size ✓' })
      score += 10
    }
  }

  // ── 2. FACE / SUBJECT ────────────────────────────────────────
  const images = objects.filter(o => o.type === 'image')
  const hasBg = !!fabricCanvas.backgroundImage
  if (images.length === 0 && !hasBg) {
    categories.push({
      key: 'subject',
      label: 'Subject',
      status: 'warn',
      msg: 'No focal subject — add a face or key visual',
      fix: null,
    })
    score -= 12
  } else {
    const largeImage = images.some(img => {
      const area = (img.width * img.scaleX) * (img.height * img.scaleY)
      return area / totalPixels > 0.15
    })
    if (!largeImage && !hasBg) {
      categories.push({
        key: 'subject',
        label: 'Subject',
        status: 'warn',
        msg: 'Subject too small — zoom in for higher CTR',
        fix: null,
      })
      score -= 5
    } else {
      categories.push({ key: 'subject', label: 'Subject', status: 'good', msg: 'Focal subject detected ✓' })
      score += 15
    }
  }

  // ── 3. CONTRAST ──────────────────────────────────────────────
  try {
    const ctx = fabricCanvas.getContext()
    const sample = ctx.getImageData(0, 0, canvasW, canvasH)
    const contrast = estimateContrast(sample.data)
    if (contrast < 60) {
      categories.push({
        key: 'contrast',
        label: 'Contrast',
        status: 'warn',
        msg: 'Low contrast — hard to read on mobile',
        fix: 'make_viral',
        fixLabel: '⚡ Boost It',
      })
      score -= 10
    } else {
      categories.push({ key: 'contrast', label: 'Contrast', status: 'good', msg: 'Good contrast ratio ✓' })
      score += 10
    }
  } catch (_) {
    categories.push({ key: 'contrast', label: 'Contrast', status: 'info', msg: 'Contrast check skipped' })
  }

  // ── 4. COMPOSITION ───────────────────────────────────────────
  if (objects.length > 10) {
    categories.push({
      key: 'composition',
      label: 'Composition',
      status: 'warn',
      msg: 'Too many elements — simplify for faster scanning',
      fix: null,
    })
    score -= 8
  } else if (objects.length >= 2 || hasBg) {
    categories.push({ key: 'composition', label: 'Composition', status: 'good', msg: 'Clean composition ✓' })
    score += 5
  } else {
    categories.push({ key: 'composition', label: 'Composition', status: 'info', msg: 'Add more elements' })
  }

  // ── 5. FACE VISIBILITY (skin tone heuristic) ─────────────────
  const bg = fabricCanvas.backgroundImage
  if (bg) {
    try {
      const off = document.createElement('canvas')
      off.width = 160; off.height = 90
      const ctx2 = off.getContext('2d')
      bg.render(ctx2)
      const d = ctx2.getImageData(0, 0, 160, 90).data
      let skin = 0
      for (let i = 0; i < d.length; i += 16) {
        const r = d[i], g = d[i+1], b = d[i+2]
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r-g) > 15) skin++
      }
      if (skin > 40) {
        categories.push({ key: 'face', label: 'Face', status: 'good', msg: 'Face detected — great for CTR ✓' })
        score += 8
      } else {
        categories.push({ key: 'face', label: 'Face', status: 'info', msg: 'No face detected — faces boost CTR' })
      }
    } catch (_) {}
  }

  score = Math.max(0, Math.min(100, score))
  return { score, categories }
}

function estimateContrast(data) {
  let min = 255, max = 0
  for (let i = 0; i < data.length; i += 16) {
    const b = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114
    if (b < min) min = b
    if (b > max) max = b
  }
  return max - min
}
