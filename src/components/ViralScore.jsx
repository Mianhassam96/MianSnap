import React from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useUIStore from '../store/useUIStore'

export default function ViralScore() {
  const { viralScore } = useCanvasStore()
  const { theme } = useUIStore()

  const score = viralScore?.score ?? null
  const feedback = viralScore?.feedback ?? []

  const color = score === null ? theme.textMuted
    : score >= 75 ? theme.success
    : score >= 50 ? theme.warning
    : theme.danger

  const label = score === null ? '—'
    : score >= 80 ? '🔥 Viral Ready'
    : score >= 65 ? '⚡ Looking Good'
    : score >= 50 ? '⚠️ Needs Work'
    : '❌ Low CTR Risk'

  const s = {
    wrap: { display: 'flex', flexDirection: 'column', gap: 0 },

    // Big score display
    scoreCard: {
      background: theme.bgTertiary, borderRadius: 12,
      padding: '18px 14px 14px', textAlign: 'center',
      border: `1px solid ${score !== null ? color + '44' : theme.border}`,
      marginBottom: 10, position: 'relative', overflow: 'hidden',
    },
    scoreBg: {
      position: 'absolute', inset: 0, opacity: 0.04,
      background: score !== null ? color : 'transparent',
    },
    scoreNum: {
      fontSize: 52, fontWeight: 900, lineHeight: 1, color,
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: '-2px',
    },
    scoreDenom: { fontSize: 16, color: theme.textMuted, fontWeight: 400 },
    scoreLabel: {
      fontSize: 12, fontWeight: 700, color, marginTop: 6,
      letterSpacing: 0.3,
    },
    barWrap: {
      height: 6, borderRadius: 3, background: theme.border,
      marginTop: 10, overflow: 'hidden',
    },
    barFill: {
      height: '100%', borderRadius: 3,
      background: score !== null
        ? `linear-gradient(90deg, ${color}, ${color}aa)`
        : theme.border,
      width: `${score ?? 0}%`,
      transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
    },

    // Feedback items
    feedbackList: { display: 'flex', flexDirection: 'column', gap: 5 },
    item: (type) => ({
      padding: '7px 10px', borderRadius: 7, fontSize: 11, lineHeight: 1.45,
      display: 'flex', alignItems: 'flex-start', gap: 6,
      background: type === 'good'
        ? (theme.isDark ? 'rgba(74,222,128,0.08)' : 'rgba(22,163,74,0.06)')
        : (theme.isDark ? 'rgba(248,113,113,0.08)' : 'rgba(220,38,38,0.06)'),
      color: type === 'good' ? theme.success : theme.danger,
      border: `1px solid ${type === 'good'
        ? (theme.isDark ? 'rgba(74,222,128,0.2)' : 'rgba(22,163,74,0.2)')
        : (theme.isDark ? 'rgba(248,113,113,0.2)' : 'rgba(220,38,38,0.2)')}`,
    }),
    itemIcon: { flexShrink: 0, marginTop: 1 },

    // Empty state
    empty: {
      textAlign: 'center', padding: '24px 12px',
      color: theme.textMuted, fontSize: 12, lineHeight: 1.6,
    },
    emptyIcon: { fontSize: 28, marginBottom: 8 },

    // Tips
    tip: {
      marginTop: 10, padding: '8px 10px', borderRadius: 7,
      background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
      color: theme.accent, fontSize: 10, lineHeight: 1.5,
    },
  }

  const TIPS_BY_SCORE = score === null
    ? '💡 Add text and elements to canvas — score updates live'
    : score >= 80
    ? '🔥 Great thumbnail! Try A/B variants to find the best version.'
    : score >= 60
    ? '⚡ Hit "Make Viral" to auto-boost your score instantly.'
    : '🎯 Add bold text + a face for the biggest CTR boost.'

  return (
    <div style={s.wrap}>
      {/* Score card */}
      <div style={s.scoreCard}>
        <div style={s.scoreBg} />
        {score !== null ? (
          <>
            <div>
              <span style={s.scoreNum}>{score}</span>
              <span style={s.scoreDenom}>/100</span>
            </div>
            <div style={s.scoreLabel}>{label}</div>
            <div style={s.barWrap}>
              <div style={s.barFill} />
            </div>
          </>
        ) : (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📊</div>
            <div>Score updates live<br />as you edit the canvas</div>
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div style={s.feedbackList}>
          {feedback.map((f, i) => (
            <div key={i} style={s.item(f.type)}>
              <span style={s.itemIcon}>{f.type === 'good' ? '✓' : '⚠'}</span>
              <span>{f.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* Contextual tip */}
      <div style={s.tip}>{TIPS_BY_SCORE}</div>
    </div>
  )
}
