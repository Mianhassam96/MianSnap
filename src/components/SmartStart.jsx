import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { fabric } from '../lib/fabric'

const TIPS = [
  '💡 Thumbnails with faces get 38% more clicks',
  '💡 High contrast text boosts CTR by 2x',
  '💡 Smart Pick auto-detects the best video frames',
  '💡 A/B test 3 variants to find the winner',
]

export default function SmartStart({ onDone }) {
  const { theme } = useUIStore()
  const { setVideoFile: setVF } = useVideoStore()
  const { setActiveLeftPanel: setPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length))

  function handleVideo() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'video/*'
    input.onchange = (e) => { const f = e.target.files[0]; if (f) { setVF(f); onDone() } }
    input.click()
  }

  function handleTemplate() { setPanel('styles'); onDone() }

  function handleImage() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
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

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: theme.isDark ? 'rgba(0,0,0,0.88)' : 'rgba(10,10,26,0.78)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.2s ease',
    },
    card: {
      background: theme.bgSecondary, borderRadius: 20,
      padding: '40px 36px', maxWidth: 520, width: '92%',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
      animation: 'scaleIn 0.22s ease',
    },
    logo: {
      textAlign: 'center', fontSize: 12, fontWeight: 700,
      color: theme.accent, letterSpacing: 1.5,
      textTransform: 'uppercase', marginBottom: 12,
    },
    title: {
      textAlign: 'center', fontSize: 24, fontWeight: 900,
      color: theme.text, letterSpacing: '-0.8px', marginBottom: 6,
      fontFamily: "'Montserrat', sans-serif",
    },
    sub: {
      textAlign: 'center', fontSize: 13, color: theme.textSecondary,
      marginBottom: 32, lineHeight: 1.5,
    },

    // PRIMARY — big, full width, gradient
    primaryBtn: {
      width: '100%', padding: '16px 24px', borderRadius: 12, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
      boxShadow: '0 6px 28px rgba(124,58,237,0.45)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      marginBottom: 10,
    },
    primaryLabel: { fontSize: 11, opacity: 0.8, fontWeight: 400, marginTop: 2 },

    // SECONDARY — side by side, outlined
    secondaryRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 },
    secondaryBtn: {
      padding: '12px 16px', borderRadius: 10,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text,
      fontSize: 13, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.15s',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    },
    secondaryIcon: { fontSize: 22 },
    secondaryLabel: { fontSize: 11, color: theme.textSecondary },

    tip: {
      padding: '9px 14px', borderRadius: 8,
      background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
      color: theme.accent, fontSize: 11, textAlign: 'center',
      marginBottom: 16,
    },
    skipRow: { textAlign: 'center' },
    skipBtn: {
      background: 'none', border: 'none', color: theme.textMuted,
      fontSize: 11, cursor: 'pointer', padding: '4px 8px',
      transition: 'color 0.15s',
    },
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onDone()}>
      <div style={s.card}>
        <div style={s.logo}>MianSnap</div>
        <div style={s.title}>Create a viral thumbnail</div>
        <div style={s.sub}>Start with a video for the best results</div>

        {/* PRIMARY — video is the recommended path */}
        <button style={s.primaryBtn} onClick={handleVideo}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(124,58,237,0.55)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.45)' }}
        >
          <span style={{ fontSize: 22 }}>🎬</span>
          <span>
            <div>Upload Video</div>
            <div style={s.primaryLabel}>AI picks best frames automatically</div>
          </span>
        </button>

        {/* SECONDARY — two smaller options */}
        <div style={s.secondaryRow}>
          <button style={s.secondaryBtn} onClick={handleImage}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
          >
            <span style={s.secondaryIcon}>🖼</span>
            <span>Upload Image</span>
            <span style={s.secondaryLabel}>Edit a photo directly</span>
          </button>
          <button style={s.secondaryBtn} onClick={handleTemplate}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
          >
            <span style={s.secondaryIcon}>✨</span>
            <span>Use Template</span>
            <span style={s.secondaryLabel}>Gaming, Drama, News...</span>
          </button>
        </div>

        <div style={s.tip}>{TIPS[tipIdx]}</div>

        <div style={s.skipRow}>
          <button style={s.skipBtn} onClick={onDone}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.text }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted }}
          >
            Skip — open blank canvas
          </button>
          <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 6 }}>
            💡 Tip: Try a template from the ✨ Styles tab to get started fast
          </div>
        </div>
      </div>
    </div>
  )
}
