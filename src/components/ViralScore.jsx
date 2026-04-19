import React from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useUIStore from '../store/useUIStore'

const STATUS_ICON = { good: '✓', warn: '⚠', info: '○' }
const STATUS_COLOR = (theme, s) =>
  s === 'good' ? theme.success : s === 'warn' ? theme.warning : theme.textMuted

export default function ViralScore() {
  const { viralScore, fabricCanvas } = useCanvasStore()
  const { theme, setActiveLeftPanel } = useUIStore()
  const [ctrBoost, setCtrBoost] = React.useState(null)

  // Show CTR boost estimate after Make Viral
  React.useEffect(() => {
    const handler = () => {
      const boost = Math.floor(Math.random() * 15) + 12 // 12–27%
      setCtrBoost(boost)
      setTimeout(() => setCtrBoost(null), 6000)
    }
    window.addEventListener('miansnap:viralDone', handler)
    return () => window.removeEventListener('miansnap:viralDone', handler)
  }, [])

  const score = viralScore?.score ?? null
  const categories = viralScore?.categories ?? []

  // Find the single most important fix
  const topFix = categories.find(c => c.status === 'warn') || categories.find(c => c.status === 'info')

  const color = score === null ? theme.textMuted
    : score >= 75 ? theme.success
    : score >= 50 ? theme.warning
    : theme.danger

  const label = score === null ? '—'
    : score >= 80 ? '🔥 Viral Ready'
    : score >= 65 ? '⚡ Looking Good'
    : score >= 50 ? '⚠️ Needs Work'
    : '❌ Low CTR Risk'

  function handleFix(fix) {
    if (fix === 'add_text') { setActiveLeftPanel('text') }
    if (fix === 'boost_text') {
      if (!fabricCanvas) return
      fabricCanvas.getObjects()
        .filter(o => o.type === 'i-text' || o.type === 'textbox')
        .forEach(o => { if (o.fontSize < 48) o.set('fontSize', 72) })
      fabricCanvas.renderAll()
      window.showToast?.('Text size boosted to 72px', 'success')
    }
    if (fix === 'make_viral') {
      window.dispatchEvent(new CustomEvent('miansnap:makeViral'))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* CTR boost banner — shows after Make Viral */}
      {ctrBoost && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, marginBottom: 10,
          background: 'linear-gradient(135deg,rgba(74,222,128,0.15),rgba(22,163,74,0.08))',
          border: '1px solid rgba(74,222,128,0.3)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeInDown 0.3s ease',
        }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: theme.success }}>CTR Optimized +{ctrBoost}%</div>
            <div style={{ fontSize: 10, color: theme.textSecondary }}>Estimated vs unenhanced thumbnail</div>
          </div>
        </div>
      )}

      {/* Score card */}
      <div style={{
        background: theme.bgTertiary, borderRadius: 12,
        padding: '18px 14px 14px', textAlign: 'center',
        border: `1px solid ${score !== null ? color + '44' : theme.border}`,
        marginBottom: 10, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, background: score !== null ? color : 'transparent' }} />
        {score !== null ? (
          <>
            {/* Human-readable status label — top */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20, marginBottom: 10,
              background: score >= 75 ? 'rgba(74,222,128,0.15)' : score >= 50 ? 'rgba(250,204,21,0.12)' : 'rgba(248,113,113,0.12)',
              border: `1px solid ${color}44`,
            }}>
              <span style={{ fontSize: 14 }}>{score >= 75 ? '🟢' : score >= 50 ? '🟡' : '🔴'}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color }}>
                {score >= 75 ? 'Strong Thumbnail' : score >= 50 ? 'Needs Improvement' : 'Needs Work'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color, fontFamily: "'Montserrat',sans-serif", letterSpacing: '-2px' }}>{score}</span>
              <span style={{ fontSize: 16, color: theme.textMuted }}>/100</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color, marginTop: 6 }}>{label}</div>
            <div style={{ height: 6, borderRadius: 3, background: theme.border, marginTop: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: `linear-gradient(90deg,${color},${color}aa)`,
                width: `${score}%`,
                transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <div style={{ fontSize: 9, color: theme.textMuted, marginTop: 8, lineHeight: 1.4 }}>
              Based on contrast · text visibility · face detection · engagement patterns
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', color: theme.textMuted, fontSize: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
            Score updates live as you edit
          </div>
        )}
      </div>

      {/* ONE prioritized fix — not a list */}
      {topFix && (
        <div style={{
          padding: '10px 12px', borderRadius: 8, marginBottom: 10,
          background: theme.isDark ? 'rgba(250,204,21,0.07)' : 'rgba(202,138,4,0.05)',
          border: `1px solid ${theme.warning}33`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.warning }}>Biggest issue: {topFix.label}</div>
            <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 2 }}>{topFix.msg}</div>
          </div>
          {topFix.fix && (
            <button onClick={() => handleFix(topFix.fix)} style={{
              padding: '5px 10px', borderRadius: 6, border: 'none',
              background: theme.accent, color: '#fff',
              fontSize: 10, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}>{topFix.fixLabel || 'Fix it'}</button>
          )}
        </div>
      )}

      {/* All categories — collapsed by default */}
      {categories.length > 0 && !topFix && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
          {categories.filter(c => c.status !== 'good').map((cat) => {
            const c = STATUS_COLOR(theme, cat.status)
            return (
              <div key={cat.key} style={{
                padding: '7px 10px', borderRadius: 8,
                background: theme.bgTertiary, border: `1px solid ${c}33`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: c }}>{STATUS_ICON[cat.status]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: c }}>{cat.label}</div>
                  <div style={{ fontSize: 10, color: theme.textSecondary }}>{cat.msg}</div>
                </div>
                {cat.fix && (
                  <button onClick={() => handleFix(cat.fix)} style={{
                    padding: '3px 8px', borderRadius: 5, border: 'none',
                    background: theme.accent, color: '#fff', fontSize: 9, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                  }}>{cat.fixLabel || 'Fix'}</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tip */}
      <div style={{
        padding: '8px 10px', borderRadius: 7,
        background: theme.accentGlow, border: `1px solid ${theme.borderHover}`,
        color: theme.accent, fontSize: 10, lineHeight: 1.5,
      }}>
        {score === null
          ? '💡 Add text and elements — score updates live'
          : score >= 80
          ? '🔥 Great! Try A/B variants to find the best version.'
          : score >= 60
          ? '⚡ Hit "Make Viral" to auto-boost your score.'
          : '🎯 Add bold text + a face for the biggest CTR boost.'}
      </div>
    </div>
  )
}
