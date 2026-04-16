import React, { useState } from 'react'
import { fabric } from '../lib/fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

// Basic shapes
const BASIC_SHAPES = [
  { id: 'rect',     icon: '▭', label: 'Box' },
  { id: 'roundrect',icon: '▢', label: 'Rounded' },
  { id: 'circle',   icon: '●', label: 'Circle' },
  { id: 'triangle', icon: '▲', label: 'Triangle' },
  { id: 'line',     icon: '—', label: 'Line' },
  { id: 'arrow',    icon: '➤', label: 'Arrow' },
  { id: 'star',     icon: '★', label: 'Star' },
  { id: 'speech',   icon: '💬', label: 'Speech' },
]

// Pre-styled smart shapes for thumbnails
const SMART_SHAPES = [
  {
    id: 'news_banner',
    label: '🔴 Breaking News',
    desc: 'Red news banner',
    build: (cx, cy) => new fabric.Rect({
      left: cx - 200, top: cy + 200, width: 400, height: 60,
      fill: '#cc0000', rx: 4, ry: 4,
    }),
    text: { content: 'BREAKING NEWS', font: 'Anton', size: 32, fill: '#ffffff', stroke: null },
  },
  {
    id: 'highlight_arrow',
    label: '⚡ Glow Arrow',
    desc: 'Neon pointing arrow',
    build: (cx, cy) => new fabric.Triangle({
      left: cx - 30, top: cy - 40, width: 60, height: 80,
      fill: '#facc15', angle: 90,
      shadow: new fabric.Shadow({ color: '#facc15', blur: 20, offsetX: 0, offsetY: 0 }),
    }),
  },
  {
    id: 'yt_textbox',
    label: '🟨 YT Text Box',
    desc: 'YouTube-style caption',
    build: (cx, cy) => new fabric.Rect({
      left: cx - 160, top: cy + 240, width: 320, height: 52,
      fill: 'rgba(0,0,0,0.75)', rx: 6, ry: 6,
    }),
    text: { content: 'YOUR TITLE HERE', font: 'Bebas Neue', size: 36, fill: '#ffffff', stroke: null },
  },
  {
    id: 'highlight_box',
    label: '🟣 Highlight Box',
    desc: 'Accent highlight',
    build: (cx, cy) => new fabric.Rect({
      left: cx - 120, top: cy - 30, width: 240, height: 60,
      fill: 'rgba(124,58,237,0.8)', rx: 8, ry: 8,
      stroke: '#a78bfa', strokeWidth: 2,
    }),
  },
  {
    id: 'burst',
    label: '💥 Burst',
    desc: 'Attention burst',
    build: (cx, cy) => buildStar(cx, cy, 8, 80, 40),
  },
]

function buildStar(cx, cy, points, outerR, innerR) {
  const pts = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (i * Math.PI) / points - Math.PI / 2
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return new fabric.Polygon(pts, {
    fill: '#facc15',
    shadow: new fabric.Shadow({ color: '#f59e0b', blur: 16, offsetX: 0, offsetY: 0 }),
  })
}

export default function ShapesPanel() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [radius, setRadius] = useState(12)

  function addBasicShape(id) {
    if (!fabricCanvas) return
    const cx = fabricCanvas.width / 2
    const cy = fabricCanvas.height / 2

    let shape
    switch (id) {
      case 'rect':
        shape = new fabric.Rect({ left: cx-80, top: cy-40, width: 160, height: 80, fill: 'rgba(124,58,237,0.8)', rx: 0, ry: 0 })
        break
      case 'roundrect':
        shape = new fabric.Rect({ left: cx-80, top: cy-40, width: 160, height: 80, fill: 'rgba(124,58,237,0.8)', rx: radius, ry: radius })
        break
      case 'circle':
        shape = new fabric.Circle({ left: cx-50, top: cy-50, radius: 50, fill: 'rgba(79,70,229,0.8)' })
        break
      case 'triangle':
        shape = new fabric.Triangle({ left: cx-40, top: cy-40, width: 80, height: 80, fill: '#f87171' })
        break
      case 'line':
        shape = new fabric.Line([cx-80, cy, cx+80, cy], { stroke: '#7c3aed', strokeWidth: 5 })
        break
      case 'arrow':
        shape = new fabric.Triangle({ left: cx-30, top: cy-40, width: 60, height: 80, fill: '#facc15', angle: 90 })
        break
      case 'star':
        shape = buildStar(cx, cy, 5, 60, 25)
        break
      case 'speech': {
        const group = new fabric.Rect({ left: cx-80, top: cy-40, width: 160, height: 80, fill: '#ffffff', rx: 12, ry: 12 })
        fabricCanvas.add(group)
        fabricCanvas.setActiveObject(group)
        fabricCanvas.renderAll()
        return
      }
      default: return
    }
    fabricCanvas.add(shape)
    fabricCanvas.setActiveObject(shape)
    fabricCanvas.renderAll()
  }

  function addSmartShape(smart) {
    if (!fabricCanvas) return
    const cx = fabricCanvas.width / 2
    const cy = fabricCanvas.height / 2
    const shape = smart.build(cx, cy)
    fabricCanvas.add(shape)

    if (smart.text) {
      const t = new fabric.IText(smart.text.content, {
        left: shape.left + (shape.width || 0) / 2,
        top: shape.top + (shape.height || 80) / 2,
        originX: 'center', originY: 'center',
        fontFamily: smart.text.font,
        fontSize: smart.text.size,
        fill: smart.text.fill,
        stroke: smart.text.stroke,
        strokeWidth: smart.text.stroke ? 2 : 0,
      })
      fabricCanvas.add(t)
    }

    fabricCanvas.setActiveObject(shape)
    fabricCanvas.renderAll()
    window.showToast?.(`${smart.label} added`, 'success')
  }

  const s = {
    section: { marginBottom: 16 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 },
    shapeBtn: {
      padding: '12px 4px', borderRadius: 7, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text, fontSize: 18,
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
    },
    shapeLabel: { fontSize: 9, color: theme.textMuted, marginTop: 3 },
    smartBtn: {
      width: '100%', padding: '10px 12px', borderRadius: 8,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text,
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      textAlign: 'left', marginBottom: 5,
      transition: 'all 0.15s',
      display: 'flex', flexDirection: 'column', gap: 2,
    },
    smartDesc: { fontSize: 10, color: theme.textMuted, fontWeight: 400 },
    sliderRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
    sliderLabel: { fontSize: 10, color: theme.textMuted, width: 60, flexShrink: 0 },
    slider: { flex: 1, accentColor: theme.accent },
    sliderVal: { fontSize: 10, color: theme.textSecondary, width: 24, textAlign: 'right' },
  }

  const hoverShape = (e, on) => {
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
    e.currentTarget.style.borderColor = on ? theme.accent : theme.border
  }

  return (
    <div>
      {/* Basic shapes */}
      <div style={s.section}>
        <div style={s.title}>Basic Shapes</div>
        <div style={s.grid}>
          {BASIC_SHAPES.map(sh => (
            <button key={sh.id} style={s.shapeBtn}
              onClick={() => addBasicShape(sh.id)}
              onMouseEnter={(e) => hoverShape(e, true)}
              onMouseLeave={(e) => hoverShape(e, false)}
            >
              <div>{sh.icon}</div>
              <div style={s.shapeLabel}>{sh.label}</div>
            </button>
          ))}
        </div>

        {/* Corner radius for rounded rect */}
        <div style={{ ...s.sliderRow, marginTop: 8 }}>
          <span style={s.sliderLabel}>Radius</span>
          <input type="range" style={s.slider} min={0} max={60} value={radius}
            onChange={(e) => setRadius(+e.target.value)} />
          <span style={s.sliderVal}>{radius}</span>
        </div>
      </div>

      {/* Smart shapes */}
      <div style={s.section}>
        <div style={s.title}>⚡ Smart Shapes</div>
        {SMART_SHAPES.map(sm => (
          <button key={sm.id} style={s.smartBtn}
            onClick={() => addSmartShape(sm)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
          >
            <span>{sm.label}</span>
            <span style={s.smartDesc}>{sm.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
