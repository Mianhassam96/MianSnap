import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import ExportModal from './ExportModal'
import { trackExport } from '../utils/analytics'
import { CANVAS_SIZES, resizeCanvas } from '../utils/canvasSizes'
import { fabric } from '../lib/fabric'

export default function TopBar() {
  const { theme, isDark, toggleTheme, focusMode, toggleFocusMode, toggleBottomPanel, showBottomPanel } = useUIStore()
  const { fabricCanvas, exportQuality, setExportQuality, exportFormat, setExportFormat, canUndo, canRedo, viralScore, prevScore } = useCanvasStore()
  const [exportData, setExportData] = useState(null)
  const [canvasSize, setCanvasSize] = useState('youtube')
  const [watermark, setWatermark] = useState(false)

  // Listen for mobile export trigger
  useEffect(() => {
    const handler = () => handleExport()
    window.addEventListener('miansnap:export', handler)
    return () => window.removeEventListener('miansnap:export', handler)
  }, [fabricCanvas, exportQuality, exportFormat, canvasSize])

  function triggerUndo() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }))
  }
  function triggerRedo() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }))
  }

  function handleSizeChange(id) {
    setCanvasSize(id)
    const size = CANVAS_SIZES.find(s => s.id === id)
    if (!size || !fabricCanvas) return
    resizeCanvas(fabricCanvas, size.w, size.h)
    window.showToast?.(`${size.label} — ${size.w}×${size.h}`, 'info', 2000)
  }

  function handleOptimizeLayout() {
    if (!fabricCanvas) return
    const cw = fabricCanvas.width
    const ch = fabricCanvas.height
    // Boost text size for current canvas
    fabricCanvas.getObjects()
      .filter(o => o.type === 'i-text' || o.type === 'textbox')
      .forEach(o => {
        const minSize = Math.round(cw * 0.055) // ~5.5% of canvas width
        if (o.fontSize < minSize) o.set('fontSize', minSize)
        // Re-center vertically if near edges
        if (o.top < ch * 0.05) o.set('top', ch * 0.08)
        if (o.top > ch * 0.85) o.set('top', ch * 0.82)
      })
    // Ensure background fills canvas
    const bg = fabricCanvas.backgroundImage
    if (bg) {
      const scale = Math.max(cw / bg.width, ch / bg.height)
      bg.set({
        scaleX: scale, scaleY: scale,
        left: (cw - bg.width * scale) / 2,
        top: (ch - bg.height * scale) / 2,
      })
    }
    fabricCanvas.renderAll()
    window.showToast?.('⚡ Layout optimized for platform', 'success')
  }

  function handleResetLayout() {
    if (!fabricCanvas) return
    const bg = fabricCanvas.backgroundImage
    if (bg) {
      const cw = fabricCanvas.width, ch = fabricCanvas.height
      const scale = Math.max(cw / bg.width, ch / bg.height)
      bg.set({ scaleX: scale, scaleY: scale, left: (cw - bg.width * scale) / 2, top: (ch - bg.height * scale) / 2 })
    }
    fabricCanvas.renderAll()
    window.showToast?.('🔄 Layout reset', 'info', 1500)
  }

  function handleExport() {
    if (!fabricCanvas) return
    // Guard: warn if canvas appears blank
    const hasContent = fabricCanvas.backgroundImage || fabricCanvas.getObjects().length > 0
    if (!hasContent) {
      window.showToast?.('⚠️ Canvas is empty — add an image or text first', 'error', 3000)
      return
    }
    try {
      let wmObj = null
      if (watermark) {
        wmObj = new fabric.Text('Created with MianSnap', {
          left: fabricCanvas.width - 12,
          top: fabricCanvas.height - 12,
          originX: 'right', originY: 'bottom',
          fontSize: Math.round(fabricCanvas.width * 0.018),
          fill: 'rgba(255,255,255,0.7)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 6, offsetX: 1, offsetY: 1 }),
          selectable: false, evented: false,
        })
        fabricCanvas.add(wmObj)
        fabricCanvas.renderAll()
      }

      const multiplier = exportQuality === '1080p' ? 1.5 : 1
      const fmt = exportFormat === 'png' ? 'png' : 'jpeg'
      const dataUrl = fabricCanvas.toDataURL({ format: fmt, quality: fmt === 'jpeg' ? 0.95 : 1, multiplier })

      if (wmObj) { fabricCanvas.remove(wmObj); fabricCanvas.renderAll() }

      // Validate output isn't blank
      if (!dataUrl || dataUrl.length < 1000) {
        window.showToast?.('❌ Export failed — canvas may be empty', 'error', 3000)
        return
      }

      const size = CANVAS_SIZES.find(s => s.id === canvasSize)
      const platformSlug = size?.id || 'thumbnail'
      const dims = `${fabricCanvas.width}x${fabricCanvas.height}`
      const filename = `${platformSlug}-${dims}.${exportFormat === 'png' ? 'png' : 'jpg'}`
      const a = document.createElement('a')
      a.href = dataUrl; a.download = filename; a.click()
      const timeToResult = trackExport()
      window.showToast?.(`✓ Saved as ${filename}${timeToResult ? ` · ⚡ ${timeToResult}s` : ''}`, 'success')
      setExportData({ dataUrl, filename, quality: exportQuality, format: exportFormat, viralScore: viralScore?.score, timeToResult })
    } catch (err) {
      window.showToast?.('❌ Export failed — try again', 'error', 3000)
      console.error('[MianSnap] Export error:', err)
    }
  }

  function handleCreateAnother() {
    if (fabricCanvas) {
      fabricCanvas.clear()
      fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas))
      fabricCanvas.setBackgroundColor('#ffffff', fabricCanvas.renderAll.bind(fabricCanvas))
    }
    setExportData(null)
    window.dispatchEvent(new CustomEvent('miansnap:resetCanvas'))
    window.showToast?.('Ready — drop another video or image ⚡', 'info', 3000)
  }

  const iconBtn = {
    width: 32, height: 32, borderRadius: 7,
    border: `1px solid ${theme.border}`,
    background: theme.bgTertiary, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s', flexShrink: 0, fontSize: 14,
    color: theme.textSecondary,
  }
  const hov = (e, on) => {
    e.currentTarget.style.borderColor = on ? theme.accent : theme.border
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
    e.currentTarget.style.color = on ? theme.accent : theme.textSecondary
  }
  const sel = {
    background: theme.bgTertiary, border: `1px solid ${theme.border}`,
    color: theme.textSecondary, borderRadius: 6, padding: '4px 7px',
    fontSize: 11, cursor: 'pointer', outline: 'none', height: 30,
  }

  return (
    <div className="ms-topbar" style={{
      display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px',
      height: 46, background: theme.bgSecondary,
      borderBottom: `1px solid ${theme.border}`,
      flexShrink: 0, zIndex: 100, overflowX: 'auto',
    }}>
      {exportData && (
        <ExportModal {...exportData} prevScore={prevScore?.score}
          onClose={() => setExportData(null)} onCreateAnother={handleCreateAnother} />
      )}

      {/* Logo — click to go back to landing */}
      <span style={{
        fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px',
        background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        fontFamily: "'Montserrat',sans-serif", flexShrink: 0, userSelect: 'none',
        cursor: 'pointer',
      }} onClick={() => {
        localStorage.removeItem('miansnap_landing_seen')
        window.location.reload()
      }} title="Back to home">MianSnap</span>

      <div style={{ width: 1, height: 18, background: theme.border, margin: '0 2px', flexShrink: 0 }} />

      {/* Undo / Redo */}
      <button style={{ ...iconBtn, opacity: canUndo ? 1 : 0.3 }} onClick={triggerUndo}
        disabled={!canUndo} title="Undo (Ctrl+Z)"
        onMouseEnter={(e) => canUndo && hov(e, true)} onMouseLeave={(e) => hov(e, false)}>↩</button>
      <button style={{ ...iconBtn, opacity: canRedo ? 1 : 0.3 }} onClick={triggerRedo}
        disabled={!canRedo} title="Redo (Ctrl+Y)"
        onMouseEnter={(e) => canRedo && hov(e, true)} onMouseLeave={(e) => hov(e, false)}>↪</button>

      <div style={{ width: 1, height: 18, background: theme.border, margin: '0 2px', flexShrink: 0 }} />

      {/* Platform / canvas size */}
      <select value={canvasSize} onChange={(e) => handleSizeChange(e.target.value)}
        className="ms-topbar-selects" title="Platform / canvas size"
        style={{ ...sel, maxWidth: 155 }}>
        {CANVAS_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>

      {/* Optimize for platform */}
      <button style={{ ...iconBtn, fontSize: 12, width: 'auto', padding: '0 8px' }}
        onClick={handleOptimizeLayout} title="Optimize layout for this platform"
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>
        ⚡ Optimize
      </button>

      {/* Reset layout */}
      <button style={{ ...iconBtn, fontSize: 11, width: 'auto', padding: '0 7px' }}
        onClick={handleResetLayout} title="Reset background to fill canvas"
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>
        🔄 Reset
      </button>

      <div style={{ flex: 1 }} />

      {/* Privacy + auto-save indicator */}
      <span style={{ fontSize: 10, color: theme.textMuted, opacity: 0.5, flexShrink: 0, cursor: 'default' }}
        className="ms-topbar-selects"
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5' }}
        title="Auto-saves every 2 seconds · Nothing uploaded to any server">
        🔒 private · auto-saved
      </span>

      <div style={{ width: 1, height: 18, background: theme.border, margin: '0 2px', flexShrink: 0 }} />

      {/* Quality + Format */}
      <select value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}
        className="ms-topbar-selects" style={sel} title="Export resolution">
        <option value="720p">720p (1280×720)</option>
        <option value="1080p">1080p (1920×1080)</option>
      </select>
      <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}
        className="ms-topbar-selects" style={sel} title="Export format — JPG is smaller, PNG is lossless">
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
      </select>

      {/* Watermark toggle */}
      <button
        onClick={() => setWatermark(w => !w)}
        title={watermark ? 'Watermark ON — click to remove' : 'Add "Created with MianSnap" watermark'}
        style={{
          ...iconBtn, fontSize: 10, width: 'auto', padding: '0 8px',
          background: watermark ? theme.accentGlow : theme.bgTertiary,
          borderColor: watermark ? theme.accent : theme.border,
          color: watermark ? theme.accent : theme.textSecondary,
        }}
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}
      >
        {watermark ? '🏷 WM ON' : '🏷 WM'}
      </button>

      {/* Export — glassmorphic gradient */}
      <button onClick={handleExport} style={{
        padding: '0 18px', height: 32, borderRadius: 7,
        border: '1px solid rgba(124,58,237,0.4)',
        background: 'linear-gradient(135deg,rgba(124,58,237,0.9),rgba(79,70,229,0.9))',
        backdropFilter: 'blur(8px)',
        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        transition: 'transform 0.15s, box-shadow 0.15s', flexShrink: 0,
        letterSpacing: '0.3px',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.6), inset 0 1px 0 rgba(255,255,255,0.2)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}
      >⬇ Export</button>

      {/* Theme */}
      <button style={iconBtn} onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Focus mode */}
      <button style={{ ...iconBtn, background: focusMode ? theme.accentGlow : theme.bgTertiary, borderColor: focusMode ? theme.accent : theme.border }}
        onClick={toggleFocusMode} title={focusMode ? 'Exit focus mode' : 'Focus mode — hide panels'}
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>
        {focusMode ? '⊞' : '⊡'}
      </button>

      {/* Toggle bottom panel */}
      <button style={{ ...iconBtn, background: showBottomPanel ? theme.accentGlow : theme.bgTertiary, borderColor: showBottomPanel ? theme.accent : theme.border }}
        onClick={toggleBottomPanel} title={showBottomPanel ? 'Hide video panel' : 'Show video panel'}
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>
        🎬
      </button>
    </div>
  )
}
