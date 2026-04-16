import React from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }) {
  const { theme } = useUIStore()

  const s = {
    wrap: {
      position: 'absolute', bottom: 24, left: 24,
      display: 'flex', alignItems: 'center', gap: 4,
      background: theme.isDark ? 'rgba(13,13,24,0.9)' : 'rgba(255,255,255,0.9)',
      border: `1px solid ${theme.border}`,
      borderRadius: 8, padding: '4px 6px',
      backdropFilter: 'blur(8px)',
      boxShadow: theme.shadowSm,
      zIndex: 10,
    },
    btn: {
      width: 28, height: 28, borderRadius: 5, border: 'none',
      background: 'transparent', color: theme.textSecondary,
      cursor: 'pointer', fontSize: 14, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    },
    label: {
      fontSize: 11, color: theme.textMuted, minWidth: 38,
      textAlign: 'center', fontWeight: 600, userSelect: 'none',
    },
    divider: { width: 1, height: 16, background: theme.border, margin: '0 2px' },
  }

  return (
    <div style={s.wrap}>
      <button style={s.btn} onClick={onZoomOut} title="Zoom out (Ctrl+−)"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.text }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary }}
      >−</button>
      <span style={s.label}>{Math.round(zoom * 100)}%</span>
      <button style={s.btn} onClick={onZoomIn} title="Zoom in (Ctrl+=)"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.text }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary }}
      >+</button>
      <div style={s.divider} />
      <button style={{ ...s.btn, fontSize: 10, width: 'auto', padding: '0 6px' }}
        onClick={onZoomReset} title="Reset zoom (Ctrl+0)"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary }}
      >Fit</button>
    </div>
  )
}
