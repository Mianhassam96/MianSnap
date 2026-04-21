import React, { useState, useCallback } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { applyImageAsBackground } from '../utils/imageUtils'

export default function CanvasEmptyState({ onUploadVideo, onUploadImage, onUseTemplate, onQuickMode }) {
  const { theme } = useUIStore()
  const { videoUrl, setVideoFile } = useVideoStore()
  const { fabricCanvas } = useCanvasStore()
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(null)
  const [hasImage, setHasImage] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); setDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragging(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    if (files.length > 1) {
      window.showToast?.('⚠️ Multiple files detected — using the first one', 'info', 3000)
    }
    const file = files[0]
    if (!file) return
    if (file.type && file.type.startsWith('video/')) { setVideoFile(file) }
    else if (file.type && file.type.startsWith('image/')) {
      applyImageAsBackground(fabricCanvas, URL.createObjectURL(file), 'cover')
      setHasImage(true)
    } else {
      window.showToast?.(`❌ Unsupported file type: ${file.type || 'unknown'} — use video or image`, 'error', 4000)
    }
  }, [fabricCanvas, setVideoFile])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'video/*,image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return
      if (file.type && file.type.startsWith('video/')) { setVideoFile(file) }
      else if (file.type && file.type.startsWith('image/')) {
        applyImageAsBackground(fabricCanvas, URL.createObjectURL(file), 'cover')
        setHasImage(true)
      }
    }
    input.click()
  }, [fabricCanvas, setVideoFile])

  if (videoUrl || hasImage) return null

  const accent = '#7c3aed'

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        // Soft pulse border when idle, solid when dragging
        border: dragging ? `2px dashed ${accent}` : `2px dashed transparent`,
        borderRadius: 8,
        background: dragging
          ? (theme.isDark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.05)')
          : 'transparent',
        transition: 'background 0.2s, border-color 0.2s',
        animation: !dragging ? 'emptyPulse 3s ease-in-out infinite' : 'none',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Ghost pulse ring — visual anchor so canvas never feels "broken" */}
      {!dragging && (
        <div style={{
          position: 'absolute', inset: 24, borderRadius: 12,
          border: '2px dashed rgba(124,58,237,0.18)',
          pointerEvents: 'none',
          animation: 'ghostRing 3s ease-in-out infinite',
        }} />
      )}

      <div style={{
        textAlign: 'center', maxWidth: 400, padding: '0 24px',
        animation: 'fadeIn 0.35s ease',
        pointerEvents: 'none',
        position: 'relative', zIndex: 1,
      }}>

        {/* Icon with bounce */}
        <div style={{
          fontSize: 52, marginBottom: 12,
          filter: dragging ? `drop-shadow(0 0 14px ${accent})` : 'none',
          animation: !dragging ? 'iconBounce 2s ease-in-out infinite' : 'none',
          transition: 'filter 0.2s',
        }}>
          {dragging ? '📥' : '🎬'}
        </div>

        {/* Primary CTA */}
        <div style={{
          fontSize: dragging ? 28 : 32, fontWeight: 900,
          color: dragging ? '#7c3aed' : theme.text,
          marginBottom: 8, letterSpacing: '-0.8px',
          fontFamily: "'Montserrat',sans-serif",
          lineHeight: 1.15,
        }}>
          {dragging ? '📥 Drop it!' : 'Drop your video here'}
        </div>

        {/* Ghost instruction — always visible, never ambiguous */}
        <div style={{
          fontSize: 13, color: theme.textMuted, marginBottom: 6,
          lineHeight: 1.6, fontWeight: 500,
        }}>
          {dragging
            ? 'Release to start — AI does the rest'
            : 'or click anywhere to browse files'
          }
        </div>

        {/* What happens next — removes "is it loading?" confusion */}
        {!dragging && (
          <div style={{
            fontSize: 11, color: theme.textMuted, marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: accent }}>①</span> AI picks best frame
            </span>
            <span style={{ color: theme.border }}>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: accent }}>②</span> Makes it viral
            </span>
            <span style={{ color: theme.border }}>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: accent }}>③</span> Ready in 10s
            </span>
          </div>
        )}

        {/* Trust line — inline, subtle */}
        {!dragging && (
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>🔒</span>
            <span>100% private — nothing uploaded</span>
          </div>
        )}

        {/* Secondary options — smaller, less prominent */}
        {!dragging && (
          <div
            style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { id: 'image', icon: '🖼', label: 'Upload Image', action: onUploadImage },
              { id: 'template', icon: '✨', label: 'Use Template', action: onUseTemplate },
            ].map(c => (
              <div key={c.id}
                style={{
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${hovered === c.id ? accent : theme.border}`,
                  background: hovered === c.id ? theme.accentGlow : theme.bgSecondary,
                  transition: 'all 0.15s', fontSize: 11, fontWeight: 600,
                  color: hovered === c.id ? accent : theme.textSecondary,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={c.action}
              >
                <span>{c.icon}</span>{c.label}
              </div>
            ))}
          </div>
        )}

        {/* Quick Mode — secondary */}
        {!dragging && (
          <div
            onClick={(e) => { e.stopPropagation(); onQuickMode?.() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 16,
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.textMuted, fontSize: 11, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
          >
            🚀 No video? Try Quick Mode
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes emptyPulse {
          0%,100% { border-color: transparent; }
          50% { border-color: rgba(124,58,237,0.25); }
        }
        @keyframes ghostRing {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.01); }
        }
        @keyframes iconBounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
