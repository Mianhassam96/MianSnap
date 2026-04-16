import React from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { applyThumbnailStyle, STYLES } from '../utils/thumbnailStyles'
import { prefs } from '../utils/prefs'

export default function OneClickStyles() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()

  function handleApply(key) {
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
        <button key={key} style={s.btn(key)}
          onClick={() => handleApply(key)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          {style.label}
        </button>
      ))}
    </div>
  )
}
