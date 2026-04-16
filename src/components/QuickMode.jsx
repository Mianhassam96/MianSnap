import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { makeItViral } from '../utils/makeItViral'
import { applyThumbnailStyle, STYLES } from '../utils/thumbnailStyles'
import { calculateViralScore } from '../utils/viralScore'

const QUICK_STYLES = ['dramatic', 'gaming', 'viral', 'mrbeast']

export default function QuickMode({ onExport }) {
  const { theme, setActiveRightPanel } = useUIStore()
  const { fabricCanvas, setViralScore } = useCanvasStore()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState('')
  const [done, setDone] = useState(false)

  async function handleQuickMode() {
    if (!fabricCanvas || running) return
    setRunning(true)
    setDone(false)

    // Step 1: Apply a random style
    setStep('🎨 Applying style...')
    const styleKey = QUICK_STYLES[Math.floor(Math.random() * QUICK_STYLES.length)]
    applyThumbnailStyle(fabricCanvas, styleKey)
    await delay(400)

    // Step 2: Make viral
    setStep('⚡ Enhancing...')
    await makeItViral(fabricCanvas)
    await delay(300)

    // Step 3: Score
    setStep('📊 Scoring...')
    const score = calculateViralScore(fabricCanvas)
    if (score) { setViralScore(score); setActiveRightPanel('score') }
    await delay(200)

    setStep('')
    setRunning(false)
    setDone(true)
    window.showToast?.(`⚡ Quick Mode done! ${STYLES[styleKey]?.label} applied`, 'success')
    setTimeout(() => setDone(false), 4000)
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

  const s = {
    wrap: { marginBottom: 12 },
    btn: {
      width: '100%', padding: '11px 14px', borderRadius: 9, border: 'none',
      background: done
        ? 'linear-gradient(135deg,#16a34a,#15803d)'
        : running
        ? theme.bgTertiary
        : 'linear-gradient(135deg,#0ea5e9,#6366f1,#7c3aed)',
      color: done || !running ? '#fff' : theme.textSecondary,
      fontSize: 13, fontWeight: 700, cursor: running ? 'wait' : 'pointer',
      boxShadow: done ? '0 3px 14px rgba(22,163,74,0.4)' : running ? 'none' : '0 3px 18px rgba(99,102,241,0.4)',
      transition: 'all 0.3s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    stepText: {
      fontSize: 10, color: theme.accent, textAlign: 'center',
      marginTop: 5, animation: 'pulse 1s infinite',
    },
    desc: { fontSize: 10, color: theme.textMuted, textAlign: 'center', marginTop: 5, lineHeight: 1.4 },
  }

  return (
    <div style={s.wrap}>
      <button style={s.btn} onClick={handleQuickMode} disabled={running}
        onMouseEnter={(e) => { if (!running && !done) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = done ? '0 3px 14px rgba(22,163,74,0.4)' : running ? 'none' : '0 3px 18px rgba(99,102,241,0.4)' }}
      >
        {running ? '⏳' : done ? '✓' : '🚀'}
        {running ? step || 'Working...' : done ? 'Done! Click again' : 'Quick Mode'}
      </button>
      {!running && !done && (
        <div style={s.desc}>Auto style + enhance + score in one click</div>
      )}
    </div>
  )
}
