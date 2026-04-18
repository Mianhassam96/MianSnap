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
import MobileTabBar from './components/MobileTabBar'
import MobileDrawer from './components/MobileDrawer'
import SmartWarnings from './components/SmartWarnings'
import DiscoveryHints from './components/DiscoveryHints'
import FeedbackButton from './components/FeedbackButton'
import LandingLayer, { shouldShowLanding } from './components/LandingLayer'
import { installAnalytics, track, trackUpload } from './utils/analytics'
import { setupAutoSave } from './utils/autoSave'
import { setupAlignmentGuides } from './utils/alignmentGuides'
import { makeItViral } from './utils/makeItViral'
import { calculateViralScore } from './utils/viralScore'
import { applyImageAsBackground } from './utils/imageUtils'
import { applyThumbnailStyle } from './utils/thumbnailStyles'

export default function App() {
  const { theme, setActiveRightPanel, setActiveLeftPanel, showBottomPanel, focusMode, toggleFocusMode } = useUIStore()
  const { fabricCanvas, setViralScore, viralScore, setPrevScore } = useCanvasStore()
  const { setVideoFile, clearVideo, videoUrl } = useVideoStore()
  const [showLanding, setShowLanding] = useState(() => shouldShowLanding())
  const [viralRunning, setViralRunning] = useState(false)
  const [viralDone, setViralDone] = useState(false)
  const [viralFlash, setViralFlash] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const autoRanRef = useRef(false)

  useEffect(() => { installAnalytics(); track('app_opened') }, [])

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
      if (f.size > 200 * 1024 * 1024) window.showToast?.('⚠️ Large file — may be slow', 'error', 4000)
      trackUpload(); setVideoFile(f)
    }
    input.click()
  }

  function handleUploadImage() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file || !fabricCanvas) return
      applyImageAsBackground(fabricCanvas, URL.createObjectURL(file), 'cover')
    }
    input.click()
  }

  document.body.style.overflow = showLanding ? 'auto' : 'hidden'

  return (
    <>
      {showLanding && (
        <LandingLayer
          onEnter={() => setShowLanding(false)}
          onDemo={handleDemo}
        />
      )}

      <div style={{
        display: showLanding ? 'none' : 'flex', flexDirection: 'column', height: '100vh',
        background: theme.bg, color: theme.text,
        fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
        overflow: 'hidden',
      }}>
        <Toast />
        <TopBar />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
                    background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.35) 0%, rgba(239,68,68,0.2) 50%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 20,
                    animation: 'viralFlash 0.6s ease-out forwards',
                  }} />
                )}
              </div>

              <ShortcutBar />
              {!viralScore && <SmartWarnings />}
              <DiscoveryHints />

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
                style={{
                  position: 'absolute', bottom: 20, right: 20,
                  padding: '11px 22px', borderRadius: 10, border: 'none',
                  background: viralDone
                    ? 'linear-gradient(135deg,#16a34a,#15803d)'
                    : 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
                  color: '#fff', fontSize: 14, fontWeight: 800,
                  cursor: viralRunning ? 'wait' : 'pointer',
                  boxShadow: viralDone ? '0 4px 20px rgba(22,163,74,0.5)' : '0 6px 28px rgba(239,68,68,0.5)',
                  transition: 'transform 0.15s, box-shadow 0.15s, background 0.3s',
                  display: 'flex', alignItems: 'center', gap: 8,
                  zIndex: 10,
                  animation: !viralRunning && !viralDone ? 'viralPulse 2.5s ease-in-out infinite' : 'none',
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
                {viralRunning ? '⏳ Enhancing...' : viralDone ? '✓ Done!' : '⚡ Make Viral'}
              </button>

              <style>{`
                @keyframes viralPulse {
                  0%,100% { box-shadow: 0 6px 28px rgba(239,68,68,0.5); }
                  50% { box-shadow: 0 6px 40px rgba(239,68,68,0.8), 0 0 0 6px rgba(239,68,68,0.15); }
                }
                @keyframes viralFlash {
                  0% { opacity:1; transform:scale(1); }
                  40% { opacity:0.9; transform:scale(1.01); }
                  100% { opacity:0; transform:scale(1); }
                }
              `}</style>
            </div>

            {showBottomPanel && <BottomPanel />}
          </div>

          {!focusMode && <RightSidebar />}
        </div>

        <MobileTabBar onOpenPanel={() => setMobileDrawerOpen(true)} />
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
