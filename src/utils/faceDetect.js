/**
 * Face auto-focus + emotion amplifier
 * Uses canvas pixel analysis for basic face region detection
 * and CSS filter-based emotion enhancement on fabric Image objects
 */

// Auto-zoom crop to rule-of-thirds based on detected skin-tone region
export function faceAutoFocus(fabricCanvas) {
  if (!fabricCanvas) return
  const bg = fabricCanvas.backgroundImage
  if (!bg) return

  const offscreen = document.createElement('canvas')
  offscreen.width = fabricCanvas.width
  offscreen.height = fabricCanvas.height
  const ctx = offscreen.getContext('2d')

  // Draw background image to offscreen canvas
  bg.render(ctx)

  const w = fabricCanvas.width
  const h = fabricCanvas.height
  const data = ctx.getImageData(0, 0, w, h).data

  // Scan for skin-tone pixels (rough heuristic)
  let minX = w, maxX = 0, minY = h, maxY = 0, count = 0

  for (let y = 0; y < h; y += 4) {
    for (let x = 0; x < w; x += 4) {
      const i = (y * w + x) * 4
      const r = data[i], g = data[i + 1], b = data[i + 2]
      if (isSkinTone(r, g, b)) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        count++
      }
    }
  }

  if (count < 50) return // not enough skin pixels found

  // Expand region slightly
  const pad = 60
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad * 2)
  maxX = Math.min(w, maxX + pad)
  maxY = Math.min(h, maxY + pad)

  const faceW = maxX - minX
  const faceH = maxY - minY
  if (faceW < 20 || faceH < 20) return

  // Rule-of-thirds: place face at left-third
  const targetX = w * 0.25
  const targetY = h * 0.33
  const scale = Math.min((w * 0.6) / faceW, (h * 0.7) / faceH, 2.5)

  const newScaleX = bg.scaleX * scale
  const newScaleY = bg.scaleY * scale
  const newLeft = targetX - (minX + faceW / 2) * newScaleX
  const newTop = targetY - (minY + faceH / 2) * newScaleY

  bg.set({ scaleX: newScaleX, scaleY: newScaleY, left: newLeft, top: newTop })
  fabricCanvas.renderAll()
}

function isSkinTone(r, g, b) {
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - b > 15 &&
    r < 250
  )
}

// Emotion amplifier — boosts brightness, contrast, sharpness on selected image
export function amplifyEmotion(fabricCanvas) {
  if (!fabricCanvas) return
  const obj = fabricCanvas.getActiveObject() || fabricCanvas.backgroundImage
  if (!obj) return

  // Apply CSS-style filter via fabric filter chain
  const { fabric } = window
  if (!fabric) return

  // Use fabric's built-in filters
  const filters = [
    new fabric.Image.filters.Brightness({ brightness: 0.08 }),
    new fabric.Image.filters.Contrast({ contrast: 0.15 }),
    new fabric.Image.filters.Saturation({ saturation: 0.2 }),
    new fabric.Image.filters.Sharpen(),
  ]

  if (obj.filters !== undefined) {
    obj.filters = filters
    obj.applyFilters()
    fabricCanvas.renderAll()
  }
}

export function resetFilters(fabricCanvas) {
  if (!fabricCanvas) return
  const obj = fabricCanvas.getActiveObject() || fabricCanvas.backgroundImage
  if (!obj || obj.filters === undefined) return
  obj.filters = []
  obj.applyFilters()
  fabricCanvas.renderAll()
}
