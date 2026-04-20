import React, { useState, useRef } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { applyThumbnailStyle, STYLES } from '../utils/thumbnailStyles'
import { prefs } from '../utils/prefs'

export default function OneClickStyles() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [hoveredKey, setHoveredKey] = useState(null)
  const hoverTimer = useRef(null)
  const savedState = useRef(null)

  function saveState() {
    if (!fabricCanvas || savedState.current) return
    const bg = fabricCanvas.backgroundImage
    savedState.current = bg ? [...(Array.isArray(bg.filters) ? bg.filters : [])] : null
  }

  function onHover(key) {
    saveState()
    clearTimeout(hoverTimer.current)
    setHoveredKey(key)
    hoverTimer.current = setTimeout(() => {
      const bg = fabricCanvas?.backgroundImage
      if (!bg || bg.filters === undefined) return
      const style = STYLES[key]
      if (!style) return
      // Use fabric from window — safe access
      const F = window.fabric
      if (!F?.Image?.filters) return
      try {
        bg.filters = style.filters.map((f) => {
          if (f.type === 'Contrast') return new F.Image.filters.Contrast({ contrast: f.value })
          if (f.type === 'Saturation') return new F.Image.filters.Saturation({ saturation: f.value })
          if (f.type === 'Brightness') return new F.Image.filters.Brightness({ brightness: f.value })
          return null
        }).filter(Boolean)
        bg.applyFilters()
        fabricCanvas.renderAll()
      } catch (_) {}
    }, 200)
  }

  function onLeave(key) {
    clearTimeout(hoverTimer.current)
    setHoveredKey(null)
    const bg = fabricCanvas?.backgroundImage
    if (!bg) return
    try {
      bg.filters = savedState.current || []
      bg.applyFilters()
      fabricCanvas.renderAll()
    } catch (_) {}
    savedState.current = null
  }

  function handleApply(key) {
    savedState.current = null // commit
    applyThumbnailStyle(fabricCanvas, key)
    prefs.setLastTemplate(key)
    window.showToast?.(`${STYLES[key].label} applied`, 'success')
  }

  const s = {
    wrap: { display: 'flex', flexDirection: 'column', gap: 6 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 4 },
    desc: { fontSize: 11, color: theme.textSecondary, marginBottom: 8, lineHeight: 1.5 },
    btn: (key) => ({
      width: '100%', padding: '11px 14px', borderRadius: 8, cursor: 'pointer',
      border: `1px solid rgba(255,255,255,0.08)`,
      background: STYLE_BG[key] || theme.bgTertiary,
      color: '#fff', fontSize: 13, fontWeight: 700,
      textAlign: 'left', transition: 'transform 0.1s, box-shadow 0.15s',
      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      position: 'relative',
    }),
  }

  const STYLE_BG = {
    dramatic: 'linear-gradient(135deg,#2d0000,#1a0000)',
    gaming: 'linear-gradient(135deg,#001a33,#000d1a)',
    news: 'linear-gradient(135deg,#1a0000,#111)',
    viral: 'linear-gradient(135deg,#1a0033,#000d1a)',
    mrbeast: 'linear-gradient(135deg,#2a2a00,#1a1a00)',
    sports: 'linear-gradient(135deg,#002200,#001a00)',
  }

  return (
    <div style={s.wrap}>
      <div style={s.title}>One-Click Styles</div>
      <div style={s.desc}>Instantly apply color grading, text and effects.</div>
      {Object.entries(STYLES).map(([key, style]) => (
        <button key={key} style={{ ...s.btn(key), outline: hoveredKey === key ? `2px solid rgba(124,58,237,0.5)` : 'none' }}
          onClick={() => handleApply(key)}
          onMouseEnter={() => onHover(key)}
          onMouseLeave={() => onLeave(key)}
        >
          {hoveredKey === key && <span style={{ position: 'absolute', top: 4, right: 6, fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>PREVIEW</span>}
          {style.label}
        </button>
      ))}
    </div>
  )
}
