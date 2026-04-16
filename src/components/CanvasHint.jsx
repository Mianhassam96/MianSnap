import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

const HINT_KEY = 'miansnap_canvas_hint_done'

const STEPS = [
  { icon: '✏️', text: 'Add text from the left sidebar' },
  { icon: '⚡', text: 'Hit "Make Viral" to auto-enhance' },
  { icon: '⬇', text: 'Export when ready' },
]

export default function CanvasHint() {
  const { theme } = useUIStore()
  const { videoUrl } = useVideoStore()
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Only show once, and only after a frame is loaded
    if (localStorage.getItem(HINT_KEY)) return
    if (!videoUrl) return
    // Small delay so it appears after frame loads
    const show = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(show)
  }, [videoUrl])

  useEffect(() => {
    if (!visible) return
    // Start fade-out after 4s
    const fade = setTimeout(() => setFading(true), 4000)
    // Remove after fade completes
    const hide = setTimeout(() => {
      setVisible(false)
      localStorage.setItem(HINT_KEY, '1')
    }, 4700)
    return () => { clearTimeout(fade); clearTimeout(hide) }
  }, [visible])

  if (!visible) return null

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.7s ease',
    }}>
      <div style={{
        background: theme.isDark ? 'rgba(10,10,20,0.88)' : 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.border}`,
        borderRadius: 14, padding: '20px 28px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', gap: 12,
        animation: 'scaleIn 0.3s ease',
        minWidth: 260,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: theme.accent, textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>
          Quick Start
        </div>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>{s.icon}</div>
            <span style={{ fontSize: 13, color: theme.text, fontWeight: 500 }}>{s.text}</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: theme.textMuted, textAlign: 'center', marginTop: 4 }}>
          Fades automatically
        </div>
      </div>
    </div>
  )
}
