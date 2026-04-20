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
  window.__msHistory?.pauseSnapshot?.()

  // Analyze image to pick smart effects
  const bg = fabricCanvas.backgroundImage
  const hasText = fabricCanvas.getObjects().some(o => o.type === 'i-text' || o.type === 'textbox')

  // Detect image brightness to pick effect style
  let avgBrightness = 128
  if (bg) {
    try {
      const off = document.createElement('canvas')
      off.width = 40; off.height = 22
      const ctx = off.getContext('2d')
      bg.render(ctx)
      const d = ctx.getImageData(0, 0, 40, 22).data
      let sum = 0
      for (let i = 0; i < d.length; i += 16) sum += d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114
      avgBrightness = sum / (d.length / 16)
    } catch (_) {}
  }

  const isDark = avgBrightness < 100
  const isBright = avgBrightness > 160

  // 1. Smart filters based on image tone
  if (bg && bg.filters !== undefined) {
    bg.filters = []
    if (isDark) {
      // Dark image: boost brightness + saturation for drama
      bg.filters = [
        new fabric.Image.filters.Brightness({ brightness: 0.08 }),
        new fabric.Image.filters.Contrast({ contrast: 0.3 }),
        new fabric.Image.filters.Saturation({ saturation: 0.4 }),
      ]
      steps.push('✓ Dark image: contrast + saturation boosted')
    } else if (isBright) {
      // Bright image: add drama with contrast + slight desaturate
      bg.filters = [
        new fabric.Image.filters.Contrast({ contrast: 0.35 }),
        new fabric.Image.filters.Saturation({ saturation: -0.1 }),
        new fabric.Image.filters.Brightness({ brightness: -0.05 }),
      ]
      steps.push('✓ Bright image: dramatic contrast applied')
    } else {
      // Mid-tone: standard viral boost
      bg.filters = [
        new fabric.Image.filters.Contrast({ contrast: 0.25 }),
        new fabric.Image.filters.Brightness({ brightness: 0.05 }),
        new fabric.Image.filters.Saturation({ saturation: 0.3 }),
      ]
      steps.push('✓ Contrast & saturation boosted')
    }
    bg.applyFilters()
  }

  // 2. Face auto-focus
  try {
    faceAutoFocus(fabricCanvas)
    steps.push('✓ Face auto-focused')
  } catch (_) {}

  // 3. Smart typography
  const textObjs = fabricCanvas.getObjects().filter(o => o.type === 'i-text' || o.type === 'textbox')
  textObjs.forEach((t) => {
    applySmartTypography(t, fabricCanvas)
    if (t.fontSize < 56) { t.set('fontSize', 72); steps.push('✓ Text size boosted') }
    t.set('shadow', new fabric.Shadow({ color: 'rgba(0,0,0,0.95)', blur: 24, offsetX: 2, offsetY: 3 }))
    if (!t.stroke || t.stroke === 'transparent') t.set({ stroke: '#000000', strokeWidth: 2 })
  })
  if (textObjs.length > 0) steps.push('✓ Text glow & readability enhanced')

  // 4. Remove old viral overlays
  fabricCanvas.getObjects()
    .filter(o => o._viralGlow || o._viralVignette || o._viralEdge)
    .forEach(o => fabricCanvas.remove(o))

  // 5. Smart overlay based on image tone
  if (isDark) {
    // Dark image: add color edge glow (cinematic)
    const edgeGlow = new fabric.Rect({
      left: 0, top: 0, width: fabricCanvas.width, height: fabricCanvas.height,
      fill: new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: fabricCanvas.width, y2: 0 },
        colorStops: [
          { offset: 0, color: 'rgba(124,58,237,0.18)' },
          { offset: 0.5, color: 'rgba(0,0,0,0)' },
          { offset: 1, color: 'rgba(239,68,68,0.18)' },
        ],
      }),
      selectable: false, evented: false, _viralEdge: true,
    })
    fabricCanvas.add(edgeGlow)
    fabricCanvas.sendToBack(edgeGlow)
    steps.push('✓ Cinematic edge glow added')
  } else {
    // Bright/mid: subject spotlight
    const spotlight = new fabric.Ellipse({
      left: fabricCanvas.width * 0.5, top: fabricCanvas.height * 0.42,
      rx: fabricCanvas.width * 0.3, ry: fabricCanvas.height * 0.35,
      originX: 'center', originY: 'center',
      fill: new fabric.Gradient({
        type: 'radial',
        coords: { r1: 0, r2: fabricCanvas.width * 0.3, x1: fabricCanvas.width * 0.5, y1: fabricCanvas.height * 0.42, x2: fabricCanvas.width * 0.5, y2: fabricCanvas.height * 0.42 },
        colorStops: [{ offset: 0, color: 'rgba(255,255,255,0.1)' }, { offset: 1, color: 'rgba(255,255,255,0)' }],
      }),
      selectable: false, evented: false, _viralGlow: true,
    })
    fabricCanvas.add(spotlight)
    fabricCanvas.sendToBack(spotlight)
    steps.push('✓ Subject spotlight added')
  }

  // 6. Vignette — always
  const vignette = new fabric.Rect({
    left: 0, top: 0, width: fabricCanvas.width, height: fabricCanvas.height,
    fill: new fabric.Gradient({
      type: 'radial',
      coords: { r1: 0, r2: fabricCanvas.width * 0.7, x1: fabricCanvas.width / 2, y1: fabricCanvas.height / 2, x2: fabricCanvas.width / 2, y2: fabricCanvas.height / 2 },
      colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 0.6, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.55)' }],
    }),
    selectable: false, evented: false, _viralVignette: true,
  })
  fabricCanvas.add(vignette)
  fabricCanvas.sendToBack(vignette)
  steps.push('✓ Vignette applied')

  fabricCanvas.renderAll()
  window.__msHistory?.resumeSnapshot?.()
  
  // Dispatch enhanced feedback event
  window.dispatchEvent(new CustomEvent('miansnap:viralDone', {
    detail: {
      steps: [
        '✨ Face enhanced',
        '🔥 Contrast boosted',
        '🎯 Focus optimized',
        '💫 Glow applied',
        '🌟 Ready to perform',
      ]
    }
  }))
  
  return { steps }
}

// Remove all viral effects (filters + overlays)
export function removeViralEffects(fabricCanvas) {
  if (!fabricCanvas) return
  // Remove overlays
  fabricCanvas.getObjects()
    .filter(o => o._viralGlow || o._viralVignette || o._viralEdge)
    .forEach(o => fabricCanvas.remove(o))
  // Reset bg filters
  const bg = fabricCanvas.backgroundImage
  if (bg && bg.filters !== undefined) {
    bg.filters = []
    bg.applyFilters()
  }
  fabricCanvas.renderAll()
  window.showToast?.('✓ Effects removed', 'info', 1500)
}
