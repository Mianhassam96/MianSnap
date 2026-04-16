import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'

const TABS = [
  { id: 'text',    icon: '𝐓', label: 'Text' },
  { id: 'shapes',  icon: '◻', label: 'Shapes' },
  { id: 'filters', icon: '✨', label: 'Filters' },
  { id: 'bg',      icon: '🖼', label: 'BG' },
  { id: 'styles',  icon: '⚡', label: 'Styles', badge: 'NEW' },
]

const HINT_KEY = 'miansnap_mobile_hint'

export default function MobileTabBar({ onOpenPanel }) {
  const { theme, activeLeftPanel, setActiveLeftPanel } = useUIStore()
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    // Show first-time hint after 1.5s
    if (!localStorage.getItem(HINT_KEY)) {
      const t = setTimeout(() => setShowHint(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  function dismissHint() {
    setShowHint(false)
    localStorage.setItem(HINT_KEY, '1')
  }

  function handleTab(id) {
    setActiveLeftPanel(id)
    onOpenPanel?.(id)
    dismissHint()
  }

  return (
    <>
      {/* First-time hint */}
      {showHint && (
        <div className="ms-mobile-tabs" style={{
          position: 'fixed', bottom: 64, left: 16, right: 16,
          zIndex: 201, background: theme.bgSecondary,
          border: `1px solid ${theme.borderHover}`,
          borderRadius: 12, padding: '12px 16px',
          boxShadow: '0 -4px 24px rgba(124,58,237,0.25)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeInDown 0.3s ease',
        }}>
          <span style={{ fontSize: 20 }}>👇</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>
              Tap below to add text, shapes or styles
            </div>
            <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>
              Try ⚡ Styles → Quick Mode for instant results
            </div>
          </div>
          <button onClick={dismissHint} style={{
            background: 'none', border: 'none', color: theme.textMuted,
            fontSize: 14, cursor: 'pointer', padding: 4,
          }}>✕</button>
        </div>
      )}

      {/* Tab bar */}
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
              fontSize: 10, cursor: 'pointer', position: 'relative',
              borderTop: `2px solid ${activeLeftPanel === t.id ? theme.accent : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.label}</span>
            {/* Badge on Styles tab */}
            {t.badge && (
              <span style={{
                position: 'absolute', top: 4, right: '50%',
                transform: 'translateX(12px)',
                background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                color: '#fff', fontSize: 7, fontWeight: 800,
                padding: '1px 4px', borderRadius: 3, letterSpacing: 0.3,
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>
    </>
  )
}
