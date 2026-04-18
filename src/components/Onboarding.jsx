import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'

const STEPS = [
  {
    icon: '🎬',
    title: 'Upload Your Video',
    desc: 'Drop any video anywhere on the canvas — AI instantly picks the best frames for you.',
    action: 'Got it →',
  },
  {
    icon: '⚡',
    title: 'Hit Quick Mode',
    desc: 'One click applies a style, enhances contrast, and scores your thumbnail. Done in 5 seconds.',
    action: 'Nice →',
  },
  {
    icon: '🚀',
    title: 'Export & Share',
    desc: 'Download as PNG or JPG in 720p or 1080p. Your projects auto-save — come back anytime.',
    action: "Let's go!",
  },
]

const STORAGE_KEY = 'miansnap_onboarding_done'

export default function Onboarding({ onDone }) {
  const { theme } = useUIStore()
  const [step, setStep] = useState(0)

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      localStorage.setItem(STORAGE_KEY, '1')
      onDone()
    }
  }

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(6px)',
    }} onClick={(e) => e.target === e.currentTarget && onDone()}>
      <div style={{
        background: theme.bgSecondary, borderRadius: 20, padding: '40px 36px',
        maxWidth: 420, width: '92%', textAlign: 'center',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        animation: 'scaleIn 0.2s ease',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: theme.border, borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ fontSize: 56, marginBottom: 20 }}>{current.icon}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 12, letterSpacing: '-0.5px', fontFamily: "'Montserrat',sans-serif" }}>
          {current.title}
        </div>
        <div style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 1.65, marginBottom: 32 }}>
          {current.desc}
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? theme.accent : i < step ? theme.accent + '66' : theme.border,
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        <button
          onClick={next}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.5)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)' }}
        >
          {current.action}
        </button>

        <button
          onClick={onDone}
          style={{ marginTop: 12, background: 'none', border: 'none', color: theme.textMuted, fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}
        >
          Skip tutorial
        </button>
      </div>
    </div>
  )
}

export function shouldShowOnboarding() {
  return !localStorage.getItem(STORAGE_KEY)
}
