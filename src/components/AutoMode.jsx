import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import { makeItViral } from '../utils/makeItViral'
import { calculateViralScore } from '../utils/viralScore'
import { applyThumbnailStyle } from '../utils/thumbnailStyles'
import { generateTitles } from '../utils/titleGenerator'
import { fabric } from '../lib/fabric'

export default function AutoMode() {
  const { theme } = useUIStore()
  const { fabricCanvas, setViralScore } = useCanvasStore()
  const { frames } = useVideoStore()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState('')
  const [progress, setProgress] = useState(0)

  async function runAutoMode() {
    if (!fabricCanvas || frames.length === 0) {
      window.showToast?.('⚠️ Upload a video first', 'error', 2000)
      return
    }

    setRunning(true)
    setProgress(0)

    try {
      // Step 1: Pick best frame
      setStep('🎯 Analyzing frames...')
      setProgress(20)
      await sleep(400)
      const bestFrame = frames.find(f => f.isBest) || frames[0]

      // Step 2: Apply frame
      setStep('🖼 Loading best moment...')
      setProgress(40)
      await sleep(300)
      await applyFrameToCanvas(bestFrame)

      // Step 3: Apply style
      setStep('🎨 Applying viral style...')
      setProgress(60)
      await sleep(400)
      const style = pickBestStyle()
      await applyThumbnailStyle(fabricCanvas, style)

      // Step 4: Add text
      setStep('✍️ Generating title...')
      setProgress(75)
      await sleep(300)
      const title = generateTitles('reaction', 1)[0]
      addAutoText(title)

      // Step 5: Make Viral
      setStep('⚡ Enhancing...')
      setProgress(90)
      await sleep(400)
      await makeItViral(fabricCanvas)

      // Step 6: Calculate score
      setProgress(100)
      const score = calculateViralScore(fabricCanvas)
      setViralScore(score)

      // Success animation
      setStep('🔥 Thumbnail ready!')
      await sleep(800)

      window.dispatchEvent(new CustomEvent('miansnap:autoModeComplete', { detail: { score: score?.score } }))
      window.showToast?.('🚀 Your viral thumbnail is ready!', 'success', 3000)

    } catch (err) {
      console.error('[AutoMode] Error:', err)
      window.showToast?.('❌ Auto mode failed — try manual mode', 'error', 3000)
    } finally {
      setRunning(false)
      setStep('')
      setProgress(0)
    }
  }

  function applyFrameToCanvas(frame) {
    return new Promise((resolve) => {
      fabric.Image.fromURL(frame.dataUrl, (img) => {
        const scale = Math.max(
          fabricCanvas.width / img.width,
          fabricCanvas.height / img.height
        )
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (fabricCanvas.width - img.width * scale) / 2,
          top: (fabricCanvas.height - img.height * scale) / 2,
        })
        fabricCanvas.setBackgroundImage(img, () => {
          fabricCanvas.renderAll()
          resolve()
        })
      })
    })
  }

  function pickBestStyle() {
    const styles = ['dramatic', 'gaming', 'viral', 'news']
    return styles[Math.floor(Math.random() * styles.length)]
  }

  function addAutoText(title) {
    const text = new fabric.IText(title, {
      left: fabricCanvas.width / 2,
      top: fabricCanvas.height * 0.82,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Impact',
      fontSize: 88,
      fill: '#ffff00',
      stroke: '#000000',
      strokeWidth: 4,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.9)',
        blur: 24,
        offsetX: 2,
        offsetY: 3,
      }),
    })
    fabricCanvas.add(text)
    fabricCanvas.renderAll()
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const s = {
    btn: {
      width: '100%',
      padding: '20px 24px',
      borderRadius: 16,
      border: 'none',
      background: running
        ? 'linear-gradient(135deg,#6d28d9,#4c1d95)'
        : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff',
      fontSize: 18,
      fontWeight: 900,
      cursor: running ? 'not-allowed' : 'pointer',
      boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
      letterSpacing: '-0.3px',
    },
    progress: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 4,
      width: `${progress}%`,
      background: 'rgba(255,255,255,0.4)',
      transition: 'width 0.3s ease',
    },
    step: {
      fontSize: 12,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: 8,
      minHeight: 18,
    },
  }

  return (
    <div>
      <button
        style={s.btn}
        onClick={runAutoMode}
        disabled={running}
        onMouseEnter={(e) => {
          if (!running) {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.5)'
        }}
      >
        {running ? (
          <>
            <span>⚡ Creating...</span>
            <div style={s.progress} />
          </>
        ) : (
          '🚀 Auto Create Thumbnail'
        )}
      </button>
      {step && <div style={s.step}>{step}</div>}
    </div>
  )
}
