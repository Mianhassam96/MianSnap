import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import { makeItViral } from '../utils/makeItViral'
import { applyThumbnailStyle, STYLES } from '../utils/thumbnailStyles'
import { calculateViralScore } from '../utils/viralScore'
import { fabric } from '../lib/fabric'

const QUICK_STYLES = ['dramatic', 'gaming', 'viral', 'mrbeast']

export default function QuickMode({ onExport }) {
  const { theme, setActiveRightPanel } = useUIStore()
  const { fabricCanvas, setViralScore } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState('')
  const [done, setDone] = useState(false)
  const [ytRunning, setYtRunning] = useState(false)
  const [ytDone, setYtDone] = useState(false)

  async function handleQuickMode() {
    if (!fabricCanvas || running) return
    setRunning(true)
    setDone(false)

    setStep('🎨 Applying style...')
    const styleKey = QUICK_STYLES[Math.floor(Math.random() * QUICK_STYLES.length)]
    applyThumbnailStyle(fabricCanvas, styleKey)
    await delay(400)

    setStep('⚡ Enhancing...')
    await makeItViral(fabricCanvas)
    await delay(300)

    setStep('📊 Scoring...')
    const score = calculateViralScore(fabricCanvas)
    if (score) { setViralScore(score); setActiveRightPanel('score') }
    await delay(200)

    setStep('')
    setRunning(false)
    setDone(true)
    window.showToast?.(`⚡ Quick Mode done! ${STYLES[styleKey]?.label} applied`, 'success')
    // Dispatch viralDone so BeforeAfter auto-updates
    window.dispatchEvent(new CustomEvent('miansnap:viralDone'))
    setTimeout(() => setDone(false), 4000)
  }

  async function handleYouTubePack() {
    if (!fabricCanvas || ytRunning) return
    setYtRunning(true)
    setYtDone(false)

    // 1. Apply mrbeast style (most YouTube-native)
    applyThumbnailStyle(fabricCanvas, 'mrbeast')
    await delay(300)

    // 2. Make viral enhancements
    await makeItViral(fabricCanvas)
    await delay(200)

    // 3. Add YouTube-optimized text pack if no text exists
    const hasText = fabricCanvas.getObjects().some(o => o.type === 'i-text' || o.type === 'textbox')
    if (!hasText) {
      const titles = [
        'YOU WON\'T BELIEVE THIS',
        'WATCH UNTIL THE END...',
        'THIS CHANGED EVERYTHING',
        'I CAN\'T BELIEVE THIS HAPPENED',
      ]
      const title = titles[Math.floor(Math.random() * titles.length)]
      const mainText = new fabric.IText(title, {
        left: fabricCanvas.width / 2,
        top: fabricCanvas.height * 0.8,
        originX: 'center', originY: 'center',
        fontFamily: 'Impact',
        fontSize: 80,
        fill: '#ffff00',
        stroke: '#000000',
        strokeWidth: 4,
        shadow: new fabric.Shadow({ color: '#ff8800', blur: 30, offsetX: 3, offsetY: 3 }),
        _ytPack: true,
      })
      fabricCanvas.add(mainText)
    }

    // 4. Score
    const score = calculateViralScore(fabricCanvas)
    if (score) { setViralScore(score); setActiveRightPanel('score') }

    fabricCanvas.renderAll()
    setYtRunning(false)
    setYtDone(true)
    window.showToast?.('🎬 YouTube Pack applied! Ready to export.', 'success')
    setTimeout(() => setYtDone(false), 4000)
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

      {/* YouTube Pack */}
      <button
        onClick={handleYouTubePack}
        disabled={ytRunning}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 9, border: 'none',
          background: ytDone
            ? 'linear-gradient(135deg,#16a34a,#15803d)'
            : ytRunning
            ? theme.bgTertiary
            : 'linear-gradient(135deg,#ff0000,#cc0000)',
          color: ytRunning ? theme.textSecondary : '#fff',
          fontSize: 13, fontWeight: 700, cursor: ytRunning ? 'wait' : 'pointer',
          boxShadow: ytDone ? '0 3px 14px rgba(22,163,74,0.4)' : ytRunning ? 'none' : '0 3px 18px rgba(255,0,0,0.35)',
          transition: 'all 0.3s', marginTop: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
        onMouseEnter={(e) => { if (!ytRunning && !ytDone) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,0,0,0.5)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {ytRunning ? '⏳ Building...' : ytDone ? '✓ YouTube Pack Done!' : '🎬 YouTube Pack'}
      </button>
      {!ytRunning && !ytDone && (
        <div style={s.desc}>Frame + text + style + glow — full thumbnail in 1 click</div>
      )}
    </div>
  )
}
