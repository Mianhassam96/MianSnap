import React from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

const STEPS = [
  { icon: '🎬', text: 'Drop a video below to extract frames' },
  { icon: '🖼', text: 'Or upload an image as background' },
  { icon: '⚡', text: 'Then hit "Make Viral" to auto-enhance' },
]

export default function CanvasEmptyState({ onUploadVideo, onUploadImage }) {
  const { theme } = useUIStore()
  const { videoUrl } = useVideoStore()

  if (videoUrl) return null // hide once video is loaded

  const s = {
    wrap: {
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 2,
      gap: 0,
    },
    inner: {
      textAlign: 'center', maxWidth: 340,
      pointerEvents: 'auto',
    },
    icon: { fontSize: 40, marginBottom: 12 },
    title: {
      fontSize: 18, fontWeight: 800, color: theme.text,
      marginBottom: 6, letterSpacing: '-0.5px',
      fontFamily: "'Montserrat', sans-serif",
    },
    sub: {
      fontSize: 13, color: theme.textSecondary,
      lineHeight: 1.6, marginBottom: 24,
    },
    btnRow: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 },
    primaryBtn: {
      padding: '10px 22px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      boxShadow: '0 3px 16px rgba(124,58,237,0.4)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    },
    secondaryBtn: {
      padding: '10px 22px', borderRadius: 8,
      border: `1px solid ${theme.border}`,
      background: theme.bgSecondary, color: theme.text,
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      transition: 'all 0.15s',
    },
    steps: {
      display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
    },
    step: {
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: theme.textMuted,
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      padding: '6px 12px', borderRadius: 20,
    },
  }

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <div style={s.icon}>🎬</div>
        <div style={s.title}>Create your first thumbnail</div>
        <div style={s.sub}>
          Upload a video to extract the best frames automatically,<br />
          or start with an image.
        </div>
        <div style={s.btnRow}>
          <button style={s.primaryBtn} onClick={onUploadVideo}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 16px rgba(124,58,237,0.4)' }}
          >
            🎬 Upload Video
          </button>
          <button style={s.secondaryBtn} onClick={onUploadImage}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text }}
          >
            🖼 Upload Image
          </button>
        </div>
        <div style={s.steps}>
          {STEPS.map((s2, i) => (
            <div key={i} style={s.step}>
              <span>{s2.icon}</span>
              <span>{s2.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
