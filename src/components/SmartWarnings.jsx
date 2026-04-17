import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

/**
 * Shows 1–2 most important warnings inline above the canvas.
 * Updates automatically as canvas changes.
 * Only shows when there are real issues — disappears when fixed.
 */
export default function SmartWarnings() {
  const { theme } = useUIStore()
  const { fabricCanvas, viralScore } = useCanvasStore()
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    if (!fabricCanvas) return

    function check() {
      const objs = fabricCanvas.getObjects()
      const textObjs = objs.filter(o => o.type === 'i-text' || o.type === 'textbox')
      const w = []

      // Text too small
      const smallText = textObjs.find(t => t.fontSize < 40)
      if (smallText) w.push({ id: 'small-text', icon: '🔤', msg: 'Text too small for mobile — use 40px+' })

      // No text at all
      if (textObjs.length === 0 && objs.length > 0) {
        w.push({ id: 'no-text', icon: '✏️', msg: 'Add text — thumbnails with text get 2× more clicks' })
      }

      // Low score warning
      if (viralScore && viralScore.score < 45) {
        w.push({ id: 'low-score', icon: '📊', msg: `Score ${viralScore.score}/100 — hit ⚡ Make Viral to boost it` })
      }

      // Only show top 2 most important
      setWarnings(w.slice(0, 2))
    }

    check()
    fabricCanvas.on('object:added',    check)
    fabricCanvas.on('object:modified', check)
    fabricCanvas.on('object:removed',  check)
    return () => {
      fabricCanvas.off('object:added',    check)
      fabricCanvas.off('object:modified', check)
      fabricCanvas.off('object:removed',  check)
    }
  }, [fabricCanvas, viralScore])

  if (!warnings.length) return null

  return (
    <div style={{
      position: 'absolute', top: 12, left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: 4,
      zIndex: 9, pointerEvents: 'none',
      animation: 'fadeInDown 0.25s ease',
    }}>
      {warnings.map(w => (
        <div key={w.id} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 14px', borderRadius: 20,
          background: theme.isDark ? 'rgba(202,138,4,0.15)' : 'rgba(202,138,4,0.1)',
          border: '1px solid rgba(202,138,4,0.35)',
          color: theme.warning, fontSize: 11, fontWeight: 600,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>
          <span>{w.icon}</span>
          <span>{w.msg}</span>
        </div>
      ))}
    </div>
  )
}
