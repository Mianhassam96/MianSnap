import React, { useState, useEffect } from 'react'
import { getCommunityVerdict } from '../utils/feedStore.js'

export default function CommunityVerdict({ claim, trustScore }) {
  const [verdict, setVerdict] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setVerdict(getCommunityVerdict(claim, trustScore))
    const t = setTimeout(() => setRevealed(true), 400)
    return () => clearTimeout(t)
  }, [claim, trustScore])

  if (!verdict) return null

  const barW = revealed ? verdict.communityScore : 0

  return (
    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
        👥 Community Verdict
      </div>

      <div style={{ padding: '16px', background: verdict.color + '08', border: '1px solid ' + verdict.color + '25', borderRadius: '14px' }}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: verdict.color, marginBottom: '3px' }}>{verdict.label}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Based on {verdict.totalVotes.toLocaleString()} community checks</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: verdict.color, lineHeight: 1 }}>{verdict.communityScore}</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>community score</div>
          </div>
        </div>

        {/* Community bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: barW + '%', background: 'linear-gradient(90deg,' + verdict.color + '80,' + verdict.color + ')', borderRadius: '100px', transition: 'width 1.2s cubic-bezier(.4,0,.2,1)', boxShadow: '0 0 8px ' + verdict.color + '60' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span style={{ fontSize: '10px', color: '#334155' }}>Very Low Trust</span>
            <span style={{ fontSize: '10px', color: '#334155' }}>High Trust</span>
          </div>
        </div>

        {/* Agreement row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Agreement with analysis:</span>
          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (revealed ? verdict.agreePercent : 0) + '%', background: '#6366f1', borderRadius: '100px', transition: 'width 1s ease' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', flexShrink: 0 }}>{verdict.agreePercent}%</span>
        </div>

        <p style={{ fontSize: '11px', color: '#334155', marginTop: '10px', lineHeight: 1.5 }}>
          Community scores are derived from pattern-based analysis across similar content. They represent signal consensus, not verified fact-checking.
        </p>
      </div>
    </div>
  )
}