/**
 * Local title generator — no API needed.
 * Generates viral titles based on style + canvas context.
 */

const TEMPLATES = {
  reaction: [
    'YOU WON\'T BELIEVE THIS 😱',
    'I CAN\'T BELIEVE WHAT HAPPENED...',
    'THIS CHANGED EVERYTHING 🔥',
    'SHOCKING TRUTH REVEALED 😳',
    'WAIT FOR IT... 😱🔥',
    'NOBODY SAW THIS COMING',
    'THE MOMENT EVERYTHING CHANGED',
  ],
  gaming: [
    'INSANE PLAY! 🎮🔥',
    '1 vs 100 CLUTCH WIN',
    'WORLD RECORD BROKEN 🏆',
    'IMPOSSIBLE SHOT! 😱',
    'THEY DIDN\'T SEE IT COMING 💀',
    'THE GREATEST PLAY EVER MADE',
    'HOW DID I SURVIVE THIS?! 🎮',
  ],
  drama: [
    'EVERYTHING CHANGED TODAY...',
    'THE MOMENT IT ALL WENT WRONG',
    'I ALMOST QUIT... (emotional)',
    'THE TRUTH HURTS 💔',
    'THIS BROKE ME...',
    'I NEED TO TELL YOU SOMETHING',
    'THE END OF AN ERA',
  ],
  news: [
    'BREAKING NEWS 🔴 JUST HAPPENED',
    'NOBODY EXPECTED THIS TODAY',
    'URGENT: EVERYTHING CHANGED',
    'THIS JUST HAPPENED LIVE',
    'THE WORLD IS SHOCKED RIGHT NOW',
  ],
  motivational: [
    'THIS WILL CHANGE YOUR LIFE 🚀',
    'WATCH THIS EVERY MORNING',
    'THE SECRET NOBODY TELLS YOU',
    'DO THIS FOR 30 DAYS — RESULTS',
    'STOP WASTING YOUR TIME (watch this)',
    'THE MINDSET THAT CHANGED EVERYTHING',
  ],
  curiosity: [
    'WHY NOBODY TALKS ABOUT THIS',
    'THE TRUTH ABOUT... (shocking)',
    'WHAT THEY DON\'T WANT YOU TO KNOW',
    'I TRIED IT FOR 7 DAYS...',
    'THE REAL REASON WHY...',
    'WHAT HAPPENS IF YOU...',
  ],
  tutorial: [
    'HOW TO DO THIS IN 60 SECONDS',
    'THE EASIEST WAY TO...',
    'NOBODY TEACHES THIS METHOD',
    'DO THIS INSTEAD (way better)',
    'THE TRICK PROS USE',
  ],
}

// Detect style from canvas objects
export function detectStyle(fabricCanvas) {
  if (!fabricCanvas) return 'reaction'
  const objs = fabricCanvas.getObjects()
  const textObjs = objs.filter(o => o.type === 'i-text' || o.type === 'textbox')

  // Check existing text for clues
  const existingText = textObjs.map(t => (t.text || '').toLowerCase()).join(' ')
  if (existingText.includes('game') || existingText.includes('play') || existingText.includes('win')) return 'gaming'
  if (existingText.includes('news') || existingText.includes('break')) return 'news'
  if (existingText.includes('how') || existingText.includes('tutorial')) return 'tutorial'
  if (existingText.includes('why') || existingText.includes('secret')) return 'curiosity'

  // Check background brightness for mood
  try {
    const bg = fabricCanvas.backgroundImage
    if (bg) {
      const off = document.createElement('canvas')
      off.width = 80; off.height = 45
      const ctx = off.getContext('2d')
      bg.render(ctx)
      const d = ctx.getImageData(0, 0, 80, 45).data
      let brightness = 0
      for (let i = 0; i < d.length; i += 16) {
        brightness += d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114
      }
      brightness /= (d.length / 16)
      if (brightness < 60) return 'drama'
    }
  } catch (_) {}

  return 'reaction'
}

export function generateTitles(style = 'reaction', count = 5) {
  const pool = TEMPLATES[style] || TEMPLATES.reaction
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Rewrite existing text to be more viral
export function rewriteViral(text) {
  if (!text || text.length < 2) return text
  const t = text.trim()

  // Already viral-looking
  if (t === t.toUpperCase() && t.length > 4) {
    // Add emoji if missing
    if (!/[\u{1F300}-\u{1FFFF}]/u.test(t)) {
      const emojis = ['🔥', '😱', '⚡', '💀', '🏆', '😳']
      return t + ' ' + emojis[Math.floor(Math.random() * emojis.length)]
    }
    return t
  }

  // Capitalize + make punchy
  const upper = t.toUpperCase()
  const punchy = [
    `${upper} 😱`,
    `YOU WON'T BELIEVE: ${upper}`,
    `INSANE: ${upper} 🔥`,
    `${upper}... (SHOCKING)`,
    `THE TRUTH ABOUT ${upper}`,
  ]
  return punchy[Math.floor(Math.random() * punchy.length)]
}
