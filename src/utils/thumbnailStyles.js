/**
 * One-Click Thumbnail Styles
 * Each style applies: color grading, text, glow, contrast boost
 */
import { fabric } from '../lib/fabric'

const STYLES = {
  dramatic: {
    label: '😱 Dramatic Reaction',
    emoji: '😱',
    bg: 'linear-gradient(135deg,#1a0000,#2d0000)',
    filters: [
      { type: 'Contrast', value: 0.25 },
      { type: 'Saturation', value: -0.2 },
      { type: 'Brightness', value: -0.05 },
    ],
    text: { content: 'YOU WON\'T BELIEVE THIS', font: 'Impact', size: 80, fill: '#ffffff', stroke: '#ff0000', strokeWidth: 4, shadow: { color: '#ff0000', blur: 30, offsetX: 0, offsetY: 0 } },
    textPos: { x: 0.5, y: 0.82 },
    vignette: true,
  },
  gaming: {
    label: '🎮 Gaming Highlight',
    emoji: '🎮',
    bg: 'linear-gradient(135deg,#001a33,#000d1a)',
    filters: [
      { type: 'Saturation', value: 0.4 },
      { type: 'Contrast', value: 0.2 },
      { type: 'Brightness', value: 0.05 },
    ],
    text: { content: 'INSANE PLAY!', font: 'Bebas Neue', size: 90, fill: '#00ffcc', stroke: '#ff00ff', strokeWidth: 3, shadow: { color: '#00ffcc', blur: 25, offsetX: 0, offsetY: 0 } },
    textPos: { x: 0.5, y: 0.15 },
    vignette: false,
  },
  news: {
    label: '📰 Breaking News',
    emoji: '📰',
    bg: 'linear-gradient(135deg,#1a0000,#000)',
    filters: [
      { type: 'Contrast', value: 0.3 },
      { type: 'Saturation', value: -0.3 },
    ],
    text: { content: 'BREAKING NEWS', font: 'Anton', size: 72, fill: '#ffcc00', stroke: '#ff0000', strokeWidth: 3, shadow: { color: '#000', blur: 10, offsetX: 2, offsetY: 2 } },
    textPos: { x: 0.5, y: 0.1 },
    vignette: true,
  },
  viral: {
    label: '⚡ Viral Pop',
    emoji: '⚡',
    bg: 'linear-gradient(135deg,#1a0033,#000d1a)',
    filters: [
      { type: 'Saturation', value: 0.5 },
      { type: 'Contrast', value: 0.15 },
      { type: 'Brightness', value: 0.08 },
    ],
    text: { content: 'WATCH THIS!', font: 'Bangers', size: 96, fill: '#ffff00', stroke: '#7c3aed', strokeWidth: 4, shadow: { color: '#ff00ff', blur: 35, offsetX: 0, offsetY: 0 } },
    textPos: { x: 0.5, y: 0.8 },
    vignette: false,
  },
  mrbeast: {
    label: '⚡ MrBeast Style',
    emoji: '🔥',
    bg: 'linear-gradient(135deg,#1a1a00,#2a2a00)',
    filters: [
      { type: 'Saturation', value: 0.3 },
      { type: 'Contrast', value: 0.2 },
      { type: 'Brightness', value: 0.1 },
    ],
    text: { content: 'I DID THIS...', font: 'Impact', size: 88, fill: '#ffff00', stroke: '#000000', strokeWidth: 5, shadow: { color: '#ff8800', blur: 30, offsetX: 4, offsetY: 4 } },
    textPos: { x: 0.5, y: 0.78 },
    vignette: false,
  },
  sports: {
    label: '⚽ Sports Hype',
    emoji: '⚽',
    bg: 'linear-gradient(135deg,#001a00,#002200)',
    filters: [
      { type: 'Saturation', value: 0.35 },
      { type: 'Contrast', value: 0.25 },
    ],
    text: { content: 'EPIC MOMENT!', font: 'Oswald', size: 82, fill: '#ffdd00', stroke: '#ffffff', strokeWidth: 3, shadow: { color: '#000', blur: 12, offsetX: 2, offsetY: 2 } },
    textPos: { x: 0.5, y: 0.82 },
    vignette: false,
  },
}

export function applyThumbnailStyle(fabricCanvas, styleKey) {
  const style = STYLES[styleKey]
  if (!style || !fabricCanvas) return

  // 1. Apply filters to background image
  const bg = fabricCanvas.backgroundImage
  if (bg && bg.filters !== undefined) {
    bg.filters = style.filters.map((f) => {
      if (f.type === 'Contrast') return new fabric.Image.filters.Contrast({ contrast: f.value })
      if (f.type === 'Saturation') return new fabric.Image.filters.Saturation({ saturation: f.value })
      if (f.type === 'Brightness') return new fabric.Image.filters.Brightness({ brightness: f.value })
      return null
    }).filter(Boolean)
    bg.applyFilters()
  }

  // 2. Remove previous style text
  fabricCanvas.getObjects().filter((o) => o._styleText).forEach((o) => fabricCanvas.remove(o))

  // 3. Add styled text
  const t = style.text
  const text = new fabric.IText(t.content, {
    left: fabricCanvas.width * style.textPos.x,
    top: fabricCanvas.height * style.textPos.y,
    originX: 'center', originY: 'center',
    fontFamily: t.font,
    fontSize: t.size,
    fill: t.fill,
    stroke: t.stroke,
    strokeWidth: t.strokeWidth,
    shadow: new fabric.Shadow(t.shadow),
    _styleText: true,
  })
  fabricCanvas.add(text)

  // 4. Vignette overlay
  fabricCanvas.getObjects().filter((o) => o._vignette).forEach((o) => fabricCanvas.remove(o))
  if (style.vignette) {
    const vignette = new fabric.Rect({
      left: 0, top: 0,
      width: fabricCanvas.width, height: fabricCanvas.height,
      fill: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
      selectable: false, evented: false, _vignette: true, opacity: 0.6,
    })
    fabricCanvas.add(vignette)
    fabricCanvas.sendToBack(vignette)
  }

  fabricCanvas.renderAll()
}

export { STYLES }

