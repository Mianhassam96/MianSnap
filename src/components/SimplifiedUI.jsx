import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'

export default function SimplifiedUI({ children }) {
  const { theme } = useUIStore()
  const [advancedMode, setAdvancedMode] = useState(false)

  // Store advanced mode in localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('miansnap_advanced_mode')
    if (saved === 'true') setAdvancedMode(true)
  }, [])

  React.useEffect(() => {
    localStorage.setItem('miansnap_advanced_mode', advancedMode)
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('miansnap:advancedModeChanged', { detail: { enabled: advancedMode } }))
  }, [advancedMode])

  return (
    <>
      {children}
      
      {/* Advanced mode toggle - bottom right */}
      <button
        onClick={() => setAdvancedMode(!advancedMode)}
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 100,
          padding: '8px 16px',
          borderRadius: 20,
          border: `1px solid ${theme.border}`,
          background: theme.bgSecondary,
          color: theme.textSecondary,
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.accent
          e.currentTarget.style.color = theme.accent
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.border
          e.currentTarget.style.color = theme.textSecondary
        }}
        title={advancedMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode'}
      >
        <span>{advancedMode ? '⚙️' : '🚀'}</span>
        <span>{advancedMode ? 'Simple Mode' : 'Advanced'}</span>
      </button>
    </>
  )
}

// Hook to check if advanced mode is enabled
export function useAdvancedMode() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('miansnap_advanced_mode') === 'true'
  })

  React.useEffect(() => {
    const handler = (e) => setEnabled(e.detail.enabled)
    window.addEventListener('miansnap:advancedModeChanged', handler)
    return () => window.removeEventListener('miansnap:advancedModeChanged', handler)
  }, [])

  return enabled
}
