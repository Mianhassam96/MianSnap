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
  const { isExtracting, videoUrl } = useVideoStore()
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isExtracting) {
      setVisible(true)
      setStepIdx(0)
      setProgress(0)
    } else {
      // Fade out after extraction done
      setProgress(100)
      setTimeout(() => setVisible(false), 600)
    }
  }, [isExtracting])

  // Animate steps while extracting
  useEffect(() => {
    if (!isExtracting) return
    let elapsed = 0
    const total = STEPS.reduce((s, st) => s + st.duration, 0)
    const interval = setInterval(() => {
      elapsed += 80
      setProgress(Math.min(95, (elapsed / total) * 100))
      // Advance step
      let acc = 0
      for (let i = 0; i < STEPS.length; i++) {
        acc += STEPS[i].duration
        if (elapsed < acc) { setStepIdx(i); break }
      }
    }, 80)
    return () => clearInterval(interval)
  }, [isExtracting])

  if (!visible || !videoUrl) return null

  const s = {
    overlay: {
      position: 'absolute', inset: 0, zIndex: 50,
      background: theme.isDark ? 'rgba(10,10,15,0.88)' : 'rgba(245,245,255,0.88)',
      backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      borderRadius: 8,
      animation: 'fadeIn 0.2s ease',
      transition: 'opacity 0.4s ease',
      opacity: !isExtracting && progress >= 100 ? 0 : 1,
    },
    icon: { fontSize: 36 },
    label: { fontSize: 14, fontWeight: 600, color: theme.text },
    sub: { fontSize: 12, color: theme.textMuted },
    barWrap: {
      width: 240, height: 4, borderRadius: 2,
      background: theme.border, overflow: 'hidden',
    },
    bar: {
      height: '100%', borderRadius: 2,
      background: `linear-gradient(90deg,#7c3aed,#4f46e5)`,
      width: `${progress}%`,
      transition: 'width 0.15s ease',
    },
    pct: { fontSize: 11, color: theme.accent, fontWeight: 700 },
  }

  return (
    <div style={s.overlay}>
      <div style={s.icon}>🧠</div>
      <div style={s.label}>{STEPS[stepIdx]?.label || 'Processing...'}</div>
      <div style={s.barWrap}><div style={s.bar} /></div>
      <div style={s.pct}>{Math.round(progress)}%</div>
      <div style={s.sub}>AI is finding the best frames for you</div>
    </div>
  )
}
