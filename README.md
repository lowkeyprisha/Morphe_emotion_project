🎨 MORPHĒ — Emotion to Art Engine

Type how you feel. Watch the world transform.

MORPHĒ is a full-stack creative web application that converts raw human emotion (typed text) into living generative art, ambient sound frequencies, and dynamic color palettes — in real time.

✨ Features
LayerWhat it doesGenerative CanvasParticle systems morph per emotion — rain, orbits, starfields, shatter, cosmic driftEmotion NLP EngineNode.js API analyzes text → detects dominant + secondary emotion, confidence scoreBinaural AudioWeb Audio API generates layered harmonic tones tuned to emotional frequenciesColor PsychologyEmotion-mapped palettes — click any swatch to copy hexFrequency VisualizerAnimated bars show the active sound waveformSession HistoryLast 5 analyses accessible with one click

🧠 Emotion → Art Map
EmotionPaletteParticleFrequencyWaveformJoyGold / CoralBurst528 HzSineSadnessIndigo / PeriwinkleRain174 HzSineAngerRed / CrimsonShatter396 HzSawtoothFearDeep PurplePulse285 HzTriangleCalmTeal / SeafoamFloat432 HzSineLoveRose / PinkOrbit639 HzSineWonderCyan / MagentaCosmos963 HzSineMelancholyDusty RoseDrift256 HzSine

🚀 Quick Start
1. Start the Node.js API Server
bashcd server
npm install
npm run dev
# Runs on http://localhost:3001
2. Start the React Frontend
bashcd client
npm install
npm run dev
# Opens on http://localhost:3000
3. Use It

Type anything in the left panel — stream of consciousness, keywords, sentences
Press MORPH or ⌘ + Enter
Click ◎ SOUND to enable ambient tones
Click any color swatch to copy the hex code


🏗️ Architecture
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

📡 API Endpoints
MethodEndpointDescriptionPOST/api/analyzeAnalyze text → emotion dataGET/api/emotionsList all emotion categoriesGET/api/healthServer health check
MethodEndpointDescriptionPOST/api/analyzeAnalyze text → emotion dataGET/api/emotionsList all emotion categoriesGET/api/healthServer health check
