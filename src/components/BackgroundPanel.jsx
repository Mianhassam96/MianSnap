import React, { useState } from 'react'
import { fabric } from '../lib/fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { removeBackground } from '../utils/bgRemoval'
import { applyImageAsBackground } from '../utils/imageUtils'

// ── Preset backgrounds ──────────────────────────────────────────────
const BG_PRESETS = [
  { id: 'gaming',    label: '🎮 Gaming',    value: 'linear-gradient(135deg,#0d0221,#1a0533,#0d1b2a)', type: 'gradient' },
  { id: 'drama',     label: '😱 Drama',     value: 'linear-gradient(135deg,#1a0000,#3d0000,#000)', type: 'gradient' },
  { id: 'news',      label: '📰 News',      value: 'linear-gradient(135deg,#0a0a0a,#1a0000,#cc0000)', type: 'gradient' },
  { id: 'neon',      label: '⚡ Neon Cyber', value: 'linear-gradient(135deg,#000428,#004e92,#00d2ff)', type: 'gradient' },
  { id: 'studio',    label: '🤍 Studio',    value: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', type: 'gradient' },
  { id: 'sunset',    label: '🌅 Sunset',    value: 'linear-gradient(135deg,#f7971e,#ffd200,#ff6b6b)', type: 'gradient' },
  { id: 'forest',    label: '🌿 Nature',    value: 'linear-gradient(135deg,#134e5e,#71b280)', type: 'gradient' },
  { id: 'luxury',    label: '💎 Luxury',    value: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', type: 'gradient' },
  { id: 'fire',      label: '🔥 Fire',      value: 'linear-gradient(135deg,#f12711,#f5af19)', type: 'gradient' },
  { id: 'ocean',     label: '🌊 Ocean',     value: 'linear-gradient(135deg,#005c97,#363795)', type: 'gradient' },
  { id: 'white',     label: '⬜ Clean White', value: '#ffffff', type: 'solid' },
  { id: 'black',     label: '⬛ Pure Black', value: '#000000', type: 'solid' },
]

// Parse CSS gradient/color → canvas-renderable fill
function parseFill(value) {
  if (value.startsWith('#') || value.startsWith('rgb')) return value
  // Extract colors from gradient string
  const matches = value.match(/#[0-9a-fA-F]{3,6}/g) || []
  if (matches.length >= 2) {
    return new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1280, y2: 720 },
      colorStops: matches.map((c, i) => ({ offset: i / (matches.length - 1), color: c })),
    })
  }
  return matches[0] || '#000000'
}

export default function BackgroundPanel() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()

  const [bgStatus, setBgStatus] = useState('')
  const [bgRunning, setBgRunning] = useState(false)

  // BG image controls
  const [blur, setBlur]           = useState(0)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast]   = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [vignette, setVignette]   = useState(false)

  // ── helpers ──────────────────────────────────────────────────────

  function getBg() { return fabricCanvas?.backgroundImage || null }

  function applyBgFilters(overrides = {}) {
    const bg = getBg()
    if (!bg || bg.filters === undefined) return
    const b  = overrides.brightness  ?? brightness
    const c  = overrides.contrast    ?? contrast
    const sa = overrides.saturation  ?? saturation
    const bl = overrides.blur        ?? blur
    const filters = []
    if (b  !== 0) filters.push(new fabric.Image.filters.Brightness({ brightness: b / 100 }))
    if (c  !== 0) filters.push(new fabric.Image.filters.Contrast({ contrast: c / 100 }))
    if (sa !== 0) filters.push(new fabric.Image.filters.Saturation({ saturation: sa / 100 }))
    if (bl > 0)   filters.push(new fabric.Image.filters.Blur({ blur: bl / 100 }))
    bg.filters = filters
    bg.applyFilters()
    fabricCanvas.renderAll()
  }

  function setPreset(preset) {
    if (!fabricCanvas) return
    const fill = parseFill(preset.value)
    // Remove existing bg image, use solid rect instead
    fabricCanvas.setBackgroundImage(null, () => {})
    fabricCanvas.setBackgroundColor(
      typeof fill === 'string' ? fill : '#000000',
      fabricCanvas.renderAll.bind(fabricCanvas)
    )
    // For gradients, draw a rect as background object
    if (typeof fill !== 'string') {
      // Remove old bg rect
      fabricCanvas.getObjects().filter(o => o._bgRect).forEach(o => fabricCanvas.remove(o))
      const rect = new fabric.Rect({
        left: 0, top: 0,
        width: fabricCanvas.width, height: fabricCanvas.height,
        fill,
        selectable: false, evented: false, _bgRect: true,
      })
      fabricCanvas.add(rect)
      fabricCanvas.sendToBack(rect)
      fabricCanvas.renderAll()
    }
  }

  function setSolidBg(color) {
    if (!fabricCanvas) return
    fabricCanvas.getObjects().filter(o => o._bgRect).forEach(o => fabricCanvas.remove(o))
    fabricCanvas.setBackgroundImage(null, () => {})
    fabricCanvas.setBackgroundColor(color, fabricCanvas.renderAll.bind(fabricCanvas))
  }

  function handleImageUpload() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file || !fabricCanvas) return
      const url = URL.createObjectURL(file)
      applyImageAsBackground(fabricCanvas, url, 'cover', () => {
        setBlur(0); setBrightness(0); setContrast(0); setSaturation(0)
      })
    }
    input.click()
  }

  async function handleRemoveBg() {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (!active || active.type !== 'image') {
      setBgStatus('⚠ Select an image layer on the canvas first')
      setTimeout(() => setBgStatus(''), 3000)
      return
    }
    setBgRunning(true)
    try {
      const dataUrl = active.toDataURL()
      const result = await removeBackground(dataUrl, (msg) => setBgStatus(msg))
      fabric.Image.fromURL(result, (img) => {
        img.set({ left: active.left, top: active.top, scaleX: active.scaleX, scaleY: active.scaleY })
        fabricCanvas.remove(active)
        fabricCanvas.add(img)
        fabricCanvas.setActiveObject(img)
        fabricCanvas.renderAll()
        setBgStatus('✓ Background removed!')
        setTimeout(() => setBgStatus(''), 3000)
      })
    } catch {
      setBgStatus('AI model failed — check connection')
    }
    setBgRunning(false)
  }

  function addDepthEffect() {
    if (!fabricCanvas) return
    // Remove old depth layers
    fabricCanvas.getObjects().filter(o => o._depthGlow || o._depthShadow).forEach(o => fabricCanvas.remove(o))

    // Glow behind subject (center ellipse)
    const glow = new fabric.Ellipse({
      left: fabricCanvas.width * 0.5, top: fabricCanvas.height * 0.45,
      rx: fabricCanvas.width * 0.22, ry: fabricCanvas.height * 0.28,
      originX: 'center', originY: 'center',
      fill: new fabric.Gradient({
        type: 'radial',
        coords: { r1: 0, r2: fabricCanvas.width * 0.22, x1: fabricCanvas.width * 0.5, y1: fabricCanvas.height * 0.45, x2: fabricCanvas.width * 0.5, y2: fabricCanvas.height * 0.45 },
        colorStops: [{ offset: 0, color: 'rgba(255,255,255,0.18)' }, { offset: 1, color: 'rgba(255,255,255,0)' }],
      }),
      selectable: false, evented: false, _depthGlow: true,
    })

    // Drop shadow rect at bottom
    const shadow = new fabric.Rect({
      left: fabricCanvas.width * 0.15, top: fabricCanvas.height * 0.75,
      width: fabricCanvas.width * 0.7, height: fabricCanvas.height * 0.18,
      fill: new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: 0, y2: fabricCanvas.height * 0.18 },
        colorStops: [{ offset: 0, color: 'rgba(0,0,0,0.45)' }, { offset: 1, color: 'rgba(0,0,0,0)' }],
      }),
      selectable: false, evented: false, _depthShadow: true,
    })

    fabricCanvas.add(shadow)
    fabricCanvas.add(glow)
    // Place above bg rect but below subject
    fabricCanvas.sendToBack(glow)
    fabricCanvas.sendToBack(shadow)
    fabricCanvas.renderAll()
  }

  function removeDepthEffect() {
    if (!fabricCanvas) return
    fabricCanvas.getObjects().filter(o => o._depthGlow || o._depthShadow).forEach(o => fabricCanvas.remove(o))
    fabricCanvas.renderAll()
  }

  function toggleVignette(on) {
    setVignette(on)
    if (!fabricCanvas) return
    fabricCanvas.getObjects().filter(o => o._vignette).forEach(o => fabricCanvas.remove(o))
    if (on) {
      const v = new fabric.Rect({
        left: 0, top: 0, width: fabricCanvas.width, height: fabricCanvas.height,
        fill: new fabric.Gradient({
          type: 'radial',
          coords: { r1: 0, r2: fabricCanvas.width * 0.75, x1: fabricCanvas.width / 2, y1: fabricCanvas.height / 2, x2: fabricCanvas.width / 2, y2: fabricCanvas.height / 2 },
          colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 0.65, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.65)' }],
        }),
        selectable: false, evented: false, _vignette: true,
      })
      fabricCanvas.add(v)
      fabricCanvas.sendToBack(v)
      fabricCanvas.renderAll()
    }
  }

  // ── styles ───────────────────────────────────────────────────────
  const s = {
    section: { marginBottom: 16 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 },
    btn: (grad) => ({
      width: '100%', padding: '9px 12px', borderRadius: 7, border: 'none',
      background: grad || `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
      marginBottom: 5, transition: 'opacity 0.15s, transform 0.15s',
      display: 'flex', alignItems: 'center', gap: 7,
    }),
    outlineBtn: {
      width: '100%', padding: '8px 12px', borderRadius: 7,
      border: `1px solid ${theme.border}`, background: theme.bgTertiary,
      color: theme.textSecondary, fontSize: 12, cursor: 'pointer',
      marginBottom: 5, transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: 7,
    },
    status: { fontSize: 10, color: theme.accent, padding: '4px 0', textAlign: 'center', minHeight: 18 },
    presetGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 },
    presetBtn: (value) => ({
      padding: '10px 6px', borderRadius: 7, border: `1px solid ${theme.border}`,
      background: value.startsWith('#') ? value : 'transparent',
      backgroundImage: value.startsWith('linear') ? value : 'none',
      color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer',
      textAlign: 'center', transition: 'transform 0.15s, box-shadow 0.15s',
      textShadow: '0 1px 4px rgba(0,0,0,0.8)',
    }),
    sliderRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
    sliderLabel: { fontSize: 10, color: theme.textMuted, width: 68, flexShrink: 0 },
    slider: { flex: 1, accentColor: theme.accent },
    sliderVal: { fontSize: 10, color: theme.textSecondary, width: 28, textAlign: 'right', flexShrink: 0 },
    toggle: (on) => ({
      width: 36, height: 20, borderRadius: 10, cursor: 'pointer', border: 'none',
      background: on ? theme.accent : theme.border,
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }),
    toggleDot: (on) => ({
      position: 'absolute', top: 2, left: on ? 18 : 2,
      width: 16, height: 16, borderRadius: '50%', background: '#fff',
      transition: 'left 0.2s',
    }),
    colorRow: { display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 },
    colorDot: (c) => ({
      width: 24, height: 24, borderRadius: 5, background: c, cursor: 'pointer',
      border: `1px solid ${theme.border}`, transition: 'transform 0.1s',
      flexShrink: 0,
    }),
  }

  const SOLID_COLORS = ['#000000','#ffffff','#1a1a2e','#0d0221','#1a0000','#002244','#003300','#2d1b69']

  return (
    <div>
      {/* ── Remove BG ── */}
      <div style={s.section}>
        <div style={s.title}>✂️ Subject Cutout</div>
        <button style={s.btn('linear-gradient(135deg,#7c3aed,#4f46e5)')}
          onClick={handleRemoveBg} disabled={bgRunning}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          {bgRunning ? '⏳ Processing...' : '✂️ Remove Background (AI)'}
        </button>
        {bgStatus && <div style={s.status}>{bgStatus}</div>}
      </div>

      {/* ── Replace BG ── */}
      <div style={s.section}>
        <div style={s.title}>🖼 Replace Background</div>
        <button style={s.outlineBtn} onClick={handleImageUpload}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
        >
          📁 Upload Image
        </button>

        <div style={{ ...s.title, marginTop: 8 }}>Solid Color</div>
        <div style={s.colorRow}>
          {SOLID_COLORS.map(c => (
            <div key={c} style={s.colorDot(c)}
              onClick={() => setSolidBg(c)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            />
          ))}
          <input type="color" style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${theme.border}`, cursor: 'pointer', padding: 1 }}
            onChange={(e) => setSolidBg(e.target.value)} title="Custom color" />
        </div>

        {/* Custom gradient */}
        <div style={{ ...s.title, marginTop: 8 }}>Custom Gradient</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
          <input type="color" defaultValue="#7c3aed"
            id="grad-color1"
            style={{ width: 32, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, cursor: 'pointer', padding: 1 }} />
          <span style={{ fontSize: 10, color: theme.textMuted }}>→</span>
          <input type="color" defaultValue="#ef4444"
            id="grad-color2"
            style={{ width: 32, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`, cursor: 'pointer', padding: 1 }} />
          <button
            style={{ flex: 1, padding: '5px 8px', borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.text, fontSize: 10, cursor: 'pointer' }}
            onClick={() => {
              const c1 = document.getElementById('grad-color1')?.value || '#7c3aed'
              const c2 = document.getElementById('grad-color2')?.value || '#ef4444'
              if (!fabricCanvas) return
              fabricCanvas.getObjects().filter(o => o._bgRect).forEach(o => fabricCanvas.remove(o))
              fabricCanvas.setBackgroundImage(null, () => {})
              const grad = new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: fabricCanvas.width, y2: fabricCanvas.height },
                colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }],
              })
              const rect = new fabric.Rect({
                left: 0, top: 0, width: fabricCanvas.width, height: fabricCanvas.height,
                fill: grad, selectable: false, evented: false, _bgRect: true,
              })
              fabricCanvas.add(rect)
              fabricCanvas.sendToBack(rect)
              fabricCanvas.renderAll()
              window.showToast?.('🎨 Gradient applied', 'success', 1200)
            }}
          >Apply</button>
        </div>
      </div>

      {/* ── Preset Backgrounds ── */}
      <div style={s.section}>
        <div style={s.title}>🎨 Background Presets</div>
        <div style={s.presetGrid}>
          {BG_PRESETS.map(p => (
            <button key={p.id} style={s.presetBtn(p.value)}
              onClick={() => setPreset(p)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BG Image Controls ── */}
      <div style={s.section}>
        <div style={s.title}>⚙️ Image Adjustments</div>
        {[
          { label: 'Blur',       val: blur,       set: (v) => { setBlur(v);       applyBgFilters({ blur: v }) },       min: 0,   max: 80  },
          { label: 'Brightness', val: brightness, set: (v) => { setBrightness(v); applyBgFilters({ brightness: v }) }, min: -80, max: 80  },
          { label: 'Contrast',   val: contrast,   set: (v) => { setContrast(v);   applyBgFilters({ contrast: v }) },   min: -80, max: 80  },
          { label: 'Saturation', val: saturation, set: (v) => { setSaturation(v); applyBgFilters({ saturation: v }) }, min: -80, max: 80  },
        ].map(({ label, val, set, min, max }) => (
          <div key={label} style={s.sliderRow}>
            <span style={s.sliderLabel}>{label}</span>
            <input type="range" style={s.slider} min={min} max={max} value={val}
              onChange={(e) => set(+e.target.value)} />
            <span style={s.sliderVal}>{val > 0 ? `+${val}` : val}</span>
          </div>
        ))}

        {/* Vignette toggle */}
        <div style={{ ...s.sliderRow, marginTop: 4 }}>
          <span style={s.sliderLabel}>Vignette</span>
          <button style={s.toggle(vignette)} onClick={() => toggleVignette(!vignette)}>
            <div style={s.toggleDot(vignette)} />
          </button>
          <span style={{ ...s.sliderVal, width: 'auto', fontSize: 10, color: vignette ? theme.accent : theme.textMuted }}>
            {vignette ? 'On' : 'Off'}
          </span>
        </div>

        <button style={{ ...s.outlineBtn, marginTop: 6 }}
          onClick={() => { setBlur(0); setBrightness(0); setContrast(0); setSaturation(0); applyBgFilters({ blur: 0, brightness: 0, contrast: 0, saturation: 0 }) }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border }}
        >
          ↺ Reset Adjustments
        </button>
      </div>

      {/* ── Depth Effect ── */}
      <div style={s.section}>
        <div style={s.title}>✨ Depth Effect</div>
        <button style={s.btn('linear-gradient(135deg,#0ea5e9,#6366f1)')}
          onClick={addDepthEffect}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          ✨ Add Depth (Glow + Shadow)
        </button>
        <button style={s.outlineBtn} onClick={removeDepthEffect}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border }}
        >
          ✕ Remove Depth Effect
        </button>
      </div>
    </div>
  )
}
