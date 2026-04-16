import React, { useEffect, useRef, useState, useCallback } from 'react'
import { fabric } from '../lib/fabric'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import useUIStore from '../store/useUIStore'
import { SAFE_ZONES } from './SafeZoneOverlay'
import { createHistory } from '../utils/canvasHistory'
import { setupKeyboardShortcuts } from '../utils/keyboardShortcuts'
import ZoomControls from './ZoomControls'

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

  // ── Init canvas ────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: theme.isDark ? '#0a0a0f' : '#ffffff',
      preserveObjectStacking: true,
      // Mobile: larger touch targets + drag delay
      targetFindTolerance: 10,
      perPixelTargetFind: false,
    })
    setFabricCanvas(canvas)
    return () => { canvas.dispose(); setFabricCanvas(null) }
  }, [])

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
    if (point) {
      fabricCanvas.zoomToPoint(point, newZoom)
    } else {
      fabricCanvas.setZoom(newZoom)
    }
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
      const delta = e.deltaY
      const point = new fabric.Point(e.offsetX, e.offsetY)
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fabricCanvas.getZoom() * (delta > 0 ? 0.9 : 1.1)))
      fabricCanvas.zoomToPoint(point, newZoom)
      setZoom(newZoom)
    }
    fabricCanvas.on('mouse:wheel', onWheel)
    return () => fabricCanvas.off('mouse:wheel', onWheel)
  }, [fabricCanvas])

  // ── Space/middle-click pan ─────────────────────────────────────
  useEffect(() => {
    if (!fabricCanvas) return

    const onMouseDown = (opt) => {
      const e = opt.e
      // Middle click or space+drag
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        isPanning.current = true
        lastPan.current = { x: e.clientX, y: e.clientY }
        fabricCanvas.defaultCursor = 'grabbing'
        fabricCanvas.setCursor('grabbing')
        e.preventDefault()
      }
    }
    const onMouseMove = (opt) => {
      if (!isPanning.current) return
      const e = opt.e
      const dx = e.clientX - lastPan.current.x
      const dy = e.clientY - lastPan.current.y
      lastPan.current = { x: e.clientX, y: e.clientY }
      const vpt = fabricCanvas.viewportTransform
      vpt[4] += dx
      vpt[5] += dy
      fabricCanvas.requestRenderAll()
    }
    const onMouseUp = () => {
      isPanning.current = false
      fabricCanvas.defaultCursor = 'default'
      fabricCanvas.setCursor('default')
    }

    fabricCanvas.on('mouse:down', onMouseDown)
    fabricCanvas.on('mouse:move', onMouseMove)
    fabricCanvas.on('mouse:up',   onMouseUp)
    return () => {
      fabricCanvas.off('mouse:down', onMouseDown)
      fabricCanvas.off('mouse:move', onMouseMove)
      fabricCanvas.off('mouse:up',   onMouseUp)
    }
  }, [fabricCanvas])

  // ── Keyboard zoom shortcuts ────────────────────────────────────
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

  // ── Load video frame as background — cover scaling, no stretch ──
  useEffect(() => {
    if (!fabricCanvas || !selectedFrame) return
    fabric.Image.fromURL(selectedFrame.dataUrl, (img) => {
      const cw = fabricCanvas.width
      const ch = fabricCanvas.height
      const iw = img.width
      const ih = img.height
      const scale = Math.max(cw / iw, ch / ih)
      img.set({
        scaleX: scale, scaleY: scale,
        left: (cw - iw * scale) / 2,
        top:  (ch - ih * scale) / 2,
        originX: 'left', originY: 'top',
      })
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
    })
  }, [selectedFrame, fabricCanvas])

  // ── Safe zone overlay ──────────────────────────────────────────
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const ctx = overlay.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    if (!showSafeZone) return
    const zones = SAFE_ZONES[activePlatform]?.zones || []
    zones.forEach((z) => {
      ctx.fillStyle = z.color
      ctx.fillRect(z.x * CANVAS_W, z.y * CANVAS_H, z.w * CANVAS_W, z.h * CANVAS_H)
      ctx.strokeStyle = z.color.replace(/[\d.]+\)$/, '0.9)')
      ctx.lineWidth = 2
      ctx.strokeRect(z.x * CANVAS_W, z.y * CANVAS_H, z.w * CANVAS_W, z.h * CANVAS_H)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.font = 'bold 14px Segoe UI'
      ctx.fillText(z.label, z.x * CANVAS_W + 8, z.y * CANVAS_H + 18)
    })
  }, [showSafeZone, activePlatform])

  return (
    <div ref={wrapRef} style={{
      position: 'relative', width: '100%', aspectRatio: '16/9',
      borderRadius: 8, overflow: 'hidden',
      boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
    }}>
      <canvas ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <canvas ref={overlayRef} width={CANVAS_W} height={CANVAS_H}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Zoom controls — inside canvas wrapper */}
      <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onZoomReset={zoomReset} />
    </div>
  )
}
