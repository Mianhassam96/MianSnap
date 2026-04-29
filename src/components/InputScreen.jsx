import React, { useState, useRef, useEffect } from 'react'

const EXAMPLES = [
  'BREAKING: Scientists confirm drinking coffee cures cancer 100% — share before deleted!',
  'According to a peer-reviewed study published in Nature, moderate exercise reduces heart disease risk by 35%.',
  'https://reuters.com — WHO confirms new vaccine is 94% effective against latest variant',
  'They don\'t want you to know this secret! The government is hiding the TRUTH about 5G towers!!!',
]

export default function InputScreen({ onAnalyze, initialValue = '', error }) {
  const [value, setValue] = useState(initialValue)
  const [charCount, setCharCount] = useState(initialValue.length)
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus()
  }, [])

  const handleChange = (e) => {
    const v = e.target.value.slice(0, 2000)
    setValue(v)
    setCharCount(v.length)
  }

  const handleSubmit = () => {
    if (value.trim().length < 5) return
    onAnalyze(value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
  }

  const handleExample = (ex) => {
    setValue(ex)
    setCharCount(ex.length)
    textareaRef.current?.focus()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const v = text.slice(0, 2000)
      setValue(v)
      setCharCount(v.length)
    } catch {
      textareaRef.current?.focus()
    }
  }

  const canSubmit = value.trim().length >= 5

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp .6s ease both' }}>
        {/* Logo */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>🛡️</div>
          <span style={{
            fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MianSnap</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '16px',
          color: '#f0f0ff',
        }}>
          Is this content{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>trustworthy?</span>
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: '#94a3b8',
          maxWidth: '520px',
          lineHeight: 1.6,
          margin: '0 auto',
        }}>
          Paste any text, claim, or link. Get an instant evidence-based trust score — not just "fake or real."
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        width: '100%', maxWidth: '680px',
        animation: 'fadeUp .6s .1s ease both',
        opacity: 0,
        animationFillMode: 'forwards',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${focused ? '#6366f1' : 'rgba(99,102,241,0.2)'}`,
          borderRadius: '20px',
          padding: '4px',
          transition: 'border-color .2s, box-shadow .2s',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
        }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste a news headline, social media post, claim, or URL here…"
            rows={6}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#f0f0ff',
              fontSize: '16px',
              lineHeight: 1.7,
              padding: '16px 20px 8px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px 12px',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Paste button */}
              <button
                onClick={handlePaste}
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '5px',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
              >
                📋 Paste
              </button>

              {/* Clear */}
              {value && (
                <button
                  onClick={() => { setValue(''); setCharCount(0); textareaRef.current?.focus() }}
                  style={{
                    background: 'transparent',
                    color: '#64748b',
                    border: '1px solid rgba(100,116,139,0.2)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '13px',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  ✕ Clear
                </button>
              )}

              <span style={{ fontSize: '12px', color: '#475569' }}>
                {charCount}/2000
              </span>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(99,102,241,0.2)',
                color: canSubmit ? '#fff' : '#475569',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 24px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'all .2s',
                boxShadow: canSubmit ? '0 4px 20px rgba(99,102,241,0.4)' : 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => canSubmit && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🔍 Analyze Trust
            </button>
          </div>
        </div>

        {/* Hint */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#475569', marginTop: '8px' }}>
          Press <kbd style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px' }}>Ctrl+Enter</kbd> to analyze
        </p>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '12px', padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', color: '#fca5a5', fontSize: '14px', textAlign: 'center',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Example pills */}
      <div style={{
        marginTop: '32px', width: '100%', maxWidth: '680px',
        animation: 'fadeUp .6s .2s ease both', opacity: 0, animationFillMode: 'forwards',
      }}>
        <p style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', textAlign: 'center' }}>
          Try an example:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleExample(ex)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                color: '#94a3b8',
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'all .15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                e.currentTarget.style.color = '#a5b4fc'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'
              }}
              title={ex}
            >
              {ex.slice(0, 50)}{ex.length > 50 ? '…' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        marginTop: '48px',
        display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center',
        animation: 'fadeUp .6s .3s ease both', opacity: 0, animationFillMode: 'forwards',
      }}>
        {[
          { icon: '🛡️', label: 'Evidence-based', sub: 'Not just "fake/real"' },
          { icon: '⚡', label: 'Instant results', sub: 'Under 3 seconds' },
          { icon: '🔒', label: '100% private', sub: 'Nothing leaves your device' },
          { icon: '🆓', label: 'Free forever', sub: 'No account needed' },
        ].map(({ icon, label, sub }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{label}</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '48px', fontSize: '12px', color: '#334155', textAlign: 'center',
        animation: 'fadeUp .6s .4s ease both', opacity: 0, animationFillMode: 'forwards',
      }}>
        Built by{' '}
        <a href="https://multimian.com" target="_blank" rel="noopener noreferrer"
          style={{ color: '#6366f1', textDecoration: 'none' }}>
          MultiMian
        </a>
        {' '}· MianSnap Trust Layer · Free forever
      </div>
    </div>
  )
}
