import React, { useState, useEffect } from 'react'

const STEPS = [
  { icon: '🔍', text: 'Extracting main claim…',         duration: 600  },
  { icon: '🌐', text: 'Checking source signals…',       duration: 700  },
  { icon: '🧠', text: 'Running AI risk analysis…',      duration: 700  },
  { icon: '📊', text: 'Calculating trust score…',       duration: 500  },
  { icon: '✅', text: 'Generating Trust Card…',         duration: 400  },
]

export default function AnalyzingScreen({ content }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let elapsed = 0
    const total = STEPS.reduce((s, st) => s + st.duration, 0)
    let stepIndex = 0

    const advance = () => {
      if (stepIndex >= STEPS.length) return
      const step = STEPS[stepIndex]
      elapsed += step.duration
      setCurrentStep(stepIndex)
      setProgress(Math.round((elapsed / total) * 100))
      stepIndex++
      if (stepIndex < STEPS.length) {
        setTimeout(advance, step.duration)
      }
    }

    const t = setTimeout(advance, 100)
    return () => clearTimeout(t)
  }, [])

  // Smooth progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.5, 98))
    }, 40)
    return () => clearInterval(interval)
  }, [])

  const preview = content.slice(0, 80) + (content.length > 80 ? '…' : '')

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      animation: 'fadeIn .4s ease',
    }}>
      {/* Spinner ring */}
      <div style={{ position: 'relative', width: 100, height: 100, marginBottom: '32px' }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke="url(#grad)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset .3s ease' }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px',
          animation: 'pulse 1.5s ease infinite',
        }}>
          {STEPS[currentStep]?.icon || '🛡️'}
        </div>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: '24px', fontWeight: 800, color: '#f0f0ff',
        marginBottom: '8px', letterSpacing: '-0.5px',
      }}>
        Analyzing content…
      </h2>

      {/* Current step */}
      <p style={{
        fontSize: '15px', color: '#6366f1', fontWeight: 500,
        marginBottom: '32px', minHeight: '24px',
        animation: 'fadeIn .3s ease',
        key: currentStep,
      }}>
        {STEPS[currentStep]?.text}
      </p>

      {/* Progress bar */}
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgba(99,102,241,0.1)',
        borderRadius: '100px', height: '6px',
        marginBottom: '32px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
          borderRadius: '100px',
          transition: 'width .3s ease',
          boxShadow: '0 0 10px rgba(99,102,241,0.5)',
        }} />
      </div>

      {/* Steps list */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        width: '100%', maxWidth: '360px',
      }}>
        {STEPS.map((step, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 16px',
              background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
              borderRadius: '10px',
              transition: 'all .3s',
              opacity: done ? 0.5 : active ? 1 : 0.3,
            }}>
              <span style={{ fontSize: '18px', minWidth: '24px' }}>
                {done ? '✅' : step.icon}
              </span>
              <span style={{
                fontSize: '14px',
                color: active ? '#a5b4fc' : done ? '#64748b' : '#475569',
                fontWeight: active ? 600 : 400,
              }}>
                {step.text}
              </span>
              {active && (
                <div style={{
                  marginLeft: 'auto',
                  width: '16px', height: '16px',
                  border: '2px solid #6366f1',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin .8s linear infinite',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Content preview */}
      <div style={{
        marginTop: '32px',
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(99,102,241,0.1)',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '100%',
      }}>
        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>Analyzing:</p>
        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic' }}>
          "{preview}"
        </p>
      </div>
    </div>
  )
}
