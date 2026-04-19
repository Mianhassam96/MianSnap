import React, { useState, useRef } from 'react'
import useUIStore from '../store/useUIStore'
import BackgroundPanel from './BackgroundPanel'
import FiltersPanel from './FiltersPanel'
import ShapesPanel from './ShapesPanel'
import OneClickStyles from './OneClickStyles'
import MakeItViral from './MakeItViral'
import QuickMode from './QuickMode'
import ColorSystem from './ColorSystem'
import useCanvasStore from '../store/useCanvasStore'
import { fabric } from '../lib/fabric'
import { prefs } from '../utils/prefs'
import { getSmartTextPosition } from '../utils/smartPlacement'

// Snap heights as % of viewport
const SNAP_HALF = 0.5
const SNAP_FULL = 0.88

export default function MobileDrawer({ open, onClose }) {
  const { theme, activeLeftPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [snapLevel, setSnapLevel] = useState(SNAP_HALF)
  const startY = useRef(null)
  const startSnap = useRef(SNAP_HALF)
  const [textColor, setTextColor] = useState(() => prefs.getBrandColor())
  const [fontSize, setFontSize] = useState(() => prefs.getBrandFontSize())

  function addQuickText(type) {
    if (!fabricCanvas) return
    const configs = {
      heading:    { content: 'YOUR TITLE HERE', size: 88, font: 'Impact', fill: '#ffff00', stroke: '#000', strokeWidth: 4 },
      subheading: { content: 'Watch until the end...', size: 52, font: 'Oswald', fill: '#ffffff', stroke: '#000', strokeWidth: 2 },
      small:      { content: 'Tap to edit', size: 32, font: 'Poppins', fill: '#ffffff', stroke: 'transparent', strokeWidth: 0 },
    }
    const c = configs[type]
    const pos = getSmartTextPosition(fabricCanvas)
    const text = new fabric.IText(c.content, {
      ...pos, fontFamily: c.font, fontSize: c.size,
      fill: c.fill, stroke: c.stroke, strokeWidth: c.strokeWidth,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 16, offsetX: 2, offsetY: 2 }),
    })
    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    text.enterEditing(); text.selectAll()
    fabricCanvas.renderAll()
    onClose()
  }

  function onTouchStart(e) {
    startY.current = e.touches[0].clientY
    startSnap.current = snapLevel
  }

  function onTouchEnd(e) {
    if (startY.current === null) return
    const dy = startY.current - e.changedTouches[0].clientY
    if (dy > 40) setSnapLevel(SNAP_FULL)       // swipe up → expand
    else if (dy < -40) {
      if (snapLevel === SNAP_FULL) setSnapLevel(SNAP_HALF) // swipe down → half
      else onClose()                                        // swipe down from half → close
    }
    startY.current = null
  }

  if (!open) return null

  const drawerH = `${Math.round(snapLevel * 100)}vh`

  const panelMap = {
    text: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>Quick Add Text</div>
        {[
          { type: 'heading', label: '🔥 Viral Heading', hint: 'Yellow Impact · 88px' },
          { type: 'subheading', label: '📝 Subheading', hint: 'White Oswald · 52px' },
          { type: 'small', label: '✏️ Small Text', hint: 'White Poppins · 32px' },
        ].map(({ type, label, hint }) => (
          <button key={type}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 10,
              border: `1px solid ${theme.border}`, background: theme.bgTertiary,
              color: theme.text, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.15s',
            }}
            onClick={() => addQuickText(type)}
          >
            <span>{label}</span>
            <span style={{ fontSize: 10, color: theme.textMuted }}>{hint}</span>
          </button>
        ))}
        <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 4, textAlign: 'center' }}>
          Tap any to add · double-tap on canvas to edit
        </div>
      </div>
    ),
    bg:      <BackgroundPanel />,
    filters: <FiltersPanel />,
    shapes:  <ShapesPanel />,
    styles: (
      <>
        <div style={{
          padding: '10px 12px', borderRadius: 10, marginBottom: 12,
          background: 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(99,102,241,0.15))',
          border: `1px solid rgba(99,102,241,0.3)`,
          fontSize: 11, color: theme.accent, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>🚀</span>
          <span>Try Quick Mode — 1-click thumbnail</span>
        </div>
        <QuickMode />
        <MakeItViral />
        <OneClickStyles />
      </>
    ),
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 190,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        animation: 'fadeIn 0.18s ease',
      }} />

      {/* Drawer */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'fixed', bottom: 60, left: 0, right: 0,
          height: drawerH, zIndex: 195,
          background: theme.bgSecondary,
          borderTop: `1px solid ${theme.border}`,
          borderRadius: '18px 18px 0 0',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -12px 48px rgba(0,0,0,0.35)',
          transition: 'height 0.22s cubic-bezier(0.4,0,0.2,1)',
          animation: 'slideUp 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: theme.border,
          }} />
        </div>

        {/* Panel title */}
        <div style={{
          padding: '0 16px 10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.text, textTransform: 'capitalize' }}>
            {activeLeftPanel}
          </span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 6,
            border: `1px solid ${theme.border}`,
            background: theme.bgTertiary, color: theme.textMuted,
            cursor: 'pointer', fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
          {panelMap[activeLeftPanel] || (
            <div style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 24 }}>
              Select a tool from the tab bar below
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
