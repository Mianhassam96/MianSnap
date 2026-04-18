import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import ExportModal from './ExportModal'
import { trackExport } from '../utils/analytics'
import { CANVAS_SIZES, resizeCanvas } from '../utils/canvasSizes'

export default function TopBar() {
  const { theme, isDark, toggleTheme } = useUIStore()
  const { fabricCanvas, exportQuality, setExportQuality, exportFormat, setExportFormat, canUndo, canRedo, viralScore, prevScore } = useCanvasStore()
  const [exportData, setExportData] = useState(null)
  const [canvasSize, setCanvasSize] = useState('youtube')

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
    window.showToast?.(`Canvas: ${size.label} (${size.w}×${size.h})`, 'info', 2000)
  }

  function handleExport() {
    if (!fabricCanvas) return
    try {
      const multiplier = exportQuality === '1080p' ? 1.5 : 1
      const fmt = exportFormat === 'png' ? 'png' : 'jpeg'
      const dataUrl = fabricCanvas.toDataURL({ format: fmt, quality: fmt === 'jpeg' ? 0.95 : 1, multiplier })
      const filename = `miansnap-${Date.now()}.${exportFormat === 'png' ? 'png' : 'jpg'}`
      const a = document.createElement('a')
      a.href = dataUrl; a.download = filename; a.click()
      const timeToResult = trackExport()
      const size = CANVAS_SIZES.find(s => s.id === canvasSize)
      window.showToast?.(`✓ Downloaded ${size?.label || ''}${timeToResult ? ` · ⚡ ${timeToResult}s` : ''}`, 'success')
      setExportData({ dataUrl, filename, quality: exportQuality, format: exportFormat, viralScore: viralScore?.score, timeToResult })
    } catch (err) {
      window.showToast?.('Export failed — try again', 'error')
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
    width: 34, height: 34, borderRadius: 7,
    border: `1px solid ${theme.border}`,
    background: theme.bgTertiary, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s', flexShrink: 0, fontSize: 15,
    color: theme.textSecondary,
  }
  const hov = (e, on) => {
    e.currentTarget.style.borderColor = on ? theme.accent : theme.border
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
    e.currentTarget.style.color = on ? theme.accent : theme.textSecondary
  }
  const selectStyle = {
    background: theme.bgTertiary, border: `1px solid ${theme.border}`,
    color: theme.textSecondary, borderRadius: 6, padding: '5px 8px',
    fontSize: 12, cursor: 'pointer', outline: 'none', height: 32,
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px',
      height: 48, background: theme.bgSecondary,
      borderBottom: `1px solid ${theme.border}`,
      flexShrink: 0, zIndex: 100, flexWrap: 'nowrap', overflowX: 'auto',
    }}>
      {exportData && (
        <ExportModal
          {...exportData}
          prevScore={prevScore?.score}
          onClose={() => setExportData(null)}
          onCreateAnother={handleCreateAnother}
        />
      )}

      {/* Logo */}
      <span style={{
        fontSize: 17, fontWeight: 800, letterSpacing: '-0.5px',
        background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        fontFamily: "'Montserrat',sans-serif", flexShrink: 0, userSelect: 'none',
      }}>MianSnap</span>

      <div style={{ width: 1, height: 20, background: theme.border, margin: '0 2px', flexShrink: 0 }} />

      {/* Undo / Redo */}
      <button style={{ ...iconBtn, opacity: canUndo ? 1 : 0.3, cursor: canUndo ? 'pointer' : 'default' }}
        onClick={triggerUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"
        onMouseEnter={(e) => canUndo && hov(e, true)} onMouseLeave={(e) => hov(e, false)}
      >↩</button>
      <button style={{ ...iconBtn, opacity: canRedo ? 1 : 0.3, cursor: canRedo ? 'pointer' : 'default' }}
        onClick={triggerRedo} disabled={!canRedo} title="Redo (Ctrl+Y)"
        onMouseEnter={(e) => canRedo && hov(e, true)} onMouseLeave={(e) => hov(e, false)}
      >↪</button>

      <div style={{ width: 1, height: 20, background: theme.border, margin: '0 2px', flexShrink: 0 }} />

      {/* Canvas size switcher */}
      <select
        value={canvasSize}
        onChange={(e) => handleSizeChange(e.target.value)}
        className="ms-topbar-selects"
        title="Canvas size / platform"
        style={{ ...selectStyle, maxWidth: 160 }}
      >
        {CANVAS_SIZES.map(s => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>

      <div style={{ flex: 1 }} />

      {/* Privacy */}
      <span
        style={{ fontSize: 10, color: theme.textMuted, fontWeight: 400, opacity: 0.55, letterSpacing: 0.2, transition: 'opacity 0.3s', cursor: 'default', flexShrink: 0 }}
        className="ms-topbar-selects"
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.55' }}
        title="Everything runs in your browser — nothing is uploaded or stored"
      >
        🔒 private
      </span>

      <div style={{ width: 1, height: 20, background: theme.border, margin: '0 2px', flexShrink: 0 }} />

      {/* Quality + Format */}
      <select value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}
        className="ms-topbar-selects" style={selectStyle}>
        <option value="720p">720p</option>
        <option value="1080p">1080p</option>
      </select>

      <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}
        className="ms-topbar-selects" style={selectStyle}>
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
      </select>

      {/* Export */}
      <button
        onClick={handleExport}
        style={{
          padding: '0 18px', height: 34, borderRadius: 7, border: 'none',
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(124,58,237,0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.35)' }}
      >⬇ Export</button>

      {/* Theme */}
      <button style={iconBtn} onClick={toggleTheme}
        title={isDark ? 'Light mode' : 'Dark mode'}
        onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}
      >{isDark ? '☀️' : '🌙'}</button>
    </div>
  )
}
