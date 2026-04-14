import React from 'react'
import useUIStore from '../store/useUIStore'

const FEATURES = [
  { icon: '🎬', title: 'Video Frame Capture', desc: 'Upload any video and extract the perfect frame with frame-by-frame precision.' },
  { icon: '🎨', title: 'Canvas Editor', desc: 'Full Fabric.js editor — text, shapes, images, layers, drag & resize.' },
  { icon: '🧠', title: 'Viral Score Engine', desc: 'AI-powered analysis scores your thumbnail 0–100 for click-through potential.' },
  { icon: '✂️', title: 'AI Background Removal', desc: 'One-click subject cutout powered by Transformers.js — runs in your browser.' },
  { icon: '🗂', title: 'Layer Panel', desc: 'Photoshop-style layers with visibility, lock, reorder and properties.' },
  { icon: '🌙', title: '35 Premium Fonts', desc: 'Impact, Bebas Neue, Arabic, Urdu and 30+ more fonts for every style.' },
  { icon: '📐', title: 'Safe Zone Overlays', desc: 'YouTube, TikTok and Instagram safe zones so nothing gets cut off.' },
  { icon: '💾', title: 'Project Saving', desc: 'Auto-save and manual save to browser storage — no account needed.' },
]

const STATS = [
  { value: '100%', label: 'Browser-based' },
  { value: '0', label: 'Uploads needed' },
  { value: '35+', label: 'Premium fonts' },
  { value: '∞', label: 'Free forever' },
]

export default function LandingPage({ onEnter }) {
  const { theme, isDark } = useUIStore()

  const s = {
    page: {
      minHeight: '100vh', background: theme.bg, color: theme.text,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflowY: 'auto', overflowX: 'hidden',
    },
    nav: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 40px', borderBottom: `1px solid ${theme.border}`,
      background: theme.bgSecondary, position: 'sticky', top: 0, zIndex: 100,
      boxShadow: theme.shadowSm,
    },
    logo: {
      fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      fontFamily: "'Montserrat', sans-serif",
    },
    navBtn: {
      padding: '8px 22px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
    },
    hero: {
      textAlign: 'center', padding: '80px 24px 60px',
      background: isDark
        ? 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)'
        : 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 14px', borderRadius: 20, marginBottom: 24,
      background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
      color: theme.accent, fontSize: 12, fontWeight: 600,
    },
    h1: {
      fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1,
      letterSpacing: '-2px', marginBottom: 20,
      background: 'linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#7c3aed 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      fontFamily: "'Montserrat', sans-serif",
    },
    subtitle: {
      fontSize: 'clamp(15px, 2vw, 20px)', color: theme.textSecondary,
      maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6,
    },
    ctaRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
    ctaBtn: {
      padding: '14px 36px', borderRadius: 10, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
      boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    },
    ctaSecondary: {
      padding: '14px 36px', borderRadius: 10,
      border: `1px solid ${theme.border}`,
      background: theme.bgSecondary, color: theme.text,
      fontSize: 16, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.15s',
    },
    stats: {
      display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap',
      padding: '40px 24px', borderTop: `1px solid ${theme.border}`,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.bgSecondary,
    },
    statItem: { textAlign: 'center' },
    statVal: { fontSize: 32, fontWeight: 800, color: theme.accent, lineHeight: 1 },
    statLabel: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
    features: { padding: '64px 24px', maxWidth: 1100, margin: '0 auto' },
    featuresTitle: {
      textAlign: 'center', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800,
      marginBottom: 48, letterSpacing: '-1px', color: theme.text,
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },
    card: {
      padding: '24px', borderRadius: 14, border: `1px solid ${theme.border}`,
      background: theme.bgSecondary, transition: 'transform 0.2s, box-shadow 0.2s',
    },
    cardIcon: { fontSize: 28, marginBottom: 12 },
    cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 8, color: theme.text },
    cardDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 1.5 },
    footer: {
      textAlign: 'center', padding: '32px 24px',
      borderTop: `1px solid ${theme.border}`,
      color: theme.textMuted, fontSize: 12,
      background: theme.bgSecondary,
    },
    footerLogo: {
      fontSize: 16, fontWeight: 800,
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      fontFamily: "'Montserrat', sans-serif", marginBottom: 8,
    },
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}>MianSnap</div>
        <button style={s.navBtn} onClick={onEnter}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.35)' }}
        >
          Open Editor →
        </button>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.badge}>⚡ 100% Browser-Based · No Upload Required</div>
        <h1 style={s.h1}>Viral Thumbnail<br />Intelligence Engine</h1>
        <p style={s.subtitle}>
          Transform any video frame into a high-converting thumbnail in seconds.
          Built for YouTubers, TikTokers, and creators who want results — not complexity.
        </p>
        <div style={s.ctaRow}>
          <button style={s.ctaBtn} onClick={onEnter}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(124,58,237,0.4)' }}
          >
            🚀 Start Creating Free
          </button>
          <button style={s.ctaSecondary}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text }}
            onClick={onEnter}
          >
            View Demo
          </button>
        </div>
      </section>

      {/* Stats */}
      <div style={s.stats}>
        {STATS.map((st) => (
          <div key={st.label} style={s.statItem}>
            <div style={s.statVal}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={s.features}>
        <h2 style={s.featuresTitle}>Everything you need to go viral</h2>
        <div style={s.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={s.card}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = theme.shadowLg }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={s.cardIcon}>{f.icon}</div>
              <div style={s.cardTitle}>{f.title}</div>
              <div style={s.cardDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerLogo}>MianSnap</div>
        <div>Built by <strong>Mianhassam96</strong> · Open source · Free forever</div>
        <div style={{ marginTop: 6 }}>
          <a href="https://github.com/Mianhassam96/MianSnap" target="_blank" rel="noreferrer"
            style={{ color: theme.accent, textDecoration: 'none' }}>GitHub ↗</a>
        </div>
      </footer>
    </div>
  )
}
