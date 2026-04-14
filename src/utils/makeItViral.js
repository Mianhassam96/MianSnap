/**
 * "Make it Viral" — one-click magic
 * Combines: emotion amplifier + contrast boost + face zoom + glow text + smart typography
 */
import { fabric } from '../lib/fabric'
import { faceAutoFocus } from './faceDetect'
import { applySmartTypography } from './smartTypography'

export async function makeItViral(fabricCanvas) {
  if (!fabricCanvas) return { steps: [] }

  const steps = []

  // 1. Boost background image filters
  const bg = fabricCanvas.backgroundImage
  if (bg && bg.filters !== undefined) {
    bg.filters = [
      new fabric.Image.filters.Contrast({ contrast: 0.2 }),
      new fabric.Image.filters.Brightness({ brightness: 0.06 }),
      new fabric.Image.filters.Saturation({ saturation: 0.25 }),
    ]
    bg.applyFilters()
    steps.push('✓ Boosted contrast & saturation')
  }

  // 2. Face auto-focus
  try {
    faceAutoFocus(fabricCanvas)
    steps.push('✓ Face auto-focused (rule of thirds)')
  } catch (_) {}

  // 3. Apply smart typography to all text objects
  const textObjs = fabricCanvas.getObjects().filter(
    (o) => o.type === 'i-text' || o.type === 'textbox'
  )
  textObjs.forEach((t) => {
    applySmartTypography(t, fabricCanvas)
    // Boost font size if too small
    if (t.fontSize < 48) {
      t.set('fontSize', 64)
      steps.push('✓ Text size boosted for mobile')
    }
    // Add glow
    t.set('shadow', new fabric.Shadow({
      color: 'rgba(0,0,0,0.9)', blur: 20, offsetX: 2, offsetY: 2,
    }))
  })
  if (textObjs.length > 0) steps.push('✓ Smart typography applied')

  // 4. Add glow overlay on subject (subtle radial highlight)
  const existingGlow = fabricCanvas.getObjects().find((o) => o._viralGlow)
  if (!existingGlow) {
    const glow = new fabric.Ellipse({
      left: fabricCanvas.width * 0.5,
      top: fabricCanvas.height * 0.4,
      rx: fabricCanvas.width * 0.25,
      ry: fabricCanvas.height * 0.3,
      originX: 'center', originY: 'center',
      fill: 'rgba(255,255,255,0.06)',
      stroke: 'rgba(255,255,255,0.12)',
      strokeWidth: 2,
      selectable: false, evented: false,
      _viralGlow: true,
    })
    fabricCanvas.add(glow)
    fabricCanvas.sendToBack(glow)
    steps.push('✓ Subject glow added')
  }

  fabricCanvas.renderAll()
  return { steps }
}

