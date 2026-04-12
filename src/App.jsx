import React from 'react'
import useUIStore from './store/useUIStore'
import TopBar from './components/TopBar'
import LeftSidebar from './components/LeftSidebar'
import RightSidebar from './components/RightSidebar'
import CanvasEditor from './components/CanvasEditor'
import BottomPanel from './components/BottomPanel'

export default function App() {
  const { theme } = useUIStore()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: theme.bg, color: theme.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar />

        {/* Center: canvas + bottom panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Canvas area */}
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, overflow: 'hidden', background: theme.bg,
          }}>
            <div style={{ width: '100%', maxWidth: 900 }}>
              <CanvasEditor />
            </div>
          </div>

          {/* Bottom video panel */}
          <BottomPanel />
        </div>

        <RightSidebar />
      </div>
    </div>
  )
}
