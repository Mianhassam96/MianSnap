import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

export default function CanvasEmptyState({ onUploadVideo, onUploadImage, onUseTemplate }) {
  const { theme } = useUIStore()
  const { videoUrl } = useVideoStore()
  const [hovered, setHovered] = useState(null)

  if (videoUrl) return null

  const s = {
    wrap: {
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none', zIndex: 2,
    },
    inner: {
      textAlign: 'center', maxWidth: 360,
      pointerEvents: 'auto',
      animation: 'fadeIn 0.4s ease',
    },
    emoji: { fontSize: 44, marginBottom: 14, display: 'block' },
    title: {
      fontSize: 20, fontWeight: 900, color: theme.text,
      marginBottom: 8, letterSpacing: '-0.6px',
      fontFamily: "'Montserrat', sans-serif",
    },
    sub: {
      fontSize: 13, color: theme.textSecondary,
      lineHeight: 1.65, marginBottom: 28,
    },
    accent: { color: theme.accent, fontWeight: 600 },

    // 3 action cards
    cards: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 },
    card: (id) => ({
      padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
      border: `1px solid ${hovered === id ? theme.accent : theme.border}`,
      background: hovered === id ? theme.accentGlow : theme.bgSecondary,
      transition: 'all 0.18s',
      transform: hovered === id ? 'translateY(-3px)' : 'translateY(0)',
      boxShadow: hovered === id ? theme.shadowLg : 'none',
      minWidth: 100, textAlign: 'center',
    }),
    cardIcon: { fontSize: 24, marginBottom: 6 },
    cardLabel: {
      fontSize: 12, fontWeight: 700,
      color: hovered ? theme.text : theme.textSecondary,
    },
    cardSub: { fontSize: 10, color: theme.textMuted, marginTop: 2 },

    // Divider
    divider: {
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 16, color: theme.textMuted, fontSize: 11,
    },
    line: { flex: 1, height: 1, background: theme.border },

    // Template hint
    templateHint: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px', borderRadius: 10,
      background: theme.bgSecondary, border: `1px solid ${theme.border}`,
      cursor: 'pointer', transition: 'all 0.15s',
      fontSize: 12, color: theme.textSecondary,
    },
  }

  const CARDS = [
    { id: 'video', icon: '🎬', label: 'Upload Video', sub: 'AI picks frames', action: onUploadVideo },
    { id: 'image', icon: '🖼', label: 'Upload Image', sub: 'Edit directly', action: onUploadImage },
    { id: 'template', icon: '✨', label: 'Use Template', sub: 'Gaming, Drama...', action: onUseTemplate },
  ]

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <span style={s.emoji}>🚀</span>
        <div style={s.title}>Drop a video or start with a template</div>
        <div style={s.sub}>
          Upload a video and <span style={s.accent}>AI picks the best frames</span> automatically.<br />
          Or jump straight in with a ready-made style.
        </div>

        <div style={s.cards}>
          {CARDS.map(c => (
            <div key={c.id}
              style={s.card(c.id)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={c.action}
            >
              <div style={s.cardIcon}>{c.icon}</div>
              <div style={s.cardLabel}>{c.label}</div>
              <div style={s.cardSub}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={s.divider}>
          <div style={s.line} />
          <span>or drag a video file anywhere</span>
          <div style={s.line} />
        </div>
      </div>
    </div>
  )
}
