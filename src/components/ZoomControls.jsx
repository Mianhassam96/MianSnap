import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }) {
  const { theme } = useUIStore()
  const [resetFlash, setResetFlash] = useState(false)

  function handleReset() {
    onZoomReset()
    setResetFlash(true)
    setTimeout(() => setResetFlash(false), 600)
  }

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
      fontSize: 11, minWidth: 38,
      textAlign: 'center', fontWeight: 700, userSelect: 'none',
      color: zoom !== 1 ? theme.accent : theme.textMuted,
      transition: 'color 0.2s',
    },
    divider: { width: 1, height: 16, background: theme.border, margin: '0 2px' },
    resetBtn: {
      fontSize: 10, height: 28, padding: '0 8px', borderRadius: 5, border: 'none',
      background: resetFlash ? theme.accentGlow : 'transparent',
      color: resetFlash ? theme.accent : theme.textSecondary,
      cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap',
    },
  }

  return (
    <div style={s.wrap}>
      <button style={s.btn} onClick={onZoomOut} title="Zoom out (Ctrl+−)"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.text }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary }}
      >−</button>
      <span style={s.label} title="Current zoom level">{Math.round(zoom * 100)}%</span>
      <button style={s.btn} onClick={onZoomIn} title="Zoom in (Ctrl+=)"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.text }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary }}
      >+</button>
      <div style={s.divider} />
      <button style={s.resetBtn} onClick={handleReset} title="Reset view — 100% centered (Ctrl+0)"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.accent }}
        onMouseLeave={(e) => { if (!resetFlash) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = theme.textSecondary } }}
      >Reset View</button>
    </div>
  )
}
