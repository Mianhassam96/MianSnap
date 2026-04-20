import React, { useState, useRef } from 'react'
import { fabric } from '../lib/fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

const FILTER_PRESETS = [
  {
    id: 'viral',
    label: '⚡ Viral Boost',
    desc: 'High contrast + saturation',
    filters: { contrast: 0.25, saturation: 0.35, brightness: 0.05 },
    suggestColors: ['#ff0000','#ffff00','#ffffff'],
    textColor: '#ffff00', glowColor: 'rgba(255,255,0,0.6)',
  },
  {
    id: 'cinematic',
    label: '🎬 Cinematic Dark',
    desc: 'Moody, desaturated',
    filters: { contrast: 0.2, saturation: -0.3, brightness: -0.08 },
    suggestColors: ['#cc0000','#000000','#888888'],
    textColor: '#ffffff', glowColor: 'rgba(204,0,0,0.5)',
  },
  {
    id: 'hdr',
    label: '🌟 HDR Pop',
    desc: 'Vivid, punchy colors',
    filters: { contrast: 0.3, saturation: 0.5, brightness: 0.08 },
    suggestColors: ['#00ffcc','#ff00ff','#ffffff'],
    textColor: '#ffffff', glowColor: 'rgba(0,255,204,0.5)',
  },
  {
    id: 'gaming',
    label: '🎮 Gaming Neon',
    desc: 'Neon glow, dark base',
    filters: { contrast: 0.2, saturation: 0.6, brightness: 0.04 },
    suggestColors: ['#00ff88','#7c3aed','#ff00ff'],
    textColor: '#00ff88', glowColor: 'rgba(0,255,136,0.6)',
  },
  {
    id: 'warm',
    label: '🌅 Warm Skin',
    desc: 'Golden, warm tones',
    filters: { contrast: 0.1, saturation: 0.2, brightness: 0.1 },
    suggestColors: ['#f59e0b','#ef4444','#ffffff'],
    textColor: '#ffffff', glowColor: 'rgba(245,158,11,0.5)',
  },
  {
    id: 'cold',
    label: '❄️ Cold Drama',
    desc: 'Cool, blue-tinted',
    filters: { contrast: 0.15, saturation: -0.1, brightness: -0.05 },
    suggestColors: ['#0ea5e9','#6366f1','#ffffff'],
    textColor: '#ffffff', glowColor: 'rgba(14,165,233,0.5)',
  },
  {
    id: 'bw',
    label: '⬛ Black & White',
    desc: 'Classic monochrome',
    filters: { contrast: 0.2, saturation: -1, brightness: 0 },
    suggestColors: ['#ffffff','#888888','#000000'],
    textColor: '#ffffff', glowColor: 'rgba(255,255,255,0.4)',
  },
  {
    id: 'vintage',
    label: '📷 Vintage',
    desc: 'Faded, warm film look',
    filters: { contrast: -0.05, saturation: -0.2, brightness: 0.06 },
    suggestColors: ['#d4a574','#8b6914','#ffffff'],
    textColor: '#d4a574', glowColor: 'rgba(212,165,116,0.4)',
  },
]

export default function FiltersPanel() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [activePreset, setActivePreset] = useState(null)
  const [fine, setFine] = useState({ contrast: 0, saturation: 0, brightness: 0, blur: 0 })
  const [colorSuggestion, setColorSuggestion] = useState(null)
  const savedFiltersRef = useRef(null)
  const hoverTimerRef = useRef(null)
  const renderTimerRef = useRef(null) // debounce render

  // ── Core filter apply — always REPLACES, never stacks ────────
  function applyFilters(contrast, saturation, brightness, blur) {
    const bg = fabricCanvas?.backgroundImage
    if (!bg || bg.filters === undefined) return
    // Hard reset first — prevents stacking across multiple apply calls
    bg.filters = []
    const filters = []
    if (contrast   !== 0) filters.push(new fabric.Image.filters.Contrast({ contrast }))
    if (saturation !== 0) filters.push(new fabric.Image.filters.Saturation({ saturation }))
    if (brightness !== 0) filters.push(new fabric.Image.filters.Brightness({ brightness }))
    if (blur > 0)         filters.push(new fabric.Image.filters.Blur({ blur: blur / 100 }))
    bg.filters = filters
    bg.applyFilters()
    clearTimeout(renderTimerRef.current)
    renderTimerRef.current = setTimeout(() => fabricCanvas.renderAll(), 30)
  }

  // ── Hover preview ──────────────────────────────────────────────
  function onHoverPreset(preset) {
    const bg = fabricCanvas?.backgroundImage
    if (!bg || bg.filters === undefined) return
    // Save current filters once
    if (!savedFiltersRef.current) {
      savedFiltersRef.current = [...(bg.filters || [])]
    }
    // Debounce 180ms so fast mouse moves don't flicker
    clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => {
      const f = preset.filters
      applyFilters(f.contrast, f.saturation, f.brightness, 0)
    }, 180)
  }

  function onLeavePreset() {
    clearTimeout(hoverTimerRef.current)
    const bg = fabricCanvas?.backgroundImage
    if (!bg || !savedFiltersRef.current) return
    // Only revert if this preset isn't the active one
    if (!activePreset) {
      bg.filters = savedFiltersRef.current
      bg.applyFilters()
      fabricCanvas.renderAll()
      savedFiltersRef.current = null
    }
  }

  // ── Apply preset (click) ───────────────────────────────────────
  function applyPreset(preset) {
    savedFiltersRef.current = null // commit — don't revert on leave
    setActivePreset(preset.id)
    const f = preset.filters
    setFine({
      contrast:   Math.round(f.contrast   * 100),
      saturation: Math.round(f.saturation * 100),
      brightness: Math.round(f.brightness * 100),
      blur: 0,
    })
    applyFilters(f.contrast, f.saturation, f.brightness, 0)

    // Auto color linking — suggest text + glow colors
    setColorSuggestion({ preset, textColor: preset.textColor, glowColor: preset.glowColor })

    window.showToast?.(`${preset.label} applied`, 'success')
  }

  // ── Apply suggested colors to text objects ─────────────────────
  function applyColorSuggestion() {
    if (!fabricCanvas || !colorSuggestion) return
    const textObjs = fabricCanvas.getObjects().filter(
      o => o.type === 'i-text' || o.type === 'textbox'
    )
    textObjs.forEach(t => {
      t.set({
        fill: colorSuggestion.textColor,
        shadow: new fabric.Shadow({
          color: colorSuggestion.glowColor,
          blur: 20, offsetX: 0, offsetY: 0,
        }),
      })
    })
    fabricCanvas.renderAll()
    window.showToast?.('Text colors updated to match filter', 'success')
    setColorSuggestion(null)
  }

  function updateFine(key, val) {
    const next = { ...fine, [key]: val }
    setFine(next)
    applyFilters(next.contrast / 100, next.saturation / 100, next.brightness / 100, next.blur)
  }

  function resetFilters() {
    setActivePreset(null)
    setColorSuggestion(null)
    savedFiltersRef.current = null
    setFine({ contrast: 0, saturation: 0, brightness: 0, blur: 0 })
    const bg = fabricCanvas?.backgroundImage
    if (!bg) return
    bg.filters = []
    bg.applyFilters()
    fabricCanvas.renderAll()
  }

  const s = {
    section: { marginBottom: 14 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 },
    presetBtn: (active, hovering) => ({
      padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
      border: `1px solid ${active ? theme.accent : hovering ? theme.borderHover : theme.border}`,
      background: active ? theme.accentGlow : hovering ? `${theme.accentGlow}88` : theme.bgTertiary,
      color: active ? theme.accent : theme.text,
      fontSize: 11, fontWeight: active ? 700 : 500,
      textAlign: 'left', transition: 'all 0.15s',
      position: 'relative',
    }),
    previewBadge: {
      position: 'absolute', top: 4, right: 4,
      fontSize: 8, color: theme.accent, fontWeight: 700,
    },
    presetLabel: { display: 'block', marginBottom: 2 },
    presetDesc: { fontSize: 9, color: theme.textMuted, fontWeight: 400 },
    suggestRow: { display: 'flex', gap: 4, marginTop: 4 },
    suggestDot: (c) => ({
      width: 10, height: 10, borderRadius: '50%', background: c,
      border: `1px solid ${theme.border}`,
    }),
    sliderRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
    sliderLabel: { fontSize: 10, color: theme.textMuted, width: 68, flexShrink: 0 },
    slider: { flex: 1, accentColor: theme.accent },
    sliderVal: { fontSize: 10, color: theme.textSecondary, width: 28, textAlign: 'right', flexShrink: 0 },
    resetBtn: {
      width: '100%', padding: '7px', borderRadius: 6,
      border: `1px solid ${theme.border}`, background: 'transparent',
      color: theme.textMuted, fontSize: 11, cursor: 'pointer', transition: 'all 0.15s',
    },
    // Color suggestion banner
    suggestionBanner: {
      padding: '10px 12px', borderRadius: 8, marginBottom: 10,
      background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
      animation: 'fadeIn 0.2s ease',
    },
    suggestionTitle: { fontSize: 11, fontWeight: 700, color: theme.accent, marginBottom: 6 },
    suggestionColors: { display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' },
    suggestionDot: (c) => ({
      width: 18, height: 18, borderRadius: 4, background: c,
      border: `1px solid ${theme.border}`, flexShrink: 0,
    }),
    applyColorsBtn: {
      width: '100%', padding: '7px', borderRadius: 6, border: 'none',
      background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
    },
  }

  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div>
      {/* Color suggestion banner */}
      {colorSuggestion && (
        <div style={s.suggestionBanner}>
          <div style={s.suggestionTitle}>🎨 Matching colors detected</div>
          <div style={s.suggestionColors}>
            {(colorSuggestion?.preset?.suggestColors || []).map(c => (
              <div key={c} style={s.suggestionDot(c)} />
            ))}
            <span style={{ fontSize: 10, color: theme.textSecondary }}>
              Apply to text?
            </span>
          </div>
          <button style={s.applyColorsBtn} onClick={applyColorSuggestion}>
            ✓ Apply to text objects
          </button>
        </div>
      )}

      <div style={s.section}>
        <div style={s.title}>🎬 Filter Presets <span style={{ fontSize: 9, color: theme.textMuted, fontWeight: 400 }}>hover to preview</span></div>
        <div style={s.grid}>
          {FILTER_PRESETS.map(p => (
            <button key={p.id}
              style={s.presetBtn(activePreset === p.id, hoveredId === p.id)}
              onClick={() => applyPreset(p)}
              onMouseEnter={() => { setHoveredId(p.id); onHoverPreset(p) }}
              onMouseLeave={() => { setHoveredId(null); onLeavePreset() }}
            >
              {hoveredId === p.id && activePreset !== p.id && (
                <span style={s.previewBadge}>PREVIEW</span>
              )}
              <span style={s.presetLabel}>{p.label}</span>
              <span style={s.presetDesc}>{p.desc}</span>
              <div style={s.suggestRow}>
                {p.suggestColors.map(c => <div key={c} style={s.suggestDot(c)} />)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fine-tune sliders */}
      <div style={s.section}>
        <div style={s.title}>Fine Tune</div>
        {[
          { key: 'brightness', label: 'Brightness', min: -80, max: 80 },
          { key: 'contrast',   label: 'Contrast',   min: -80, max: 80 },
          { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
          { key: 'blur',       label: 'Blur',       min: 0,   max: 80 },
        ].map(({ key, label, min, max }) => (
          <div key={key} style={s.sliderRow}>
            <span style={s.sliderLabel}>{label}</span>
            <input type="range" style={s.slider} min={min} max={max} value={fine[key]}
              onChange={(e) => updateFine(key, +e.target.value)} />
            <span style={s.sliderVal}>{fine[key] > 0 ? `+${fine[key]}` : fine[key]}</span>
          </div>
        ))}
        <button style={s.resetBtn} onClick={resetFilters}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
        >↺ Reset Filters</button>
      </div>
    </div>
  )
}
