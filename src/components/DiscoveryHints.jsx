import React, { useState, useEffect } from 'react'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

const HINTS = [
  { id: 'bg_remove', msg: '💡 Select an image → "Remove BG" appears above it', delay: 15000 },
  { id: 'quick_mode', msg: '🚀 Try Quick Mode in Styles tab — 1-click thumbnail', delay: 25000 },
  { id: 'ab_test', msg: '🧪 A/B Generator creates 3 color variants for CTR testing', delay: 40000 },
  { id: 'before_after', msg: '↔ Before/After tab shows your improvement after Make Viral', delay: 55000 },
  { id: 'face_focus', msg: '🎯 Text tab → Face Auto-Focus repositions image to rule-of-thirds', delay: 70000 },
]

const SEEN_KEY = 'miansnap_hints_seen'

function getSeenHints() {
  try {
    const raw = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
    // Handle both legacy array format and current object format
    if (Array.isArray(raw)) {
      const obj = {}
      raw.forEach(id => { obj[id] = 1 })
      return obj
    }
    return raw && typeof raw === 'object' ? raw : {}
  } catch { return {} }
}
function markSeen(id) {
  try {
    const seen = getSeenHints()
    seen[id] = 1
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {}
}

export default function DiscoveryHints() {
  const { theme } = useUIStore()
  const { videoUrl } = useVideoStore()
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    // Only show hints after user has loaded a video (engaged)
    if (!videoUrl) return
    const seen = getSeenHints()
    const unseen = HINTS.filter(h => !seen[h.id])
    if (!unseen.length) return

    const timers = unseen.map(hint =>
      setTimeout(() => {
        setCurrent(hint)
        markSeen(hint.id)
        setTimeout(() => setCurrent(null), 5000)
      }, hint.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [videoUrl])

  if (!current) return null

  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 11, pointerEvents: 'none',
      animation: 'fadeInDown 0.3s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 20,
        background: theme.isDark ? 'rgba(13,13,24,0.95)' : 'rgba(255,255,255,0.95)',
        border: `1px solid ${theme.borderHover}`,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        fontSize: 12, color: theme.text, fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        {current.msg}
      </div>
    </div>
  )
}
