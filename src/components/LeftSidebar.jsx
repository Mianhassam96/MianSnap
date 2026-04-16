import React, { useState } from 'react'
import { fabric } from '../lib/fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import { faceAutoFocus, amplifyEmotion, resetFilters } from '../utils/faceDetect'
import { prefs } from '../utils/prefs'
import CreatorPacks from './CreatorPacks'
import SafeZoneOverlay from './SafeZoneOverlay'
import AssetManager from './AssetManager'
import OneClickStyles from './OneClickStyles'
import ABGenerator from './ABGenerator'
import MakeItViral from './MakeItViral'
import SmartTextSuggestions from './SmartTextSuggestions'
import BackgroundPanel from './BackgroundPanel'
import QuickMode from './QuickMode'
import ShapesPanel from './ShapesPanel'
import FiltersPanel from './FiltersPanel'
import ColorSystem from './ColorSystem'

const TOOLS = [
  { id: 'text',    icon: '𝐓',  label: 'Text' },
  { id: 'shapes',  icon: '◻',  label: 'Shapes' },
  { id: 'filters', icon: '✨',  label: 'Filters' },
  { id: 'bg',      icon: '🖼',  label: 'BG' },
  { id: 'styles',  icon: '⚡',  label: 'Styles' },
  { id: 'assets',  icon: '📁',  label: 'Assets' },
]

const FONT_CATEGORIES = [
  {
    label: '🔥 Impact / Bold',
    fonts: [
      { name: 'Bebas Neue', preview: 'BEBAS NEUE' },
      { name: 'Anton', preview: 'ANTON' },
      { name: 'Black Han Sans', preview: 'BLACK HAN' },
      { name: 'Bangers', preview: 'Bangers!' },
      { name: 'Teko', preview: 'TEKO BOLD' },
      { name: 'Oswald', preview: 'OSWALD' },
      { name: 'Barlow Condensed', preview: 'BARLOW' },
      { name: 'Russo One', preview: 'RUSSO ONE' },
    ],
  },
  {
    label: '✨ Display / Creative',
    fonts: [
      { name: 'Righteous', preview: 'Righteous' },
      { name: 'Permanent Marker', preview: 'Marker Style' },
      { name: 'Pacifico', preview: 'Pacifico' },
      { name: 'Fredoka One', preview: 'Fredoka One' },
      { name: 'Boogaloo', preview: 'Boogaloo' },
      { name: 'Abril Fatface', preview: 'Abril Fatface' },
    ],
  },
  {
    label: '💎 Premium / Elegant',
    fonts: [
      { name: 'Playfair Display', preview: 'Playfair Display' },
      { name: 'Cinzel', preview: 'CINZEL' },
      { name: 'Merriweather', preview: 'Merriweather' },
      { name: 'Raleway', preview: 'Raleway' },
      { name: 'Montserrat', preview: 'Montserrat' },
    ],
  },
  {
    label: '⚡ Modern / Clean',
    fonts: [
      { name: 'Poppins', preview: 'Poppins' },
      { name: 'Nunito', preview: 'Nunito' },
      { name: 'Exo 2', preview: 'Exo 2' },
      { name: 'Lato', preview: 'Lato' },
      { name: 'Roboto Condensed', preview: 'Roboto Condensed' },
      { name: 'Source Sans 3', preview: 'Source Sans' },
    ],
  },
  {
    label: '🌙 Arabic & Urdu',
    fonts: [
      { name: 'Noto Nastaliq Urdu', preview: 'نستعلیق اردو' },
      { name: 'Noto Naskh Arabic', preview: 'نسخ عربي' },
      { name: 'Noto Kufi Arabic', preview: 'كوفي عربي' },
      { name: 'Amiri', preview: 'أميري كلاسيك' },
      { name: 'Scheherazade New', preview: 'شهرزاد' },
      { name: 'Lateef', preview: 'لطيف اردو' },
      { name: 'Reem Kufi', preview: 'ريم كوفي' },
      { name: 'Cairo', preview: 'القاهرة' },
      { name: 'Tajawal', preview: 'تجوال عصري' },
      { name: 'Almarai', preview: 'المراعي' },
    ],
  },
]

const PRESET_COLORS = [
  '#ffffff', '#000000', '#ffff00', '#ff3300', '#00ffcc',
  '#ff00ff', '#4488ff', '#ff8800', '#00ff44', '#ff4488',
  '#7c3aed', '#facc15', '#f87171', '#4ade80', '#60a5fa',
]

export default function LeftSidebar() {
  const { theme, activeLeftPanel, setActiveLeftPanel } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [textColor, setTextColor] = useState('#ffffff')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fontSize, setFontSize] = useState(64)
  const [openCategory, setOpenCategory] = useState(0)

  function addText(fontName) {
    if (!fabricCanvas) return
    prefs.setLastFont(fontName) // remember last used font
    const text = new fabric.IText('Your Text Here', {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height / 2,
      originX: 'center', originY: 'center',
      fontFamily: fontName,
      fontSize,
      fill: textColor,
      stroke: strokeColor,
      strokeWidth: strokeColor === 'transparent' ? 0 : 2,
      shadow: { color: 'rgba(0,0,0,0.8)', blur: 12, offsetX: 2, offsetY: 2 },
    })
    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    fabricCanvas.renderAll()
  }

  function updateSelectedTextColor(color) {
    setTextColor(color)
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('fill', color)
      fabricCanvas.renderAll()
    }
  }

  function updateSelectedStrokeColor(color) {
    setStrokeColor(color)
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set({ stroke: color, strokeWidth: 2 })
      fabricCanvas.renderAll()
    }
  }

  function updateFontSize(size) {
    setFontSize(size)
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj && (obj.type === 'i-text' || obj.type === 'textbox')) {
      obj.set('fontSize', size)
      fabricCanvas.renderAll()
    }
  }

  function addShape(type) {
    if (!fabricCanvas) return
    const cx = fabricCanvas.width / 2
    const cy = fabricCanvas.height / 2
    const shapeMap = {
      rect: new fabric.Rect({ left: cx - 80, top: cy - 40, width: 160, height: 80, fill: 'rgba(124,58,237,0.75)', rx: 8, ry: 8 }),
      circle: new fabric.Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: 'rgba(79,70,229,0.75)' }),
      triangle: new fabric.Triangle({ left: cx - 40, top: cy - 40, width: 80, height: 80, fill: '#f87171' }),
      line: new fabric.Line([cx - 80, cy, cx + 80, cy], { stroke: '#7c3aed', strokeWidth: 5 }),
      arrow: new fabric.Triangle({ left: cx - 30, top: cy - 40, width: 60, height: 80, fill: '#facc15', angle: 90 }),
    }
    const shape = shapeMap[type]
    if (shape) { fabricCanvas.add(shape); fabricCanvas.setActiveObject(shape); fabricCanvas.renderAll() }
  }

  const s = {
    sidebar: {
      width: 240, background: theme.bgSecondary, borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
      boxShadow: theme.isDark ? 'none' : '2px 0 12px rgba(100,80,200,0.06)',
    },
    tabs: { display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0, background: theme.bgTertiary },
    tab: (active) => ({
      flex: 1, padding: '10px 4px', fontSize: 10, textAlign: 'center',
      cursor: 'pointer', border: 'none', lineHeight: 1.4, transition: 'all 0.15s',
      background: active ? theme.bgSecondary : 'transparent',
      color: active ? theme.accent : theme.textMuted,
      borderBottom: `2px solid ${active ? theme.accent : 'transparent'}`,
      fontWeight: active ? 600 : 400,
    }),
    content: { flex: 1, overflowY: 'auto', padding: 12 },
    sectionTitle: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 600 },
    section: { marginBottom: 14 },
    label: { fontSize: 10, color: theme.textMuted, marginBottom: 4, display: 'block' },
    row: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 },
    colorSwatch: (color, active) => ({
      width: 22, height: 22, borderRadius: 4, background: color, cursor: 'pointer', flexShrink: 0,
      border: active ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
      boxShadow: active ? `0 0 0 2px ${theme.accentGlow}` : 'none',
      transition: 'transform 0.1s',
    }),
    colorInput: {
      width: 32, height: 28, borderRadius: 5, border: `1px solid ${theme.border}`,
      cursor: 'pointer', padding: 2, background: theme.bgTertiary,
    },
    sizeInput: {
      flex: 1, background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      color: theme.text, borderRadius: 5, padding: '4px 8px', fontSize: 12, outline: 'none',
    },
    sizeRange: { flex: 2, accentColor: theme.accent },
    catHeader: (open) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 4,
      background: open ? theme.accentGlow : theme.bgTertiary,
      border: `1px solid ${open ? theme.borderHover : theme.border}`,
      color: open ? theme.accent : theme.textSecondary,
      fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
    }),
    fontBtn: (font) => ({
      width: '100%', padding: '8px 10px', borderRadius: 6,
      border: `1px solid ${theme.border}`, background: theme.bg,
      color: theme.text, fontSize: 13, fontFamily: font,
      cursor: 'pointer', textAlign: 'left', marginBottom: 3,
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }),
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
    shapeBtn: {
      padding: '14px 8px', borderRadius: 8, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.text, fontSize: 20,
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
    },
    aiBtn: {
      width: '100%', padding: '9px 12px', borderRadius: 7, border: 'none',
      background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4,
    },
    aiStatus: { fontSize: 10, color: theme.accent, padding: '4px 0', textAlign: 'center' },
  }

  const hover = (e, on) => {
    e.currentTarget.style.background = on ? theme.accentGlow : theme.bgTertiary
    e.currentTarget.style.borderColor = on ? theme.borderHover : theme.border
  }

  return (
    <div style={s.sidebar}>
      <div style={s.tabs}>
        {TOOLS.map((t) => (
          <button key={t.id} style={s.tab(activeLeftPanel === t.id)} onClick={() => setActiveLeftPanel(t.id)}>
            <div style={{ fontSize: 15, marginBottom: 2 }}>{t.icon}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      <div style={s.content}>

        {/* ── TEXT PANEL ── */}
        {activeLeftPanel === 'text' && (
          <>
            <div style={s.section}>
              <ColorSystem
                label="Text Color"
                activeColor={textColor}
                onColorSelect={updateSelectedTextColor}
              />
              <ColorSystem
                label="Stroke Color"
                activeColor={strokeColor}
                onColorSelect={updateSelectedStrokeColor}
              />
              <div style={s.sectionTitle}>Font Size</div>
              <div style={s.row}>
                <input type="range" style={s.sizeRange} min={12} max={200} value={fontSize}
                  onChange={(e) => updateFontSize(+e.target.value)} />
                <input type="number" style={{ ...s.sizeInput, width: 52 }} min={12} max={400}
                  value={fontSize} onChange={(e) => updateFontSize(+e.target.value)} />
              </div>
            </div>

            {/* Font categories */}
            <div style={s.section}>
              <div style={s.sectionTitle}>35 Premium Fonts</div>
              {FONT_CATEGORIES.map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 6 }}>
                  <div style={s.catHeader(openCategory === ci)} onClick={() => setOpenCategory(openCategory === ci ? -1 : ci)}>
                    <span>{cat.label}</span>
                    <span>{openCategory === ci ? '▲' : '▼'}</span>
                  </div>
                  {openCategory === ci && (
                    <div style={{ paddingLeft: 2 }}>
                      {cat.fonts.map((f) => {
                        const isRTL = cat.label.includes('Arabic') || cat.label.includes('Urdu')
                        return (
                          <button key={f.name} style={{ ...s.fontBtn(f.name), direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
                            onClick={() => addText(f.name)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = theme.accentGlow; e.currentTarget.style.borderColor = theme.borderHover }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = theme.bg; e.currentTarget.style.borderColor = theme.border }}
                          >
                            <span style={{ fontSize: isRTL ? 15 : 13 }}>{f.preview}</span>
                            <span style={{ fontSize: 9, color: theme.textMuted, fontFamily: 'Inter, sans-serif', direction: 'ltr' }}>+</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI */}
            <div style={s.section}>
              <div style={s.sectionTitle}>AI Tools</div>
              <button style={{ ...s.aiBtn, background: `linear-gradient(135deg,#0ea5e9,#6366f1)` }}
                onClick={() => faceAutoFocus(fabricCanvas)}>
                🎯 Face Auto-Focus
              </button>
              <button style={{ ...s.aiBtn, marginTop: 6, background: `linear-gradient(135deg,#f59e0b,#ef4444)` }}
                onClick={() => amplifyEmotion(fabricCanvas)}>
                😎 Emotion Amplifier
              </button>
              <button style={{ ...s.aiBtn, marginTop: 6, background: theme.bgTertiary, color: theme.textSecondary, border: `1px solid ${theme.border}` }}
                onClick={() => resetFilters(fabricCanvas)}>
                ↺ Reset Filters
              </button>
            </div>
          </>
        )}

        {/* ── SHAPES PANEL ── */}
        {activeLeftPanel === 'shapes' && <ShapesPanel />}

        {/* ── FILTERS PANEL ── */}
        {activeLeftPanel === 'filters' && <FiltersPanel />}

        {activeLeftPanel === 'bg' && <BackgroundPanel />}
        {activeLeftPanel === 'styles' && (
          <>
            <QuickMode />
            <MakeItViral />
            <div style={{ marginTop: 4 }}><OneClickStyles /></div>
            <div style={{ marginTop: 16 }}><SmartTextSuggestions /></div>
            <div style={{ marginTop: 16 }}><ABGenerator /></div>
            <div style={{ marginTop: 16 }}><CreatorPacks /></div>
          </>
        )}
        {activeLeftPanel === 'assets' && <AssetManager />}
      </div>
    </div>
  )
}

