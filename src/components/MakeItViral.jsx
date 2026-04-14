import React, { useState } from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useUIStore from '../store/useUIStore'
import { makeItViral } from '../utils/makeItViral'

export default function MakeItViral() {
  const { fabricCanvas } = useCanvasStore()
  const { theme } = useUIStore()
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState([])
  const [done, setDone] = useState(false)

  async function handleClick() {
    if (!fabricCanvas) return
    setRunning(true)
    setSteps([])
    setDone(false)

    // Animate steps appearing one by one
    const result = await makeItViral(fabricCanvas)
    for (let i = 0; i < result.steps.length; i++) {
      await new Promise((r) => setTimeout(r, 300))
      setSteps((prev) => [...prev, result.steps[i]])
    }
    setRunning(false)
    setDone(true)
  }

  const s = {
    wrap: { marginBottom: 16 },
    btn: {
      width: '100%', padding: '14px', borderRadius: 10, border: 'none',
      background: running || done
        ? theme.bgTertiary
        : 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
      backgroundSize: '200% auto',
      color: running || done ? theme.textSecondary : '#fff',
      fontSize: 15, fontWeight: 800, cursor: running ? 'wait' : 'pointer',
      letterSpacing: '-0.3px',
      boxShadow: running || done ? 'none' : '0 4px 24px rgba(239,68,68,0.4)',
      transition: 'all 0.3s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    steps: {
      marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4,
    },
    step: {
      fontSize: 11, color: theme.success, padding: '4px 8px',
      background: theme.successBg, borderRadius: 5,
      border: `1px solid ${theme.isDark ? '#1a3a1a' : '#c0e0c0'}`,
      animation: 'fadeIn 0.3s ease',
    },
    reset: {
      marginTop: 6, width: '100%', padding: '6px', borderRadius: 6,
      border: `1px solid ${theme.border}`, background: 'transparent',
      color: theme.textMuted, fontSize: 11, cursor: 'pointer',
    },
  }

  return (
    <div style={s.wrap}>
      <button style={s.btn} onClick={handleClick} disabled={running}
        onMouseEnter={(e) => { if (!running && !done) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(239,68,68,0.5)' } }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = running || done ? 'none' : '0 4px 24px rgba(239,68,68,0.4)' }}
      >
        {running ? '⏳ Working magic...' : done ? '✓ Done! Click again to re-apply' : '⚡ Make it Viral'}
      </button>

      {steps.length > 0 && (
        <div style={s.steps}>
          {steps.map((step, i) => (
            <div key={i} style={s.step}>{step}</div>
          ))}
        </div>
      )}

      {done && (
        <button style={s.reset} onClick={() => { setSteps([]); setDone(false) }}>
          Reset
        </button>
      )}
    </div>
  )
}
