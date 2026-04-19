/**
 * "Make it Viral" — one-click autonomous thumbnail enhancement
 * Applies: contrast boost, saturation, face zoom hint, glow text,
 * smart typography, subject spotlight, vignette
 */
import { fabric } from '../lib/fabric'
import { faceAutoFocus } from './faceDetect'
import { applySmartTypography } from './smartTypography'

export async function makeItViral(fabricCanvas) {
  if (!fabricCanvas) return { steps: [] }

  const steps = []

  // Pause history — entire Make Viral = 1 undo step
  window.__msHistory?.pauseSnapshot?.()

  // 1. Boost background image — always reset first, then apply
  const bg = fabricCanvas.backgroundImage
  if (bg && bg.filters !== undefined) {
    bg.filters = [
      new fabric.Image.filters.Contrast({ contrast: 0.25 }),
      new fabric.Image.filters.Brightness({ brightness: 0.05 }),
      new fabric.Image.filters.Saturation({ saturation: 0.3 }),
    ]
    bg.applyFilters()
    steps.push('✓ Contrast & saturation boosted')
  }

  // 2. Face auto-focus (rule of thirds positioning)
  try {
    faceAutoFocus(fabricCanvas)
    steps.push('✓ Face auto-focused')
  } catch (_) {}

  // 3. Smart typography on all text objects
  const textObjs = fabricCanvas.getObjects().filter(
    (o) => o.type === 'i-text' || o.type === 'textbox'
  )
  textObjs.forEach((t) => {
    applySmartTypography(t, fabricCanvas)
    if (t.fontSize < 56) {
      t.set('fontSize', 72)
      steps.push('✓ Text size boosted for mobile')
    }
    // Strong glow + shadow for readability
    t.set('shadow', new fabric.Shadow({
      color: 'rgba(0,0,0,0.95)', blur: 24, offsetX: 2, offsetY: 3,
    }))
    // Ensure stroke for contrast
    if (!t.stroke || t.stroke === 'transparent') {
      t.set({ stroke: '#000000', strokeWidth: 2 })
    }
  })
  if (textObjs.length > 0) steps.push('✓ Text glow & readability enhanced')

  // 4. Remove old viral overlays
  fabricCanvas.getObjects()
    .filter((o) => o._viralGlow || o._viralVignette)
    .forEach((o) => fabricCanvas.remove(o))

  // 5. Subject spotlight — radial glow in center
  const spotlight = new fabric.Ellipse({
    left: fabricCanvas.width * 0.5,
    top: fabricCanvas.height * 0.42,
    rx: fabricCanvas.width * 0.28,
    ry: fabricCanvas.height * 0.32,
    originX: 'center', originY: 'center',
    fill: 'rgba(255,255,255,0.07)',
    stroke: 'rgba(255,255,255,0.14)',
    strokeWidth: 2,
    selectable: false, evented: false,
    _viralGlow: true,
  })
  fabricCanvas.add(spotlight)
  fabricCanvas.sendToBack(spotlight)
  steps.push('✓ Subject spotlight added')

  // 6. Vignette — dark edges draw eye to center
  const vignette = new fabric.Rect({
    left: 0, top: 0,
    width: fabricCanvas.width, height: fabricCanvas.height,
    fill: new fabric.Gradient({
      type: 'radial',
      coords: {
        r1: 0, r2: fabricCanvas.width * 0.7,
        x1: fabricCanvas.width / 2, y1: fabricCanvas.height / 2,
        x2: fabricCanvas.width / 2, y2: fabricCanvas.height / 2,
      },
      colorStops: [
        { offset: 0, color: 'rgba(0,0,0,0)' },
        { offset: 0.6, color: 'rgba(0,0,0,0)' },
        { offset: 1, color: 'rgba(0,0,0,0.55)' },
      ],
    }),
    selectable: false, evented: false,
    _viralVignette: true,
  })
  fabricCanvas.add(vignette)
  fabricCanvas.sendToBack(vignette)
  steps.push('✓ Vignette applied')

  fabricCanvas.renderAll()
  // Resume history — snapshot the final state as 1 undo step
  window.__msHistory?.resumeSnapshot?.()
  return { steps }
}
