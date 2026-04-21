import React, { useState, useEffect, useRef } from 'react'
import useUIStore from '../store/useUIStore'
import useCanvasStore from '../store/useCanvasStore'
import useVideoStore from '../store/useVideoStore'
import { makeItViral } from '../utils/makeItViral'
import { calculateViralScore } from '../utils/viralScore'
import { applyThumbnailStyle } from '../utils/thumbnailStyles'
import { generateTitles } from '../utils/titleGenerator'
import { getSuggestedFrames } from '../utils/frameSuggestions'
import { applyImageAsBackground } from '../utils/imageUtils'
import { fabric } from '../lib/fabric'

/**
 * ZERO UI MODE — Full outcome-first flow
 *
 * Phase 1 — upload:   Full-screen upload gate. Nothing else visible.
 * Phase 2 — creating: Full-screen "AI is working" overlay with steps.
 * Phase 3 — result:   Canvas visible, bottom bar: Make Viral · Export · Edit
 */
export default function ZeroUIMode({ children, onExitZeroMode }) {
  const { theme } = useUIStore()
  const { fabricCanvas, setViralScore } = useCanvasStore()
  const { videoUrl, setVideoFile, frames, setFrames, setIsExtracting } = useVideoStore()

  const [zeroMode, setZeroMode] = useState(true)
  const [phase, setPhase] = useState('upload') // 'upload' | 'creating' | 'result' | 'done'
  const [dragging, setDragging] = useState(false)
  const [step, setStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [viralDone, setViralDone] = useState(false)
  const [score, setScore] = useState(null)
  const [prevScore, setPrevScore] = useState(null)
  const [viralCount, setViralCount] = useState(0)
  const [viralRunning, setViralRunning] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [showReveal, setShowReveal] = useState(false)
  const [showQuickFix, setShowQuickFix] = useState(false)
  const [proactiveNudge, setProactiveNudge] = useState(null)
  const [inactivityTimer, setInactivityTimer] = useState(null)
  const [aiPersonality, setAiPersonality] = useState('')
  const [autoImproveRan, setAutoImproveRan] = useState(false)
  const [steeringChoice, setSteeringChoice] = useState(null)
  const beforeSnapshotRef = useRef(null)

  // Restore preference
  useEffect(() => {
    if (localStorage.getItem('miansnap_zero_mode') === 'false') setZeroMode(false)
  }, [])

  useEffect(() => {
    localStorage.setItem('miansnap_zero_mode', zeroMode)
  }, [zeroMode])

  function exitZeroMode() {
    setZeroMode(false)
    onExitZeroMode?.()
  }

  // ── Auto-generate as soon as video is ready ──────────────────
  useEffect(() => {
    if (!videoUrl || !fabricCanvas || phase !== 'upload') return
    setPhase('creating')
    runAutoGenerate()
  }, [videoUrl, fabricCanvas])

  async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }

  async function runAutoGenerate() {
    try {
      setProgress(5); setStep('🧠 Analyzing your video...')
      await sleep(400)

      // Extract frames
      setProgress(20); setStep('🎬 Finding best moment...')
      setIsExtracting(true)
      const suggested = await getSuggestedFrames(videoUrl, 16)
      setFrames(suggested)
      setIsExtracting(false)
      const best = suggested.find(f => f.isBest) || suggested[0]

      // Apply best frame
      setProgress(40); setStep('🖼 Loading best frame...')
      await applyFrame(best)
      await sleep(300)

      // Apply style
      setProgress(55); setStep('🎨 Designing thumbnail...')
      const styles = ['dramatic', 'gaming', 'viral', 'mrbeast']
      applyThumbnailStyle(fabricCanvas, styles[Math.floor(Math.random() * styles.length)])
      await sleep(400)

      // Add text
      setProgress(68); setStep('✍️ Adding viral title...')
      const title = generateTitles('reaction', 1)[0]
      addText(title)
      await sleep(300)

      // Make viral
      setProgress(82); setStep('⚡ Enhancing with AI...')
      await makeItViral(fabricCanvas)
      await sleep(300)

      // Score
      setProgress(95); setStep('📊 Calculating viral score...')
      const s = calculateViralScore(fabricCanvas)
      if (s) { setViralScore(s); setScore(s) }
      await sleep(400)

      setProgress(100); setStep('✨ Your thumbnail is ready!')
      await sleep(600)

      // Dramatic reveal moment
      setShowReveal(true)
      await sleep(1800)
      setShowReveal(false)

      setPhase('result')
      setViralDone(true)

      // Guided suggestion based on score
      const sc = s?.score ?? 0
      if (sc < 60) setSuggestion({ icon: '⚡', text: 'Boost your CTR — hit Make Viral again', action: 'viral' })
      else if (sc < 80) setSuggestion({ icon: '✏️', text: 'Edit your title to make it more punchy', action: 'edit' })
      else setSuggestion({ icon: '⬇', text: 'Looking great — download and upload it now!', action: 'export' })

    } catch (err) {
      console.error('[ZeroUIMode] Auto-generate failed:', err)
      setPhase('result') // still show result phase so user can use editor
      window.showToast?.('⚠️ Auto-generate had an issue — use Make Viral manually', 'error', 4000)
    }
  }

  function applyFrame(frame) {
    return new Promise(resolve => {
      if (!fabric || !fabricCanvas) { resolve(); return }
      fabric.Image.fromURL(frame.dataUrl, (img) => {
        if (!img) { resolve(); return }
        const scale = Math.max(fabricCanvas.width / img.width, fabricCanvas.height / img.height)
        img.set({
          scaleX: scale, scaleY: scale,
          left: (fabricCanvas.width - img.width * scale) / 2,
          top: (fabricCanvas.height - img.height * scale) / 2,
          selectable: false, evented: false,
        })
        fabricCanvas.setBackgroundImage(img, () => { fabricCanvas.renderAll(); resolve() })
      })
    })
  }

  function addText(title) {
    if (!fabric || !fabricCanvas) return
    // Remove old auto-text
    fabricCanvas.getObjects().filter(o => o._autoText).forEach(o => fabricCanvas.remove(o))
    const t = new fabric.IText(title, {
      left: fabricCanvas.width / 2, top: fabricCanvas.height * 0.82,
      originX: 'center', originY: 'center',
      fontFamily: 'Impact', fontSize: 88,
      fill: '#ffff00', stroke: '#000000', strokeWidth: 4,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 24, offsetX: 2, offsetY: 3 }),
      _autoText: true,
    })
    fabricCanvas.add(t)
    fabricCanvas.renderAll()
  }

  function handleFileSelect(file) {
    if (!file) return
    const type = String(file.type || '')
    if (type.startsWith('video/')) {
      if (file.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 4000)
      setVideoFile(file)
    } else if (type.startsWith('image/')) {
      window.dispatchEvent(new CustomEvent('miansnap:dropImage', { detail: { file } }))
      setPhase('result') // images don't need frame extraction
    } else {
      window.showToast?.('❌ Use a video or image file (MP4, MOV, JPG, PNG)', 'error', 3000)
    }
  }

  function openPicker() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'video/*,image/*'
    input.onchange = (e) => handleFileSelect(e.target.files[0])
    input.click()
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  // AI personality messages — escalate with each improvement
  const AI_VOICES = [
    "Let's make this go viral 🔥",
    "Getting dangerous (in a good way) ⚡",
    "Okay this one might break CTR limits 🚀",
    "This thumbnail is becoming unstoppable 💀",
    "Maximum viral potential reached 🏆",
  ]

  // Steering choices — shown after each AI action so user feels in control
  const STEERING_CHOICES = [
    {
      question: "Keep this style?",
      a: { label: "🔥 Push more extreme", desc: "Bolder colors, stronger contrast" },
      b: { label: "✨ Keep it clean", desc: "Subtle, professional look" },
    },
    {
      question: "How's the intensity?",
      a: { label: "⚡ More aggressive", desc: "Max contrast, max impact" },
      b: { label: "🎯 Lock this version", desc: "This looks great — save it" },
    },
    {
      question: "What next?",
      a: { label: "🚀 One more boost", desc: "Push the score higher" },
      b: { label: "⬇ Download now", desc: "This is ready to upload" },
    },
  ]

  function handleSteeringA(choice) {
    setSteeringChoice(null)
    if (choice.a.label.includes('extreme') || choice.a.label.includes('aggressive')) {
      // Apply more aggressive style
      const styles = ['dramatic', 'gaming', 'viral']
      applyThumbnailStyle(fabricCanvas, styles[Math.floor(Math.random() * styles.length)])
      runViralImprovement()
    } else if (choice.a.label.includes('boost')) {
      runViralImprovement()
    }
  }

  function handleSteeringB(choice) {
    setSteeringChoice(null)
    if (choice.b.label.includes('clean')) {
      // Apply cleaner style
      applyThumbnailStyle(fabricCanvas, 'minimal')
      runViralImprovement()
    } else if (choice.b.label.includes('Lock') || choice.b.label.includes('Download')) {
      handleExport()
    }
  }

  function getAiVoice(count) {
    return AI_VOICES[Math.min(count, AI_VOICES.length - 1)]
  }

  function runViralImprovement() {
    if (viralRunning || !fabricCanvas) return
    setViralRunning(true)
    setSteeringChoice(null) // clear previous steering
    setPrevScore(s => s || score)
    window.dispatchEvent(new CustomEvent('miansnap:makeViral'))
    const done = () => {
      const s = calculateViralScore(fabricCanvas)
      if (s) { setViralScore(s); setScore(s) }
      setViralCount(c => {
        const next = c + 1
        setAiPersonality(getAiVoice(next))
        // Clear personality after 3s, then show steering choice
        setTimeout(() => {
          setAiPersonality('')
          // Show steering moment — user nudges direction
          const sc = s?.score ?? 0
          if (sc < 88) {
            const choices = STEERING_CHOICES[Math.min(next - 1, STEERING_CHOICES.length - 1)]
            setSteeringChoice(choices)
          } else {
            // System declares completion
            setTimeout(() => setPhase('done'), 1000)
          }
        }, 2800)
        return next
      })
      setViralRunning(false)
      window.removeEventListener('miansnap:viralDone', done)
    }
    window.addEventListener('miansnap:viralDone', done)
    setTimeout(() => { setViralRunning(false); window.removeEventListener('miansnap:viralDone', done) }, 8000)
  }

  function handleMakeViral() { runViralImprovement() }

  function handleExport() {
    window.dispatchEvent(new CustomEvent('miansnap:export'))
  }

  // ── AUTO-IMPROVE once, 1.5s after result appears — no click needed ──
  useEffect(() => {
    if (phase !== 'result' || autoImproveRan || !fabricCanvas) return
    const sc = score?.score ?? 0
    if (sc >= 80) return // already great, don't auto-improve
    const timer = setTimeout(() => {
      setAutoImproveRan(true)
      setAiPersonality("Let's make this go viral 🔥")
      runViralImprovement()
    }, 1500)
    return () => clearTimeout(timer)
  }, [phase, fabricCanvas])

  // ── Proactive nudge — fires after 5s inactivity ──
  useEffect(() => {
    if (phase !== 'result') return
    const timer = setTimeout(() => {
      if (viralRunning) return
      const sc = score?.score ?? 0
      if (sc < 75) setProactiveNudge({ icon: '⚡', text: 'AI can push this higher — tap Improve', action: 'viral' })
      else setProactiveNudge({ icon: '🚀', text: 'This is ready — upload it now!', action: 'export' })
    }, 5000)
    return () => clearTimeout(timer)
  }, [phase, score, viralCount])

  // ── Auto Fix Everything — 1 smart button, AI decides ──
  function handleAutoFixEverything() {
    setShowQuickFix(false)
    // AI decides: if text is small → boost it, then run viral
    if (fabricCanvas) {
      const textObjs = fabricCanvas.getObjects().filter(o => o.type === 'i-text' || o.type === 'textbox')
      textObjs.forEach(t => { if (t.fontSize < 72) t.set('fontSize', 80) })
      if (textObjs.length === 0 && fabric) {
        const titles = generateTitles('reaction', 1)
        addText(titles[0])
      }
      fabricCanvas.renderAll()
    }
    runViralImprovement()
    window.showToast?.('🤖 AI is fixing everything...', 'info', 2000)
  }

  function handleQuickFixText() {
    if (!fabricCanvas) return
    const objs = fabricCanvas.getObjects().filter(o => o.type === 'i-text' || o.type === 'textbox')
    if (objs.length === 0) {
      if (!fabric) return
      const t = new fabric.IText('YOUR TITLE HERE', {
        left: fabricCanvas.width / 2, top: fabricCanvas.height * 0.82,
        originX: 'center', originY: 'center',
        fontFamily: 'Impact', fontSize: 88,
        fill: '#ffff00', stroke: '#000000', strokeWidth: 4,
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.9)', blur: 24, offsetX: 2, offsetY: 3 }),
      })
      fabricCanvas.add(t); fabricCanvas.setActiveObject(t)
      t.enterEditing(); t.selectAll(); fabricCanvas.renderAll()
      window.showToast?.('✏️ Click the text to edit it', 'info', 2500)
    } else {
      fabricCanvas.setActiveObject(objs[0])
      objs[0].enterEditing(); objs[0].selectAll(); fabricCanvas.renderAll()
      window.showToast?.('✏️ Edit your title', 'info', 2500)
    }
    setShowQuickFix(false)
  }

  function handleQuickFixStyle() {
    const styles = ['dramatic', 'gaming', 'viral', 'mrbeast', 'sports']
    applyThumbnailStyle(fabricCanvas, styles[Math.floor(Math.random() * styles.length)])
    window.showToast?.('🎨 New style applied', 'success', 2000)
    setShowQuickFix(false)
  }

  function handleNewFile() {
    setPhase('upload')
    setProgress(0)
    setStep('')
    setScore(null)
    setPrevScore(null)
    setViralDone(false)
    setViralCount(0)
    setSuggestion(null)
    setShowReveal(false)
    setAiPersonality('')
    setAutoImproveRan(false)
    setSteeringChoice(null)
    setProactiveNudge(null)
    window.dispatchEvent(new CustomEvent('miansnap:resetCanvas'))
  }

  // Not in zero mode — render full editor
  if (!zeroMode) return <>{children}</>

  const grad = 'linear-gradient(135deg,#7c3aed,#4f46e5)'
  const scoreColor = score?.score >= 75 ? '#4ade80' : score?.score >= 50 ? '#facc15' : '#f87171'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Hide all editor chrome in zero mode */}
      <style>{`
        .ms-left-sidebar  { display: none !important; }
        .ms-right-sidebar { display: none !important; }
        .ms-bottom-panel  { display: none !important; }
        .ms-topbar-selects { display: none !important; }
        .ms-fab           { display: none !important; }
        .ms-zoom-controls { display: none !important; }
      `}</style>

      {/* Canvas always renders underneath */}
      {children}

      {/* ══════════════════════════════════════════════════════
          PHASE 1 — UPLOAD GATE
      ══════════════════════════════════════════════════════ */}
      {phase === 'upload' && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: theme.isDark
              ? 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(124,58,237,0.2) 0%, #0a0a0f 65%)'
              : 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(124,58,237,0.12) 0%, #f5f5ff 65%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false) }}
          onDrop={onDrop}
        >
          {/* Top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
          }}>
            <span style={{
              fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px',
              background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: "'Montserrat',sans-serif",
            }}>MianSnap</span>
            <button onClick={exitZeroMode} style={{
              background: 'none', border: `1px solid ${theme.border}`,
              color: theme.textMuted, fontSize: 11, padding: '5px 14px',
              borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted }}
            >Advanced Editor →</button>
          </div>

          {/* Upload card */}
          <div
            onClick={openPicker}
            style={{
              width: 'min(500px, 88vw)',
              padding: 'clamp(32px,5vw,56px) clamp(24px,4vw,48px)',
              borderRadius: 24,
              border: `2px dashed ${dragging ? '#7c3aed' : 'rgba(124,58,237,0.35)'}`,
              background: dragging
                ? (theme.isDark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.07)')
                : (theme.isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.85)'),
              textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: dragging
                ? '0 0 0 6px rgba(124,58,237,0.15), 0 24px 60px rgba(124,58,237,0.25)'
                : '0 12px 48px rgba(0,0,0,0.1)',
              animation: 'borderPulse 3s ease-in-out infinite',
            }}
          >
            {/* Icon */}
            <div style={{
              fontSize: 72, marginBottom: 18, lineHeight: 1,
              animation: dragging ? 'none' : 'bounce 2s ease-in-out infinite',
              filter: dragging ? 'drop-shadow(0 0 24px #7c3aed)' : 'none',
              transition: 'filter 0.2s',
            }}>
              {dragging ? '📥' : '🎬'}
            </div>

            <div style={{
              fontSize: 'clamp(20px,3.5vw,30px)', fontWeight: 900,
              color: dragging ? '#7c3aed' : theme.text,
              marginBottom: 10, letterSpacing: '-0.8px',
              fontFamily: "'Montserrat',sans-serif", lineHeight: 1.15,
            }}>
              {dragging ? 'Drop to create!' : 'Drop your video here'}
            </div>

            <div style={{
              fontSize: 14, color: theme.textSecondary,
              marginBottom: 28, lineHeight: 1.65, fontWeight: 500,
            }}>
              AI picks best frame · adds viral text · enhances it<br />
              <span style={{ color: theme.textMuted, fontSize: 12 }}>Ready in ~10 seconds</span>
            </div>

            {/* CTA button */}
            <button
              onClick={(e) => { e.stopPropagation(); openPicker() }}
              style={{
                padding: '16px 52px', borderRadius: 14, border: 'none',
                background: grad, color: '#fff',
                fontSize: 16, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(124,58,237,0.55)',
                letterSpacing: '-0.3px', display: 'block', width: '100%',
                animation: 'ctaPulse 2.5s ease-in-out infinite',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(124,58,237,0.7)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.55)' }}
            >
              📥 Upload Video or Image
            </button>

            <div style={{ marginTop: 14, fontSize: 11, color: theme.textMuted }}>
              🔒 100% private · nothing uploaded · free forever
            </div>
          </div>

          {/* Format pills */}
          <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['MP4', 'MOV', 'WebM', 'JPG', 'PNG'].map(f => (
              <span key={f} style={{
                padding: '3px 11px', borderRadius: 20, fontSize: 11,
                background: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${theme.border}`, color: theme.textMuted,
              }}>{f}</span>
            ))}
          </div>

          <style>{`
            @keyframes borderPulse {
              0%,100% { border-color: rgba(124,58,237,0.35); }
              50% { border-color: rgba(124,58,237,0.65); }
            }
            @keyframes ctaPulse {
              0%,100% { box-shadow: 0 8px 32px rgba(124,58,237,0.55); }
              50% { box-shadow: 0 8px 52px rgba(124,58,237,0.85), 0 0 0 8px rgba(124,58,237,0.1); }
            }
            @keyframes bounce {
              0%,100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHASE 2 — CREATING (full-screen AI overlay)
      ══════════════════════════════════════════════════════ */}
      {phase === 'creating' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 600,
          background: theme.isDark ? 'rgba(10,10,20,0.96)' : 'rgba(245,245,255,0.96)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
          animation: 'fadeIn 0.3s ease',
        }}>
          {/* Pulsing icon */}
          <div style={{
            fontSize: 80, marginBottom: 28,
            animation: 'spin 3s linear infinite',
            filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.6))',
          }}>⚡</div>

          <div style={{
            fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900,
            color: theme.text, marginBottom: 8,
            fontFamily: "'Montserrat',sans-serif", letterSpacing: '-0.5px',
          }}>Creating your thumbnail...</div>

          <div style={{
            fontSize: 14, color: theme.accent, fontWeight: 600,
            marginBottom: 32, minHeight: 22,
            animation: 'fadeIn 0.3s ease',
          }}>{step}</div>

          {/* Progress bar */}
          <div style={{
            width: 'min(360px, 80vw)', height: 6,
            background: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: 'linear-gradient(90deg,#7c3aed,#ef4444,#f59e0b)',
              width: `${progress}%`,
              transition: 'width 0.4s ease',
              boxShadow: '0 0 8px rgba(124,58,237,0.6)',
            }} />
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: theme.textMuted }}>
            {progress}% complete
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: scale(1) rotate(0deg); }
              25% { transform: scale(1.1) rotate(5deg); }
              75% { transform: scale(0.95) rotate(-5deg); }
              100% { transform: scale(1) rotate(0deg); }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          PHASE 3 — RESULT (canvas visible, action bar)
      ══════════════════════════════════════════════════════ */}
      {(phase === 'result' || phase === 'done') && (
        <>
          {/* ── Dramatic reveal overlay ── */}
          {showReveal && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 700,
              background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              animation: 'fadeIn 0.3s ease',
              fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
            }}>
              <div style={{ fontSize: 88, marginBottom: 16, animation: 'revealPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                {(score?.score ?? 0) >= 75 ? '🔥' : '⚡'}
              </div>
              <div style={{
                fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: '#fff',
                marginBottom: 8, letterSpacing: '-1px',
                fontFamily: "'Montserrat',sans-serif",
                animation: 'revealPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
              }}>
                {(score?.score ?? 0) >= 75 ? 'Your click-winning thumbnail!' : 'Your thumbnail is ready!'}
              </div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 500, animation: 'fadeIn 0.4s ease 0.3s both' }}>
                {(score?.score ?? 0) >= 75 ? `🔥 ${score.score}/100 — ready to upload` : 'Hit Make Viral to boost your CTR'}
              </div>
            </div>
          )}

          {/* ── DONE STATE — system-declared completion ── */}
          {phase === 'done' && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 650,
              background: theme.isDark ? 'rgba(10,10,20,0.97)' : 'rgba(245,245,255,0.97)',
              backdropFilter: 'blur(16px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontSize: 80, marginBottom: 20, animation: 'revealPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>🏆</div>
              <div style={{
                fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 900, color: theme.text,
                marginBottom: 8, letterSpacing: '-0.8px', fontFamily: "'Montserrat',sans-serif",
                textAlign: 'center',
              }}>This thumbnail is optimized.</div>
              <div style={{
                fontSize: 14, color: theme.textSecondary, marginBottom: 8,
                textAlign: 'center', lineHeight: 1.6, maxWidth: 360,
              }}>
                No further improvements needed.
              </div>
              <div style={{
                fontSize: 12, color: '#4ade80', marginBottom: 32,
                padding: '6px 16px', borderRadius: 20,
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                fontWeight: 600,
              }}>
                {score ? `${score.score}/100 viral score · Maximum CTR potential` : 'Maximum CTR potential reached'}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => { handleExport(); setPhase('result') }} style={{
                  padding: '16px 40px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.5)',
                }}>⬇ Download Now</button>
                <button onClick={handleNewFile} style={{
                  padding: '16px 28px', borderRadius: 12,
                  border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                  color: theme.text, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>🔄 Create Another</button>
              </div>
              <button onClick={() => setPhase('result')} style={{
                marginTop: 16, background: 'none', border: 'none',
                color: theme.textMuted, fontSize: 12, cursor: 'pointer',
              }}>← Back to thumbnail</button>
            </div>
          )}

          {/* Top bar — only in result phase */}
          {phase === 'result' && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px',
              background: theme.isDark ? 'rgba(10,10,20,0.97)' : 'rgba(255,255,255,0.97)',
              borderBottom: `1px solid ${theme.border}`,
              backdropFilter: 'blur(12px)',
            }}>
              <span style={{
                fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px',
                background: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontFamily: "'Montserrat',sans-serif", flexShrink: 0,
              }}>MianSnap</span>

              {/* Score with animated climb */}
              {score && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 14px', borderRadius: 20,
                  background: `${scoreColor}18`, border: `1px solid ${scoreColor}44`,
                  flexShrink: 0, transition: 'all 0.4s ease',
                }}>
                  <span style={{ fontSize: 13 }}>{score.score >= 88 ? '🏆' : score.score >= 75 ? '🔥' : score.score >= 50 ? '⚡' : '💡'}</span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: scoreColor, transition: 'color 0.4s' }}>{score.score}/100</span>
                  {prevScore && score.score > prevScore.score && (
                    <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 800, animation: 'revealPop 0.4s ease' }}>
                      +{score.score - prevScore.score} ↑
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: theme.textMuted }}>
                    {score.score >= 88 ? 'Maximum CTR' : score.score >= 75 ? 'Viral Ready' : score.score >= 50 ? 'Good CTR' : 'Needs boost'}
                  </span>
                </div>
              )}

              <div style={{ flex: 1 }} />
              <button onClick={handleNewFile} style={{
                padding: '6px 12px', borderRadius: 7,
                border: `1px solid ${theme.border}`, background: 'transparent',
                color: theme.textMuted, fontSize: 11, cursor: 'pointer',
              }}>🔄 New</button>
              <button onClick={exitZeroMode} style={{
                padding: '6px 14px', borderRadius: 7,
                border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                color: theme.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>✏️ Full Editor</button>
            </div>
          )}

          {/* AI personality voice — appears after each improvement */}
          {phase === 'result' && aiPersonality && !viralRunning && (
            <div style={{
              position: 'fixed', top: 54, left: '50%', transform: 'translateX(-50%)',
              zIndex: 499,
              padding: '8px 20px', borderRadius: 20,
              background: 'linear-gradient(135deg,rgba(124,58,237,0.9),rgba(239,68,68,0.8))',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              fontSize: 12, fontWeight: 700, color: '#fff',
              animation: 'fadeInDown 0.3s ease',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}>
              {aiPersonality}
            </div>
          )}

          {/* ── STEERING CARD — user nudges direction after AI acts ── */}
          {phase === 'result' && steeringChoice && !viralRunning && !aiPersonality && (
            <div style={{
              position: 'fixed', top: 54, left: '50%', transform: 'translateX(-50%)',
              zIndex: 499,
              background: theme.isDark ? 'rgba(13,13,24,0.97)' : 'rgba(255,255,255,0.97)',
              border: `1px solid rgba(124,58,237,0.3)`,
              borderRadius: 16, padding: '14px 16px',
              boxShadow: '0 8px 32px rgba(124,58,237,0.2)',
              backdropFilter: 'blur(16px)',
              animation: 'fadeInDown 0.3s ease',
              width: 'min(320px, 88vw)',
            }}>
              {/* Question */}
              <div style={{
                fontSize: 12, fontWeight: 700, color: theme.accent,
                marginBottom: 10, textAlign: 'center', letterSpacing: 0.3,
              }}>
                🤖 {steeringChoice.question}
              </div>
              {/* Two choices */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleSteeringA(steeringChoice)}
                  style={{
                    flex: 1, padding: '10px 10px', borderRadius: 10,
                    border: `1px solid rgba(239,68,68,0.4)`,
                    background: 'rgba(239,68,68,0.08)',
                    color: theme.text, cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = '#ef4444' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{steeringChoice.a.label}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{steeringChoice.a.desc}</div>
                </button>
                <button
                  onClick={() => handleSteeringB(steeringChoice)}
                  style={{
                    flex: 1, padding: '10px 10px', borderRadius: 10,
                    border: `1px solid rgba(124,58,237,0.4)`,
                    background: 'rgba(124,58,237,0.08)',
                    color: theme.text, cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor = '#7c3aed' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{steeringChoice.b.label}</div>
                  <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{steeringChoice.b.desc}</div>
                </button>
              </div>
              {/* Dismiss */}
              <button
                onClick={() => setSteeringChoice(null)}
                style={{
                  marginTop: 8, width: '100%', background: 'none', border: 'none',
                  color: theme.textMuted, fontSize: 10, cursor: 'pointer', padding: '2px',
                }}
              >skip →</button>
            </div>
          )}

          {/* Proactive nudge — fires after inactivity */}
          {phase === 'result' && proactiveNudge && !aiPersonality && !steeringChoice && (
            <div style={{
              position: 'fixed', top: 54, left: '50%', transform: 'translateX(-50%)',
              zIndex: 499,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 20,
              background: theme.isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.35)',
              backdropFilter: 'blur(10px)',
              animation: 'fadeInDown 0.3s ease',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
              onClick={() => {
                if (proactiveNudge.action === 'viral') handleMakeViral()
                else handleExport()
                setProactiveNudge(null)
              }}
            >
              <span>{proactiveNudge.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>{proactiveNudge.text}</span>
              <span style={{ fontSize: 10, color: theme.textMuted }}>tap →</span>
              <button onClick={(e) => { e.stopPropagation(); setProactiveNudge(null) }}
                style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: 10 }}>✕</button>
            </div>
          )}

          {/* Quick Fix panel — 1 smart button + 2 targeted options */}
          {phase === 'result' && showQuickFix && (
            <div style={{
              position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
              zIndex: 501,
              background: theme.isDark ? 'rgba(13,13,24,0.98)' : 'rgba(255,255,255,0.98)',
              border: `1px solid ${theme.border}`,
              borderRadius: 16, padding: '14px',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(16px)',
              animation: 'fadeInDown 0.2s ease',
              width: 'min(340px, 90vw)',
            }}>
              {/* ONE smart button — AI decides everything */}
              <button onClick={handleAutoFixEverything} style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
                color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                marginBottom: 10,
                boxShadow: '0 4px 20px rgba(239,68,68,0.4)',
              }}>
                🤖 Auto Fix Everything
                <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 400, marginTop: 2 }}>AI decides what to improve</div>
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleQuickFixText} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                  color: theme.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>✏️ Edit Text</button>
                <button onClick={handleQuickFixStyle} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                  color: theme.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>🎨 New Style</button>
                <button onClick={exitZeroMode} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8,
                  border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                  color: theme.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>🛠 Editor</button>
              </div>
              <button onClick={() => setShowQuickFix(false)} style={{
                marginTop: 8, width: '100%', background: 'none', border: 'none',
                color: theme.textMuted, fontSize: 10, cursor: 'pointer',
              }}>✕ Close</button>
            </div>
          )}

          {/* Bottom action bar */}
          {phase === 'result' && (
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
              display: 'flex', flexDirection: 'column',
              background: theme.isDark ? 'rgba(10,10,20,0.97)' : 'rgba(255,255,255,0.97)',
              borderTop: `1px solid ${theme.border}`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
            }}>
              {/* Curiosity loop line — escalates */}
              <div style={{
                padding: '6px 16px 0', fontSize: 11, textAlign: 'center', fontWeight: 600,
                color: viralCount >= 3 ? '#4ade80' : viralCount >= 1 ? theme.accent : theme.textMuted,
                transition: 'color 0.4s',
              }}>
                {viralRunning
                  ? '⚡ AI is improving your thumbnail...'
                  : viralCount === 0
                  ? '✨ We made this for you — now make it yours'
                  : viralCount === 1
                  ? '⚡ Getting dangerous (in a good way) — click again?'
                  : viralCount === 2
                  ? '🔥 This is getting seriously viral — one more push?'
                  : `🏆 ${viralCount} improvements — can it reach 100?`}
              </div>

              <div style={{ display: 'flex', gap: 8, padding: '8px 12px 10px' }}>
                {/* Improve — dominant, curiosity-driven label */}
                <button onClick={handleMakeViral} disabled={viralRunning} style={{
                  flex: 3, padding: '14px 16px', borderRadius: 12, border: 'none',
                  background: viralRunning
                    ? 'linear-gradient(135deg,#6d28d9,#4c1d95)'
                    : viralCount >= 2
                    ? 'linear-gradient(135deg,#ef4444,#f59e0b,#7c3aed)'
                    : 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
                  color: '#fff', fontSize: 15, fontWeight: 900,
                  cursor: viralRunning ? 'wait' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  boxShadow: viralRunning ? 'none' : '0 6px 28px rgba(239,68,68,0.5)',
                  animation: !viralRunning ? 'viralPulse 2.5s ease-in-out infinite' : 'none',
                  transition: 'all 0.2s',
                }}>
                  <span>
                    {viralRunning ? '⏳ Improving...'
                      : viralCount === 0 ? '⚡ Make Viral'
                      : viralCount === 1 ? '⚡ Push It Higher'
                      : viralCount === 2 ? '🔥 Make It Dangerous'
                      : '🏆 Max It Out'}
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.85, fontWeight: 400 }}>
                    {viralRunning ? 'AI working...' : score ? `${score.score}/100 → can go higher` : '1 click = better CTR'}
                  </span>
                </button>

                {/* Export */}
                <button onClick={handleExport} style={{
                  flex: 2, padding: '14px 12px', borderRadius: 12, border: 'none',
                  background: grad, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                }}>⬇ Export</button>

                {/* Fix — 1 button, opens smart panel */}
                <button onClick={() => setShowQuickFix(q => !q)} style={{
                  flex: 1, padding: '14px 10px', borderRadius: 12,
                  border: `1px solid ${showQuickFix ? '#7c3aed' : theme.border}`,
                  background: showQuickFix ? 'rgba(124,58,237,0.1)' : theme.bgTertiary,
                  color: showQuickFix ? '#7c3aed' : theme.text,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>✏️ Fix</button>
              </div>
            </div>
          )}

          <style>{`
            @keyframes viralPulse {
              0%,100% { box-shadow: 0 6px 28px rgba(239,68,68,0.5); }
              50% { box-shadow: 0 6px 44px rgba(239,68,68,0.85), 0 0 0 6px rgba(239,68,68,0.1); }
            }
            @keyframes revealPop {
              0% { opacity: 0; transform: scale(0.5); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </>
      )}
    </div>
  )
}

export function useZeroMode() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('miansnap_zero_mode') !== 'false')
  useEffect(() => {
    const handler = () => setEnabled(localStorage.getItem('miansnap_zero_mode') !== 'false')
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
  return enabled
}
