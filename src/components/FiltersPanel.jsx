import React, { useState } from 'react'
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
  },
  {
    id: 'cinematic',
    label: '🎬 Cinematic Dark',
    desc: 'Moody, desaturated',
    filters: { contrast: 0.2, saturation: -0.3, brightness: -0.08 },
    suggestColors: ['#cc0000','#000000','#888888'],
  },
  {
    id: 'hdr',
    label: '🌟 HDR Pop',
    desc: 'Vivid, punchy colors',
    filters: { contrast: 0.3, saturation: 0.5, brightness: 0.08 },
    suggestColors: ['#00ffcc','#ff00ff','#ffffff'],
  },
  {
    id: 'gaming',
    label: '🎮 Gaming Neon',
    desc: 'Neon glow, dark base',
    filters: { contrast: 0.2, saturation: 0.6, brightness: 0.04 },
    suggestColors: ['#00ff88','#7c3aed','#ff00ff'],
  },
  {
    id: 'warm',
    label: '🌅 Warm Skin',
    desc: 'Golden, warm tones',
    filters: { contrast: 0.1, saturation: 0.2, brightness: 0.1 },
    suggestColors: ['#f59e0b','#ef4444','#ffffff'],
  },
  {
    id: 'cold',
    label: '❄️ Cold Drama',
    desc: 'Cool, blue-tinted',
    filters: { contrast: 0.15, saturation: -0.1, brightness: -0.05 },
    suggestColors: ['#0ea5e9','#6366f1','#ffffff'],
  },
  {
    id: 'bw',
    label: '⬛ Black & White',
    desc: 'Classic monochrome',
    filters: { contrast: 0.2, saturation: -1, brightness: 0 },
    suggestColors: ['#ffffff','#888888','#000000'],
  },
  {
    id: 'vintage',
    label: '📷 Vintage',
    desc: 'Faded, warm film look',
    filters: { contrast: -0.05, saturation: -0.2, brightness: 0.06 },
    suggestColors: ['#d4a574','#8b6914','#ffffff'],
  },
]

export default function FiltersPanel() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [activePreset, setActivePreset] = useState(null)
  const [fine, setFine] = useState({ contrast: 0, saturation: 0, brightness: 0, blur: 0 })

  function applyPreset(preset) {
    setActivePreset(preset.id)
    const f = preset.filters
    setFine({ contrast: Math.round(f.contrast * 100), saturation: Math.round(f.saturation * 100), brightness: Math.round(f.brightness * 100), blur: 0 })
    applyFilters(f.contrast, f.saturation, f.brightness, 0)
    window.showToast?.(`${preset.label} applied`, 'success')
  }

  function applyFilters(contrast, saturation, brightness, blur) {
    const bg = fabricCanvas?.backgroundImage
    if (!bg || bg.filters === undefined) return
    const filters = []
    if (contrast  !== 0) filters.push(new fabric.Image.filters.Contrast({ contrast }))
    if (saturation !== 0) filters.push(new fabric.Image.filters.Saturation({ saturation }))
    if (brightness !== 0) filters.push(new fabric.Image.filters.Brightness({ brightness }))
    if (blur > 0)         filters.push(new fabric.Image.filters.Blur({ blur: blur / 100 }))
    bg.filters = filters
    bg.applyFilters()
    fabricCanvas.renderAll()
  }

  function updateFine(key, val) {
    const next = { ...fine, [key]: val }
    setFine(next)
    applyFilters(next.contrast / 100, next.saturation / 100, next.brightness / 100, next.blur)
  }

  function resetFilters() {
    setActivePreset(null)
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
    presetBtn: (active) => ({
      padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
      border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentGlow : theme.bgTertiary,
      color: active ? theme.accent : theme.text,
      fontSize: 11, fontWeight: active ? 700 : 500,
      textAlign: 'left', transition: 'all 0.15s',
    }),
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
      color: theme.textMuted, fontSize: 11, cursor: 'pointer',
      transition: 'all 0.15s',
    },
  }

  const activePresetData = FILTER_PRESETS.find(p => p.id === activePreset)

  return (
    <div>
      <div style={s.section}>
        <div style={s.title}>🎬 Filter Presets</div>
        <div style={s.grid}>
          {FILTER_PRESETS.map(p => (
            <button key={p.id} style={s.presetBtn(activePreset === p.id)}
              onClick={() => applyPreset(p)}
              onMouseEnter={(e) => { if (activePreset !== p.id) { e.currentTarget.style.borderColor = theme.accent } }}
              onMouseLeave={(e) => { if (activePreset !== p.id) { e.currentTarget.style.borderColor = theme.border } }}
            >
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
