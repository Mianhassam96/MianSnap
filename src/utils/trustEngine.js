/**
 * MianSnap Trust Engine v2
 * Psychological + pattern-based credibility analysis.
 * No API required. Swap analyzeContent() for real API calls in Phase 2.
 */

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TRUST DATABASE
// ─────────────────────────────────────────────────────────────────────────────
const DOMAIN_TRUST = {
  // Tier 1 — High trust (news agencies, gov, science)
  high: [
    'reuters.com','apnews.com','bbc.com','bbc.co.uk','npr.org','pbs.org',
    'theguardian.com','nytimes.com','washingtonpost.com','bloomberg.com',
    'ft.com','economist.com','nature.com','science.org','sciencemag.org',
    'who.int','cdc.gov','nih.gov','fda.gov','gov.uk','europa.eu',
    'un.org','unicef.org','worldbank.org','imf.org',
    'snopes.com','factcheck.org','politifact.com','fullfact.org','afp.com',
    'britannica.com','stanford.edu','mit.edu','harvard.edu','oxford.ac.uk',
    'cambridge.org','ncbi.nlm.nih.gov','pubmed.ncbi.nlm.nih.gov',
    'wikipedia.org','merriam-webster.com','ap.org',
  ],
  // Tier 2 — Medium trust (mainstream media, known outlets)
  medium: [
    'cnn.com','foxnews.com','nbcnews.com','cbsnews.com','abcnews.go.com',
    'usatoday.com','time.com','newsweek.com','theatlantic.com','vox.com',
    'wired.com','techcrunch.com','theverge.com','arstechnica.com',
    'forbes.com','businessinsider.com','cnbc.com','marketwatch.com',
    'medium.com','substack.com','reddit.com','quora.com',
    'youtube.com','twitter.com','x.com','linkedin.com',
  ],
  // Suspicious TLDs
  suspiciousTlds: ['xyz','tk','ml','ga','cf','gq','top','click','download','buzz','info','biz','ws'],
}

// ─────────────────────────────────────────────────────────────────────────────
// MANIPULATION PATTERN LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
const MANIPULATION_PATTERNS = [
  // Urgency / FOMO
  { id:'urgency',      category:'Urgency Tactics',         pattern:/\b(BREAKING|URGENT|ALERT|ACT NOW|LIMITED TIME|LAST CHANCE|HURRY|IMMEDIATELY|RIGHT NOW)\b/i,                                weight:-14, severity:'high' },
  { id:'share_bait',   category:'Share Bait',              pattern:/\b(share before (it'?s )?deleted|share now|spread the word|repost|forward this|pass it on)\b/i,                            weight:-16, severity:'high' },
  // Conspiracy / hidden truth
  { id:'conspiracy',   category:'Conspiracy Framing',      pattern:/\b(they don'?t want you to know|hidden truth|secret agenda|cover.?up|suppressed|what (they|media) won'?t tell)\b/i,       weight:-20, severity:'critical' },
  { id:'deep_state',   category:'Known Disinfo Phrases',   pattern:/\b(deep state|big pharma|new world order|shadow government|globalist|cabal|illuminati|plandemic|scamdemic)\b/i,            weight:-22, severity:'critical' },
  // Absolute claims
  { id:'absolute',     category:'Absolute Certainty',      pattern:/\b(100%|guaranteed|proven beyond|definitively|undeniable|irrefutable|absolute proof|confirmed fact)\b/i,                  weight:-12, severity:'medium' },
  { id:'miracle',      category:'Miracle Claims',          pattern:/\b(cure(s| all)|miracle (cure|solution|pill)|magic (fix|solution)|instant (cure|fix|results)|overnight (success|cure))\b/i, weight:-14, severity:'high' },
  // Emotional manipulation
  { id:'fear',         category:'Fear Manipulation',       pattern:/\b(you will (lose|die|suffer|fail)|everyone is (at risk|in danger)|mass (panic|hysteria)|catastrophic|apocalypse|end of (the world|civilization))\b/i, weight:-12, severity:'high' },
  { id:'outrage',      category:'Outrage Engineering',     pattern:/\b(outrageous|disgusting|sickening|infuriating|how dare|unacceptable|shameful|despicable|evil (agenda|plan|plot))\b/i,    weight:-10, severity:'medium' },
  // Clickbait
  { id:'clickbait',    category:'Clickbait Language',      pattern:/\b(you won'?t believe|mind.?blowing|jaw.?dropping|shocking truth|what happened next|this will (shock|amaze|surprise))\b/i, weight:-10, severity:'medium' },
  { id:'sensational',  category:'Sensational Headlines',   pattern:/\b(EXPOSED|LEAKED|BOMBSHELL|EXPLOSIVE|SCANDALOUS|STUNNING|UNBELIEVABLE|INCREDIBLE)\b/i,                                   weight:-8,  severity:'medium' },
  // Formatting red flags
  { id:'caps_lock',    category:'Excessive Capitalization',pattern:/([A-Z]{5,}\s){2,}/,                                                                                                        weight:-7,  severity:'low' },
  { id:'multi_exclaim',category:'Excessive Punctuation',   pattern:/!{2,}|\?{2,}|!{1}\?{1}|\?{1}!{1}/,                                                                                        weight:-6,  severity:'low' },
  // Unverifiable sources
  { id:'anon_source',  category:'Unverifiable Sources',    pattern:/\b(anonymous source|insider (says|claims|reveals)|whistleblower (says|claims)|source close to|unnamed official)\b/i,      weight:-10, severity:'medium' },
  { id:'no_source',    category:'Vague Attribution',       pattern:/\b(studies show|experts say|scientists confirm|doctors warn|officials say)\b(?!.*\b(according to|published|journal|university|institute)\b)/i, weight:-8, severity:'medium' },
  // Prediction / doom
  { id:'prediction',   category:'Catastrophic Predictions',pattern:/\b(will (crash|collapse|fail|end|destroy)|economy (will|is going to) (crash|collapse)|market (crash|collapse) (coming|imminent|soon))\b/i, weight:-9, severity:'medium' },
]

// ─────────────────────────────────────────────────────────────────────────────
// CREDIBILITY SIGNAL LIBRARY
// ─────────────────────────────────────────────────────────────────────────────
const CREDIBILITY_PATTERNS = [
  { id:'evidence',    category:'Evidence-Based Language',  pattern:/\b(according to|study (shows|found|indicates)|research (shows|indicates|suggests)|data (shows|suggests|indicates))\b/i,   weight:+14 },
  { id:'academic',    category:'Academic Reference',       pattern:/\b(published in|peer.reviewed|journal of|university (study|research)|institute (found|reports)|clinical trial)\b/i,        weight:+16 },
  { id:'official',    category:'Official Source',          pattern:/\b(official statement|press release|spokesperson (said|confirmed)|government (confirmed|announced)|ministry of)\b/i,       weight:+12 },
  { id:'balanced',    category:'Balanced Perspective',     pattern:/\b(however|on the other hand|critics (argue|say|claim)|disputed by|some experts|others (argue|disagree|question))\b/i,    weight:+10 },
  { id:'stats',       category:'Statistical Evidence',     pattern:/\b(\d+(\.\d+)?%|\d+ (percent|out of|in \d+)|sample (size|of)|n\s*=\s*\d+|margin of error)\b/i,                           weight:+10 },
  { id:'date',        category:'Dated Information',        pattern:/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i,       weight:+6  },
  { id:'correction',  category:'Transparency Signal',      pattern:/\b(correction|update|clarification|retraction|editor'?s note|this article was (updated|corrected))\b/i,                  weight:+8  },
  { id:'quote',       category:'Direct Attribution',       pattern:/"[^"]{10,}"[,\s]+(said|says|stated|confirmed|told|wrote)\s+\w/i,                                                          weight:+8  },
  { id:'hedging',     category:'Appropriate Uncertainty',  pattern:/\b(may|might|could|possibly|potentially|appears to|seems to|suggests|preliminary|early (results|data|findings))\b/i,     weight:+6  },
]

// ─────────────────────────────────────────────────────────────────────────────
// AI / SYNTHETIC WRITING DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
function detectAIWriting(text) {
  const signals = []
  let aiScore = 0

  // Overly formal / generic phrases
  const formalPhrases = [
    /\b(it is (important|crucial|essential|vital) to (note|understand|recognize|acknowledge))\b/i,
    /\b(in (today'?s|the modern|our current) (world|society|era|landscape|digital age))\b/i,
    /\b(this (phenomenon|issue|matter|topic|subject) (is|has been) (widely|extensively|broadly) (discussed|studied|observed|documented))\b/i,
    /\b(furthermore|moreover|additionally|consequently|nevertheless|notwithstanding)\b/i,
    /\b(it (should|must) be (noted|mentioned|emphasized|highlighted) that)\b/i,
    /\b(across (multiple|various|different|numerous) (regions|sectors|domains|areas|platforms))\b/i,
    /\b(a (comprehensive|holistic|multifaceted|nuanced) (approach|understanding|analysis|perspective))\b/i,
  ]

  let formalCount = 0
  for (const p of formalPhrases) {
    if (p.test(text)) formalCount++
  }

  if (formalCount >= 3) {
    signals.push({ type: 'warning', text: 'Overly formal / generic phrasing detected' })
    aiScore += 30
  } else if (formalCount >= 1) {
    signals.push({ type: 'info', text: 'Some formal language patterns present' })
    aiScore += 10
  }

  // Lack of personal context
  const personalMarkers = /\b(I (saw|heard|noticed|experienced|witnessed)|my (friend|colleague|neighbor)|yesterday|last (week|month|year)|in my (area|city|town|neighborhood))\b/i
  if (!personalMarkers.test(text) && text.split(/\s+/).length > 30) {
    signals.push({ type: 'info', text: 'No personal context or first-hand account' })
    aiScore += 10
  }

  // Repetition of key phrases (simple check)
  const words = text.toLowerCase().split(/\s+/)
  const wordFreq = {}
  for (const w of words) {
    if (w.length > 5) wordFreq[w] = (wordFreq[w] || 0) + 1
  }
  const repeated = Object.entries(wordFreq).filter(([, c]) => c >= 4)
  if (repeated.length >= 2) {
    signals.push({ type: 'info', text: 'Repetitive keyword usage detected' })
    aiScore += 15
  }

  // Perfect sentence uniformity (all sentences similar length)
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5)
  if (sentences.length >= 4) {
    const lengths = sentences.map(s => s.split(/\s+/).length)
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length
    if (variance < 8 && avg > 10) {
      signals.push({ type: 'warning', text: 'Unusually uniform sentence structure' })
      aiScore += 20
    }
  }

  const label = aiScore >= 50 ? 'Likely AI-Generated'
    : aiScore >= 25 ? 'Possibly AI-Assisted'
    : 'Appears Human-Written'

  return { aiScore: Math.min(aiScore, 100), label, signals }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIRAL SPREAD SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────
function simulateViralSpread(text, manipulationScore, emotionalScore) {
  // High emotional + high manipulation = high viral potential (bad)
  const viralPotential = Math.min(100, Math.round(
    (emotionalScore * 0.5) + (manipulationScore * 0.4) + (text.length > 100 ? 10 : 0)
  ))

  let spreadLabel, spreadColor, spreadWarning
  if (viralPotential >= 70) {
    spreadLabel = 'Extremely High Viral Risk'
    spreadColor = '#ef4444'
    spreadWarning = 'This content is engineered to spread rapidly. High misinformation risk.'
  } else if (viralPotential >= 45) {
    spreadLabel = 'Moderate Viral Potential'
    spreadColor = '#f97316'
    spreadWarning = 'Emotional triggers present. Likely to be shared without verification.'
  } else if (viralPotential >= 20) {
    spreadLabel = 'Low Viral Risk'
    spreadColor = '#f59e0b'
    spreadWarning = 'Some shareable elements, but limited manipulation signals.'
  } else {
    spreadLabel = 'Minimal Spread Risk'
    spreadColor = '#22c55e'
    spreadWarning = 'Content lacks viral manipulation patterns.'
  }

  return { viralPotential, spreadLabel, spreadColor, spreadWarning }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREDIBILITY IMPACT CALCULATOR (Truth Mirror)
// ─────────────────────────────────────────────────────────────────────────────
function calcCredibilityImpact(trustScore) {
  const impact = Math.round(100 - trustScore)
  let message, color
  if (impact >= 70) {
    message = `Sharing this would decrease your credibility by ~${impact}%`
    color = '#ef4444'
  } else if (impact >= 45) {
    message = `Sharing this could reduce your credibility by ~${impact}%`
    color = '#f97316'
  } else if (impact >= 20) {
    message = `Minor credibility risk if shared (~${impact}% impact)`
    color = '#f59e0b'
  } else {
    message = `Safe to share — minimal credibility risk (~${impact}% impact)`
    color = '#22c55e'
  }
  return { impact, message, color }
}

// ─────────────────────────────────────────────────────────────────────────────
// URL ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────
function analyzeURL(text) {
  const urlMatch = text.match(/https?:\/\/([^\s/]+)/i)
  if (!urlMatch) return { found: false, tier: null, domain: null, weight: 0, label: 'No URL provided' }

  const domain = urlMatch[1].replace(/^www\./, '').toLowerCase()

  if (DOMAIN_TRUST.high.some(d => domain === d || domain.endsWith('.' + d))) {
    return { found: true, tier: 'high', domain, weight: +22, label: `Trusted source: ${domain}` }
  }
  if (DOMAIN_TRUST.medium.some(d => domain === d || domain.endsWith('.' + d))) {
    return { found: true, tier: 'medium', domain, weight: +8, label: `Known source: ${domain}` }
  }

  const tld = domain.split('.').pop()
  if (DOMAIN_TRUST.suspiciousTlds.includes(tld)) {
    return { found: true, tier: 'suspicious', domain, weight: -18, label: `Suspicious domain: ${domain}` }
  }
  if (/[0-9]{4,}/.test(domain) || domain.split('.').length > 4) {
    return { found: true, tier: 'suspicious', domain, weight: -12, label: `Unusual domain structure: ${domain}` }
  }

  return { found: true, tier: 'unknown', domain, weight: 0, label: `Unverified source: ${domain}` }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMOTIONAL INTENSITY METER
// ─────────────────────────────────────────────────────────────────────────────
function measureEmotionalIntensity(text) {
  const highEmotion = (text.match(/\b(outrage|furious|disgusting|unbelievable|insane|crazy|evil|destroy|attack|hate|fear|panic|terrifying|horrifying|devastating|catastrophic|shocking|explosive|bombshell)\b/gi) || []).length
  const medEmotion  = (text.match(/\b(angry|upset|worried|concerned|alarming|disturbing|troubling|serious|critical|urgent|important|significant)\b/gi) || []).length
  const score = Math.min(100, (highEmotion * 15) + (medEmotion * 5))
  const label = score >= 60 ? 'Very High' : score >= 35 ? 'High' : score >= 15 ? 'Moderate' : 'Low'
  return { score, label, highCount: highEmotion, medCount: medEmotion }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────
function analyzeStructure(text) {
  const words = text.trim().split(/\s+/)
  const wordCount = words.length
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 3)
  const sentenceCount = sentences.length
  const avgLen = sentenceCount > 0 ? wordCount / sentenceCount : wordCount

  let weight = 0
  const notes = []

  if (wordCount < 8)        { weight -= 10; notes.push('Very short — insufficient context') }
  else if (wordCount > 40)  { weight += 6 }

  if (avgLen > 45)          { weight -= 5;  notes.push('Unusually long sentences') }

  return { wordCount, sentenceCount, avgLen: Math.round(avgLen), weight, notes }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAIM EXTRACTOR
// ─────────────────────────────────────────────────────────────────────────────
function extractClaim(text) {
  const clean = text.replace(/https?:\/\/\S+/g, '').trim()
  const sentences = clean.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 12)
  if (!sentences.length) return text.slice(0, 140)
  const best = sentences.sort((a, b) => b.length - a.length)[0]
  return best.slice(0, 160) + (best.length > 160 ? '…' : '')
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE → LABEL
// ─────────────────────────────────────────────────────────────────────────────
export function scoreToLabel(score) {
  if (score >= 75) return { label: 'High Trust',     color: '#22c55e', emoji: '🟢', textColor: '#4ade80' }
  if (score >= 55) return { label: 'Moderate Trust', color: '#f59e0b', emoji: '🟡', textColor: '#fbbf24' }
  if (score >= 35) return { label: 'Low Trust',      color: '#f97316', emoji: '🟠', textColor: '#fb923c' }
  return                  { label: 'Very Low Trust', color: '#ef4444', emoji: '🔴', textColor: '#f87171' }
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK HEATMAP — 4 dimensions
// ─────────────────────────────────────────────────────────────────────────────
function buildHeatmap(manipScore, emotionalScore, sourceScore, factualScore) {
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)))
  return {
    emotional:    { label: 'Emotional Intensity',    value: clamp(emotionalScore),                  color: emotionalScore > 60 ? '#ef4444' : emotionalScore > 30 ? '#f97316' : '#22c55e' },
    source:       { label: 'Source Reliability',     value: clamp(sourceScore),                     color: sourceScore > 60 ? '#22c55e' : sourceScore > 30 ? '#f59e0b' : '#ef4444' },
    factual:      { label: 'Factual Uncertainty',    value: clamp(100 - factualScore),              color: factualScore > 60 ? '#22c55e' : factualScore > 30 ? '#f59e0b' : '#ef4444' },
    manipulation: { label: 'Manipulation Probability', value: clamp(manipScore),                    color: manipScore > 60 ? '#ef4444' : manipScore > 30 ? '#f97316' : '#22c55e' },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYZE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeContent(input) {
  await new Promise(r => setTimeout(r, 1600 + Math.random() * 1000))

  const text = input.trim()
  let score = 52 // neutral baseline

  // 1. URL / source
  const urlInfo = analyzeURL(text)
  score += urlInfo.weight
  const sourceScore = urlInfo.tier === 'high' ? 90 : urlInfo.tier === 'medium' ? 55 : urlInfo.tier === 'suspicious' ? 10 : 30

  // 2. Manipulation patterns
  const triggeredManip = []
  let manipPenalty = 0
  for (const p of MANIPULATION_PATTERNS) {
    if (p.pattern.test(text)) {
      triggeredManip.push(p)
      manipPenalty += Math.abs(p.weight)
      score += p.weight
    }
  }
  const manipScore = Math.min(100, manipPenalty * 2.5)

  // 3. Credibility patterns
  const triggeredCred = []
  let credBonus = 0
  for (const p of CREDIBILITY_PATTERNS) {
    if (p.pattern.test(text)) {
      triggeredCred.push(p)
      credBonus += p.weight
      score += p.weight
    }
  }
  const factualScore = Math.min(100, 30 + credBonus * 2)

  // 4. Structure
  const structure = analyzeStructure(text)
  score += structure.weight

  // 5. Emotional intensity
  const emotional = measureEmotionalIntensity(text)
  score -= Math.round(emotional.score * 0.15)

  // 6. AI writing detection
  const aiAnalysis = detectAIWriting(text)

  // 7. Clamp score
  score = Math.max(4, Math.min(96, Math.round(score)))

  // 8. Derived outputs
  const claim = extractClaim(text)
  const { label, color, emoji, textColor } = scoreToLabel(score)
  const viralData = simulateViralSpread(text, manipScore, emotional.score)
  const credImpact = calcCredibilityImpact(score)
  const heatmap = buildHeatmap(manipScore, emotional.score, sourceScore, factualScore)

  // 9. Risk classification
  const riskLabel = score >= 72 ? 'Likely Reliable'
    : score >= 52 ? 'Needs Verification'
    : score >= 32 ? 'Likely Manipulated / Suspicious'
    : 'High Risk — Do Not Share'

  // 10. Build signal list (top 8, most impactful first)
  const signals = []

  // Source signal
  if (urlInfo.found) {
    const icon = urlInfo.tier === 'high' ? '✅' : urlInfo.tier === 'medium' ? 'ℹ️' : urlInfo.tier === 'suspicious' ? '🚨' : '⚠️'
    signals.push({ icon, text: urlInfo.label, severity: urlInfo.tier === 'high' ? 'good' : urlInfo.tier === 'suspicious' ? 'critical' : 'warn' })
  } else {
    signals.push({ icon: '⚠️', text: 'No source link provided', severity: 'warn' })
  }

  // Manipulation signals (sorted by severity)
  const criticals = triggeredManip.filter(p => p.severity === 'critical')
  const highs     = triggeredManip.filter(p => p.severity === 'high')
  const meds      = triggeredManip.filter(p => p.severity === 'medium')
  const lows      = triggeredManip.filter(p => p.severity === 'low')
  for (const p of [...criticals, ...highs, ...meds, ...lows].slice(0, 4)) {
    signals.push({ icon: p.severity === 'critical' ? '🚨' : p.severity === 'high' ? '❌' : '⚠️', text: p.category + ' detected', severity: p.severity === 'critical' ? 'critical' : p.severity === 'high' ? 'bad' : 'warn' })
  }

  // Credibility signals
  for (const p of triggeredCred.slice(0, 3)) {
    signals.push({ icon: '✅', text: p.category, severity: 'good' })
  }

  // Emotional
  if (emotional.score >= 35) {
    signals.push({ icon: '⚠️', text: `${emotional.label} emotional intensity detected`, severity: emotional.score >= 60 ? 'bad' : 'warn' })
  }

  // AI writing
  if (aiAnalysis.aiScore >= 25) {
    signals.push({ icon: '🤖', text: aiAnalysis.label, severity: aiAnalysis.aiScore >= 50 ? 'warn' : 'info' })
  }

  // Structure notes
  for (const note of structure.notes) {
    signals.push({ icon: 'ℹ️', text: note, severity: 'info' })
  }

  return {
    claim,
    trust_score: score,
    label,
    color,
    emoji,
    textColor,
    risk_label: riskLabel,
    signals: signals.slice(0, 8),
    url_info: urlInfo,
    word_count: structure.wordCount,
    emotional,
    ai_analysis: aiAnalysis,
    viral: viralData,
    cred_impact: credImpact,
    heatmap,
    manipulation_count: triggeredManip.length,
    credibility_count: triggeredCred.length,
    analyzed_at: new Date().toISOString(),
  }
}
