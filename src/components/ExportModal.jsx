import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'

const PERFORMANCE_MSGS = [
  'This could perform 2–3× better than average thumbnails.',
  'High contrast + bold text = higher CTR. You nailed it.',
  'Thumbnails like this get 40% more clicks on average.',
  'Strong composition detected — this is ready to go viral.',
  'Creator-level quality. Upload it and watch the clicks.',
]

export default function ExportModal({ onClose, onCreateAnother, dataUrl, filename, quality, format, viralScore }) {
  const { theme } = useUIStore()
  const [copied, setCopied] = useState(false)
  const [perfMsg] = useState(() => PERFORMANCE_MSGS[Math.floor(Math.random() * PERFORMANCE_MSGS.length)])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function download() {
    const a = document.createElement('a')
    a.href = dataUrl; a.download = filename; a.click()
  }

  async function copyImage() {
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback — copy data URL as text
      navigator.clipboard.writeText(dataUrl).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const scoreColor = viralScore >= 75 ? theme.success : viralScore >= 50 ? theme.warning : theme.danger

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, animation: 'fadeIn 0.2s ease',
    },
    modal: {
      background: theme.bgSecondary, borderRadius: 18,
      border: `1px solid ${theme.border}`,
      boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      maxWidth: 560, width: '92%',
      animation: 'scaleIn 0.22s ease',
      overflow: 'hidden',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 24px', borderBottom: `1px solid ${theme.border}`,
    },
    titleWrap: { display: 'flex', flexDirection: 'column', gap: 2 },
    title: { fontSize: 18, fontWeight: 800, color: theme.text },
    subtitle: { fontSize: 12, color: theme.textMuted },
    closeBtn: {
      width: 30, height: 30, borderRadius: 6, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textMuted, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
    },

    // Emotional success banner
    successBanner: {
      padding: '14px 24px',
      background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.08))',
      borderBottom: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', gap: 12,
    },
    successIcon: { fontSize: 28, flexShrink: 0 },
    successText: { flex: 1 },
    successTitle: { fontSize: 13, fontWeight: 700, color: theme.text, marginBottom: 2 },
    successMsg: { fontSize: 11, color: theme.textSecondary, lineHeight: 1.4 },

    preview: {
      padding: '16px 24px',
      background: theme.isDark ? '#050508' : '#f0f0f8',
      display: 'flex', justifyContent: 'center', position: 'relative',
    },
    img: {
      width: '100%', maxWidth: 480, aspectRatio: '16/9',
      objectFit: 'cover', borderRadius: 8,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    },
    watermark: {
      position: 'absolute', bottom: 24, right: 32,
      fontSize: 10, color: 'rgba(255,255,255,0.5)',
      fontWeight: 600, letterSpacing: 0.5,
      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
    },

    meta: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px',
      borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap',
    },
    badge: {
      padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
      background: theme.accentGlow, color: theme.accent,
      border: `1px solid ${theme.borderHover}`,
    },
    scoreBadge: {
      padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700,
      background: viralScore ? `${scoreColor}18` : theme.bgTertiary,
      color: viralScore ? scoreColor : theme.textMuted,
      border: `1px solid ${viralScore ? scoreColor + '44' : theme.border}`,
      marginLeft: 'auto',
    },

    actions: {
      display: 'flex', gap: 8, padding: '14px 24px', flexWrap: 'wrap',
    },
    downloadBtn: {
      flex: 1, minWidth: 120, padding: '11px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
      transition: 'transform 0.15s, box-shadow 0.15s',
      boxShadow: '0 3px 16px rgba(124,58,237,0.4)',
    },
    secondBtn: {
      padding: '11px 16px', borderRadius: 8,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textSecondary,
      fontSize: 12, fontWeight: 500, cursor: 'pointer',
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    },

    // Share section
    shareRow: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 24px 14px',
      borderTop: `1px solid ${theme.border}`,
    },
    shareLabel: { fontSize: 11, color: theme.textMuted, flexShrink: 0 },
    shareLink: {
      flex: 1, padding: '6px 10px', borderRadius: 6,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textMuted,
      fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    copyBtn: {
      padding: '6px 12px', borderRadius: 6, border: 'none',
      background: copied ? theme.success : theme.accent,
      color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
      transition: 'background 0.2s', flexShrink: 0,
    },
  }

  const hover = (e, on) => {
    e.currentTarget.style.borderColor = on ? theme.accent : theme.border
    e.currentTarget.style.color = on ? theme.accent : theme.textSecondary
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.titleWrap}>
            <div style={s.title}>🎉 Thumbnail Ready!</div>
            <div style={s.subtitle}>Your thumbnail has been exported</div>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Emotional success banner */}
        <div style={s.successBanner}>
          <div style={s.successIcon}>🚀</div>
          <div style={s.successText}>
            <div style={s.successTitle}>This thumbnail is ready to perform</div>
            <div style={s.successMsg}>{perfMsg}</div>
          </div>
        </div>

        {/* Preview */}
        <div style={s.preview}>
          <img src={dataUrl} alt="Export preview" style={s.img} />
          <div style={s.watermark}>Made with MianSnap</div>
        </div>

        {/* Meta + score */}
        <div style={s.meta}>
          <span style={s.badge}>{format.toUpperCase()}</span>
          <span style={s.badge}>{quality}</span>
          <span style={s.badge}>16:9</span>
          {viralScore && (
            <span style={s.scoreBadge}>
              {viralScore >= 75 ? '🔥' : viralScore >= 50 ? '⚡' : '⚠️'} {viralScore}/100
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.downloadBtn} onClick={download}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 16px rgba(124,58,237,0.4)' }}
          >
            ⬇ Download Again
          </button>
          <button style={s.secondBtn} onClick={onCreateAnother || onClose}
            onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}
          >
            🔄 Create Another
          </button>
          <button style={s.secondBtn} onClick={onClose}
            onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}
          >
            Close
          </button>
        </div>

        {/* Share / copy hook */}
        <div style={s.shareRow}>
          <span style={s.shareLabel}>Share:</span>
          <div style={s.shareLink}>Made with MianSnap — mianhassam96.github.io/MianSnap/</div>
          <button style={s.copyBtn} onClick={copyImage}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
