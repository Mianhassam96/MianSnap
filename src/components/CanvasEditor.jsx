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

  const { setFabricCanvas, fabricCanvas, setUndoRedo } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const { showSafeZone, activePlatform, theme } = useUIStore()
  const [zoom, setZoom] = useState(1)
  const [fitMode, setFitMode] = useState('cover') // 'cover' | 'contain'
  const [canvasW, setCanvasW] = useState(CANVAS_W)
  const [canvasH, setCanvasH] = useState(CANVAS_H)

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
        })
        setFabricCanvas(canvas)
      } catch (err) {
        console.error('[MianSnap] Canvas init failed:', err)
        // Retry after short delay
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

    fabricCanvas.on('object:added', onAdded)
    fabricCanvas.on('object:moving', onMoving)
    return () => {
      fabricCanvas.off('object:added', onAdded)
      fabricCanvas.off('object:moving', onMoving)
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
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
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
      fabricCanvas.defaultCursor = 'default'
      fabricCanvas.setCursor('default')
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

  // ── Load video frame as background ────────────────────────────
  useEffect(() => {
    if (!fabricCanvas || !selectedFrame) return
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
    }}>
      <canvas ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <canvas ref={overlayRef} width={canvasW} height={canvasH}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Fit / Fill toggle — top right of canvas */}
      <div style={{
        position: 'absolute', top: 8, right: 8, zIndex: 5,
        display: 'flex', gap: 2,
        background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: 3,
        backdropFilter: 'blur(6px)',
      }}>
        <button
          style={{
            ...fitBtnBase,
            background: fitMode === 'contain' ? '#7c3aed' : 'transparent',
            color: fitMode === 'contain' ? '#fff' : 'rgba(255,255,255,0.6)',
          }}
          onClick={() => setFitMode('contain')}
          title="Fit — whole image visible"
        >Fit</button>
        <button
          style={{
            ...fitBtnBase,
            background: fitMode === 'cover' ? '#7c3aed' : 'transparent',
            color: fitMode === 'cover' ? '#fff' : 'rgba(255,255,255,0.6)',
          }}
          onClick={() => setFitMode('cover')}
          title="Fill — covers canvas, may crop"
        >Fill</button>
      </div>

      {/* Zoom controls */}
      <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onZoomReset={zoomReset} />

      {/* Face detection visual */}
      <FaceOverlay />
    </div>
  )
}
