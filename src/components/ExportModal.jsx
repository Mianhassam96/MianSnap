import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'

const PERF_MSGS = [
  'High contrast + bold text = higher CTR. You nailed it.',
  'Thumbnails like this get 40% more clicks on average.',
  'Strong composition detected — this is ready to go viral.',
  'Creator-level quality. Upload it and watch the clicks.',
  'This could perform 2–3× better than average thumbnails.',
]

const SITE_URL = 'https://mianhassam96.github.io/MianSnap/'

export default function ExportModal({ onClose, onCreateAnother, dataUrl, filename, quality, format, viralScore, prevScore, timeToResult }) {
  const { theme } = useUIStore()
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [watermark, setWatermark] = useState(false)
  const [perfMsg] = useState(() => PERF_MSGS[Math.floor(Math.random() * PERF_MSGS.length)])

  const scoreImproved = prevScore && viralScore && viralScore > prevScore
  const improvement = scoreImproved ? viralScore - prevScore : null

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  function download() {
    if (!watermark) {
      const a = document.createElement('a')
      a.href = dataUrl; a.download = filename; a.click()
      return
    }
    // Add watermark
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.width; c.height = img.height
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      ctx.font = `bold ${Math.round(img.width * 0.018)}px Inter, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.textAlign = 'right'
      ctx.fillText('Made with MianSnap', img.width - 14, img.height - 12)
      const a = document.createElement('a')
      a.href = c.toDataURL('image/jpeg', 0.93)
      a.download = filename; a.click()
    }
    img.src = dataUrl
  }

  async function copyImage() {
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
    } catch {
      navigator.clipboard.writeText(dataUrl).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
    window.showToast?.('Image copied to clipboard!', 'success')
  }

  function copyLink() {
    navigator.clipboard.writeText(SITE_URL).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
    window.showToast?.('Link copied — share MianSnap!', 'success')
  }

  const scoreColor = !viralScore ? theme.textMuted
    : viralScore >= 75 ? theme.success
    : viralScore >= 50 ? theme.warning
    : theme.danger

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, animation: 'fadeIn 0.2s ease',
    },
    modal: {
      background: theme.bgSecondary, borderRadius: 18,
      border: `1px solid ${theme.border}`,
      boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      maxWidth: 540, width: '92%',
      animation: 'scaleIn 0.22s ease',
      overflow: 'hidden', maxHeight: '92vh', overflowY: 'auto',
    },
    btn: (primary) => ({
      flex: 1, minWidth: 100, padding: '11px', borderRadius: 8,
      border: primary ? 'none' : `1px solid ${theme.border}`,
      background: primary ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : theme.bgTertiary,
      color: primary ? '#fff' : theme.textSecondary,
      fontSize: 12, fontWeight: primary ? 700 : 500, cursor: 'pointer',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
      boxShadow: primary ? '0 3px 16px rgba(124,58,237,0.4)' : 'none',
    }),
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${theme.border}` }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: theme.text }}>
              {viralScore >= 75 ? '🔥 Viral-Ready Thumbnail!' : viralScore >= 50 ? '⚡ Strong Thumbnail!' : '🎉 Thumbnail Ready!'}
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>Exported as {format.toUpperCase()} · {quality}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {viralScore && (
              <div style={{
                textAlign: 'center', padding: '4px 12px', borderRadius: 8,
                background: viralScore >= 75 ? 'rgba(74,222,128,0.12)' : viralScore >= 50 ? 'rgba(250,204,21,0.12)' : 'rgba(248,113,113,0.12)',
                border: `1px solid ${scoreColor}44`,
              }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{viralScore}</div>
                <div style={{ fontSize: 8, color: scoreColor, fontWeight: 600 }}>/ 100</div>
              </div>
            )}
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.textMuted, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        </div>

        {/* Outcome message */}
        {viralScore && (
          <div style={{
            padding: '10px 22px',
            background: viralScore >= 75
              ? 'linear-gradient(135deg,rgba(74,222,128,0.1),rgba(22,163,74,0.06))'
              : 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.06))',
            borderBottom: `1px solid ${scoreColor}22`,
            fontSize: 12, color: theme.text, fontWeight: 600,
          }}>
            {viralScore >= 75
              ? '🚀 This content is optimized for engagement — upload it now and watch the clicks.'
              : viralScore >= 50
              ? '⚡ Good thumbnail. Add bold text or a face for even higher CTR.'
              : '💡 Try hitting Make Viral before exporting for a stronger result.'}
          </div>
        )}

        {/* Score improvement banner */}
        {improvement && (
          <div style={{
            padding: '10px 22px',
            background: `linear-gradient(135deg,${theme.success}18,${theme.success}08)`,
            borderBottom: `1px solid ${theme.success}33`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>📈</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.success }}>Score improved +{improvement} this session!</div>
              <div style={{ fontSize: 10, color: theme.textSecondary }}>{prevScore} → {viralScore}/100 — great work</div>
            </div>
          </div>
        )}

        {/* Time to result badge */}
        {timeToResult && timeToResult < 120 && (
          <div style={{
            padding: '8px 22px',
            background: 'linear-gradient(135deg,rgba(14,165,233,0.1),rgba(99,102,241,0.08))',
            borderBottom: `1px solid rgba(14,165,233,0.2)`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9' }}>
              Created in {timeToResult}s
            </span>
            <span style={{ fontSize: 11, color: theme.textSecondary }}>
              {timeToResult < 15 ? '— lightning fast!' : timeToResult < 30 ? '— great speed!' : ''}
            </span>
          </div>
        )}

        {/* Success banner */}
        <div style={{ padding: '12px 22px', background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.06))', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>🚀</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>This thumbnail is ready to perform</div>
            <div style={{ fontSize: 11, color: theme.textSecondary }}>{perfMsg}</div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ padding: '14px 22px', background: theme.isDark ? '#050508' : '#f0f0f8', display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <img src={dataUrl} alt="Export preview" style={{ width: '100%', maxWidth: 460, aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }} />
          {watermark && (
            <div style={{ position: 'absolute', bottom: 22, right: 30, fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: 0.5, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              Made with MianSnap
            </div>
          )}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 22px', borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap' }}>
          {[format.toUpperCase(), quality, '16:9'].map(b => (
            <span key={b} style={{ padding: '3px 9px', borderRadius: 5, fontSize: 10, fontWeight: 600, background: theme.accentGlow, color: theme.accent, border: `1px solid ${theme.borderHover}` }}>{b}</span>
          ))}
          {viralScore && (
            <span style={{ padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: scoreColor + '18', color: scoreColor, border: `1px solid ${scoreColor}44`, marginLeft: 'auto' }}>
              {viralScore >= 75 ? '🔥' : viralScore >= 50 ? '⚡' : '⚠️'} {viralScore}/100
            </span>
          )}
          {/* Watermark toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: theme.textMuted, cursor: 'pointer', marginLeft: 4 }}>
            <input type="checkbox" checked={watermark} onChange={e => setWatermark(e.target.checked)} style={{ accentColor: theme.accent }} />
            Watermark
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 22px', flexWrap: 'wrap' }}>
          <button style={s.btn(true)} onClick={download}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 16px rgba(124,58,237,0.4)' }}
          >⬇ Download</button>
          <button style={s.btn(false)} onClick={copyImage}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
          >{copied ? '✓ Copied!' : '📋 Copy Image'}</button>
        </div>

        {/* Retention Loop — Create Another / Try Different Style */}
        <div style={{ padding: '0 22px 16px', display: 'flex', gap: 8 }}>
          <button
            onClick={onCreateAnother || onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            🔄 Create Another
          </button>
          <button
            onClick={() => {
              onClose()
              window.dispatchEvent(new CustomEvent('miansnap:tryDifferentStyle'))
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 8,
              border: `1px solid ${theme.accent}`,
              background: 'transparent',
              color: theme.accent,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            🎨 Try Different Style
          </button>
        </div>

        {/* Advanced mode nudge — context-based discovery */}
        <div style={{
          margin: '0 22px 16px',
          padding: '10px 14px', borderRadius: 8,
          background: theme.isDark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)',
          border: `1px solid ${theme.borderHover}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.accent }}>Want more control?</div>
            <div style={{ fontSize: 10, color: theme.textSecondary }}>Try advanced editing — layers, filters, custom fonts</div>
          </div>
          <button
            onClick={() => {
              onClose()
              window.dispatchEvent(new CustomEvent('miansnap:manualEdit'))
            }}
            style={{
              padding: '5px 12px', borderRadius: 6, border: 'none',
              background: theme.accent, color: '#fff',
              fontSize: 10, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}
          >Try it →</button>
        </div>

        {/* Next step guidance */}
        <div style={{ padding: '0 22px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 10, color: theme.textMuted, width: '100%', marginBottom: 4, fontWeight: 600 }}>
            What's next?
          </div>
          {[
            { icon: '▶', label: 'Upload to YouTube', hint: 'Recommended size: 1280×720' },
            { icon: '🔄', label: 'Try another version', action: onCreateAnother },
            { icon: '📊', label: 'Check your score', hint: 'See what to improve' },
          ].map(item => (
            <button key={item.label}
              onClick={item.action || onClose}
              style={{
                flex: 1, minWidth: 100, padding: '8px 8px', borderRadius: 7,
                border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                color: theme.textSecondary, fontSize: 10, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
            >
              <div>{item.icon} {item.label}</div>
              {item.hint && <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{item.hint}</div>}
            </button>
          ))}
        </div>

        {/* Share section — viral loop */}
        <div style={{ padding: '12px 22px 16px', borderTop: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 10 }}>
            🔥 Show this to a friend
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <button onClick={copyImage} style={{
              flex: 1, padding: '8px', borderRadius: 7, border: `1px solid ${theme.border}`,
              background: theme.bgTertiary, color: theme.textSecondary,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
            >{copied ? '✓ Image Copied!' : '📋 Copy Image'}</button>
            <button onClick={copyLink} style={{
              flex: 1, padding: '8px', borderRadius: 7, border: 'none',
              background: linkCopied ? theme.success : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
            }}>
              {linkCopied ? '✓ Link Copied!' : '🚀 Share MianSnap'}
            </button>
          </div>
          <div style={{ fontSize: 10, color: theme.textMuted, textAlign: 'center' }}>
            Share the tool with other creators — it's free forever
          </div>
        </div>

      </div>
    </div>
  )
}
