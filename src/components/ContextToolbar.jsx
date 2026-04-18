import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { removeBackground } from '../utils/bgRemoval'
import { fabric } from '../lib/fabric'

export default function ContextToolbar() {
  const { theme, setActiveLeftPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [activeObj, setActiveObj] = useState(null)
  const [bgStatus, setBgStatus] = useState('')
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!fabricCanvas) return
    const onSelect = (e) => setActiveObj(e.selected?.[0] || null)
    const onClear  = () => setActiveObj(null)
    fabricCanvas.on('selection:created', onSelect)
    fabricCanvas.on('selection:updated', onSelect)
    fabricCanvas.on('selection:cleared', onClear)
    return () => {
      fabricCanvas.off('selection:created', onSelect)
      fabricCanvas.off('selection:updated', onSelect)
      fabricCanvas.off('selection:cleared', onClear)
    }
  }, [fabricCanvas])

  // Only show for image objects
  if (!activeObj || activeObj.type !== 'image') return null

  async function handleRemoveBg() {
    setRunning(true)
    setBgStatus('Loading AI...')
    try {
      const dataUrl = activeObj.toDataURL()
      const result = await removeBackground(dataUrl, (msg) => setBgStatus(msg))
      fabric.Image.fromURL(result, (img) => {
        img.set({ left: activeObj.left, top: activeObj.top, scaleX: activeObj.scaleX, scaleY: activeObj.scaleY })
        fabricCanvas.remove(activeObj)
        fabricCanvas.add(img)
        fabricCanvas.setActiveObject(img)
        fabricCanvas.renderAll()
        setBgStatus('')
        window.showToast?.('✂️ Background removed!', 'success')
      })
    } catch (err) {
      setBgStatus('')
      window.showToast?.(err?.message || 'AI model failed — check connection', 'error', 5000)
    }
    setRunning(false)
  }

  function handleBlurBg() {
    const bg = fabricCanvas.backgroundImage
    if (!bg || bg.filters === undefined) return
    const existing = bg.filters.filter(f => f.type !== 'Blur')
    bg.filters = [...existing, new fabric.Image.filters.Blur({ blur: 0.3 })]
    bg.applyFilters()
    fabricCanvas.renderAll()
    window.showToast?.('Background blurred', 'success')
  }

  function handleReplaceBg() {
    setActiveLeftPanel('bg')
    window.showToast?.('BG tab opened — choose a preset or upload', 'info')
  }

  const s = {
    bar: {
      position: 'absolute', top: -44, left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 4,
      background: theme.isDark ? 'rgba(13,13,24,0.95)' : 'rgba(255,255,255,0.95)',
      border: `1px solid ${theme.border}`,
      borderRadius: 8, padding: '5px 8px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      zIndex: 20, whiteSpace: 'nowrap',
      animation: 'fadeInDown 0.2s ease',
      pointerEvents: 'auto',
    },
    btn: {
      padding: '4px 10px', borderRadius: 5, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textSecondary,
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 4,
    },
    divider: { width: 1, height: 16, background: theme.border, margin: '0 2px' },
    status: { fontSize: 10, color: theme.accent, padding: '0 4px' },
  }

  const hover = (e, on) => {
    e.currentTarget.style.borderColor = on ? theme.accent : theme.border
    e.currentTarget.style.color = on ? theme.accent : theme.textSecondary
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
  }

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
      <div style={s.bar}>
        <button style={s.btn} onClick={handleRemoveBg} disabled={running}
          onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}
        >
          ✂️ {running ? bgStatus || 'Processing...' : 'Remove BG'}
        </button>
        <div style={s.divider} />
        <button style={s.btn} onClick={handleBlurBg}
          onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}
        >
          🌫 Blur BG
        </button>
        <div style={s.divider} />
        <button style={s.btn} onClick={handleReplaceBg}
          onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}
        >
          🖼 Replace BG
        </button>
      </div>
    </div>
  )
}
