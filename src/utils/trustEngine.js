/**
 * MianSnap Trust Engine
 * Client-side heuristic trust analysis.
 * Architecture is ready to swap in real API calls (OpenAI + SerpAPI).
 */

// ── Trusted domain list ──────────────────────────────────────────────────────
const TRUSTED_DOMAINS = [
  'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk', 'npr.org',
  'theguardian.com', 'nytimes.com', 'washingtonpost.com', 'bloomberg.com',
  'ft.com', 'economist.com', 'nature.com', 'science.org', 'who.int',
  'cdc.gov', 'nih.gov', 'gov.uk', 'europa.eu', 'un.org', 'unicef.org',
  'snopes.com', 'factcheck.org', 'politifact.com', 'fullfact.org',
  'wikipedia.org', 'britannica.com', 'stanford.edu', 'mit.edu', 'harvard.edu',
  'oxforddictionaries.com', 'merriam-webster.com',
]

// ── Suspicious pattern signals ───────────────────────────────────────────────
const SUSPICIOUS_PATTERNS = [
  { pattern: /\b(BREAKING|URGENT|EXCLUSIVE|SHOCKING)\b/i,        label: 'Sensational headline language', weight: -12 },
  { pattern: /\b(100%|guaranteed|proven|confirmed|definitive)\b/i, label: 'Absolute certainty claims',    weight: -10 },
  { pattern: /\b(they don'?t want you to know|hidden truth|secret agenda)\b/i, label: 'Conspiracy framing', weight: -18 },
  { pattern: /\b(share before (it'?s )?deleted|share now|spread the word)\b/i, label: 'Viral pressure tactics', weight: -15 },
  { pattern: /\b(doctors hate|one weird trick|big pharma|deep state)\b/i,      label: 'Known misinformation phrases', weight: -20 },
  { pattern: /\b(will crash|will collapse|end of|apocalypse|doom)\b/i,         label: 'Catastrophic prediction language', weight: -8 },
  { pattern: /\b(anonymous source|insider|whistleblower)\b/i,                  label: 'Unverifiable source claim', weight: -8 },
  { pattern: /!{2,}/,                                                           label: 'Excessive exclamation marks', weight: -6 },
  { pattern: /[A-Z]{4,}/,                                                       label: 'Excessive capitalization', weight: -5 },
  { pattern: /\b(click here|read more|find out|you won'?t believe)\b/i,        label: 'Clickbait language', weight: -10 },
  { pattern: /\b(cure|miracle|magic|instant|overnight)\b/i,                    label: 'Miracle claim language', weight: -12 },
  { pattern: /\b(leaked|exposed|revealed|uncovered)\b/i,                       label: 'Sensational reveal framing', weight: -7 },
]

// ── Credibility signals ──────────────────────────────────────────────────────
const CREDIBILITY_PATTERNS = [
  { pattern: /\b(according to|study shows|research indicates|data suggests)\b/i, label: 'Evidence-based language',    weight: +12 },
  { pattern: /\b(published in|peer.reviewed|journal|university)\b/i,             label: 'Academic source reference',  weight: +15 },
  { pattern: /\b(official statement|press release|spokesperson)\b/i,             label: 'Official source reference',  weight: +10 },
  { pattern: /\b(however|on the other hand|critics argue|disputed)\b/i,          label: 'Balanced perspective',       weight: +8  },
  { pattern: /\b(percent|statistics|data|survey|sample size)\b/i,                label: 'Statistical evidence cited', weight: +8  },
  { pattern: /https?:\/\/[^\s]+/,                                                 label: 'Source link included',       weight: +10 },
  { pattern: /\b(correction|update|clarification|retraction)\b/i,                label: 'Transparency indicators',    weight: +6  },
]

// ── URL analysis ─────────────────────────────────────────────────────────────
function analyzeURL(text) {
  const urlMatch = text.match(/https?:\/\/([^\s/]+)/i)
  if (!urlMatch) return { found: false, trusted: false, domain: null, weight: 0 }

  const domain = urlMatch[1].replace(/^www\./, '').toLowerCase()
  const isTrusted = TRUSTED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))

  // Suspicious TLD / domain patterns
  const isSuspicious =
    /\.(xyz|tk|ml|ga|cf|gq|top|click|download|info)$/.test(domain) ||
    /[0-9]{4,}/.test(domain) ||
    domain.split('.').length > 4

  return {
    found: true,
    trusted: isTrusted,
    suspicious: isSuspicious,
    domain,
    weight: isTrusted ? +20 : isSuspicious ? -15 : 0,
  }
}

// ── Content length & structure ───────────────────────────────────────────────
function analyzeStructure(text) {
  const wordCount = text.trim().split(/\s+/).length
  const sentenceCount = (text.match(/[.!?]+/g) || []).length
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : wordCount

  const signals = []
  let weight = 0

  if (wordCount < 10) {
    signals.push('Very short content — limited context to analyze')
    weight -= 8
  } else if (wordCount > 50) {
    signals.push('Sufficient content length for analysis')
    weight += 5
  }

  if (avgWordsPerSentence > 40) {
    signals.push('Unusually long sentences — may obscure meaning')
    weight -= 4
  }

  return { wordCount, signals, weight }
}

// ── Extract main claim ───────────────────────────────────────────────────────
function extractClaim(text) {
  const clean = text.replace(/https?:\/\/\S+/g, '').trim()
  const sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15)
  if (sentences.length === 0) return text.slice(0, 120)
  // Pick the most "claim-like" sentence (longest first sentence or first sentence)
  return sentences[0].slice(0, 150) + (sentences[0].length > 150 ? '…' : '')
}

// ── Determine label from score ───────────────────────────────────────────────
export function scoreToLabel(score) {
  if (score >= 75) return { label: 'High Trust',    color: '#22c55e', emoji: '🟢', bg: '#052e16' }
  if (score >= 50) return { label: 'Moderate Trust', color: '#f59e0b', emoji: '🟡', bg: '#1c1400' }
  if (score >= 30) return { label: 'Low Trust',      color: '#f97316', emoji: '🟠', bg: '#1c0a00' }
  return                  { label: 'Very Low Trust', color: '#ef4444', emoji: '🔴', bg: '#1c0000' }
}

// ── Main analyze function ────────────────────────────────────────────────────
export async function analyzeContent(input) {
  // Simulate async (ready for real API swap)
  await new Promise(r => setTimeout(r, 1800 + Math.random() * 800))

  const text = input.trim()
  const reasons = []
  const warnings = []
  let score = 50 // neutral baseline

  // 1. URL analysis
  const urlInfo = analyzeURL(text)
  if (urlInfo.found) {
    if (urlInfo.trusted) {
      reasons.push(`✅ Link from trusted source: ${urlInfo.domain}`)
      score += urlInfo.weight
    } else if (urlInfo.suspicious) {
      warnings.push(`⚠️ Suspicious domain detected: ${urlInfo.domain}`)
      score += urlInfo.weight
    } else {
      reasons.push(`🔗 Link detected: ${urlInfo.domain} (unverified)`)
    }
  } else {
    reasons.push('🔗 No source link provided')
    score -= 5
  }

  // 2. Suspicious patterns
  const triggeredSuspicious = []
  for (const { pattern, label, weight } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      triggeredSuspicious.push(label)
      score += weight
    }
  }
  if (triggeredSuspicious.length > 0) {
    warnings.push(...triggeredSuspicious.map(l => `❌ ${l}`))
  }

  // 3. Credibility patterns
  const triggeredCredibility = []
  for (const { pattern, label, weight } of CREDIBILITY_PATTERNS) {
    if (pattern.test(text)) {
      triggeredCredibility.push(label)
      score += weight
    }
  }
  if (triggeredCredibility.length > 0) {
    reasons.push(...triggeredCredibility.map(l => `✅ ${l}`))
  }

  // 4. Structure analysis
  const structure = analyzeStructure(text)
  score += structure.weight
  if (structure.signals.length > 0) {
    reasons.push(...structure.signals.map(s => `ℹ️ ${s}`))
  }

  // 5. Emotional intensity check
  const emotionalWords = (text.match(/\b(outrage|furious|disgusting|unbelievable|insane|crazy|evil|destroy|attack|hate|fear|panic)\b/gi) || []).length
  if (emotionalWords >= 3) {
    warnings.push('⚠️ High emotional language intensity detected')
    score -= emotionalWords * 3
  }

  // 6. Clamp score
  score = Math.max(5, Math.min(95, Math.round(score)))

  // 7. Extract claim
  const claim = extractClaim(text)

  // 8. Build final signals list (warnings first, then reasons)
  const allSignals = [...warnings, ...reasons].slice(0, 6)

  // 9. Risk classification
  let riskLabel = 'Uncertain'
  if (score >= 70) riskLabel = 'Likely Reliable'
  else if (score >= 45) riskLabel = 'Needs Verification'
  else if (score >= 25) riskLabel = 'Likely Manipulated / Suspicious'
  else riskLabel = 'High Risk Content'

  const { label, color, emoji, bg } = scoreToLabel(score)

  return {
    claim,
    trust_score: score,
    label,
    color,
    emoji,
    bg,
    risk_label: riskLabel,
    signals: allSignals,
    url_info: urlInfo,
    word_count: structure.wordCount,
    analyzed_at: new Date().toISOString(),
  }
}
