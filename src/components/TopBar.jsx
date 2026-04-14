import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useProjectStore from '../store/useProjectStore'

export default function TopBar({ onShowLanding, snapEnabled, onToggleSnap }) {
  const { theme, isDark, toggleTheme } = useUIStore()
  const { fabricCanvas, exportQuality, setExportQuality, exportFormat, setExportFormat } = useCanvasStore()
  const { projectName, setProjectName, saveCurrentProject, isSaving } = useProjectStore()
  const [editing, setEditing] = useState(false)

  function handleExport() {
    if (!fabricCanvas) return
    const multiplier = exportQuality === '1080p' ? 1.5 : 1
    const fmt = exportFormat === 'png' ? 'png' : 'jpeg'
    const dataUrl = fabricCanvas.toDataURL({ format: fmt, quality: 0.93, multiplier })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `miansnap-${Date.now()}.${exportFormat}`
    a.click()
  }

  async function handleSave() {
    if (!fabricCanvas) return
    await saveCurrentProject(fabricCanvas.toJSON(), projectName)
    alert('Project saved to browser storage!')
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
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
      >
        {isSaving ? '⏳' : '💾'} {isSaving ? 'Saving...' : 'Save'}
      </button>

      {/* Export */}
      <button style={s.exportBtn} onClick={handleExport}
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
        title="Toggle snap to grid"
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = snapEnabled ? theme.accent : theme.border }}
      >
        ⊞
      </button>

      {/* Theme toggle */}
      <button
        style={s.iconBtn}
        onClick={toggleTheme}
        title={isDark ? 'Switch to light' : 'Switch to dark'}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
