import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'

// ── Data ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🎬', title: 'Smart Frame Detection', desc: 'AI analyzes your video and picks the best frames automatically — faces, motion peaks, brightness.' },
  { icon: '⚡', title: 'One-Click Make Viral', desc: 'Contrast boost, face focus, glow effects, vignette and text enhancement — all in one click.' },
  { icon: '📊', title: 'Live Viral Score', desc: 'Real-time 0–100 score updates as you edit. Actionable feedback: text size, contrast, composition.' },
  { icon: '✂️', title: 'AI Background Removal', desc: 'Browser-side subject cutout powered by Transformers.js. No upload, no waiting.' },
  { icon: '🎨', title: '8 Filter Presets', desc: 'Viral Boost, Cinematic Dark, HDR Pop, Gaming Neon — hover to preview before applying.' },
  { icon: '🔷', title: 'Smart Shapes', desc: 'Breaking News Banner, Glow Arrow, YouTube Text Box — pre-styled, one click.' },
  { icon: '🌙', title: '35 Premium Fonts', desc: 'Impact, Bebas Neue, Montserrat, Arabic, Urdu and 30+ more. Recent fonts remembered.' },
  { icon: '🧪', title: 'A/B Variation Generator', desc: 'Generate 3 color variants instantly — warm, cool, high contrast — for CTR testing.' },
  { icon: '📱', title: 'Mobile-First Design', desc: 'Full bottom tab bar, swipe drawer, touch-optimized handles. Works on any device.' },
  { icon: '⌨️', title: 'Keyboard Shortcuts', desc: 'Ctrl+Z undo, Ctrl+D duplicate, arrow nudge, Ctrl+scroll zoom — full pro workflow.' },
  { icon: '💾', title: 'Auto-Save Projects', desc: 'Every 2 seconds to IndexedDB. Restore any session. No account needed.' },
  { icon: '🚀', title: 'Quick Mode', desc: 'Auto style + enhance + score in one click. 30-second thumbnail generator.' },
]

const STATS = [
  { value: '100%', label: 'Browser-based' },
  { value: '0', label: 'Uploads needed' },
  { value: '35+', label: 'Premium fonts' },
  { value: '∞', label: 'Free forever' },
]

const STEPS = [
  { num: '01', icon: '🎬', title: 'Upload Video', desc: 'Drop any video. AI instantly analyzes and picks the best frames for you.' },
  { num: '02', icon: '🖼', title: 'Pick a Frame', desc: 'Click any recommended frame — it loads to canvas instantly, perfectly scaled.' },
  { num: '03', icon: '⚡', title: 'Make it Viral', desc: 'Hit the Make Viral button. Export as PNG or JPG in 720p or 1080p.' },
]

const COMPARE = [
  { feature: 'Browser-based (no install)', us: true,  canva: false, photoshop: false },
  { feature: 'AI frame detection',         us: true,  canva: false, photoshop: false },
  { feature: 'One-click Make Viral',        us: true,  canva: false, photoshop: false },
  { feature: 'Live viral score',            us: true,  canva: false, photoshop: false },
  { feature: 'Video frame extraction',      us: true,  canva: false, photoshop: false },
  { feature: 'Free forever',               us: true,  canva: false, photoshop: false },
  { feature: 'No account required',        us: true,  canva: false, photoshop: false },
  { feature: 'Canvas editor',              us: true,  canva: true,  photoshop: true  },
]

export default function LandingPage({ onEnter }) {
  const { theme, isDark } = useUIStore()
  const [visible, setVisible] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const accent = '#7c3aed'
  const accentB = '#4f46e5'
  const grad = `linear-gradient(135deg,${accent},${accentB})`

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, color: theme.text,
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      overflowY: 'auto', overflowX: 'hidden',
      opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease',
    }}>

      {/* ── NAV ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,48px)', height: 60,
        borderBottom: `1px solid ${theme.border}`,
        background: isDark ? 'rgba(10,10,20,0.95)' : 'rgba(255,255,255,0.95)',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(14px)',
        boxShadow: '0 1px 0 rgba(124,58,237,0.1)',
      }}>
        <div style={{
          fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
          background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'Montserrat',sans-serif", cursor: 'pointer',
        }} onClick={onEnter}>MianSnap</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
            background: 'rgba(124,58,237,0.12)', color: accent,
            border: '1px solid rgba(124,58,237,0.25)', letterSpacing: 0.5,
          }}>FREE</span>
          <button onClick={onEnter} style={{
            padding: '8px 22px', borderRadius: 8, border: 'none',
            background: grad, color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 14px rgba(124,58,237,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.55)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(124,58,237,0.4)' }}
          >Open Editor →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        textAlign: 'center', padding: 'clamp(60px,10vw,120px) 24px clamp(60px,8vw,100px)',
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.22) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', right: '5%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(79,70,229,0.08)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 18px', borderRadius: 20, marginBottom: 28,
          background: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.3)',
          color: accent, fontSize: 12, fontWeight: 600,
          animation: 'fadeInDown 0.5s ease 0.1s both',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
          100% Browser-Based · No Account · Free Forever
        </div>

        <h1 style={{
          fontSize: 'clamp(38px,7vw,76px)', fontWeight: 900, lineHeight: 1.05,
          letterSpacing: '-3px', marginBottom: 24,
          background: `linear-gradient(135deg,${accent} 0%,${accentB} 40%,#a78bfa 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'Montserrat',sans-serif",
          animation: 'fadeInDown 0.5s ease 0.2s both',
        }}>
          Viral Thumbnail<br />Intelligence Engine
        </h1>

        <p style={{
          fontSize: 'clamp(15px,2vw,20px)', color: theme.textSecondary,
          maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7,
          animation: 'fadeInDown 0.5s ease 0.3s both',
        }}>
          Upload a video → AI picks the best frames → one click makes it viral.<br />
          Built for YouTubers, TikTokers and creators who want <strong style={{ color: theme.text }}>results, not complexity</strong>.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInDown 0.5s ease 0.4s both' }}>
          <button onClick={onEnter} style={{
            padding: '16px 44px', borderRadius: 12, border: 'none',
            background: grad, color: '#fff', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', boxShadow: '0 6px 32px rgba(124,58,237,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(124,58,237,0.5)' }}
          >🚀 Start Creating Free</button>

          <button onClick={onEnter} style={{
            padding: '16px 36px', borderRadius: 12,
            border: `1px solid ${theme.border}`,
            background: theme.bgSecondary, color: theme.text,
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text; e.currentTarget.style.transform = 'translateY(0)' }}
          >View Demo →</button>
        </div>

        <div style={{ marginTop: 32, fontSize: 12, color: theme.textMuted, animation: 'fadeInDown 0.5s ease 0.5s both' }}>
          🔒 Nothing leaves your device &nbsp;·&nbsp; ⚡ No install required &nbsp;·&nbsp; 🎯 Used by creators worldwide
        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInDown 0.5s ease 0.6s both' }}>
          {[
            { stat: '10,000+', label: 'Thumbnails created' },
            { stat: '2.3×', label: 'Avg CTR boost' },
            { stat: '< 60s', label: 'Average creation time' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, fontFamily: "'Montserrat',sans-serif" }}>{item.stat}</div>
              <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`,
        background: theme.bgSecondary,
      }}>
        {STATS.map((st, i) => (
          <div key={st.label} style={{
            textAlign: 'center', padding: '28px 48px',
            borderRight: i < STATS.length - 1 ? `1px solid ${theme.border}` : 'none',
            flex: '1 1 120px',
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: accent, lineHeight: 1, fontFamily: "'Montserrat',sans-serif" }}>{st.value}</div>
            <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 6, fontWeight: 500 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        padding: 'clamp(60px,8vw,96px) 24px',
        background: isDark
          ? 'linear-gradient(180deg,transparent,rgba(124,58,237,0.04),transparent)'
          : 'linear-gradient(180deg,transparent,rgba(124,58,237,0.02),transparent)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, letterSpacing: '-1px', color: theme.text, fontFamily: "'Montserrat',sans-serif", marginBottom: 12 }}>
            From video to viral in 60 seconds
          </h2>
          <p style={{ fontSize: 15, color: theme.textSecondary, maxWidth: 480, margin: '0 auto' }}>
            No manual work. AI handles the hard parts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 960, margin: '0 auto' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{
              flex: '1 1 260px', maxWidth: 300,
              padding: '36px 28px', borderRadius: 18,
              border: `1px solid ${theme.border}`,
              background: theme.bgSecondary,
              textAlign: 'center', position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.border }}
            >
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: grad, color: '#fff', fontSize: 11, fontWeight: 800,
                padding: '3px 12px', borderRadius: 20, letterSpacing: 1,
              }}>{step.num}</div>
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', top: '50%', right: -36, width: 24, height: 2, background: `linear-gradient(90deg,${accent},transparent)`, display: 'none' }} />
              )}
              <div style={{ fontSize: 40, marginBottom: 16, marginTop: 8 }}>{step.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.65 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: 'clamp(60px,8vw,96px) 24px', maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>FEATURES</div>
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 800, letterSpacing: '-1px', color: theme.text, fontFamily: "'Montserrat',sans-serif", marginBottom: 12 }}>
            Everything you need to go viral
          </h2>
          <p style={{ fontSize: 15, color: theme.textSecondary, maxWidth: 480, margin: '0 auto' }}>
            All tools in one place. No plugins. No subscriptions. No uploads.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 18 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              padding: '26px 22px', borderRadius: 14,
              border: `1px solid ${hoveredFeature === i ? 'rgba(124,58,237,0.4)' : theme.border}`,
              background: hoveredFeature === i
                ? (isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)')
                : theme.bgSecondary,
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s',
              transform: hoveredFeature === i ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: hoveredFeature === i ? '0 16px 48px rgba(124,58,237,0.12)' : 'none',
              cursor: 'default',
            }}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: theme.text }}>{f.title}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{
        padding: 'clamp(60px,8vw,96px) 24px',
        background: isDark ? 'rgba(124,58,237,0.03)' : 'rgba(124,58,237,0.02)',
        borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>COMPARISON</div>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 800, letterSpacing: '-1px', color: theme.text, fontFamily: "'Montserrat',sans-serif" }}>
              Why MianSnap?
            </h2>
          </div>

          <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
              background: theme.bgTertiary, padding: '14px 20px',
              borderBottom: `1px solid ${theme.border}`,
            }}>
              <div style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Feature</div>
              {['MianSnap', 'Canva', 'Photoshop'].map(t => (
                <div key={t} style={{ fontSize: 12, fontWeight: 700, color: t === 'MianSnap' ? accent : theme.textMuted, textAlign: 'center' }}>{t}</div>
              ))}
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
                padding: '13px 20px', alignItems: 'center',
                background: i % 2 === 0 ? theme.bgSecondary : theme.bg,
                borderBottom: i < COMPARE.length - 1 ? `1px solid ${theme.border}` : 'none',
              }}>
                <div style={{ fontSize: 13, color: theme.text }}>{row.feature}</div>
                {[row.us, row.canva, row.photoshop].map((v, j) => (
                  <div key={j} style={{ textAlign: 'center', fontSize: 16 }}>
                    {v
                      ? <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span>
                      : <span style={{ color: theme.textMuted }}>✕</span>
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULT CONFIDENCE ── */}
      <section style={{ padding: 'clamp(48px,6vw,72px) 24px', background: isDark ? 'rgba(124,58,237,0.04)' : 'rgba(124,58,237,0.02)', borderTop: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>WHAT YOU GET</div>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 800, color: theme.text, letterSpacing: '-1px', marginBottom: 40, fontFamily: "'Montserrat',sans-serif" }}>
            Thumbnails optimized for high CTR
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[
              { icon: '🔥', title: 'Viral Ready Score', desc: 'Live 0–100 score tells you exactly what to fix before you export.' },
              { icon: '⚡', title: 'Likely to outperform', desc: 'High contrast + bold text = 2× more clicks than average thumbnails.' },
              { icon: '🎯', title: 'Face-optimized', desc: 'Auto face detection places text away from faces for maximum impact.' },
              { icon: '📱', title: 'Mobile-first', desc: 'Every thumbnail is tested for mobile readability before you export.' },
            ].map(c => (
              <div key={c.title} style={{
                padding: '24px 20px', borderRadius: 14,
                border: `1px solid ${theme.border}`, background: theme.bgSecondary,
                textAlign: 'left', transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ padding: 'clamp(48px,6vw,72px) 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>CREATORS LOVE IT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {[
              { quote: "Created my best thumbnail in under 30 seconds. The viral score told me exactly what to fix.", name: 'YouTube Creator', handle: '120K subs' },
              { quote: "Quick Mode is insane. Drop video, click once, done. My CTR went up immediately.", name: 'TikTok Creator', handle: '45K followers' },
              { quote: "Finally a tool that doesn't require a design degree. The AI does everything.", name: 'Gaming Creator', handle: '200K subs' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: '24px 20px', borderRadius: 14,
                border: `1px solid ${theme.border}`, background: theme.bgSecondary,
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 20, marginBottom: 12, color: '#facc15' }}>★★★★★</div>
                <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>"{t.quote}"</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme.textSecondary }}>{t.name}</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{t.handle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: 'clamp(60px,8vw,96px) 24px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          borderRadius: 24, padding: 'clamp(48px,6vw,72px) clamp(24px,4vw,60px)',
          textAlign: 'center',
          background: `linear-gradient(135deg,${accent},${accentB})`,
          boxShadow: '0 12px 60px rgba(124,58,237,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,255,255,0.1) 0%,transparent 50%),radial-gradient(circle at 80% 50%,rgba(255,255,255,0.07) 0%,transparent 50%)' }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, position: 'relative' }}>START NOW — IT'S FREE</div>
          <h2 style={{ fontSize: 'clamp(26px,5vw,48px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 16, fontFamily: "'Montserrat',sans-serif", position: 'relative' }}>
            Ready to go viral?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 36, position: 'relative' }}>
            No account. No upload. No credit card. Just results.
          </p>
          <button onClick={onEnter} style={{
            padding: '16px 48px', borderRadius: 12, border: 'none',
            background: '#fff', color: accent,
            fontSize: 16, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            position: 'relative',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.25)' }}
          >🚀 Open Editor Free</button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${theme.border}`, background: theme.bgSecondary }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,48px) 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: '32px 48px',
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Montserrat',sans-serif", marginBottom: 8 }}>MianSnap</div>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.6, marginBottom: 16 }}>
              Create viral thumbnails in seconds.<br />100% free, forever.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['🔒 Private', '⚡ Fast', '🆓 Free'].map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'rgba(124,58,237,0.1)', color: accent, border: '1px solid rgba(124,58,237,0.2)' }}>{t}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Product</div>
            {['Editor', 'Features', 'How it works'].map(l => (
              <button key={l} onClick={onEnter} style={{ display: 'block', background: 'none', border: 'none', padding: '4px 0', fontSize: 13, color: theme.textSecondary, cursor: 'pointer', transition: 'color 0.15s', textAlign: 'left' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = accent }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary }}
              >{l}</button>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Connect</div>
            {[
              { label: 'MultiMian', href: 'https://multimian.com/' },
              { label: 'GitHub', href: 'https://github.com/Mianhassam96/' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mianhassam96/' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={{ display: 'block', padding: '4px 0', fontSize: 13, color: theme.textSecondary, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = accent }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.textSecondary }}
              >{l.label} ↗</a>
            ))}
          </div>
        </div>

        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '18px clamp(16px,4vw,48px)',
          borderTop: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
          fontSize: 12, color: theme.textMuted,
        }}>
          <span>© 2026 MultiMian. All rights reserved.</span>
          <span>Made with ❤️ for creators</span>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          footer > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Sticky bottom CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: isDark ? 'rgba(10,10,20,0.96)' : 'rgba(255,255,255,0.96)',
        borderTop: `1px solid ${theme.border}`,
        backdropFilter: 'blur(12px)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
      }}>
        <span style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 500 }}>
          🚀 Free forever · No account needed
        </span>
        <button onClick={onEnter} style={{
          padding: '9px 28px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 3px 16px rgba(124,58,237,0.45)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.55)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 16px rgba(124,58,237,0.45)' }}
        >Try MianSnap Now →</button>
      </div>
    </div>
  )
}
