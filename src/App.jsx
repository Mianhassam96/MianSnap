import React, { useEffect, useState } from 'react'
import useUIStore from './store/useUIStore'
import useCanvasStore from './store/useCanvasStore'
import useProjectStore from './store/useProjectStore'
import TopBar from './components/TopBar'
import LeftSidebar from './components/LeftSidebar'
import RightSidebar from './components/RightSidebar'
import CanvasEditor from './components/CanvasEditor'
import BottomPanel from './components/BottomPanel'
import LandingPage from './components/LandingPage'
import SmartStart from './components/SmartStart'
import ProjectsPanel from './components/ProjectsPanel'
import { setupAutoSave } from './utils/autoSave'
import { setupAlignmentGuides, setupSnapToGrid } from './utils/alignmentGuides'
import { makeItViral } from './utils/makeItViral'
import { calculateViralScore } from './utils/viralScore'

const SMART_START_KEY = 'miansnap_smart_start_done'

export default function App() {
  const { theme, setActiveRightPanel } = useUIStore()
  const { fabricCanvas, setViralScore } = useCanvasStore()
  const { projectName } = useProjectStore()
  const [showLanding, setShowLanding] = useState(true)
  const [showSmartStart, setShowSmartStart] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [snapEnabled, setSnapEnabled] = useState(false)
  const [viralRunning, setViralRunning] = useState(false)
  const [viralDone, setViralDone] = useState(false)

  function enterEditor() {
    setShowLanding(false)
    if (!localStorage.getItem(SMART_START_KEY)) setShowSmartStart(true)
  }

  function handleSmartStartDone() {
    localStorage.setItem(SMART_START_KEY, '1')
    setShowSmartStart(false)
  }

  useEffect(() => {
    if (!fabricCanvas) return
    const cleanup = setupAutoSave(fabricCanvas, () => projectName)
    setupAlignmentGuides(fabricCanvas)
    setupSnapToGrid(fabricCanvas, snapEnabled)

    // Auto-score when canvas changes
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
    await makeItViral(fabricCanvas)
    const score = calculateViralScore(fabricCanvas)
    if (score) { setViralScore(score); setActiveRightPanel('score') }
    setViralRunning(false)
    setViralDone(true)
    setTimeout(() => setViralDone(false), 3000)
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
      {showProjects && <ProjectsPanel onClose={() => setShowProjects(false)} />}

      <TopBar
        onShowLanding={() => setShowLanding(true)}
        onShowProjects={() => setShowProjects(true)}
        snapEnabled={snapEnabled}
        onToggleSnap={() => setSnapEnabled(v => !v)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Canvas area */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px 24px', overflow: 'hidden',
            background: theme.canvasBg,
            backgroundImage: theme.isDark
              ? 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)',
            position: 'relative',
          }}>
            <div style={{ width: '100%', maxWidth: 920 }}>
              <CanvasEditor />
            </div>

            {/* Floating "Make Viral" button */}
            <button
              onClick={handleMakeViral}
              disabled={viralRunning}
              title="One-click AI enhancement"
              style={{
                position: 'absolute', bottom: 24, right: 24,
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: viralDone
                  ? 'linear-gradient(135deg,#16a34a,#15803d)'
                  : 'linear-gradient(135deg,#f59e0b,#ef4444,#7c3aed)',
                backgroundSize: '200% auto',
                color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: viralRunning ? 'wait' : 'pointer',
                boxShadow: viralDone
                  ? '0 4px 20px rgba(22,163,74,0.5)'
                  : '0 4px 24px rgba(239,68,68,0.45)',
                transition: 'transform 0.15s, box-shadow 0.15s, background 0.3s',
                display: 'flex', alignItems: 'center', gap: 7,
                zIndex: 10,
                animation: viralRunning ? 'pulse 1s infinite' : 'none',
              }}
              onMouseEnter={(e) => { if (!viralRunning) { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(239,68,68,0.6)' } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = viralDone ? '0 4px 20px rgba(22,163,74,0.5)' : '0 4px 24px rgba(239,68,68,0.45)' }}
            >
              {viralRunning ? '⏳ Working...' : viralDone ? '✓ Done!' : '⚡ Make Viral'}
            </button>
          </div>

          <BottomPanel />
        </div>

        <RightSidebar />
      </div>
    </div>
  )
}
