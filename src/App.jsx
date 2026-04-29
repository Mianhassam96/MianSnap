import React, { useState, useCallback } from 'react'
import InputScreen from './components/InputScreen.jsx'
import AnalyzingScreen from './components/AnalyzingScreen.jsx'
import TrustCard from './components/TrustCard.jsx'
import { analyzeContent } from './utils/trustEngine.js'

// App states: 'input' | 'analyzing' | 'result'
export default function App() {
  const [screen, setScreen] = useState('input')
  const [result, setResult] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState(null)

  const handleAnalyze = useCallback(async (content) => {
    if (!content.trim()) return
    setInputValue(content)
    setError(null)
    setScreen('analyzing')
    try {
      const data = await analyzeContent(content)
      setResult(data)
      setScreen('result')
    } catch (err) {
      setError('Analysis failed. Please try again.')
      setScreen('input')
    }
  }, [])

  const handleReset = useCallback(() => {
    setScreen('input')
    setResult(null)
    setError(null)
  }, [])

  const handleAnalyzeAnother = useCallback(() => {
    setScreen('input')
    setResult(null)
    setError(null)
    setInputValue('')
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a14 0%, #0d0d1f 50%, #0a0a14 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* Ambient glow blobs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {screen === 'input' && (
          <InputScreen
            onAnalyze={handleAnalyze}
            initialValue={inputValue}
            error={error}
          />
        )}
        {screen === 'analyzing' && (
          <AnalyzingScreen content={inputValue} />
        )}
        {screen === 'result' && result && (
          <TrustCard
            result={result}
            originalContent={inputValue}
            onReset={handleReset}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        )}
      </div>
    </div>
  )
}
