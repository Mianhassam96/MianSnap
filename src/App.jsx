import React, { useEffect, useState, useRef } from 'react'
import useUIStore from './store/useUIStore'
import useCanvasStore from './store/useCanvasStore'
import useVideoStore from './store/useVideoStore'
import TopBar from './components/TopBar'
import LeftSidebar from './components/LeftSidebar'
import RightSidebar from './components/RightSidebar'
import CanvasEditor from './components/CanvasEditor'
import BottomPanel from './components/BottomPanel'
import CanvasEmptyState from './components/CanvasEmptyState'
import CanvasHint from './components/CanvasHint'
import ShortcutBar from './components/ShortcutBar'
import Toast from './components/Toast'
import ContextToolbar from './components/ContextToolbar'
import VideoLoadingOverlay from './components/VideoLoadingOverlay'
import MobileDrawer from './components/MobileDrawer'
import SmartWarnings from './components/SmartWarnings'
import DiscoveryHints from './components/DiscoveryHints'
import FeedbackButton from './components/FeedbackButton'
import LandingLayer, { shouldShowLanding } from './components/LandingLayer'
import Onboarding, { shouldShowOnboarding } from './components/Onboarding'
import { installAnalytics, track, trackUpload } from './utils/analytics'
import { setupAutoSave } from './utils/autoSave'
import { setupAlignmentGuides } from './utils/alignmentGuides'
import { makeItViral } from './utils/makeItViral'
import { calculateViralScore } from './utils/viralScore'
import { applyImageAsBackground } from './utils/imageUtils'
import { applyThumbnailStyle } from './utils/thumbnailStyles'

export default function App() {
  const { theme, setActiveRightPanel: _setActiveRightPanel, setActiveLeftPanel, showBottomPanel, focusMode, toggleFocusMode } = useUIStore()

  function setActiveRightPanel(panel) {
    _setActiveRightPanel(panel)
    setShowRightPanel(true)
  }
  const { fabricCanvas, setViralScore, viralScore, setPrevScore } = useCanvasStore()
  const { setVideoFile, clearVideo, videoUrl } = useVideoStore()
  const [showLanding, setShowLanding] = useState(() => shouldShowLanding())
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [viralRunning, setViralRunning] = useState(false)
  const [viralDone, setViralDone] = useState(false)
  const [viralFlash, setViralFlash] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [discoveryHint, setDiscoveryHint] = useState(null)
  const [showRightPanel, setShowRightPanel] = useState(false)
  const autoRanRef = useRef(false)

  useEffect(() => { installAnalytics(); track('app_opened') }, [])

  // Auto-save visual feedback
  useEffect(() => {
    if (!fabricCanvas) return
    let saveTimer = null
    const onChange = () => {
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('miansnap:saved'))
      }, 2200)
    }
    fabricCanvas.on('object:added', onChange)
    fabricCanvas.on('object:modified', onChange)
    fabricCanvas.on('object:removed', onChange)
    return () => {
      clearTimeout(saveTimer)
      fabricCanvas.off('object:added', onChange)
      fabricCanvas.off('object:modified', onChange)
      fabricCanvas.off('object:removed', onChange)
    }
  }, [fabricCanvas])

  // Listen for save event
  useEffect(() => {
    const handler = () => { setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2000) }
    window.addEventListener('miansnap:saved', handler)
    return () => window.removeEventListener('miansnap:saved', handler)
  }, [])

  // Feature discovery hint — rotate after 8s inactivity
  useEffect(() => {
    const hints = [
      { icon: '💡', text: 'Try Idea Starter in the Styles tab', action: () => setActiveLeftPanel('styles') },
      { icon: '🔥', text: 'Try Trending Styles — updates daily', action: () => setActiveLeftPanel('styles') },
      { icon: '🎬', text: 'Try YouTube Pack — full thumbnail in 1 click', action: () => setActiveLeftPanel('styles') },
    ]
    let hintIdx = 0
    let timer = null
    const show = () => {
      setDiscoveryHint(hints[hintIdx % hints.length])
      hintIdx++
      setTimeout(() => setDiscoveryHint(null), 5000)
    }
    const reset = () => { clearTimeout(timer); timer = setTimeout(show, 12000) }
    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    reset()
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [])

  // Demo mode — apply sample style instantly
  async function handleDemo() {
    setShowLanding(false)
    // Wait for canvas
    let attempts = 0
    const waitForCanvas = () => new Promise(res => {
      const check = () => {
        const fc = useCanvasStore.getState().fabricCanvas
        if (fc || attempts++ > 30) res(fc)
        else setTimeout(check, 100)
      }
      check()
    })
    const fc = await waitForCanvas()
    if (fc) {
      applyThumbnailStyle(fc, 'dramatic')
      window.showToast?.('⚡ Demo applied — this is what Make Viral does!', 'success', 3000)
    }
    track('demo_clicked')
  }

  useEffect(() => {
    if (!fabricCanvas) return
    const cleanup = setupAutoSave(fabricCanvas, () => 'MianSnap')
    setupAlignmentGuides(fabricCanvas)
    const autoScore = () => {
      const score = calculateViralScore(fabricCanvas)
      if (score) setViralScore(score)
    }
    fabricCanvas.on('object:added', autoScore)
    fabricCanvas.on('object:modified', autoScore)
    fabricCanvas.on('object:removed', autoScore)
    return () => {
      cleanup()
      fabricCanvas.off('object:added', autoScore)
      fabricCanvas.off('object:modified', autoScore)
      fabricCanvas.off('object:removed', autoScore)
    }
  }, [fabricCanvas])

  useEffect(() => {
    if (!videoUrl || !fabricCanvas || autoRanRef.current) return
    autoRanRef.current = true
    const t = setTimeout(() => {
      window.showToast?.('⚡ Auto-enhancing your thumbnail...', 'info', 2000)
    }, 3000)
    return () => clearTimeout(t)
  }, [videoUrl, fabricCanvas])

  useEffect(() => {
    const handler = () => handleMakeViral()
    window.addEventListener('miansnap:makeViral', handler)
    return () => window.removeEventListener('miansnap:makeViral', handler)
  }, [fabricCanvas, viralRunning])

  useEffect(() => {
    const handler = () => { clearVideo(); autoRanRef.current = false }
    window.addEventListener('miansnap:resetCanvas', handler)
    return () => window.removeEventListener('miansnap:resetCanvas', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      const file = e.detail?.file
      if (!file) return
      if (file.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 4000)
      autoRanRef.current = false
      setVideoFile(file)
    }
    window.addEventListener('miansnap:dropVideo', handler)
    return () => window.removeEventListener('miansnap:dropVideo', handler)
  }, [])

  async function handleMakeViral() {
    if (!fabricCanvas || viralRunning) return
    setViralRunning(true)
    setViralDone(false)
    if (viralScore) setPrevScore(viralScore)
    setViralFlash(true)
    setTimeout(() => setViralFlash(false), 600)
    const result = await makeItViral(fabricCanvas)
    const score = calculateViralScore(fabricCanvas)
    if (score) { setViralScore(score); setActiveRightPanel('score') }
    setViralRunning(false)
    setViralDone(true)
    window.dispatchEvent(new CustomEvent('miansnap:viralDone'))
    track('make_viral_clicked')
    if (result?.steps?.length) {
      result.steps.forEach((step, i) => {
        setTimeout(() => window.showToast?.(step, 'success', 2000), i * 300)
      })
    } else {
      window.showToast?.('⚡ Done!', 'success')
    }
    setTimeout(() => setViralDone(false), 3000)
  }

  function handleUploadVideo() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'video/*'
    input.onchange = (e) => {
      const f = e.target.files[0]
      if (!f) return
      if (!f.type.startsWith('video/')) {
        window.showToast?.('❌ Unsupported file type. Please upload a video (MP4, MOV, WebM)', 'error', 4000)
        return
      }
      if (f.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 4000)
      window.showToast?.('🎬 Loading video...', 'info', 2000)
      trackUpload(); setVideoFile(f)
    }
    input.click()
  }

  function handleUploadImage() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      // Validate file type
      if (!file.type.startsWith('image/')) {
        window.showToast?.('❌ Unsupported file type. Please upload an image (JPG, PNG, WebP, GIF)', 'error', 4000)
        return
      }
      // Validate file size (50MB max for images)
      if (file.size > 50 * 1024 * 1024) {
        window.showToast?.('⚠️ Image too large (max 50MB)', 'error', 4000)
        return
      }
      if (!fabricCanvas) return
      window.showToast?.('🖼 Loading image...', 'info', 1500)
      applyImageAsBackground(fabricCanvas, URL.createObjectURL(file), 'cover', () => {
        window.showToast?.('✓ Image loaded', 'success', 1500)
      })
    }
    input.click()
  }

  document.body.style.overflow = showLanding ? 'auto' : 'hidden'

  return (
    <>
      {showLanding && (
        <LandingLayer
          onEnter={() => { setShowLanding(false); if (shouldShowOnboarding()) setShowOnboarding(true) }}
          onDemo={handleDemo}
        />
      )}

      {showOnboarding && (
        <Onboarding onDone={() => setShowOnboarding(false)} />
      )}

      <div style={{
        display: showLanding ? 'none' : 'flex', flexDirection: 'column', height: '100vh',
        background: theme.bg, color: theme.text,
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        overflow: 'hidden',
        animation: 'fadeIn 0.35s ease',
      }}>
        <Toast />
        <TopBar />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }} className="ms-main-layout">
          {!focusMode && <LeftSidebar />}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <div className="ms-canvas-area" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px 20px', overflow: 'hidden',
              background: theme.canvasBg,
              backgroundImage: theme.isDark
                ? 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)',
              position: 'relative',
            }}>
              <CanvasEmptyState
                onUploadVideo={handleUploadVideo}
                onUploadImage={handleUploadImage}
                onUseTemplate={() => setActiveLeftPanel('styles')}
                onQuickMode={() => setActiveLeftPanel('styles')}
              />

              <div style={{ width: '100%', maxWidth: 920, position: 'relative' }}>
                <CanvasEditor />
                <VideoLoadingOverlay />
                <ContextToolbar />
                <CanvasHint />
                {viralFlash && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 8,
                    background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.5) 0%, rgba(239,68,68,0.3) 40%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 20,
                    animation: 'viralFlash 0.8s ease-out forwards',
                    boxShadow: 'inset 0 0 60px rgba(124,58,237,0.4)',
                  }} />
                )}
              </div>

              <ShortcutBar />
              {!viralScore && <SmartWarnings />}
              <DiscoveryHints />

              {/* Auto-save indicator */}
              {savedFlash && (
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  background: theme.isDark ? 'rgba(13,13,24,0.88)' : 'rgba(255,255,255,0.88)',
                  border: `1px solid ${theme.border}`, borderRadius: 20,
                  padding: '4px 12px', fontSize: 10, color: theme.success,
                  fontWeight: 600, zIndex: 8, pointerEvents: 'none',
                  backdropFilter: 'blur(8px)', animation: 'fadeInDown 0.2s ease',
                }}>
                  ✔ Changes saved locally
                </div>
              )}

              {/* Feature discovery hint */}
              {discoveryHint && (
                <div style={{
                  position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg,rgba(124,58,237,0.92),rgba(79,70,229,0.92))',
                  borderRadius: 20, padding: '7px 16px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 11, color: '#fff', fontWeight: 600,
                  cursor: 'pointer', zIndex: 8,
                  animation: 'fadeInDown 0.25s ease',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                }}
                  onClick={() => { discoveryHint.action?.(); setDiscoveryHint(null) }}
                >
                  <span>{discoveryHint.icon}</span>
                  <span>{discoveryHint.text}</span>
                  <span style={{ opacity: 0.7, fontSize: 10 }}>→</span>
                </div>
              )}

              {viralScore && (
                <div
                  onClick={() => setActiveRightPanel('score')}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveRightPanel('score')}
                  style={{
                    position: 'absolute', top: 10, left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                    background: theme.isDark ? 'rgba(13,13,24,0.92)' : 'rgba(255,255,255,0.92)',
                    border: `1px solid ${viralScore.score >= 75 ? theme.success : viralScore.score >= 50 ? theme.warning : theme.danger}44`,
                    backdropFilter: 'blur(8px)', boxShadow: theme.shadowSm,
                    zIndex: 10, transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)' }}
                >
                  <span style={{ fontSize: 11 }}>
                    {viralScore.score >= 75 ? '🔥' : viralScore.score >= 50 ? '⚡' : '⚠️'}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: viralScore.score >= 75 ? theme.success : viralScore.score >= 50 ? theme.warning : theme.danger,
                  }}>
                    {viralScore.score}/100
                  </span>
                  <span style={{ fontSize: 10, color: theme.textMuted }}>
                    {viralScore.score >= 75 ? 'Viral Ready' : viralScore.score >= 50 ? 'Good' : 'Needs Work'}
                  </span>
                </div>
              )}

              <button
                className="ms-fab"
                onClick={handleMakeViral}
                disabled={viralRunning}
                title="Auto-enhance: boosts contrast, focuses face, adds glow + vignette, scores your thumbnail"
                style={{
                  position: 'absolute', bottom: 20, right: 20,
                  padding: '13px 26px', borderRadius: 12, border: 'none',
                  background: viralDone
                    ? 'linear-gradient(135deg,#16a34a,#15803d)'
                    : 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
                  color: '#fff', fontSize: 15, fontWeight: 900,
                  cursor: viralRunning ? 'wait' : 'pointer',
                  boxShadow: viralDone ? '0 4px 20px rgba(22,163,74,0.5)' : '0 8px 32px rgba(239,68,68,0.6)',
                  transition: 'transform 0.15s, box-shadow 0.15s, background 0.3s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  zIndex: 10,
                  animation: !viralRunning && !viralDone ? 'viralPulse 2s ease-in-out infinite' : 'none',
                  letterSpacing: '-0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animation = 'none'
                  if (!viralRunning) { e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(239,68,68,0.7)' }
                }}
                onMouseLeave={(e) => {
                  if (!viralRunning && !viralDone) e.currentTarget.style.animation = 'viralPulse 2.5s ease-in-out infinite'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.boxShadow = viralDone ? '0 4px 20px rgba(22,163,74,0.5)' : '0 6px 28px rgba(239,68,68,0.5)'
                }}
              >
                <span>{viralRunning ? '⏳ Enhancing...' : viralDone ? '✓ Done!' : '⚡ Make Viral'}</span>
                {!viralRunning && !viralDone && (
                  <span style={{ fontSize: 9, opacity: 0.85, fontWeight: 400, letterSpacing: 0.3 }}>
                    MianSnap AI · auto-enhance + score
                  </span>
                )}
              </button>

              <style>{`
                @keyframes viralPulse {
                  0%,100% { box-shadow: 0 8px 32px rgba(239,68,68,0.6); transform: scale(1); }
                  50% { box-shadow: 0 8px 48px rgba(239,68,68,0.9), 0 0 0 8px rgba(239,68,68,0.12); transform: scale(1.02); }
                }
                @keyframes viralFlash {
                  0% { opacity:0; transform:scale(0.95); }
                  20% { opacity:1; transform:scale(1.02); }
                  60% { opacity:0.8; transform:scale(1.01); }
                  100% { opacity:0; transform:scale(1); }
                }
              `}</style>
            </div>

            {showBottomPanel && <BottomPanel />}
          </div>

          {!focusMode && showRightPanel && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowRightPanel(false)}
                style={{
                  position: 'absolute', top: 8, right: 8, zIndex: 10,
                  width: 22, height: 22, borderRadius: 5, border: 'none',
                  background: 'transparent', color: theme.textMuted,
                  cursor: 'pointer', fontSize: 12, lineHeight: 1,
                }}
                title="Close panel"
              >✕</button>
              <RightSidebar />
            </div>
          )}
        </div>

        {/* Mobile quick actions only — no tab bar */}
        <div className="ms-mobile-tabs" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 198,
          display: 'flex', gap: 8, padding: '10px 12px',
          background: theme.isDark ? 'rgba(10,10,20,0.97)' : 'rgba(255,255,255,0.97)',
          borderTop: `1px solid ${theme.border}`,
          backdropFilter: 'blur(10px)',
        }}>
          <button onClick={() => setMobileDrawerOpen(true)} style={{
            flex: 1, padding: '10px 4px', borderRadius: 8, border: `1px solid ${theme.border}`,
            background: theme.bgTertiary, color: theme.text, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>✏️ Tools</button>
          <button onClick={handleMakeViral} style={{
            flex: 3, padding: '10px 4px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
            color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 3px 14px rgba(239,68,68,0.4)',
          }}>⚡ Make Viral</button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('miansnap:export'))} style={{
            flex: 1, padding: '10px 4px', borderRadius: 8, border: 'none',
            background: theme.accent, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>⬇ Save</button>
        </div>
        <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />
        <FeedbackButton />

        <style>{`
          .ms-mobile-upload { display: none; }
          @media (max-width: 768px) { .ms-mobile-upload { display: flex !important; } }
        `}</style>
        <button className="ms-mobile-upload" onClick={handleUploadVideo} style={{
          position: 'fixed', bottom: 72, left: 16, zIndex: 199,
          alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 24, border: 'none',
          background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          color: '#fff', fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(124,58,237,0.5)',
        }}>+ Upload</button>
      </div>
    </>
  )
}
