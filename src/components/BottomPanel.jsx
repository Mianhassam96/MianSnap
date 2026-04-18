import { useRef, useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { extractFrames, captureFrame, stepFrame } from '../utils/frameExtractor'
import { getSuggestedFrames } from '../utils/frameSuggestions'
import { applyImageAsBackground } from '../utils/imageUtils'
import { fabric } from '../lib/fabric'

export default function BottomPanel() {
  const { theme, fitMode } = useUIStore()
  const {
    videoUrl, frames, setFrames, selectedFrame, setSelectedFrame,
    isExtracting, setIsExtracting, currentTime, setCurrentTime,
    duration, setDuration, fps, setFps, setVideoFile, clearFrames,
  } = useVideoStore()
  const { fabricCanvas } = useCanvasStore()
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [autoRan, setAutoRan] = useState(false)
  const [snapFlash, setSnapFlash] = useState(null)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    video.src = videoUrl
    video.onloadedmetadata = () => { setDuration(video.duration); setFps(30) }
    video.ontimeupdate = () => setCurrentTime(video.currentTime)
  }, [videoUrl])

  useEffect(() => {
    if (!videoUrl || autoRan || isExtracting) return
    setAutoRan(true)
    runSmartPick()
  }, [videoUrl])

  async function runSmartPick() {
    if (!videoUrl) return
    setIsExtracting(true)
    const suggested = await getSuggestedFrames(videoUrl, 20)
    setFrames(suggested)
    setIsExtracting(false)
    const best = suggested.find(f => f.isBest) || suggested[0]
    if (best && fabricCanvas) applyFrame(best, 0)
  }

  async function handleExtractAll() {
    if (!videoUrl) return
    setIsExtracting(true)
    const extracted = await extractFrames(videoUrl, 20)
    setFrames(extracted)
    setIsExtracting(false)
  }

  function applyFrame(frame, idx) {
    setSelectedFrame(frame)
    if (!fabricCanvas) return
    if (idx !== undefined) {
      setSnapFlash(idx)
      setTimeout(() => setSnapFlash(null), 500)
    }
    // Use the shared fitMode from store — respects user's Fit/Fill toggle
    applyImageAsBackground(fabricCanvas, frame.dataUrl, fitMode, () => {
      window.showToast?.('🖼 Frame applied to canvas', 'success', 1200)
    })
  }

  function snapAndAutoText(frame, idx) {
    applyFrame(frame, idx)
    // Wait for background to load then add bold text
    setTimeout(() => {
      if (!fabricCanvas) return
      // Remove previous auto-text
      fabricCanvas.getObjects().filter(o => o._autoText).forEach(o => fabricCanvas.remove(o))
      const cw = fabricCanvas.width
      const ch = fabricCanvas.height
      const text = new fabric.IText('YOUR TITLE HERE', {
        left: cw / 2, top: ch * 0.82,
        originX: 'center', originY: 'center',
        fontFamily: 'Impact',
        fontSize: Math.round(cw * 0.07),
        fill: '#ffff00',
        stroke: '#000000',
        strokeWidth: Math.round(cw * 0.004),
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 20, offsetX: 3, offsetY: 3 }),
        _autoText: true,
      })
      fabricCanvas.add(text)
      fabricCanvas.setActiveObject(text)
      text.enterEditing()
      text.selectAll()
      fabricCanvas.renderAll()
      window.showToast?.('✏️ Click the text to edit it', 'info', 2500)
    }, 400)
  }

  function captureCurrentFrame() {
    const video = videoRef.current
    if (!video || !fabricCanvas) return
    applyFrame({ time: video.currentTime, dataUrl: captureFrame(video) })
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) { video.play(); setPlaying(true) }
    else { video.pause(); setPlaying(false) }
  }

  function changePlaybackRate(rate) {
    const video = videoRef.current
    if (video) video.playbackRate = rate
    setPlaybackRate(rate)
  }

  function handleSeek(e) {
    const video = videoRef.current
    if (video) video.currentTime = +e.target.value
  }

  function handleStep(dir) {
    const video = videoRef.current
    if (!video) return
    video.pause(); setPlaying(false)
    stepFrame(video, fps, dir)
  }

  // ── Keyboard seeking + Space play/pause ──────────────────────
  useEffect(() => {
    if (!videoUrl) return
    const onKey = (e) => {
      const video = videoRef.current
      if (!video) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const obj = window.__fabricCanvas?.getActiveObject?.()
      if (obj && (obj.type === 'i-text' || obj.type === 'textbox') && obj.isEditing) return

      if (e.code === 'Space') {
        // Only handle Space for video if bottom panel is visible
        e.preventDefault()
        if (video.paused) { video.play(); setPlaying(true) }
        else { video.pause(); setPlaying(false) }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        video.currentTime = Math.min(video.duration, video.currentTime + (e.shiftKey ? 5 : 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        video.currentTime = Math.max(0, video.currentTime - (e.shiftKey ? 5 : 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [videoUrl])

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('video/')) {
      if (file.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 5000)
      setAutoRan(false); setVideoFile(file)
    }
  }

  function handleFileClick() {
    const i = document.createElement('input')
    i.type = 'file'; i.accept = 'video/*'
    i.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return
      if (file.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 5000)
      setAutoRan(false); setVideoFile(file)
    }
    i.click()
  }

  const fmt = (t) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`

  const btn = {
    padding: '4px 10px', borderRadius: 5, border: `1px solid ${theme.border}`,
    background: theme.bgTertiary, color: theme.text, fontSize: 11,
    cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
  }
  const hov = (e, on) => {
    e.currentTarget.style.borderColor = on ? theme.accent : theme.border
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
  }

  return (
    <div style={{
      background: theme.bgSecondary, borderTop: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }} className="ms-bottom-panel">

      {/* ── Controls row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
        borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
          🎬 Video
        </span>

        {/* Playback */}
        <button style={btn} onClick={() => handleStep(-1)} title="Step back"
          onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>⏮</button>
        <button style={{ ...btn, background: theme.accent, color: '#fff', border: 'none' }}
          onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
        <button style={btn} onClick={() => handleStep(1)} title="Step forward"
          onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>⏭</button>

        {/* Scrubber */}
        <input type="range" style={{ flex: 1, accentColor: theme.accent, minWidth: 80 }}
          min={0} max={duration || 100} step={0.01} value={currentTime} onChange={handleSeek} />
        <span style={{ fontSize: 10, color: theme.textMuted, minWidth: 72, textAlign: 'center' }}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>

        {/* Actions */}
        <button style={btn} onClick={captureCurrentFrame} disabled={!videoUrl} title="Capture this frame"
          onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>📸 Capture</button>
        <button style={{ ...btn, background: theme.accent, color: '#fff', border: 'none' }}
          onClick={handleExtractAll} disabled={!videoUrl || isExtracting}>
          {isExtracting ? '⏳' : '⚡ All Frames'}
        </button>
        <button style={{ ...btn, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', border: 'none' }}
          onClick={() => { setAutoRan(false); runSmartPick() }} disabled={!videoUrl || isExtracting}>
          {isExtracting ? '⏳' : '🧠 Smart Pick'}
        </button>
        {videoUrl && (
          <span style={{ fontSize: 9, color: theme.textMuted, flexShrink: 0 }}>
            Space play/pause · ← → seek · Shift+← → ±5s
          </span>
        )}

        {/* Playback speed */}
        {videoUrl && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {[0.25, 0.5, 1, 2].map(rate => (
              <button key={rate}
                style={{
                  ...btn,
                  padding: '3px 7px', fontSize: 10,
                  background: playbackRate === rate ? theme.accent : theme.bgTertiary,
                  color: playbackRate === rate ? '#fff' : theme.textSecondary,
                  border: `1px solid ${playbackRate === rate ? theme.accent : theme.border}`,
                }}
                onClick={() => changePlaybackRate(rate)}
                title={`${rate}x speed`}
              >{rate}x</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body: video preview + frames ── */}
      <div style={{ display: 'flex', height: 160 }}>

        {/* Video preview or dropzone */}
        {videoUrl ? (
          <div style={{ width: 220, flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} muted playsInline />
          </div>
        ) : (
          <div style={{
            width: 220, flexShrink: 0, border: `2px dashed ${theme.border}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', gap: 5,
            transition: 'border-color 0.15s, background 0.15s',
          }}
            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
            onClick={handleFileClick}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 28 }}>🎬</span>
            <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>Drop video here</span>
            <span style={{ fontSize: 10, color: theme.textMuted }}>or click to browse</span>
          </div>
        )}

        {/* Frames strip */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Frames header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px',
            borderBottom: `1px solid ${theme.border}`, flexShrink: 0,
          }}>
            {isExtracting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.accent }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, animation: 'pulse 1s infinite' }} />
                Analyzing frames...
              </div>
            ) : frames.length > 0 ? (
              <>
                <span style={{ fontSize: 10, color: theme.textMuted }}>
                  {frames.filter(f => f.isBest).length} recommended · {frames.length} total
                </span>
                <span style={{ fontSize: 10, color: theme.accent, fontWeight: 600 }}>
                  👆 Click any frame to use it
                </span>
                <button
                  onClick={() => { clearFrames(); window.showToast?.('🗑 Gallery cleared', 'info', 1500) }}
                  style={{
                    marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, border: `1px solid ${theme.border}`,
                    background: 'transparent', color: theme.textMuted, fontSize: 9, cursor: 'pointer',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.danger; e.currentTarget.style.color = theme.danger }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
                  title="Clear all frames from memory"
                >🗑 Clear</button>
              </>
            ) : (
              <span style={{ fontSize: 10, color: theme.textMuted }}>
                {videoUrl ? 'Processing...' : 'Upload a video to extract frames'}
              </span>
            )}
          </div>

          {/* ALL frames — scrollable, bigger thumbnails */}
          <div style={{
            flex: 1, display: 'flex', gap: 6, padding: '6px 10px',
            overflowX: 'auto', alignItems: 'center',
          }}>
            {frames.map((f, i) => (
              <div key={i} style={{
                position: 'relative', flexShrink: 0,
                transition: 'transform 0.15s',
                transform: snapFlash === i ? 'scale(0.92)' : 'scale(1)',
              }}>
                {/* Snap flash overlay */}
                {snapFlash === i && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 5, borderRadius: 6,
                    background: 'rgba(124,58,237,0.55)',
                    animation: 'scaleIn 0.15s ease',
                    pointerEvents: 'none',
                  }} />
                )}
                <img
                  src={f.dataUrl}
                  alt={fmt(f.time)}
                  style={{
                    height: 108,
                    aspectRatio: `${f.width || 16} / ${f.height || 9}`,
                    objectFit: 'cover',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'block',
                    border: `2px solid ${selectedFrame?.time === f.time ? theme.accent : f.isBest ? '#facc15' : theme.border}`,
                    boxShadow: selectedFrame?.time === f.time ? `0 0 0 2px ${theme.accentGlow}, 0 0 12px rgba(124,58,237,0.4)` : 'none',
                    transition: 'border-color 0.15s, transform 0.12s',
                  }}
                  onClick={() => applyFrame(f, i)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.04)'
                    e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.4)`
                    const btn = e.currentTarget.parentElement?.querySelector('.ms-snap-text-btn')
                    if (btn) btn.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = selectedFrame?.time === f.time ? `0 0 0 2px ${theme.accentGlow}` : 'none'
                    const btn = e.currentTarget.parentElement?.querySelector('.ms-snap-text-btn')
                    if (btn) btn.style.opacity = '0'
                  }}
                  title={`${fmt(f.time)}${f.isBest ? ' — Recommended' : ''}`}
                />
                {f.isBest && (
                  <div style={{
                    position: 'absolute', top: 4, left: 4,
                    background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                    color: '#fff', fontSize: 8, fontWeight: 700,
                    padding: '1px 5px', borderRadius: 3,
                  }}>⭐ BEST</div>
                )}
                <div style={{
                  position: 'absolute', bottom: 4, right: 4,
                  background: 'rgba(0,0,0,0.7)', color: '#fff',
                  fontSize: 9, padding: '1px 4px', borderRadius: 3,
                }}>{fmt(f.time)}</div>
                {/* Snap + Auto-Text button — shows on hover */}
                <div style={{
                  position: 'absolute', bottom: 4, left: 4,
                  opacity: 0, transition: 'opacity 0.15s',
                }} className="ms-snap-text-btn">
                  <button
                    style={{
                      padding: '2px 6px', borderRadius: 4, border: 'none',
                      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                      color: '#fff', fontSize: 8, fontWeight: 700, cursor: 'pointer',
                    }}
                    onClick={(e) => { e.stopPropagation(); snapAndAutoText(f, i) }}
                    title="Snap frame + add text box"
                  >+Text</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
