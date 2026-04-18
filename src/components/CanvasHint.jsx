import { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'

const SEEN_KEY = 'miansnap_hints_seen'

function getSeenHints() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') } catch { return {} }
}
function markSeen(id) {
  try {
    const seen = getSeenHints()
    seen[id] = 1
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen))
  } catch {}
}

export default function CanvasHint() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const { videoUrl } = useVideoStore()
  const [hint, setHint] = useState(null)

  function showHint(id, icon, text) {
    const seen = getSeenHints()
    if (seen[id]) return
    setHint({ id, icon, text })
    setTimeout(() => {
      setHint(null)
      markSeen(id)
    }, 3500)
  }

  // First image loaded
  useEffect(() => {
    if (!videoUrl) return
    const t = setTimeout(() => showHint('first_image', '🖼', 'Drag image anywhere to replace background · Hold Shift to add as layer'), 1200)
    return () => clearTimeout(t)
  }, [videoUrl])

  // First text added
  useEffect(() => {
    if (!fabricCanvas) return
    const onAdded = (e) => {
      const obj = e.target
      if (obj?.type === 'i-text' || obj?.type === 'textbox') {
        showHint('first_text', '✏️', 'Double-click any text to edit it instantly')
      } else if (obj?.type === 'image') {
        showHint('first_layer', '🖼', 'Double-click image to swap it · Drag to reposition')
      }
    }
    fabricCanvas.on('object:added', onAdded)
    return () => fabricCanvas.off('object:added', onAdded)
  }, [fabricCanvas])

  if (!hint) return null

  return (
    <div style={{
      position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)',
      zIndex: 18, pointerEvents: 'none',
      animation: 'fadeInDown 0.25s ease',
    }}>
      <div style={{
        background: theme.isDark ? 'rgba(13,13,24,0.93)' : 'rgba(255,255,255,0.93)',
        border: `1px solid ${theme.borderHover}`,
        borderRadius: 20, padding: '7px 18px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', gap: 8,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontSize: 15 }}>{hint.icon}</span>
        <span style={{ fontSize: 12, color: theme.text, fontWeight: 500 }}>{hint.text}</span>
      </div>
    </div>
  )
}
