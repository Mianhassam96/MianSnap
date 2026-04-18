import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[MianSnap] Uncaught error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      const isFabricError = this.state.error?.message?.includes('Canvas') ||
        this.state.error?.message?.includes('fabric') ||
        this.state.error?.message?.includes('constructor')

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100vh',
          background: '#0a0a1a', color: '#fff', fontFamily: 'Inter, sans-serif',
          gap: 16, padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>{isFabricError ? '⏳' : '⚠️'}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {isFabricError ? 'Loading editor...' : 'Something went wrong'}
          </div>
          <div style={{ fontSize: 13, color: '#a0a0b0', maxWidth: 400, lineHeight: 1.6 }}>
            {isFabricError
              ? 'The canvas library is still loading. Please wait a moment.'
              : this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {isFabricError ? 'Reload' : 'Reload App'}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
