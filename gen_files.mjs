import { writeFileSync } from 'fs';

// ── feedStore.js ──────────────────────────────────────────────────────────────
const feedStore = 
const FEED_KEY = 'ms_feed_v1'
const SESSION_KEY = 'ms_session_v1'

const SEED_CLAIMS = [
  { id:'s1',  text:'BREAKING: Scientists confirm 5G towers cause cancer — government hiding the truth!!!', score:14, checks:2847, category:'Health' },
  { id:'s2',  text:'According to WHO, new vaccine shows 94% efficacy in peer-reviewed clinical trials', score:81, checks:1923, category:'Health' },
  { id:'s3',  text:'Dollar will collapse by end of year — insider reveals secret plan to destroy economy', score:11, checks:3412, category:'Finance' },
  { id:'s4',  text:'Reuters: Federal Reserve raises interest rates citing inflation concerns', score:78, checks:1654, category:'Finance' },
  { id:'s5',  text:'They dont want you to know! Deep state is controlling all major news networks!!!', score:8,  checks:4201, category:'Politics' },
  { id:'s6',  text:'BBC reports: UN Security Council passes climate resolution with 12-2 vote', score:76, checks:987,  category:'Politics' },
  { id:'s7',  text:'SHOCKING: AI will replace 90% of all jobs by next year — share before deleted!', score:16, checks:5632, category:'Technology' },
  { id:'s8',  text:'MIT study in Nature: AI models show bias in 34% of hiring decisions analyzed', score:74, checks:1102, category:'Technology' },
  { id:'s9',  text:'Miracle cure discovered! Doctors HATE this one weird trick that cures all diseases overnight', score:6, checks:6891, category:'Health' },
  { id:'s10', text:'AP News: New study links ultra-processed food to 32% higher cardiovascular risk', score:79, checks:2341, category:'Health' },
  { id:'s11', text:'URGENT: Share now — government will shut down internet in 48 hours!!!', score:5,  checks:7234, category:'Politics' },
  { id:'s12', text:'Stanford researchers find remote work increases productivity by 13% in 16,000-person study', score:77, checks:1456, category:'Business' },
]

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return Math.abs(h)
}

export function getCommunityVerdict(text, trustScore) {
  const h = hashStr(text.slice(0, 80))
  const variance = (h % 20) - 10
  const communityScore = Math.max(5, Math.min(95, trustScore + variance))
  const totalVotes = 50 + (h % 450)
  const agreePercent = Math.round(40 + (h % 40))
  return {
    communityScore,
    totalVotes,
    agreePercent,
    label: communityScore >= 70 ? 'Community trusts this' : communityScore >= 45 ? 'Community is divided' : 'Community flags this as risky',
    color: communityScore >= 70 ? '#22c55e' : communityScore >= 45 ? '#f59e0b' : '#ef4444',
  }
}

function loadFeed() {
  try { const r = localStorage.getItem(FEED_KEY); if (r) return JSON.parse(r) } catch {}
  return null
}

function saveFeed(feed) {
  try { localStorage.setItem(FEED_KEY, JSON.stringify(feed)) } catch {}
}

export function initFeed() {
  const existing = loadFeed()
  if (existing) return existing
  const feed = SEED_CLAIMS.map(c => ({ ...c, checks: c.checks + Math.floor(Math.random() * 200), addedAt: Date.now() - Math.floor(Math.random() * 86400000 * 3), isUserAdded: false }))
  saveFeed(feed)
  return feed
}

export function addToFeed(text, score) {
  const feed = loadFeed() || initFeed()
  const claim = text.replace(/https?:\/\/\S+/g, '').trim().slice(0, 120)
  if (claim.length < 10) return feed
  const exists = feed.find(f => f.text.slice(0, 40).toLowerCase() === claim.slice(0, 40).toLowerCase())
  if (exists) { exists.checks += 1; saveFeed(feed); return feed }
  const newEntry = { id: 'u' + Date.now(), text: claim + (claim.length >= 120 ? '…' : ''), score, checks: 1 + Math.floor(Math.random() * 12), category: 'User Submitted', addedAt: Date.now(), isUserAdded: true }
  const userEntries = feed.filter(f => f.isUserAdded)
  const seedEntries = feed.filter(f => !f.isUserAdded)
  const updated = [newEntry, ...userEntries.slice(0, 7), ...seedEntries].slice(0, 20)
  saveFeed(updated)
  return updated
}

export function getTrendingFeed(limit = 8) {
  const feed = loadFeed() || initFeed()
  return [...feed].sort((a, b) => b.checks - a.checks).slice(0, limit)
}

export function incrementChecks(id) {
  const feed = loadFeed() || initFeed()
  const item = feed.find(f => f.id === id)
  if (item) { item.checks += 1; saveFeed(feed) }
  return feed
}

export function getSessionStats() {
  try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : { totalChecked: 0 } } catch { return { totalChecked: 0 } }
}

export function incrementSessionStats() {
  const stats = getSessionStats()
  stats.totalChecked = (stats.totalChecked || 0) + 1
  stats.lastVisit = new Date().toISOString()
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(stats)) } catch {}
  return stats
}
.trim();

writeFileSync('src/utils/feedStore.js', feedStore, 'utf8');
console.log('feedStore.js:', feedStore.split('\n').length, 'lines');