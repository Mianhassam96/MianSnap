import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import { track } from '../utils/analytics'

const QUESTIONS = [
  { id: 'confusing', label: '😕 Something was confusing' },
  { id: 'missing',   label: '🔍 A feature I needed was missing' },
  { id: 'slow',      label: '🐢 It felt slow or laggy' },
  { id: 'love',      label: '❤️ I love it!' },
  { id: 'other',     label: '💬 Other feedback' },
]

export default function FeedbackButton() {
  const { theme } = useUIStore()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  function submit() {
    if (!selected) return
    track('feedback_submitted', { type: selected, text: text.slice(0, 200) })
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setSelected(null); setText('') }, 2000)
    window.showToast?.('Thanks for your feedback! 🙏', 'success')
  }

  return (
    <>
      {/* Floating feedback tab */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', right: -28, top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          zIndex: 190,
          padding: '6px 14px', borderRadius: '0 0 8px 8px',
          border: `1px solid ${theme.border}`,
          background: theme.bgSecondary, color: theme.textMuted,
          fontSize: 11, fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.15s', letterSpacing: 0.3,
          boxShadow: '-2px 0 12px rgba(0,0,0,0.15)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = theme.accent; e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.right = '-20px' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.right = '-28px' }}
      >
        💬 Feedback
      </button>

      {/* Modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.15s ease',
        }} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div style={{
            background: theme.bgSecondary, borderRadius: 16,
            padding: '28px 28px', maxWidth: 400, width: '92%',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.2s ease',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>Thank you!</div>
                <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6 }}>Your feedback helps improve MianSnap.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: theme.text }}>💬 Quick Feedback</div>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>

                <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 14 }}>What's on your mind?</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {QUESTIONS.map(q => (
                    <button key={q.id}
                      onClick={() => setSelected(q.id)}
                      style={{
                        padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                        border: `1px solid ${selected === q.id ? theme.accent : theme.border}`,
                        background: selected === q.id ? theme.accentGlow : theme.bgTertiary,
                        color: selected === q.id ? theme.accent : theme.text,
                        fontSize: 13, fontWeight: selected === q.id ? 600 : 400,
                        textAlign: 'left', transition: 'all 0.12s',
                      }}
                    >{q.label}</button>
                  ))}
                </div>

                {selected && (
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Tell us more (optional)..."
                    maxLength={200}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                      color: theme.text, fontSize: 12, resize: 'none', height: 72,
                      outline: 'none', marginBottom: 14, boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                )}

                <button
                  onClick={submit}
                  disabled={!selected}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                    background: selected ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : theme.border,
                    color: selected ? '#fff' : theme.textMuted,
                    fontSize: 13, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  Send Feedback
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
