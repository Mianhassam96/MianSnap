import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

const STEPS = [
  { label: 'Reading video file...', duration: 600 },
  { label: 'Analyzing frames...', duration: 1200 },
  { label: 'Detecting best moments...', duration: 1400 },
  { label: 'Preparing editor...', duration: 600 },
]

export default function VideoLoadingOverlay() {
  const { theme } = useUIStore()
  const { isExtracting, videoUrl, setIsExtracting, setFrames, setVideoFile } = useVideoStore()
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (isExtracting) {
      setVisible(true)
      setFading(false)
      setStepIdx(0)
      setProgress(0)
    } else if (visible) {
      setProgress(100)
      setFading(true)
      setTimeout(() => { setVisible(false); setFading(false) }, 500)
    }
  }, [isExtracting])

  useEffect(() => {
    if (!isExtracting) return
    let elapsed = 0
    const total = STEPS.reduce((s, st) => s + st.duration, 0)
    const interval = setInterval(() => {
      elapsed += 80
      setProgress(Math.min(95, (elapsed / total) * 100))
      let acc = 0
      for (let i = 0; i < STEPS.length; i++) {
        acc += STEPS[i].duration
        if (elapsed < acc) { setStepIdx(i); break }
      }
    }, 80)
    return () => clearInterval(interval)
  }, [isExtracting])

  function handleCancel() {
    setIsExtracting(false)
    setFrames([])
    setVisible(false)
    window.showToast?.('Upload cancelled', 'info')
  }

  if (!visible || !videoUrl) return null

  const s = {
    overlay: {
      position: 'absolute', inset: 0, zIndex: 50,
      background: theme.isDark ? 'rgba(10,10,15,0.9)' : 'rgba(245,245,255,0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 14,
      borderRadius: 8,
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.5s ease',
      animation: 'scaleIn 0.2s ease',
    },
    icon: { fontSize: 38, animation: 'pulse 1.5s infinite' },
    label: { fontSize: 14, fontWeight: 700, color: theme.text, letterSpacing: '-0.3px' },
    sub: { fontSize: 11, color: theme.textMuted },
    barWrap: {
      width: 220, height: 5, borderRadius: 3,
      background: theme.border, overflow: 'hidden',
    },
    bar: {
      height: '100%', borderRadius: 3,
      background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed)',
      backgroundSize: '200% auto',
      width: `${progress}%`,
      transition: 'width 0.12s ease',
      animation: 'shimmer 1.5s linear infinite',
    },
    pct: { fontSize: 12, color: theme.accent, fontWeight: 800 },
    cancelBtn: {
      marginTop: 4, padding: '6px 18px', borderRadius: 6,
      border: `1px solid ${theme.border}`,
      background: 'transparent', color: theme.textMuted,
      fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
    },
  }

  return (
    <div style={s.overlay}>
      <div style={s.icon}>🧠</div>
      <div style={s.label}>{STEPS[stepIdx]?.label || 'Processing...'}</div>
      <div style={s.barWrap}><div style={s.bar} /></div>
      <div style={s.pct}>{Math.round(progress)}%</div>
      <div style={s.sub}>AI is finding the best frames for you</div>
      <button style={s.cancelBtn}
        onClick={handleCancel}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
      >
        ✕ Cancel
      </button>
    </div>
  )
}
