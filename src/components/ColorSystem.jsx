import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { prefs } from '../utils/prefs'

// Curated palettes for creators
const PALETTES = [
  { label: '▶ YouTube',  colors: ['#ff0000','#ffffff','#000000','#282828','#aaaaaa'] },
  { label: '🎮 Gaming',  colors: ['#00ff88','#7c3aed','#000000','#1a1a2e','#ff00ff'] },
  { label: '😱 Drama',   colors: ['#cc0000','#000000','#ffffff','#1a0000','#ff4444'] },
  { label: '🤍 Clean',   colors: ['#ffffff','#f5f5f5','#222222','#888888','#4f46e5'] },
  { label: '🌅 Warm',    colors: ['#f59e0b','#ef4444','#ffffff','#1a0a00','#facc15'] },
  { label: '🌊 Cool',    colors: ['#0ea5e9','#6366f1','#ffffff','#0a0a1a','#00d2ff'] },
]

const RECENT_KEY = 'miansnap_recent_colors'

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function addRecent(color) {
  const prev = getRecent().filter(c => c !== color)
  const next = [color, ...prev].slice(0, 8)
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch {}
}

export default function ColorSystem({ onColorSelect, activeColor = '#ffffff', label = 'Color' }) {
  const { theme } = useUIStore()
  const [recent, setRecent] = useState(getRecent)
  const [hex, setHex] = useState(activeColor)
  const [openPalette, setOpenPalette] = useState(null)

  function pick(color) {
    addRecent(color)
    setRecent(getRecent())
    setHex(color)
    onColorSelect?.(color)
  }

  const s = {
    wrap: { marginBottom: 12 },
    label: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 600 },
    swatchRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
    swatch: (color, active) => ({
      width: 24, height: 24, borderRadius: 5, background: color,
      cursor: 'pointer', flexShrink: 0,
      border: active ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
      boxShadow: active ? `0 0 0 2px ${theme.accentGlow}` : 'none',
      transition: 'transform 0.1s',
    }),
    paletteRow: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 },
    paletteBtn: (active) => ({
      padding: '3px 8px', borderRadius: 5, fontSize: 10, cursor: 'pointer',
      border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentGlow : theme.bgTertiary,
      color: active ? theme.accent : theme.textMuted,
      transition: 'all 0.15s',
    }),
    paletteColors: { display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' },
    hexRow: { display: 'flex', gap: 6, alignItems: 'center' },
    hexInput: {
      flex: 1, background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      color: theme.text, borderRadius: 5, padding: '5px 8px', fontSize: 11,
      outline: 'none', fontFamily: 'monospace',
    },
    colorPicker: {
      width: 32, height: 30, borderRadius: 5, border: `1px solid ${theme.border}`,
      cursor: 'pointer', padding: 2, background: theme.bgTertiary,
    },
    sectionLabel: { fontSize: 9, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4, marginTop: 8 },
  }

  const activePalette = PALETTES.find(p => p.label === openPalette)

  return (
    <div style={s.wrap}>
      <div style={s.label}>{label}</div>

      {/* Palette selector */}
      <div style={s.paletteRow}>
        {PALETTES.map(p => (
          <button key={p.label} style={s.paletteBtn(openPalette === p.label)}
            onClick={() => setOpenPalette(openPalette === p.label ? null : p.label)}
          >{p.label}</button>
        ))}
      </div>

      {/* Palette colors */}
      {activePalette && (
        <div style={s.paletteColors}>
          {activePalette.colors.map(c => (
            <div key={c} style={s.swatch(c, hex === c)}
              onClick={() => pick(c)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            />
          ))}
        </div>
      )}

      {/* Recent colors */}
      {recent.length > 0 && (
        <>
          <div style={s.sectionLabel}>Recent</div>
          <div style={s.swatchRow}>
            {recent.map(c => (
              <div key={c} style={s.swatch(c, hex === c)}
                onClick={() => pick(c)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
              />
            ))}
          </div>
        </>
      )}

      {/* HEX input + color picker */}
      <div style={s.hexRow}>
        <input
          style={s.hexInput}
          value={hex}
          onChange={(e) => { setHex(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) pick(e.target.value) }}
          placeholder="#ffffff"
          maxLength={7}
        />
        <input type="color" style={s.colorPicker} value={hex.startsWith('#') && hex.length === 7 ? hex : '#ffffff'}
          onChange={(e) => pick(e.target.value)} title="Custom color" />
      </div>
    </div>
  )
}
