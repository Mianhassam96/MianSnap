import React from 'react'
import { fabric } from 'fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { applySmartTypography } from '../utils/smartTypography'
import CreatorPacks from './CreatorPacks'
import SafeZoneOverlay from './SafeZoneOverlay'

const TOOLS = [
  { id: 'text', icon: '𝐓', label: 'Text' },
  { id: 'shapes', icon: '◻', label: 'Shapes' },
  { id: 'presets', icon: '🎨', label: 'Presets' },
  { id: 'safezone', icon: '📐', label: 'Safe Zone' },
]

const FONTS = ['Impact', 'Arial Black', 'Georgia', 'Segoe UI', 'Verdana', 'Courier New']

export default function LeftSidebar() {
  const { theme, activeLeftPanel, setActiveLeftPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()

  function addText(style = {}) {
    if (!fabricCanvas) return
    const text = new fabric.IText('Your Text Here', {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height / 2,
      originX: 'center', originY: 'center',
      fontFamily: style.font || 'Impact',
      fontSize: style.size || 64,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      shadow: { color: 'rgba(0,0,0,0.8)', blur: 12, offsetX: 2, offsetY: 2 },
    })
    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    fabricCanvas.renderAll()
    applySmartTypography(text, fabricCanvas)
  }

  function addShape(type) {
    if (!fabricCanvas) return
    const cx = fabricCanvas.width / 2
    const cy = fabricCanvas.height / 2
    let shape

    const shapeMap = {
      rect: new fabric.Rect({ left: cx - 80, top: cy - 40, width: 160, height: 80, fill: 'rgba(124,58,237,0.7)', rx: 8, ry: 8 }),
      circle: new fabric.Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: 'rgba(79,70,229,0.7)' }),
      triangle: new fabric.Triangle({ left: cx - 40, top: cy - 40, width: 80, height: 80, fill: '#f87171' }),
      line: new fabric.Line([cx - 80, cy, cx + 80, cy], { stroke: '#ffffff', strokeWidth: 4 }),
      arrow: new fabric.Triangle({ left: cx - 30, top: cy - 40, width: 60, height: 80, fill: '#facc15', angle: 90 }),
    }
    shape = shapeMap[type]
    if (shape) {
      fabricCanvas.add(shape)
      fabricCanvas.setActiveObject(shape)
      fabricCanvas.renderAll()
    }
  }

  const s = {
    sidebar: {
      width: 220, background: theme.bgSecondary, borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    },
    tabs: { display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 },
    tab: {
      flex: 1, padding: '10px 4px', fontSize: 10, textAlign: 'center',
      cursor: 'pointer', color: theme.textMuted, border: 'none', background: 'none',
      borderBottom: '2px solid transparent', transition: 'all 0.15s', lineHeight: 1.3,
    },
    tabActive: { color: theme.accent, borderBottom: `2px solid ${theme.accent}` },
    content: { flex: 1, overflowY: 'auto', padding: 12 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    btn: {
      width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textSecondary, fontSize: 12,
      cursor: 'pointer', textAlign: 'left', marginBottom: 4, transition: 'all 0.15s',
    },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
    shapeBtn: {
      padding: '12px 8px', borderRadius: 6, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text, fontSize: 18,
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
    },
  }

  return (
    <div style={s.sidebar}>
      <div style={s.tabs}>
        {TOOLS.map((t) => (
          <button key={t.id}
            style={{ ...s.tab, ...(activeLeftPanel === t.id ? s.tabActive : {}) }}
            onClick={() => setActiveLeftPanel(t.id)}
          >
            <div style={{ fontSize: 14 }}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      <div style={s.content}>
        {activeLeftPanel === 'text' && (
          <>
            <div style={s.section}>
              <div style={s.sectionTitle}>Add Text</div>
              <button style={s.btn} onClick={() => addText({ size: 80, font: 'Impact' })}>＋ Headline (Impact)</button>
              <button style={s.btn} onClick={() => addText({ size: 48, font: 'Arial Black' })}>＋ Subheading</button>
              <button style={s.btn} onClick={() => addText({ size: 28, font: 'Segoe UI' })}>＋ Body Text</button>
            </div>
            <div style={s.section}>
              <div style={s.sectionTitle}>Font Presets</div>
              {FONTS.map((f) => (
                <button key={f} style={{ ...s.btn, fontFamily: f }} onClick={() => addText({ font: f })}>
                  {f}
                </button>
              ))}
            </div>
          </>
        )}

        {activeLeftPanel === 'shapes' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Shapes</div>
            <div style={s.grid2}>
              {[
                { type: 'rect', icon: '▭', label: 'Box' },
                { type: 'circle', icon: '●', label: 'Circle' },
                { type: 'triangle', icon: '▲', label: 'Triangle' },
                { type: 'line', icon: '—', label: 'Line' },
                { type: 'arrow', icon: '▶', label: 'Arrow' },
              ].map((sh) => (
                <button key={sh.type} style={s.shapeBtn} onClick={() => addShape(sh.type)}>
                  <div>{sh.icon}</div>
                  <div style={{ fontSize: 10, marginTop: 4, color: theme.textMuted }}>{sh.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeLeftPanel === 'presets' && <CreatorPacks />}
        {activeLeftPanel === 'safezone' && <SafeZoneOverlay />}
      </div>
    </div>
  )
}
