import React, { useRef, useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { extractFrames, captureFrame, stepFrame } from '../utils/frameExtractor'
import { getSuggestedFrames } from '../utils/frameSuggestions'
import { fabric } from '../lib/fabric'

export default function BottomPanel() {
  const { theme } = useUIStore()
  const { videoUrl, frames, setFrames, selectedFrame, setSelectedFrame, isExtracting, setIsExtracting,
    currentTime, setCurrentTime, duration, setDuration, fps, setFps, setVideoFile } = useVideoStore()
  const { fabricCanvas } = useCanvasStore()
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState('all') // all | best

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    video.src = videoUrl
    video.onloadedmetadata = () => { setDuration(video.duration); setFps(30) }
    video.ontimeupdate = () => setCurrentTime(video.currentTime)
  }, [videoUrl])

  async function handleExtract() {
    if (!videoUrl) return
    setIsExtracting(true)
    const extracted = await extractFrames(videoUrl, 12)
    setFrames(extracted)
    setIsExtracting(false)
  }

  async function handleSmartExtract() {
    if (!videoUrl) return
    setIsExtracting(true)
    const suggested = await getSuggestedFrames(videoUrl, 20)
    setFrames(suggested)
    setMode('best')
    setIsExtracting(false)
  }

  function handleFrameClick(frame) {
    setSelectedFrame(frame)
    if (!fabricCanvas) return
    fabric.Image.fromURL(frame.dataUrl, (img) => {
      img.scaleToWidth(fabricCanvas.width)
      img.scaleToHeight(fabricCanvas.height)
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
    })
  }

  function captureCurrentFrame() {
    const video = videoRef.current
    if (!video || !fabricCanvas) return
    const dataUrl = captureFrame(video)
    const frame = { time: video.currentTime, dataUrl }
    setSelectedFrame(frame)
    fabric.Image.fromURL(dataUrl, (img) => {
      img.scaleToWidth(fabricCanvas.width)
      img.scaleToHeight(fabricCanvas.height)
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
    })
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) { video.play(); setPlaying(true) }
    else { video.pause(); setPlaying(false) }
  }

  function handleSeek(e) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = +e.target.value
  }

  function handleStep(dir) {
    const video = videoRef.current
    if (!video) return
    video.pause(); setPlaying(false)
    stepFrame(video, fps, dir)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('video/')) setVideoFile(file)
  }

  const fmt = (t) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const displayFrames = mode === 'best' ? frames.filter((f) => f.isBest) : frames

  const s = {
    panel: { background: theme.bgSecondary, borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 },
    header: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: `1px solid ${theme.border}` },
    title: { fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
    controls: { display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', flexWrap: 'wrap' },
    ctrlBtn: { padding: '4px 10px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.text, fontSize: 12, cursor: 'pointer' },
    playBtn: { padding: '5px 14px', borderRadius: 5, border: 'none', background: theme.accent, color: '#fff', fontSize: 13, cursor: 'pointer' },
    time: { fontSize: 11, color: theme.textMuted, minWidth: 80, textAlign: 'center' },
    scrubber: { flex: 1, accentColor: theme.accent, minWidth: 80 },
    body: { display: 'flex', gap: 0, height: 120 },
    videoWrap: { width: 180, flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    video: { width: '100%', height: '100%', objectFit: 'contain' },
    dropzone: {
      width: 180, flexShrink: 0, border: `2px dashed ${theme.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', fontSize: 11, color: theme.textMuted, gap: 4,
    },
    framesWrap: { flex: 1, display: 'flex', gap: 4, padding: '6px 8px', overflowX: 'auto', alignItems: 'center' },
    frameWrap: { position: 'relative', flexShrink: 0 },
    thumb: (active, isBest) => ({
      height: 90, aspectRatio: '16/9', objectFit: 'cover', borderRadius: 5, cursor: 'pointer',
      border: `2px solid ${active ? theme.accent : isBest ? '#facc15' : 'transparent'}`,
      transition: 'border-color 0.15s, transform 0.1s',
      display: 'block',
    }),
    bestBadge: {
      position: 'absolute', top: 3, left: 3, background: '#facc15', color: '#000',
      fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3,
    },
    scoreBadge: {
      position: 'absolute', bottom: 3, right: 3, background: 'rgba(0,0,0,0.7)', color: '#fff',
      fontSize: 8, padding: '1px 4px', borderRadius: 3,
    },
    modeRow: { display: 'flex', gap: 4, alignItems: 'center' },
    modeBtn: (active) => ({
      padding: '3px 8px', borderRadius: 4, border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentGlow : 'transparent', color: active ? theme.accent : theme.textMuted,
      fontSize: 10, cursor: 'pointer',
    }),
    extractBtn: { padding: '5px 10px', borderRadius: 5, border: 'none', background: theme.accent, color: '#fff', fontSize: 11, cursor: 'pointer', flexShrink: 0 },
    smartBtn: { padding: '5px 10px', borderRadius: 5, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', fontSize: 11, cursor: 'pointer', flexShrink: 0 },
    captureBtn: { padding: '5px 10px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.text, fontSize: 11, cursor: 'pointer', flexShrink: 0 },
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.title}>🎬 Timeline</span>
        <div style={s.controls}>
          <button style={s.ctrlBtn} onClick={() => handleStep(-1)}>⏮ ‹</button>
          <button style={s.playBtn} onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
          <button style={s.ctrlBtn} onClick={() => handleStep(1)}>› ⏭</button>
          <input type="range" style={s.scrubber} min={0} max={duration || 100} step={0.01} value={currentTime} onChange={handleSeek} />
          <span style={s.time}>{fmt(currentTime)} / {fmt(duration)}</span>
          <button style={s.captureBtn} onClick={captureCurrentFrame} disabled={!videoUrl}>📸 Capture</button>
          <button style={s.extractBtn} onClick={handleExtract} disabled={!videoUrl || isExtracting}>
            {isExtracting ? '⏳' : '⚡ Frames'}
          </button>
          <button style={s.smartBtn} onClick={handleSmartExtract} disabled={!videoUrl || isExtracting} title="AI-powered best frame detection">
            {isExtracting ? '⏳' : '🧠 Smart Pick'}
          </button>
        </div>
      </div>

      <div style={s.body}>
        {videoUrl ? (
          <div style={s.videoWrap}>
            <video ref={videoRef} style={s.video} muted playsInline />
          </div>
        ) : (
          <div style={s.dropzone}
            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
            onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'video/*'; i.onchange = (e) => setVideoFile(e.target.files[0]); i.click() }}
          >
            <span style={{ fontSize: 22 }}>🎬</span>
            <span>Drop video here</span>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {frames.length > 0 && (
            <div style={{ display: 'flex', gap: 6, padding: '4px 8px 0', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: theme.textMuted }}>{frames.length} frames</span>
              <div style={s.modeRow}>
                <button style={s.modeBtn(mode === 'all')} onClick={() => setMode('all')}>All</button>
                <button style={s.modeBtn(mode === 'best')} onClick={() => setMode('best')}>⭐ Best</button>
              </div>
            </div>
          )}
          <div style={s.framesWrap}>
            {frames.length === 0 && (
              <span style={{ fontSize: 11, color: theme.textMuted }}>
                {videoUrl ? 'Click "⚡ Frames" or "🧠 Smart Pick"' : 'Upload a video to get started'}
              </span>
            )}
            {displayFrames.map((f, i) => (
              <div key={i} style={s.frameWrap}>
                <img src={f.dataUrl} alt={`${f.time}s`}
                  style={s.thumb(selectedFrame?.time === f.time, f.isBest)}
                  onClick={() => handleFrameClick(f)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                />
                {f.isBest && <div style={s.bestBadge}>⭐ BEST</div>}
                {f.score !== undefined && <div style={s.scoreBadge}>{Math.round(f.score)}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
