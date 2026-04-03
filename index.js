const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Emotion Engine ─────────────────────────────────────────────────────────
const EMOTION_MAP = {
  joy: {
    keywords: ["happy", "joy", "excited", "elated", "euphoric", "bliss", "wonderful", "amazing", "love", "great", "fantastic", "delighted", "cheerful", "ecstatic"],
    palette: ["#FFD166", "#FF9F1C", "#FFBF69", "#FF6B6B", "#FF8500"],
    accent: "#FF6B6B",
    bg: "#0A0500",
    particle: "burst",
    shape: "star",
    frequency: 528,
    waveform: "sine",
    intensity: 0.9,
    label: "Joy",
    description: "Radiant light fractures into golden shards"
  },
  sadness: {
    keywords: ["sad", "depressed", "melancholy", "lonely", "grief", "sorrow", "cry", "tears", "hopeless", "down", "blue", "miss", "lost", "empty", "hurt"],
    palette: ["#2D3561", "#4A5899", "#6B7FC4", "#8FA4D8", "#B4C5E4"],
    accent: "#6B7FC4",
    bg: "#010308",
    particle: "rain",
    shape: "drop",
    frequency: 174,
    waveform: "sine",
    intensity: 0.3,
    label: "Sadness",
    description: "Blue tides wash through the infinite deep"
  },
  anger: {
    keywords: ["angry", "rage", "furious", "hate", "frustrat", "mad", "pissed", "irritat", "livid", "explod", "violent", "aggressive", "resentful", "bitter"],
    palette: ["#FF0000", "#CC0000", "#FF4500", "#8B0000", "#FF6347"],
    accent: "#FF4500",
    bg: "#0D0000",
    particle: "shatter",
    shape: "shard",
    frequency: 396,
    waveform: "sawtooth",
    intensity: 1.0,
    label: "Anger",
    description: "Crimson fractures tear across the void"
  },
  fear: {
    keywords: ["scared", "fear", "anxious", "anxiety", "nervous", "worried", "panic", "terror", "dread", "afraid", "phobia", "stress", "overwhelm", "uncertain"],
    palette: ["#1A1A2E", "#16213E", "#533483", "#7209B7", "#A855F7"],
    accent: "#7209B7",
    bg: "#050005",
    particle: "pulse",
    shape: "web",
    frequency: 285,
    waveform: "triangle",
    intensity: 0.6,
    label: "Fear",
    description: "Purple tendrils creep through the dark"
  },
  calm: {
    keywords: ["calm", "peaceful", "serene", "relax", "tranquil", "meditat", "breathe", "still", "quiet", "gentle", "soft", "zen", "balance", "harmony", "rest"],
    palette: ["#06D6A0", "#1B998B", "#2EC4B6", "#CBEFB6", "#A8DADC"],
    accent: "#2EC4B6",
    bg: "#010808",
    particle: "float",
    shape: "wave",
    frequency: 432,
    waveform: "sine",
    intensity: 0.4,
    label: "Calm",
    description: "Teal ripples dissolve into infinite stillness"
  },
  love: {
    keywords: ["love", "romance", "affection", "tender", "cherish", "adore", "heart", "passion", "intimate", "warm", "hug", "kiss", "beloved", "devoted"],
    palette: ["#FF69B4", "#FF1493", "#C71585", "#FFB6C1", "#FF85A1"],
    accent: "#FF69B4",
    bg: "#080005",
    particle: "orbit",
    shape: "heart",
    frequency: 639,
    waveform: "sine",
    intensity: 0.75,
    label: "Love",
    description: "Rose petals spiral in the eternal dance"
  },
  wonder: {
    keywords: ["wonder", "awe", "amazed", "curious", "inspired", "magical", "mystical", "universe", "cosmos", "infinite", "dream", "surreal", "imagine", "discover"],
    palette: ["#E040FB", "#AB47BC", "#00E5FF", "#1DE9B6", "#F8BBD0"],
    accent: "#00E5FF",
    bg: "#010008",
    particle: "cosmos",
    shape: "constellation",
    frequency: 963,
    waveform: "sine",
    intensity: 0.65,
    label: "Wonder",
    description: "Cosmic dust births a galaxy of thought"
  },
  melancholy: {
    keywords: ["nostalgic", "bittersweet", "wistful", "longing", "remember", "past", "memory", "fading", "distant", "autumn", "twilight", "dusk", "faded", "forgotten"],
    palette: ["#B5838D", "#E5989B", "#FFB4A2", "#D4A5A5", "#9D8189"],
    accent: "#E5989B",
    bg: "#060203",
    particle: "drift",
    shape: "spiral",
    frequency: 256,
    waveform: "sine",
    intensity: 0.45,
    label: "Melancholy",
    description: "Rose-gold embers drift through amber dusk"
  },
  neutral: {
    keywords: [],
    palette: ["#E2E2E2", "#AAAAAA", "#666666", "#333333", "#111111"],
    accent: "#AAAAAA",
    bg: "#050505",
    particle: "drift",
    shape: "circle",
    frequency: 432,
    waveform: "sine",
    intensity: 0.5,
    label: "Neutral",
    description: "A quiet canvas awaits your emotion"
  }
};

function analyzeEmotion(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [emotion, data] of Object.entries(EMOTION_MAP)) {
    if (emotion === "neutral") continue;
    scores[emotion] = 0;
    for (const kw of data.keywords) {
      if (lower.includes(kw)) scores[emotion] += 1;
    }
  }

  // Sentence analysis for intensity
  const exclamations = (text.match(/!/g) || []).length;
  const caps = (text.match(/[A-Z]{2,}/g) || []).length;
  const intensityBoost = Math.min(0.3, (exclamations + caps) * 0.05);

  const top = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominant = top[0][1] > 0 ? top[0][0] : "neutral";
  const secondary = top[1] && top[1][1] > 0 ? top[1][0] : null;

  const emotionData = EMOTION_MAP[dominant];
  const blendRatio = secondary && top[1][1] > 0 ? Math.min(0.35, top[1][1] / (top[0][1] + top[1][1])) : 0;

  return {
    dominant,
    secondary,
    blendRatio,
    confidence: Math.min(1, top[0][1] / 3),
    intensity: Math.min(1, emotionData.intensity + intensityBoost),
    palette: emotionData.palette,
    accent: emotionData.accent,
    bg: emotionData.bg,
    particle: emotionData.particle,
    shape: emotionData.shape,
    frequency: emotionData.frequency,
    waveform: emotionData.waveform,
    label: emotionData.label,
    description: emotionData.description,
    wordCount: text.trim().split(/\s+/).length,
    timestamp: Date.now()
  };
}

// ── Quote Engine ──────────────────────────────────────────────────────────
const QUOTES = {
  joy: [
    "Joy is the simplest form of gratitude. — Karl Barth",
    "Find ecstasy in life; the mere sense of living is joy enough. — Emily Dickinson",
    "The present moment is filled with joy and happiness. — Thích Nhất Hạnh"
  ],
  sadness: [
    "The word 'happy' would lose its meaning if it were not balanced by sadness. — Carl Jung",
    "Tears are words the heart can't express. — Gerard Way",
    "Even a happy life cannot be without a measure of darkness. — Carl Jung"
  ],
  anger: [
    "Speak when you are angry and you will make the best speech you will ever regret. — Ambrose Bierce",
    "For every minute you remain angry, you give up sixty seconds of peace. — Emerson",
    "Anger is an acid that can do more harm to the vessel than anything it is poured on."
  ],
  fear: [
    "Everything you've ever wanted is on the other side of fear. — George Addair",
    "Fear is just excitement without breath. — Robert Heller",
    "You gain strength by every experience in which you really stop to look fear in the face. — Eleanor Roosevelt"
  ],
  calm: [
    "Within you, there is a stillness and a sanctuary. — Hermann Hesse",
    "Calm mind brings inner strength and self-confidence. — Dalai Lama",
    "Nothing can bring you peace but yourself. — Ralph Waldo Emerson"
  ],
  love: [
    "The best thing to hold onto in life is each other. — Audrey Hepburn",
    "Love is not something we give or get; it is something we nurture and grow. — Brené Brown",
    "Where there is love there is life. — Mahatma Gandhi"
  ],
  wonder: [
    "Wonder is the beginning of wisdom. — Socrates",
    "The most beautiful thing we can experience is the mysterious. — Albert Einstein",
    "To be surprised, to wonder, is to begin to understand. — José Ortega y Gasset"
  ],
  melancholy: [
    "The capacity for sorrow is essential to the fullness of life. — Rollo May",
    "Nostalgia is a dirty liar that insists things were better than they seemed. — Michelle K.",
    "There is a melancholy that stems from greatness. — Napoleon Bonaparte"
  ],
  neutral: [
    "The blank canvas is possibility. — Unknown",
    "In stillness, the world is restored. — Lao Tzu",
    "Between stimulus and response there is a space. — Viktor Frankl"
  ]
};

// ── Routes ────────────────────────────────────────────────────────────────
app.post("/api/analyze", (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 2) {
    return res.status(400).json({ error: "Please provide some text to analyze." });
  }

  const result = analyzeEmotion(text);
  const quotes = QUOTES[result.dominant] || QUOTES.neutral;
  result.quote = quotes[Math.floor(Math.random() * quotes.length)];

  res.json(result);
});

app.get("/api/emotions", (req, res) => {
  const list = Object.entries(EMOTION_MAP).map(([key, val]) => ({
    key,
    label: val.label,
    accent: val.accent,
    description: val.description
  }));
  res.json(list);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "alive", service: "MORPHE Emotion Engine", uptime: process.uptime() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  🎨 MORPHE Server running on http://localhost:${PORT}\n`);
});
