import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useProjectStore from '../store/useProjectStore'
import useCanvasStore from '../store/useCanvasStore'
import { fabric } from '../lib/fabric'

const MODES = [
  {
    id: 'video',
    icon: '🎬',
    title: 'Start from Video',
    desc: 'Upload a video and extract the perfect frame automatically.',
    cta: 'Upload Video',
    gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    glow: 'rgba(124,58,237,0.35)',
  },
  {
    id: 'template',
    icon: '✨',
    title: 'Start from Template',
    desc: 'Pick a ready-made style — Gaming, Drama, News, Viral and more.',
    cta: 'Browse Templates',
    gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    glow: 'rgba(239,68,68,0.35)',
  },
  {
    id: 'image',
    icon: '🖼',
    title: 'Quick Edit Image',
    desc: 'Upload an image directly and start editing right away.',
    cta: 'Upload Image',
    gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
    glow: 'rgba(99,102,241,0.35)',
  },
]

const TIPS = [
  '💡 Thumbnails with faces get 38% more clicks',
  '💡 High contrast text boosts CTR by 2x',
  '💡 Use "Make it Viral" for instant AI enhancement',
  '💡 Smart Pick auto-detects the best video frames',
  '💡 A/B test 3 variants to find the winner',
]

export default function SmartStart({ onDone }) {
  const { theme } = useUIStore()
  const { setVideoFile, setActiveLeftPanel } = { ...useVideoStore(), ...useUIStore() }
  const { setVideoFile: setVF } = useVideoStore()
  const { setActiveLeftPanel: setPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const { loadProjects, projects } = useProjectStore()
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length))
  const [hoveredMode, setHoveredMode] = useState(null)

  function handleMode(id) {
    if (id === 'video') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) { setVF(file); onDone() }
      }
      input.click()
    } else if (id === 'template') {
      setPanel('styles')
      onDone()
    } else if (id === 'image') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file || !fabricCanvas) { onDone(); return }
        const url = URL.createObjectURL(file)
        fabric.Image.fromURL(url, (img) => {
          img.scaleToWidth(fabricCanvas.width)
          img.scaleToHeight(fabricCanvas.height)
          fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
          onDone()
        })
      }
      input.click()
    }
  }

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: theme.isDark ? 'rgba(0,0,0,0.85)' : 'rgba(10,10,26,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.25s ease',
    },
    card: {
      background: theme.bgSecondary,
      borderRadius: 20, padding: '40px 36px',
      maxWidth: 680, width: '92%',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      animation: 'scaleIn 0.25s ease',
    },
    header: { textAlign: 'center', marginBottom: 32 },
    logo: {
      fontSize: 13, fontWeight: 700, color: theme.accent,
      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
    },
    title: {
      fontSize: 26, fontWeight: 900, color: theme.text,
      letterSpacing: '-0.8px', marginBottom: 8,
      fontFamily: "'Montserrat', sans-serif",
    },
    subtitle: { fontSize: 14, color: theme.textSecondary, lineHeight: 1.5 },
    modesRow: {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14, marginBottom: 28,
    },
    modeCard: (id, gradient, glow) => ({
      padding: '24px 18px', borderRadius: 14, cursor: 'pointer',
      border: `1px solid ${hoveredMode === id ? 'transparent' : theme.border}`,
      background: hoveredMode === id ? gradient : theme.bgTertiary,
      textAlign: 'center',
      transition: 'all 0.2s',
      boxShadow: hoveredMode === id ? `0 8px 28px ${glow}` : 'none',
      transform: hoveredMode === id ? 'translateY(-4px)' : 'translateY(0)',
    }),
    modeIcon: { fontSize: 32, marginBottom: 10 },
    modeTitle: (id) => ({
      fontSize: 14, fontWeight: 700, marginBottom: 6,
      color: hoveredMode === id ? '#fff' : theme.text,
    }),
    modeDesc: (id) => ({
      fontSize: 11, lineHeight: 1.5,
      color: hoveredMode === id ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
      marginBottom: 14,
    }),
    modeCta: (id, gradient) => ({
      display: 'inline-block', padding: '6px 16px', borderRadius: 6,
      background: hoveredMode === id ? 'rgba(255,255,255,0.2)' : gradient,
      color: '#fff', fontSize: 11, fontWeight: 600, border: 'none',
      cursor: 'pointer',
    }),
    tip: {
      padding: '10px 16px', borderRadius: 8,
      background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
      color: theme.accent, fontSize: 12, textAlign: 'center',
      marginBottom: 20,
    },
    skipRow: { textAlign: 'center' },
    skipBtn: {
      background: 'none', border: 'none', color: theme.textMuted,
      fontSize: 12, cursor: 'pointer', padding: '4px 8px',
      transition: 'color 0.15s',
    },
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onDone()}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>MianSnap</div>
          <div style={s.title}>What are you creating today?</div>
          <div style={s.subtitle}>Pick a starting point — you can always switch later</div>
        </div>

        <div style={s.modesRow}>
          {MODES.map((m) => (
            <div key={m.id}
              style={s.modeCard(m.id, m.gradient, m.glow)}
              onMouseEnter={() => setHoveredMode(m.id)}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleMode(m.id)}
            >
              <div style={s.modeIcon}>{m.icon}</div>
              <div style={s.modeTitle(m.id)}>{m.title}</div>
              <div style={s.modeDesc(m.id)}>{m.desc}</div>
              <button style={s.modeCta(m.id, m.gradient)}>{m.cta} →</button>
            </div>
          ))}
        </div>

        <div style={s.tip}>{TIPS[tipIdx]}</div>

        <div style={s.skipRow}>
          <button style={s.skipBtn} onClick={onDone}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.text }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted }}
          >
            Skip — open blank canvas
          </button>
        </div>
      </div>
    </div>
  )
}
