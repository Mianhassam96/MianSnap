import React, { useState } from 'react'
import { fabric } from '../lib/fabric'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'

const VARIATIONS = [
  { label: 'Warmer', filter: (f) => new f.Image.filters.Saturation({ saturation: 0.3 }) },
  { label: 'Cooler', filter: (f) => new f.Image.filters.Saturation({ saturation: -0.2 }) },
  { label: 'High Contrast', filter: (f) => new f.Image.filters.Contrast({ contrast: 0.3 }) },
  { label: 'Brighter', filter: (f) => new f.Image.filters.Brightness({ brightness: 0.15 }) },
  { label: 'Darker', filter: (f) => new f.Image.filters.Brightness({ brightness: -0.15 }) },
]

export default function ABGenerator() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const [variants, setVariants] = useState([])
  const [generating, setGenerating] = useState(false)

  async function generate() {
    if (!fabricCanvas) return
    setGenerating(true)

    const results = []

    for (let i = 0; i < 3; i++) {
      // Clone canvas to offscreen
      const offscreen = document.createElement('canvas')
      offscreen.width = fabricCanvas.width
      offscreen.height = fabricCanvas.height
      const ctx = offscreen.getContext('2d')

      // Draw current canvas state
      const dataUrl = fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.85 })
      await new Promise((res) => {
        const img = new Image()
        img.onload = () => { ctx.drawImage(img, 0, 0); res() }
        img.src = dataUrl
      })

      // Apply variation filter
      const variation = VARIATIONS[i]
      const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height)
      applyFilterToImageData(imageData, i)
      ctx.putImageData(imageData, 0, 0)

      results.push({
        label: `Version ${String.fromCharCode(65 + i)} — ${variation.label}`,
        dataUrl: offscreen.toDataURL('image/jpeg', 0.85),
      })
    }

    setVariants(results)
    setGenerating(false)
  }

  function applyFilterToImageData(imageData, variantIndex) {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2]

      if (variantIndex === 0) {
        // Warmer: boost red/green
        data[i] = Math.min(255, r * 1.1)
        data[i + 1] = Math.min(255, g * 1.05)
        data[i + 2] = Math.max(0, b * 0.9)
      } else if (variantIndex === 1) {
        // Cooler: boost blue
        data[i] = Math.max(0, r * 0.9)
        data[i + 1] = Math.min(255, g * 1.02)
        data[i + 2] = Math.min(255, b * 1.15)
      } else if (variantIndex === 2) {
        // High contrast
        const avg = (r + g + b) / 3
        const factor = 1.4
        data[i] = Math.min(255, Math.max(0, avg + (r - avg) * factor))
        data[i + 1] = Math.min(255, Math.max(0, avg + (g - avg) * factor))
        data[i + 2] = Math.min(255, Math.max(0, avg + (b - avg) * factor))
      }
    }
  }

  function downloadVariant(dataUrl, label) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `miansnap-${label.replace(/\s+/g, '-').toLowerCase()}.jpg`
    a.click()
  }

  const s = {
    wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 },
    desc: { fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 4 },
    genBtn: {
      width: '100%', padding: '10px', borderRadius: 7, border: 'none',
      background: `linear-gradient(135deg,${theme.accent},${theme.accentSecondary})`,
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    },
    variantCard: {
      borderRadius: 8, overflow: 'hidden', border: `1px solid ${theme.border}`,
      background: theme.bgTertiary,
    },
    variantImg: { width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' },
    variantFooter: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 10px',
    },
    variantLabel: { fontSize: 11, color: theme.text, fontWeight: 600 },
    dlBtn: {
      padding: '4px 10px', borderRadius: 5, border: 'none',
      background: theme.accent, color: '#fff', fontSize: 10, cursor: 'pointer',
    },
  }

  return (
    <div style={s.wrap}>
      <div style={s.title}>A/B Thumbnail Generator</div>
      <div style={s.desc}>Generate 3 color variations of your current canvas for A/B testing.</div>
      <button style={s.genBtn} onClick={generate} disabled={generating || !fabricCanvas}>
        {generating ? '⏳ Generating...' : '🧪 Generate A/B/C Variants'}
      </button>
      {variants.map((v, i) => (
        <div key={i} style={s.variantCard}>
          <img src={v.dataUrl} alt={v.label} style={s.variantImg} />
          <div style={s.variantFooter}>
            <span style={s.variantLabel}>{v.label}</span>
            <button style={s.dlBtn} onClick={() => downloadVariant(v.dataUrl, v.label)}>⬇ Save</button>
          </div>
        </div>
      ))}
    </div>
  )
}

