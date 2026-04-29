# 🛡️ MianSnap — Trust Layer

<div align="center">

**Paste any content. Instantly see how trustworthy it is.**  
Evidence-based trust score · No account · Free forever · 100% browser-based

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-6366f1?style=for-the-badge)](https://mianhassam96.github.io/MianSnap/)
[![GitHub Stars](https://img.shields.io/github/stars/Mianhassam96/MianSnap?style=for-the-badge&color=facc15)](https://github.com/Mianhassam96/MianSnap/stargazers)
[![License](https://img.shields.io/badge/License-MIT-4ade80?style=for-the-badge)](LICENSE)

[**→ mianhassam96.github.io/MianSnap**](https://mianhassam96.github.io/MianSnap/)

</div>

---

## What is MianSnap Trust Layer?

A tool that lets users paste any social content and instantly see:

> **"How trustworthy is this content — and why?"**

Not "fake/real" — but an **evidence-based trust score + explanation**.

---

## 🚀 Core Features

### 🔍 Input System
- Paste any text, news headline, social media post, or URL
- Supports up to 2,000 characters
- One-click clipboard paste

### 🧠 Trust Engine (client-side)
- **Source credibility** — detects trusted domains (Reuters, BBC, WHO, etc.)
- **Suspicious pattern detection** — 12 red-flag language patterns
- **Credibility signals** — evidence-based language, citations, balanced framing
- **Emotional intensity analysis** — flags high-emotion manipulation language
- **URL domain analysis** — trusted vs. suspicious TLDs
- **Content structure scoring** — length, sentence complexity

### 📊 Trust Card Output
- **0–100 Trust Score** with animated ring visualization
- **Risk classification**: Likely Reliable / Needs Verification / Likely Manipulated / High Risk
- **Signal breakdown** — exactly why the score is what it is
- **Share buttons** — Twitter, WhatsApp, LinkedIn, Copy

### 🔥 Viral Loop
1. Viral post appears on social media
2. User pastes into MianSnap
3. Gets a Trust Card result
4. Shares result publicly
5. Others get curious → use the tool

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite 5 |
| State | React hooks (useState/useCallback) |
| Analysis | Client-side heuristic engine |
| Deploy | GitHub Pages + Actions CI/CD |

---

## 🚀 Getting Started

```bash
git clone https://github.com/Mianhassam96/MianSnap.git
cd MianSnap
npm install
npm run dev
```

Open [http://localhost:5173/MianSnap/](http://localhost:5173/MianSnap/)

```bash
npm run build
```

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── InputScreen.jsx      # Paste input + examples
│   ├── AnalyzingScreen.jsx  # Animated analysis steps
│   └── TrustCard.jsx        # Score + signals + share
├── utils/
│   └── trustEngine.js       # Heuristic trust analysis engine
├── App.jsx                  # Screen state machine
└── main.jsx
```

---

## 🔮 Roadmap

- **Phase 2**: Real API backend (OpenAI + SerpAPI for web verification)
- **Phase 3**: Chrome extension (auto-check posts in feed)
- **Phase 4**: Account credibility scoring
- **Phase 5**: Developer API

---

## 📌 Author

Built with ❤️ by **[MultiMian](https://multimian.com/)**

[![Website](https://img.shields.io/badge/Website-multimian.com-6366f1?style=flat-square)](https://multimian.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mianhassam96-0077b5?style=flat-square)](https://www.linkedin.com/in/mianhassam96/)
[![GitHub](https://img.shields.io/badge/GitHub-Mianhassam96-333?style=flat-square)](https://github.com/Mianhassam96/)

---

<div align="center">
<sub>© 2026 MultiMian · Free forever · Made for truth-seekers</sub>
</div>
