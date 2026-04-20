import React from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

export default function FrameSelector({ onFrameSelect }) {
  const { theme } = useUIStore()
  const { frames } = useVideoStore()

  if (frames.length === 0) return null

  // Show only top 5 frames
  const topFrames = frames.filter(f => f.isBest).slice(0, 5)
  if (topFrames.length === 0) return null

  return (
    <div style={{
      marginTop: 16,
      padding: '12px',
      borderRadius: 10,
      background: theme.bgTertiary,
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: theme.textMuted,
        marginBottom: 10,
        textAlign: 'center',
      }}>
        Want a different moment?
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gap: 6,
      }}>
        {topFrames.map((frame, i) => (
          <button
            key={i}
            onClick={() => onFrameSelect?.(frame)}
            style={{
              padding: 0,
              border: `2px solid ${theme.border}`,
              borderRadius: 6,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'transparent',
              transition: 'all 0.15s',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.accent
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <img
              src={frame.dataUrl}
              alt={`Frame ${i + 1}`}
              style={{
                width: '100%',
                aspectRatio: '16/9',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {frame.isBest && (
              <div style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: 'rgba(250,204,21,0.9)',
                color: '#000',
                fontSize: 8,
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: 3,
              }}>
                ⭐
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
