import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useProjectStore from '../store/useProjectStore'

export default function TopBar() {
  const { theme, isDark, toggleTheme } = useUIStore()
  const { fabricCanvas, exportQuality, setExportQuality, exportFormat, setExportFormat } = useCanvasStore()
  const { projectName, setProjectName, saveCurrentProject, isSaving } = useProjectStore()
  const [editing, setEditing] = useState(false)

  function handleExport() {
    if (!fabricCanvas) return
    const multiplier = exportQuality === '1080p' ? 1.5 : 1
    const fmt = exportFormat === 'png' ? 'png' : 'jpeg'
    const dataUrl = fabricCanvas.toDataURL({ format: fmt, quality: 0.92, multiplier })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `miansnap-${Date.now()}.${exportFormat}`
    a.click()
  }

  async function handleSave() {
    if (!fabricCanvas) return
    await saveCurrentProject(fabricCanvas.toJSON(), projectName)
    alert('Project saved!')
  }

  const s = {
    bar: {
      display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
      height: 52, background: theme.bgSecondary, borderBottom: `1px solid ${theme.border}`,
      flexShrink: 0, zIndex: 100,
    },
    logo: {
      fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      flexShrink: 0,
    },
    divider: { width: 1, height: 24, background: theme.border, margin: '0 4px' },
    nameInput: {
      background: 'transparent', border: 'none', outline: 'none',
      color: theme.text, fontSize: 13, fontWeight: 500, width: 180,
      borderBottom: editing ? `1px solid ${theme.accent}` : '1px solid transparent',
      padding: '2px 4px', transition: 'border-color 0.2s',
    },
    spacer: { flex: 1 },
    btn: {
      padding: '6px 14px', borderRadius: 6, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textSecondary, fontSize: 12,
      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
    },
    exportBtn: {
      padding: '7px 18px', borderRadius: 6, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
    },
    select: {
      background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      color: theme.textSecondary, borderRadius: 6, padding: '6px 8px',
      fontSize: 12, cursor: 'pointer',
    },
    themeBtn: {
      width: 34, height: 34, borderRadius: 8, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, cursor: 'pointer', fontSize: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
  }

  return (
    <div style={s.bar}>
      <div style={s.logo}>MianSnap</div>
      <div style={s.divider} />
      <input
        style={s.nameInput}
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
      />
      <div style={s.spacer} />
      <select style={s.select} value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}>
        <option value="720p">720p</option>
        <option value="1080p">1080p</option>
      </select>
      <select style={s.select} value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
      </select>
      <button style={s.btn} onClick={handleSave} disabled={isSaving}>
        {isSaving ? '💾 Saving...' : '💾 Save'}
      </button>
      <button style={s.exportBtn} onClick={handleExport}>⬇ Export</button>
      <div style={s.divider} />
      <button style={s.themeBtn} onClick={toggleTheme} title="Toggle theme">
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
