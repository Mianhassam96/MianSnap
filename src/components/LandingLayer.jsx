import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'

const SEEN_KEY = 'miansnap_landing_seen'

const PLATFORMS = [
  { icon: '▶', label: 'YouTube', color: '#ff0000', size: '1280×720' },
  { icon: '📷', label: 'Instagram', color: '#e1306c', size: '1080×1080' },
  { icon: '🎵', label: 'TikTok', color: '#00f2ea', size: '1080×1920' },
  { icon: '💼', label: 'LinkedIn', color: '#0077b5', size: '1200×627' },
  { icon: '👥', label: 'Facebook', color: '#1877f2', size: '1200×630' },
]

const FEATURES = [
  { icon: '🧠', title: 'Finds your best frame automatically', desc: 'AI scores every frame for faces, motion & brightness — picks the winner for you.', sub: 'No scrubbing needed' },
  { icon: '⚡', title: 'Makes it viral in one click', desc: 'Contrast boost, face focus, glow effects, vignette — all applied instantly.', sub: 'No design skills needed' },
  { icon: '🎯', title: 'Switches platforms instantly', desc: 'YouTube, Instagram, TikTok, LinkedIn — canvas resizes proportionally.', sub: '5 platforms supported' },
  { icon: '✂️', title: 'Removes backgrounds in seconds', desc: 'Browser-side AI — no upload, no waiting, no account required.', sub: 'Runs 100% in your browser' },
  { icon: '📊', title: 'Scores your thumbnail live', desc: 'Real-time 0–100 score with one-tap fix buttons.', sub: 'Know exactly what to improve' },
  { icon: '🔒', title: 'Keeps your content private', desc: 'Nothing leaves your device. No uploads, no storage, no account. Ever.', sub: 'Zero data collection' },
]

export default function LandingLayer({ onEnter, onDemo }) {
  const { theme, isDark } = useUIStore()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [activePlatform, setActivePlatform] = useState(0)
  const [demoSlider, setDemoSlider] = useState(50)
  const [demoAnimDone, setDemoAnimDone] = useState(false)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [sliderVelocity, setSliderVelocity] = useState(0)
  const lastSliderX = React.useRef(null)
  const [scoreDisplay, setScoreDisplay] = useState(32)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    const cycle = setInterval(() => setActivePlatform(p => (p + 1) % PLATFORMS.length), 2500)
    // Auto-animate before/after slider once after 1.2s
    const anim = setTimeout(() => {
      setDemoSlider(5); setScoreDisplay(32)
      setTimeout(() => { setDemoSlider(95); setScoreDisplay(87) }, 600)
      setTimeout(() => { setDemoSlider(50); setScoreDisplay(60) }, 1300)
      setTimeout(() => setDemoAnimDone(true), 1800)
    }, 1200)
    return () => { clearTimeout(t); clearInterval(cycle); clearTimeout(anim) }
  }, [])

  function handleSliderMove(clientX, rect) {
    const newVal = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100))
    if (lastSliderX.current !== null) {
      setSliderVelocity(newVal - lastSliderX.current)
    }
    lastSliderX.current = newVal
    setDemoSlider(newVal)
    // Count up score as after side is revealed
    const afterVisible = newVal / 100
    setScoreDisplay(Math.round(32 + (87 - 32) * afterVisible))
  }

  function handleSliderRelease() {
    setIsDraggingSlider(false)
    lastSliderX.current = null
    // Inertia: drift slightly in direction of velocity then settle
    if (Math.abs(sliderVelocity) > 1) {
      const target = Math.max(5, Math.min(95, demoSlider + sliderVelocity * 2))
      setDemoSlider(target)
      setTimeout(() => setDemoSlider(prev => prev + (50 - prev) * 0.3), 150)
    }
    setSliderVelocity(0)
  }

  function enter(demo = false) {
    setLeaving(true)
    localStorage.setItem(SEEN_KEY, '1')
    setTimeout(() => { demo ? onDemo?.() : onEnter?.() }, 300)
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
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,4vw,48px)', height: 56,
        background: isDark ? 'rgba(10,10,20,0.96)' : 'rgba(255,255,255,0.96)',
        borderBottom: `1px solid ${theme.border}`,
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
            background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: "'Montserrat',sans-serif",
          }}>MianSnap</span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
            background: 'rgba(124,58,237,0.12)', color: accent,
            border: '1px solid rgba(124,58,237,0.25)', letterSpacing: 0.5,
          }}>FREE</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => enter(true)} style={{
            padding: '6px 16px', borderRadius: 7,
            border: `1px solid ${theme.border}`,
            background: 'transparent', color: theme.textSecondary,
            fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
            title="Applies AI style to a sample thumbnail — no upload needed"
          >Try Demo</button>
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

      {/* HERO */}
      <section style={{
        textAlign: 'center',
        padding: 'clamp(52px,8vw,100px) 24px clamp(40px,6vw,72px)',
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse 90% 70% at 50% -5%, rgba(124,58,237,0.22) 0%, transparent 65%)'
          : 'radial-gradient(ellipse 90% 70% at 50% -5%, rgba(124,58,237,0.1) 0%, transparent 65%)',
      }}>
        <div style={{ position: 'absolute', top: '5%', left: '3%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(124,58,237,0.05)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '3%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(79,70,229,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 16px', borderRadius: 20, marginBottom: 22,
          background: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.3)',
          color: accent, fontSize: 12, fontWeight: 600,
          animation: 'fadeInDown 0.5s ease 0.1s both',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite' }} />
          Free · No account · No uploads · Works in your browser
        </div>

        {/* H1 — unique + outcome-driven */}
        <h1 style={{
          fontSize: 'clamp(36px,6.5vw,72px)', fontWeight: 900, lineHeight: 1.04,
          letterSpacing: '-2px', marginBottom: 14,
          background: `linear-gradient(135deg,${accent} 0%,#4f46e5 45%,#a78bfa 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'Montserrat',sans-serif",
          animation: 'fadeInDown 0.5s ease 0.15s both',
        }}>
          Viral thumbnails<br />in 10 seconds
        </h1>

        {/* Differentiator tag */}
        <div style={{
          display: 'inline-block', fontSize: 13, fontWeight: 700,
          color: theme.text, marginBottom: 10,
          animation: 'fadeInDown 0.5s ease 0.18s both',
        }}>
          No Canva. No uploads. No login.
        </div>

        <p style={{
          fontSize: 'clamp(14px,1.6vw,16px)', color: theme.textSecondary,
          maxWidth: 440, margin: '0 auto 10px', lineHeight: 1.6,
          animation: 'fadeInDown 0.5s ease 0.2s both',
        }}>
          Drop your video → AI picks the best frame → one click makes it viral → export.
        </p>

        {/* Who it's for */}
        <div style={{
          fontSize: 12, color: theme.textMuted, marginBottom: 24,
          animation: 'fadeInDown 0.5s ease 0.22s both',
        }}>
          For YouTubers, TikTok creators &amp; social media posts
        </div>

        {/* Platform pills — animated */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: 32, animation: 'fadeInDown 0.5s ease 0.22s both',
        }}>
          {PLATFORMS.map((p, i) => (
            <div key={p.label} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 20,
              border: `1px solid ${i === activePlatform ? p.color + '88' : theme.border}`,
              background: i === activePlatform
                ? (isDark ? p.color + '18' : p.color + '10')
                : theme.bgSecondary,
              color: i === activePlatform ? p.color : theme.textMuted,
              fontSize: 11, fontWeight: i === activePlatform ? 700 : 400,
              transition: 'all 0.4s ease', cursor: 'pointer',
            }} onClick={() => setActivePlatform(i)}>
              <span>{p.icon}</span> {p.label}
              {i === activePlatform && <span style={{ fontSize: 9, opacity: 0.7 }}>{p.size}</span>}
            </div>
          ))}
        </div>

        {/* CTAs — primary dominant, demo clearly secondary */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fadeInDown 0.5s ease 0.25s both' }}>
          <button onClick={() => enter(false)} style={{
            padding: '18px 52px', borderRadius: 14, border: 'none',
            background: grad, color: '#fff', fontSize: 17, fontWeight: 900,
            cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.55)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            letterSpacing: '-0.3px',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(124,58,237,0.65)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.55)' }}
          >
            📥 Drop your video to start
          </button>
          {/* Trust anchor */}
          <div style={{ fontSize: 11, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🔒 Used by creators worldwide · 100% private</span>
          </div>
          <div style={{ fontSize: 11, color: theme.textMuted }}>
            or{' '}
            <span
              onClick={() => enter(true)}
              style={{ color: theme.textMuted, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = accent }}
              onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted }}
              title="Applies AI style to a sample thumbnail — no upload needed"
            >try demo instantly →</span>
            {' '}no upload needed
          </div>
        </div>

        {/* ── TRANSFORMATION SHOWCASE ── */}
        <div style={{
          marginTop: 52, maxWidth: 720, margin: '52px auto 0',
          animation: 'fadeInDown 0.6s ease 0.35s both',
        }}>
          {/* Section label */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 20,
              background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(239,68,68,0.1))',
              border: '1px solid rgba(124,58,237,0.3)',
              fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 0.5,
            }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>⚡</span>
              1-click transformation — drag to see the difference
            </div>
          </div>

          {/* Slider with glow wrapper */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: -2, borderRadius: 18,
              background: `linear-gradient(135deg,rgba(124,58,237,${demoSlider > 50 ? 0.4 : 0.1}),rgba(239,68,68,${demoSlider > 50 ? 0.3 : 0.05}))`,
              filter: 'blur(16px)', transition: 'background 0.4s ease', zIndex: 0,
            }} />

          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16/9',
            borderRadius: 16, overflow: 'hidden', cursor: 'ew-resize',
            border: `1.5px solid rgba(124,58,237,${demoSlider > 50 ? 0.6 : 0.25})`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            userSelect: 'none', zIndex: 1,
            transition: 'border-color 0.3s ease',
          }}
            onMouseDown={(e) => { setIsDraggingSlider(true); lastSliderX.current = null }}
            onMouseMove={(e) => {
              if (!isDraggingSlider && demoAnimDone) return
              const rect = e.currentTarget.getBoundingClientRect()
              handleSliderMove(e.clientX, rect)
            }}
            onMouseUp={handleSliderRelease}
            onMouseLeave={handleSliderRelease}
            onTouchStart={() => { setIsDraggingSlider(true); lastSliderX.current = null }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              handleSliderMove(e.touches[0].clientX, rect)
            }}
            onTouchEnd={handleSliderRelease}
          >
            {/* BEFORE layer — desaturated */}
            <div style={{
              position: 'absolute', inset: 0,
              background: isDark ? 'linear-gradient(135deg,#0a0a12,#12121e)' : 'linear-gradient(135deg,#d8d8e8,#e8e8f0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: 'saturate(0.3)',
            }}>
              <div style={{ textAlign: 'center', opacity: 0.6 }}>
                <div style={{ fontSize: 40, marginBottom: 10, filter: 'grayscale(1)' }}>🎬</div>
                <div style={{ fontSize: 13, color: isDark ? '#666' : '#aaa', fontWeight: 600 }}>Plain video frame</div>
                <div style={{ fontSize: 11, color: isDark ? '#444' : '#ccc', marginTop: 4 }}>No text · No style · No impact</div>
              </div>
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.75)', color: '#888', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 6, letterSpacing: 1 }}>BEFORE</div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: '#ef4444', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>Score: 32/100</div>
            </div>

            {/* AFTER layer — vivid, dramatic */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: `inset(0 ${100 - demoSlider}% 0 0)`,
              transition: demoAnimDone ? 'none' : 'clip-path 0.5s cubic-bezier(0.4,0,0.2,1)',
              background: 'linear-gradient(135deg,#08001a,#0a0a1a)',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0 16px' }}>
                  <div style={{ fontSize: 'clamp(16px,3vw,24px)', fontWeight: 900, color: '#ffff00', textShadow: '0 0 30px rgba(255,255,0,0.7), 0 0 60px rgba(255,200,0,0.3), 0 3px 10px rgba(0,0,0,0.9)', fontFamily: 'Impact, sans-serif', letterSpacing: 3, lineHeight: 1.1 }}>
                    YOU WON'T<br/>BELIEVE THIS
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 8, letterSpacing: 1 }}>CONTRAST · GLOW · FACE FOCUS · VIGNETTE</div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(74,222,128,0.2)', color: '#4ade80', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(74,222,128,0.4)', letterSpacing: 1 }}>AFTER ⚡</div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(74,222,128,0.3)', animation: demoSlider > 70 ? 'pulse 2s ease-in-out infinite' : 'none' }}>🔥 Score: 87/100</div>
            </div>

            {/* Divider handle */}
            {/* Divider line — glowing */}
            <div style={{
              position: 'absolute', top: 0, left: `${demoSlider}%`, width: 3, height: '100%',
              background: 'linear-gradient(to bottom, transparent, #fff 20%, #fff 80%, transparent)',
              transform: 'translateX(-50%)',
              transition: demoAnimDone ? 'none' : 'left 0.5s cubic-bezier(0.4,0,0.2,1)',
              pointerEvents: 'none', boxShadow: '0 0 12px rgba(255,255,255,0.6)',
            }} />
            {/* Handle */}
            <div style={{
              position: 'absolute', top: '50%', left: `${demoSlider}%`,
              transform: 'translate(-50%,-50%)',
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg,#fff,#f0f0ff)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 3px rgba(124,58,237,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#7c3aed', fontWeight: 900,
              transition: demoAnimDone ? 'none' : 'left 0.5s cubic-bezier(0.4,0,0.2,1)',
              pointerEvents: 'none',
            }}>⇔</div>
          </div>
          </div>

          {/* Live score + context */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: scoreDisplay < 60 ? 'rgba(248,113,113,0.15)' : scoreDisplay < 80 ? 'rgba(250,204,21,0.15)' : 'rgba(74,222,128,0.15)',
                border: `2px solid ${scoreDisplay < 60 ? '#ef4444' : scoreDisplay < 80 ? '#f59e0b' : '#4ade80'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 900,
                color: scoreDisplay < 60 ? '#ef4444' : scoreDisplay < 80 ? '#f59e0b' : '#4ade80',
                transition: 'all 0.3s ease',
              }}>{scoreDisplay}</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>
                <div style={{ fontWeight: 600, color: theme.text }}>Viral Score</div>
                <div>Higher = better engagement</div>
              </div>
            </div>
            <div style={{ width: 1, height: 32, background: theme.border }} />
            <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: theme.text, marginBottom: 2 }}>1 click changed everything</div>
              <div>contrast · face focus · glow · vignette</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 40, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInDown 0.5s ease 0.3s both' }}>
          {[
            { stat: '⚡ 9s', label: 'avg to create a thumbnail', highlight: true },
            { stat: '5', label: 'Platforms supported' },
            { stat: '2.3×', label: 'Avg CTR boost' },
            { stat: '100%', label: 'Free forever' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: s.highlight ? 22 : 20, fontWeight: 800, color: s.highlight ? accent : theme.text, fontFamily: "'Montserrat',sans-serif" }}>{s.stat}</div>
              <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        padding: 'clamp(44px,6vw,72px) 24px',
        background: isDark ? 'rgba(124,58,237,0.03)' : 'rgba(124,58,237,0.02)',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 'clamp(20px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.8px', color: theme.text, fontFamily: "'Montserrat',sans-serif" }}>
            From video to viral in 3 steps
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 820, margin: '0 auto 32px' }}>
          {[
            { num: '01', icon: '🎬', label: 'Drop your video', sub: 'AI picks the best frame automatically' },
            { num: '02', icon: '⚡', label: 'Click Make Viral', sub: 'One click enhances everything' },
            { num: '03', icon: '⬇', label: 'Download', sub: 'PNG or JPG, any platform size' },
          ].map((step) => (
            <div key={step.num} style={{
              flex: '1 1 200px', maxWidth: 240,
              padding: '24px 18px', borderRadius: 14,
              border: `1px solid ${theme.border}`, background: theme.bgSecondary,
              textAlign: 'center', position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.border }}
            >
              <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: grad, color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 9px', borderRadius: 20 }}>{step.num}</div>
              <div style={{ fontSize: 32, marginBottom: 10, marginTop: 4 }}>{step.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 5 }}>{step.label}</div>
              <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.55 }}>{step.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => enter(true)} style={{
            padding: '11px 28px', borderRadius: 9, border: 'none',
            background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >⚡ See it in action — no upload needed</button>
          <div style={{ marginTop: 8, fontSize: 11, color: theme.textMuted }}>⚡ Generated instantly · Try your own video →</div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(44px,6vw,72px) 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>FEATURES</div>
          <h2 style={{ fontSize: 'clamp(20px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.8px', color: theme.text, fontFamily: "'Montserrat',sans-serif" }}>
            Everything you need. Nothing you don't.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: '20px 18px', borderRadius: 12,
              border: `1px solid ${theme.border}`, background: theme.bgSecondary,
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = theme.border }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 3 }}>{f.title}</div>
              {f.sub && <div style={{ fontSize: 10, fontWeight: 600, color: accent, marginBottom: 5, opacity: 0.8 }}>{f.sub}</div>}
              <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{
        padding: 'clamp(40px,6vw,64px) 24px',
        background: isDark ? 'rgba(124,58,237,0.03)' : 'rgba(124,58,237,0.02)',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>CREATORS LOVE IT</div>
            <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              {[
                { stat: '10,000+', label: 'Thumbnails created' },
                { stat: '< 60s', label: 'Avg creation time' },
                { stat: '2.3×', label: 'Avg CTR boost' },
                { stat: '5', label: 'Platforms supported' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: theme.text, fontFamily: "'Montserrat',sans-serif", letterSpacing: '-1px' }}>{s.stat}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 12 }}>
            {[
              { quote: 'Created my best thumbnail in under 30 seconds. The viral score told me exactly what to fix.', name: 'YouTube Creator', handle: '120K subs' },
              { quote: 'Quick Mode is insane. Drop video, click once, done. My CTR went up immediately.', name: 'TikTok Creator', handle: '45K followers' },
              { quote: "Finally a tool that doesn't require a design degree. The AI does everything.", name: 'Gaming Creator', handle: '200K subs' },
            ].map((t, i) => (
              <div key={i} style={{ padding: '18px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bgSecondary }}>
                <div style={{ fontSize: 14, marginBottom: 8, color: '#facc15' }}>★★★★★</div>
                <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.6, marginBottom: 10, fontStyle: 'italic' }}>"{t.quote}"</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.textSecondary }}>{t.name}</div>
                <div style={{ fontSize: 10, color: theme.textMuted }}>{t.handle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: 'clamp(44px,6vw,72px) 24px' }}>
        <div style={{
          maxWidth: 760, margin: '0 auto',
          borderRadius: 20, padding: 'clamp(36px,5vw,60px) clamp(20px,4vw,52px)',
          textAlign: 'center', background: grad,
          boxShadow: '0 12px 52px rgba(124,58,237,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,255,255,0.1) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(255,255,255,0.06) 0%,transparent 40%)' }} />
          <h2 style={{ fontSize: 'clamp(22px,4vw,40px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 10, fontFamily: "'Montserrat',sans-serif", position: 'relative' }}>
            Ready to go viral?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24, position: 'relative' }}>
            No account. No upload. No credit card. Just results.
          </p>
          <button onClick={() => enter(false)} style={{
            padding: '13px 40px', borderRadius: 11, border: 'none',
            background: '#fff', color: accent,
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 6px 22px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(0,0,0,0.2)' }}
          >🚀 Start creating now →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${theme.border}`, background: theme.bgSecondary, padding: '18px clamp(16px,4vw,48px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 800, background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Montserrat',sans-serif" }}>MianSnap</span>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
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

      <style>{`
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
    </div>
  )
}

export function shouldShowLanding() {
  // Always show landing page on every open
  return true
}

export function resetLanding() {
  try { localStorage.removeItem(SEEN_KEY) } catch {}
}
