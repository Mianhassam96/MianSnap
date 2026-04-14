import React, { useState } from 'react'
import { fabric } from 'fabric'
import useCanvasStore from '../store/useCanvasStore'
import useUIStore from '../store/useUIStore'

const SUGGESTIONS = {
  reaction: [
    'YOU WON\'T BELIEVE THIS 😱',
    'I CAN\'T BELIEVE IT...',
    'THIS CHANGED EVERYTHING',
    'SHOCKING TRUTH REVEALED',
    'WAIT FOR IT... 😳',
  ],
  gaming: [
    'INSANE PLAY! 🎮',
    '1 vs 100 CLUTCH',
    'WORLD RECORD BROKEN',
    'IMPOSSIBLE SHOT!',
    'THEY DIDN\'T SEE IT COMING',
  ],
  news: [
    'BREAKING NEWS 🔴',
    'JUST HAPPENED...',
    'NOBODY EXPECTED THIS',
    'URGENT UPDATE',
    'EVERYTHING CHANGED TODAY',
  ],
  motivational: [
    'THIS WILL CHANGE YOUR LIFE',
    'WATCH THIS EVERY MORNING',
    'THE SECRET NOBODY TELLS YOU',
    'DO THIS FOR 30 DAYS',
    'STOP WASTING YOUR TIME',
  ],
  curiosity: [
    'WHY NOBODY TALKS ABOUT THIS',
    'THE TRUTH ABOUT...',
    'WHAT THEY DON\'T WANT YOU TO KNOW',
    'I TRIED IT FOR 7 DAYS...',
    'THE REAL REASON WHY...',
  ],
}

const CATEGORIES = [
  { id: 'reaction', label: '😱 Reaction' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'news', label: '📰 News' },
  { id: 'motivational', label: '💪 Motivational' },
  { id: 'curiosity', label: '🤔 Curiosity' },
]

export default function SmartTextSuggestions() {
  const { fabricCanvas } = useCanvasStore()
  const { theme } = useUIStore()
  const [activeCategory, setActiveCategory] = useState('reaction')

  function addSuggestion(text) {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      // Update existing selected text
      obj.set('text', text)
      fabricCanvas.renderAll()
    } else {
      // Add new text object
      const t = new fabric.IText(text, {
        left: fabricCanvas.width / 2,
        top: fabricCanvas.height * 0.8,
        originX: 'center', originY: 'center',
        fontFamily: 'Impact',
        fontSize: 64,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 3,
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 16, offsetX: 2, offsetY: 2 }),
      })
      fabricCanvas.add(t)
      fabricCanvas.setActiveObject(t)
      fabricCanvas.renderAll()
    }
  }

  const s = {
    wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 },
    desc: { fontSize: 11, color: theme.textSecondary, lineHeight: 1.5 },
    catRow: { display: 'flex', gap: 4, flexWrap: 'wrap' },
    catBtn: (active) => ({
      padding: '4px 8px', borderRadius: 5, fontSize: 10, cursor: 'pointer',
      border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentGlow : theme.bgTertiary,
      color: active ? theme.accent : theme.textMuted,
      transition: 'all 0.15s', fontWeight: active ? 600 : 400,
    }),
    suggBtn: {
      width: '100%', padding: '8px 10px', borderRadius: 6,
      border: `1px solid ${theme.border}`, background: theme.bg,
      color: theme.text, fontSize: 11, cursor: 'pointer', textAlign: 'left',
      transition: 'all 0.15s', lineHeight: 1.4,
    },
  }

  return (
    <div style={s.wrap}>
      <div style={s.title}>Smart Text Suggestions</div>
      <div style={s.desc}>Click to add or replace selected text.</div>
      <div style={s.catRow}>
        {CATEGORIES.map((c) => (
          <button key={c.id} style={s.catBtn(activeCategory === c.id)}
            onClick={() => setActiveCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      {SUGGESTIONS[activeCategory].map((text, i) => (
        <button key={i} style={s.suggBtn}
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
