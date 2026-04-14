import React, { useEffect, useState } from 'react'
import useUIStore from '../store/useUIStore'
import useProjectStore from '../store/useProjectStore'
import useCanvasStore from '../store/useCanvasStore'
import { deleteProject } from '../utils/projectStorage'
import { fabric } from '../lib/fabric'

export default function ProjectsPanel({ onClose }) {
  const { theme } = useUIStore()
  const { projects, loadProjects, loadProjectById, projectName, setProjectName } = useProjectStore()
  const { fabricCanvas } = useCanvasStore()
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { loadProjects() }, [])

  async function handleLoad(project) {
    if (!fabricCanvas || !project.canvas) return
    setLoading(true)
    try {
      await new Promise((res) => {
        fabricCanvas.loadFromJSON(project.canvas, () => {
          fabricCanvas.renderAll()
          res()
        })
      })
      setProjectName(project.name.replace('[Auto] ', ''))
      onClose()
    } catch (_) {}
    setLoading(false)
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    setDeletingId(id)
    await deleteProject(id)
    await loadProjects()
    setDeletingId(null)
  }

  function formatDate(ts) {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: theme.isDark ? 'rgba(0,0,0,0.8)' : 'rgba(10,10,26,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
    },
    panel: {
      background: theme.bgSecondary, borderRadius: 16,
      width: '92%', maxWidth: 560, maxHeight: '80vh',
      display: 'flex', flexDirection: 'column',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      animation: 'scaleIn 0.2s ease',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 24px', borderBottom: `1px solid ${theme.border}`,
    },
    title: { fontSize: 16, fontWeight: 700, color: theme.text },
    closeBtn: {
      width: 30, height: 30, borderRadius: 6, border: `1px solid ${theme.border}`,
      background: theme.bgTertiary, color: theme.textMuted, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
    },
    list: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
    empty: {
      textAlign: 'center', padding: '40px 20px',
      color: theme.textMuted, fontSize: 13,
    },
    item: {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', borderRadius: 10, marginBottom: 6,
      border: `1px solid ${theme.border}`, background: theme.bgTertiary,
      cursor: 'pointer', transition: 'all 0.15s',
    },
    itemIcon: {
      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
      background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16,
    },
    itemInfo: { flex: 1, minWidth: 0 },
    itemName: {
      fontSize: 13, fontWeight: 600, color: theme.text,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    itemMeta: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
    autoBadge: {
      fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
      background: theme.accentGlow, color: theme.accent,
      border: `1px solid ${theme.borderHover}`, marginLeft: 6,
    },
    delBtn: {
      width: 26, height: 26, borderRadius: 5, border: `1px solid ${theme.border}`,
      background: 'transparent', color: theme.textMuted, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, flexShrink: 0, transition: 'all 0.15s',
    },
  }

  const manualProjects = projects.filter((p) => !p.isAuto)
  const autoProjects = projects.filter((p) => p.isAuto).slice(0, 3)
  const allShown = [...manualProjects, ...autoProjects]

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.panel}>
        <div style={s.header}>
          <div style={s.title}>💾 Saved Projects</div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={s.list}>
          {allShown.length === 0 && (
            <div style={s.empty}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
              No saved projects yet.<br />
              <span style={{ fontSize: 11 }}>Projects auto-save as you edit.</span>
            </div>
          )}
          {allShown.map((p) => (
            <div key={p.id} style={s.item}
              onClick={() => handleLoad(p)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = theme.accentGlow }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgTertiary }}
            >
              <div style={s.itemIcon}>📄</div>
              <div style={s.itemInfo}>
                <div style={s.itemName}>
                  {p.name.replace('[Auto] ', '')}
                  {p.isAuto && <span style={s.autoBadge}>AUTO</span>}
                </div>
                <div style={s.itemMeta}>{formatDate(p.savedAt)}</div>
              </div>
              <button style={s.delBtn}
                onClick={(e) => handleDelete(e, p.id)}
                disabled={deletingId === p.id}
                onMouseEnter={(e) => { e.currentTarget.style.color = theme.danger; e.currentTarget.style.borderColor = theme.danger }}
                onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.border }}
              >
                {deletingId === p.id ? '⏳' : '🗑'}
              </button>
            </div>
          ))}
        </div>
        {loading && (
          <div style={{ padding: '12px', textAlign: 'center', fontSize: 12, color: theme.accent, borderTop: `1px solid ${theme.border}` }}>
            Loading project...
          </div>
        )}
      </div>
    </div>
  )
}
