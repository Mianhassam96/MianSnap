import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { fabric } from '../lib/fabric'
import { applyThumbnailStyle } from '../utils/thumbnailStyles'
import { getSmartTextPosition } from '../utils/smartPlacement'

const IDEAS = [
  { idea: 'I tried this for 30 days...', style: 'dramatic', mood: '😱 Shocking', title: 'I TRIED THIS FOR 30 DAYS (results shocked me)' },
  { idea: 'The secret nobody tells you', style: 'viral', mood: '🤫 Curiosity', title: 'THE SECRET NOBODY TELLS YOU ABOUT THIS' },
  { idea: 'This changed everything for me', style: 'mrbeast', mood: '🔥 Emotional', title: 'THIS ONE THING CHANGED MY ENTIRE LIFE' },
  { idea: 'I made $10,000 doing this', style: 'money', mood: '💰 Money', title: 'HOW I MADE $10,000 IN 30 DAYS (step by step)' },
  { idea: 'The easiest way to do this', style: 'tutorial', mood: '📚 Tutorial', title: 'THE EASIEST WAY TO DO THIS (nobody shows this)' },
  { idea: 'Why everyone is wrong about this', style: 'news', mood: '📰 Controversy', title: 'WHY EVERYONE IS WRONG ABOUT THIS' },
  { idea: 'I almost quit... then this happened', style: 'dramatic', mood: '💔 Drama', title: 'I ALMOST QUIT... THEN THIS HAPPENED' },
  { idea: 'The truth about this topic', style: 'viral', mood: '⚡ Truth Bomb', title: 'THE TRUTH ABOUT THIS (they don\'t want you to know)' },
  { idea: 'Watch what happens when I do this', style: 'gaming', mood: '🎮 Reaction', title: 'WATCH WHAT HAPPENS WHEN I DO THIS...' },
  { idea: 'This is the best method I found', style: 'tutorial', mood: '🏆 Best Of', title: 'THE BEST METHOD I FOUND (after 100 hours of testing)' },
  { idea: 'Nobody expected this result', style: 'mrbeast', mood: '😳 Surprise', title: 'NOBODY EXPECTED THIS RESULT...' },
  { idea: 'I tested every method so you don\'t have to', style: 'tutorial', mood: '🔬 Research', title: 'I TESTED EVERY METHOD SO YOU DON\'T HAVE TO' },
]

export default function IdeaStarter() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [current, setCurrent] = useState(null)
  const [applied, setApplied] = useState(false)

  function getIdea() {
    const idx = Math.floor(Math.random() * IDEAS.length)
    setCurrent(IDEAS[idx])
    setApplied(false)
  }

  function applyIdea() {
    if (!current || !fabricCanvas) return
    applyThumbnailStyle(fabricCanvas, current.style)
    // Add the title text on top
    fabricCanvas.getObjects().filter(o => o._ideaText).forEach(o => fabricCanvas.remove(o))
    const pos = getSmartTextPosition(fabricCanvas)
    const text = new fabric.IText(current.title, {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height * 0.82,
      originX: 'center', originY: 'center',
      fontFamily: 'Impact',
      fontSize: 64,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 3,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 20, offsetX: 2, offsetY: 2 }),
      _ideaText: true,
    })
    fabricCanvas.add(text)
    fabricCanvas.renderAll()
    setApplied(true)
    window.showToast?.(`💡 Idea applied: ${current.mood}`, 'success')
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>
        💡 Idea Starter
      </div>

      <button
        onClick={getIdea}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
          color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          marginBottom: 8, transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        💡 Get Thumbnail Idea
      </button>

      {current && (
        <div style={{
          borderRadius: 8, border: `1px solid ${theme.border}`,
          background: theme.bgTertiary, padding: '10px 12px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ fontSize: 11, color: theme.text, fontWeight: 600, lineHeight: 1.4 }}>
            "{current.idea}"
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: theme.accentGlow, color: theme.accent, fontWeight: 600 }}>
              {current.mood}
            </span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: theme.bgSecondary, color: theme.textMuted, border: `1px solid ${theme.border}` }}>
              {current.style} style
            </span>
          </div>
          <div style={{ fontSize: 10, color: theme.textSecondary, lineHeight: 1.4, fontStyle: 'italic' }}>
            "{current.title}"
          </div>
          <button
            onClick={applyIdea}
            style={{
              padding: '7px 12px', borderRadius: 6, border: 'none',
              background: applied ? 'linear-gradient(135deg,#16a34a,#15803d)' : `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
              color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {applied ? '✓ Applied!' : '⚡ Apply to Canvas'}
          </button>
        </div>
      )}
    </div>
  )
}
