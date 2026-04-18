import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

const STEPS = [
  { label: 'Reading video...', sub: 'Loading your file', duration: 500 },
  { label: 'Analyzing frames...', sub: 'Scanning for best moments', duration: 1200 },
  { label: 'Detecting faces & motion...', sub: 'AI scoring each frame', duration: 1400 },
  { label: 'Almost ready...', sub: 'Preparing your canvas', duration: 500 },
]

export default function VideoLoadingOverlay() {
  const { theme } = useUIStore()
  const { isExtracting, videoUrl, setIsExtracting, setFrames } = useVideoStore()
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (isExtracting) {
      setVisible(true); setFading(false); setStepIdx(0); setProgress(0)
    } else if (visible) {
      setProgress(100); setFading(true)
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
    setIsExtracting(false); setFrames([]); setVisible(false)
    window.showToast?.('Cancelled', 'info')
  }

  if (!visible || !videoUrl) return null

  const step = STEPS[stepIdx] || STEPS[STEPS.length - 1]

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: theme.isDark ? 'rgba(10,10,15,0.92)' : 'rgba(245,245,255,0.92)',
      backdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      borderRadius: 8,
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Animated brain icon */}
      <div style={{ fontSize: 36, animation: 'pulse 1.5s infinite' }}>🧠</div>

      {/* State label — primary */}
      <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, letterSpacing: '-0.3px' }}>
        {step.label}
      </div>

      {/* State label — secondary */}
      <div style={{ fontSize: 11, color: theme.textMuted }}>{step.sub}</div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed)',
          backgroundSize: '200% auto',
          width: `${progress}%`,
          transition: 'width 0.12s ease',
          animation: 'shimmer 1.5s linear infinite',
        }} />
      </div>

      {/* Percentage */}
      <div style={{ fontSize: 11, color: theme.accent, fontWeight: 700 }}>
        {Math.round(progress)}%
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 5 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === stepIdx ? 16 : 6, height: 6, borderRadius: 3,
            background: i <= stepIdx ? theme.accent : theme.border,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      <button
        onClick={handleCancel}
        style={{
          marginTop: 4, padding: '5px 16px', borderRadius: 6,
          border: `1px solid ${theme.border}`, background: 'transparent',
          color: theme.textMuted, fontSize: 11, cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
      >✕ Cancel</button>
    </div>
  )
}
