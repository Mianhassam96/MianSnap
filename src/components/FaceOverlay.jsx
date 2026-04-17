import React, { useEffect, useRef, useState } from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import { detectFaceRegion } from '../utils/smartPlacement'

const CANVAS_W = 1280
const CANVAS_H = 720

/**
 * Draws a subtle "Focus area" outline over the detected face region.
 * Shown for 3 seconds after a frame is loaded, then fades.
 */
export default function FaceOverlay() {
  const { fabricCanvas } = useCanvasStore()
  const { selectedFrame } = useVideoStore()
  const canvasRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!fabricCanvas || !selectedFrame) return

    // Small delay to let background image render first
    const t = setTimeout(() => {
      const face = detectFaceRegion(fabricCanvas)
      if (!face) return

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      // Dashed rounded rect around face
      ctx.save()
      ctx.strokeStyle = 'rgba(124,58,237,0.7)'
      ctx.lineWidth = 3
      ctx.setLineDash([8, 5])
      ctx.shadowColor = 'rgba(124,58,237,0.5)'
      ctx.shadowBlur = 8
      const r = 12
      const { x, y, w, h } = face
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Label
      ctx.save()
      ctx.fillStyle = 'rgba(124,58,237,0.85)'
      ctx.beginPath()
      ctx.roundRect(x, y - 22, 90, 20, 4)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px Inter, sans-serif'
      ctx.fillText('Focus area', x + 6, y - 7)
      ctx.restore()

      setVisible(true)
      clearTimeout(timerRef.current)
      // Fade out after 3s
      timerRef.current = setTimeout(() => {
        setVisible(false)
        setTimeout(() => {
          const c = canvasRef.current
          if (c) c.getContext('2d').clearRect(0, 0, CANVAS_W, CANVAS_H)
        }, 500)
      }, 3000)
    }, 600)

    return () => { clearTimeout(t); clearTimeout(timerRef.current) }
  }, [selectedFrame, fabricCanvas])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 6,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    />
  )
}
