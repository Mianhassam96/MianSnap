import React, { useState, useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

const DB_KEY = 'miansnap_assets'

function loadAssets() {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '[]') } catch { return [] }
}
function saveAssets(assets) {
  localStorage.setItem(DB_KEY, JSON.stringify(assets))
}

export default function AssetManager() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [assets, setAssets] = useState(loadAssets)
  const [brandColors, setBrandColors] = useState(() => {
    try { return JSON.parse(localStorage.getItem('miansnap_brand_colors') || '["#7c3aed","#ffffff","#000000"]') } catch { return ['#7c3aed','#ffffff','#000000'] }
  })
  const inputRef = useRef()

  useEffect(() => { saveAssets(assets) }, [assets])
  useEffect(() => { localStorage.setItem('miansnap_brand_colors', JSON.stringify(brandColors)) }, [brandColors])

  function handleUpload(e) {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const asset = { id: Date.now() + Math.random(), name: file.name, dataUrl: ev.target.result, type: file.type }
        setAssets((prev) => [asset, ...prev].slice(0, 30)) // max 30 assets
      }
      reader.readAsDataURL(file)
    })
  }

  function addToCanvas(asset) {
    if (!fabricCanvas) return
    fabric.Image.fromURL(asset.dataUrl, (img) => {
      const maxW = fabricCanvas.width * 0.4
      if (img.width > maxW) img.scaleToWidth(maxW)
      img.set({ left: fabricCanvas.width / 2, top: fabricCanvas.height / 2, originX: 'center', originY: 'center' })
      fabricCanvas.add(img)
      fabricCanvas.setActiveObject(img)
      fabricCanvas.renderAll()
    })
  }

  function deleteAsset(id) {
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  function addBrandColor() {
    const color = prompt('Enter hex color (e.g. #ff3300)')
    if (color) setBrandColors((prev) => [...new Set([...prev, color])].slice(0, 12))
  }

  function applyBrandColor(color) {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj) { obj.set('fill', color); fabricCanvas.renderAll() }
  }

  const s = {
    wrap: { display: 'flex', flexDirection: 'column', gap: 14 },
    sectionTitle: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 600 },
    uploadBtn: {
      width: '100%', padding: '9px', borderRadius: 7, border: `2px dashed ${theme.border}`,
      background: theme.bgTertiary, color: theme.textSecondary, fontSize: 12,
      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 },
    assetThumb: {
      aspectRatio: '1', objectFit: 'cover', borderRadius: 6, cursor: 'pointer',
      border: `1px solid ${theme.border}`, transition: 'transform 0.1s',
      width: '100%',
    },
    assetWrap: { position: 'relative' },
    delBtn: {
      position: 'absolute', top: 2, right: 2, width: 16, height: 16,
      borderRadius: 4, background: theme.danger, color: '#fff',
      border: 'none', cursor: 'pointer', fontSize: 9, display: 'flex',
      alignItems: 'center', justifyContent: 'center', lineHeight: 1,
    },
    colorRow: { display: 'flex', flexWrap: 'wrap', gap: 5 },
    colorDot: (c) => ({
      width: 24, height: 24, borderRadius: 5, background: c, cursor: 'pointer',
      border: `1px solid ${theme.border}`, transition: 'transform 0.1s',
      flexShrink: 0,
    }),
    addColorBtn: {
      width: 24, height: 24, borderRadius: 5, border: `1px dashed ${theme.border}`,
      background: 'transparent', color: theme.textMuted, cursor: 'pointer',
      fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
  }

  return (
    <div style={s.wrap}>
      {/* Upload */}
      <div>
        <div style={s.sectionTitle}>My Assets</div>
        <div style={s.uploadBtn}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload({ target: { files: e.dataTransfer.files } }) }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = theme.accent }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textSecondary }}
        >
          📁 Upload Images / Logos
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
      </div>

      {/* Asset grid */}
      {assets.length > 0 && (
        <div style={s.grid}>
          {assets.map((a) => (
            <div key={a.id} style={s.assetWrap}>
              <img src={a.dataUrl} alt={a.name} style={s.assetThumb}
                onClick={() => addToCanvas(a)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                title={`Click to add: ${a.name}`}
              />
              <button style={s.delBtn} onClick={() => deleteAsset(a.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {assets.length === 0 && (
        <div style={{ fontSize: 11, color: theme.textMuted, textAlign: 'center', padding: '8px 0' }}>
          No assets yet. Upload logos or images.
        </div>
      )}

      {/* Brand colors */}
      <div>
        <div style={s.sectionTitle}>Brand Colors</div>
        <div style={s.colorRow}>
          {brandColors.map((c, i) => (
            <div key={i} style={s.colorDot(c)} title={c}
              onClick={() => applyBrandColor(c)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            />
          ))}
          <button style={s.addColorBtn} onClick={addBrandColor} title="Add brand color">+</button>
        </div>
      </div>
    </div>
  )
}
