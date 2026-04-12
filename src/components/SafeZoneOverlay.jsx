import React from 'react'
import useStore from '../store/useStore'

// Safe zone definitions as % of canvas dimensions
const SAFE_ZONES = {
  youtube: {
    label: 'YouTube',
    zones: [
      { label: 'Title Safe', x: 0.05, y: 0.05, w: 0.90, h: 0.90, color: 'rgba(255,200,0,0.5)' },
      { label: 'Action Safe', x: 0.025, y: 0.025, w: 0.95, h: 0.95, color: 'rgba(0,200,255,0.3)' },
    ],
  },
  tiktok: {
    label: 'TikTok',
    zones: [
      { label: 'UI Safe (top)', x: 0, y: 0, w: 1, h: 0.12, color: 'rgba(255,0,80,0.25)' },
      { label: 'UI Safe (bottom)', x: 0, y: 0.75, w: 1, h: 0.25, color: 'rgba(255,0,80,0.25)' },
      { label: 'Content Zone', x: 0.05, y: 0.12, w: 0.90, h: 0.63, color: 'rgba(0,255,128,0.15)' },
    ],
  },
  instagram: {
    label: 'Instagram Reels',
    zones: [
      { label: 'UI Safe (top)', x: 0, y: 0, w: 1, h: 0.10, color: 'rgba(200,0,255,0.25)' },
      { label: 'UI Safe (bottom)', x: 0, y: 0.80, w: 1, h: 0.20, color: 'rgba(200,0,255,0.25)' },
      { label: 'Content Zone', x: 0.05, y: 0.10, w: 0.90, h: 0.70, color: 'rgba(255,150,0,0.15)' },
    ],
  },
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  platformRow: { display: 'flex', gap: 6 },
  btn: {
    flex: 1,
    padding: '7px 0',
    borderRadius: 6,
    border: '1px solid #333',
    background: '#111',
    color: '#aaa',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnActive: { background: '#7c3aed', color: '#fff', borderColor: '#7c3aed' },
  toggle: {
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid #333',
    background: '#111',
    color: '#aaa',
    fontSize: 13,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.15s',
  },
  toggleActive: { background: '#1a1a2e', color: '#7c3aed', borderColor: '#7c3aed' },
  legend: { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#888' },
  dot: { width: 10, height: 10, borderRadius: 2, flexShrink: 0 },
}

export default function SafeZoneOverlay({ overlayRef }) {
  const { activePlatform, setActivePlatform, showSafeZone, toggleSafeZone } = useStore()
  const zones = SAFE_ZONES[activePlatform]?.zones || []

  return (
    <div style={styles.wrap}>
      <div style={styles.platformRow}>
        {Object.entries(SAFE_ZONES).map(([key, val]) => (
          <button
            key={key}
            style={{ ...styles.btn, ...(activePlatform === key ? styles.btnActive : {}) }}
            onClick={() => setActivePlatform(key)}
          >
            {val.label}
          </button>
        ))}
      </div>

      <button
        style={{ ...styles.toggle, ...(showSafeZone ? styles.toggleActive : {}) }}
        onClick={toggleSafeZone}
      >
        {showSafeZone ? '✓ Safe Zones ON' : 'Show Safe Zones'}
      </button>

      {showSafeZone && (
        <div style={styles.legend}>
          {zones.map((z, i) => (
            <div key={i} style={styles.legendItem}>
              <div style={{ ...styles.dot, background: z.color }} />
              {z.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Export zones data for canvas overlay rendering
export { SAFE_ZONES }
