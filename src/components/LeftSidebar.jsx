import React, { useState, useRef, useEffect } from 'react'
import { fabric } from '../lib/fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import { faceAutoFocus, amplifyEmotion, resetFilters } from '../utils/faceDetect'
import { prefs } from '../utils/prefs'
import { getSmartTextPosition } from '../utils/smartPlacement'
import { generateTitles, detectStyle, rewriteViral } from '../utils/titleGenerator'
import { extractFrames, captureFrame, stepFrame } from '../utils/frameExtractor'
import { getSuggestedFrames } from '../utils/frameSuggestions'
import { applyImageAsBackground } from '../utils/imageUtils'
import CreatorPacks from './CreatorPacks'
import SafeZoneOverlay from './SafeZoneOverlay'
import AssetManager from './AssetManager'
import OneClickStyles from './OneClickStyles'
import ABGenerator from './ABGenerator'
import MakeItViral from './MakeItViral'
import SmartTextSuggestions from './SmartTextSuggestions'
import BackgroundPanel from './BackgroundPanel'
import QuickMode from './QuickMode'
import ShapesPanel from './ShapesPanel'
import FiltersPanel from './FiltersPanel'
import ColorSystem from './ColorSystem'

const TOOLS = [
  { id: 'video',   icon: '🎬',  label: 'Video' },
  { id: 'text',    icon: '𝐓',  label: 'Text' },
  { id: 'shapes',  icon: '◻',  label: 'Shapes' },
  { id: 'filters', icon: '✨',  label: 'Filters' },
  { id: 'bg',      icon: '🖼',  label: 'BG' },
  { id: 'styles',  icon: '⚡',  label: 'Styles' },
  { id: 'assets',  icon: '📁',  label: 'Assets' },
]

const FONT_CATEGORIES = [
  {
    label: '🔥 Impact / Bold',
    fonts: [
      { name: 'Bebas Neue', preview: 'BEBAS NEUE' },
      { name: 'Anton', preview: 'ANTON' },
      { name: 'Black Han Sans', preview: 'BLACK HAN' },
      { name: 'Bangers', preview: 'Bangers!' },
      { name: 'Teko', preview: 'TEKO BOLD' },
      { name: 'Oswald', preview: 'OSWALD' },
      { name: 'Barlow Condensed', preview: 'BARLOW' },
      { name: 'Russo One', preview: 'RUSSO ONE' },
    ],
  },
  {
    label: '✨ Display / Creative',
    fonts: [
      { name: 'Righteous', preview: 'Righteous' },
      { name: 'Permanent Marker', preview: 'Marker Style' },
      { name: 'Pacifico', preview: 'Pacifico' },
      { name: 'Fredoka One', preview: 'Fredoka One' },
      { name: 'Boogaloo', preview: 'Boogaloo' },
      { name: 'Abril Fatface', preview: 'Abril Fatface' },
    ],
  },
  {
    label: '💎 Premium / Elegant',
    fonts: [
      { name: 'Playfair Display', preview: 'Playfair Display' },
      { name: 'Cinzel', preview: 'CINZEL' },
      { name: 'Merriweather', preview: 'Merriweather' },
      { name: 'Raleway', preview: 'Raleway' },
      { name: 'Montserrat', preview: 'Montserrat' },
    ],
  },
  {
    label: '⚡ Modern / Clean',
    fonts: [
      { name: 'Poppins', preview: 'Poppins' },
      { name: 'Nunito', preview: 'Nunito' },
      { name: 'Exo 2', preview: 'Exo 2' },
      { name: 'Lato', preview: 'Lato' },
      { name: 'Roboto Condensed', preview: 'Roboto Condensed' },
      { name: 'Source Sans 3', preview: 'Source Sans' },
    ],
  },
  {
    label: '🌙 Arabic & Urdu',
    fonts: [
      { name: 'Noto Nastaliq Urdu', preview: 'نستعلیق اردو' },
      { name: 'Noto Naskh Arabic', preview: 'نسخ عربي' },
      { name: 'Noto Kufi Arabic', preview: 'كوفي عربي' },
      { name: 'Amiri', preview: 'أميري كلاسيك' },
      { name: 'Scheherazade New', preview: 'شهرزاد' },
      { name: 'Lateef', preview: 'لطيف اردو' },
      { name: 'Reem Kufi', preview: 'ريم كوفي' },
      { name: 'Cairo', preview: 'القاهرة' },
      { name: 'Tajawal', preview: 'تجوال عصري' },
      { name: 'Almarai', preview: 'المراعي' },
    ],
  },
]

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ffff00', '#ff3300', '#00ffcc',
  '#ff00ff', '#4488ff', '#ff8800', '#00ff44', '#ff4488',
  '#7c3aed', '#facc15', '#f87171', '#4ade80', '#60a5fa',
]

export default function LeftSidebar() {
  const { theme, activeLeftPanel, setActiveLeftPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const {
    videoUrl, frames, setFrames, selectedFrame, setSelectedFrame,
    isExtracting, setIsExtracting, currentTime, setCurrentTime,
    duration, setDuration, fps, setFps, setVideoFile,
  } = useVideoStore()
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [autoRan, setAutoRan] = useState(false)
  const [textColor, setTextColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fontSize, setFontSize] = useState(64)
  const [openCategory, setOpenCategory] = useState(0)
  const [titles, setTitles] = useState([])
  const [titleStyle, setTitleStyle] = useState('reaction')
  const [rewriting, setRewriting] = useState(false)

  // ── Video panel logic ──────────────────────────────────────────
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
    if (best && fabricCanvas) applyVideoFrame(best)
  }

  async function handleExtractAll() {
    if (!videoUrl) return
    setIsExtracting(true)
    const extracted = await extractFrames(videoUrl, 20)
    setFrames(extracted)
    setIsExtracting(false)
  }

  function applyVideoFrame(frame) {
    setSelectedFrame(frame)
    if (!fabricCanvas) return
    applyImageAsBackground(fabricCanvas, frame.dataUrl, 'cover')
  }

  function captureCurrentFrame() {
    const video = videoRef.current
    if (!video || !fabricCanvas) return
    applyVideoFrame({ time: video.currentTime, dataUrl: captureFrame(video) })
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) { video.play(); setPlaying(true) }
    else { video.pause(); setPlaying(false) }
  }

  function handleSeek(e) {
    const video = videoRef.current
    if (video) video.currentTime = +e.target.value
  }

  function handleVideoStep(dir) {
    const video = videoRef.current
    if (!video) return
    video.pause(); setPlaying(false)
    stepFrame(video, fps, dir)
  }

  function handleVideoDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('video/')) {
      if (file.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 5000)
      setAutoRan(false); setVideoFile(file)
    }
  }

  function handleVideoFileClick() {
    const i = document.createElement('input')
    i.type = 'file'; i.accept = 'video/*'
    i.onchange = (e) => {
      const file = e.target.files[0]; if (!file) return
      if (file.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 5000)
      setAutoRan(false); setVideoFile(file)
    }
    i.click()
  }

  const fmtTime = (t) => `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`

  const SMART_DEFAULTS = [
    'YOU WON\'T BELIEVE THIS',
    'INSANE MOMENT',
    'WATCH THIS',
    'SHOCKING TRUTH',
    'EPIC WIN',
  ]

  function addText(fontName, customContent, customSize) {
    if (!fabricCanvas) return
    prefs.setLastFont(fontName)
    if (document.fonts && !document.fonts.check(`16px "${fontName}"`)) {
      document.fonts.load(`16px "${fontName}"`).catch(() => {})
    }
    const pos = getSmartTextPosition(fabricCanvas)
    const content = customContent || SMART_DEFAULTS[Math.floor(Math.random() * SMART_DEFAULTS.length)]
    const text = new fabric.IText(content, {
      ...pos,
      fontFamily: fontName,
      fontSize: Math.max(12, Math.min(400, customSize || fontSize)),
      fill: textColor,
      stroke: strokeColor,
      strokeWidth: strokeColor === 'transparent' ? 0 : 2,
      shadow: { color: 'rgba(0,0,0,0.8)', blur: 12, offsetX: 2, offsetY: 2 },
    })
    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    fabricCanvas.renderAll()
  }

  function addQuickText(type) {
    const configs = {
      heading:    { content: 'YOU WON\'T BELIEVE THIS', size: 88, font: 'Impact' },
      subheading: { content: 'Watch until the end...', size: 52, font: 'Oswald' },
      small:      { content: 'Tap to edit', size: 32, font: 'Poppins' },
    }
    const c = configs[type]
    addText(c.font, c.content, c.size)
  }

  function updateSelectedTextColor(color) {
    setTextColor(color)
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('fill', color)
      fabricCanvas.renderAll()
    }
  }

  function updateSelectedStrokeColor(color) {
    setStrokeColor(color)
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set({ stroke: color, strokeWidth: 2 })
      fabricCanvas.renderAll()
    }
  }

  function updateFontSize(size) {
    const clamped = Math.max(12, Math.min(400, +size || 64))
    setFontSize(clamped)
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('fontSize', clamped)
      fabricCanvas.renderAll()
    }
  }

  function handleGenerateTitles() {
    const style = detectStyle(fabricCanvas) || titleStyle
    setTitleStyle(style)
    setTitles(generateTitles(style, 5))
  }

  function applyTitle(title) {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('text', title)
      fabricCanvas.renderAll()
      window.showToast?.('Title applied!', 'success', 1500)
    } else {
      addText('Impact', title, 80)
    }
  }

  function handleRewriteViral() {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (!obj || (obj.type !== 'i-text' && obj.type !== 'textbox')) {
      window.showToast?.('Select a text object first', 'info', 2000)
      return
    }
    setRewriting(true)
    const rewritten = rewriteViral(obj.text || '')
    obj.set('text', rewritten)
    fabricCanvas.renderAll()
    window.showToast?.('✨ Text made more viral!', 'success')
    setTimeout(() => setRewriting(false), 500)
  }

  function handleFaceEmphasis() {
    if (!fabricCanvas) return
    const bg = fabricCanvas.backgroundImage
    if (!bg) { window.showToast?.('Load an image first', 'info', 2000); return }
    // Boost brightness + contrast on background to emphasize face
    const existing = (bg.filters || []).filter(f =>
      f.type !== 'Brightness' && f.type !== 'Contrast' && f.type !== 'Saturation'
    )
    bg.filters = [
      ...existing,
      new fabric.Image.filters.Brightness({ brightness: 0.1 }),
      new fabric.Image.filters.Contrast({ contrast: 0.2 }),
      new fabric.Image.filters.Saturation({ saturation: 0.15 }),
    ]
    bg.applyFilters()
    // Also zoom in slightly toward center (face area)
    const scaleBoost = 1.08
    bg.set({
      scaleX: (bg.scaleX || 1) * scaleBoost,
      scaleY: (bg.scaleY || 1) * scaleBoost,
    })
    fabricCanvas.renderAll()
    window.showToast?.('🎯 Face emphasis applied!', 'success')
  }

  function addShape(type) {
    if (!fabricCanvas) return
    const cx = fabricCanvas.width / 2
    const cy = fabricCanvas.height / 2
    const shapeMap = {
      rect: new fabric.Rect({ left: cx - 80, top: cy - 40, width: 160, height: 80, fill: 'rgba(124,58,237,0.75)', rx: 8, ry: 8 }),
      circle: new fabric.Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: 'rgba(79,70,229,0.75)' }),
      triangle: new fabric.Triangle({ left: cx - 40, top: cy - 40, width: 80, height: 80, fill: '#f87171' }),
      line: new fabric.Line([cx - 80, cy, cx + 80, cy], { stroke: '#7c3aed', strokeWidth: 5 }),
      arrow: new fabric.Triangle({ left: cx - 30, top: cy - 40, width: 60, height: 80, fill: '#facc15', angle: 90 }),
    }
    const shape = shapeMap[type]
    if (shape) { fabricCanvas.add(shape); fabricCanvas.setActiveObject(shape); fabricCanvas.renderAll() }
  }

  const s = {
    sidebar: {
      width: 240, background: theme.bgSecondary, borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
      boxShadow: theme.isDark ? 'none' : '2px 0 12px rgba(100,80,200,0.06)',
    },
    tabs: { display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, background: theme.bgTertiary },
    tab: (active) => ({
      flex: 1, padding: '10px 4px', fontSize: 10, textAlign: 'center',
      cursor: 'pointer', border: 'none', lineHeight: 1.4, transition: 'all 0.15s',
      background: active ? theme.bgSecondary : 'transparent',
      color: active ? theme.accent : theme.textMuted,
      borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`,
      fontWeight: active ? 600 : 400,
    }),
    content: { flex: 1, overflowY: 'auto', padding: 12 },
    sectionTitle: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 },
    section: { marginBottom: 14 },
    label: { fontSize: 10, color: theme.textMuted, marginBottom: 4, display: 'block' },
    row: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 },
    colorSwatch: (color, active) => ({
      width: 22, height: 22, borderRadius: 4, background: color, cursor: 'pointer', flexShrink: 0,
      border: active ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
      boxShadow: active ? `0 0 0 2px ${theme.accentGlow}` : 'none',
      transition: 'transform 0.1s',
    }),
    colorInput: {
      width: 32, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`,
      cursor: 'pointer', padding: 2, background: theme.bgTertiary,
    },
    sizeInput: {
      flex: 1, background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      color: theme.text, borderRadius: 5, padding: '4px 8px', fontSize: 12, outline: 'none',
    },
    sizeRange: { flex: 2, accentColor: theme.accent },
    catHeader: (open) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 4,
      background: open ? theme.accentGlow : theme.bgTertiary,
      border: `1px solid ${open ? theme.borderHover : theme.border}`,
      color: open ? theme.accent : theme.textSecondary,
      fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
    }),
    fontBtn: (font) => ({
      width: '100%', padding: '8px 10px', borderRadius: 6,
      border: `1px solid ${theme.border}`, background: theme.bg,
      color: theme.text, fontSize: 13, fontFamily: font,
      cursor: 'pointer', textAlign: 'left', marginBottom: 3,
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }),
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
    shapeBtn: {
      padding: '14px 8px', borderRadius: 8, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text, fontSize: 20,
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
    },
    aiBtn: {
      width: '100%', padding: '9px 12px', borderRadius: 7, border: 'none',
      background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4,
    },
    aiStatus: { fontSize: 10, color: theme.accent, padding: '4px 0', textAlign: 'center' },
  }

  const hover = (e, on) => {
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
    e.currentTarget.style.borderColor = on ? theme.borderHover : theme.border
  }

  return (
    <div style={s.sidebar} className="ms-left-sidebar">
      <div style={s.tabs} role="tablist" aria-label="Left panel tools">
        {TOOLS.map((t) => (
          <button key={t.id} style={s.tab(activeLeftPanel === t.id)}
            role="tab"
            aria-selected={activeLeftPanel === t.id}
            aria-label={t.label}
            onClick={() => setActiveLeftPanel(t.id)}>
            <div style={{ fontSize: 15, marginBottom: 2 }}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      <div style={s.content}>

        {/* ── VIDEO PANEL ── */}
        {activeLeftPanel === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: -12 }}>

            {/* Drop zone / video preview */}
            {videoUrl ? (
              <div style={{ background: '#000', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} muted playsInline />
              </div>
            ) : (
              <div style={{
                height: 130, border: `2px dashed ${theme.border}`, margin: 12, borderRadius: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', gap: 5, transition: 'all 0.15s',
              }}
                onDragOver={(e) => e.preventDefault()} onDrop={handleVideoDrop}
                onClick={handleVideoFileClick}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 28 }}>🎬</span>
                <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>Drop video here</span>
                <span style={{ fontSize: 10, color: theme.textMuted }}>or click to browse</span>
              </div>
            )}

            {/* Playback controls */}
            {videoUrl && (
              <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <button style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.text, fontSize: 11, cursor: 'pointer' }}
                    onClick={() => handleVideoStep(-1)}>⏮</button>
                  <button style={{ padding: '3px 10px', borderRadius: 5, border: 'none', background: theme.accent, color: '#fff', fontSize: 11, cursor: 'pointer' }}
                    onClick={togglePlay}>{playing ? '⏸' : '▶'}</button>
                  <button style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.text, fontSize: 11, cursor: 'pointer' }}
                    onClick={() => handleVideoStep(1)}>⏭</button>
                  <input type="range" style={{ flex: 1, accentColor: theme.accent }} min={0} max={duration || 100} step={0.01} value={currentTime} onChange={handleSeek} />
                  <span style={{ fontSize: 9, color: theme.textMuted, whiteSpace: 'nowrap' }}>{fmtTime(currentTime)}/{fmtTime(duration)}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button style={{ flex: 1, padding: '4px 6px', borderRadius: 5, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.text, fontSize: 10, cursor: 'pointer' }}
                    onClick={captureCurrentFrame} disabled={!videoUrl}>📸 Capture</button>
                  <button style={{ flex: 1, padding: '4px 6px', borderRadius: 5, border: 'none', background: theme.accent, color: '#fff', fontSize: 10, cursor: 'pointer' }}
                    onClick={handleExtractAll} disabled={!videoUrl || isExtracting}>{isExtracting ? '⏳' : '⚡ All'}</button>
                  <button style={{ flex: 1, padding: '4px 6px', borderRadius: 5, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', fontSize: 10, cursor: 'pointer' }}
                    onClick={() => { setAutoRan(false); runSmartPick() }} disabled={!videoUrl || isExtracting}>{isExtracting ? '⏳' : '🧠 Smart'}</button>
                </div>
              </div>
            )}

            {/* Frames header */}
            <div style={{ padding: '5px 10px', borderBottom: `1px solid ${theme.border}`, fontSize: 10, color: theme.textMuted }}>
              {isExtracting ? (
                <span style={{ color: theme.accent }}>⏳ Analyzing frames...</span>
              ) : frames.length > 0 ? (
                <span>{frames.filter(f => f.isBest).length} recommended · {frames.length} total · <span style={{ color: theme.accent }}>click to use</span></span>
              ) : (
                <span>{videoUrl ? 'Processing...' : 'Upload a video to extract frames'}</span>
              )}
            </div>

            {/* Frames grid — vertical scroll */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 10px', overflowY: 'auto', maxHeight: 'calc(100vh - 420px)' }}>
              {frames.map((f, i) => (
                <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={f.dataUrl}
                    alt={fmtTime(f.time)}
                    style={{
                      width: '100%', aspectRatio: '16/9', objectFit: 'cover',
                      borderRadius: 6, cursor: 'pointer', display: 'block',
                      border: `2px solid ${selectedFrame?.time === f.time ? theme.accent : f.isBest ? '#facc15' : theme.border}`,
                      boxShadow: selectedFrame?.time === f.time ? `0 0 0 2px ${theme.accentGlow}` : 'none',
                      transition: 'border-color 0.15s, transform 0.12s',
                    }}
                    onClick={() => applyVideoFrame(f)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  />
                  {f.isBest && (
                    <div style={{ position: 'absolute', top: 5, left: 5, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>⭐ BEST</div>
                  )}
                  <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 9, padding: '1px 5px', borderRadius: 3 }}>{fmtTime(f.time)}</div>
                </div>
              ))}
              {!videoUrl && frames.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: theme.textMuted, fontSize: 11 }}>
                  No frames yet.<br />Upload a video above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TEXT PANEL ── */}
        {activeLeftPanel === 'text' && (
          <>
            {/* Quick-add text buttons */}
            <div style={{ marginBottom: 14 }}>
              <div style={s.sectionTitle}>Quick Add</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { type: 'heading',    label: '+ Heading',    hint: '88px · Impact', color: theme.accent },
                  { type: 'subheading', label: '+ Subheading', hint: '52px · Oswald',  color: theme.textSecondary },
                  { type: 'small',      label: '+ Small Text', hint: '32px · Poppins', color: theme.textMuted },
                ].map(({ type, label, hint, color }) => (
                  <button key={type}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 7,
                      border: `1px solid ${theme.border}`,
                      background: theme.bgTertiary, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => addQuickText(type)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
                    <span style={{ fontSize: 10, color: theme.textMuted }}>{hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={s.section}>
              <ColorSystem
                label="Text Color"
                activeColor={textColor}
                onColorSelect={updateSelectedTextColor}
              />
              <ColorSystem
                label="Stroke Color"
                activeColor={strokeColor}
                onColorSelect={updateSelectedStrokeColor}
              />
              <div style={s.sectionTitle}>Font Size</div>
              <div style={s.row}>
                <input type="range" style={s.sizeRange} min={12} max={200} value={fontSize}
                  onChange={(e) => updateFontSize(+e.target.value)} />
                <input type="number" style={{ ...s.sizeInput, width: 52 }} min={12} max={400}
                  value={fontSize} onChange={(e) => updateFontSize(+e.target.value)} />
              </div>
            </div>

            {/* Font categories */}
            <div style={s.section}>
              <div style={s.sectionTitle}>35 Premium Fonts</div>
              {FONT_CATEGORIES.map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 6 }}>
                  <div style={s.catHeader(openCategory === ci)} onClick={() => setOpenCategory(openCategory === ci ? -1 : ci)}>
                    <span>{cat.label}</span>
                    <span>{openCategory === ci ? '▲' : '▼'}</span>
                  </div>
                  {openCategory === ci && (
                    <div style={{ paddingLeft: 2 }}>
                      {cat.fonts.map((f) => {
                        const isRTL = cat.label.includes('Arabic') || cat.label.includes('Urdu')
                        return (
                          <button key={f.name} style={{ ...s.fontBtn(f.name), direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
                            onClick={() => addText(f.name)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentGlow; e.currentTarget.style.borderColor = theme.borderHover }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.borderColor = theme.border }}
                          >
                            <span style={{ fontSize: isRTL ? 15 : 13 }}>{f.preview}</span>
                            <span style={{ fontSize: 9, color: theme.textMuted, fontFamily: 'Inter, sans-serif', direction: 'ltr' }}>+</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI */}
            <div style={s.section}>
              <div style={s.sectionTitle}>AI Tools</div>

              {/* Title Generator */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                  <button style={{ ...s.aiBtn, flex: 1, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', marginTop: 0 }}
                    onClick={handleGenerateTitles}>
                    ✨ Generate Titles
                  </button>
                  <button style={{ ...s.aiBtn, flex: 1, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', marginTop: 0, opacity: rewriting ? 0.6 : 1 }}
                    onClick={handleRewriteViral}>
                    🔥 Make Viral
                  </button>
                </div>
                {titles.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['reaction','gaming','drama','news','motivational','curiosity','tutorial'].map(st => (
                      <button key={st}
                        style={{
                          padding: '3px 8px', borderRadius: 5, fontSize: 9, cursor: 'pointer',
                          border: `1px solid ${titleStyle === st ? theme.accent : theme.border}`,
                          background: titleStyle === st ? theme.accentGlow : 'transparent',
                          color: titleStyle === st ? theme.accent : theme.textMuted,
                          transition: 'all 0.12s', display: 'inline-block', marginRight: 4, marginBottom: 2,
                        }}
                        onClick={() => { setTitleStyle(st); setTitles(generateTitles(st, 5)) }}
                      >{st}</button>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                      {titles.map((t, i) => (
                        <button key={i}
                          style={{
                            width: '100%', padding: '7px 10px', borderRadius: 6,
                            border: `1px solid ${theme.border}`, background: theme.bg,
                            color: theme.text, fontSize: 10, cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.12s', lineHeight: 1.4,
                          }}
                          onClick={() => applyTitle(t)}
                          onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentGlow; e.currentTarget.style.borderColor = theme.borderHover }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.borderColor = theme.border }}
                        >{t}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button style={{ ...s.aiBtn, background: `linear-gradient(135deg,#0ea5e9,#6366f1)` }}
                onClick={() => faceAutoFocus(fabricCanvas)}>
                🎯 Face Auto-Focus
              </button>
              <button style={{ ...s.aiBtn, marginTop: 6, background: `linear-gradient(135deg,#10b981,#0ea5e9)` }}
                onClick={handleFaceEmphasis}>
                👤 Face Emphasis
              </button>
              <button style={{ ...s.aiBtn, marginTop: 6, background: `linear-gradient(135deg,#f59e0b,#ef4444)` }}
                onClick={() => amplifyEmotion(fabricCanvas)}>
                😎 Emotion Amplifier
              </button>
              <button style={{ ...s.aiBtn, marginTop: 6, background: theme.bgTertiary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                onClick={() => resetFilters(fabricCanvas)}>
                ↺ Reset Filters
              </button>
            </div>
          </>
        )}

        {/* ── SHAPES PANEL ── */}
        {activeLeftPanel === 'shapes' && <ShapesPanel />}

        {/* ── FILTERS PANEL ── */}
        {activeLeftPanel === 'filters' && <FiltersPanel />}

        {activeLeftPanel === 'bg' && <BackgroundPanel />}
        {activeLeftPanel === 'styles' && (
          <>
            <QuickMode />
            <MakeItViral />
            <div style={{ marginTop: 4 }}><OneClickStyles /></div>
            <div style={{ marginTop: 16 }}><SmartTextSuggestions /></div>
            <div style={{ marginTop: 16 }}><ABGenerator /></div>
            <div style={{ marginTop: 16 }}><CreatorPacks /></div>
          </>
        )}
        {activeLeftPanel === 'assets' && <AssetManager />}
      </div>
    </div>
  )
}

