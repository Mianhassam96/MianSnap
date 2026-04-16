import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

export default function ExportModal({ onClose, dataUrl, filename, quality, format }) {
  const { theme } = useUIStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function download() {
    const a = document.createElement('a')
    a.href = dataUrl; a.download = filename; a.click()
  }

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, animation: 'fadeIn 0.2s ease',
    },
    modal: {
      background: theme.bgSecondary, borderRadius: 16,
      border: `1px solid ${theme.border}`,
      boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      maxWidth: 560, width: '92%',
      animation: 'scaleIn 0.2s ease',
      overflow: 'hidden',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 24px', borderBottom: `1px solid ${theme.border}`,
    },
    title: { fontSize: 16, fontWeight: 700, color: theme.text },
    closeBtn: {
      width: 30, height: 30, borderRadius: 6, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textMuted, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
    },
    preview: {
      padding: '20px 24px',
      background: theme.isDark ? '#050508' : '#f0f0f8',
      display: 'flex', justifyContent: 'center',
    },
    img: {
      width: '100%', maxWidth: 480, aspectRatio: '16/9',
      objectFit: 'cover', borderRadius: 8,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    },
    meta: {
      display: 'flex', gap: 8, padding: '12px 24px',
      borderBottom: `1px solid ${theme.border}`,
    },
    badge: {
      padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
      background: theme.accentGlow, color: theme.accent,
      border: `1px solid ${theme.borderHover}`,
    },
    actions: {
      display: 'flex', gap: 10, padding: '16px 24px',
    },
    downloadBtn: {
      flex: 1, padding: '12px', borderRadius: 8, border: 'none',
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
      transition: 'transform 0.15s, box-shadow 0.15s',
      boxShadow: '0 3px 16px rgba(124,58,237,0.4)',
    },
    secondBtn: {
      padding: '12px 20px', borderRadius: 8,
      border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textSecondary,
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      transition: 'all 0.15s',
    },
    successBanner: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 24px', background: theme.isDark ? 'rgba(74,222,128,0.08)' : 'rgba(22,163,74,0.06)',
      borderBottom: `1px solid ${theme.isDark ? 'rgba(74,222,128,0.2)' : 'rgba(22,163,74,0.2)'}`,
      color: theme.success, fontSize: 13, fontWeight: 600,
    },
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={s.title}>🎉 Thumbnail Ready!</div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Success banner */}
        <div style={s.successBanner}>
          <span>✓</span>
          <span>Your thumbnail has been exported successfully</span>
        </div>

        {/* Preview */}
        <div style={s.preview}>
          <img src={dataUrl} alt="Export preview" style={s.img} />
        </div>

        {/* Meta */}
        <div style={s.meta}>
          <span style={s.badge}>{format.toUpperCase()}</span>
          <span style={s.badge}>{quality}</span>
          <span style={s.badge}>16:9</span>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.downloadBtn} onClick={download}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 16px rgba(124,58,237,0.4)' }}
          >
            ⬇ Download Again
          </button>
          <button style={s.secondBtn} onClick={onClose}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
          >
            Create Variation
          </button>
          <button style={s.secondBtn} onClick={onClose}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
