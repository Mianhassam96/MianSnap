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

const SMART_START_KEY = 'miansnap_smart_start_done'

export default function App() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const { projectName } = useProjectStore()
  const [showLanding, setShowLanding] = useState(true)
  const [showSmartStart, setShowSmartStart] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [snapEnabled, setSnapEnabled] = useState(false)

  function enterEditor() {
    setShowLanding(false)
    // Show Smart Start on first visit
    if (!localStorage.getItem(SMART_START_KEY)) {
      setShowSmartStart(true)
    }
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
    return cleanup
  }, [fabricCanvas])

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
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px 24px', overflow: 'hidden',
            background: theme.canvasBg,
            backgroundImage: theme.isDark
              ? 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.04) 0%, transparent 70%)',
          }}>
            <div style={{ width: '100%', maxWidth: 920 }}>
              <CanvasEditor />
            </div>
          </div>
          <BottomPanel />
        </div>

        <RightSidebar />
      </div>
    </div>
  )
}
