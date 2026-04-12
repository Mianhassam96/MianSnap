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
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden', transition: 'background 0.2s, color 0.2s',
    }}>
      <TopBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar />

        {/* Center */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Canvas area */}
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
