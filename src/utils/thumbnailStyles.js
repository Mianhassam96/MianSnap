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
  horror: {
    label: '👻 Horror / Scary',
    emoji: '👻',
    bg: 'linear-gradient(135deg,#0a0000,#1a0000)',
    filters: [
      { type: 'Contrast', value: 0.35 },
      { type: 'Saturation', value: -0.5 },
      { type: 'Brightness', value: -0.1 },
    ],
    text: { content: 'SOMETHING IS WRONG...', font: 'Permanent Marker', size: 60, fill: '#ff0000', stroke: '#000000', strokeWidth: 3, shadow: { color: '#ff0000', blur: 40, offsetX: 0, offsetY: 0 } },
    textPos: { x: 0.5, y: 0.85 },
    vignette: true,
  },
  tutorial: {
    label: '📚 Tutorial / How-To',
    emoji: '📚',
    bg: 'linear-gradient(135deg,#001433,#000d22)',
    filters: [
      { type: 'Brightness', value: 0.08 },
      { type: 'Contrast', value: 0.1 },
      { type: 'Saturation', value: 0.15 },
    ],
    text: { content: 'HOW TO DO THIS', font: 'Poppins', size: 72, fill: '#ffffff', stroke: '#0ea5e9', strokeWidth: 2, shadow: { color: '#0ea5e9', blur: 20, offsetX: 0, offsetY: 0 } },
    textPos: { x: 0.5, y: 0.12 },
    vignette: false,
  },
  money: {
    label: '💰 Money / Finance',
    emoji: '💰',
    bg: 'linear-gradient(135deg,#0a1a00,#001a00)',
    filters: [
      { type: 'Saturation', value: 0.2 },
      { type: 'Contrast', value: 0.15 },
      { type: 'Brightness', value: 0.05 },
    ],
    text: { content: '$10,000 IN 30 DAYS', font: 'Montserrat', size: 70, fill: '#00ff88', stroke: '#000000', strokeWidth: 3, shadow: { color: '#00ff88', blur: 25, offsetX: 0, offsetY: 0 } },
    textPos: { x: 0.5, y: 0.8 },
    vignette: false,
  },
  minimal: {
    label: '🤍 Clean Minimal',
    emoji: '🤍',
    bg: 'linear-gradient(135deg,#111,#1a1a1a)',
    filters: [
      { type: 'Contrast', value: 0.1 },
      { type: 'Brightness', value: 0.05 },
    ],
    text: { content: 'WATCH THIS', font: 'Raleway', size: 68, fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, shadow: { color: 'rgba(0,0,0,0.5)', blur: 8, offsetX: 0, offsetY: 2 } },
    textPos: { x: 0.5, y: 0.85 },
    vignette: false,
  },
}

export function applyThumbnailStyle(fabricCanvas, styleKey) {
  const style = STYLES[styleKey]
  if (!style || !fabricCanvas) return

  try {
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
        fill: new fabric.Gradient({
          type: 'radial',
          coords: {
            r1: 0, r2: fabricCanvas.width * 0.75,
            x1: fabricCanvas.width / 2, y1: fabricCanvas.height / 2,
            x2: fabricCanvas.width / 2, y2: fabricCanvas.height / 2,
          },
          colorStops: [
            { offset: 0, color: 'rgba(0,0,0,0)' },
            { offset: 0.6, color: 'rgba(0,0,0,0)' },
            { offset: 1, color: 'rgba(0,0,0,0.65)' },
          ],
        }),
        selectable: false, evented: false, _vignette: true, opacity: 0.9,
      })
      fabricCanvas.add(vignette)
      fabricCanvas.sendToBack(vignette)
    }

    fabricCanvas.renderAll()
  } catch (err) {
    console.warn('[thumbnailStyles] applyThumbnailStyle failed:', err)
  }
}

export { STYLES }

