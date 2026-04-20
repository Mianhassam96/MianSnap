import React, { useState } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import { makeItViral } from '../utils/makeItViral'
import { calculateViralScore } from '../utils/viralScore'
import { applyThumbnailStyle } from '../utils/thumbnailStyles'
import { generateTitles } from '../utils/titleGenerator'
import { fabric } from '../lib/fabric'
import FrameSelector from './FrameSelector'

export default function AutoMode() {
  const { theme } = useUIStore()
  const { fabricCanvas, setViralScore } = useCanvasStore()
  const { frames } = useVideoStore()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  const [showRetry, setShowRetry] = useState(false)

  // Show frame selector after auto mode completes
  React.useEffect(() => {
    const handler = () => setShowFrameSelector(true)
    window.addEventListener('miansnap:autoModeComplete', handler)
    return () => window.removeEventListener('miansnap:autoModeComplete', handler)
  }, [])

  // Show retry button after auto mode
  React.useEffect(() => {
    const handler = () => setShowRetry(true)
    window.addEventListener('miansnap:showRetry', handler)
    return () => window.removeEventListener('miansnap:showRetry', handler)
  }, [])

  async function runAutoMode() {
    if (!fabricCanvas || frames.length === 0) {
      window.showToast?.('⚠️ Upload a video first', 'error', 2000)
      return
    }

    setRunning(true)
    setProgress(0)

    try {
      // Step 1: Analyzing
      setStep('🧠 Analyzing your video...')
      setProgress(15)
      await sleep(800)

      // Step 2: Pick best frame
      setStep('🎯 Selecting best moment...')
      setProgress(30)
      await sleep(600)
      const bestFrame = frames.find(f => f.isBest) || frames[0]

      // Step 3: Apply frame
      setStep('🖼 Loading frame...')
      setProgress(45)
      await sleep(400)
      await applyFrameToCanvas(bestFrame)

      // Step 4: Designing
      setStep('🎨 Designing thumbnail...')
      setProgress(60)
      await sleep(700)
      const style = pickBestStyle()
      await applyThumbnailStyle(fabricCanvas, style)

      // Step 5: Add text
      setStep('✍️ Adding viral title...')
      setProgress(75)
      await sleep(500)
      const title = generateTitles('reaction', 1)[0]
      addAutoText(title)

      // Step 6: AI Enhancement
      setStep('⚡ Enhancing with MianSnap AI...')
      setProgress(90)
      await sleep(600)
      await makeItViral(fabricCanvas)

      // Step 7: Finalizing
      setStep('✨ Finalizing...')
      setProgress(100)
      await sleep(400)

      // Calculate score
      const score = calculateViralScore(fabricCanvas)
      setViralScore(score)

      // STAGED REVEAL with emotional pause
      setStep('🎉 Your thumbnail is ready!')
      await sleep(600)

      // Blur canvas
      if (fabricCanvas) {
        const canvasEl = fabricCanvas.getElement()
        if (canvasEl) {
          canvasEl.style.filter = 'blur(20px)'
          canvasEl.style.transition = 'filter 0.8s ease'
        }
      }

      await sleep(400)

      // Reveal with animation
      window.dispatchEvent(new CustomEvent('miansnap:stagedReveal', { detail: { score: score?.score } }))

      await sleep(800)

      // Unblur
      if (fabricCanvas) {
        const canvasEl = fabricCanvas.getElement()
        if (canvasEl) {
          canvasEl.style.filter = 'blur(0px)'
        }
      }

      await sleep(400)

      window.dispatchEvent(new CustomEvent('miansnap:autoModeComplete', { detail: { score: score?.score } }))
      
      // Show CTR potential instead of score
      const ctrMessage = score?.score >= 80 
        ? '🔥 This thumbnail is ready to perform — upload it now!'
        : score?.score >= 60
        ? '⚡ Strong thumbnail! Want even better? Try "Edit" for fine-tuning'
        : '💡 Good start! Click "Edit" to boost your score'
      
      window.showToast?.(ctrMessage, 'success', 5000)

      // Show retry option
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('miansnap:showRetry', { 
          detail: { score: score?.score } 
        }))
      }, 2000)

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
      padding: '22px 24px',
      borderRadius: 16,
      border: 'none',
      background: running
        ? 'linear-gradient(135deg,#6d28d9,#4c1d95)'
        : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      color: '#fff',
      fontSize: 20,
      fontWeight: 900,
      cursor: running ? 'not-allowed' : 'pointer',
      boxShadow: running ? '0 4px 16px rgba(124,58,237,0.3)' : '0 10px 40px rgba(124,58,237,0.6)',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
      letterSpacing: '-0.5px',
      animation: !running ? 'autoModePulse 3s ease-in-out infinite' : 'none',
    },
    progress: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 4,
      width: `${progress}%`,
      background: 'rgba(255,255,255,0.5)',
      transition: 'width 0.3s ease',
      borderRadius: '0 2px 2px 0',
    },
    step: {
      fontSize: 12,
      color: theme.accent,
      textAlign: 'center',
      marginTop: 10,
      minHeight: 18,
      fontWeight: 600,
      animation: 'fadeIn 0.3s ease',
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
            e.currentTarget.style.animation = 'none'
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(124,58,237,0.7)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = running ? '0 4px 16px rgba(124,58,237,0.3)' : '0 10px 40px rgba(124,58,237,0.6)'
          if (!running) e.currentTarget.style.animation = 'autoModePulse 3s ease-in-out infinite'
        }}
      >
        {running ? (
          <>
            <div>⚡ Creating...</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4, fontWeight: 500 }}>{step || 'Working...'}</div>
            <div style={s.progress} />
          </>
        ) : (
          <>
            <div>🚀 Auto Create Thumbnail</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 5, fontWeight: 600 }}>
              ✨ Drop video → AI does everything
            </div>
          </>
        )}
      </button>

      {/* Progress step shown below button when running */}
      {running && step && (
        <div style={s.step}>{step}</div>
      )}

      <style>{`
        @keyframes autoModePulse {
          0%,100% { box-shadow: 0 10px 40px rgba(124,58,237,0.6); }
          50% { box-shadow: 0 10px 56px rgba(124,58,237,0.85), 0 0 0 8px rgba(124,58,237,0.1); }
        }
      `}</style>
      
      {showFrameSelector && (
        <FrameSelector
          onFrameSelect={(frame) => {
            setShowFrameSelector(false)
            setShowRetry(false)
            // Re-run auto mode with selected frame
            runAutoMode()
          }}
        />
      )}

      {/* Retry button — appears after first result */}
      {showRetry && !running && (
        <button
          onClick={() => {
            setShowRetry(false)
            setShowFrameSelector(false)
            runAutoMode()
          }}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 12,
            border: `1px solid ${theme.border}`,
            background: theme.bgTertiary,
            color: theme.text,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 12,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accent
            e.currentTarget.style.background = theme.accentGlow
            e.currentTarget.style.color = theme.accent
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border
            e.currentTarget.style.background = theme.bgTertiary
            e.currentTarget.style.color = theme.text
          }}
        >
          <span>🔁</span>
          <span>Try Another Version</span>
        </button>
      )}
    </div>
  )
}
