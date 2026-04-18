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
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.type.startsWith('video/')) {
      setVideoFile(file)
    } else if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      applyImageAsBackground(fabricCanvas, url, 'cover')
      setHasImage(true)
    }
  }, [fabricCanvas, setVideoFile])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*,image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      if (file.type.startsWith('video/')) {
        setVideoFile(file)
      } else if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        applyImageAsBackground(fabricCanvas, url, 'cover')
        setHasImage(true)
      }
    }
    input.click()
  }, [fabricCanvas, setVideoFile])

  // Hide once video/image is loaded — AFTER all hooks
  if (videoUrl || hasImage) return null

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        background: dragging
          ? (theme.isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.06)')
          : 'transparent',
        border: dragging ? `2px dashed ${theme.accent}` : '2px dashed transparent',
        borderRadius: 8,
        transition: 'all 0.2s',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Drop zone visual */}
      <div style={{
        textAlign: 'center', maxWidth: 380, padding: '0 24px',
        animation: 'fadeIn 0.4s ease',
        pointerEvents: 'none',
      }}>
        {/* Big drop icon */}
        <div style={{
          fontSize: 52, marginBottom: 16,
          filter: dragging ? 'drop-shadow(0 0 16px rgba(124,58,237,0.6))' : 'none',
          transition: 'filter 0.2s',
        }}>
          {dragging ? '📥' : '🎬'}
        </div>

        <div style={{
          fontSize: 20, fontWeight: 900, color: theme.text,
          marginBottom: 8, letterSpacing: '-0.5px',
          fontFamily: "'Montserrat', sans-serif",
        }}>
          {dragging ? 'Drop it!' : 'Drop video or image here'}
        </div>

        <div style={{
          fontSize: 13, color: theme.textSecondary,
          marginBottom: 28, lineHeight: 1.6,
        }}>
          {dragging
            ? 'Release to load onto canvas'
            : <>Or <span style={{ color: theme.accent, fontWeight: 600 }}>click anywhere</span> to browse files</>
          }
        </div>

        {/* Action buttons — stop propagation so they don't trigger the outer click */}
        {!dragging && (
          <div
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { id: 'video', icon: '🎬', label: 'Upload Video', sub: 'AI picks best frames', action: onUploadVideo },
              { id: 'image', icon: '🖼', label: 'Upload Image', sub: 'Edit directly', action: onUploadImage },
              { id: 'template', icon: '✨', label: 'Use Template', sub: 'Gaming, Drama...', action: onUseTemplate },
            ].map(c => (
              <div key={c.id}
                style={{
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${hovered === c.id ? theme.accent : theme.border}`,
                  background: hovered === c.id ? theme.accentGlow : theme.bgSecondary,
                  transition: 'all 0.15s',
                  transform: hovered === c.id ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: hovered === c.id ? theme.shadowLg : 'none',
                  minWidth: 96, textAlign: 'center',
                }}
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={c.action}
              >
                <div style={{ fontSize: 22, marginBottom: 5 }}>{c.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{c.label}</div>
                <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Mode CTA */}
        {!dragging && (
          <div onClick={(e) => { e.stopPropagation(); onQuickMode?.() }} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', borderRadius: 20,
            background: 'linear-gradient(135deg,#0ea5e9,#6366f1,#7c3aed)',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 3px 16px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.5)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 16px rgba(99,102,241,0.4)' }}
          >
            🚀 Quick Mode — 1-click thumbnail
          </div>
        )}
      </div>
    </div>
  )
}
