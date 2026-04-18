import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { applyThumbnailStyle } from '../utils/thumbnailStyles'

// Rotates daily using day-of-year as seed — no API needed
const ALL_TRENDING = [
  { key: 'mrbeast',  label: 'MrBeast Zoom Face',   tag: '🔥 #1 Today',   desc: 'Yellow text, bold shadow, warm glow' },
  { key: 'news',     label: 'Breaking News Red',    tag: '📈 Trending',   desc: 'Red urgency, high contrast, bold font' },
  { key: 'dramatic', label: 'Dark Drama Glow',      tag: '🌙 Hot Tonight', desc: 'Deep shadows, red glow, emotional' },
  { key: 'gaming',   label: 'Neon Gaming Pop',      tag: '🎮 Rising',     desc: 'Cyan/magenta neon, dark bg' },
  { key: 'viral',    label: 'Viral Yellow Burst',   tag: '⚡ Viral Now',  desc: 'Yellow text, purple glow, high energy' },
  { key: 'horror',   label: 'Horror Desaturated',   tag: '👻 Trending',   desc: 'B&W with red text, scary vibe' },
  { key: 'tutorial', label: 'Clean Blue Tutorial',  tag: '📚 Popular',    desc: 'Blue glow, clean white text' },
  { key: 'money',    label: 'Money Green Glow',     tag: '💰 Hot',        desc: 'Green neon, finance/hustle vibe' },
  { key: 'sports',   label: 'Sports Hype Yellow',   tag: '⚽ Trending',   desc: 'Yellow on dark, high energy' },
  { key: 'minimal',  label: 'Clean Minimal White',  tag: '🤍 Rising',     desc: 'Minimal, elegant, premium feel' },
]

function getDailyTrending() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const offset = dayOfYear % ALL_TRENDING.length
  // Return 4 styles rotated by day
  return [
    ALL_TRENDING[offset % ALL_TRENDING.length],
    ALL_TRENDING[(offset + 1) % ALL_TRENDING.length],
    ALL_TRENDING[(offset + 2) % ALL_TRENDING.length],
    ALL_TRENDING[(offset + 3) % ALL_TRENDING.length],
  ]
}

const TRENDING = getDailyTrending()

export default function TrendingStyles() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [applied, setApplied] = useState(null)

  function handleApply(key) {
    if (!fabricCanvas) return
    applyThumbnailStyle(fabricCanvas, key)
    setApplied(key)
    window.showToast?.(`🔥 Trending style applied!`, 'success')
    setTimeout(() => setApplied(null), 2500)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          🔥 Trending Today
        </div>
        <div style={{ fontSize: 9, color: theme.textMuted }}>{today}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {TRENDING.map((t) => (
          <button
            key={t.key}
            onClick={() => handleApply(t.key)}
            style={{
              width: '100%', padding: '9px 11px', borderRadius: 7, cursor: 'pointer',
              border: `1px solid ${applied === t.key ? theme.accent : theme.border}`,
              background: applied === t.key ? theme.accentGlow : theme.bgTertiary,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.15s', textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => {
              if (applied !== t.key) {
                e.currentTarget.style.borderColor = theme.border
                e.currentTarget.style.background = theme.bgTertiary
              }
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{t.label}</div>
              <div style={{ fontSize: 9, color: theme.textMuted, marginTop: 1 }}>{t.desc}</div>
            </div>
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0,
              background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(239,68,68,0.2))',
              color: theme.accent, fontWeight: 700, border: `1px solid ${theme.border}`,
            }}>
              {applied === t.key ? '✓' : t.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
