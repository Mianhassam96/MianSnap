import React, { useState } from 'react'
import { fabric } from 'fabric'
import useStore from '../store/useStore'
import { removeBackground } from '../utils/bgRemoval'

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '10px 0',
    borderTop: '1px solid #1a1a2e',
  },
  row: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  btn: {
    padding: '7px 12px',
    borderRadius: 6,
    border: '1px solid #222',
    background: '#111',
    color: '#ccc',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  exportRow: { display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 },
  select: {
    background: '#111',
    border: '1px solid #222',
    color: '#ccc',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
  exportBtn: {
    flex: 1,
    padding: '9px 0',
    borderRadius: 6,
    border: 'none',
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  aiStatus: { fontSize: 11, color: '#7c3aed', padding: '4px 0' },
}

export default function Toolbar() {
  const { fabricCanvas, exportQuality, setExportQuality } = useStore()
  const [aiStatus, setAiStatus] = useState('')

  function addText() {
    if (!fabricCanvas) return
    const text = new fabric.IText('Double-click to edit', {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Impact',
      fontSize: 60,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
    })
    fabricCanvas.add(text)
    fabricCanvas.setActiveObject(text)
    fabricCanvas.renderAll()
  }

  function addShape(type) {
    if (!fabricCanvas) return
    let shape
    const cx = fabricCanvas.width / 2
    const cy = fabricCanvas.height / 2

    if (type === 'rect') {
      shape = new fabric.Rect({ left: cx - 80, top: cy - 40, width: 160, height: 80, fill: 'rgba(124,58,237,0.7)', rx: 8, ry: 8 })
    } else if (type === 'circle') {
      shape = new fabric.Circle({ left: cx - 50, top: cy - 50, radius: 50, fill: 'rgba(79,70,229,0.7)' })
    } else if (type === 'arrow') {
      shape = new fabric.Triangle({ left: cx - 30, top: cy - 40, width: 60, height: 80, fill: '#ff3300', angle: 90 })
    }

    if (shape) {
      fabricCanvas.add(shape)
      fabricCanvas.setActiveObject(shape)
      fabricCanvas.renderAll()
    }
  }

  function deleteSelected() {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (active) {
      fabricCanvas.remove(active)
      fabricCanvas.renderAll()
    }
  }

  function bringForward() {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (active) { fabricCanvas.bringForward(active); fabricCanvas.renderAll() }
  }

  function sendBackward() {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (active) { fabricCanvas.sendBackwards(active); fabricCanvas.renderAll() }
  }

  async function handleBgRemoval() {
    if (!fabricCanvas) return
    const active = fabricCanvas.getActiveObject()
    if (!active || active.type !== 'image') {
      alert('Select an image layer first')
      return
    }

    const dataUrl = active.toDataURL()
    try {
      const result = await removeBackground(dataUrl, (msg) => setAiStatus(msg))
      fabric.Image.fromURL(result, (img) => {
        img.set({ left: active.left, top: active.top, scaleX: active.scaleX, scaleY: active.scaleY })
        fabricCanvas.remove(active)
        fabricCanvas.add(img)
        fabricCanvas.setActiveObject(img)
        fabricCanvas.renderAll()
        setAiStatus('')
      })
    } catch (e) {
      setAiStatus('AI model failed to load. Check your connection.')
    }
  }

  function exportCanvas() {
    if (!fabricCanvas) return
    const multiplier = exportQuality === '1080p' ? 1.5 : 1
    const dataUrl = fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.92, multiplier })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `miansnap-thumbnail-${exportQuality}.jpg`
    a.click()
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        <button style={styles.btn} onClick={addText}>＋ Text</button>
        <button style={styles.btn} onClick={() => addShape('rect')}>▭ Box</button>
        <button style={styles.btn} onClick={() => addShape('circle')}>● Circle</button>
        <button style={styles.btn} onClick={() => addShape('arrow')}>▶ Arrow</button>
      </div>
      <div style={styles.row}>
        <button style={styles.btn} onClick={bringForward}>↑ Forward</button>
        <button style={styles.btn} onClick={sendBackward}>↓ Backward</button>
        <button style={{ ...styles.btn, color: '#f87171', borderColor: '#3a1a1a' }} onClick={deleteSelected}>✕ Delete</button>
      </div>
      <div style={styles.row}>
        <button style={{ ...styles.btn, color: '#a78bfa' }} onClick={handleBgRemoval}>
          🤖 Remove BG (AI)
        </button>
      </div>
      {aiStatus && <div style={styles.aiStatus}>{aiStatus}</div>}
      <div style={styles.exportRow}>
        <select style={styles.select} value={exportQuality} onChange={(e) => setExportQuality(e.target.value)}>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </select>
        <button style={styles.exportBtn} onClick={exportCanvas}>⬇ Export</button>
      </div>
    </div>
  )
}
