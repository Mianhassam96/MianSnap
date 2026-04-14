import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'

const STEPS = [
  {
    icon: '🎬',
    title: 'Upload Your Video',
    desc: 'Drag & drop any video into the bottom panel, or click to browse. MP4, MOV, WebM all work.',
    action: 'Got it',
  },
  {
    icon: '🖼',
    title: 'Pick the Perfect Frame',
    desc: 'Use "⚡ Frames" to extract thumbnails, or "🧠 Smart Pick" to auto-detect the best moments.',
    action: 'Next',
  },
  {
    icon: '✨',
    title: 'Edit & Go Viral',
    desc: 'Add text, apply a style pack, or hit "⚡ Make it Viral" for instant AI enhancement. Then export.',
    action: 'Start Creating',
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

  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    },
    card: {
      background: theme.bgSecondary, borderRadius: 16, padding: '36px 32px',
      maxWidth: 400, width: '90%', textAlign: 'center',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    },
    icon: { fontSize: 52, marginBottom: 16 },
    title: { fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 10, letterSpacing: '-0.5px' },
    desc: { fontSize: 14, color: theme.textSecondary, lineHeight: 1.6, marginBottom: 28 },
    dots: { display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 },
    dot: (active) => ({
      width: active ? 20 : 8, height: 8, borderRadius: 4,
      background: active ? theme.accent : theme.border,
      transition: 'all 0.3s',
    }),
    btn: {
      padding: '12px 32px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
      transition: 'transform 0.15s',
    },
    skip: {
      marginTop: 12, background: 'none', border: 'none',
      color: theme.textMuted, fontSize: 12, cursor: 'pointer',
    },
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onDone()}>
      <div style={s.card}>
        <div style={s.icon}>{current.icon}</div>
        <div style={s.title}>{current.title}</div>
        <div style={s.desc}>{current.desc}</div>
        <div style={s.dots}>
          {STEPS.map((_, i) => <div key={i} style={s.dot(i === step)} />)}
        </div>
        <button style={s.btn} onClick={next}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {current.action}
        </button>
        <br />
        <button style={s.skip} onClick={onDone}>Skip tutorial</button>
      </div>
    </div>
  )
}

export function shouldShowOnboarding() {
  return !localStorage.getItem(STORAGE_KEY)
}
