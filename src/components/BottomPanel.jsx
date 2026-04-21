import { useRef, useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { extractFrames, captureFrame, stepFrame } from '../utils/frameExtractor'
import { getSuggestedFrames } from '../utils/frameSuggestions'
import { applyImageAsBackground, isCanvasReady } from '../utils/imageUtils'
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
  const isMountedRef = useRef(true)
  const [playing, setPlaying] = useState(false)
  const [autoRan, setAutoRan] = useState(false)
  const [snapFlash, setSnapFlash] = useState(null)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showAiReason, setShowAiReason] = useState(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

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
    try {
      const suggested = await getSuggestedFrames(videoUrl, 20)
      if (!isMountedRef.current) return
      setFrames(suggested)
      setIsExtracting(false)

      const best = suggested.find(f => f.isBest) || suggested[0]
      const bestIdx = suggested.findIndex(f => f.isBest)

      // Apply best frame — small delay so setFrames renders first
      if (best) {
        setTimeout(() => {
          if (!isMountedRef.current) return
          applyFrame(best, bestIdx >= 0 ? bestIdx : 0)
          if (bestIdx >= 0) {
            setTimeout(() => { if (isMountedRef.current) setSnapFlash(null) }, 1700)
          }
          setTimeout(() => { if (isMountedRef.current) setShowAiReason(true) }, 400)
          setTimeout(() => { if (isMountedRef.current) setShowAiReason(false) }, 5600)
        }, 100)
      }
    } catch (err) {
      if (!isMountedRef.current) return
      setIsExtracting(false)
      window.showToast?.('⚠️ Frame extraction failed — try again', 'error', 3000)
    }
  }

  async function handleExtractAll() {
    if (!videoUrl) return
    setIsExtracting(true)
    try {
      const extracted = await extractFrames(videoUrl, 20)
      if (!isMountedRef.current) return
      setFrames(extracted)
    } catch (_) {}
    if (isMountedRef.current) setIsExtracting(false)
  }

  function applyFrame(frame, idx) {
    // State gate — don't attempt if canvas or Fabric not ready
    if (!isCanvasReady(fabricCanvas)) {
      window.showToast?.('⏳ Canvas loading — try again in a moment', 'info', 2000)
      return
    }
    if (idx !== undefined) {
      setSnapFlash(idx)
      setTimeout(() => setSnapFlash(null), 1200)
    }
    // Apply directly — also update store so other components know which frame is active
    applyImageAsBackground(fabricCanvas, frame.dataUrl, fitMode, () => {
      // Mark as selected AFTER apply so CanvasEditor's useEffect skips it (already applied)
      setSelectedFrame(frame)
      window.showToast?.('🖼 Frame applied', 'success', 1500)
      window.dispatchEvent(new CustomEvent('miansnap:frameApplied', { detail: { frame, fitMode } }))
    })
  }

  function snapAndAutoText(frame, idx) {
    applyFrame(frame, idx)
    setTimeout(() => {
      if (!fabricCanvas) return
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
    if (!video) return
    if (!isCanvasReady(fabricCanvas)) {
      window.showToast?.('⏳ Canvas loading — try again', 'info', 2000)
      return
    }
    const captured = {
      time: video.currentTime,
      dataUrl: captureFrame(video),
      width: video.videoWidth || 1280,
      height: video.videoHeight || 720,
    }
    // Apply directly with visual feedback
    applyImageAsBackground(fabricCanvas, captured.dataUrl, fitMode, () => {
      setSelectedFrame(captured)
      window.showToast?.(`📸 Frame captured at ${fmt(video.currentTime)}`, 'success', 2000)
      window.dispatchEvent(new CustomEvent('miansnap:frameApplied', { detail: { frame: captured, fitMode } }))
    })
    // Flash all frames briefly to indicate capture happened
    setSnapFlash(-1)
    setTimeout(() => setSnapFlash(null), 800)
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
    if (file?.type && file.type.startsWith('video/')) {
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

  // Best frame for AI reason display
  const bestFrame = frames.find(f => f.isBest)

  return (
    <div style={{
      background: theme.bgSecondary, borderTop: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }} className="ms-bottom-panel">

      {/* ── AI Trust Banner — shows after Smart Pick ── */}
      {showAiReason && bestFrame && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 14px',
          background: 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.06))',
          borderBottom: `1px solid rgba(124,58,237,0.2)`,
          animation: 'fadeInDown 0.3s ease',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13 }}>🧠</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: theme.accent }}>AI selected this frame because:</span>
          <span style={{ fontSize: 10, color: theme.textSecondary, display: 'flex', gap: 8 }}>
            <span>✔ Face detected</span>
            <span>✔ High motion</span>
            <span>✔ Good lighting</span>
          </span>
          <button onClick={() => setShowAiReason(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 11 }}>✕</button>
        </div>
      )}

      {/* ── Controls row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
        borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
          🎬 Video
        </span>
        <button style={btn} onClick={() => handleStep(-1)} title="Step back"
          onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>⏮</button>
        <button style={{ ...btn, background: theme.accent, color: '#fff', border: 'none' }}
          onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
        <button style={btn} onClick={() => handleStep(1)} title="Step forward"
          onMouseEnter={(e) => hov(e, true)} onMouseLeave={(e) => hov(e, false)}>⏭</button>
        <input type="range" style={{ flex: 1, accentColor: theme.accent, minWidth: 80 }}
          min={0} max={duration || 100} step={0.01} value={currentTime} onChange={handleSeek} />
        <span style={{ fontSize: 10, color: theme.textMuted, minWidth: 72, textAlign: 'center' }}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>
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
        {videoUrl && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {[0.25, 0.5, 1, 2].map(rate => (
              <button key={rate}
                style={{
                  ...btn, padding: '3px 7px', fontSize: 10,
                  background: playbackRate === rate ? theme.accent : theme.bgTertiary,
                  color: playbackRate === rate ? '#fff' : theme.textSecondary,
                  border: `1px solid ${playbackRate === rate ? theme.accent : theme.border}`,
                }}
                onClick={() => changePlaybackRate(rate)}
              >{rate}x</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Body: video preview + frames ── */}
      <div style={{ display: 'flex', height: 200 }}>

        {/* Video preview or dropzone */}
        {videoUrl ? (
          <div style={{ width: 240, flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} muted playsInline />
            {/* Selected frame big preview overlay label */}
            {selectedFrame && (
              <div style={{
                position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center',
                fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600,
                background: 'rgba(0,0,0,0.5)', padding: '2px 0',
              }}>
                ⭐ Best moment selected — click frame to change
              </div>
            )}
          </div>
        ) : (
          <div style={{
            width: 240, flexShrink: 0, border: `2px dashed ${theme.border}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', gap: 5,
            transition: 'border-color 0.15s, background 0.15s',
          }}
            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
            onClick={handleFileClick}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 32 }}>🎬</span>
            <span style={{ fontSize: 13, color: theme.text, fontWeight: 800 }}>📥 DROP VIDEO TO START</span>
            <span style={{ fontSize: 10, color: theme.textMuted }}>or click to browse</span>
          </div>
        )}

        {/* Frames strip */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Frames header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
            borderBottom: `1px solid ${theme.border}`, flexShrink: 0,
            background: frames.length > 0 ? (theme.isDark ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.04)') : 'transparent',
          }}>
            {isExtracting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: theme.accent }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent, animation: 'pulse 1s infinite' }} />
                <span style={{ fontWeight: 600 }}>⚡ Creating your thumbnail...</span>
              </div>
            ) : frames.length > 0 ? (
              <>
                <span style={{ fontSize: 11, fontWeight: 700, color: theme.accent }}>
                  ⭐ Best moment selected — click any frame to change
                </span>
                <span style={{ fontSize: 10, color: theme.textMuted }}>
                  {frames.filter(f => f.isBest).length} recommended · {frames.length} total
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
                >🗑 Clear</button>
              </>
            ) : (
              <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 600 }}>
                {videoUrl ? '⚡ Creating your thumbnail...' : '📥 Upload a video — AI picks the best frame automatically'}
              </span>
            )}
          </div>

          {/* Frames — bigger thumbnails, 2× height */}
          <div style={{
            flex: 1, display: 'flex', gap: 8, padding: '8px 12px',
            overflowX: 'auto', alignItems: 'center',
          }}>
            {frames.map((f, i) => (
              <div key={i} style={{
                position: 'relative', flexShrink: 0,
                transition: 'transform 0.15s',
                transform: snapFlash === i ? 'scale(0.92)' : 'scale(1)',
              }}>
                {snapFlash === i && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 5, borderRadius: 8,
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
                    height: 140,
                    aspectRatio: `${f.width || 16} / ${f.height || 9}`,
                    objectFit: 'cover',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'block',
                    border: `3px solid ${selectedFrame?.time === f.time ? theme.accent : f.isBest ? '#facc15' : theme.border}`,
                    boxShadow: selectedFrame?.time === f.time
                      ? `0 0 0 3px ${theme.accentGlow}, 0 0 20px rgba(124,58,237,0.5)`
                      : f.isBest ? '0 0 12px rgba(250,204,21,0.4)' : 'none',
                    transition: 'border-color 0.15s, transform 0.12s, box-shadow 0.15s',
                  }}
                  onClick={() => applyFrame(f, i)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.5)`
                    const btn = e.currentTarget.parentElement?.querySelector('.ms-snap-text-btn')
                    if (btn) btn.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)'
                    e.currentTarget.style.boxShadow = selectedFrame?.time === f.time ? `0 0 0 3px ${theme.accentGlow}` : 'none'
                    const btn = e.currentTarget.parentElement?.querySelector('.ms-snap-text-btn')
                    if (btn) btn.style.opacity = '0'
                  }}
                  title={`${fmt(f.time)}${f.isBest ? ' — AI recommended' : ''}`}
                />
                {f.isBest && (
                  <div style={{
                    position: 'absolute', top: 5, left: 5,
                    background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                    color: '#fff', fontSize: 9, fontWeight: 800,
                    padding: '2px 7px', borderRadius: 4,
                    boxShadow: '0 2px 8px rgba(245,158,11,0.5)',
                  }}>⭐ BEST</div>
                )}
                {selectedFrame?.time === f.time && (
                  <div style={{
                    position: 'absolute', top: 5, right: 5,
                    background: theme.accent,
                    color: '#fff', fontSize: 9, fontWeight: 800,
                    padding: '2px 7px', borderRadius: 4,
                  }}>✓ USING</div>
                )}
                <div style={{
                  position: 'absolute', bottom: 5, right: 5,
                  background: 'rgba(0,0,0,0.75)', color: '#fff',
                  fontSize: 9, padding: '2px 5px', borderRadius: 3,
                }}>{fmt(f.time)}</div>
                <div style={{
                  position: 'absolute', bottom: 5, left: 5,
                  opacity: 0, transition: 'opacity 0.15s',
                }} className="ms-snap-text-btn">
                  <button
                    style={{
                      padding: '3px 8px', borderRadius: 5, border: 'none',
                      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                      color: '#fff', fontSize: 9, fontWeight: 700, cursor: 'pointer',
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
