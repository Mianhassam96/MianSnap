import React, { useEffect, useRef, useState, useCallback } from 'react'
import { fabric } from '../lib/fabric'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import useUIStore from '../store/useUIStore'
import { SAFE_ZONES } from './SafeZoneOverlay'
import { createHistory } from '../utils/canvasHistory'
import { setupKeyboardShortcuts } from '../utils/keyboardShortcuts'
import ZoomControls from './ZoomControls'
import { applyImageAsBackground, applyProImageSettings, clampToBounds, isMobileDevice } from '../utils/imageUtils'
import FaceOverlay from './FaceOverlay'

const CANVAS_W = 1280
const CANVAS_H = 720
const MIN_ZOOM = 0.1
const MAX_ZOOM = 5

export default function CanvasEditor() {
  const canvasRef  = useRef(null)
  const overlayRef = useRef(null)
  const wrapRef    = useRef(null)
  const historyRef = useRef(null)
  const isPanning  = useRef(false)
  const lastPan    = useRef({ x: 0, y: 0 })
  const spaceDown  = useRef(false)

  const { setFabricCanvas, fabricCanvas, setUndoRedo } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const { showSafeZone, activePlatform, theme, fitMode, setFitMode } = useUIStore()
  const [zoom, setZoom] = useState(1)
  const [canvasW, setCanvasW] = useState(CANVAS_W)
  const [canvasH, setCanvasH] = useState(CANVAS_H)
  const [dragOver, setDragOver] = useState(false)
  const [dragShift, setDragShift] = useState(false)
  const [bgSelected, setBgSelected] = useState(false)
  const [undoFlash, setUndoFlash] = useState(false)
  const [snapFlash, setSnapFlash] = useState(false)
  const snapCooldown = useRef(false)
  const [dropChoice, setDropChoice] = useState(null) // { file, url } — pending drop choice

  // ── Init canvas — wait for Fabric CDN to load ─────────────────
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return
    let cancelled = false

    function init() {
      if (cancelled || !canvasRef.current) return
      if (!window.fabric?.Canvas) return // not ready yet, will retry via event
      const mobile = isMobileDevice()
      try {
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundColor: theme.isDark ? '#0a0a0f' : '#ffffff',
          preserveObjectStacking: true,
          targetFindTolerance: mobile ? 16 : 8,
          perPixelTargetFind: false,
          selectionBorderColor: '#7c3aed',
          selectionLineWidth: 2,
          enableRetinaScaling: true,  // crisp on HiDPI/retina/mobile screens
        })
        setFabricCanvas(canvas)
      } catch (err) {
        console.error('[MianSnap] Canvas init failed:', err)
        setTimeout(init, 200)
      }
    }

    // If Fabric already loaded, init immediately
    if (window.fabric?.Canvas) {
      init()
    } else {
      // Wait for fabricReady event
      window.addEventListener('fabricReady', init, { once: true })
      // Also poll as fallback
      const poll = setInterval(() => {
        if (window.fabric?.Canvas) { clearInterval(poll); init() }
      }, 100)
      return () => { cancelled = true; clearInterval(poll); window.removeEventListener('fabricReady', init) }
    }

    return () => { cancelled = true }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fabricCanvas) {
        try {
          fabricCanvas.getObjects().forEach(obj => {
            if (obj.type === 'image') obj.setSrc('', () => {})
          })
          fabricCanvas.clear()
          fabricCanvas.dispose()
        } catch (_) {}
        setFabricCanvas(null)
      }
    }
  }, [fabricCanvas])

  // ── Track canvas size changes ──────────────────────────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const sync = () => {
      setCanvasW(fabricCanvas.width)
      setCanvasH(fabricCanvas.height)
    }
    // Listen for resize events
    window.addEventListener('miansnap:canvasResized', sync)
    return () => window.removeEventListener('miansnap:canvasResized', sync)
  }, [fabricCanvas])
  useEffect(() => {
    if (!fabricCanvas) return
    const mobile = isMobileDevice()

    const onAdded = (e) => {
      const obj = e.target
      if (obj?.type === 'image') {
        applyProImageSettings(obj, mobile)
        fabricCanvas.requestRenderAll()
      }
    }

    const onMoving = (e) => {
      const obj = e.target
      if (!obj) return
      const cw = fabricCanvas.width
      const ch = fabricCanvas.height
      clampToBounds(obj, cw, ch)
      obj.setCoords()
    }

    // Track when user manually moves background — prevents auto-cover overwriting composition
    const onMoved = (e) => {
      const obj = e.target
      if (obj && obj === fabricCanvas.backgroundImage) {
        obj._userMoved = true
      }
    }

    fabricCanvas.on('object:added', onAdded)
    fabricCanvas.on('object:moving', onMoving)
    fabricCanvas.on('object:moved', onMoved)
    return () => {
      fabricCanvas.off('object:added', onAdded)
      fabricCanvas.off('object:moving', onMoving)
      fabricCanvas.off('object:moved', onMoved)
    }
  }, [fabricCanvas])

  // ── History + keyboard shortcuts ───────────────────────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const history = createHistory(fabricCanvas)
    historyRef.current = history
    const syncState = () => setUndoRedo(history.canUndo(), history.canRedo())
    fabricCanvas.on('object:added',    syncState)
    fabricCanvas.on('object:removed',  syncState)
    fabricCanvas.on('object:modified', syncState)
    const cleanupKeys = setupKeyboardShortcuts(fabricCanvas, history)
    // Expose history pause/resume globally for grouped undo
    window.__msHistory = history
    return () => {
      history.destroy()
      cleanupKeys()
      fabricCanvas.off('object:added',    syncState)
      fabricCanvas.off('object:removed',  syncState)
      fabricCanvas.off('object:modified', syncState)
    }
  }, [fabricCanvas])

  // ── Zoom helpers ───────────────────────────────────────────────
  const applyZoom = useCallback((newZoom, point) => {
    if (!fabricCanvas) return
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom))
    if (point) fabricCanvas.zoomToPoint(point, newZoom)
    else fabricCanvas.setZoom(newZoom)
    setZoom(newZoom)
  }, [fabricCanvas])

  const zoomIn    = () => applyZoom(zoom + 0.1)
  const zoomOut   = () => applyZoom(zoom - 0.1)
  const zoomReset = () => {
    if (!fabricCanvas) return
    fabricCanvas.setZoom(1)
    fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    setZoom(1)
  }

  // ── Mouse wheel zoom ───────────────────────────────────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const onWheel = (opt) => {
      const e = opt.e
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const point = new fabric.Point(e.offsetX, e.offsetY)
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM,
        fabricCanvas.getZoom() * (e.deltaY > 0 ? 0.9 : 1.1)))
      fabricCanvas.zoomToPoint(point, newZoom)
      setZoom(newZoom)
    }
    fabricCanvas.on('mouse:wheel', onWheel)
    return () => fabricCanvas.off('mouse:wheel', onWheel)
  }, [fabricCanvas])

  // ── Alt/middle-click pan ───────────────────────────────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const onDown  = (opt) => {
      const e = opt.e
      if (e.button === 1 || (e.button === 0 && (e.altKey || spaceDown.current))) {
        isPanning.current = true
        lastPan.current = { x: e.clientX, y: e.clientY }
        fabricCanvas.defaultCursor = 'grabbing'
        fabricCanvas.setCursor('grabbing')
        e.preventDefault()
      }
    }
    const onMove  = (opt) => {
      if (!isPanning.current) return
      const e = opt.e
      const dx = e.clientX - lastPan.current.x
      const dy = e.clientY - lastPan.current.y
      lastPan.current = { x: e.clientX, y: e.clientY }
      const vpt = fabricCanvas.viewportTransform
      vpt[4] += dx; vpt[5] += dy
      fabricCanvas.requestRenderAll()
    }
    const onUp    = () => {
      isPanning.current = false
      fabricCanvas.defaultCursor = spaceDown.current ? 'grab' : 'default'
      fabricCanvas.setCursor(spaceDown.current ? 'grab' : 'default')
    }
    fabricCanvas.on('mouse:down', onDown)
    fabricCanvas.on('mouse:move', onMove)
    fabricCanvas.on('mouse:up',   onUp)
    return () => {
      fabricCanvas.off('mouse:down', onDown)
      fabricCanvas.off('mouse:move', onMove)
      fabricCanvas.off('mouse:up',   onUp)
    }
  }, [fabricCanvas])

  // ── Space key pan mode ─────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' && !e.target.matches('input,textarea,[contenteditable]')) {
        e.preventDefault()
        spaceDown.current = true
        if (fabricCanvas) { fabricCanvas.defaultCursor = 'grab'; fabricCanvas.setCursor('grab') }
      }
    }
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        spaceDown.current = false
        if (fabricCanvas) { fabricCanvas.defaultCursor = 'default'; fabricCanvas.setCursor('default') }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [fabricCanvas])

  // ── Keyboard zoom ──────────────────────────────────────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const onKey = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      if (e.key === '=' || e.key === '+') { e.preventDefault(); applyZoom(fabricCanvas.getZoom() + 0.1) }
      if (e.key === '-')                  { e.preventDefault(); applyZoom(fabricCanvas.getZoom() - 0.1) }
      if (e.key === '0')                  { e.preventDefault(); zoomReset() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fabricCanvas, applyZoom])

  // ── Double-click: text → edit, image → replace picker ─────────
  useEffect(() => {
    if (!fabricCanvas) return
    const onDblClick = (opt) => {
      const obj = opt.target
      if (!obj) return
      if (obj.type === 'i-text' || obj.type === 'textbox') {
        obj.enterEditing()
        obj.selectAll()
        fabricCanvas.renderAll()
      } else if (obj.type === 'image') {
        // Open file picker to replace image
        const input = document.createElement('input')
        input.type = 'file'; input.accept = 'image/*'
        input.onchange = (e) => {
          const file = e.target.files[0]; if (!file) return
          const url = URL.createObjectURL(file)
          fabric.Image.fromURL(url, (newImg) => {
            newImg.set({ left: obj.left, top: obj.top, scaleX: obj.scaleX, scaleY: obj.scaleY, angle: obj.angle })
            applyProImageSettings(newImg, isMobileDevice())
            fabricCanvas.remove(obj)
            fabricCanvas.add(newImg)
            fabricCanvas.setActiveObject(newImg)
            fabricCanvas.renderAll()
            window.showToast?.('🔄 Image replaced!', 'success')
          })
        }
        input.click()
      }
    }
    fabricCanvas.on('mouse:dblclick', onDblClick)
    return () => fabricCanvas.off('mouse:dblclick', onDblClick)
  }, [fabricCanvas])

  // ── Click empty canvas → select background ────────────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const onMouseDown = (opt) => {
      if (!opt.target && fabricCanvas.backgroundImage) {
        setBgSelected(true)
        setTimeout(() => setBgSelected(false), 2000)
      } else {
        setBgSelected(false)
      }
    }
    fabricCanvas.on('mouse:down', onMouseDown)
    return () => fabricCanvas.off('mouse:down', onMouseDown)
  }, [fabricCanvas])

  // ── Undo flash — show hint after any modification ─────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const onModified = () => {
      setUndoFlash(true)
      setTimeout(() => setUndoFlash(false), 2500)
    }
    fabricCanvas.on('object:modified', onModified)
    fabricCanvas.on('object:added',    onModified)
    return () => {
      fabricCanvas.off('object:modified', onModified)
      fabricCanvas.off('object:added',    onModified)
    }
  }, [fabricCanvas])

  // ── Snap feedback ──────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      if (snapCooldown.current) return
      snapCooldown.current = true
      setSnapFlash(true)
      setTimeout(() => { setSnapFlash(false); snapCooldown.current = false }, 400)
    }
    window.addEventListener('miansnap:snapped', handler)
    return () => window.removeEventListener('miansnap:snapped', handler)
  }, [])

  // ── Auto-focus on object add (brief zoom-to hint) ──────────────
  useEffect(() => {
    if (!fabricCanvas) return
    const onAdded = (e) => {
      const obj = e.target
      if (!obj || obj._isGuide || obj._viralGlow || obj._viralVignette || obj._vignette) return
      // Brief border pulse on the object
      const origBorder = obj.borderColor
      obj.set('borderColor', '#7c3aed')
      fabricCanvas.setActiveObject(obj)
      fabricCanvas.renderAll()
      setTimeout(() => {
        obj.set('borderColor', origBorder || '#7c3aed')
        fabricCanvas.renderAll()
      }, 600)
    }
    fabricCanvas.on('object:added', onAdded)
    return () => fabricCanvas.off('object:added', onAdded)
  }, [fabricCanvas])

  // ── Load video frame as background ────────────────────────────
  // NOTE: BottomPanel calls applyImageAsBackground directly — this effect
  // only handles external frame changes (e.g. from ZeroUIMode auto-generate)
  // We use a ref to skip the first render and avoid double-apply
  const prevFrameRef = useRef(null)
  useEffect(() => {
    if (!fabricCanvas || !selectedFrame) return
    // Skip if this frame was already applied directly by BottomPanel
    if (prevFrameRef.current === selectedFrame) return
    prevFrameRef.current = selectedFrame
    applyImageAsBackground(fabricCanvas, selectedFrame.dataUrl, fitMode)
  }, [selectedFrame, fabricCanvas, fitMode])

  // ── Safe zone overlay ──────────────────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const ctx = overlay.getContext('2d')
    const cw = fabricCanvas?.width || canvasW
    const ch = fabricCanvas?.height || canvasH
    ctx.clearRect(0, 0, cw, ch)
    if (!showSafeZone) return
    const zones = SAFE_ZONES[activePlatform]?.zones || []
    zones.forEach((z) => {
      ctx.fillStyle = z.color
      ctx.fillRect(z.x * cw, z.y * ch, z.w * cw, z.h * ch)
      ctx.strokeStyle = z.color.replace(/[\d.]+\)$/, '0.9)')
      ctx.lineWidth = 2
      ctx.strokeRect(z.x * cw, z.y * ch, z.w * cw, z.h * ch)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.font = 'bold 14px Segoe UI'
      ctx.fillText(z.label, z.x * cw + 8, z.y * ch + 18)
    })
  }, [showSafeZone, activePlatform, canvasW, canvasH, fabricCanvas])

  const fitBtnBase = {
    padding: '3px 10px', borderRadius: 4, border: 'none',
    fontSize: 10, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s',
  }

  return (
    <div ref={wrapRef} style={{
      position: 'relative', width: '100%',
      aspectRatio: `${canvasW} / ${canvasH}`,
      borderRadius: 8, overflow: 'hidden',
      boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
      touchAction: 'none',
      userSelect: 'none',
    }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); setDragShift(e.shiftKey) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (!file || !fabricCanvas) return
        const url = URL.createObjectURL(file)
        if (file.type && file.type.startsWith('image/')) {
          // Show choice dialog — no Shift key required
          setDropChoice({ file, url })
        } else if (file.type && file.type.startsWith('video/')) {
          window.dispatchEvent(new CustomEvent('miansnap:dropVideo', { detail: { file } }))
        } else {
          window.showToast?.('❌ Unsupported file — use image or video', 'error', 3000)
        }
      }}
    >
      <canvas ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', touchAction: 'none' }} />
      <canvas ref={overlayRef} width={canvasW} height={canvasH}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', touchAction: 'none' }} />

      {/* ── Drop choice dialog ── */}
      {dropChoice && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 35,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'rgba(13,13,24,0.97)', borderRadius: 14,
            border: '1px solid rgba(124,58,237,0.4)',
            padding: '20px 24px', textAlign: 'center',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            animation: 'scaleIn 0.2s ease',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
              What do you want to do with this image?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 9, border: 'none',
                  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
                onClick={() => {
                  applyImageAsBackground(fabricCanvas, dropChoice.url, 'cover')
                  window.showToast?.('🖼 Background replaced!', 'success')
                  setDropChoice(null)
                }}
              >🔄 Replace Background</button>
              <button
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 9,
                  border: '1px solid rgba(124,58,237,0.4)',
                  background: 'transparent', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
                onClick={() => {
                  fabric.Image.fromURL(dropChoice.url, (img) => {
                    applyProImageSettings(img, isMobileDevice())
                    img.set({ left: fabricCanvas.width / 2, top: fabricCanvas.height / 2, originX: 'center', originY: 'center' })
                    fabricCanvas.add(img); fabricCanvas.setActiveObject(img); fabricCanvas.renderAll()
                    window.showToast?.('🖼 Added as layer', 'success')
                  })
                  setDropChoice(null)
                }}
              >🖼 Add as Layer</button>
            </div>
            <button
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 11, cursor: 'pointer' }}
              onClick={() => setDropChoice(null)}
            >Cancel</button>
          </div>
        </div>
      )}

      {/* ── Drag-to-replace overlay ── */}
      {dragOver && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(124,58,237,0.18)',
          border: '3px dashed #7c3aed',
          borderRadius: 8,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
          pointerEvents: 'none',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{ fontSize: 40 }}>⬇</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {dragShift ? '🖼 Add as Layer' : '🔄 Replace Background'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {dragShift ? 'Release to add on top' : 'Hold Shift to add as layer instead'}
          </div>
        </div>
      )}

      {/* ── Background selected label ── */}
      {bgSelected && (
        <div style={{
          position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(124,58,237,0.9)', color: '#fff',
          fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 20,
          pointerEvents: 'none', zIndex: 20,
          animation: 'fadeInDown 0.2s ease',
        }}>
          🖼 Background selected — drag to reposition
        </div>
      )}

      {/* ── Snap feedback ── */}
      {snapFlash && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(124,58,237,0.85)', color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
          pointerEvents: 'none', zIndex: 20,
          animation: 'fadeInDown 0.15s ease',
        }}>
          🧲 Snapped
        </div>
      )}

      {/* ── Undo flash ── */}
      {undoFlash && (
        <div
          style={{
            position: 'absolute', bottom: 48, right: 8,
            background: theme.isDark ? 'rgba(13,13,24,0.92)' : 'rgba(255,255,255,0.92)',
            border: `1px solid ${theme.border}`,
            color: theme.textSecondary, fontSize: 11, fontWeight: 600,
            padding: '4px 12px', borderRadius: 20,
            pointerEvents: 'auto', zIndex: 20, cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInDown 0.2s ease',
          }}
          onClick={() => {
            historyRef.current?.undo?.()
            setUndoFlash(false)
            window.showToast?.('↩ Undone', 'info', 1200)
          }}
          title="Ctrl+Z"
        >
          ↩ Undo
        </div>
      )}

      {/* Fit / Fill toggle — clearer labels */}
      <div style={{
        position: 'absolute', top: 8, right: 8, zIndex: 5,
        display: 'flex', gap: 2,
        background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: 3,
        backdropFilter: 'blur(6px)',
      }}>
        <button style={{ ...fitBtnBase, background: fitMode === 'contain' ? '#7c3aed' : 'transparent', color: fitMode === 'contain' ? '#fff' : 'rgba(255,255,255,0.6)' }}
          onClick={() => setFitMode('contain')} title="Show Full Image — whole image visible, no cropping">Full</button>
        <button style={{ ...fitBtnBase, background: fitMode === 'cover' ? '#7c3aed' : 'transparent', color: fitMode === 'cover' ? '#fff' : 'rgba(255,255,255,0.6)' }}
          onClick={() => setFitMode('cover')} title="Fill Canvas — covers entire canvas, may crop edges">Fill</button>
      </div>

      <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onZoomReset={zoomReset} />
      <FaceOverlay />
    </div>
  )
}
