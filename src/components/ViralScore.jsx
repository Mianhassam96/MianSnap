import React, { useState } from 'react'
import useStore from '../store/useStore'
import { calculateViralScore } from '../utils/viralScore'

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  scoreBox: {
    background: '#111118',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    border: '1px solid #222',
  },
  scoreNum: { fontSize: 52, fontWeight: 800, lineHeight: 1 },
  scoreLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  bar: { height: 6, borderRadius: 3, background: '#1a1a2e', marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
  analyzeBtn: {
    padding: '10px 0',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  feedback: { display: 'flex', flexDirection: 'column', gap: 6 },
  item: {
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 12,
    lineHeight: 1.4,
  },
  good: { background: '#0a1f0a', color: '#4ade80', border: '1px solid #1a3a1a' },
  warn: { background: '#1f0a0a', color: '#f87171', border: '1px solid #3a1a1a' },
}

function getScoreColor(score) {
  if (score >= 75) return '#4ade80'
  if (score >= 50) return '#facc15'
  return '#f87171'
}

function getScoreEmoji(score) {
  if (score >= 80) return '🔥'
  if (score >= 60) return '⚡'
  if (score >= 40) return '⚠️'
  return '❌'
}

export default function ViralScore() {
  const { fabricCanvas, viralScore, setViralScore } = useStore()
  const [analyzing, setAnalyzing] = useState(false)

  function analyze() {
    if (!fabricCanvas) return
    setAnalyzing(true)
    setTimeout(() => {
      const result = calculateViralScore(fabricCanvas)
      setViralScore(result)
      setAnalyzing(false)
    }, 600)
  }

  return (
    <div style={styles.wrap}>
      <button style={styles.analyzeBtn} onClick={analyze} disabled={analyzing || !fabricCanvas}>
        {analyzing ? 'Analyzing...' : '⚡ Analyze Viral Score'}
      </button>

      {viralScore && (
        <>
          <div style={styles.scoreBox}>
            <div style={{ ...styles.scoreNum, color: getScoreColor(viralScore.score) }}>
              {getScoreEmoji(viralScore.score)} {viralScore.score}
            </div>
            <div style={styles.scoreLabel}>Viral Potential Score / 100</div>
            <div style={styles.bar}>
              <div style={{
                ...styles.barFill,
                width: `${viralScore.score}%`,
                background: getScoreColor(viralScore.score),
              }} />
            </div>
          </div>

          <div style={styles.feedback}>
            {viralScore.feedback.map((f, i) => (
              <div key={i} style={{ ...styles.item, ...(f.type === 'good' ? styles.good : styles.warn) }}>
                {f.type === 'good' ? '✓ ' : '⚠ '}{f.msg}
              </div>
            ))}
          </div>
        </>
      )}

      {!viralScore && (
        <div style={{ fontSize: 12, color: '#555', textAlign: 'center', padding: 12 }}>
          Add elements to your canvas then analyze
        </div>
      )}
    </div>
  )
}
