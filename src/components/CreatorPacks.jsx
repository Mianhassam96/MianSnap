import React from 'react'
import { fabric } from 'fabric'
import useStore from '../store/useStore'

const PACKS = [
  {
    id: 'gaming',
    label: '🎮 Gaming',
    bg: 'linear-gradient(135deg,#1a0533,#0d1b2a)',
    textColor: '#00ffcc',
    stroke: '#ff00ff',
    font: 'Impact',
    fontSize: 72,
    shadow: { color: '#ff00ff', blur: 20, offsetX: 3, offsetY: 3 },
  },
  {
    id: 'sports',
    label: '⚽ Sports',
    bg: 'linear-gradient(135deg,#0a2e0a,#1a3a00)',
    textColor: '#ffdd00',
    stroke: '#ffffff',
    font: 'Arial Black',
    fontSize: 68,
    shadow: { color: '#000', blur: 10, offsetX: 2, offsetY: 2 },
  },
  {
    id: 'drama',
    label: '🎥 YouTube Drama',
    bg: 'linear-gradient(135deg,#1a0000,#2d0000)',
    textColor: '#ffffff',
    stroke: '#ff3300',
    font: 'Georgia',
    fontSize: 64,
    shadow: { color: '#ff0000', blur: 25, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'business',
    label: '💼 Business',
    bg: 'linear-gradient(135deg,#0a0a1a,#1a1a2e)',
    textColor: '#ffffff',
    stroke: '#4488ff',
    font: 'Segoe UI',
    fontSize: 60,
    shadow: { color: '#4488ff', blur: 15, offsetX: 0, offsetY: 0 },
  },
  {
    id: 'news',
    label: '📰 Breaking News',
    bg: 'linear-gradient(135deg,#1a0000,#000)',
    textColor: '#ffcc00',
    stroke: '#ff0000',
    font: 'Arial',
    fontSize: 66,
    shadow: { color: '#000', blur: 8, offsetX: 2, offsetY: 2 },
  },
  {
    id: 'mrbeast',
    label: '⚡ MrBeast Style',
    bg: 'linear-gradient(135deg,#1a1a00,#2a2a00)',
    textColor: '#ffff00',
    stroke: '#000000',
    font: 'Impact',
    fontSize: 80,
    shadow: { color: '#ff8800', blur: 30, offsetX: 4, offsetY: 4 },
  },
]

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  pack: {
    padding: '10px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid #222',
    transition: 'transform 0.1s, border-color 0.15s',
    userSelect: 'none',
  },
}

export default function CreatorPacks() {
  const { fabricCanvas, selectedFrame } = useStore()

  function applyPack(pack) {
    if (!fabricCanvas) return

    fabricCanvas.setBackgroundColor(null, () => {})

    if (selectedFrame) {
      fabric.Image.fromURL(selectedFrame.dataUrl, (img) => {
        img.scaleToWidth(fabricCanvas.width)
        img.scaleToHeight(fabricCanvas.height)
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
      })
    }

    const existing = fabricCanvas.getObjects().filter((o) => o._packText)
    existing.forEach((o) => fabricCanvas.remove(o))

    const text = new fabric.IText('YOUR TITLE HERE', {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height * 0.75,
      originX: 'center',
      originY: 'center',
      fontFamily: pack.font,
      fontSize: pack.fontSize,
      fill: pack.textColor,
      stroke: pack.stroke,
      strokeWidth: 3,
      shadow: new fabric.Shadow(pack.shadow),
      _packText: true,
    })

    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    fabricCanvas.renderAll()
  }

  return (
    <div style={styles.wrap}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Click a pack to apply style</div>
      {PACKS.map((pack) => (
        <div
          key={pack.id}
          style={{ ...styles.pack, background: pack.bg, color: pack.textColor }}
          onClick={() => applyPack(pack)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = '#444' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#222' }}
        >
          {pack.label}
        </div>
      ))}
    </div>
  )
}
