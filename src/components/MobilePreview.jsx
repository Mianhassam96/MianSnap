import React, { useState, useEffect, useRef } from 'react'
import useCanvasStore from '../store/useCanvasStore'
import useUIStore from '../store/useUIStore'

const PLATFORMS = [
  {
    id: 'youtube',
    label: '▶ YouTube',
    thumbW: 320, thumbH: 180,
    mockup: { bg: '#fff', titleColor: '#0f0f0f', metaColor: '#606060' },
    title: 'Your Video Title Here — Watch Now',
    meta: '1.2M views · 3 days ago',
  },
  {
    id: 'mobile',
    label: '📱 Mobile',
    thumbW: 160, thumbH: 90,
    mockup: { bg: '#0f0f0f', titleColor: '#fff', metaColor: '#aaa' },
    title: 'Your Video Title Here',
    meta: '1.2M views',
  },
  {
    id: 'tiktok',
    label: '🎵 TikTok',
    thumbW: 120, thumbH: 213,
    mockup: { bg: '#000', titleColor: '#fff', metaColor: '#aaa' },
    title: '@yourchannel',
    meta: '♥ 24.5K',
    vertical: true,
  },
]

export default function MobilePreview() {
  const { fabricCanvas } = useCanvasStore()
  const { theme } = useUIStore()
  const [platform, setPlatform] = useState('youtube')
  const [thumbUrl, setThumbUrl] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!fabricCanvas) return
    // Live update every 2s
    const update = () => {
      try {
        setThumbUrl(fabricCanvas.toDataURL({ format: 'jpeg', quality: 0.7 }))
      } catch (_) {}
    }
    update()
    intervalRef.current = setInterval(update, 2000)
    fabricCanvas.on('object:modified', update)
    fabricCanvas.on('object:added', update)
    return () => {
      clearInterval(intervalRef.current)
      fabricCanvas.off('object:modified', update)
      fabricCanvas.off('object:added', update)
    }
  }, [fabricCanvas])

  const p = PLATFORMS.find((x) => x.id === platform)

  const s = {
    wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
    title: { fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 },
    tabs: { display: 'flex', gap: 4 },
    tab: (active) => ({
      flex: 1, padding: '5px 4px', borderRadius: 5, fontSize: 10, cursor: 'pointer',
      border: `1px solid ${active ? theme.accent : theme.border}`,
      background: active ? theme.accentGlow : theme.bgTertiary,
      color: active ? theme.accent : theme.textMuted,
      transition: 'all 0.15s', textAlign: 'center',
    }),
    mockup: {
      borderRadius: 10, overflow: 'hidden', border: `1px solid ${theme.border}`,
      background: p?.mockup.bg || '#fff', padding: 10,
    },
    thumbWrap: {
      borderRadius: 6, overflow: 'hidden', marginBottom: 8,
      width: '100%', aspectRatio: p?.vertical ? '9/16' : '16/9',
      background: '#111', position: 'relative',
    },
    thumb: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
    videoTitle: {
      fontSize: 12, fontWeight: 600, color: p?.mockup.titleColor,
      lineHeight: 1.4, marginBottom: 4,
    },
    videoMeta: { fontSize: 10, color: p?.mockup.metaColor },
    hint: { fontSize: 11, color: theme.textMuted, textAlign: 'center', padding: 8 },
    liveBadge: {
      position: 'absolute', top: 6, right: 6,
      background: 'rgba(0,0,0,0.6)', color: '#4ade80',
      fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3,
      letterSpacing: 0.5,
    },
  }

  return (
    <div style={s.wrap}>
      <div style={s.title}>Live Preview</div>
      <div style={s.tabs}>
        {PLATFORMS.map((pl) => (
          <button key={pl.id} style={s.tab(platform === pl.id)} onClick={() => setPlatform(pl.id)}>
            {pl.label}
          </button>
        ))}
      </div>

      {!thumbUrl ? (
        <div style={s.hint}>Edit your canvas to see a live preview.</div>
      ) : (
        <div style={s.mockup}>
          <div style={s.thumbWrap}>
            <img src={thumbUrl} alt="Preview" style={s.thumb} />
            <div style={s.liveBadge}>● LIVE</div>
          </div>
          <div style={s.videoTitle}>{p?.title}</div>
          <div style={s.videoMeta}>{p?.meta}</div>
        </div>
      )}
    </div>
  )
}
