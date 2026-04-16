import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'

/**
 * Global toast notification system.
 * Usage: window.showToast('message', 'success' | 'error' | 'info')
 */
export default function Toast() {
  const { theme } = useUIStore()
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    window.showToast = (msg, type = 'success', duration = 3000) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }
    return () => { delete window.showToast }
  }, [])

  const colors = {
    success: { bg: theme.isDark ? '#052e16' : '#f0fdf4', border: theme.isDark ? '#166534' : '#bbf7d0', color: theme.success, icon: '✓' },
    error:   { bg: theme.isDark ? '#1f0a0a' : '#fef2f2', border: theme.isDark ? '#7f1d1d' : '#fecaca', color: theme.danger,  icon: '✕' },
    info:    { bg: theme.isDark ? '#0c1a2e' : '#eff6ff', border: theme.isDark ? '#1e3a5f' : '#bfdbfe', color: '#60a5fa',     icon: 'ℹ' },
    save:    { bg: theme.isDark ? '#0d0d18' : '#f5f3ff', border: theme.isDark ? '#3730a3' : '#c4b5fd', color: theme.accent,  icon: '💾' },
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999,
      pointerEvents: 'none', alignItems: 'center',
    }}>
      {toasts.map(t => {
        const c = colors[t.type] || colors.info
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 18px', borderRadius: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            color: c.color, fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            animation: 'fadeInDown 0.25s ease',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: 15 }}>{c.icon}</span>
            {t.msg}
          </div>
        )
      })}
    </div>
  )
}
