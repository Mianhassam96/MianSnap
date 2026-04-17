/**
 * Smart text placement — detects face/subject region and places
 * text in the safest area (top, bottom, or side away from face).
 */

export function detectFaceRegion(fabricCanvas) {
  const bg = fabricCanvas?.backgroundImage
  if (!bg) return null

  const offscreen = document.createElement('canvas')
  offscreen.width  = fabricCanvas.width
  offscreen.height = fabricCanvas.height
  const ctx = offscreen.getContext('2d')
  bg.render(ctx)

  const w = fabricCanvas.width
  const h = fabricCanvas.height
  const data = ctx.getImageData(0, 0, w, h).data

  let minX = w, maxX = 0, minY = h, maxY = 0, count = 0

  for (let y = 0; y < h; y += 6) {
    for (let x = 0; x < w; x += 6) {
      const i = (y * w + x) * 4
      const r = data[i], g = data[i+1], b = data[i+2]
      if (isSkin(r, g, b)) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        count++
      }
    }
  }

  if (count < 30) return null

  const pad = 40
  return {
    x: Math.max(0, minX - pad),
    y: Math.max(0, minY - pad),
    w: Math.min(w, maxX + pad) - Math.max(0, minX - pad),
    h: Math.min(h, maxY + pad) - Math.max(0, minY - pad),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  }
}

function isSkin(r, g, b) {
  return r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r-g) > 15 && r < 250
}

/**
 * Returns the best position for text given a face region.
 * Returns { left, top, originX, originY }
 */
export function getSmartTextPosition(fabricCanvas, textWidth = 400, textHeight = 80) {
  const cw = fabricCanvas.width
  const ch = fabricCanvas.height
  const face = detectFaceRegion(fabricCanvas)

  if (!face) {
    // No face — place at bottom center
    return { left: cw / 2, top: ch * 0.82, originX: 'center', originY: 'center' }
  }

  const faceCenterX = face.cx / cw  // 0–1
  const faceCenterY = face.cy / ch  // 0–1

  // Face on left half → place text on right
  if (faceCenterX < 0.5) {
    return { left: cw * 0.72, top: ch * 0.5, originX: 'center', originY: 'center' }
  }
  // Face on right half → place text on left
  if (faceCenterX > 0.5) {
    return { left: cw * 0.28, top: ch * 0.5, originX: 'center', originY: 'center' }
  }
  // Face centered → place text at bottom
  return { left: cw / 2, top: ch * 0.82, originX: 'center', originY: 'center' }
}
