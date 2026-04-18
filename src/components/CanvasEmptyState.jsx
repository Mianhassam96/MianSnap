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
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.type.startsWith('video/')) { setVideoFile(file) }
    else if (file.type.startsWith('image/')) {
      applyImageAsBackground(fabricCanvas, URL.createObjectURL(file), 'cover')
      setHasImage(true)
    }
  }, [fabricCanvas, setVideoFile])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'video/*,image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return
      if (file.type.startsWith('video/')) { setVideoFile(file) }
      else if (file.type.startsWith('image/')) {
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
      <div style={{
        textAlign: 'center', maxWidth: 400, padding: '0 24px',
        animation: 'fadeIn 0.35s ease',
        pointerEvents: 'none',
      }}>

        {/* Icon with bounce when idle */}
        <div style={{
          fontSize: 48, marginBottom: 10,
          filter: dragging ? `drop-shadow(0 0 14px ${accent})` : 'none',
          animation: !dragging ? 'iconBounce 2s ease-in-out infinite' : 'none',
          transition: 'filter 0.2s',
        }}>
          {dragging ? '📥' : '🎬'}
        </div>

        {/* Primary */}
        <div style={{
          fontSize: 21, fontWeight: 900, color: theme.text,
          marginBottom: 5, letterSpacing: '-0.5px',
          fontFamily: "'Montserrat',sans-serif",
        }}>
          {dragging ? 'Drop it!' : 'Drop video or image here'}
        </div>

        {/* Sub — CTA reinforcement */}
        <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 8, lineHeight: 1.5 }}>
          {dragging
            ? 'Release to load onto canvas'
            : <>or <span style={{ color: accent, fontWeight: 600 }}>click anywhere</span> to browse · or drop your own frame below</>
          }
        </div>

        {/* Flow guide */}
        {!dragging && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, marginBottom: 24, flexWrap: 'wrap',
          }}>
            {[
              { icon: '🧠', label: 'AI picks best frame' },
              { icon: '⚡', label: 'One click enhances' },
              { icon: '⬇', label: 'Export instantly' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: theme.textMuted, fontWeight: 500 }}>
                  <span>{s.icon}</span>{s.label}
                </span>
                {i < 2 && <span style={{ color: theme.border, fontSize: 10 }}>→</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Action cards */}
        {!dragging && (
          <div
            style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { id: 'video', icon: '🎬', label: 'Upload Video', sub: 'AI picks frames', action: onUploadVideo },
              { id: 'image', icon: '🖼', label: 'Upload Image', sub: 'Edit directly', action: onUploadImage },
              { id: 'template', icon: '✨', label: 'Use Template', sub: 'Gaming, Drama...', action: onUseTemplate },
            ].map(c => (
              <div key={c.id}
                style={{
                  padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${hovered === c.id ? accent : theme.border}`,
                  background: hovered === c.id ? theme.accentGlow : theme.bgSecondary,
                  transition: 'all 0.15s',
                  transform: hovered === c.id ? 'translateY(-2px)' : 'translateY(0)',
                  minWidth: 88, textAlign: 'center',
                }}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={c.action}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{c.label}</div>
                <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 1 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Mode */}
        {!dragging && (
          <div
            onClick={(e) => { e.stopPropagation(); onQuickMode?.() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 20,
              background: 'linear-gradient(135deg,#0ea5e9,#6366f1,#7c3aed)',
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 3px 14px rgba(99,102,241,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(99,102,241,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 14px rgba(99,102,241,0.35)' }}
          >
            🚀 Quick Mode — no upload needed
          </div>
        )}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes emptyPulse {
          0%,100% { border-color: transparent; }
          50% { border-color: rgba(124,58,237,0.2); }
        }
        @keyframes iconBounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
