import React, { useState, useEffect, useRef } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'

/**
 * ZERO UI MODE — Forced entry flow
 *
 * Phase 1 (no upload): Full-screen upload gate — nothing else visible
 * Phase 2 (has video, no result): Auto-generate prompt
 * Phase 3 (has result): Show result + Download + "Edit" to reveal full editor
 */
export default function ZeroUIMode({ children, onExitZeroMode }) {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const { videoUrl, setVideoFile } = useVideoStore()
  const [zeroMode, setZeroMode] = useState(true)
  const [hasContent, setHasContent] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [phase, setPhase] = useState('upload') // 'upload' | 'ready'
  const fileInputRef = useRef(null)

  // Restore preference
  useEffect(() => {
    const saved = localStorage.getItem('miansnap_zero_mode')
    if (saved === 'false') setZeroMode(false)
  }, [])

  useEffect(() => {
    localStorage.setItem('miansnap_zero_mode', zeroMode)
  }, [zeroMode])

  // Track canvas content
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

  // Move to ready phase when video uploaded
  useEffect(() => {
    if (videoUrl) setPhase('ready')
  }, [videoUrl])

  function exitZeroMode() {
    setZeroMode(false)
    onExitZeroMode?.()
  }

  function handleFileSelect(file) {
    if (!file) return
    const type = file.type || ''
    if (type.startsWith('video/') || type.startsWith('image/')) {
      if (type.startsWith('video/')) {
        window.dispatchEvent(new CustomEvent('miansnap:dropVideo', { detail: { file } }))
      } else {
        // image — dispatch to App handler
        window.dispatchEvent(new CustomEvent('miansnap:dropImage', { detail: { file } }))
      }
    } else {
      window.showToast?.('❌ Use a video or image file', 'error', 3000)
    }
  }

  function openPicker() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*,image/*'
    input.onchange = (e) => handleFileSelect(e.target.files[0])
    input.click()
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  // Not in zero mode — render children normally
  if (!zeroMode) return <>{children}</>

  const grad = 'linear-gradient(135deg,#7c3aed,#4f46e5)'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Always hide sidebars/panels in zero mode */}
      <style>{`
        .ms-left-sidebar  { display: none !important; }
        .ms-right-sidebar { display: none !important; }
        .ms-bottom-panel  { display: none !important; }
        .ms-topbar-selects { display: none !important; }
        .ms-fab { display: none !important; }
      `}</style>

      {children}

      {/* ── PHASE 1: Upload gate — full screen overlay ── */}
      {phase === 'upload' && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: theme.isDark
              ? 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.18) 0%, #0a0a0f 60%)'
              : 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.1) 0%, #f5f5ff 60%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {/* Logo */}
          <div style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px',
            background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: "'Montserrat',sans-serif",
          }}>MianSnap</div>

          {/* Skip to editor */}
          <button
            onClick={exitZeroMode}
            style={{
              position: 'absolute', top: 16, right: 20,
              background: 'none', border: `1px solid ${theme.border}`,
              color: theme.textMuted, fontSize: 11, padding: '5px 12px',
              borderRadius: 6, cursor: 'pointer',
            }}
          >Advanced Editor →</button>

          {/* Main upload zone */}
          <div
            onClick={openPicker}
            style={{
              width: 'min(520px, 90vw)',
              padding: '52px 40px',
              borderRadius: 24,
              border: `2px dashed ${dragging ? '#7c3aed' : theme.isDark ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.3)'}`,
              background: dragging
                ? (theme.isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.06)')
                : (theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)'),
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: dragging
                ? '0 0 0 4px rgba(124,58,237,0.2), 0 24px 60px rgba(124,58,237,0.2)'
                : '0 8px 40px rgba(0,0,0,0.12)',
              animation: 'uploadPulse 3s ease-in-out infinite',
            }}
          >
            <div style={{
              fontSize: 64, marginBottom: 16,
              animation: dragging ? 'none' : 'iconBounce 2s ease-in-out infinite',
              filter: dragging ? 'drop-shadow(0 0 20px #7c3aed)' : 'none',
              transition: 'filter 0.2s',
            }}>
              {dragging ? '📥' : '🎬'}
            </div>

            <div style={{
              fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900,
              color: dragging ? '#7c3aed' : theme.text,
              marginBottom: 10, letterSpacing: '-1px',
              fontFamily: "'Montserrat',sans-serif", lineHeight: 1.1,
            }}>
              {dragging ? 'Drop to start!' : 'Drop your video here'}
            </div>

            <div style={{
              fontSize: 15, color: theme.textSecondary,
              marginBottom: 28, lineHeight: 1.6, fontWeight: 500,
            }}>
              AI picks best frame · makes it viral · ready in 10s
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); openPicker() }}
              style={{
                padding: '16px 48px', borderRadius: 14, border: 'none',
                background: grad, color: '#fff',
                fontSize: 16, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                letterSpacing: '-0.3px',
                animation: 'ctaPulse 2s ease-in-out infinite',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.65)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.5)' }}
            >
              📥 Upload Video or Image
            </button>

            <div style={{ marginTop: 16, fontSize: 11, color: theme.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span>🔒</span>
              <span>100% private · nothing uploaded to any server · free forever</span>
            </div>
          </div>

          {/* Supported formats */}
          <div style={{ marginTop: 20, fontSize: 11, color: theme.textMuted, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['MP4', 'MOV', 'WebM', 'JPG', 'PNG', 'WebP'].map(f => (
              <span key={f} style={{
                padding: '3px 10px', borderRadius: 20,
                background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${theme.border}`,
              }}>{f}</span>
            ))}
          </div>

          <style>{`
            @keyframes uploadPulse {
              0%,100% { border-color: rgba(124,58,237,0.3); }
              50% { border-color: rgba(124,58,237,0.6); }
            }
            @keyframes ctaPulse {
              0%,100% { box-shadow: 0 8px 32px rgba(124,58,237,0.5); }
              50% { box-shadow: 0 8px 48px rgba(124,58,237,0.8), 0 0 0 6px rgba(124,58,237,0.1); }
            }
            @keyframes iconBounce {
              0%,100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
        </div>
      )}

      {/* ── PHASE 2: Has video/image — show result + actions ── */}
      {phase === 'ready' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
          padding: '12px 20px',
          background: theme.isDark ? 'rgba(10,10,20,0.97)' : 'rgba(255,255,255,0.97)',
          borderTop: `1px solid ${theme.border}`,
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', gap: 10,
          flexWrap: 'wrap',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}>
          {/* Make Viral — THE hero action */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('miansnap:makeViral'))}
            style={{
              flex: '2 1 180px', padding: '14px 20px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
              color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 6px 28px rgba(239,68,68,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              animation: 'viralBarPulse 2s ease-in-out infinite',
            }}
          >
            <span>⚡ Make Viral</span>
            <span style={{ fontSize: 10, opacity: 0.9, fontWeight: 500 }}>1 click = better thumbnail</span>
          </button>

          {/* Export */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('miansnap:export'))}
            style={{
              flex: '1 1 100px', padding: '14px 16px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            }}
          >⬇ Export</button>

          {/* Edit — reveals full editor */}
          <button
            onClick={exitZeroMode}
            style={{
              flex: '1 1 100px', padding: '14px 16px', borderRadius: 12,
              border: `1px solid ${theme.border}`,
              background: theme.bgTertiary,
              color: theme.text, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >✏️ Edit</button>

          {/* New upload */}
          <button
            onClick={openPicker}
            style={{
              flex: '0 0 auto', padding: '14px 14px', borderRadius: 12,
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.textMuted, fontSize: 12, cursor: 'pointer',
            }}
            title="Upload different file"
          >🔄 New</button>

          <style>{`
            @keyframes viralBarPulse {
              0%,100% { box-shadow: 0 6px 28px rgba(239,68,68,0.5); }
              50% { box-shadow: 0 6px 40px rgba(239,68,68,0.8), 0 0 0 5px rgba(239,68,68,0.1); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

export function useZeroMode() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('miansnap_zero_mode') !== 'false')
  useEffect(() => {
    const handler = () => setEnabled(localStorage.getItem('miansnap_zero_mode') !== 'false')
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
  return enabled
}
