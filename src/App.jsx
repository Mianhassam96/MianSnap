import React, { useEffect } from 'react'
import useStore from './store/useStore'
import CanvasEditor from './components/CanvasEditor'
import VideoFramePicker from './components/VideoFramePicker'
import CreatorPacks from './components/CreatorPacks'
import SafeZoneOverlay from './components/SafeZoneOverlay'
import ViralScore from './components/ViralScore'
import Toolbar from './components/Toolbar'

const PANELS = [
  { id: 'frames', label: '🎬 Frames' },
  { id: 'packs', label: '🎨 Packs' },
  { id: 'safezone', label: '📐 Safe Zone' },
  { id: 'score', label: '⚡ Score' },
]

const styles = {
  app: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0f', color: '#fff' },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 20px',
    borderBottom: '1px solid #1a1a2e',
    background: '#0d0d18',
    flexShrink: 0,
  },
  logo: { fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  tagline: { fontSize: 11, color: '#555', marginLeft: 4 },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: 280, borderRight: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', background: '#0d0d18', flexShrink: 0 },
  tabs: { display: 'flex', borderBottom: '1px solid #1a1a2e' },
  tab: {
    flex: 1,
    padding: '9px 4px',
    fontSize: 11,
    textAlign: 'center',
    cursor: 'pointer',
    color: '#555',
    border: 'none',
    background: 'none',
    transition: 'color 0.15s',
    borderBottom: '2px solid transparent',
  },
  tabActive: { color: '#7c3aed', borderBottom: '2px solid #7c3aed' },
  panelContent: { flex: 1, overflowY: 'auto', padding: 14 },
  canvasWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
    overflow: 'hidden',
  },
  canvasContainer: { width: '100%', maxWidth: 900, position: 'relative' },
  toolbarWrap: { width: '100%', maxWidth: 900 },
  placeholder: { color: '#333', fontSize: 14, textAlign: 'center' },
}

export default function App() {
  const { activePanel, setActivePanel, selectedFrame } = useStore()

  // Load Fabric.js from CDN
  useEffect(() => {
    if (window.fabric) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js'
    script.onload = () => console.log('Fabric.js loaded')
    document.head.appendChild(script)
  }, [])

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>MianSnap</div>
        <div style={styles.tagline}>Viral Thumbnail Intelligence Engine</div>
      </header>

      <div style={styles.body}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.tabs}>
            {PANELS.map((p) => (
              <button
                key={p.id}
                style={{ ...styles.tab, ...(activePanel === p.id ? styles.tabActive : {}) }}
                onClick={() => setActivePanel(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={styles.panelContent}>
            {activePanel === 'frames' && <VideoFramePicker />}
            {activePanel === 'packs' && <CreatorPacks />}
            {activePanel === 'safezone' && <SafeZoneOverlay />}
            {activePanel === 'score' && <ViralScore />}
          </div>
        </aside>

        {/* Canvas area */}
        <main style={styles.canvasWrap}>
          {!selectedFrame && (
            <div style={styles.placeholder}>
              Upload a video and pick a frame to start editing
            </div>
          )}
          <div style={styles.canvasContainer}>
            <CanvasEditor />
          </div>
          <div style={styles.toolbarWrap}>
            <Toolbar />
          </div>
        </main>
      </div>
    </div>
  )
}
