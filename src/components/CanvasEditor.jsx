import React, { useEffect, useRef } from 'react'
import { fabric } from '../lib/fabric'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import useUIStore from '../store/useUIStore'
import { SAFE_ZONES } from './SafeZoneOverlay'

const CANVAS_W = 1280
const CANVAS_H = 720

export default function CanvasEditor() {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const { setFabricCanvas, fabricCanvas } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const { showSafeZone, activePlatform, theme } = useUIStore()

  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: theme.isDark ? '#0a0a0f' : '#ffffff',
      preserveObjectStacking: true,
    })
    setFabricCanvas(canvas)
    return () => { canvas.dispose(); setFabricCanvas(null) }
  }, [])

  useEffect(() => {
    if (!fabricCanvas || !selectedFrame) return
    fabric.Image.fromURL(selectedFrame.dataUrl, (img) => {
      img.scaleToWidth(CANVAS_W)
      img.scaleToHeight(CANVAS_H)
      fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas))
    })
  }, [selectedFrame, fabricCanvas])

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
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '16/9',
      borderRadius: 8, overflow: 'hidden',
      boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <canvas ref={overlayRef} width={CANVAS_W} height={CANVAS_H}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  )
}

