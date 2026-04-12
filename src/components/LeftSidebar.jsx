import React from 'react'
import { fabric } from 'fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { applySmartTypography } from '../utils/smartTypography'
import CreatorPacks from './CreatorPacks'
import SafeZoneOverlay from './SafeZoneOverlay'
import { removeBackground } from '../utils/bgRemoval'

const TOOLS = [
  { id: 'text', icon: '𝐓', label: 'Text' },
  { id: 'shapes', icon: '◻', label: 'Shapes' },
  { id: 'presets', icon: '🎨', label: 'Packs' },
  { id: 'safezone', icon: '📐', label: 'Zones' },
]

const FONTS = ['Impact', 'Arial Black', 'Georgia', 'Segoe UI', 'Verdana', 'Courier New']

export default function LeftSidebar() {
  const { theme, activeLeftPanel, setActiveLeftPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [aiStatus, setAiStatus] = React.useState('')

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
    const shapeMap = {
      rect: new fabric.Rect({ left: cx - 80, top: cy - 40, width: 160, height: 80, fill: 'rgba(124,58,237,0.75)', rx: 8, ry: 8 }),
      circle: new fabric.Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: 'rgba(79,70,229,0.75)' }),
      triangle: new fabric.Triangle({ left: cx - 40, top: cy - 40, width: 80, height: 80, fill: '#f87171' }),
      line: new fabric.Line([cx - 80, cy, cx + 80, cy], { stroke: '#7c3aed', strokeWidth: 5 }),
      arrow: new fabric.Triangle({ left: cx - 30, top: cy - 40, width: 60, height: 80, fill: '#facc15', angle: 90 }),
    }
    const shape = shapeMap[type]
    if (shape) {
      fabricCanvas.add(shape)
      fabricCanvas.setActiveObject(shape)
      fabricCanvas.renderAll()
    }
  }

  async function handleBgRemoval() {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (!active || active.type !== 'image') {
      alert('Select an image layer on the canvas first')
      return
    }
    const dataUrl = active.toDataURL()
    try {
      const result = await removeBackground(dataUrl, (msg) => setAiStatus(msg))
      fabric.Image.fromURL(result, (img) => {
        img.set({ left: active.left, top: active.top, scaleX: active.scaleX, scaleY: active.scaleY })
        fabricCanvas.remove(active)
        fabricCanvas.add(img)
        fabricCanvas.setActiveObject(img)
        fabricCanvas.renderAll()
        setAiStatus('')
      })
    } catch {
      setAiStatus('AI model failed. Check connection.')
    }
  }

  const s = {
    sidebar: {
      width: 224, background: theme.bgSecondary, borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
      boxShadow: theme.isDark ? 'none' : '2px 0 12px rgba(100,80,200,0.06)',
    },
    tabs: { display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, background: theme.bgTertiary },
    tab: (active) => ({
      flex: 1, padding: '10px 4px', fontSize: 10, textAlign: 'center',
      cursor: 'pointer', border: 'none', lineHeight: 1.4, transition: 'all 0.15s',
      background: active ? theme.bgSecondary : 'transparent',
      color: active ? theme.accent : theme.textMuted,
      borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`,
      fontWeight: active ? 600 : 400,
    }),
    content: { flex: 1, overflowY: 'auto', padding: 12 },
    sectionTitle: {
      fontSize: 10, color: theme.textMuted, textTransform: 'uppercase',
      letterSpacing: 1, marginBottom: 8, fontWeight: 600,
    },
    section: { marginBottom: 16 },
    textBtn: (variant) => ({
      width: '100%', padding: '9px 12px', borderRadius: 7,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text,
      fontSize: variant === 'h1' ? 14 : variant === 'h2' ? 12 : 11,
      fontWeight: variant === 'h1' ? 700 : variant === 'h2' ? 600 : 400,
      cursor: 'pointer', textAlign: 'left', marginBottom: 5,
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8,
    }),
    fontBtn: (font) => ({
      width: '100%', padding: '7px 12px', borderRadius: 6,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text,
      fontSize: 12, fontFamily: font, cursor: 'pointer',
      textAlign: 'left', marginBottom: 4, transition: 'all 0.15s',
    }),
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
    shapeBtn: {
      padding: '14px 8px', borderRadius: 8, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text, fontSize: 20,
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
    },
    aiBtn: {
      width: '100%', padding: '9px 12px', borderRadius: 7, border: 'none',
      background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      marginTop: 8, transition: 'opacity 0.15s',
    },
    aiStatus: { fontSize: 10, color: theme.accent, padding: '4px 0', textAlign: 'center' },
  }

  const hoverStyle = (e, enter) => {
    e.currentTarget.style.background = enter ? theme.accentGlow : theme.bgTertiary
    e.currentTarget.style.borderColor = enter ? theme.borderHover : theme.border
  }

  return (
    <div style={s.sidebar}>
      <div style={s.tabs}>
        {TOOLS.map((t) => (
          <button key={t.id} style={s.tab(activeLeftPanel === t.id)} onClick={() => setActiveLeftPanel(t.id)}>
            <div style={{ fontSize: 15, marginBottom: 2 }}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      <div style={s.content}>
        {activeLeftPanel === 'text' && (
          <>
            <div style={s.section}>
              <div style={s.sectionTitle}>Add Text</div>
              {[
                { label: '+ Headline', size: 80, font: 'Impact', variant: 'h1' },
                { label: '+ Subheading', size: 48, font: 'Arial Black', variant: 'h2' },
                { label: '+ Body Text', size: 28, font: 'Segoe UI', variant: 'body' },
              ].map((t) => (
                <button key={t.label} style={s.textBtn(t.variant)}
                  onClick={() => addText({ size: t.size, font: t.font })}
                  onMouseEnter={(e) => hoverStyle(e, true)}
                  onMouseLeave={(e) => hoverStyle(e, false)}
                >
                  <span style={{ fontSize: t.variant === 'h1' ? 16 : t.variant === 'h2' ? 13 : 11, fontFamily: t.font }}>A</span>
                  {t.label}
                </button>
              ))}
            </div>
            <div style={s.section}>
              <div style={s.sectionTitle}>Font Styles</div>
              {FONTS.map((f) => (
                <button key={f} style={s.fontBtn(f)} onClick={() => addText({ font: f })}
                  onMouseEnter={(e) => hoverStyle(e, true)}
                  onMouseLeave={(e) => hoverStyle(e, false)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div style={s.section}>
              <div style={s.sectionTitle}>AI Tools</div>
              <button style={s.aiBtn} onClick={handleBgRemoval}>🤖 Remove Background (AI)</button>
              {aiStatus && <div style={s.aiStatus}>{aiStatus}</div>}
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
                <button key={sh.type} style={s.shapeBtn} onClick={() => addShape(sh.type)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentGlow; e.currentTarget.style.borderColor = theme.accent }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.borderColor = theme.border }}
                >
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
