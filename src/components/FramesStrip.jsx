import { useRef, useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { applyImageAsBackground } from '../utils/imageUtils'
import { fabric } from '../lib/fabric'

export default function FramesStrip() {
  const { theme, fitMode } = useUIStore()
  const { videoUrl, frames, selectedFrame, setSelectedFrame, isExtracting } = useVideoStore()
  const { fabricCanvas } = useCanvasStore()
  const [snapFlash, setSnapFlash] = useState(null)

  if (!videoUrl && frames.length === 0) return null

  const fmt = (t) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`

  function applyFrame(frame, idx) {
    setSelectedFrame(frame)
    if (!fabricCanvas) return
    setSnapFlash(idx)
    setTimeout(() => setSnapFlash(null), 1700)
    applyImageAsBackground(fabricCanvas, frame.dataUrl, fitMode, () => {
      window.showToast?.('🖼 Frame applied', 'success', 1000)
    })
  }

  return (
    <div style={{
      background: theme.bgSecondary,
      borderBottom: `1px solid ${theme.border}`,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 14px 4px',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent, textTransform: 'uppercase', letterSpacing: 1 }}>
          🎬 Choose your frame
        </span>
        {isExtracting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: theme.accent }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: theme.accent, animation: 'pulse 1s infinite' }} />
            Analyzing...
          </div>
        )}
        {!isExtracting && frames.length > 0 && (
          <span style={{ fontSize: 10, color: theme.textMuted }}>
            ⭐ Best moment selected · click any to use
          </span>
        )}
      </div>

      {/* Frames row */}
      <div style={{
        display: 'flex', gap: 6, padding: '6px 14px',
        overflowX: 'auto', alignItems: 'center',
        minHeight: 80,
      }}>
        {frames.length === 0 && !isExtracting && (
          <div style={{ fontSize: 11, color: theme.textMuted, padding: '8px 0' }}>
            Upload a video to see frames here
          </div>
        )}
        {frames.map((f, i) => (
          <div key={i} style={{
            position: 'relative', flexShrink: 0,
            transform: snapFlash === i ? 'scale(0.93)' : 'scale(1)',
            transition: 'transform 0.15s',
          }}>
            {/* Pulse overlay on best/selected */}
            {snapFlash === i && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 5, borderRadius: 6,
                background: 'rgba(124,58,237,0.45)',
                border: '2px solid rgba(124,58,237,0.8)',
                animation: 'pulse 0.7s ease-in-out 2',
                pointerEvents: 'none',
              }} />
            )}
            <img
              src={f.dataUrl}
              alt={fmt(f.time)}
              style={{
                height: 60,
                aspectRatio: '16/9',
                objectFit: 'cover',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'block',
                border: `2px solid ${
                  selectedFrame?.time === f.time
                    ? theme.accent
                    : f.isBest
                    ? '#facc15'
                    : theme.border
                }`,
                boxShadow: selectedFrame?.time === f.time
                  ? `0 0 0 2px ${theme.accentGlow}, 0 0 10px rgba(124,58,237,0.4)`
                  : f.isBest
                  ? '0 0 8px rgba(250,204,21,0.4)'
                  : 'none',
                transition: 'border-color 0.15s, transform 0.12s',
              }}
              onClick={() => applyFrame(f, i)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)' }}
              title={`${fmt(f.time)}${f.isBest ? ' — Best moment' : ''}`}
            />
            {f.isBest && (
              <div style={{
                position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                color: '#fff', fontSize: 7, fontWeight: 800,
                padding: '1px 6px', borderRadius: 8, whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(245,158,11,0.5)',
              }}>⭐ BEST</div>
            )}
            <div style={{
              position: 'absolute', bottom: 3, right: 3,
              background: 'rgba(0,0,0,0.75)', color: '#fff',
              fontSize: 8, padding: '1px 4px', borderRadius: 3,
            }}>{fmt(f.time)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
