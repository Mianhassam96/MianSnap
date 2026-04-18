import React, { useEffect, useState } from 'react'
import useUIStore from './store/useUIStore'
import useCanvasStore from './store/useCanvasStore'
import useProjectStore from './store/useProjectStore'
import useVideoStore from './store/useVideoStore'
import TopBar from './components/TopBar'
import LeftSidebar from './components/LeftSidebar'
import RightSidebar from './components/RightSidebar'
import CanvasEditor from './components/CanvasEditor'
import BottomPanel from './components/BottomPanel'
import LandingPage from './components/LandingPage'
import SmartStart from './components/SmartStart'
import ProjectsPanel from './components/ProjectsPanel'
import CanvasEmptyState from './components/CanvasEmptyState'
import ShortcutBar from './components/ShortcutBar'
import Toast from './components/Toast'
import CanvasHint from './components/CanvasHint'
import ContextToolbar from './components/ContextToolbar'
import NextStepNudge from './components/NextStepNudge'
import VideoLoadingOverlay from './components/VideoLoadingOverlay'
import MobileTabBar from './components/MobileTabBar'
import MobileDrawer from './components/MobileDrawer'
import SmartWarnings from './components/SmartWarnings'
import Onboarding, { shouldShowOnboarding } from './components/Onboarding'
import { prefs } from './utils/prefs'
import { setupAutoSave } from './utils/autoSave'
import { setupAlignmentGuides, setupSnapToGrid } from './utils/alignmentGuides'
import { makeItViral } from './utils/makeItViral'
import { calculateViralScore } from './utils/viralScore'
import { applyImageAsBackground, isMobileDevice } from './utils/imageUtils'
export default function App() {
  const { theme, setActiveRightPanel, focusMode, toggleFocusMode, setActiveLeftPanel } = useUIStore()
  const { fabricCanvas, setViralScore, viralScore } = useCanvasStore()
  const { projectName } = useProjectStore()
  const { setVideoFile } = useVideoStore()
  const [showLanding, setShowLanding] = useState(true)
  const [showSmartStart, setShowSmartStart] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [snapEnabled, setSnapEnabled] = useState(false)
  const [viralRunning, setViralRunning] = useState(false)
  const [viralDone, setViralDone] = useState(false)
  const [viralFlash, setViralFlash] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  function enterEditor() {
    setShowLanding(false)
    if (shouldShowOnboarding()) {
      setShowOnboarding(true)
    } else {
      setShowSmartStart(true)
    }
  }

  function handleSmartStartDone() {
    setShowSmartStart(false)
    setActiveRightPanel('score') // default to score tab
  }

  useEffect(() => {
    if (!fabricCanvas) return
    const cleanup = setupAutoSave(fabricCanvas, () => projectName)
    setupAlignmentGuides(fabricCanvas)
    setupSnapToGrid(fabricCanvas, snapEnabled)

    // Live score on every canvas change
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

  async function handleMakeViral() {
    if (!fabricCanvas || viralRunning) return
    setViralRunning(true)
    setViralDone(false)
    // Flash animation — canvas glow burst
    setViralFlash(true)
    setTimeout(() => setViralFlash(false), 600)
    const result = await makeItViral(fabricCanvas)
    const score = calculateViralScore(fabricCanvas)
    if (score) { setViralScore(score); setActiveRightPanel('score') }
    setViralRunning(false)
    setViralDone(true)
    // Show specific steps as individual toasts
    if (result?.steps?.length) {
      result.steps.forEach((step, i) => {
        setTimeout(() => window.showToast?.(step, 'success', 2500), i * 350)
      })
    } else {
      window.showToast?.('⚡ Viral enhancements applied!', 'success')
    }
    setTimeout(() => setViralDone(false), 3000)
  }

  function handleUploadVideo() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'video/*'
    input.onchange = (e) => { const f = e.target.files[0]; if (f) setVideoFile(f) }
    input.click()
  }

  function handleUploadImage() {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file || !fabricCanvas) return
      const url = URL.createObjectURL(file)
      applyImageAsBackground(fabricCanvas, url, 'cover')
    }
    input.click()
  }

  if (showLanding) {
    document.body.style.overflow = 'auto'
    return <LandingPage onEnter={enterEditor} />
  }
  document.body.style.overflow = 'hidden'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: theme.bg, color: theme.text,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      {showSmartStart && <SmartStart onDone={handleSmartStartDone} />}
      {showOnboarding && <Onboarding onDone={() => { setShowOnboarding(false); setShowSmartStart(true) }} />}
      {showProjects && <ProjectsPanel onClose={() => setShowProjects(false)} />}
      <Toast />

      <TopBar
        onShowLanding={() => setShowLanding(true)}
        onShowProjects={() => setShowProjects(true)}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled(v => !v)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!focusMode && <LeftSidebar />}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Canvas area */}
          <div className="ms-canvas-area" style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px 24px', overflow: 'hidden',
            background: theme.canvasBg,
            backgroundImage: theme.isDark
              ? 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)',
            position: 'relative',
          }}>
            {/* Empty state guide */}
            <CanvasEmptyState
              onUploadVideo={handleUploadVideo}
              onUploadImage={handleUploadImage}
              onUseTemplate={() => { setActiveLeftPanel('styles') }}
            />

            <div style={{ width: '100%', maxWidth: 920, position: 'relative' }}>
              <CanvasEditor />
              {/* Video loading overlay */}
              <VideoLoadingOverlay />
              {/* Contextual toolbar — appears above selected image */}
              <ContextToolbar />
              {/* Canvas onboarding hint — fades after 5s */}
              <CanvasHint />
              {/* Make Viral flash overlay */}
              {viralFlash && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 8,
                  background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.35) 0%, rgba(239,68,68,0.2) 50%, transparent 70%)',
                  pointerEvents: 'none', zIndex: 20,
                  animation: 'viralFlash 0.6s ease-out forwards',
                }} />
              )}
            </div>

            {/* Keyboard shortcut hint */}
            <ShortcutBar />

            {/* Smart warnings — inline above canvas */}
            {!viralScore && <SmartWarnings />}

            {/* Next step nudge */}
            <NextStepNudge onMakeViral={handleMakeViral} />

            {/* Live score badge — top center above canvas */}
            {viralScore && (
              <div
                className="ms-score-badge"
                onClick={() => setActiveRightPanel('score')}
                role="button"
                tabIndex={0}
                aria-label={`Viral score: ${viralScore.score} out of 100. Click to see breakdown.`}
                onKeyDown={(e) => e.key === 'Enter' && setActiveRightPanel('score')}
                title="Click to see full score breakdown"
                style={{
                  position: 'absolute', top: 12, left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                  background: theme.isDark ? 'rgba(13,13,24,0.92)' : 'rgba(255,255,255,0.92)',
                  border: `1px solid ${viralScore.score >= 75 ? theme.success : viralScore.score >= 50 ? theme.warning : theme.danger}44`,
                  backdropFilter: 'blur(8px)',
                  boxShadow: theme.shadowSm,
                  zIndex: 10, transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)' }}
              >
                <span style={{ fontSize: 12 }}>
                  {viralScore.score >= 75 ? '🔥' : viralScore.score >= 50 ? '⚡' : '⚠️'}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: viralScore.score >= 75 ? theme.success : viralScore.score >= 50 ? theme.warning : theme.danger,
                }}>
                  {viralScore.score}/100
                </span>
                <span style={{ fontSize: 11, color: theme.textMuted }}>
                  {viralScore.score >= 75 ? 'Viral Ready' : viralScore.score >= 50 ? 'Looking Good' : 'Needs Work'}
                </span>
              </div>
            )}

            {/* Floating Make Viral FAB */}
            <button
              className="ms-fab"
              onClick={handleMakeViral}
              disabled={viralRunning}
              aria-label={viralRunning ? 'Enhancing thumbnail...' : viralDone ? 'Enhancement done' : 'Make this thumbnail viral in one click'}
              title="Make this thumbnail viral in 1 click — contrast, glow, face focus & text"
              style={{
                position: 'absolute', bottom: 24, right: 24,
                padding: '12px 24px', borderRadius: 10, border: 'none',
                background: viralDone
                  ? 'linear-gradient(135deg,#16a34a,#15803d)'
                  : 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
                color: '#fff', fontSize: 14, fontWeight: 800,
                cursor: viralRunning ? 'wait' : 'pointer',
                boxShadow: viralDone
                  ? '0 4px 20px rgba(22,163,74,0.5)'
                  : '0 6px 28px rgba(239,68,68,0.5)',
                transition: 'transform 0.15s, box-shadow 0.15s, background 0.3s',
                display: 'flex', alignItems: 'center', gap: 8,
                zIndex: 10, letterSpacing: '-0.2px',
                // Pulse when idle to draw attention
                animation: !viralRunning && !viralDone ? 'viralPulse 2.5s ease-in-out infinite' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animation = 'none'
                if (!viralRunning) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(239,68,68,0.7)'
                }
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
                0%, 100% { box-shadow: 0 6px 28px rgba(239,68,68,0.5); }
                50% { box-shadow: 0 6px 40px rgba(239,68,68,0.8), 0 0 0 6px rgba(239,68,68,0.15); }
              }
              @keyframes viralFlash {
                0%   { opacity: 1; transform: scale(1); }
                40%  { opacity: 0.9; transform: scale(1.01); }
                100% { opacity: 0; transform: scale(1); }
              }
            `}</style>
          </div>

          {!focusMode && <BottomPanel />}
        </div>

        {!focusMode && <RightSidebar />}
      </div>

      {/* Mobile bottom tab bar + drawer */}
      <MobileTabBar onOpenPanel={() => setMobileDrawerOpen(true)} />
      <MobileDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />
    </div>
  )
}
