import React, { useState, useRef, useEffect } from 'react'
import { scoreToLabel } from '../utils/trustEngine.js'

// Animated score counter
function ScoreCounter({ target }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 40)
    const interval = setInterval(() => {
      start = Math.min(start + step, target)
      setDisplay(start)
      if (start >= target) clearInterval(interval)
    }, 30)
    return () => clearInterval(interval)
  }, [target])
  return <>{display}</>
}

// Circular score ring
function ScoreRing({ score, color }) {
  const r = 70
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(circ * (1 - score / 100))
    }, 200)
    return () => clearTimeout(t)
  }, [score, circ])

  return (
    <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      <circle
        cx="90" cy="90" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 8px ${color}80)` }}
      />
    </svg>
  )
}

export default function TrustCard({ result, originalContent, onReset, onAnalyzeAnother }) {
  const [copied, setCopied] = useState(false)
  const [shareExpanded, setShareExpanded] = useState(false)
  const cardRef = useRef(null)

  const { claim, trust_score, label, color, emoji, bg, risk_label, signals, word_count, analyzed_at } = result

  const shareText = `🛡️ MianSnap Trust Analysis\n\nClaim: "${claim}"\n\nTrust Score: ${trust_score}/100 ${emoji} ${label}\nRisk: ${risk_label}\n\nCheck any content at: https://mianhassam96.github.io/MianSnap/`

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleShareTwitter = () => {
    const tweet = encodeURIComponent(`🛡️ Trust Score: ${trust_score}/100 ${emoji} ${label}\n\n"${claim.slice(0, 100)}"\n\nCheck any content → https://mianhassam96.github.io/MianSnap/ #MianSnap #TrustLayer`)
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank', 'noopener')
  }

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(shareText)
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener')
  }

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://mianhassam96.github.io/MianSnap/')}`, '_blank', 'noopener')
  }

  const formattedDate = new Date(analyzed_at).toLocaleString()

  // Score band description
  const getBandDesc = (score) => {
    if (score >= 75) return 'This content shows strong credibility signals and evidence-based language.'
    if (score >= 50) return 'This content has mixed signals. Verify with additional sources before sharing.'
    if (score >= 30) return 'This content shows several low-trust indicators. Treat with caution.'
    return 'This content shows multiple high-risk patterns. Do not rely on this information.'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 16px 48px',
      animation: 'fadeIn .5s ease',
    }}>
      {/* Top nav */}
      <div style={{
        width: '100%', maxWidth: '680px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>🛡️</div>
          <span style={{
            fontSize: '16px', fontWeight: 800,
            background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MianSnap</span>
        </div>
        <button
          onClick={onAnalyzeAnother}
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            color: '#a5b4fc',
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
        >
          + Analyze Another
        </button>
      </div>

      {/* ── TRUST CARD ── */}
      <div
        ref={cardRef}
        style={{
          width: '100%', maxWidth: '680px',
          background: 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${color}40`,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: `0 0 60px ${color}15, 0 20px 60px rgba(0,0,0,0.4)`,
          animation: 'fadeUp .5s ease both',
        }}
      >
        {/* Card header band */}
        <div style={{
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          borderBottom: `1px solid ${color}20`,
          padding: '24px 28px',
          display: 'flex', alignItems: 'center', gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: `${color}20`, border: `1px solid ${color}40`,
              borderRadius: '20px', padding: '4px 12px',
              fontSize: '12px', fontWeight: 700, color,
              marginBottom: '10px', letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              {emoji} {label}
            </div>
            <h2 style={{
              fontSize: 'clamp(14px, 2.5vw, 17px)',
              fontWeight: 600, color: '#e2e8f0',
              lineHeight: 1.5,
            }}>
              "{claim}"
            </h2>
          </div>

          {/* Score ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ScoreRing score={trust_score} color={color} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '36px', fontWeight: 900, color,
                lineHeight: 1, fontFamily: 'Space Grotesk, Inter, sans-serif',
              }}>
                <ScoreCounter target={trust_score} />
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>/ 100</span>
              <span style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>TRUST</span>
            </div>
          </div>
        </div>

        {/* Risk label */}
        <div style={{
          padding: '16px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '18px' }}>
            {trust_score >= 70 ? '✅' : trust_score >= 45 ? '⚠️' : '🚨'}
          </span>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Risk Classification</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color }}>{risk_label}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#475569' }}>Words analyzed</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>{word_count}</div>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Trust Level</span>
            <span style={{ fontSize: '12px', color, fontWeight: 600 }}>{trust_score}%</span>
          </div>
          <div style={{
            height: '8px', background: 'rgba(255,255,255,0.05)',
            borderRadius: '100px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${trust_score}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
              borderRadius: '100px',
              transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
              boxShadow: `0 0 10px ${color}60`,
            }} />
          </div>
          {/* Scale labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            {['Very Low', 'Low', 'Moderate', 'High'].map((l, i) => (
              <span key={l} style={{ fontSize: '10px', color: '#334155' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Signals */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            📡 Trust Signals Detected
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {signals.length > 0 ? signals.map((signal, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '10px 14px',
                background: signal.startsWith('✅') ? 'rgba(34,197,94,0.06)'
                  : signal.startsWith('❌') ? 'rgba(239,68,68,0.06)'
                  : signal.startsWith('⚠️') ? 'rgba(245,158,11,0.06)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${
                  signal.startsWith('✅') ? 'rgba(34,197,94,0.15)'
                  : signal.startsWith('❌') ? 'rgba(239,68,68,0.15)'
                  : signal.startsWith('⚠️') ? 'rgba(245,158,11,0.15)'
                  : 'rgba(255,255,255,0.05)'
                }`,
                borderRadius: '10px',
                fontSize: '14px',
                color: '#cbd5e1',
                lineHeight: 1.5,
                animation: `fadeUp .4s ${i * 0.08}s ease both`,
                opacity: 0,
                animationFillMode: 'forwards',
              }}>
                {signal}
              </div>
            )) : (
              <div style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>
                No specific signals detected — content is too short or ambiguous.
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            padding: '16px',
            background: `${color}08`,
            border: `1px solid ${color}20`,
            borderRadius: '12px',
            fontSize: '14px',
            color: '#94a3b8',
            lineHeight: 1.7,
          }}>
            <strong style={{ color: '#e2e8f0' }}>Summary: </strong>
            {getBandDesc(trust_score)}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.6 }}>
            ⚠️ <strong style={{ color: '#475569' }}>Disclaimer:</strong> This score is based on heuristic pattern analysis, not absolute fact-checking. Always verify important claims with multiple trusted sources. MianSnap does not label content as definitively "fake" or "real."
          </p>
        </div>

        {/* Share section */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Share result:</span>

            <button
              onClick={handleCopyResult}
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.1)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.2)'}`,
                color: copied ? '#86efac' : '#a5b4fc',
                borderRadius: '10px', padding: '8px 16px',
                fontSize: '13px', fontWeight: 600,
                transition: 'all .2s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy Result'}
            </button>

            <button
              onClick={handleShareTwitter}
              style={{
                background: 'rgba(29,161,242,0.1)',
                border: '1px solid rgba(29,161,242,0.2)',
                color: '#60a5fa',
                borderRadius: '10px', padding: '8px 16px',
                fontSize: '13px', fontWeight: 600,
                transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(29,161,242,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(29,161,242,0.1)'}
            >
              𝕏 Twitter
            </button>

            <button
              onClick={handleShareWhatsApp}
              style={{
                background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.2)',
                color: '#4ade80',
                borderRadius: '10px', padding: '8px 16px',
                fontSize: '13px', fontWeight: 600,
                transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.1)'}
            >
              💬 WhatsApp
            </button>

            <button
              onClick={handleShareLinkedIn}
              style={{
                background: 'rgba(10,102,194,0.1)',
                border: '1px solid rgba(10,102,194,0.2)',
                color: '#93c5fd',
                borderRadius: '10px', padding: '8px 16px',
                fontSize: '13px', fontWeight: 600,
                transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,102,194,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,102,194,0.1)'}
            >
              in LinkedIn
            </button>
          </div>

          {/* Timestamp */}
          <p style={{ fontSize: '11px', color: '#334155', marginTop: '12px' }}>
            Analyzed at {formattedDate} · MianSnap Trust Layer
          </p>
        </div>
      </div>

      {/* CTA below card */}
      <div style={{
        marginTop: '24px', width: '100%', maxWidth: '680px',
        display: 'flex', gap: '12px', flexWrap: 'wrap',
      }}>
        <button
          onClick={onAnalyzeAnother}
          style={{
            flex: 1, minWidth: '200px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none',
            borderRadius: '14px', padding: '14px 24px',
            fontSize: '15px', fontWeight: 700,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            transition: 'all .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🔍 Analyze Another
        </button>

        <button
          onClick={handleCopyResult}
          style={{
            flex: 1, minWidth: '200px',
            background: 'rgba(255,255,255,0.04)',
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '14px 24px',
            fontSize: '15px', fontWeight: 600,
            transition: 'all .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        >
          📤 Share This Result
        </button>
      </div>

      {/* How it works */}
      <div style={{
        marginTop: '40px', width: '100%', maxWidth: '680px',
        padding: '24px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(99,102,241,0.1)',
        borderRadius: '16px',
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          How the score is calculated
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { icon: '🌐', label: 'Source credibility', desc: 'Domain trust level' },
            { icon: '🔍', label: 'Cross-verification', desc: 'Link & source signals' },
            { icon: '🧠', label: 'AI risk patterns', desc: 'Language analysis' },
            { icon: '📊', label: 'Virality patterns', desc: 'Emotional intensity' },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{
              padding: '12px',
              background: 'rgba(99,102,241,0.05)',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>{label}</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', fontSize: '12px', color: '#334155', textAlign: 'center' }}>
        Built by{' '}
        <a href="https://multimian.com" target="_blank" rel="noopener noreferrer"
          style={{ color: '#6366f1', textDecoration: 'none' }}>
          MultiMian
        </a>
        {' '}· MianSnap Trust Layer · Free forever
      </div>
    </div>
  )
}

function getBandDesc(score) {
  if (score >= 75) return 'This content shows strong credibility signals and evidence-based language.'
  if (score >= 50) return 'This content has mixed signals. Verify with additional sources before sharing.'
  if (score >= 30) return 'This content shows several low-trust indicators. Treat with caution.'
  return 'This content shows multiple high-risk patterns. Do not rely on this information.'
}
