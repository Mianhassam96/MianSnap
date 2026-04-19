/**
 * Central image placement utility for MianSnap.
 * All image-to-canvas operations go through here for consistency.
 */
import { fabric } from '../lib/fabric'

/**
 * Scale modes:
 * 'cover' — fills canvas, may crop edges (best for thumbnails)
 * 'contain' — whole image visible, may have letterbox (best for editing)
 * 'fit' — alias for contain
 */
export function scaleImageToCanvas(img, canvasW, canvasH, mode = 'cover') {
  const iw = img.width
  const ih = img.height
  if (!iw || !ih) return { scaleX: 1, scaleY: 1, left: 0, top: 0 }

  let scale
  if (mode === 'cover') {
    scale = Math.max(canvasW / iw, canvasH / ih)
  } else {
    // contain / fit
    scale = Math.min(canvasW / iw, canvasH / ih)
  }

  // Always uniform scale — no stretching
  const scaledW = iw * scale
  const scaledH = ih * scale

  return {
    scaleX: scale,
    scaleY: scale,
    left: (canvasW - scaledW) / 2,
    top:  (canvasH - scaledH) / 2,
    originX: 'left',
    originY: 'top',
  }
}

/**
 * Apply image to canvas background with correct scaling.
 * Auto-detects aspect ratio and always covers canvas perfectly.
 */
export function applyImageAsBackground(fabricCanvas, dataUrl, mode = 'cover', onDone) {
  if (!fabricCanvas || !dataUrl) return
  if (!fabric) return
  // Don't use crossOrigin for data URLs — it causes CORS errors
  const opts = dataUrl.startsWith('data:') ? {} : { crossOrigin: 'anonymous' }
  fabric.Image.fromURL(dataUrl, (img) => {
    if (!img || !img.width) {
      // Retry without crossOrigin if image failed to load
      fabric.Image.fromURL(dataUrl, (img2) => {
        if (!img2) return
        const props = scaleImageToCanvas(img2, fabricCanvas.width, fabricCanvas.height, mode)
        img2.set(props)
        fabricCanvas.setBackgroundImage(img2, () => {
          fabricCanvas.renderAll()
          onDone?.()
        })
      })
      return
    }
    const props = scaleImageToCanvas(img, fabricCanvas.width, fabricCanvas.height, mode)
    img.set(props)
    fabricCanvas.setBackgroundImage(img, () => {
      fabricCanvas.renderAll()
      onDone?.()
    })
  }, opts)
}

/**
 * Apply pro Fabric settings to any selectable image object.
 * Larger handles, no flip, centered scaling, glow on select.
 */
export function applyProImageSettings(img, isMobile = false) {
  const handleSize = isMobile ? 18 : 12
  const padding    = isMobile ? 10 : 6

  img.set({
    cornerStyle:       'circle',
    transparentCorners: false,
    cornerColor:       '#7c3aed',
    cornerStrokeColor: '#ffffff',
    borderColor:       '#7c3aed',
    cornerSize:        handleSize,
    padding:           padding,
    lockScalingFlip:   true,
    centeredScaling:   false,
    objectCaching:     false,
  })

  // Glow border on select
  img.on('selected', () => {
    img.set('opacity', 0.97)
  })
  img.on('deselected', () => {
    img.set('opacity', 1)
  })

  return img
}

/**
 * Soft boundary — allows objects to move freely but warns at edges.
 * Objects can go partially off-canvas (needed for creative layouts).
 */
export function clampToBounds(obj, canvasW, canvasH) {
  // Allow objects to go up to 50% off canvas — don't hard-lock them
  const w = obj.getScaledWidth()
  const h = obj.getScaledHeight()
  const minVisible = 40 // at least 40px must remain visible
  if (obj.left + w < minVisible) obj.left = minVisible - w
  if (obj.top + h < minVisible) obj.top = minVisible - h
  if (obj.left > canvasW - minVisible) obj.left = canvasW - minVisible
  if (obj.top > canvasH - minVisible) obj.top = canvasH - minVisible
}

/**
 * Detect if device is likely mobile/touch.
 */
export function isMobileDevice() {
  return window.matchMedia?.('(max-width: 768px)').matches || navigator.maxTouchPoints > 1
}
