import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'

export default function StagedReveal() {
  const { theme } = useUIStore()
  const [visible, setVisible] = useState(false)
  const [score, setScore] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      setScore(e.detail?.score)
      setVisible(true)
      setTimeout(() => setVisible(false), 2000)
    }

    window.addEventListener('miansnap:stagedReveal', handler)
    return () => window.removeEventListener('miansnap:stagedReveal', handler)
  }, [])

  if (!visible) return null

  const ctrLevel = score >= 80 ? 'high' : score >= 60 ? 'good' : 'moderate'
  const messages = {
    high: { icon: '🔥', text: 'High CTR Potential', color: '#4ade80' },
    good: { icon: '⚡', text: 'Good CTR Potential', color: '#facc15' },
    moderate: { icon: '💡', text: 'Moderate CTR', color: '#f87171' },
  }
  const msg = messages[ctrLevel]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9998,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Icon */}
        <div style={{
          fontSize: 100,
          marginBottom: 24,
          animation: 'pulse 1.5s ease infinite',
        }}>{msg.icon}</div>

        {/* Message */}
        <div style={{
          fontSize: 32,
          fontWeight: 900,
          color: msg.color,
          marginBottom: 12,
          letterSpacing: '-1px',
          textShadow: `0 0 20px ${msg.color}88`,
        }}>
          {msg.text}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 16,
          color: '#fff',
          opacity: 0.8,
        }}>
          Your thumbnail is ready to perform
        </div>
      </div>
    </div>
  )
}
