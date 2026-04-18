import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useLayerStore from '../store/useLayerStore'
import ViralScore from './ViralScore'
import MobilePreview from './MobilePreview'
import BeforeAfter from './BeforeAfter'

export default function RightSidebar() {
  const { theme, activeRightPanel, setActiveRightPanel } = useUIStore()
  const { fabricCanvas, viralScore } = useCanvasStore()
  const { layers, setLayers, selectedId, setSelectedId, toggleVisibility, toggleLock } = useLayerStore()
  const [activeObj, setActiveObj] = useState(null)
  const [compareUpdated, setCompareUpdated] = useState(false)

  // Flash compare tab when BeforeAfter updates
  useEffect(() => {
    const handler = () => {
      if (activeRightPanel !== 'compare') {
        setCompareUpdated(true)
        setTimeout(() => setCompareUpdated(false), 4000)
      }
    }
    window.addEventListener('miansnap:viralDone', handler)
    return () => window.removeEventListener('miansnap:viralDone', handler)
  }, [activeRightPanel])

  // Sync layers from canvas
  useEffect(() => {
    if (!fabricCanvas) return
    const sync = () => {
      const objs = fabricCanvas.getObjects()
      setLayers(objs.map((o, i) => ({
        id: o.__uid || (o.__uid = `layer-${Date.now()}-${i}`),
        name: o.type === 'i-text' || o.type === 'textbox' ? (o.text?.slice(0, 16) || 'Text') : o.type,
        type: o.type,
        visible: o.visible !== false,
        locked: o.selectable === false,
        obj: o,
      })).reverse())
    }
    fabricCanvas.on('object:added', sync)
    fabricCanvas.on('object:removed', sync)
    fabricCanvas.on('object:modified', sync)
    fabricCanvas.on('selection:created', (e) => setActiveObj(e.selected?.[0]))
    fabricCanvas.on('selection:updated', (e) => setActiveObj(e.selected?.[0]))
    fabricCanvas.on('selection:cleared', () => setActiveObj(null))
    sync()
    return () => fabricCanvas.off('object:added', sync)
  }, [fabricCanvas])

  function selectLayer(layer) {
    setSelectedId(layer.id)
    fabricCanvas.setActiveObject(layer.obj)
    fabricCanvas.renderAll()
  }

  function handleToggleVisibility(layer) {
    layer.obj.set('visible', !layer.obj.visible)
    fabricCanvas.renderAll()
    toggleVisibility(layer.id)
  }

  function handleToggleLock(layer) {
    const locked = layer.obj.selectable === false
    layer.obj.set({ selectable: locked, evented: locked })
    fabricCanvas.renderAll()
    toggleLock(layer.id)
  }

  function deleteLayer(layer) {
    fabricCanvas.remove(layer.obj)
    fabricCanvas.renderAll()
  }

  function bringForward(layer) {
    fabricCanvas.bringForward(layer.obj)
    fabricCanvas.renderAll()
  }

  function sendBackward(layer) {
    fabricCanvas.sendBackwards(layer.obj)
    fabricCanvas.renderAll()
  }

  const s = {
    sidebar: {
      width: 220, background: theme.bgSecondary, borderLeft: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
    },
    tabs: { display: 'flex', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 },
    tab: {
      flex: 1, padding: '10px 4px', fontSize: 11, textAlign: 'center',
      cursor: 'pointer', color: theme.textMuted, border: 'none', background: 'none',
      borderBottom: '2px solid transparent', transition: 'all 0.15s',
    },
    tabActive: { color: theme.accent, borderBottom: `2px solid ${theme.accent}` },
    content: { flex: 1, overflowY: 'auto', padding: 10 },
    layerItem: (isSelected) => ({
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px',
      borderRadius: 6, marginBottom: 3, cursor: 'pointer',
      background: isSelected ? theme.accentGlow : 'transparent',
      border: `1px solid ${isSelected ? theme.accent : 'transparent'}`,
      transition: 'all 0.15s',
    }),
    layerIcon: { fontSize: 12, width: 18, textAlign: 'center', flexShrink: 0 },
    layerName: { flex: 1, fontSize: 11, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    iconBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      fontSize: 11, color: theme.textMuted, padding: '1px 3px', flexShrink: 0,
    },
    propRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
    propLabel: { fontSize: 11, color: theme.textMuted, width: 60, flexShrink: 0 },
    propInput: {
      flex: 1, background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      color: theme.text, borderRadius: 4, padding: '4px 6px', fontSize: 11,
    },
    sectionTitle: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  }

  const typeIcon = (type) => {
    if (type === 'i-text' || type === 'textbox') return '𝐓'
    if (type === 'image') return '🖼'
    if (type === 'rect') return '▭'
    if (type === 'circle') return '●'
    if (type === 'triangle') return '▲'
    return '◻'
  }

  return (
    <div style={s.sidebar} className="ms-right-sidebar">
      <div style={s.tabs} role="tablist" aria-label="Right panel tabs">
        {['layers', 'properties', 'score', 'preview', 'compare'].map((p) => (
          <button key={p}
            role="tab"
            aria-selected={activeRightPanel === p}
            aria-label={p === 'score' ? 'Viral Score' : p === 'preview' ? 'Live Preview' : p === 'compare' ? 'Before/After' : p}
            style={{ ...s.tab, ...(activeRightPanel === p ? s.tabActive : {}) }}
            onClick={() => setActiveRightPanel(p)}
            title={p === 'score' ? 'Viral Score' : p === 'preview' ? 'Live Preview' : p === 'compare' ? 'Before/After' : p}
          >
            {p === 'layers' ? '🗂' : p === 'properties' ? '⚙' : p === 'score'
              ? (
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  ⚡
                  {viralScore && (
                    <span style={{
                      position: 'absolute', top: -6, right: -10,
                      background: viralScore.score >= 75 ? theme.success : viralScore.score >= 50 ? theme.warning : theme.danger,
                      color: '#fff', fontSize: 7, fontWeight: 800,
                      padding: '1px 3px', borderRadius: 3, lineHeight: 1,
                      minWidth: 14, textAlign: 'center',
                    }}>{viralScore.score}</span>
                  )}
                </span>
              )
              : p === 'preview' ? '📱' : (
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  ↔
                  {compareUpdated && (
                    <span style={{
                      position: 'absolute', top: -6, right: -8,
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 6px #4ade80',
                      animation: 'pulse 1s infinite',
                    }} />
                  )}
                </span>
              )}
          </button>
        ))}
      </div>

      <div style={s.content}>
        {activeRightPanel === 'layers' && (
          <>
            <div style={s.sectionTitle}>Canvas Layers</div>
            {layers.length === 0 && (
              <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', padding: 16 }}>
                No layers yet. Add text or shapes.
              </div>
            )}
            {layers.map((layer) => (
              <div key={layer.id} style={s.layerItem(selectedId === layer.id)} onClick={() => selectLayer(layer)}>
                <span style={s.layerIcon}>{typeIcon(layer.type)}</span>
                <span
                  contentEditable suppressContentEditableWarning
                  onBlur={(e) => { layer.obj._customName = e.currentTarget.textContent }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ ...s.layerName, outline: 'none', cursor: 'text' }}
                >{layer.name}</span>
                <button style={s.iconBtn} onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer) }}
                  title="Toggle visibility">{layer.visible ? '👁' : '🚫'}</button>
                <button style={s.iconBtn} onClick={(e) => { e.stopPropagation(); handleToggleLock(layer) }}
                  title="Toggle lock">{layer.locked ? '🔒' : '🔓'}</button>
                <button style={s.iconBtn} onClick={(e) => { e.stopPropagation(); bringForward(layer) }} title="Bring forward">↑</button>
                <button style={s.iconBtn} onClick={(e) => { e.stopPropagation(); sendBackward(layer) }} title="Send backward">↓</button>
                <button style={{ ...s.iconBtn, color: theme.danger }} onClick={(e) => { e.stopPropagation(); deleteLayer(layer) }} title="Delete">✕</button>
              </div>
            ))}
          </>
        )}

        {activeRightPanel === 'properties' && (
          <>
            <div style={s.sectionTitle}>Properties</div>
            {!activeObj ? (
              <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', padding: 16 }}>
                Select an object on canvas
              </div>
            ) : (
              <>
                <div style={s.propRow}>
                  <span style={s.propLabel}>X</span>
                  <input style={s.propInput} type="number" value={Math.round(activeObj.left || 0)}
                    onChange={(e) => { activeObj.set('left', +e.target.value || 0); fabricCanvas.renderAll() }} />
                </div>
                <div style={s.propRow}>
                  <span style={s.propLabel}>Y</span>
                  <input style={s.propInput} type="number" value={Math.round(activeObj.top || 0)}
                    onChange={(e) => { activeObj.set('top', +e.target.value || 0); fabricCanvas.renderAll() }} />
                </div>
                <div style={s.propRow}>
                  <span style={s.propLabel}>Opacity</span>
                  <input style={s.propInput} type="range" min="0" max="1" step="0.01"
                    aria-label="Opacity"
                    value={activeObj.opacity ?? 1}
                    onChange={(e) => { activeObj.set('opacity', +e.target.value); fabricCanvas.renderAll() }} />
                </div>
                <div style={s.propRow}>
                  <span style={s.propLabel}>Angle</span>
                  <input style={s.propInput} type="number" value={Math.round(activeObj.angle || 0)}
                    onChange={(e) => { activeObj.set('angle', (+e.target.value || 0) % 360); fabricCanvas.renderAll() }} />
                </div>
                {(activeObj.type === 'i-text' || activeObj.type === 'textbox') && (
                  <>
                    <div style={s.propRow}>
                      <span style={s.propLabel}>Font size</span>
                      <input style={s.propInput} type="number" min="8" max="400"
                        value={activeObj.fontSize || 40}
                        onChange={(e) => { const v = Math.max(8, Math.min(400, +e.target.value || 40)); activeObj.set('fontSize', v); fabricCanvas.renderAll() }} />
                    </div>
                    <div style={s.propRow}>
                      <span style={s.propLabel}>Color</span>
                      <input style={{ ...s.propInput, padding: 2, height: 28 }} type="color" value={activeObj.fill || '#ffffff'}
                        onChange={(e) => { activeObj.set('fill', e.target.value); fabricCanvas.renderAll() }} />
                    </div>
                  </>
                )}
                {activeObj.type !== 'i-text' && activeObj.type !== 'textbox' && activeObj.type !== 'image' && (
                  <div style={s.propRow}>
                    <span style={s.propLabel}>Fill</span>
                    <input style={{ ...s.propInput, padding: 2, height: 28 }} type="color"
                      value={typeof activeObj.fill === 'string' ? activeObj.fill : '#7c3aed'}
                      onChange={(e) => { activeObj.set('fill', e.target.value); fabricCanvas.renderAll() }} />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeRightPanel === 'score' && <ViralScore />}
        {activeRightPanel === 'preview' && <MobilePreview />}
        {activeRightPanel === 'compare' && <BeforeAfter />}
      </div>
    </div>
  )
}
