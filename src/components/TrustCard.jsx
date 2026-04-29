import React, { useState, useEffect } from 'react'

// ── Animated score counter ────────────────────────────────────────────────────
function ScoreCounter({ target }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let v = 0
    const step = Math.max(1, Math.ceil(target / 45))
    const id = setInterval(() => {
      v = Math.min(v + step, target)
      setN(v)
      if (v >= target) clearInterval(id)
    }, 25)
    return () => clearInterval(id)
  }, [target])
  return <>{n}</>
}

// ── Circular score ring ───────────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const r = 68
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ * (1 - score / 100)), 150)
    return () => clearTimeout(t)
  }, [score, circ])
  return (
    <svg width="176" height="176" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="88" cy="88" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle cx="88" cy="88" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 10px ${color}90)` }} />
    </svg>
  )
}

// ── Heatmap bar ───────────────────────────────────────────────────────────────
function HeatBar({ label, value, color }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(value), 300); return () => clearTimeout(t) }, [value])
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${w}%`, background: color,
          borderRadius: '100px', transition: 'width 1s cubic-bezier(.4,0,.2,1)',
          boxShadow: `0 0 8px ${color}80`,
        }} />
      </div>
    </div>
  )
}

// ── Signal row ────────────────────────────────────────────────────────────────
const SEVERITY_STYLES = {
  critical: { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  text: '#fca5a5' },
  bad:      { bg: 'rgba(239,68,68,0.05)',  border: 'rgba(239,68,68,0.15)',  text: '#fca5a5' },
  warn:     { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)',  text: '#fde68a' },
  good:     { bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.2)',   text: '#86efac' },
  info:     { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.15)', text: '#c4b5fd' },
}

function SignalRow({ icon, text, severity = 'info', delay = 0 }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '10px 14px',
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: '10px', fontSize: '13px', color: s.text, lineHeight: 1.5,
      animation: `fadeUp .4s ${delay}s ease both`, opacity: 0, animationFillMode: 'forwards',
    }}>
      <span style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children, style = {} }) {
  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', ...style }}>
      {title && (
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function TrustCard({ result, onAnalyzeAnother }) {
  const [copied, setCopied] = useState(false)
  const {
    claim, trust_score, label, color, emoji, textColor,
    risk_label, signals, word_count, emotional, ai_analysis,
    viral, cred_impact, heatmap, manipulation_count, credibility_count,
    analyzed_at,
  } = result

  const shareText = `🛡️ MianSnap Trust Analysis\n\nClaim: "${claim}"\n\nTrust Score: ${trust_score}/100 ${emoji} ${label}\nRisk: ${risk_label}\n\n${cred_impact.message}\n\nAnalyze any content → https://mianhassam96.github.io/MianSnap/ #MianSnap #TrustLayer`

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch {}
  }
  const tweet = () => {
    const t = encodeURIComponent(`🛡️ Trust Score: ${trust_score}/100 ${emoji} ${label}\n\n"${claim.slice(0, 100)}"\n\n${cred_impact.message}\n\nCheck any content → https://mianhassam96.github.io/MianSnap/ #MianSnap #TrustLayer`)
    window.open(`https://twitter.com/intent/tweet?text=${t}`, '_blank', 'noopener')
  }
  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 16px 60px', animation: 'fadeIn .4s ease' }}>

      {/* ── NAV ── */}
      <div style={{ width: '100%', maxWidth: '720px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🛡️</div>
          <span style={{ fontSize: '16px', fontWeight: 800, background: 'linear-gradient(135deg,#a5b4fc,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MianSnap</span>
        </div>
        <button onClick={onAnalyzeAnother} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, transition: 'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
          + Analyze Another
        </button>
      </div>

      {/* ── MAIN CARD ── */}
      <div style={{ width: '100%', maxWidth: '720px', background: 'rgba(255,255,255,0.025)', border: `1.5px solid ${color}35`, borderRadius: '24px', overflow: 'hidden', boxShadow: `0 0 80px ${color}12, 0 24px 80px rgba(0,0,0,0.5)`, animation: 'fadeUp .5s ease both' }}>

        {/* ── HEADER: Score + Claim ── */}
        <div style={{ background: `linear-gradient(135deg, ${color}18, ${color}06)`, borderBottom: `1px solid ${color}20`, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${color}22`, border: `1px solid ${color}45`, borderRadius: '20px', padding: '4px 14px', fontSize: '11px', fontWeight: 800, color: textColor, marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {emoji} {label}
            </div>
            <p style={{ fontSize: 'clamp(13px,2vw,16px)', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.6, marginBottom: '12px' }}>
              "{claim}"
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{word_count}</span> words
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{manipulation_count}</span> red flags
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{credibility_count}</span> trust signals
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ScoreRing score={trust_score} color={color} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '38px', fontWeight: 900, color: textColor, lineHeight: 1 }}><ScoreCounter target={trust_score} /></span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>/ 100</span>
              <span style={{ fontSize: '9px', color: '#475569', marginTop: '2px', letterSpacing: '1px' }}>TRUST SCORE</span>
            </div>
          </div>
        </div>

        {/* ── RISK CLASSIFICATION ── */}
        <Section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              {trust_score >= 72 ? '✅' : trust_score >= 52 ? '⚠️' : trust_score >= 32 ? '🚨' : '☠️'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px' }}>RISK CLASSIFICATION</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: textColor }}>{risk_label}</div>
            </div>
            {/* Trust bar */}
            <div style={{ width: '120px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#475569' }}>Trust</span>
                <span style={{ fontSize: '10px', color, fontWeight: 700 }}>{trust_score}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${trust_score}%`, background: `linear-gradient(90deg,${color}80,${color})`, borderRadius: '100px', transition: 'width 1.2s ease', boxShadow: `0 0 8px ${color}60` }} />
              </div>
            </div>
          </div>
        </Section>

        {/* ── TRUTH MIRROR (Credibility Impact) ── */}
        <Section title="🪞 Truth Mirror — Your Credibility at Stake">
          <div style={{ padding: '16px', background: `${cred_impact.color}10`, border: `1px solid ${cred_impact.color}30`, borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '36px', fontWeight: 900, color: cred_impact.color, fontFamily: 'Space Grotesk, Inter, sans-serif', flexShrink: 0 }}>
              -{cred_impact.impact}%
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>{cred_impact.message}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Based on content trust signals and manipulation patterns</div>
            </div>
          </div>
        </Section>

        {/* ── VIRAL SPREAD SIMULATOR ── */}
        <Section title="🔥 Viral Spread Simulator">
          <div style={{ padding: '16px', background: `${viral.spreadColor}10`, border: `1px solid ${viral.spreadColor}30`, borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: viral.spreadColor, background: `${viral.spreadColor}20`, border: `1px solid ${viral.spreadColor}40`, borderRadius: '20px', padding: '3px 12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {viral.spreadLabel}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: viral.spreadColor, marginLeft: 'auto' }}>
                {viral.viralPotential}%
              </div>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ height: '100%', width: `${viral.viralPotential}%`, background: `linear-gradient(90deg,${viral.spreadColor}80,${viral.spreadColor})`, borderRadius: '100px', transition: 'width 1.2s ease', boxShadow: `0 0 10px ${viral.spreadColor}60` }} />
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{viral.spreadWarning}</p>
          </div>
        </Section>

        {/* ── RISK HEATMAP ── */}
        <Section title="🗺️ Content Risk Heatmap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            {Object.values(heatmap).map(({ label: l, value, color: c }) => (
              <HeatBar key={l} label={l} value={value} color={c} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
            {[['#22c55e','Safe'],['#f59e0b','Questionable'],['#ef4444','High Risk']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: '11px', color: '#475569' }}>{l}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TRUST SIGNALS ── */}
        <Section title="📡 Trust Signals Detected">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {signals.length > 0
              ? signals.map((s, i) => <SignalRow key={i} icon={s.icon} text={s.text} severity={s.severity} delay={i * 0.06} />)
              : <p style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>No specific signals detected — content may be too short.</p>
            }
          </div>
        </Section>

        {/* ── AI WRITING DETECTOR ── */}
        <Section title="🤖 AI Writing Style Detector">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: ai_analysis.aiScore >= 50 ? '#f97316' : ai_analysis.aiScore >= 25 ? '#f59e0b' : '#22c55e', marginBottom: '4px' }}>
                {ai_analysis.label}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>AI pattern confidence: {ai_analysis.aiScore}%</div>
            </div>
            <div style={{ width: '80px', height: '80px', position: 'relative', flexShrink: 0 }}>
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke={ai_analysis.aiScore >= 50 ? '#f97316' : ai_analysis.aiScore >= 25 ? '#f59e0b' : '#22c55e'}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 * (1 - ai_analysis.aiScore / 100)}
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>
                {ai_analysis.aiScore}%
              </div>
            </div>
          </div>
          {ai_analysis.signals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {ai_analysis.signals.map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: s.type === 'warning' ? '#fde68a' : '#94a3b8', padding: '6px 10px', background: s.type === 'warning' ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid ${s.type === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)'}` }}>
                  {s.type === 'warning' ? '⚠️' : 'ℹ️'} {s.text}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── EMOTIONAL INTENSITY ── */}
        <Section title="💢 Emotional Intensity Meter">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: emotional.score >= 60 ? '#ef4444' : emotional.score >= 35 ? '#f97316' : '#22c55e', marginBottom: '6px' }}>
                {emotional.label} Emotional Intensity
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${emotional.score}%`, background: emotional.score >= 60 ? 'linear-gradient(90deg,#f97316,#ef4444)' : emotional.score >= 35 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : '#22c55e', borderRadius: '100px', transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                {emotional.highCount} high-intensity + {emotional.medCount} medium-intensity emotional words
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: emotional.score >= 60 ? '#ef4444' : emotional.score >= 35 ? '#f97316' : '#22c55e', flexShrink: 0 }}>
              {emotional.score}%
            </div>
          </div>
        </Section>

        {/* ── DISCLAIMER ── */}
        <Section>
          <div style={{ padding: '12px 16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '10px' }}>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.7 }}>
              <strong style={{ color: '#6366f1' }}>MianSnap analyzes content patterns and credibility signals.</strong> It does not claim absolute truth. This score is based on psychological and linguistic pattern analysis — not real-time fact-checking. Always verify important claims with multiple trusted sources.
            </p>
          </div>
        </Section>

        {/* ── SHARE ── */}
        <Section title="📤 Share This Result">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={copy} style={{ background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.1)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.25)'}`, color: copied ? '#86efac' : '#a5b4fc', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {copied ? '✅ Copied!' : '📋 Copy Result'}
            </button>
            <button onClick={tweet} style={{ background: 'rgba(29,161,242,0.1)', border: '1px solid rgba(29,161,242,0.2)', color: '#60a5fa', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,161,242,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(29,161,242,0.1)'}>
              𝕏 Twitter
            </button>
            <button onClick={whatsapp} style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)', color: '#4ade80', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, transition: 'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}>
              💬 WhatsApp
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#334155', marginTop: '10px' }}>
            Analyzed {new Date(analyzed_at).toLocaleString()} · MianSnap Trust Layer
          </p>
        </Section>

      </div>

      {/* ── CTA ── */}
      <div style={{ marginTop: '20px', width: '100%', maxWidth: '720px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={onAnalyzeAnother} style={{ flex: 1, minWidth: '200px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px 24px', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 20px rgba(99,102,241,0.4)', transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          🔍 Analyze Another
        </button>
        <button onClick={copy} style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '14px 24px', fontSize: '15px', fontWeight: 600, transition: 'all .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
          📤 Share This Result
        </button>
      </div>

      <div style={{ marginTop: '32px', fontSize: '12px', color: '#334155', textAlign: 'center' }}>
        Built by <a href="https://multimian.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>MultiMian</a> · MianSnap Trust Layer · Free forever
      </div>
    </div>
  )
}
