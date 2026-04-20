import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'

/**
 * ZERO UI MODE — The killer feature
 * 
 * User sees:
 * - Drop video
 * - Auto result appears
 * - Download
 * 
 * NO sidebars, NO panels, NO tools
 * 
 * "Edit" button reveals everything
 */
export default function ZeroUIMode({ children, onExitZeroMode }) {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const { videoUrl } = useVideoStore()
  const [zeroMode, setZeroMode] = useState(true)
  const [hasContent, setHasContent] = useState(false)

  // Check if canvas has content
  useEffect(() => {
    if (!fabricCanvas) return
    const check = () => {
      const hasObjects = fabricCanvas.getObjects().length > 0
      const hasBg = !!fabricCanvas.backgroundImage
      setHasContent(hasObjects || hasBg)
    }
    fabricCanvas.on('object:added', check)
    fabricCanvas.on('object:removed', check)
    check()
    return () => {
      fabricCanvas.off('object:added', check)
      fabricCanvas.off('object:removed', check)
    }
  }, [fabricCanvas])

  // Auto-exit zero mode after first Auto Mode run
  useEffect(() => {
    const handler = () => {
      // Stay in zero mode even after auto mode
      // User must explicitly click "Edit" to exit
    }
    window.addEventListener('miansnap:autoModeComplete', handler)
    return () => window.removeEventListener('miansnap:autoModeComplete', handler)
  }, [])

  // Persist zero mode preference
  useEffect(() => {
    const saved = localStorage.getItem('miansnap_zero_mode')
    if (saved === 'false') setZeroMode(false)
  }, [])

  useEffect(() => {
    localStorage.setItem('miansnap_zero_mode', zeroMode)
  }, [zeroMode])

  function exitZeroMode() {
    setZeroMode(false)
    onExitZeroMode?.()
  }

  if (!zeroMode) {
    return <>{children}</>
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
    }}>
      {/* Hide sidebars and panels with CSS */}
      <style>{`
        .ms-left-sidebar { display: none !important; }
        .ms-right-sidebar { display: none !important; }
        .ms-bottom-panel { display: none !important; }
        .ms-topbar-selects { display: none !important; }
      `}</style>

      {children}

      {/* Edit button — only show when content exists */}
      {hasContent && (
        <button
          onClick={exitZeroMode}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            padding: '14px 28px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
            transition: 'all 0.2s',
            letterSpacing: '-0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.5)'
          }}
        >
          <span>✏️</span>
          <span>Edit Thumbnail</span>
        </button>
      )}

      {/* Hint — only show before content */}
      {!hasContent && videoUrl && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          padding: '12px 24px',
          borderRadius: 20,
          background: theme.isDark ? 'rgba(13,13,24,0.95)' : 'rgba(255,255,255,0.95)',
          border: `1px solid ${theme.borderHover}`,
          backdropFilter: 'blur(12px)',
          boxShadow: theme.shadowSm,
          fontSize: 13,
          color: theme.text,
          fontWeight: 600,
          animation: 'fadeInDown 0.3s ease',
        }}>
          💡 Click "Auto Create" in the Styles tab to generate your thumbnail
        </div>
      )}
    </div>
  )
}

// Hook to check if in zero mode
export function useZeroMode() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('miansnap_zero_mode') !== 'false'
  })

  useEffect(() => {
    const handler = () => {
      setEnabled(localStorage.getItem('miansnap_zero_mode') !== 'false')
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return enabled
}
