/**
 * Privacy-first local analytics.
 * Stores events in localStorage — no external service, no tracking.
 * Use window.msTrack(event, data) anywhere.
 */

const KEY = 'miansnap_analytics'
const SESSION_KEY = 'miansnap_session'
const MAX_EVENTS = 200

function getEvents() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function saveEvents(events) {
  try { localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS))) } catch {}
}

function getSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
    if (s) return s
    const newSession = { id: Date.now(), startedAt: Date.now(), uploadedAt: null }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    return newSession
  } catch { return { id: Date.now(), startedAt: Date.now() } }
}

function updateSession(patch) {
  try {
    const s = getSession()
    const updated = { ...s, ...patch }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated))
    return updated
  } catch {}
}

export function track(event, data = {}) {
  try {
    const session = getSession()
    const entry = {
      event,
      ts: Date.now(),
      sessionId: session.id,
      ...data,
    }
    const events = getEvents()
    events.push(entry)
    saveEvents(events)
  } catch (_) {}
}

export function trackUpload() {
  updateSession({ uploadedAt: Date.now() })
  track('video_uploaded')
}

export function trackExport() {
  const session = getSession()
  const timeToResult = session.uploadedAt
    ? Math.round((Date.now() - session.uploadedAt) / 1000)
    : null
  track('export_clicked', { timeToResult })
  if (timeToResult) updateSession({ lastExportTime: timeToResult })
  return timeToResult
}

export function getTimeToResult() {
  try {
    const session = getSession()
    return session.lastExportTime || null
  } catch { return null }
}

export function getStats() {
  const events = getEvents()
  const counts = {}
  events.forEach(e => { counts[e.event] = (counts[e.event] || 0) + 1 })
  return counts
}

// Install global tracker
export function installAnalytics() {
  window.msTrack = track
  window.msStats = getStats
}
