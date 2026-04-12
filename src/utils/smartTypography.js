/**
 * Auto-Glow System: detects background brightness under text
 * and applies appropriate shadow/glow/outline for readability.
 */
export function applySmartTypography(textObject, fabricCanvas) {
  if (!textObject || !fabricCanvas) return

  const ctx = fabricCanvas.getContext()
  const { left, top, width, height, scaleX = 1, scaleY = 1 } = textObject

  let brightness = 128 // default mid
  try {
    const sampleX = Math.max(0, left)
    const sampleY = Math.max(0, top)
    const sampleW = Math.min(width * scaleX, fabricCanvas.width - sampleX)
    const sampleH = Math.min(height * scaleY, fabricCanvas.height - sampleY)

    if (sampleW > 0 && sampleH > 0) {
      const data = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data
      let total = 0
      let count = 0
      for (let i = 0; i < data.length; i += 16) {
        total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
        count++
      }
      brightness = count > 0 ? total / count : 128
    }
  } catch (_) {}

  // Bright background → dark text with light glow
  // Dark background → light text with dark glow
  if (brightness > 128) {
    textObject.set({
      fill: '#111111',
      stroke: '#ffffff',
      strokeWidth: 1,
      shadow: { color: 'rgba(255,255,255,0.8)', blur: 12, offsetX: 0, offsetY: 0 },
    })
  } else {
    textObject.set({
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      shadow: { color: 'rgba(0,0,0,0.9)', blur: 16, offsetX: 2, offsetY: 2 },
    })
  }

  fabricCanvas.renderAll()
}
