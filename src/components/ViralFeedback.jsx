import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'

export default function ViralFeedback() {
  const { theme } = useUIStore()
  const [visible, setVisible] = useState(false)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const handler = (e) => {
      const enhancements = e.detail?.steps || [
        '✨ Face enhanced',
        '🔥 Contrast boosted',
        '🎯 Focus optimized',
        '💫 Glow applied',
        '🌟 Ready to perform',
      ]
      setSteps(enhancements)
      setVisible(true)
      setCurrentStep(0)

      // Animate through steps
      enhancements.forEach((_, i) => {
        setTimeout(() => setCurrentStep(i), i * 400)
      })

      // Hide after all steps
      setTimeout(() => setVisible(false), enhancements.length * 400 + 1000)
    }

    window.addEventListener('miansnap:viralDone', handler)
    return () => window.removeEventListener('miansnap:viralDone', handler)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'scaleIn 0.3s ease',
      }}>
        {/* Main icon */}
        <div style={{
          fontSize: 120,
          marginBottom: 24,
          animation: 'pulse 1s ease infinite',
        }}>⚡</div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 200,
        }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: i <= currentStep ? '#4ade80' : theme.textMuted,
                opacity: i <= currentStep ? 1 : 0.3,
                transform: i === currentStep ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease',
                animation: i === currentStep ? 'fadeInDown 0.3s ease' : 'none',
              }}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          width: 300,
          height: 4,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 2,
          margin: '32px auto 0',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            background: 'linear-gradient(90deg,#7c3aed,#4ade80)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>
    </div>
  )
}
