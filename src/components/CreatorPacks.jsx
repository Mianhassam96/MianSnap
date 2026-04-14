import React from 'react'
import { fabric } from '../lib/fabric'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import useUIStore from '../store/useUIStore'

const PACKS = [
  { id: 'gaming', label: '🎮 Gaming', bg: 'linear-gradient(135deg,#1a0533,#0d1b2a)', textColor: '#00ffcc', stroke: '#ff00ff', font: 'Impact', fontSize: 72, shadow: { color: '#ff00ff', blur: 20, offsetX: 3, offsetY: 3 } },
  { id: 'sports', label: '⚽ Sports', bg: 'linear-gradient(135deg,#0a2e0a,#1a3a00)', textColor: '#ffdd00', stroke: '#ffffff', font: 'Arial Black', fontSize: 68, shadow: { color: '#000', blur: 10, offsetX: 2, offsetY: 2 } },
  { id: 'drama', label: '🎥 YouTube Drama', bg: 'linear-gradient(135deg,#1a0000,#2d0000)', textColor: '#ffffff', stroke: '#ff3300', font: 'Georgia', fontSize: 64, shadow: { color: '#ff0000', blur: 25, offsetX: 0, offsetY: 0 } },
  { id: 'business', label: '💼 Business', bg: 'linear-gradient(135deg,#0a0a1a,#1a1a2e)', textColor: '#ffffff', stroke: '#4488ff', font: 'Segoe UI', fontSize: 60, shadow: { color: '#4488ff', blur: 15, offsetX: 0, offsetY: 0 } },
  { id: 'news', label: '📰 Breaking News', bg: 'linear-gradient(135deg,#1a0000,#000)', textColor: '#ffcc00', stroke: '#ff0000', font: 'Arial', fontSize: 66, shadow: { color: '#000', blur: 8, offsetX: 2, offsetY: 2 } },
  { id: 'mrbeast', label: '⚡ MrBeast Style', bg: 'linear-gradient(135deg,#1a1a00,#2a2a00)', textColor: '#ffff00', stroke: '#000000', font: 'Impact', fontSize: 80, shadow: { color: '#ff8800', blur: 30, offsetX: 4, offsetY: 4 } },
  { id: 'reaction', label: '😱 Dramatic Reaction', bg: 'linear-gradient(135deg,#200020,#100010)', textColor: '#ff44ff', stroke: '#ffffff', font: 'Impact', fontSize: 76, shadow: { color: '#ff00ff', blur: 28, offsetX: 0, offsetY: 0 } },
  { id: 'gaming2', label: '🔥 Gaming Highlight', bg: 'linear-gradient(135deg,#1a0800,#2a1000)', textColor: '#ff6600', stroke: '#ffff00', font: 'Impact', fontSize: 74, shadow: { color: '#ff3300', blur: 22, offsetX: 3, offsetY: 3 } },
]

export default function CreatorPacks() {
  const { fabricCanvas } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const { theme } = useUIStore()

  function applyPack(pack) {
    if (!fabricCanvas) return
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
      originX: 'center', originY: 'center',
      fontFamily: pack.font, fontSize: pack.fontSize,
      fill: pack.textColor, stroke: pack.stroke, strokeWidth: 3,
      shadow: new fabric.Shadow(pack.shadow),
      _packText: true,
    })
    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    fabricCanvas.renderAll()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
        Creator Packs
      </div>
      {PACKS.map((pack) => (
        <div key={pack.id}
          style={{
            padding: '9px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            border: `1px solid rgba(255,255,255,0.08)`, background: pack.bg, color: pack.textColor,
            transition: 'transform 0.1s, box-shadow 0.15s',
          }}
          onClick={() => applyPack(pack)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {pack.label}
        </div>
      ))}
    </div>
  )
}

