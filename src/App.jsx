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
import { setupAutoSave } from './utils/autoSave'
import { setupAlignmentGuides, setupSnapToGrid } from './utils/alignmentGuides'

export default function App() {
  const { theme } = useUIStore()
  const { fabricCanvas } = useCanvasStore()
  const { projectName } = useProjectStore()
  const [showLanding, setShowLanding] = useState(true)
  const [snapEnabled, setSnapEnabled] = useState(false)

  // Auto-save + alignment guides once canvas is ready
  useEffect(() => {
    if (!fabricCanvas) return
    const cleanup = setupAutoSave(fabricCanvas, () => projectName)
    setupAlignmentGuides(fabricCanvas)
    setupSnapToGrid(fabricCanvas, snapEnabled)
    return cleanup
  }, [fabricCanvas])

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: theme.bg, color: theme.text,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden', transition: 'background 0.25s, color 0.25s',
    }}>
      <TopBar onShowLanding={() => setShowLanding(true)} snapEnabled={snapEnabled} onToggleSnap={() => setSnapEnabled(v => !v)} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar />

        {/* Center */}
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
