import React, { useState, useEffect } from 'react'
import { fabric } from '../lib/fabric'
import useCanvasStore from '../store/useCanvasStore'
import useUIStore from '../store/useUIStore'
import useVideoStore from '../store/useVideoStore'

const SUGGESTIONS = {
  reaction:    ["YOU WON'T BELIEVE THIS 😱", "I CAN'T BELIEVE IT...", "THIS CHANGED EVERYTHING", "SHOCKING TRUTH REVEALED", "WAIT FOR IT... 😳"],
  gaming:      ["INSANE PLAY! 🎮", "1 vs 100 CLUTCH", "WORLD RECORD BROKEN", "IMPOSSIBLE SHOT!", "THEY DIDN'T SEE IT COMING"],
  news:        ["BREAKING NEWS 🔴", "JUST HAPPENED...", "NOBODY EXPECTED THIS", "URGENT UPDATE", "EVERYTHING CHANGED TODAY"],
  motivational:["THIS WILL CHANGE YOUR LIFE", "WATCH THIS EVERY MORNING", "THE SECRET NOBODY TELLS YOU", "DO THIS FOR 30 DAYS", "STOP WASTING YOUR TIME"],
  curiosity:   ["WHY NOBODY TALKS ABOUT THIS", "THE TRUTH ABOUT...", "WHAT THEY DON'T WANT YOU TO KNOW", "I TRIED IT FOR 7 DAYS...", "THE REAL REASON WHY..."],
  action:      ["EPIC MOMENT!", "INSANE SPEED", "WATCH THIS CLOSELY", "UNBELIEVABLE REACTION", "NOBODY SAW THIS COMING"],
  dramatic:    ["EVERYTHING CHANGED", "THE MOMENT IT ALL WENT WRONG", "I ALMOST QUIT...", "THIS BROKE ME", "THE TRUTH HURTS"],
}

const CATEGORIES = [
  { id: 'reaction',     label: '😱 Reaction' },
  { id: 'gaming',       label: '🎮 Gaming' },
  { id: 'news',         label: '📰 News' },
  { id: 'motivational', label: '💪 Motivational' },
  { id: 'curiosity',    label: '🤔 Curiosity' },
  { id: 'action',       label: '⚡ Action' },
  { id: 'dramatic',     label: '🎭 Dramatic' },
]

// Detect best category from canvas/frame context
function detectContext(fabricCanvas, selectedFrame) {
  if (!fabricCanvas) return null
  try {
    const bg = fabricCanvas.backgroundImage
    if (!bg) return null
    const off = document.createElement('canvas')
    off.width = 160; off.height = 90
    const ctx = off.getContext('2d')
    bg.render(ctx)
    const d = ctx.getImageData(0, 0, 160, 90).data
    let brightness = 0, skin = 0, motion = 0
    for (let i = 0; i < d.length; i += 16) {
      const r = d[i], g = d[i+1], b = d[i+2]
      brightness += r * 0.299 + g * 0.587 + b * 0.114
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r-g) > 15) skin++
    }
    brightness /= (d.length / 16)
    const score = selectedFrame?.score ?? 50
    if (score > 70) return 'action'
    if (skin > 60) return 'reaction'
    if (brightness < 60) return 'dramatic'
    return 'reaction'
  } catch { return null }
}

export default function SmartTextSuggestions() {
  const { fabricCanvas } = useCanvasStore()
  const { theme } = useUIStore()
  const { selectedFrame } = useVideoStore()
  const [activeCategory, setActiveCategory] = useState('reaction')
  const [autoDetected, setAutoDetected] = useState(null)

  // Auto-detect context when frame changes
  useEffect(() => {
    if (!fabricCanvas || !selectedFrame) return
    const detected = detectContext(fabricCanvas, selectedFrame)
    if (detected) {
      setAutoDetected(detected)
      setActiveCategory(detected)
    }
  }, [selectedFrame, fabricCanvas])

  function addSuggestion(text) {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('text', text)
      fabricCanvas.renderAll()
      window.showToast?.('Text updated', 'success', 1500)
    } else {
      const t = new fabric.IText(text, {
        left: fabricCanvas.width / 2,
        top: fabricCanvas.height * 0.8,
        originX: 'center', originY: 'center',
        fontFamily: 'Impact', fontSize: 72,
        fill: '#ffffff', stroke: '#000000', strokeWidth: 3,
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 16, offsetX: 2, offsetY: 2 }),
      })
      fabricCanvas.add(t)
      fabricCanvas.setActiveObject(t)
      fabricCanvas.renderAll()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          Smart Text Suggestions
        </div>
        {autoDetected && (
          <span style={{ fontSize: 9, color: theme.accent, background: theme.accentGlow, padding: '2px 6px', borderRadius: 4, border: `1px solid ${theme.borderHover}` }}>
            🧠 Auto
          </span>
        )}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.id}
            style={{
              padding: '3px 8px', borderRadius: 5, fontSize: 10, cursor: 'pointer',
              border: `1px solid ${activeCategory === c.id ? theme.accent : theme.border}`,
              background: activeCategory === c.id ? theme.accentGlow : theme.bgTertiary,
              color: activeCategory === c.id ? theme.accent : theme.textMuted,
              fontWeight: activeCategory === c.id ? 600 : 400,
              transition: 'all 0.15s',
              position: 'relative',
            }}
            onClick={() => { setActiveCategory(c.id); setAutoDetected(null) }}
          >
            {c.label}
            {c.id === autoDetected && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 6, height: 6, borderRadius: '50%', background: theme.accent }} />
            )}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      {SUGGESTIONS[activeCategory].map((text, i) => (
        <button key={i}
          style={{
            width: '100%', padding: '8px 10px', borderRadius: 6,
            border: `1px solid ${theme.border}`, background: theme.bg,
            color: theme.text, fontSize: 11, cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.15s', lineHeight: 1.4,
          }}
          onClick={() => addSuggestion(text)}
          onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentGlow; e.currentTarget.style.borderColor = theme.borderHover }}
          onMouseLeave={(e) => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.borderColor = theme.border }}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
