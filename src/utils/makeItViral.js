/**
 * "Make it Viral" — one-click autonomous thumbnail enhancement
 * Applies: contrast boost, saturation, face zoom hint, glow text,
 * smart typography, subject spotlight, vignette
 *
 * State invariance: snapshots canvas before applying so action is reversible.
 */
import { fabric } from '../lib/fabric'
import { faceAutoFocus } from './faceDetect'
import { applySmartTypography } from './smartTypography'

/** Take a lightweight snapshot of bg filters + overlay objects for undo */
function snapshotViralState(fabricCanvas) {
  try {
    const bg = fabricCanvas.backgroundImage
    return {
      bgFilters: bg?.filters ? [...(Array.isArray(bg.filters) ? bg.filters : [])] : [],
      overlayIds: fabricCanvas.getObjects()
        .filter(o => o._viralGlow || o._viralVignette || o._viralEdge)
        .map(o => o.__uid),
    }
  } catch { return null }
}

/** Expose last snapshot globally so undo can call removeViralEffects */
function publishSnapshot(fabricCanvas) {
  window.__msLastViralSnapshot = snapshotViralState(fabricCanvas)
}

// Running lock — prevents concurrent calls from stacking effects
let _viralRunning = false

export async function makeItViral(fabricCanvas) {
  if (!fabricCanvas) return { steps: [] }
  if (_viralRunning) return { steps: [] }
  _viralRunning = true

  const steps = []
  const F = window.fabric
  if (!F) { _viralRunning = false; return { steps: [] } }

  window.__msHistory?.pauseSnapshot?.()
  publishSnapshot(fabricCanvas)

  try {

  const bg = fabricCanvas.backgroundImage
  const cw = fabricCanvas.width
  const ch = fabricCanvas.height

  // ── Analyze image tone ──────────────────────────────────────
  let avgBrightness = 128
  let avgSaturation = 0.5
  if (bg) {
    try {
      const off = document.createElement('canvas')
      off.width = 80; off.height = 45
      const ctx = off.getContext('2d')
      bg.render(ctx)
      const d = ctx.getImageData(0, 0, 80, 45).data
      let sumL = 0, sumS = 0, count = 0
      for (let i = 0; i < d.length; i += 16) {
        const r = d[i] / 255, g = d[i+1] / 255, b = d[i+2] / 255
        const max = Math.max(r, g, b), min = Math.min(r, g, b)
        sumL += (max + min) / 2
        sumS += max > 0 ? (max - min) / max : 0
        count++
      }
      avgBrightness = (sumL / count) * 255
      avgSaturation = sumS / count
    } catch (_) {}
  }

  const isDark   = avgBrightness < 90
  const isBright = avgBrightness > 170
  const isVibrant = avgSaturation > 0.4

  // ── 1. CINEMATIC COLOR GRADING ──────────────────────────────
  if (bg && bg.filters !== undefined) {
    bg.filters = []
    if (isDark) {
      bg.filters = [
        new F.Image.filters.Brightness({ brightness: 0.12 }),
        new F.Image.filters.Contrast({ contrast: 0.38 }),
        new F.Image.filters.Saturation({ saturation: 0.55 }),
      ]
      steps.push('✓ Cinematic dark boost')
    } else if (isBright) {
      bg.filters = [
        new F.Image.filters.Contrast({ contrast: 0.42 }),
        new F.Image.filters.Saturation({ saturation: isVibrant ? 0.25 : 0.45 }),
        new F.Image.filters.Brightness({ brightness: -0.06 }),
      ]
      steps.push('✓ HDR drama applied')
    } else {
      bg.filters = [
        new F.Image.filters.Contrast({ contrast: 0.32 }),
        new F.Image.filters.Brightness({ brightness: 0.06 }),
        new F.Image.filters.Saturation({ saturation: 0.42 }),
      ]
      steps.push('✓ Viral color grade applied')
    }
    bg.applyFilters()
  }

  // ── 2. FACE AUTO-FOCUS ──────────────────────────────────────
  try { faceAutoFocus(fabricCanvas); steps.push('✓ Face centered') } catch (_) {}

  // ── 3. POWER TEXT TREATMENT ─────────────────────────────────
  const textObjs = fabricCanvas.getObjects().filter(o => o.type === 'i-text' || o.type === 'textbox')
  textObjs.forEach((t) => {
    applySmartTypography(t, fabricCanvas)
    if (t.fontSize < 64) t.set('fontSize', 80)
    // Double stroke for maximum readability
    t.set({
      stroke: '#000000',
      strokeWidth: Math.max(3, Math.round(t.fontSize * 0.04)),
      shadow: new F.Shadow({ color: 'rgba(0,0,0,0.98)', blur: 28, offsetX: 3, offsetY: 4 }),
      paintFirst: 'stroke',
    })
  })
  if (textObjs.length > 0) steps.push('✓ Text impact maximized')

  // ── 4. REMOVE OLD OVERLAYS ──────────────────────────────────
  fabricCanvas.getObjects()
    .filter(o => o._viralGlow || o._viralVignette || o._viralEdge || o._viralSpotlight || o._viralChrome)
    .forEach(o => fabricCanvas.remove(o))

  // ── 5. CINEMATIC OVERLAYS ───────────────────────────────────
  if (isDark) {
    // Dual-color edge glow — cinematic split-tone (dark/gaming content only)
    const leftGlow = new F.Rect({
      left: 0, top: 0, width: cw * 0.35, height: ch,
      fill: new F.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: cw * 0.35, y2: 0 },
        colorStops: [
          { offset: 0, color: 'rgba(124,58,237,0.28)' },
          { offset: 1, color: 'rgba(124,58,237,0)' },
        ],
      }),
      selectable: false, evented: false, _viralEdge: true,
    })
    const rightGlow = new F.Rect({
      left: cw * 0.65, top: 0, width: cw * 0.35, height: ch,
      fill: new F.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: cw * 0.35, y2: 0 },
        colorStops: [
          { offset: 0, color: 'rgba(239,68,68,0)' },
          { offset: 1, color: 'rgba(239,68,68,0.28)' },
        ],
      }),
      selectable: false, evented: false, _viralEdge: true,
    })
    fabricCanvas.add(leftGlow); fabricCanvas.sendToBack(leftGlow)
    fabricCanvas.add(rightGlow); fabricCanvas.sendToBack(rightGlow)
    steps.push('✓ Cinematic split-tone glow')
  } else {
    // Warm subject spotlight — rule of thirds
    const spotlight = new F.Ellipse({
      left: cw * 0.5, top: ch * 0.38,
      rx: cw * 0.38, ry: ch * 0.42,
      originX: 'center', originY: 'center',
      fill: new F.Gradient({
        type: 'radial',
        coords: { r1: 0, r2: cw * 0.38, x1: cw * 0.5, y1: ch * 0.38, x2: cw * 0.5, y2: ch * 0.38 },
        colorStops: [
          { offset: 0,   color: 'rgba(255,220,100,0.14)' },
          { offset: 0.5, color: 'rgba(255,180,50,0.06)' },
          { offset: 1,   color: 'rgba(255,255,255,0)' },
        ],
      }),
      selectable: false, evented: false, _viralSpotlight: true,
    })
    fabricCanvas.add(spotlight); fabricCanvas.sendToBack(spotlight)
    steps.push('✓ Subject spotlight')
  }

  // ── 6. CINEMATIC BARS — only for dark/action content ───────
  // Avoid over-dramatizing bright/clean images
  if (isDark || (!isBright && avgSaturation < 0.35)) {
    const topBar = new F.Rect({
      left: 0, top: 0, width: cw, height: ch * 0.06,
      fill: new F.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: ch * 0.06 },
        colorStops: [
          { offset: 0, color: 'rgba(0,0,0,0.55)' },
          { offset: 1, color: 'rgba(0,0,0,0)' },
        ],
      }),
      selectable: false, evented: false, _viralChrome: true,
    })
    const bottomBar = new F.Rect({
      left: 0, top: ch * 0.94, width: cw, height: ch * 0.06,
      fill: new F.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: ch * 0.06 },
        colorStops: [
          { offset: 0, color: 'rgba(0,0,0,0)' },
          { offset: 1, color: 'rgba(0,0,0,0.6)' },
        ],
      }),
      selectable: false, evented: false, _viralChrome: true,
    })
    fabricCanvas.add(topBar); fabricCanvas.sendToBack(topBar)
    fabricCanvas.add(bottomBar); fabricCanvas.sendToBack(bottomBar)
    steps.push('✓ Cinematic bars')
  }

  // ── 7. DEEP VIGNETTE ────────────────────────────────────────
  const vignette = new F.Rect({
    left: 0, top: 0, width: cw, height: ch,
    fill: new F.Gradient({
      type: 'radial',
      coords: { r1: 0, r2: cw * 0.72, x1: cw / 2, y1: ch / 2, x2: cw / 2, y2: ch / 2 },
      colorStops: [
        { offset: 0,    color: 'rgba(0,0,0,0)' },
        { offset: 0.55, color: 'rgba(0,0,0,0)' },
        { offset: 0.78, color: 'rgba(0,0,0,0.22)' },
        { offset: 1,    color: 'rgba(0,0,0,0.72)' },
      ],
    }),
    selectable: false, evented: false, _viralVignette: true,
  })
  fabricCanvas.add(vignette); fabricCanvas.sendToBack(vignette)
  steps.push('✓ Deep vignette + cinematic bars')

  fabricCanvas.renderAll()

  window.dispatchEvent(new CustomEvent('miansnap:viralDone', {
    detail: { steps: ['✨ Color graded', '🔥 Contrast maxed', '🎯 Face focused', '💫 Cinematic glow', '🌟 Ready to perform'] }
  }))

  return { steps }
  } catch (err) {
    console.warn('[makeItViral] Error during enhancement:', err)
    return { steps }
  } finally {
    // Always release lock — even if enhancement threw
    _viralRunning = false
    window.__msHistory?.resumeSnapshot?.()
  }
}

// Remove all viral effects (filters + overlays) — always safe to call
export function removeViralEffects(fabricCanvas) {
  if (!fabricCanvas) return
  try {
    fabricCanvas.getObjects()
      .filter(o => o._viralGlow || o._viralVignette || o._viralEdge || o._viralSpotlight || o._viralChrome)
      .forEach(o => fabricCanvas.remove(o))
    const bg = fabricCanvas.backgroundImage
    if (bg && bg.filters !== undefined) {
      bg.filters = []
      bg.applyFilters()
    }
    fabricCanvas.renderAll()
    window.showToast?.('✓ Effects removed', 'info', 1500)
  } catch (err) {
    console.warn('[makeItViral] removeViralEffects failed:', err)
  }
}
