import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'

const FEATURES = [
  { icon: '🎬', title: 'Video Frame Capture', desc: 'Upload any video and extract the perfect frame with frame-by-frame precision.' },
  { icon: '⚡', title: 'Make it Viral', desc: 'One click applies emotion amplifier, contrast boost, glow effects and smart text.' },
  { icon: '🧠', title: 'Viral Score Engine', desc: 'AI-powered analysis scores your thumbnail 0–100 for click-through potential.' },
  { icon: '✂️', title: 'AI Background Removal', desc: 'One-click subject cutout powered by Transformers.js — runs in your browser.' },
  { icon: '🗂', title: 'Layer Panel', desc: 'Photoshop-style layers with visibility, lock, reorder and properties.' },
  { icon: '🌙', title: '35 Premium Fonts', desc: 'Impact, Bebas Neue, Arabic, Urdu and 30+ more fonts for every style.' },
  { icon: '📐', title: 'Safe Zone Overlays', desc: 'YouTube, TikTok and Instagram safe zones so nothing gets cut off.' },
  { icon: '🧪', title: 'A/B Variations', desc: 'Generate 3 color variants instantly — warm, cool, high contrast — for testing.' },
]

const STATS = [
  { value: '100%', label: 'Browser-based' },
  { value: '0', label: 'Uploads needed' },
  { value: '35+', label: 'Premium fonts' },
  { value: '∞', label: 'Free forever' },
]

const STEPS = [
  { num: '01', icon: '🎬', title: 'Upload Video', desc: 'Drop any video file into the timeline panel.' },
  { num: '02', icon: '🖼', title: 'Pick a Frame', desc: 'Use Smart Pick to auto-detect the best moments.' },
  { num: '03', icon: '⚡', title: 'Make it Viral', desc: 'One click applies AI enhancements. Export in seconds.' },
]

export default function LandingPage({ onEnter }) {
  const { theme, isDark } = useUIStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const s = {
    page: {
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflowY: 'auto',
      overflowX: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
    },
    nav: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', height: 60,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.isDark ? 'rgba(13,13,24,0.95)' : 'rgba(255,255,255,0.95)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)',
      boxShadow: theme.shadowSm,
    },
    logo: {
      fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      fontFamily: "'Montserrat', sans-serif",
      cursor: 'pointer',
    },
    navRight: { display: 'flex', alignItems: 'center', gap: 12 },
    navLink: {
      fontSize: 13, color: theme.textSecondary, textDecoration: 'none',
      fontWeight: 500, transition: 'color 0.15s', cursor: 'pointer',
      background: 'none', border: 'none', padding: '4px 8px',
    },
    navBtn: {
      padding: '8px 22px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(124,58,237,0.35)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    },
    hero: {
      textAlign: 'center',
      padding: '100px 24px 80px',
      background: isDark
        ? 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 65%)'
        : 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 65%)',
      position: 'relative',
      overflow: 'hidden',
    },
    heroBg: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: isDark
        ? 'radial-gradient(circle at 20% 80%, rgba(79,70,229,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 50%)'
        : 'radial-gradient(circle at 20% 80%, rgba(79,70,229,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.05) 0%, transparent 50%)',
    },
    badge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 16px', borderRadius: 20, marginBottom: 28,
      background: theme.accentGlow,
      border: `1px solid ${theme.borderHover}`,
      color: theme.accent, fontSize: 12, fontWeight: 600,
      animation: 'fadeInDown 0.5s ease 0.1s both',
    },
    h1: {
      fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.08,
      letterSpacing: '-2.5px', marginBottom: 22,
      background: 'linear-gradient(135deg,#7c3aed 0%,#4f46e5 50%,#7c3aed 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      fontFamily: "'Montserrat', sans-serif",
      animation: 'fadeInDown 0.5s ease 0.2s both',
    },
    subtitle: {
      fontSize: 'clamp(15px, 2vw, 20px)', color: theme.textSecondary,
      maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.65,
      animation: 'fadeInDown 0.5s ease 0.3s both',
    },
    ctaRow: {
      display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
      animation: 'fadeInDown 0.5s ease 0.4s both',
    },
    ctaBtn: {
      padding: '15px 40px', borderRadius: 12, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
      boxShadow: '0 4px 28px rgba(124,58,237,0.45)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex', alignItems: 'center', gap: 8,
    },
    ctaSecondary: {
      padding: '15px 36px', borderRadius: 12,
      border: `1px solid ${theme.border}`,
      background: theme.bgSecondary, color: theme.text,
      fontSize: 16, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.2s',
    },
    stats: {
      display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap',
      borderTop: `1px solid ${theme.border}`,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.bgSecondary,
    },
    statItem: {
      textAlign: 'center', padding: '32px 48px',
      borderRight: `1px solid ${theme.border}`,
      flex: '1 1 120px',
    },
    statVal: {
      fontSize: 34, fontWeight: 800, color: theme.accent, lineHeight: 1,
      fontFamily: "'Montserrat', sans-serif",
    },
    statLabel: { fontSize: 12, color: theme.textMuted, marginTop: 6, fontWeight: 500 },

    // How it works
    howSection: {
      padding: '80px 24px',
      background: isDark
        ? 'linear-gradient(180deg, transparent, rgba(124,58,237,0.04), transparent)'
        : 'linear-gradient(180deg, transparent, rgba(124,58,237,0.02), transparent)',
    },
    sectionTitle: {
      textAlign: 'center', fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 800,
      marginBottom: 12, letterSpacing: '-1px', color: theme.text,
      fontFamily: "'Montserrat', sans-serif",
    },
    sectionSub: {
      textAlign: 'center', fontSize: 15, color: theme.textSecondary,
      marginBottom: 56, maxWidth: 480, margin: '0 auto 56px',
    },
    stepsRow: {
      display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
      maxWidth: 900, margin: '0 auto',
    },
    stepCard: {
      flex: '1 1 240px', maxWidth: 280,
      padding: '32px 28px', borderRadius: 16,
      border: `1px solid ${theme.border}`,
      background: theme.bgSecondary,
      textAlign: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative',
    },
    stepNum: {
      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 11, fontWeight: 800,
      padding: '3px 10px', borderRadius: 20, letterSpacing: 1,
    },
    stepIcon: { fontSize: 36, marginBottom: 14, marginTop: 8 },
    stepTitle: { fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 8 },
    stepDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 1.6 },

    // Features grid
    features: { padding: '80px 24px', maxWidth: 1100, margin: '0 auto' },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 20,
    },
    card: {
      padding: '28px 24px', borderRadius: 14,
      border: `1px solid ${theme.border}`,
      background: theme.bgSecondary,
      transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    },
    cardIcon: { fontSize: 30, marginBottom: 14 },
    cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 8, color: theme.text },
    cardDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 1.55 },

    // CTA banner
    ctaBanner: {
      margin: '0 24px 80px',
      borderRadius: 20,
      padding: '60px 40px',
      textAlign: 'center',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      boxShadow: '0 8px 40px rgba(124,58,237,0.35)',
      position: 'relative',
      overflow: 'hidden',
    },
    ctaBannerBg: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.06) 0%, transparent 50%)',
    },
    ctaBannerTitle: {
      fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 900,
      color: '#fff', marginBottom: 12, letterSpacing: '-1px',
      fontFamily: "'Montserrat', sans-serif",
      position: 'relative',
    },
    ctaBannerSub: {
      fontSize: 16, color: 'rgba(255,255,255,0.8)',
      marginBottom: 32, position: 'relative',
    },
    ctaBannerBtn: {
      padding: '14px 40px', borderRadius: 10, border: 'none',
      background: '#fff', color: '#7c3aed',
      fontSize: 16, fontWeight: 800, cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative',
    },

    // Footer
    footer: {
      borderTop: `1px solid ${theme.border}`,
      background: theme.bgSecondary,
    },
    footerInner: {
      maxWidth: 1100, margin: '0 auto',
      padding: '48px 40px 32px',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '32px 48px',
      alignItems: 'start',
    },
    footerBrand: { display: 'flex', flexDirection: 'column', gap: 8 },
    footerLogo: {
      fontSize: 22, fontWeight: 800,
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      fontFamily: "'Montserrat', sans-serif",
      lineHeight: 1,
    },
    footerTagline: { fontSize: 13, color: theme.textMuted, lineHeight: 1.5, maxWidth: 200 },
    footerLinksWrap: {
      display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center',
    },
    footerCol: { display: 'flex', flexDirection: 'column', gap: 10 },
    footerColTitle: {
      fontSize: 11, fontWeight: 700, color: theme.textMuted,
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
    },
    footerLink: {
      fontSize: 13, color: theme.textSecondary, textDecoration: 'none',
      fontWeight: 500, transition: 'color 0.15s',
      display: 'flex', alignItems: 'center', gap: 5,
    },
    footerSocial: { display: 'flex', flexDirection: 'column', gap: 10 },
    footerBottom: {
      maxWidth: 1100, margin: '0 auto',
      padding: '20px 40px',
      borderTop: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 8,
    },
    footerCopy: { fontSize: 12, color: theme.textMuted },
    footerMade: { fontSize: 12, color: theme.textMuted },
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo} onClick={onEnter}>MianSnap</div>
        <div style={s.navRight}>
          <button style={s.navLink}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary }}
            onClick={onEnter}>Features</button>
          <button style={s.navLink}
            onMouseEnter={(e) => { e.currentTarget.style.color = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary }}
            onClick={onEnter}>Editor</button>
          <button style={s.navBtn} onClick={onEnter}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.35)' }}
          >Open Editor →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBg} />
        <div style={s.badge}>⚡ 100% Browser-Based · No Upload Required · Free Forever</div>
        <h1 style={s.h1}>Viral Thumbnail<br />Intelligence Engine</h1>
        <p style={s.subtitle}>
          Transform any video frame into a high-converting thumbnail in seconds.
          Built for YouTubers, TikTokers, and creators who want results — not complexity.
        </p>
        <div style={s.ctaRow}>
          <button style={s.ctaBtn} onClick={onEnter}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 36px rgba(124,58,237,0.55)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 28px rgba(124,58,237,0.45)' }}
          >
            🚀 Start Creating Free
          </button>
          <button style={s.ctaSecondary} onClick={onEnter}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            View Demo →
          </button>
        </div>
      </section>

      {/* Stats */}
      <div style={s.stats}>
        {STATS.map((st, i) => (
          <div key={st.label} style={{ ...s.statItem, borderRight: i < STATS.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
            <div style={s.statVal}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section style={s.howSection}>
        <div style={s.sectionTitle}>How it works</div>
        <p style={s.sectionSub}>From video to viral thumbnail in under 60 seconds</p>
        <div style={s.stepsRow}>
          {STEPS.map((step) => (
            <div key={step.num} style={s.stepCard}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = theme.shadowLg; e.currentTarget.style.borderColor = theme.borderHover }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.border }}
            >
              <div style={s.stepNum}>{step.num}</div>
              <div style={s.stepIcon}>{step.icon}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <div style={s.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={s.features}>
        <div style={s.sectionTitle}>Everything you need to go viral</div>
        <p style={{ ...s.sectionSub, marginBottom: 48 }}>All tools in one place. No plugins. No subscriptions.</p>
        <div style={s.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} style={s.card}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = theme.shadowLg; e.currentTarget.style.borderColor = theme.borderHover }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.border }}
            >
              <div style={s.cardIcon}>{f.icon}</div>
              <div style={s.cardTitle}>{f.title}</div>
              <div style={s.cardDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <div style={{ padding: '0 24px 80px' }}>
        <div style={s.ctaBanner}>
          <div style={s.ctaBannerBg} />
          <div style={s.ctaBannerTitle}>Ready to go viral?</div>
          <div style={s.ctaBannerSub}>No account. No upload. Just results.</div>
          <button style={s.ctaBannerBtn} onClick={onEnter}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)' }}
          >
            🚀 Open Editor Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          {/* Brand */}
          <div style={s.footerBrand}>
            <div style={s.footerLogo}>MianSnap</div>
            <div style={s.footerTagline}>Create viral thumbnails in seconds. 100% free, forever.</div>
          </div>

          {/* Links */}
          <div style={s.footerLinksWrap}>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Product</div>
              {[
                { label: 'Editor', action: onEnter },
                { label: 'Features', action: onEnter },
                { label: 'How it works', action: onEnter },
              ].map((l) => (
                <button key={l.label} style={{ ...s.footerLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={l.action}
                  onMouseEnter={(e) => { e.currentTarget.style.color = theme.accent }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary }}
                >{l.label}</button>
              ))}
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Connect</div>
              {[
                { label: 'MultiMian', href: 'https://multimian.com/' },
                { label: 'GitHub', href: 'https://github.com/Mianhassam96/' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mianhassam96/' },
              ].map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={s.footerLink}
                  onMouseEnter={(e) => { e.currentTarget.style.color = theme.accent }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary }}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>

          {/* Right: badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <div style={{
              padding: '8px 16px', borderRadius: 8,
              background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
              color: theme.accent, fontSize: 12, fontWeight: 600,
              textAlign: 'center',
            }}>
              🔒 No login required<br />
              <span style={{ fontSize: 11, fontWeight: 400, color: theme.textMuted }}>100% private & browser-based</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={s.footerBottom}>
          <span style={s.footerCopy}>© 2026 MultiMian. All rights reserved.</span>
          <span style={s.footerMade}>Made with ❤️ for creators</span>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .footer-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
