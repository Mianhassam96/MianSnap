import React, { useRef, useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'
import useCanvasStore from '../store/useCanvasStore'
import { extractFrames, captureFrame, stepFrame } from '../utils/frameExtractor'
import { getSuggestedFrames } from '../utils/frameSuggestions'
import { fabric } from '../lib/fabric'
import { applyImageAsBackground } from '../utils/imageUtils'

export default function BottomPanel() {
  const { theme } = useUIStore()
  const {
    videoUrl, frames, setFrames, selectedFrame, setSelectedFrame,
    isExtracting, setIsExtracting, currentTime, setCurrentTime,
    duration, setDuration, fps, setFps, setVideoFile,
  } = useVideoStore()
  const { fabricCanvas } = useCanvasStore()
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [mode, setMode] = useState('best') // best | all
  const [autoRan, setAutoRan] = useState(false)

  // Wire video element when URL changes
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    video.src = videoUrl
    video.onloadedmetadata = () => { setDuration(video.duration); setFps(30) }
    video.ontimeupdate = () => setCurrentTime(video.currentTime)
  }, [videoUrl])

  // AUTO-RUN Smart Pick when video is first uploaded
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
    setMode('best')
    setIsExtracting(false)
    // Auto-select the top frame
    const best = suggested.find((f) => f.isBest) || suggested[0]
    if (best && fabricCanvas) applyFrame(best)
  }

  async function handleExtract() {
    if (!videoUrl) return
    setIsExtracting(true)
    const extracted = await extractFrames(videoUrl, 12)
    setFrames(extracted)
    setMode('all')
    setIsExtracting(false)
  }

  function applyFrame(frame) {
    setSelectedFrame(frame)
    if (!fabricCanvas) return
    applyImageAsBackground(fabricCanvas, frame.dataUrl, 'cover')
  }

  function captureCurrentFrame() {
    const video = videoRef.current
    if (!video || !fabricCanvas) return
    const dataUrl = captureFrame(video)
    applyFrame({ time: video.currentTime, dataUrl })
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
    if (file?.type.startsWith('video/')) { setAutoRan(false); setVideoFile(file) }
  }

  function handleFileClick() {
    const i = document.createElement('input')
    i.type = 'file'; i.accept = 'video/*'
    i.onchange = (e) => { setAutoRan(false); setVideoFile(e.target.files[0]) }
    i.click()
  }

  const fmt = (t) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const bestFrames = frames.filter((f) => f.isBest)
  const displayFrames = mode === 'best' ? bestFrames : frames

  const s = {
    panel: {
      background: theme.bgSecondary, borderTop: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    },
    header: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
      borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap',
    },
    title: { fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 },
    controls: { display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center', flexWrap: 'wrap' },
    ctrlBtn: {
      padding: '4px 9px', borderRadius: 5, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text, fontSize: 12, cursor: 'pointer',
      transition: 'all 0.15s',
    },
    playBtn: {
      padding: '5px 14px', borderRadius: 5, border: 'none',
      background: theme.accent, color: '#fff', fontSize: 13, cursor: 'pointer',
    },
    time: { fontSize: 11, color: theme.textMuted, minWidth: 76, textAlign: 'center' },
    scrubber: { flex: 1, accentColor: theme.accent, minWidth: 80 },
    body: { display: 'flex', height: 120 },
    videoWrap: {
      width: 175, flexShrink: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    video: { width: '100%', height: '100%', objectFit: 'contain' },
    dropzone: {
      width: 175, flexShrink: 0, border: `2px dashed ${theme.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', gap: 4,
      transition: 'border-color 0.15s, background 0.15s',
    },
    framesCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    framesHeader: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px',
      borderBottom: `1px solid ${theme.border}`, flexShrink: 0,
    },
    modeBtn: (active) => ({
      padding: '2px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer',
      border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentGlow : 'transparent',
      color: active ? theme.accent : theme.textMuted,
      fontWeight: active ? 600 : 400, transition: 'all 0.15s',
    }),
    framesWrap: { flex: 1, display: 'flex', gap: 4, padding: '5px 8px', overflowX: 'auto', alignItems: 'center' },
    frameWrap: { position: 'relative', flexShrink: 0 },
    thumb: (active, isBest) => ({
      height: 86, aspectRatio: '16/9', objectFit: 'cover', borderRadius: 5,
      cursor: 'pointer', display: 'block',
      border: `2px solid ${active ? theme.accent : isBest ? '#facc15' : theme.border}`,
      transition: 'border-color 0.15s, transform 0.12s, box-shadow 0.15s',
      boxShadow: active ? `0 0 0 2px ${theme.accentGlow}` : 'none',
    }),
    bestBadge: {
      position: 'absolute', top: 3, left: 3,
      background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
      color: '#fff', fontSize: 8, fontWeight: 700,
      padding: '1px 5px', borderRadius: 3, letterSpacing: 0.3,
    },
    scoreBadge: {
      position: 'absolute', bottom: 3, right: 3,
      background: 'rgba(0,0,0,0.75)', color: '#fff',
      fontSize: 8, padding: '1px 4px', borderRadius: 3,
    },
    extractBtn: {
      padding: '4px 9px', borderRadius: 5, border: 'none',
      background: theme.accent, color: '#fff', fontSize: 11,
      cursor: 'pointer', flexShrink: 0,
    },
    smartBtn: {
      padding: '4px 9px', borderRadius: 5, border: 'none',
      background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
      color: '#fff', fontSize: 11, cursor: 'pointer', flexShrink: 0,
    },
    captureBtn: {
      padding: '4px 9px', borderRadius: 5, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text, fontSize: 11,
      cursor: 'pointer', flexShrink: 0,
    },
    extractingBar: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
      fontSize: 11, color: theme.accent,
    },
    dot: {
      width: 6, height: 6, borderRadius: '50%', background: theme.accent,
      animation: 'pulse 1s infinite',
    },
  }

  return (
    <div style={s.panel}>
      {/* Controls row */}
      <div style={s.header}>
        <span style={s.title}>🎬 Timeline</span>
        <div style={s.controls}>
          <button style={s.ctrlBtn} onClick={() => handleStep(-1)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border }}
          >⏮</button>
          <button style={s.playBtn} onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
          <button style={s.ctrlBtn} onClick={() => handleStep(1)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border }}
          >⏭</button>
          <input type="range" style={s.scrubber} min={0} max={duration || 100} step={0.01} value={currentTime} onChange={handleSeek} />
          <span style={s.time}>{fmt(currentTime)} / {fmt(duration)}</span>
          <button style={s.captureBtn} onClick={captureCurrentFrame} disabled={!videoUrl}
            title="Capture current frame"
          >📸 Capture</button>
          <button style={s.extractBtn} onClick={handleExtract} disabled={!videoUrl || isExtracting}
            title="Extract all frames evenly"
          >{isExtracting ? '⏳' : '⚡ All Frames'}</button>
          <button style={s.smartBtn} onClick={() => { setAutoRan(false); runSmartPick() }} disabled={!videoUrl || isExtracting}
            title="AI picks the best frames automatically"
          >{isExtracting ? '⏳' : '🧠 Smart Pick'}</button>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        {/* Video / Dropzone */}
        {videoUrl ? (
          <div style={s.videoWrap}>
            <video ref={videoRef} style={s.video} muted playsInline />
          </div>
        ) : (
          <div style={s.dropzone}
            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
            onClick={handleFileClick}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 24 }}>🎬</span>
            <span style={{ fontSize: 11, color: theme.textMuted }}>Drop video here</span>
            <span style={{ fontSize: 10, color: theme.textMuted }}>or click to browse</span>
          </div>
        )}

        {/* Frames area */}
        <div style={s.framesCol}>
          {/* Frames sub-header */}
          <div style={s.framesHeader}>
            {isExtracting ? (
              <div style={s.extractingBar}>
                <div style={s.dot} />
                <span>Analyzing frames — finding best moments...</span>
              </div>
            ) : frames.length > 0 ? (
              <>
                <span style={{ fontSize: 10, color: theme.textMuted, flexShrink: 0 }}>
                  {bestFrames.length} recommended · {frames.length} total
                </span>
                <span style={{ fontSize: 10, color: theme.accent, fontWeight: 600, flexShrink: 0 }}>
                  👆 Click a frame to use it
                </span>
                <button style={s.modeBtn(mode === 'best')} onClick={() => setMode('best')}>
                  ⭐ Best
                </button>
                <button style={s.modeBtn(mode === 'all')} onClick={() => setMode('all')}>
                  All
                </button>
              </>
            ) : (
              <span style={{ fontSize: 10, color: theme.textMuted }}>
                {videoUrl ? 'Smart Pick running...' : 'Upload a video to get started'}
              </span>
            )}
          </div>

          {/* Frame strip */}
          <div style={s.framesWrap}>
            {displayFrames.map((f, i) => (
              <div key={i} style={s.frameWrap}>
                <img
                  src={f.dataUrl}
                  alt={`${f.time}s`}
                  style={{
                    ...s.thumb(selectedFrame?.time === f.time, f.isBest),
                    animation: f.isBest && selectedFrame?.time !== f.time ? 'bestPulse 2s ease-in-out infinite' : 'none',
                  }}
                  onClick={() => applyFrame(f)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.animation = 'none' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; if (f.isBest && selectedFrame?.time !== f.time) e.currentTarget.style.animation = 'bestPulse 2s ease-in-out infinite' }}
                  title={`${fmt(f.time)}${f.isBest ? ' — Recommended' : ''}`}
                />
                {f.isBest && <div style={s.bestBadge}>⭐ BEST</div>}
                {f.score !== undefined && <div style={s.scoreBadge}>{Math.round(f.score)}</div>}
              </div>
            ))}
          </div>
          <style>{`
            @keyframes bestPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(250,204,21,0); border-color: #facc15; }
              50% { box-shadow: 0 0 0 4px rgba(250,204,21,0.3); border-color: #f59e0b; }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}
