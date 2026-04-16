import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

const NUDGE_KEY = 'miansnap_nudge_done'

export default function NextStepNudge({ onMakeViral }) {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(NUDGE_KEY)) return
    if (!fabricCanvas) return

    // Show nudge after first object is added
    const onAdded = () => {
      if (dismissed) return
      setTimeout(() => setVisible(true), 1200)
      fabricCanvas.off('object:added', onAdded)
    }
    fabricCanvas.on('object:added', onAdded)
    return () => fabricCanvas.off('object:added', onAdded)
  }, [fabricCanvas, dismissed])

  function dismiss() {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem(NUDGE_KEY, '1')
  }

  function handleMakeViral() {
    dismiss()
    onMakeViral?.()
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'absolute', bottom: 80, right: 24, zIndex: 11,
      background: theme.isDark ? 'rgba(13,13,24,0.96)' : 'rgba(255,255,255,0.96)',
      border: `1px solid ${theme.borderHover}`,
      borderRadius: 12, padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      maxWidth: 220,
      animation: 'fadeInDown 0.3s ease',
    }}>
      {/* Arrow pointing to FAB */}
      <div style={{
        position: 'absolute', bottom: -8, right: 28,
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `8px solid ${theme.borderHover}`,
      }} />
      <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 8 }}>
        ✨ Looking good! Next step:
      </div>
      <button
        onClick={handleMakeViral}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 3px 14px rgba(239,68,68,0.4)',
          transition: 'transform 0.15s',
          marginBottom: 6,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        ⚡ Make this thumbnail viral
      </button>
      <button
        onClick={dismiss}
        style={{
          width: '100%', padding: '5px', background: 'none', border: 'none',
          color: theme.textMuted, fontSize: 10, cursor: 'pointer',
        }}
      >
        Dismiss
      </button>
    </div>
  )
}
