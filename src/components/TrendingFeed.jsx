import React, { useState, useEffect } from 'react'
import { getTrendingFeed, incrementChecks } from '../utils/feedStore.js'

const SCORE_COLOR = s => s >= 70 ? '#22c55e' : s >= 45 ? '#f59e0b' : s >= 25 ? '#f97316' : '#ef4444'
const SCORE_LABEL = s => s >= 70 ? 'High Trust' : s >= 45 ? 'Moderate' : s >= 25 ? 'Low Trust' : 'Very Low'
const SCORE_EMOJI = s => s >= 70 ? '🟢' : s >= 45 ? '🟡' : s >= 25 ? '🟠' : '🔴'

const CATEGORY_COLORS = {
  Health: '#06b6d4', Finance: '#f59e0b', Politics: '#8b5cf6',
  Technology: '#6366f1', Business: '#22c55e', 'User Submitted': '#a78bfa',
}

function formatChecks(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

export default function TrendingFeed({ onAnalyze }) {
  const [feed, setFeed] = useState([])
  const [filter, setFilter] = useState('All')

  useEffect(() => { setFeed(getTrendingFeed(12)) }, [])

  const categories = ['All', ...Array.from(new Set(feed.map(f => f.category)))]
  const visible = filter === 'All' ? feed : feed.filter(f => f.category === filter)

  const handleCheck = (item) => {
    incrementChecks(item.id)
    onAnalyze(item.text)
  }

  if (!feed.length) return null

  return (
    <div style={{ width: '100%', maxWidth: '720px', marginTop: '40px', animation: 'fadeUp .6s .35s ease both', opacity: 0, animationFillMode: 'forwards' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444', animation: 'pulse 1.5s ease infinite' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.3px' }}>TRENDING CLAIMS</span>
          <span style={{ fontSize: '11px', color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px 7px' }}>Most checked today</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.slice(0, 5).map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', border: '1px solid', cursor: 'pointer', transition: 'all .15s',
                background: filter === cat ? 'rgba(99,102,241,0.2)' : 'transparent',
                borderColor: filter === cat ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
                color: filter === cat ? '#a5b4fc' : '#475569' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visible.slice(0, 6).map((item, i) => {
          const c = SCORE_COLOR(item.score)
          const catColor = CATEGORY_COLORS[item.category] || '#6366f1'
          return (
            <div key={item.id}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', cursor: 'pointer', transition: 'all .15s', animation: 'fadeUp .4s ' + (i * 0.05) + 's ease both', opacity: 0, animationFillMode: 'forwards' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
              onClick={() => handleCheck(item)}>

              {/* Score badge */}
              <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '10px', background: c + '15', border: '1px solid ' + c + '35', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: c, lineHeight: 1 }}>{item.score}</span>
                <span style={{ fontSize: '8px', color: c + 'aa', letterSpacing: '0.3px' }}>TRUST</span>
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '5px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: catColor, background: catColor + '15', border: '1px solid ' + catColor + '30', borderRadius: '4px', padding: '1px 6px' }}>{item.category}</span>
                  <span style={{ fontSize: '10px', color: '#475569' }}>{formatChecks(item.checks)} checks</span>
                  <span style={{ fontSize: '10px', color: c, fontWeight: 600 }}>{SCORE_EMOJI(item.score)} {SCORE_LABEL(item.score)}</span>
                </div>
              </div>

              {/* Check button */}
              <button onClick={e => { e.stopPropagation(); handleCheck(item) }}
                style={{ flexShrink: 0, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, transition: 'all .15s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
                Check →
              </button>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '11px', color: '#334155', textAlign: 'center', marginTop: '12px' }}>
        Click any claim to run a full analysis · Claims update as users check them
      </p>
    </div>
  )
}