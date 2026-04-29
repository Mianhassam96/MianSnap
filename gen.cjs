// Patches InputScreen to add TrendingFeed, and TrustCard to add CommunityVerdict
const fs = require('fs')

// ── 1. Patch InputScreen — add TrendingFeed import + component ────────────────
let input = fs.readFileSync('src/components/InputScreen.jsx', 'utf8')

// Add import
if (!input.includes('TrendingFeed')) {
  input = input.replace(
    "import React, { useState, useRef, useEffect } from 'react'",
    "import React, { useState, useRef, useEffect } from 'react'\nimport TrendingFeed from './TrendingFeed.jsx'"
  )
}

// Add TrendingFeed before closing footer div — insert before the last </div> of the component
// Find the footer div and insert TrendingFeed before it
input = input.replace(
  "      {/* Footer */}\n      <div style={{\n        marginTop: '48px', fontSize: '12px', color: '#334155', textAlign: 'center',",
  "      {/* Trending Feed */}\n      <TrendingFeed onAnalyze={onAnalyze} />\n\n      {/* Footer */}\n      <div style={{\n        marginTop: '48px', fontSize: '12px', color: '#334155', textAlign: 'center',"
)

// Remove old example pills section (replaced by trending feed)
// Keep it but reduce margin
input = input.replace("marginTop: '32px', width: '100%', maxWidth: '680px',", "marginTop: '24px', width: '100%', maxWidth: '720px',")

// Widen input card to match feed width
input = input.replace("width: '100%', maxWidth: '680px',\n        animation: 'fadeUp .6s .1s ease both',", "width: '100%', maxWidth: '720px',\n        animation: 'fadeUp .6s .1s ease both',")

fs.writeFileSync('src/components/InputScreen.jsx', input, 'utf8')
console.log('InputScreen patched:', input.split('\n').length, 'lines')

// ── 2. Patch TrustCard — add CommunityVerdict section ────────────────────────
let card = fs.readFileSync('src/components/TrustCard.jsx', 'utf8')

// Add import at top
if (!card.includes('CommunityVerdict')) {
  card = 'import CommunityVerdict from \'./CommunityVerdict.jsx\'\n' + card
}

// Insert CommunityVerdict section after the SIGNALS section
// Find the AI DETECTOR section comment and insert before it
card = card.replace(
  "        {/* AI DETECTOR */}",
  "        {/* COMMUNITY VERDICT */}\n        <CommunityVerdict claim={claim} trustScore={trust_score} />\n\n        {/* AI DETECTOR */}"
)

fs.writeFileSync('src/components/TrustCard.jsx', card, 'utf8')
console.log('TrustCard patched:', card.split('\n').length, 'lines')

// ── 3. Add session stats to InputScreen stats bar ─────────────────────────────
let input2 = fs.readFileSync('src/components/InputScreen.jsx', 'utf8')

// Add feedStore import
if (!input2.includes('getSessionStats')) {
  input2 = input2.replace(
    "import TrendingFeed from './TrendingFeed.jsx'",
    "import TrendingFeed from './TrendingFeed.jsx'\nimport { getSessionStats } from '../utils/feedStore.js'"
  )
}

fs.writeFileSync('src/components/InputScreen.jsx', input2, 'utf8')
console.log('InputScreen stats import added')

console.log('\nAll patches applied.')
