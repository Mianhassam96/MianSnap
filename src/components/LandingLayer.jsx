import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'

const SEEN_KEY = 'miansnap_landing_seen'

const FEATURES = [
  { icon: '🧠', title: 'AI Frame Selection', desc: 'Upload any video — AI scores every frame for faces, motion, and brightness. Best frame auto-selected.' },
  { icon: '⚡', title: 'One-Click Enhancement', desc: 'Contrast boost, face focus, glow effects, vignette — all applied in one click. No design skills needed.' },
  { icon: '✂️', title: 'Background Removal', desc: 'Browser-side AI removes backgrounds instantly. No upload, no waiting, no account.' },
  { icon: '🔒', title: '100% Private', desc: 'Nothing leaves your device. No uploads, no storage, no account. Your content stays yours.' },
]

const STEPS = [
  { num: '01', icon: '🎬', label: 'Drop your video', sub: 'AI picks the best frame automatically' },
  { num: '02', icon: '⚡', label: 'Click Make Viral', sub: 'One click enhances everything' },
  { num: '03', icon: '⬇', label: 'Download', sub: 'PNG or JPG, 720p or 1080p' },
]

export default function LandingLayer({ onEnter, onDemo }) {
  const { theme, isDark } = useUIStore()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])

  function enter(demo = false) {
    setLeaving(true)
    localStorage.setItem(SEEN_KEY, '1')
    setTimeout(() => {
      if (demo) onDemo?.()
      else onEnter?.()
    }, 320)
  }

  const accent = '#7c3aed'
  const grad = 'linear-gradient(135deg,#7c3aed,#4f46e5)'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: theme.bg, color: theme.text,
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      overflowY: 'auto', overflowX: 'hidden',
      opacity: leaving ? 0 : visible ? 1 : 0,
      transform: leaving ? 'scale(0.98)' : 'scale(1)',
      transition: 'opacity 0.32s ease, transform 0.32s ease',
    }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,48px)', height: 56,
        background: isDark ? 'rgba(10,10,20,0.95)' : 'rgba(255,255,255,0.95)',
        borderBottom: `1px solid ${theme.border}`,
        backdropFilter: 'blur(14px)',
      }}>
        <span style={{
          fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
          background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'Montserrat',sans-serif",
        }}>MianSnap</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
            background: 'rgba(124,58,237,0.12)', color: accent,
            border: '1px solid rgba(124,58,237,0.25)',
          }}>FREE</span>
          <button onClick={() => enter(false)} style={{
            padding: '7px 20px', borderRadius: 8, border: 'none',
            background: grad, color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(124,58,237,0.55)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.4)' }}
          >Open Editor →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        textAlign: 'center',
        padding: 'clamp(56px,9vw,110px) 24px clamp(48px,7vw,88px)',
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.2) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.1) 0%, transparent 70%)',
      }}>
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '8%', left: '4%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '15%', right: '4%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,70,229,0.07)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 16px', borderRadius: 20, marginBottom: 24,
          background: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.3)',
          color: accent, fontSize: 12, fontWeight: 600,
          animation: 'fadeInDown 0.5s ease 0.1s both',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
          100% Browser-Based · No Account · Free Forever
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(34px,6.5vw,72px)', fontWeight: 900, lineHeight: 1.06,
          letterSpacing: '-2.5px', marginBottom: 20,
          background: `linear-gradient(135deg,${accent} 0%,#4f46e5 40%,#a78bfa 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'Montserrat',sans-serif",
          animation: 'fadeInDown 0.5s ease 0.15s both',
        }}>
          Create viral thumbnails<br />in seconds
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 'clamp(14px,1.8vw,18px)', color: theme.textSecondary,
          maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7,
          animation: 'fadeInDown 0.5s ease 0.2s both',
        }}>
          Upload a video → AI picks the best frame → one click makes it viral.<br />
          No design skills. No uploads. <strong style={{ color: theme.text }}>Just results.</strong>
        </p>

        {/* CTAs — clear hierarchy: primary dominant, secondary subtle */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          animation: 'fadeInDown 0.5s ease 0.25s both',
        }}>
          {/* PRIMARY — big, full gradient, dominant */}
          <button onClick={() => enter(false)} style={{
            padding: '16px 48px', borderRadius: 12, border: 'none',
            background: grad, color: '#fff', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', boxShadow: '0 6px 28px rgba(124,58,237,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(124,58,237,0.6)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.5)' }}
          >
            📥 Drop video or image — start free
          </button>

          {/* SECONDARY — small, text-only, clearly subordinate */}
          <button onClick={() => enter(true)} style={{
            padding: '6px 16px', borderRadius: 8,
            border: 'none', background: 'transparent',
            color: theme.textMuted, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', transition: 'color 0.15s',
            textDecoration: 'underline', textDecorationColor: 'transparent',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.textDecorationColor = accent }}
            onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.textDecorationColor = 'transparent' }}
          >
            or try demo — no upload needed →
          </button>
        </div>

        {/* Trust micro-line */}
        <div style={{ marginTop: 20, fontSize: 11, color: theme.textMuted, animation: 'fadeInDown 0.5s ease 0.3s both' }}>
          🔒 Nothing leaves your device &nbsp;·&nbsp; ⚡ No install &nbsp;·&nbsp; 🆓 Free forever
        </div>

        {/* Stats */}
        <div style={{
          marginTop: 36, display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap',
          animation: 'fadeInDown 0.5s ease 0.35s both',
        }}>
          {[
            { stat: '10,000+', label: 'Thumbnails created' },
            { stat: '2.3×', label: 'Avg CTR boost' },
            { stat: '< 30s', label: 'Time to result' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, fontFamily: "'Montserrat',sans-serif" }}>{s.stat}</div>
              <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (DEMO STEPS) ── */}
      <section style={{
        padding: 'clamp(48px,7vw,80px) 24px',
        background: isDark ? 'rgba(124,58,237,0.03)' : 'rgba(124,58,237,0.02)',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-1px', color: theme.text, fontFamily: "'Montserrat',sans-serif" }}>
            From video to viral in 3 steps
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 860, margin: '0 auto' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{
              flex: '1 1 220px', maxWidth: 260,
              padding: '28px 22px', borderRadius: 16,
              border: `1px solid ${theme.border}`, background: theme.bgSecondary,
              textAlign: 'center', position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.border }}
            >
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: grad, color: '#fff', fontSize: 10, fontWeight: 800,
                padding: '2px 10px', borderRadius: 20, letterSpacing: 1,
              }}>{step.num}</div>
              <div style={{ fontSize: 36, marginBottom: 12, marginTop: 6 }}>{step.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 6 }}>{step.label}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{step.sub}</div>
            </div>
          ))}
        </div>

        {/* Demo CTA with micro-message */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button onClick={() => enter(true)} style={{
            padding: '12px 32px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(99,102,241,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.4)' }}
          >
            ⚡ See it in action — no upload needed
          </button>
          <div style={{ marginTop: 10, fontSize: 11, color: theme.textMuted }}>
            ⚡ Generated instantly using AI &nbsp;·&nbsp; Try your own video →
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: 'clamp(48px,7vw,80px) 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>FEATURES</div>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-1px', color: theme.text, fontFamily: "'Montserrat',sans-serif" }}>
            Everything you need. Nothing you don't.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: '22px 20px', borderRadius: 14,
              border: `1px solid ${theme.border}`, background: theme.bgSecondary,
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.border }}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST / SOCIAL PROOF ── */}
      <section style={{
        padding: 'clamp(40px,6vw,72px) 24px',
        background: isDark ? 'rgba(124,58,237,0.03)' : 'rgba(124,58,237,0.02)',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>CREATORS LOVE IT</div>
            {/* Numbers row */}
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
              {[
                { stat: '10,000+', label: 'Thumbnails created' },
                { stat: '< 60s', label: 'Average creation time' },
                { stat: '2.3×', label: 'Avg CTR boost' },
                { stat: '100%', label: 'Free forever' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: theme.text, fontFamily: "'Montserrat',sans-serif", letterSpacing: '-1px' }}>{s.stat}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {[
              { quote: 'Created my best thumbnail in under 30 seconds. The viral score told me exactly what to fix.', name: 'YouTube Creator', handle: '120K subs' },
              { quote: 'Quick Mode is insane. Drop video, click once, done. My CTR went up immediately.', name: 'TikTok Creator', handle: '45K followers' },
              { quote: "Finally a tool that doesn't require a design degree. The AI does everything.", name: 'Gaming Creator', handle: '200K subs' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: '20px', borderRadius: 14,
                border: `1px solid ${theme.border}`, background: theme.bgSecondary,
              }}>
                <div style={{ fontSize: 16, marginBottom: 10, color: '#facc15' }}>★★★★★</div>
                <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.65, marginBottom: 12, fontStyle: 'italic' }}>"{t.quote}"</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary }}>{t.name}</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{t.handle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'clamp(48px,7vw,80px) 24px' }}>
        <div style={{
          maxWidth: 800, margin: '0 auto',
          borderRadius: 20, padding: 'clamp(40px,5vw,64px) clamp(20px,4vw,56px)',
          textAlign: 'center',
          background: grad,
          boxShadow: '0 12px 56px rgba(124,58,237,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,255,255,0.1) 0%,transparent 50%)' }} />
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 12, fontFamily: "'Montserrat',sans-serif", position: 'relative' }}>
            Ready to go viral?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 28, position: 'relative' }}>
            No account. No upload. No credit card. Just results.
          </p>
          <button onClick={() => enter(false)} style={{
            padding: '14px 44px', borderRadius: 12, border: 'none',
            background: '#fff', color: accent,
            fontSize: 15, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)' }}
          >
            🚀 Start creating now →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${theme.border}`, background: theme.bgSecondary, padding: '20px clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 800, background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Montserrat',sans-serif" }}>MianSnap</span>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'GitHub', href: 'https://github.com/Mianhassam96/' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mianhassam96/' },
              { label: 'MultiMian', href: 'https://multimian.com/' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: theme.textMuted, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = accent }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted }}
              >{l.label} ↗</a>
            ))}
          </div>
          <span style={{ fontSize: 11, color: theme.textMuted }}>© 2026 MultiMian · Free forever</span>
        </div>
      </footer>

      {/* Sticky bottom CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: isDark ? 'rgba(10,10,20,0.96)' : 'rgba(255,255,255,0.96)',
        borderTop: `1px solid ${theme.border}`,
        backdropFilter: 'blur(12px)',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 12, color: theme.textSecondary }}>🚀 Free · No account · No uploads</span>
        <button onClick={() => enter(false)} style={{
          padding: '8px 24px', borderRadius: 8, border: 'none',
          background: grad, color: '#fff', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', boxShadow: '0 3px 14px rgba(124,58,237,0.45)',
          transition: 'transform 0.15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >Try MianSnap Now →</button>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity:0; transform:translateY(-12px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}

export function shouldShowLanding() {
  return !localStorage.getItem(SEEN_KEY)
}
