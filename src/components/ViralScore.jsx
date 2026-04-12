import React, { useState } from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useUIStore from '../store/useUIStore'
import { calculateViralScore } from '../utils/viralScore'

export default function ViralScore() {
  const { fabricCanvas, viralScore, setViralScore } = useCanvasStore()
  const { theme } = useUIStore()
  const [analyzing, setAnalyzing] = useState(false)

  function analyze() {
    if (!fabricCanvas) return
    setAnalyzing(true)
    setTimeout(() => {
      setViralScore(calculateViralScore(fabricCanvas))
      setAnalyzing(false)
    }, 600)
  }

  const color = viralScore ? (viralScore.score >= 75 ? theme.success : viralScore.score >= 50 ? theme.warning : theme.danger) : theme.accent
  const emoji = viralScore ? (viralScore.score >= 80 ? '🔥' : viralScore.score >= 60 ? '⚡' : viralScore.score >= 40 ? '⚠️' : '❌') : ''

  const s = {
    btn: {
      width: '100%', padding: '9px', borderRadius: 7, border: 'none',
      background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
    },
    scoreBox: {
      background: theme.bgTertiary, borderRadius: 10, padding: 14, textAlign: 'center',
      border: `1px solid ${theme.border}`, marginBottom: 8,
    },
    scoreNum: { fontSize: 44, fontWeight: 800, lineHeight: 1, color },
    bar: { height: 5, borderRadius: 3, background: theme.border, marginTop: 8, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: 3, background: color, transition: 'width 0.6s ease' },
    item: (type) => ({
      padding: '6px 10px', borderRadius: 5, fontSize: 11, marginBottom: 4, lineHeight: 1.4,
      background: type === 'good' ? (theme.isDark ? '#0a1f0a' : '#f0fff0') : (theme.isDark ? '#1f0a0a' : '#fff0f0'),
      color: type === 'good' ? theme.success : theme.danger,
      border: `1px solid ${type === 'good' ? (theme.isDark ? '#1a3a1a' : '#c0e0c0') : (theme.isDark ? '#3a1a1a' : '#e0c0c0')}`,
    }),
  }

  return (
    <div>
      <button style={s.btn} onClick={analyze} disabled={analyzing || !fabricCanvas}>
        {analyzing ? 'Analyzing...' : '⚡ Analyze Viral Score'}
      </button>
      {viralScore && (
        <>
          <div style={s.scoreBox}>
            <div style={s.scoreNum}>{emoji} {viralScore.score}</div>
            <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>Viral Potential / 100</div>
            <div style={s.bar}><div style={{ ...s.barFill, width: `${viralScore.score}%` }} /></div>
          </div>
          {viralScore.feedback.map((f, i) => (
            <div key={i} style={s.item(f.type)}>{f.type === 'good' ? '✓ ' : '⚠ '}{f.msg}</div>
          ))}
        </>
      )}
      {!viralScore && (
        <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', padding: 12 }}>
          Add elements to canvas then analyze
        </div>
      )}
    </div>
  )
}
