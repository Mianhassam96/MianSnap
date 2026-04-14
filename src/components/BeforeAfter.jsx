import React, { useState, useRef, useEffect } from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import useUIStore from '../store/useUIStore'

export default function BeforeAfter() {
  const { fabricCanvas } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const { theme } = useUIStore()
  const [afterUrl, setAfterUrl] = useState(null)
  const [sliderX, setSliderX] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  function capture() {
    if (!fabricCanvas) return
    setAfterUrl(fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.9 }))
  }

  function handleMouseMove(e) {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setSliderX(Math.max(5, Math.min(95, x)))
  }

  function handleTouchMove(e) {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    setSliderX(Math.max(5, Math.min(95, x)))
  }

  const s = {
    wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 },
    captureBtn: {
      width: '100%', padding: '9px', borderRadius: 7, border: 'none',
      background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    },
    container: {
      position: 'relative', width: '100%', aspectRatio: '16/9',
      borderRadius: 8, overflow: 'hidden', cursor: 'ew-resize',
      border: `1px solid ${theme.border}`,
      userSelect: 'none',
    },
    img: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
    afterClip: (x) => ({
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      clipPath: `inset(0 0 0 ${x}%)`,
    }),
    divider: (x) => ({
      position: 'absolute', top: 0, left: `${x}%`, width: 2, height: '100%',
      background: '#fff', boxShadow: '0 0 8px rgba(0,0,0,0.5)',
      transform: 'translateX(-50%)',
    }),
    handle: (x) => ({
      position: 'absolute', top: '50%', left: `${x}%`,
      transform: 'translate(-50%,-50%)',
      width: 32, height: 32, borderRadius: '50%',
      background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, color: '#333', fontWeight: 700,
    }),
    label: (side) => ({
      position: 'absolute', top: 8,
      [side === 'before' ? 'left' : 'right']: 8,
      background: 'rgba(0,0,0,0.6)', color: '#fff',
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      letterSpacing: 0.5,
    }),
    hint: { fontSize: 11, color: theme.textMuted, textAlign: 'center' },
  }

  const beforeUrl = selectedFrame?.dataUrl

  return (
    <div style={s.wrap}>
      <div style={s.title}>Before / After Preview</div>
      <button style={s.captureBtn} onClick={capture}>📸 Capture Current State</button>

      {!beforeUrl && (
        <div style={s.hint}>Upload a video and pick a frame first.</div>
      )}

      {beforeUrl && afterUrl && (
        <div
          ref={containerRef}
          style={s.container}
          onMouseMove={handleMouseMove}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchMove={handleTouchMove}
          onTouchStart={() => setDragging(true)}
          onTouchEnd={() => setDragging(false)}
        >
          {/* Before */}
          <img src={beforeUrl} alt="Before" style={s.img} draggable={false} />
          <div style={s.label('before')}>BEFORE</div>

          {/* After */}
          <div style={s.afterClip(sliderX)}>
            <img src={afterUrl} alt="After" style={s.img} draggable={false} />
          </div>
          <div style={s.label('after')}>AFTER</div>

          {/* Divider */}
          <div style={s.divider(sliderX)} />
          <div style={s.handle(sliderX)}>⇔</div>
        </div>
      )}

      {beforeUrl && !afterUrl && (
        <div style={s.hint}>Edit your canvas then click "Capture" to compare.</div>
      )}
    </div>
  )
}
