import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useProjectStore from '../store/useProjectStore'
import ExportModal from './ExportModal'

export default function TopBar({ onShowLanding, snapEnabled, onToggleSnap, onShowProjects }) {
  const { theme, isDark, toggleTheme, focusMode, toggleFocusMode } = useUIStore()
  const { fabricCanvas, exportQuality, setExportQuality, exportFormat, setExportFormat, canUndo, canRedo, viralScore, prevScore, sessionBest } = useCanvasStore()
  const { projectName, setProjectName, saveCurrentProject, isSaving } = useProjectStore()
  const [editing, setEditing] = useState(false)
  const [exportData, setExportData] = useState(null) // { dataUrl, filename, quality, format }

  function triggerUndo() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }))
  }
  function triggerRedo() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }))
  }

  function handleExport() {
    if (!fabricCanvas) return
    try {
      // Correct multiplier: 720p = 1× (1280×720), 1080p = 1.5× (1920×1080)
      const multiplier = exportQuality === '1080p' ? 1.5 : 1
      const fmt = exportFormat === 'png' ? 'png' : 'jpeg'
      const quality = fmt === 'jpeg' ? 0.95 : 1
      const dataUrl = fabricCanvas.toDataURL({ format: fmt, quality, multiplier })
      const filename = `miansnap-${Date.now()}.${exportFormat === 'png' ? 'png' : 'jpg'}`
      const a = document.createElement('a')
      a.href = dataUrl; a.download = filename; a.click()
      window.showToast?.(`✓ Exported ${exportFormat.toUpperCase()} ${exportQuality}`, 'success')
      setExportData({ dataUrl, filename, quality: exportQuality, format: exportFormat, viralScore: viralScore?.score })
    } catch (err) {
      window.showToast?.('Export failed — try again', 'error')
      console.error('[MianSnap] Export error:', err)
    }
  }

  function handleCreateAnother() {
    if (fabricCanvas) {
      fabricCanvas.clear()
      fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas))
      fabricCanvas.setBackgroundColor(
        fabricCanvas.backgroundColor || '#ffffff',
        fabricCanvas.renderAll.bind(fabricCanvas)
      )
    }
    setExportData(null)
    // Reset video so empty state shows again
    window.dispatchEvent(new CustomEvent('miansnap:resetCanvas'))
    window.showToast?.('Canvas cleared — drop another video or try Quick Mode ⚡', 'info', 3500)
  }

  async function handleSave() {
    if (!fabricCanvas) return
    await saveCurrentProject(fabricCanvas.toJSON(), projectName)
    window.showToast?.('Project saved!', 'save')
  }

  const s = {
    bar: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px',
      height: 54, background: theme.bgSecondary,
      borderBottom: `1px solid ${theme.border}`,
      flexShrink: 0, zIndex: 100,
      boxShadow: theme.shadowSm,
    },
    logo: {
      display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      userSelect: 'none', cursor: 'pointer',
      padding: '4px 8px', borderRadius: 6,
      transition: 'background 0.15s',
    },
    logoText: {
      fontSize: 20, fontWeight: 800, letterSpacing: '-1px',
      background: 'linear-gradient(135deg,#7c3aed 0%,#6d28d9 40%,#4f46e5 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      lineHeight: 1,
    },
    badge: {
      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
      background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(79,70,229,0.15))',
      color: theme.accent, border: `1px solid ${theme.borderHover}`,
      letterSpacing: 0.5, flexShrink: 0,
    },
    divider: {
      width: 1, height: 22, background: theme.border,
      margin: '0 6px', flexShrink: 0,
    },
    nameWrap: { display: 'flex', alignItems: 'center', gap: 6 },
    nameInput: {
      background: editing ? theme.bgTertiary : 'transparent',
      border: `1px solid ${editing ? theme.accent : 'transparent'}`,
      outline: 'none', color: theme.text, fontSize: 13, fontWeight: 500,
      width: 160, borderRadius: 6, padding: '4px 8px',
      transition: 'all 0.2s',
    },
    spacer: { flex: 1 },
    select: {
      background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      color: theme.textSecondary, borderRadius: 6, padding: '5px 8px',
      fontSize: 12, cursor: 'pointer', outline: 'none',
      transition: 'border-color 0.15s',
      height: 32,
    },
    iconBtn: {
      width: 34, height: 34, borderRadius: 7,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s', flexShrink: 0, fontSize: 15,
      color: theme.textSecondary,
    },
    saveBtn: {
      padding: '0 14px', height: 34, borderRadius: 7,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textSecondary,
      fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
      fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5,
      flexShrink: 0,
    },
    exportBtn: {
      padding: '0 20px', height: 34, borderRadius: 7, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
    },
  }

  return (
    <div style={s.bar}>
      {exportData && (
        <ExportModal
          {...exportData}
          prevScore={prevScore?.score}
          onClose={() => setExportData(null)}
          onCreateAnother={handleCreateAnother}
        />
      )}
      {/* Logo */}
      <div style={s.logo} onClick={onShowLanding} title="Back to home"
        onMouseEnter={(e) => { e.currentTarget.style.background = theme.bgTertiary }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <span style={s.logoText}>MianSnap</span>
      </div>
      <div style={s.badge}>BETA</div>

      <div style={s.divider} />

      {/* Project name */}
      <div style={s.nameWrap}>
        <span style={{ fontSize: 14 }}>📄</span>
        <input
          style={s.nameInput}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onFocus={() => setEditing(true)}
          onBlur={() => setEditing(false)}
          placeholder="Project name..."
        />
      </div>

      <div style={s.spacer} />

      {/* Undo / Redo */}
      <button
        style={{ ...s.iconBtn, opacity: canUndo ? 1 : 0.35, cursor: canUndo ? 'pointer' : 'not-allowed' }}
        onClick={triggerUndo} disabled={!canUndo}
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
        onMouseEnter={(e) => { if (canUndo) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow } }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
      >↩</button>
      <button
        style={{ ...s.iconBtn, opacity: canRedo ? 1 : 0.35, cursor: canRedo ? 'pointer' : 'not-allowed' }}
        onClick={triggerRedo} disabled={!canRedo}
        aria-label="Redo"
        title="Redo (Ctrl+Y)"
        onMouseEnter={(e) => { if (canRedo) { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow } }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
      >↪</button>

      <div style={s.divider} />

      {/* Quality + Format */}
      <select style={s.select} value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border }}
      >
        <option value="720p">720p</option>
        <option value="1080p">1080p</option>
      </select>

      <select style={s.select} value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border }}
      >
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
      </select>

      {/* Save */}
      <button style={s.saveBtn} onClick={handleSave} disabled={isSaving}
        aria-label={isSaving ? 'Saving project' : 'Save project'}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
      >
        {isSaving ? '⏳' : '💾'} {isSaving ? 'Saving...' : 'Save'}
      </button>

      {/* Projects */}
      <button style={s.saveBtn} onClick={onShowProjects}
        aria-label="Open projects"
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
      >
        📂 Projects
      </button>

      {/* Session best badge */}
      {sessionBest && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6,
          background: sessionBest.score >= 75 ? `${theme.success}18` : theme.accentGlow,
          border: `1px solid ${sessionBest.score >= 75 ? theme.success + '44' : theme.borderHover}`,
          fontSize: 11, fontWeight: 700,
          color: sessionBest.score >= 75 ? theme.success : theme.accent,
          flexShrink: 0,
        }} title="Best score this session">
          ⭐ {sessionBest.score}
          {prevScore && sessionBest.score > (prevScore.score ?? 0) && (
            <span style={{ fontSize: 9, color: theme.success }}>+{sessionBest.score - (prevScore.score ?? 0)}</span>
          )}
        </div>
      )}

      {/* Export */}
      <button style={s.exportBtn} onClick={handleExport}
        aria-label="Export thumbnail"
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(124,58,237,0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.35)' }}
      >
        ⬇ Export
      </button>

      <div style={s.divider} />

      {/* Snap toggle */}
      <button
        style={{
          ...s.iconBtn,
          fontSize: 13,
          color: snapEnabled ? theme.accent : theme.textMuted,
          borderColor: snapEnabled ? theme.accent : theme.border,
          background: snapEnabled ? theme.accentGlow : theme.bgTertiary,
        }}
        onClick={onToggleSnap}
        aria-label={snapEnabled ? 'Disable snap to grid' : 'Enable snap to grid'}
        aria-pressed={snapEnabled}
        title="Toggle snap to grid"
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = snapEnabled ? theme.accent : theme.border }}
      >
        ⊞
      </button>

      {/* Focus mode toggle */}
      <button
        style={{
          ...s.iconBtn,
          color: focusMode ? theme.accent : theme.textMuted,
          borderColor: focusMode ? theme.accent : theme.border,
          background: focusMode ? theme.accentGlow : theme.bgTertiary,
          fontSize: 13,
        }}
        onClick={toggleFocusMode}
        aria-label={focusMode ? 'Exit focus mode' : 'Enter focus mode'}
        aria-pressed={focusMode}
        title={focusMode ? 'Exit Focus Mode (show panels)' : 'Focus Mode — hide panels'}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = focusMode ? theme.accent : theme.border; e.currentTarget.style.background = focusMode ? theme.accentGlow : theme.bgTertiary }}
      >
        {focusMode ? '⊡' : '⊞'}
      </button>

      {/* Theme toggle */}
      <button
        style={s.iconBtn}
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light' : 'Switch to dark'}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
