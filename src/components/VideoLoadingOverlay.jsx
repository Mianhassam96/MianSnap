import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

const LABELS = [
  'Reading video...',
  'Analyzing frames...',
  'Finding best moments...',
  'Almost ready...',
]

export default function VideoLoadingOverlay() {
  const { theme } = useUIStore()
  const { isExtracting, videoUrl, setIsExtracting, setFrames } = useVideoStore()
  const [labelIdx, setLabelIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (isExtracting) {
      setVisible(true); setFading(false); setLabelIdx(0); setProgress(0)
    } else if (visible) {
      setProgress(100); setFading(true)
      setTimeout(() => { setVisible(false); setFading(false) }, 500)
    }
  }, [isExtracting])

  useEffect(() => {
    if (!isExtracting) return
    let elapsed = 0
    const total = 3600
    const interval = setInterval(() => {
      elapsed += 80
      const pct = Math.min(95, (elapsed / total) * 100)
      setProgress(pct)
      setLabelIdx(Math.min(LABELS.length - 1, Math.floor((pct / 100) * LABELS.length)))
    }, 80)
    return () => clearInterval(interval)
  }, [isExtracting])

  function handleCancel() {
    setIsExtracting(false); setFrames([]); setVisible(false)
    window.showToast?.('Cancelled', 'info')
  }

  if (!visible || !videoUrl) return null

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: theme.isDark ? 'rgba(10,10,15,0.9)' : 'rgba(245,245,255,0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      borderRadius: 8,
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Icon */}
      <div style={{ fontSize: 34, animation: 'pulse 1.5s infinite' }}>🧠</div>

      {/* Single label — rotates through states */}
      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.2px' }}>
        {LABELS[labelIdx]}
      </div>

      {/* Single progress bar — clean, no percentage */}
      <div style={{ width: 180, height: 3, borderRadius: 2, background: theme.border, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg,#7c3aed,#4f46e5)',
          width: `${progress}%`,
          transition: 'width 0.15s ease',
        }} />
      </div>

      {/* Cancel — small, unobtrusive */}
      <button
        onClick={handleCancel}
        style={{
          padding: '4px 14px', borderRadius: 6,
          border: `1px solid ${theme.border}`, background: 'transparent',
          color: theme.textMuted, fontSize: 10, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
      >✕ Cancel</button>
    </div>
  )
}
