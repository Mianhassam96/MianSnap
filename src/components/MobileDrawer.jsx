import React, { useEffect } from 'react'
import useUIStore from '../store/useUIStore'
import BackgroundPanel from './BackgroundPanel'
import FiltersPanel from './FiltersPanel'
import ShapesPanel from './ShapesPanel'
import OneClickStyles from './OneClickStyles'
import MakeItViral from './MakeItViral'
import QuickMode from './QuickMode'

export default function MobileDrawer({ open, onClose }) {
  const { theme, activeLeftPanel } = useUIStore()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'hidden'
  }, [open])

  if (!open) return null

  const panelMap = {
    bg:      <BackgroundPanel />,
    filters: <FiltersPanel />,
    shapes:  <ShapesPanel />,
    styles:  <><QuickMode /><MakeItViral /><OneClickStyles /></>,
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', bottom: 60, left: 0, right: 0,
        maxHeight: '65vh', zIndex: 195,
        background: theme.bgSecondary,
        borderTop: `1px solid ${theme.border}`,
        borderRadius: '16px 16px 0 0',
        overflowY: 'auto',
        padding: '16px 16px 24px',
        animation: 'slideUp 0.25s ease',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: theme.border, margin: '0 auto 16px',
        }} />
        {panelMap[activeLeftPanel] || (
          <div style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 20 }}>
            Open from the tab bar below
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
