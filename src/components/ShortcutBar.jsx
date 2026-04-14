import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'

const SHORTCUTS = [
  { key: 'Ctrl+Z', label: 'Undo' },
  { key: 'Ctrl+Y', label: 'Redo' },
  { key: 'Ctrl+D', label: 'Duplicate' },
  { key: 'Ctrl+C/V', label: 'Copy/Paste' },
  { key: 'Del', label: 'Delete' },
  { key: '↑↓←→', label: 'Nudge' },
  { key: 'Shift+Arrow', label: 'Nudge ×10' },
  { key: 'Ctrl+A', label: 'Select All' },
  { key: 'Ctrl+]', label: 'Bring Fwd' },
  { key: 'Ctrl+[', label: 'Send Back' },
  { key: 'Esc', label: 'Deselect' },
]

export default function ShortcutBar() {
  const { theme } = useUIStore()
  const [expanded, setExpanded] = useState(false)

  const s = {
    wrap: {
      position: 'absolute', bottom: 8, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    },
    toggle: {
      padding: '3px 12px', borderRadius: 20,
      background: theme.isDark ? 'rgba(13,13,24,0.85)' : 'rgba(255,255,255,0.85)',
      border: `1px solid ${theme.border}`,
      color: theme.textMuted, fontSize: 10, cursor: 'pointer',
      backdropFilter: 'blur(6px)',
      transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: 5,
    },
    bar: {
      display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
      padding: '6px 12px', borderRadius: 10,
      background: theme.isDark ? 'rgba(13,13,24,0.92)' : 'rgba(255,255,255,0.92)',
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(8px)',
      maxWidth: 600,
      animation: 'fadeIn 0.15s ease',
    },
    chip: {
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: 10, color: theme.textSecondary,
    },
    kbd: {
      padding: '1px 5px', borderRadius: 4,
      background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      color: theme.text, fontSize: 9, fontWeight: 600,
      fontFamily: 'monospace',
    },
  }

  return (
    <div style={s.wrap}>
      {expanded && (
        <div style={s.bar}>
          {SHORTCUTS.map((sc) => (
            <div key={sc.key} style={s.chip}>
              <span style={s.kbd}>{sc.key}</span>
              <span>{sc.label}</span>
            </div>
          ))}
        </div>
      )}
      <button style={s.toggle}
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
      >
        ⌨ {expanded ? 'Hide shortcuts' : 'Keyboard shortcuts'}
      </button>
    </div>
  )
}
