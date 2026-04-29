import CommunityVerdict from './CommunityVerdict.jsx'
﻿import React, { useState, useEffect } from "react"

// Animated counter
function ScoreCounter({ target }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let v = 0
    const step = Math.max(1, Math.ceil(target / 45))
    const id = setInterval(() => { v = Math.min(v + step, target); setN(v); if (v >= target) clearInterval(id) }, 25)
    return () => clearInterval(id)
  }, [target])
  return React.createElement(React.Fragment, null, n)
}

// Score ring SVG
function ScoreRing({ score, color }) {
  const r = 68, circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)
  useEffect(() => { const t = setTimeout(() => setOffset(circ * (1 - score / 100)), 150); return () => clearTimeout(t) }, [score, circ])
  return (
    React.createElement("svg", { width: 176, height: 176, style: { transform: "rotate(-90deg)" } },
      React.createElement("circle", { cx: 88, cy: 88, r, fill: "none", stroke: "rgba(255,255,255,0.06)", strokeWidth: 10 }),
      React.createElement("circle", { cx: 88, cy: 88, r, fill: "none", stroke: color, strokeWidth: 10, strokeLinecap: "round",
        strokeDasharray: circ, strokeDashoffset: offset,
        style: { transition: "stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)", filter: "drop-shadow(0 0 10px " + color + "90)" } })
    )
  )
}

// Animated heat bar
function HeatBar({ label, value, color }) {
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(value), 300); return () => clearTimeout(t) }, [value])
  return React.createElement("div", { style: { marginBottom: "10px" } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "5px" } },
      React.createElement("span", { style: { fontSize: "12px", color: "#94a3b8" } }, label),
      React.createElement("span", { style: { fontSize: "12px", fontWeight: 700, color } }, value + "%")
    ),
    React.createElement("div", { style: { height: "7px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" } },
      React.createElement("div", { style: { height: "100%", width: w + "%", background: color, borderRadius: "100px", transition: "width 1s cubic-bezier(.4,0,.2,1)", boxShadow: "0 0 8px " + color + "80" } })
    )
  )
}

const SEV = {
  critical: { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  text: "#fca5a5" },
  bad:      { bg: "rgba(239,68,68,0.05)",  border: "rgba(239,68,68,0.15)",  text: "#fca5a5" },
  warn:     { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)",  text: "#fde68a" },
  good:     { bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.2)",   text: "#86efac" },
  info:     { bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.15)", text: "#c4b5fd" },
}

function SignalRow({ icon, text, severity, delay }) {
  const s = SEV[severity] || SEV.info
  return React.createElement("div", {
    style: { display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px",
      background: s.bg, border: "1px solid " + s.border, borderRadius: "10px",
      fontSize: "13px", color: s.text, lineHeight: 1.5,
      animation: "fadeUp .4s " + (delay || 0) + "s ease both", opacity: 0, animationFillMode: "forwards" }
  },
    React.createElement("span", { style: { fontSize: "15px", flexShrink: 0, marginTop: "1px" } }, icon),
    React.createElement("span", null, text)
  )
}

function Sec({ title, children, noBorder }) {
  return React.createElement("div", { style: { padding: "20px 24px", borderBottom: noBorder ? "none" : "1px solid rgba(255,255,255,0.05)" } },
    title && React.createElement("div", { style: { fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" } }, title),
    children
  )
}

export default function TrustCard({ result, onAnalyzeAnother }) {
  const [copied, setCopied] = useState(false)
  const { claim, trust_score, label, color, emoji, textColor, risk_label, signals,
    word_count, emotional, ai_analysis, viral, cred_impact, heatmap,
    confidence, decision, manipulation_count, credibility_count, analyzed_at } = result

  const shareText = "MianSnap Trust Analysis\n\nClaim: \"" + claim + "\"\n\nTrust Score: " + trust_score + "/100 " + emoji + " " + label + "\n" + decision.verdict + "\n\n" + cred_impact.message + "\n\nAnalyze any content: https://mianhassam96.github.io/MianSnap/ #MianSnap #TrustLayer"
  const copy = async () => { try { await navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch {} }
  const tweet = () => { const t = encodeURIComponent("Trust Score: " + trust_score + "/100 " + emoji + " " + label + "\n\n\"" + claim.slice(0,100) + "\"\n\n" + decision.verdict + "\n\nCheck: https://mianhassam96.github.io/MianSnap/ #MianSnap"); window.open("https://twitter.com/intent/tweet?text=" + t, "_blank", "noopener") }
  const whatsapp = () => window.open("https://wa.me/?text=" + encodeURIComponent(shareText), "_blank", "noopener")

  const shieldIcon = React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 100 100", fill: "none" },
    React.createElement("path", { d: "M50 10L78 22V50C78 66 65 76 50 83C35 76 22 66 22 50V22Z", stroke: "white", strokeWidth: 8, strokeLinejoin: "round" }),
    React.createElement("polyline", { points: "36,50 46,60 64,40", stroke: "white", strokeWidth: 7, strokeLinecap: "round", strokeLinejoin: "round" })
  )

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px 60px", animation: "fadeIn .4s ease" }}>

      {/* NAV */}
      <div style={{ width: "100%", maxWidth: "720px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>{shieldIcon}</div>
          <span style={{ fontSize: "16px", fontWeight: 800, background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MianSnap</span>
          <span style={{ fontSize: "10px", color: "#475569", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "6px", padding: "2px 7px", fontWeight: 600 }}>TRUST LAYER</span>
        </div>
        <button onClick={onAnalyzeAnother}
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", borderRadius: "10px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, transition: "all .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,0.1)"}>
          + Analyze Another
        </button>
      </div>

      {/* CARD */}
      <div style={{ width: "100%", maxWidth: "720px", background: "rgba(255,255,255,0.025)", border: "1.5px solid " + color + "35", borderRadius: "24px", overflow: "hidden", boxShadow: "0 0 80px " + color + "12, 0 24px 80px rgba(0,0,0,0.5)", animation: "fadeUp .5s ease both" }}>

        {/* HEADER */}
        <div style={{ background: "linear-gradient(135deg," + color + "18," + color + "06)", borderBottom: "1px solid " + color + "20", padding: "24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: color + "22", border: "1px solid " + color + "45", borderRadius: "20px", padding: "4px 14px", fontSize: "11px", fontWeight: 800, color: textColor, marginBottom: "12px", letterSpacing: "1px", textTransform: "uppercase" }}>
              {emoji} {label}
            </div>
            <p style={{ fontSize: "clamp(13px,2vw,16px)", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.6, marginBottom: "12px" }}>"{claim}"</p>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}><span style={{ color: "#94a3b8", fontWeight: 600 }}>{word_count}</span> words</span>
              <span style={{ fontSize: "12px", color: "#64748b" }}><span style={{ color: "#94a3b8", fontWeight: 600 }}>{manipulation_count}</span> red flags</span>
              <span style={{ fontSize: "12px", color: "#64748b" }}><span style={{ color: "#94a3b8", fontWeight: 600 }}>{credibility_count}</span> trust signals</span>
            </div>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <ScoreRing score={trust_score} color={color} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "38px", fontWeight: 900, color: textColor, lineHeight: 1 }}><ScoreCounter target={trust_score} /></span>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>/100</span>
              <span style={{ fontSize: "9px", color: "#475569", marginTop: "2px", letterSpacing: "1px" }}>TRUST SCORE</span>
            </div>
          </div>
        </div>

        {/* CONFIDENCE BADGE */}
        <div style={{ padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", background: "rgba(99,102,241,0.03)" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: confidence.score >= 75 ? "#22c55e" : confidence.score >= 50 ? "#f59e0b" : "#f97316", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#64748b" }}>Analysis Confidence:</span>
          <span style={{ fontSize: "12px", fontWeight: 700, color: confidence.score >= 75 ? "#4ade80" : confidence.score >= 50 ? "#fbbf24" : "#fb923c" }}>{confidence.score}% — {confidence.label}</span>
          <span style={{ fontSize: "11px", color: "#334155", marginLeft: "auto", maxWidth: "260px", textAlign: "right" }}>{confidence.note}</span>
        </div>

        {/* DECISION LAYER */}
        <Sec title="⚡ What Should You Do?">
          <div style={{ padding: "18px", background: decision.bg, border: "1px solid " + decision.border, borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ fontSize: "28px" }}>{decision.icon}</span>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: decision.color }}>{decision.verdict}</div>
                <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "3px", lineHeight: 1.5 }}>{decision.action}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {decision.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#cbd5e1" }}>
                  <span style={{ color: decision.color, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            {decision.shareConsequence && (
              <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", fontSize: "12px", color: "#94a3b8", borderLeft: "3px solid " + decision.color }}>
                <span style={{ color: decision.color, fontWeight: 700 }}>If you share this: </span>{decision.shareConsequence}
              </div>
            )}
          </div>
        </Sec>

        {/* TRUTH MIRROR */}
        <Sec title="🪞 Truth Mirror — Your Credibility at Stake">
          <div style={{ padding: "16px", background: cred_impact.color + "10", border: "1px solid " + cred_impact.color + "30", borderRadius: "14px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "40px", fontWeight: 900, color: cred_impact.color, flexShrink: 0, lineHeight: 1 }}>-{cred_impact.impact}%</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginBottom: "4px" }}>{cred_impact.message}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Estimated credibility impact if shared without verification</div>
            </div>
          </div>
        </Sec>

        {/* VIRAL SPREAD */}
        <Sec title="🔥 Viral Spread Simulator">
          <div style={{ padding: "16px", background: viral.spreadColor + "10", border: "1px solid " + viral.spreadColor + "30", borderRadius: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: viral.spreadColor, background: viral.spreadColor + "20", border: "1px solid " + viral.spreadColor + "40", borderRadius: "20px", padding: "3px 12px", letterSpacing: "0.5px", textTransform: "uppercase" }}>{viral.spreadLabel}</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: viral.spreadColor, marginLeft: "auto" }}>{viral.viralPotential}%</div>
            </div>
            <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden", marginBottom: "10px" }}>
              <div style={{ height: "100%", width: viral.viralPotential + "%", background: "linear-gradient(90deg," + viral.spreadColor + "80," + viral.spreadColor + ")", borderRadius: "100px", transition: "width 1.2s ease", boxShadow: "0 0 10px " + viral.spreadColor + "60" }} />
            </div>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.6 }}>{viral.spreadWarning}</p>
          </div>
        </Sec>

        {/* RISK HEATMAP */}
        <Sec title="🗺️ Content Risk Heatmap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            {Object.values(heatmap).map(({ label: l, value, color: c }) => (
              <HeatBar key={l} label={l} value={value} color={c} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
            {[["#22c55e","Safe"],["#f59e0b","Questionable"],["#ef4444","High Risk"]].map(([c,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: "11px", color: "#475569" }}>{l}</span>
              </div>
            ))}
          </div>
        </Sec>

        {/* SIGNALS */}
        <Sec title="📡 Trust Signals Detected">
          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {signals.length > 0
              ? signals.map((s, i) => React.createElement(SignalRow, { key: i, icon: s.icon, text: s.text, severity: s.severity, delay: i * 0.06 }))
              : React.createElement("p", { style: { fontSize: "13px", color: "#475569", fontStyle: "italic" } }, "No specific signals detected.")
            }
          </div>
        </Sec>

        {/* COMMUNITY VERDICT */}
        <CommunityVerdict claim={claim} trustScore={trust_score} />

        {/* AI DETECTOR */}
        <Sec title="🤖 AI Writing Style Detector">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: ai_analysis.aiScore >= 50 ? "#f97316" : ai_analysis.aiScore >= 25 ? "#f59e0b" : "#22c55e", marginBottom: "4px" }}>{ai_analysis.label}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>AI pattern confidence: {ai_analysis.aiScore}%</div>
            </div>
            <div style={{ width: "72px", height: "72px", position: "relative", flexShrink: 0 }}>
              <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle cx="36" cy="36" r="28" fill="none" stroke={ai_analysis.aiScore >= 50 ? "#f97316" : ai_analysis.aiScore >= 25 ? "#f59e0b" : "#22c55e"} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - ai_analysis.aiScore / 100)}
                  style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: "#e2e8f0" }}>{ai_analysis.aiScore}%</div>
            </div>
          </div>
          {ai_analysis.signals.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {ai_analysis.signals.map((s, i) => (
                <div key={i} style={{ fontSize: "12px", color: s.type === "warning" ? "#fde68a" : "#94a3b8", padding: "6px 10px", background: s.type === "warning" ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid " + (s.type === "warning" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)") }}>
                  {s.type === "warning" ? "⚠️" : "ℹ️"} {s.text}
                </div>
              ))}
            </div>
          )}
        </Sec>

        {/* EMOTIONAL INTENSITY */}
        <Sec title="💢 Emotional Intensity Meter">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: emotional.score >= 60 ? "#ef4444" : emotional.score >= 35 ? "#f97316" : "#22c55e", marginBottom: "6px" }}>{emotional.label} Emotional Intensity</div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: emotional.score + "%", background: emotional.score >= 60 ? "linear-gradient(90deg,#f97316,#ef4444)" : emotional.score >= 35 ? "linear-gradient(90deg,#f59e0b,#f97316)" : "#22c55e", borderRadius: "100px", transition: "width 1s ease" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "6px" }}>{emotional.highCount} high-intensity + {emotional.medCount} medium-intensity emotional words</div>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 900, color: emotional.score >= 60 ? "#ef4444" : emotional.score >= 35 ? "#f97316" : "#22c55e", flexShrink: 0 }}>{emotional.score}%</div>
          </div>
        </Sec>

        {/* DISCLAIMER */}
        <Sec>
          <div style={{ padding: "12px 16px", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "10px" }}>
            <p style={{ fontSize: "11px", color: "#475569", lineHeight: 1.7 }}>
              <strong style={{ color: "#6366f1" }}>MianSnap is a content credibility decision assistant.</strong> It analyzes psychological and linguistic patterns — not real-time facts. Signals use language like "likely", "suggests", "risk level" — never absolute truth claims. Always verify with trusted sources before believing or sharing.
            </p>
          </div>
        </Sec>

        {/* SHARE */}
        <Sec title="📤 Share This Result" noBorder>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
            <button onClick={copy} style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.1)", border: "1px solid " + (copied ? "rgba(34,197,94,0.3)" : "rgba(99,102,241,0.25)"), color: copied ? "#86efac" : "#a5b4fc", borderRadius: "10px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, transition: "all .2s" }}>
              {copied ? "✅ Copied!" : "📋 Copy Result"}
            </button>
            <button onClick={tweet} style={{ background: "rgba(29,161,242,0.1)", border: "1px solid rgba(29,161,242,0.2)", color: "#60a5fa", borderRadius: "10px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, transition: "all .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(29,161,242,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(29,161,242,0.1)"}>
              𝕏 Twitter
            </button>
            <button onClick={whatsapp} style={{ background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)", color: "#4ade80", borderRadius: "10px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, transition: "all .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.1)"}>
              💬 WhatsApp
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "#334155" }}>Analyzed {new Date(analyzed_at).toLocaleString()} · MianSnap Trust Layer · Before you believe or share — check its reality signals.</p>
        </Sec>

      </div>

      {/* CTA */}
      <div style={{ marginTop: "20px", width: "100%", maxWidth: "720px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={onAnalyzeAnother} style={{ flex: 1, minWidth: "200px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "14px", padding: "14px 24px", fontSize: "15px", fontWeight: 700, boxShadow: "0 4px 20px rgba(99,102,241,0.4)", transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
          🔍 Verify Before You Share
        </button>
        <button onClick={copy} style={{ flex: 1, minWidth: "200px", background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "14px 24px", fontSize: "15px", fontWeight: 600, transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
          📤 Share This Result
        </button>
      </div>

      <div style={{ marginTop: "32px", fontSize: "12px", color: "#334155", textAlign: "center" }}>
        Built by <a href="https://multimian.com" target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>MultiMian</a> · MianSnap Trust Layer · Free forever
      </div>
    </div>
  )
}