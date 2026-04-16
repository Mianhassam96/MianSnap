import React from 'react'
import useUIStore from '../store/useUIStore'

const TABS = [
  { id: 'text',    icon: '𝐓', label: 'Text' },
  { id: 'shapes',  icon: '◻', label: 'Shapes' },
  { id: 'filters', icon: '✨', label: 'Filters' },
  { id: 'bg',      icon: '🖼', label: 'BG' },
  { id: 'styles',  icon: '⚡', label: 'Styles' },
]

export default function MobileTabBar({ onOpenPanel }) {
  const { theme, activeLeftPanel, setActiveLeftPanel } = useUIStore()

  function handleTab(id) {
    setActiveLeftPanel(id)
    onOpenPanel?.(id)
  }

  return (
    <div className="ms-mobile-tabs" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 60, zIndex: 200,
      background: theme.bgSecondary,
      borderTop: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'stretch',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
    }}>
      {TABS.map(t => (
        <button key={t.id}
          onClick={() => handleTab(t.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            border: 'none', background: 'transparent',
            color: activeLeftPanel === t.id ? theme.accent : theme.textMuted,
            fontSize: 10, cursor: 'pointer',
            borderTop: `2px solid ${activeLeftPanel === t.id ? theme.accent : 'transparent'}`,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
