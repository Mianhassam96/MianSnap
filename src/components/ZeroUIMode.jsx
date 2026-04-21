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
  const [phase, setPhase] = useState('upload') // 'upload' | 'creating' | 'reveal' | 'result'
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

  function handleMakeViral() {
    if (viralRunning) return
    setViralRunning(true)
    setPrevScore(score)
    window.dispatchEvent(new CustomEvent('miansnap:makeViral'))
    // Listen for completion
    const done = () => {
      const s = calculateViralScore(fabricCanvas)
      if (s) { setViralScore(s); setScore(s) }
      setViralCount(c => c + 1)
      setViralRunning(false)
      // Update suggestion
      const sc = s?.score ?? 0
      if (sc >= 80) setSuggestion({ icon: '⬇', text: 'Score is high — download and upload now!', action: 'export' })
      else setSuggestion({ icon: '🔁', text: 'Hit Make Viral again to push it higher', action: 'viral' })
      window.removeEventListener('miansnap:viralDone', done)
    }
    window.addEventListener('miansnap:viralDone', done)
    // Fallback timeout
    setTimeout(() => { setViralRunning(false); window.removeEventListener('miansnap:viralDone', done) }, 8000)
  }

  function handleExport() {
    window.dispatchEvent(new CustomEvent('miansnap:export'))
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
      {phase === 'result' && (
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
              <div style={{
                fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 500,
                animation: 'fadeIn 0.4s ease 0.3s both',
              }}>
                {(score?.score ?? 0) >= 75
                  ? `🔥 ${score.score}/100 viral score — ready to upload`
                  : 'Hit Make Viral to boost your CTR score'}
              </div>
            </div>
          )}

          {/* Top bar */}
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

            {/* Score — with improvement indicator */}
            {score && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 20,
                background: `${scoreColor}18`, border: `1px solid ${scoreColor}44`,
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 12 }}>{score.score >= 75 ? '🔥' : score.score >= 50 ? '⚡' : '💡'}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: scoreColor }}>{score.score}/100</span>
                {prevScore && score.score > prevScore.score && (
                  <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 700 }}>
                    +{score.score - prevScore.score} ↑
                  </span>
                )}
                <span style={{ fontSize: 10, color: theme.textMuted }}>
                  {score.score >= 75 ? 'Viral Ready' : score.score >= 50 ? 'Good CTR' : 'Needs boost'}
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

          {/* Guided next step — ONE suggestion */}
          {suggestion && (
            <div style={{
              position: 'fixed', top: 54, left: '50%', transform: 'translateX(-50%)',
              zIndex: 499,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 18px', borderRadius: 20,
              background: theme.isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.35)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.2)',
              animation: 'fadeInDown 0.3s ease',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
              onClick={() => {
                if (suggestion.action === 'viral') handleMakeViral()
                else if (suggestion.action === 'export') handleExport()
                else if (suggestion.action === 'edit') exitZeroMode()
                setSuggestion(null)
              }}
            >
              <span style={{ fontSize: 14 }}>{suggestion.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: theme.accent }}>{suggestion.text}</span>
              <span style={{ fontSize: 11, color: theme.textMuted }}>→</span>
            </div>
          )}

          {/* Bottom action bar */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
            display: 'flex', flexDirection: 'column', gap: 0,
            background: theme.isDark ? 'rgba(10,10,20,0.97)' : 'rgba(255,255,255,0.97)',
            borderTop: `1px solid ${theme.border}`,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          }}>
            {/* Ownership line */}
            <div style={{
              padding: '8px 16px 0',
              fontSize: 11, color: theme.textMuted, textAlign: 'center',
              fontWeight: 500,
            }}>
              {viralCount === 0
                ? '✨ We made this for you — now make it yours'
                : viralCount === 1
                ? '⚡ Getting better — hit Make Viral again to push higher'
                : `🔥 ${viralCount} enhancements applied — looking great!`}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, padding: '10px 16px 12px' }}>
              {/* Make Viral — THE dominant action */}
              <button
                onClick={handleMakeViral}
                disabled={viralRunning}
                style={{
                  flex: 3, padding: '15px 20px', borderRadius: 12, border: 'none',
                  background: viralRunning
                    ? 'linear-gradient(135deg,#6d28d9,#4c1d95)'
                    : 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
                  color: '#fff', fontSize: 16, fontWeight: 900,
                  cursor: viralRunning ? 'wait' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  boxShadow: viralRunning ? 'none' : '0 6px 28px rgba(239,68,68,0.5)',
                  animation: !viralRunning ? 'viralPulse 2.5s ease-in-out infinite' : 'none',
                  letterSpacing: '-0.3px', transition: 'all 0.2s',
                }}
              >
                <span>{viralRunning ? '⏳ Enhancing...' : viralCount > 0 ? '⚡ Improve Again' : '⚡ Make Viral'}</span>
                <span style={{ fontSize: 10, opacity: 0.9, fontWeight: 500 }}>
                  {viralRunning ? 'AI is working...' : '1 click = better CTR'}
                </span>
              </button>

              {/* Export */}
              <button onClick={handleExport} style={{
                flex: 2, padding: '15px 16px', borderRadius: 12, border: 'none',
                background: grad, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
              }}>⬇ Export</button>

              {/* Edit */}
              <button onClick={exitZeroMode} style={{
                flex: 1, padding: '15px 12px', borderRadius: 12,
                border: `1px solid ${theme.border}`, background: theme.bgTertiary,
                color: theme.text, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>✏️ Edit</button>
            </div>
          </div>

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
