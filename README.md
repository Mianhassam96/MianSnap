# 🎬 MianSnap — Viral Thumbnail Intelligence Engine

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-mianhassam96.github.io/MianSnap-7c3aed?style=for-the-badge)](https://mianhassam96.github.io/MianSnap/)
[![GitHub Stars](https://img.shields.io/github/stars/Mianhassam96/MianSnap?style=for-the-badge&color=facc15)](https://github.com/Mianhassam96/MianSnap/stargazers)
[![License](https://img.shields.io/badge/License-MIT-4ade80?style=for-the-badge)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)

**Transform any video frame into a high-converting thumbnail in seconds.**  
100% browser-based · No uploads · No account · Free forever

[**→ Try it now**](https://mianhassam96.github.io/MianSnap/)

</div>

---

## ✨ What makes it different

| Feature | MianSnap | Other tools |
|---|---|---|
| Works in browser | ✅ | ❌ Requires upload |
| AI frame detection | ✅ Auto-picks best frames | ❌ Manual scrubbing |
| One-click Make Viral | ✅ Full auto-enhancement | ❌ Manual editing |
| Live viral score | ✅ Updates as you edit | ❌ No feedback |
| Privacy | ✅ Nothing leaves your device | ❌ Cloud processing |
| Price | ✅ Free forever | 💰 Subscription |

---

## 🚀 Core Features

### ⚡ Make Viral — One Click
Hit the **Make Viral** button and the engine automatically:
- Boosts contrast, saturation and brightness
- Applies face auto-focus (rule of thirds)
- Adds subject spotlight glow + vignette
- Enhances text readability with smart shadows

### 🧠 Smart Frame Detection
Upload any video → frames are analyzed automatically:
- Face presence detection
- Motion peak scoring
- Brightness clarity scoring
- Top frames marked ⭐ BEST — click to apply instantly

### 📊 Live Viral Score
Real-time 0–100 score updates as you edit:
- Text size check (mobile-friendly?)
- Contrast analysis
- Subject/face detection
- Composition scoring
- Actionable feedback: *"Text too small for mobile"*

### 🎨 Background System
- **AI Background Removal** (Transformers.js, runs in browser)
- **12 preset backgrounds** — Gaming, Drama, News, Neon Cyber, Sunset, Luxury...
- **Blur / Brightness / Contrast / Saturation** sliders
- **Vignette** toggle
- **Depth Effect** — glow + shadow for 3D feel

### 🎭 11 One-Click Templates
Dramatic Reaction · Gaming Highlight · Breaking News · Viral Pop · MrBeast Style · Sports Hype · Horror · Tutorial · Money · Clean Minimal · Sports

### 🔤 35 Premium Fonts
Impact · Bebas Neue · Anton · Bangers · Oswald · Montserrat · Poppins · Playfair Display · Cinzel + 10 Arabic/Urdu fonts

### 🗂 Layer System
- Photoshop-style layer panel
- Visibility toggle, lock, reorder (↑↓)
- Rename layers inline
- Delete individual layers

### ⌨️ Full Keyboard Shortcuts
`Ctrl+Z` Undo · `Ctrl+Y` Redo · `Ctrl+D` Duplicate · `Ctrl+C/V` Copy/Paste  
`Delete` Remove · `Arrow keys` Nudge · `Shift+Arrow` Nudge ×10 · `Ctrl+A` Select all  
`Ctrl+]` Bring forward · `Ctrl+[` Send back · `Ctrl+=/−` Zoom · `Ctrl+0` Fit

### 🔍 Canvas Zoom & Pan
- Mouse wheel zoom (Ctrl+scroll)
- Alt+drag to pan
- Zoom controls with percentage display
- Fit button to reset view

### 🧪 A/B Variation Generator
Generate 3 color variants instantly — Warm, Cool, High Contrast — for CTR testing

### 📱 Live Preview
See your thumbnail as it appears on YouTube desktop, mobile, and TikTok feed

### 💾 Auto-Save + Projects
- Auto-saves every 2 seconds to IndexedDB
- Full project history with restore
- No account needed

### 📐 Safe Zone Overlays
YouTube · TikTok · Instagram — never place content in blocked areas again

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite 5 |
| Canvas | Fabric.js 5 (CDN) |
| State | Zustand |
| AI | Transformers.js (@xenova) |
| Storage | IndexedDB |
| Fonts | Google Fonts (35+) |
| Deploy | GitHub Pages + Actions |

---

## 🚀 Getting Started

```bash
git clone https://github.com/Mianhassam96/MianSnap.git
cd MianSnap
npm install
npm run dev
```

Open [http://localhost:5173/MianSnap/](http://localhost:5173/MianSnap/)

### Build for production
```bash
npm run build
```

---

## 🎯 How to use

1. **Upload a video** — drag & drop into the timeline panel
2. **Smart Pick runs automatically** — best frames detected and highlighted ⭐
3. **Click a frame** — loads as canvas background instantly
4. **Hit ⚡ Make Viral** — one-click AI enhancement applied
5. **Check your score** — live 0–100 viral potential score
6. **Export** — 720p or 1080p, JPG or PNG

---

## 📁 Project Structure

```
src/
├── components/
│   ├── CanvasEditor.jsx      # Fabric.js canvas + zoom/pan
│   ├── LeftSidebar.jsx       # Text, Shapes, BG, Styles, Assets, Zones
│   ├── RightSidebar.jsx      # Layers, Properties, Score, Preview, Compare
│   ├── BottomPanel.jsx       # Video timeline + frame strip
│   ├── TopBar.jsx            # Export, Save, Undo/Redo, Projects
│   ├── BackgroundPanel.jsx   # BG remove/replace/effects
│   ├── ViralScore.jsx        # Live score dashboard
│   ├── MakeItViral.jsx       # One-click enhancement
│   ├── SmartStart.jsx        # Entry flow modal
│   └── ...
├── utils/
│   ├── makeItViral.js        # Auto-enhancement engine
│   ├── viralScore.js         # Score calculation
│   ├── frameSuggestions.js   # AI frame detection
│   ├── canvasHistory.js      # Undo/redo system
│   ├── keyboardShortcuts.js  # All keyboard bindings
│   └── ...
└── store/                    # Zustand state stores
```

---

## 🤝 Contributing

Contributions welcome! Open an issue or submit a pull request.

---

## 📌 Author

Built with ❤️ by **[MultiMian](https://multimian.com/)**

- 🌐 [multimian.com](https://multimian.com/)
- 💼 [LinkedIn](https://www.linkedin.com/in/mianhassam96/)
- 🐙 [GitHub](https://github.com/Mianhassam96/)

---

## ⭐ Support

If MianSnap saves you time, give it a ⭐ on GitHub and share it with creators!

---

<div align="center">
<sub>© 2026 MultiMian · Made with ❤️ for creators</sub>
</div>
