import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

export default function ShortcutBar() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [activeObj, setActiveObj] = useState(null)

  useEffect(() => {
    if (!fabricCanvas) return
    const onSel = (e) => setActiveObj(e.selected?.[0] || null)
    const onClr = () => setActiveObj(null)
    fabricCanvas.on('selection:created', onSel)
    fabricCanvas.on('selection:updated', onSel)
    fabricCanvas.on('selection:cleared', onClr)
    return () => {
      fabricCanvas.off('selection:created', onSel)
      fabricCanvas.off('selection:updated', onSel)
      fabricCanvas.off('selection:cleared', onClr)
    }
  }, [fabricCanvas])

  // Only show when something is selected
  if (!activeObj) return null

  function duplicate() {
    if (!activeObj) return
    activeObj.clone((c) => {
      c.set({ left: activeObj.left + 20, top: activeObj.top + 20 })
      fabricCanvas.add(c)
      fabricCanvas.setActiveObject(c)
      fabricCanvas.renderAll()
    })
  }

  function deleteObj() {
    fabricCanvas.remove(activeObj)
    fabricCanvas.renderAll()
  }

  function bringFront() {
    fabricCanvas.bringToFront(activeObj)
    fabricCanvas.renderAll()
  }

  function sendBack() {
    fabricCanvas.sendToBack(activeObj)
    fabricCanvas.renderAll()
  }

  function flipH() {
    activeObj.set('flipX', !activeObj.flipX)
    fabricCanvas.renderAll()
  }

  const btn = {
    padding: '4px 10px', borderRadius: 5,
    border: `1px solid ${theme.border}`,
    background: theme.bgTertiary, color: theme.textSecondary,
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.12s', whiteSpace: 'nowrap',
  }
  const hov = (e, on) => {
    e.currentTarget.style.borderColor = on ? theme.accent : theme.border
    e.currentTarget.style.color = on ? theme.accent : theme.textSecondary
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
  }

  return (
    <div style={{
      position: 'absolute', bottom: 8, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9,
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '5px 8px', borderRadius: 10,
      background: theme.isDark ? 'rgba(13,13,24,0.95)' : 'rgba(255,255,255,0.95)',
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      animation: 'fadeInDown 0.18s ease',
    }}>
      <button style={btn} onClick={duplicate} title="Duplicate (Ctrl+D)"
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>⧉ Duplicate</button>
      <button style={btn} onClick={bringFront} title="Bring to front (Ctrl+Shift+])"
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>↑ Front</button>
      <button style={btn} onClick={sendBack} title="Send to back (Ctrl+Shift+[)"
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>↓ Back</button>
      <button style={btn} onClick={flipH} title="Flip horizontal"
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>⇄ Flip</button>
      <div style={{ width: 1, height: 16, background: theme.border, margin: '0 2px' }} />
      <button style={{ ...btn, color: theme.danger, borderColor: theme.danger + '44' }}
        onClick={deleteObj} title="Delete (Del)"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.isDark ? 'rgba(248,113,113,0.1)' : 'rgba(220,38,38,0.06)'; e.currentTarget.style.borderColor = theme.danger }}
        onMouseLeave={(e) => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.borderColor = theme.danger + '44' }}
      >✕ Delete</button>
    </div>
  )
}
