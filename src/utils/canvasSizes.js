/**
 * Standard canvas sizes for different platforms.
 */
export const CANVAS_SIZES = [
  { id: 'youtube',   label: '▶ YouTube',        w: 1280, h: 720,  ratio: '16:9' },
  { id: 'instagram', label: '📷 Instagram Post', w: 1080, h: 1080, ratio: '1:1'  },
  { id: 'instagram_story', label: '📱 Instagram Story', w: 1080, h: 1920, ratio: '9:16' },
  { id: 'facebook',  label: '👥 Facebook',       w: 1200, h: 630,  ratio: '1.9:1' },
  { id: 'linkedin',  label: '💼 LinkedIn',       w: 1200, h: 627,  ratio: '1.9:1' },
  { id: 'twitter',   label: '🐦 Twitter/X',      w: 1200, h: 675,  ratio: '16:9' },
  { id: 'tiktok',    label: '🎵 TikTok',         w: 1080, h: 1920, ratio: '9:16' },
]

export function getSizeById(id) {
  return CANVAS_SIZES.find(s => s.id === id) || CANVAS_SIZES[0]
}

/**
 * Resize canvas and scale all objects proportionally.
 */
export function resizeCanvas(fabricCanvas, newW, newH) {
  if (!fabricCanvas) return
  const oldW = fabricCanvas.width
  const oldH = fabricCanvas.height
  const scaleX = newW / oldW
  const scaleY = newH / oldH

  // Scale all objects
  fabricCanvas.getObjects().forEach(obj => {
    obj.set({
      left:   (obj.left || 0) * scaleX,
      top:    (obj.top  || 0) * scaleY,
      scaleX: (obj.scaleX || 1) * scaleX,
      scaleY: (obj.scaleY || 1) * scaleY,
    })
    obj.setCoords()
  })

  // Scale background image — then re-apply cover to fill new canvas
  const bg = fabricCanvas.backgroundImage
  if (bg) {
    // Re-apply cover scaling to new canvas dimensions
    const nativeW = bg.width
    const nativeH = bg.height
    const scale = Math.max(newW / nativeW, newH / nativeH)
    bg.set({
      scaleX: scale,
      scaleY: scale,
      left: (newW - nativeW * scale) / 2,
      top:  (newH - nativeH * scale) / 2,
    })
  }

  fabricCanvas.setWidth(newW)
  fabricCanvas.setHeight(newH)
  fabricCanvas.renderAll()
  // Notify CanvasEditor to update aspect ratio
  window.dispatchEvent(new CustomEvent('miansnap:canvasResized', { detail: { w: newW, h: newH } }))
}
