import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { fabric } from '../lib/fabric'
import { listProjects } from '../utils/projectStorage'
import { applyImageAsBackground } from '../utils/imageUtils'

const TIPS = [
  '💡 Thumbnails with faces get 38% more clicks',
  '💡 High contrast text boosts CTR by 2×',
  '💡 Smart Pick auto-detects the best video frames',
  '💡 A/B test 3 variants to find the winner',
]

export default function SmartStart({ onDone, onLoadProject }) {
  const { theme, setActiveLeftPanel } = useUIStore()
  const { setVideoFile } = useVideoStore()
  const { fabricCanvas } = useCanvasStore()
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length))
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    listProjects().then(all => {
      const manual = all.filter(p => !p.isAuto).slice(0, 3)
      setRecentProjects(manual)
    }).catch(() => {})
  }, [])

  function handleVideo() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'video/*'
    input.onchange = (e) => {
      const f = e.target.files[0]
      if (f) { setVideoFile(f); onDone() }
    }
    input.click()
  }

  function handleImage() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) { onDone(); return }
      const url = URL.createObjectURL(file)
      if (fabricCanvas) {
        applyImageAsBackground(fabricCanvas, url, 'cover')
      }
      onDone()
    }
    input.click()
  }

  function handleTemplate() { setActiveLeftPanel('styles'); onDone() }

  function handleQuickMode() { setActiveLeftPanel('styles'); onDone() }

  function handleResume(project) {
    if (!fabricCanvas || !project.canvas) return
    fabricCanvas.loadFromJSON(project.canvas, () => fabricCanvas.renderAll())
    onDone()
  }

  function formatDate(ts) {
    if (!ts) return ''
    const d = new Date(ts)
    const now = Date.now()
    const diff = now - ts
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: theme.isDark ? 'rgba(0,0,0,0.88)' : 'rgba(10,10,26,0.78)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(10px)',
      animation: 'fadeIn 0.2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onDone()}>
      <div style={{
        background: theme.bgSecondary, borderRadius: 20,
        padding: '36px 32px', maxWidth: 500, width: '92%',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
        animation: 'scaleIn 0.22s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: theme.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          MianSnap
        </div>
        <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: theme.text, letterSpacing: '-0.8px', marginBottom: 4, fontFamily: "'Montserrat',sans-serif" }}>
          Create a viral thumbnail
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: theme.textSecondary, marginBottom: 24 }}>
          Start with a video for the best results
        </div>

        {/* PRIMARY — video */}
        <button
          onClick={handleVideo}
          style={{
            width: '100%', padding: '15px 20px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 28px rgba(124,58,237,0.45)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 10,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(124,58,237,0.55)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.45)' }}
        >
          <span style={{ fontSize: 20 }}>🎬</span>
          <span>
            <div>Upload Video</div>
            <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 400, marginTop: 1 }}>AI picks best frames automatically</div>
          </span>
        </button>

        {/* Quick Mode CTA */}
        <button
          onClick={handleQuickMode}
          style={{
            width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 12,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          🚀 Quick Mode — 1-click thumbnail
          <span style={{ fontSize: 10, opacity: 0.8, fontWeight: 400 }}>no upload needed</span>
        </button>

        {/* Secondary row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { icon: '🖼', label: 'Upload Image', sub: 'Edit a photo', action: handleImage },
            { icon: '✨', label: 'Use Template', sub: 'Gaming, Drama...', action: handleTemplate },
          ].map(c => (
            <button key={c.label}
              onClick={c.action}
              style={{
                padding: '11px 12px', borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.bgTertiary, color: theme.text,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
            >
              <span style={{ fontSize: 20 }}>{c.icon}</span>
              <span>{c.label}</span>
              <span style={{ fontSize: 10, color: theme.textMuted }}>{c.sub}</span>
            </button>
          ))}
        </div>

        {/* Recent projects */}
        {recentProjects.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>
              📂 Resume recent
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {recentProjects.map(p => (
                <button key={p.id}
                  onClick={() => handleResume(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${theme.border}`, background: theme.bg,
                    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bg }}
                >
                  <span style={{ fontSize: 16 }}>📄</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 10, color: theme.textMuted, flexShrink: 0 }}>{formatDate(p.savedAt)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tip + skip */}
        <div style={{ padding: '8px 12px', borderRadius: 8, background: theme.accentGlow, border: `1px solid ${theme.borderHover}`, color: theme.accent, fontSize: 11, textAlign: 'center', marginBottom: 12 }}>
          {TIPS[tipIdx]}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onDone}
            style={{ background: 'none', border: 'none', color: theme.textMuted, fontSize: 11, cursor: 'pointer', padding: '4px 8px' }}
          >
            Skip — open blank canvas
          </button>
        </div>
      </div>
    </div>
  )
}
