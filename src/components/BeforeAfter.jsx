import React, { useState, useRef, useEffect } from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import useUIStore from '../store/useUIStore'

export default function BeforeAfter() {
  const { fabricCanvas } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const { theme } = useUIStore()
  const [beforeUrl, setBeforeUrl] = useState(null)
  const [afterUrl, setAfterUrl] = useState(null)
  const [sliderX, setSliderX] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [autoFlashing, setAutoFlashing] = useState(false)
  const containerRef = useRef(null)

  // Auto-capture "before" when frame is first selected
  useEffect(() => {
    if (selectedFrame?.dataUrl && !beforeUrl) {
      setBeforeUrl(selectedFrame.dataUrl)
    }
  }, [selectedFrame])

  // Listen for Make Viral completion → auto flash before/after
  useEffect(() => {
    const handler = () => {
      if (!fabricCanvas || !beforeUrl) return
      // Capture "after" state
      const after = fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.9 })
      setAfterUrl(after)
      // Auto-animate slider: sweep from 0→100→50
      setAutoFlashing(true)
      setSliderX(0)
      setTimeout(() => setSliderX(100), 400)
      setTimeout(() => setSliderX(50), 900)
      setTimeout(() => setAutoFlashing(false), 1200)
    }
    window.addEventListener('miansnap:viralDone', handler)
    return () => window.removeEventListener('miansnap:viralDone', handler)
  }, [fabricCanvas, beforeUrl])

  function capture() {
    if (!fabricCanvas) return
    setAfterUrl(fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.9 }))
  }

  function captureAsBefore() {
    if (!fabricCanvas) return
    setBeforeUrl(fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.9 }))
    window.showToast?.('Before state saved', 'info')
  }

  function handleMouseMove(e) {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setSliderX(Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100)))
  }

  function handleTouchMove(e) {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setSliderX(Math.max(5, Math.min(95, ((e.touches[0].clientX - rect.left) / rect.width) * 100)))
  }

  const btn = {
    flex: 1, padding: '8px', borderRadius: 7, border: 'none',
    background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
    color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
        Before / After
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button style={{ ...btn, background: theme.bgTertiary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
          onClick={captureAsBefore}>📷 Set Before</button>
        <button style={btn} onClick={capture}>📸 Set After</button>
      </div>

      {(!beforeUrl || !afterUrl) && (
        <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', padding: '8px 0', lineHeight: 1.5 }}>
          {!beforeUrl
            ? 'Load a frame or click "Set Before" to start'
            : 'Edit canvas then click "Set After" to compare'}
          <br />
          <span style={{ fontSize: 10, color: theme.accent }}>Auto-updates after Make Viral ⚡</span>
        </div>
      )}

      {beforeUrl && afterUrl && (
        <div
          ref={containerRef}
          style={{
            position: 'relative', width: '100%', aspectRatio: '16/9',
            borderRadius: 8, overflow: 'hidden', cursor: 'ew-resize',
            border: `1px solid ${autoFlashing ? theme.accent : theme.border}`,
            userSelect: 'none',
            transition: 'border-color 0.3s',
            boxShadow: autoFlashing ? `0 0 0 2px ${theme.accentGlow}` : 'none',
          }}
          onMouseMove={handleMouseMove}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchMove={handleTouchMove}
          onTouchStart={() => setDragging(true)}
          onTouchEnd={() => setDragging(false)}
        >
          <img src={beforeUrl} alt="Before" draggable={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${sliderX}%)`, transition: autoFlashing ? 'clip-path 0.4s ease' : 'none' }}>
            <img src={afterUrl} alt="After" draggable={false}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Labels */}
          {['BEFORE', 'AFTER'].map((l, i) => (
            <div key={l} style={{
              position: 'absolute', top: 8, [i === 0 ? 'left' : 'right']: 8,
              background: 'rgba(0,0,0,0.65)', color: '#fff',
              fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: 1,
            }}>{l}</div>
          ))}

          {/* Divider */}
          <div style={{
            position: 'absolute', top: 0, left: `${sliderX}%`, width: 2, height: '100%',
            background: '#fff', boxShadow: '0 0 8px rgba(0,0,0,0.5)',
            transform: 'translateX(-50%)',
            transition: autoFlashing ? 'left 0.4s ease' : 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: `${sliderX}%`,
            transform: 'translate(-50%,-50%)',
            width: 28, height: 28, borderRadius: '50%',
            background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#333', fontWeight: 700,
            transition: autoFlashing ? 'left 0.4s ease' : 'none',
          }}>⇔</div>
        </div>
      )}
    </div>
  )
}
