import React from 'react'
import useUIStore from '../store/useUIStore'

export const SAFE_ZONES = {
  youtube: {
    label: 'YouTube',
    zones: [
      { label: 'Title Safe', x: 0.05, y: 0.05, w: 0.90, h: 0.90, color: 'rgba(255,200,0,0.25)' },
      { label: 'Action Safe', x: 0.025, y: 0.025, w: 0.95, h: 0.95, color: 'rgba(0,200,255,0.15)' },
    ],
  },
  tiktok: {
    label: 'TikTok',
    zones: [
      { label: 'UI Top', x: 0, y: 0, w: 1, h: 0.12, color: 'rgba(255,0,80,0.3)' },
      { label: 'UI Bottom', x: 0, y: 0.75, w: 1, h: 0.25, color: 'rgba(255,0,80,0.3)' },
      { label: 'Content Zone', x: 0.05, y: 0.12, w: 0.90, h: 0.63, color: 'rgba(0,255,128,0.1)' },
    ],
  },
  instagram: {
    label: 'Instagram',
    zones: [
      { label: 'UI Top', x: 0, y: 0, w: 1, h: 0.10, color: 'rgba(200,0,255,0.3)' },
      { label: 'UI Bottom', x: 0, y: 0.80, w: 1, h: 0.20, color: 'rgba(200,0,255,0.3)' },
      { label: 'Content Zone', x: 0.05, y: 0.10, w: 0.90, h: 0.70, color: 'rgba(255,150,0,0.1)' },
    ],
  },
}

export default function SafeZoneOverlay() {
  const { theme, activePlatform, setActivePlatform, showSafeZone, toggleSafeZone } = useUIStore()

  const s = {
    section: { marginBottom: 12 },
    label: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    platformRow: { display: 'flex', gap: 4, marginBottom: 8 },
    pBtn: (active) => ({
      flex: 1, padding: '6px 4px', borderRadius: 5, border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentGlow : theme.bgTertiary, color: active ? theme.accent : theme.textMuted,
      fontSize: 10, cursor: 'pointer', transition: 'all 0.15s',
    }),
    toggle: (on) => ({
      width: '100%', padding: '8px', borderRadius: 6,
      border: `1px solid ${on ? theme.accent : theme.border}`,
      background: on ? theme.accentGlow : theme.bgTertiary,
      color: on ? theme.accent : theme.textMuted,
      fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
    }),
    legend: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 },
    legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: theme.textMuted },
    dot: (color) => ({ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }),
  }

  return (
    <div>
      <div style={s.label}>Platform</div>
      <div style={s.platformRow}>
        {Object.entries(SAFE_ZONES).map(([key, val]) => (
          <button key={key} style={s.pBtn(activePlatform === key)} onClick={() => setActivePlatform(key)}>
            {val.label}
          </button>
        ))}
      </div>
      <button style={s.toggle(showSafeZone)} onClick={toggleSafeZone}>
        {showSafeZone ? '✓ Safe Zones ON' : 'Show Safe Zones'}
      </button>
      {showSafeZone && (
        <div style={s.legend}>
          {SAFE_ZONES[activePlatform]?.zones.map((z, i) => (
            <div key={i} style={s.legendItem}>
              <div style={s.dot(z.color)} />
              {z.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
