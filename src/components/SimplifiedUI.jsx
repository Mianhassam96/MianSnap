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

  // Auto-enable advanced mode after user interaction
  React.useEffect(() => {
    const handler = () => {
      // Enable advanced mode when user manually edits
      setAdvancedMode(true)
    }
    window.addEventListener('miansnap:manualEdit', handler)
    return () => window.removeEventListener('miansnap:manualEdit', handler)
  }, [])

  return <>{children}</>
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
