# 🎨 MORPHĒ — Emotion to Art Engine

> *Type how you feel. Watch the world transform.*

MORPHĒ is a full-stack creative web application that converts raw human emotion (typed text) into living generative art, ambient sound frequencies, and dynamic color palettes — in real time.

---

## ✨ Features

| Layer | What it does |
|-------|-------------|
| **Generative Canvas** | Particle systems morph per emotion — rain, orbits, starfields, shatter, cosmic drift |
| **Emotion NLP Engine** | Node.js API analyzes text → detects dominant + secondary emotion, confidence score |
| **Binaural Audio** | Web Audio API generates layered harmonic tones tuned to emotional frequencies |
| **Color Psychology** | Emotion-mapped palettes — click any swatch to copy hex |
| **Frequency Visualizer** | Animated bars show the active sound waveform |
| **Session History** | Last 5 analyses accessible with one click |

---



## 🚀 Quick Start

### 1. Start the Node.js API Server
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:3001
```

### 2. Start the React Frontend
```bash
cd client
npm install
npm run dev
# Opens on http://localhost:3000
```

### 3. Use It
- Type anything in the left panel — stream of consciousness, keywords, sentences
- Press **MORPH** or ** Enter**
- Click **◎ SOUND** to enable ambient tones
- Click any color swatch to copy the hex code

---

## 🏗️ Architecture

```
morphe/
├── server/
│   ├── index.js          ← Express API (emotion analysis, quotes)
│   └── package.json
│
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                    ← Main application shell
        ├── index.css                  ← Global styles (Bebas Neue + Cormorant)
        ├── main.jsx
        ├── components/
        │   ├── MorphCanvas.jsx        ← Canvas particle system wrapper
        │   ├── ColorPalette.jsx       ← Animated color swatches
        │   └── FrequencyBar.jsx       ← Audio frequency visualizer
        ├── hooks/
        │   └── useAudio.js            ← Web Audio API binaural tone engine
        └── utils/
            └── particles.js           ← Generative particle system engine
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze text → emotion data |
| `GET`  | `/api/emotions` | List all emotion categories |
| `GET`  | `/api/health` | Server health check |

---

## 🛠️ Tech Stack

- **React 18** + Vite — Frontend framework
- **Node.js** + Express — Emotion analysis API
- **Canvas API** — Generative particle art engine
- **Web Audio API** — Real-time binaural tone synthesis
- **CSS Custom Properties** — Theme transitions (2s ease morph)
- **Fonts** — Bebas Neue (display) + Cormorant Garamond (body) + JetBrains Mono (code)

---
