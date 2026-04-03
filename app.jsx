import { useState, useRef, useEffect, useCallback } from 'react'
import MorphCanvas   from './components/MorphCanvas'
import ColorPalette  from './components/ColorPalette'
import FrequencyBar  from './components/FrequencyBar'
import { useAudio }  from './hooks/useAudio'

const DEFAULT_EMOTION = {
  dominant: 'neutral', palette: ['#222','#444','#666','#888','#aaa'],
  accent: '#888', bg: '#050505', particle: 'drift', shape: 'circle',
  frequency: 432, waveform: 'sine', intensity: 0.4,
  label: 'Neutral', description: 'A quiet canvas awaits your emotion',
  quote: 'In stillness, the world is restored. — Lao Tzu'
}

export default function App() {
  const [text,       setText]       = useState('')
  const [emotion,    setEmotion]    = useState(DEFAULT_EMOTION)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [audioOn,    setAudioOn]    = useState(false)
  const [history,    setHistory]    = useState([])
  const [showInfo,   setShowInfo]   = useState(false)
  const [analyzed,   setAnalyzed]   = useState(false)
  const [charCount,  setCharCount]  = useState(0)
  const textRef     = useRef(null)
  const { play, stop, setVolume } = useAudio()

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') analyze()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [text])

  const analyze = useCallback(async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)

    try {
      const res  = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()

      setEmotion(data)
      setAnalyzed(true)
      setHistory(h => [{ text: text.slice(0, 60) + (text.length > 60 ? '…' : ''), emotion: data, time: new Date() }, ...h].slice(0, 5))

      if (audioOn) play(data.frequency, data.waveform, data.intensity)

    } catch (err) {
      // Offline fallback — analyse locally
      setError('Server offline — using local analysis')
      const local = localAnalyze(text)
      setEmotion(local)
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }, [text, loading, audioOn, play])

  const toggleAudio = () => {
    if (audioOn) { stop(); setAudioOn(false) }
    else {
      setAudioOn(true)
      if (analyzed) play(emotion.frequency, emotion.waveform, emotion.intensity)
    }
  }

  const clear = () => {
    setText('')
    setCharCount(0)
    setAnalyzed(false)
    setEmotion(DEFAULT_EMOTION)
    stop()
    setAudioOn(false)
    textRef.current?.focus()
  }

  const accentRgb = hexToRgb(emotion.accent)

  return (
    <div style={{
      minHeight:       '100vh',
      background:      emotion.bg,
      transition:      'background 2s cubic-bezier(0.16,1,0.3,1)',
      display:         'flex',
      flexDirection:   'column',
      position:        'relative',
      overflow:        'hidden',
    }}>
      {/* Canvas background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <MorphCanvas emotion={emotion} isActive={analyzed} />
      </div>

      {/* Accent glow */}
      <div style={{
        position:   'fixed',
        bottom:     '-20%',
        left:       '50%',
        transform:  'translateX(-50%)',
        width:      '60vw',
        height:     '40vh',
        background: `radial-gradient(ellipse, ${emotion.accent}22 0%, transparent 70%)`,
        transition: 'background 2s ease',
        pointerEvents: 'none',
        zIndex:     1,
      }} />

      {/* ── HEADER ───────────────────────────────────────────── */}
      <header style={{
        position:       'relative',
        zIndex:         10,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '24px 40px',
        borderBottom:   '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
      }}>
        <div>
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      'clamp(2rem, 4vw, 3rem)',
            letterSpacing: '0.15em',
            color:         emotion.accent,
            transition:    'color 2s ease',
            lineHeight:    1,
          }}>
            MORPHĒ
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.2em', marginTop: '4px' }}>
            EMOTION → ART ENGINE
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Audio toggle */}
          <button onClick={toggleAudio} style={iconBtnStyle(audioOn, emotion.accent)} title={audioOn ? 'Mute' : 'Enable sound'}>
            {audioOn ? '◉' : '◎'}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', marginLeft: '6px' }}>
              {audioOn ? `${emotion.frequency}Hz` : 'SOUND'}
            </span>
          </button>

          {/* Info */}
          <button onClick={() => setShowInfo(v => !v)} style={iconBtnStyle(showInfo, emotion.accent)}>
            {showInfo ? '×' : 'i'}
          </button>
        </div>
      </header>

      {/* ── INFO PANEL ───────────────────────────────────────── */}
      {showInfo && (
        <div style={{
          position:    'fixed',
          top:         '90px',
          right:       '40px',
          width:       '280px',
          background:  'rgba(5,5,5,0.92)',
          border:      `1px solid ${emotion.accent}40`,
          borderRadius: '12px',
          padding:     '24px',
          zIndex:      100,
          backdropFilter: 'blur(20px)',
          animation:   'fadeUp 0.3s ease',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '16px', letterSpacing: '0.15em' }}>
            HOW IT WORKS
          </p>
          {[
            ['Type', 'Write freely how you feel — prose, keywords, anything'],
            ['Analyze', 'NLP engine detects dominant emotion & confidence'],
            ['Art', 'Generative particle system morphs to your emotion'],
            ['Sound', 'Binaural tones tuned to your emotional frequency'],
            ['Palette', 'Color system derived from emotion psychology'],
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: emotion.accent }}>{k} </span>
              <span style={{ fontSize: '14px', color: 'rgba(240,237,232,0.6)', fontFamily: 'var(--font-body)' }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>
              ⌘ + ENTER to analyze · Click swatches to copy hex
            </p>
          </div>
        </div>
      )}

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <main style={{
        flex:           1,
        position:       'relative',
        zIndex:         10,
        display:        'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:            0,
        padding:        '0',
        minHeight:      'calc(100vh - 90px)',
      }}>

        {/* LEFT — Input */}
        <div style={{
          padding:         'clamp(32px, 5vw, 64px)',
          display:         'flex',
          flexDirection:   'column',
          justifyContent:  'center',
          borderRight:     '1px solid rgba(255,255,255,0.05)',
          backdropFilter:  'blur(4px)',
        }}>
          <label style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            letterSpacing: '0.25em',
            color:         'var(--muted)',
            marginBottom:  '16px',
            display:       'block',
          }}>
            SPEAK YOUR TRUTH
          </label>

          <textarea
            ref={textRef}
            value={text}
            onChange={e => { setText(e.target.value); setCharCount(e.target.value.length) }}
            placeholder="I feel like the world is spinning faster than I can hold on..."
            maxLength={500}
            rows={6}
            style={{
              width:        '100%',
              background:   'transparent',
              border:       'none',
              borderBottom: `1px solid ${analyzed ? emotion.accent + '80' : 'rgba(255,255,255,0.1)'}`,
              color:        'var(--ink)',
              fontFamily:   'var(--font-body)',
              fontStyle:    'italic',
              fontSize:     'clamp(18px, 2.5vw, 24px)',
              lineHeight:   1.5,
              padding:      '16px 0',
              resize:       'none',
              transition:   'border-color 1.5s ease',
              caretColor:   emotion.accent,
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
              {charCount}/500
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              {analyzed && (
                <button onClick={clear} style={{
                  background: 'transparent',
                  border:     '1px solid rgba(255,255,255,0.1)',
                  color:      'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize:   '10px',
                  letterSpacing: '0.15em',
                  padding:    '10px 20px',
                  borderRadius: '40px',
                  cursor:     'pointer',
                  transition: 'all 0.3s ease',
                }}>
                  CLEAR
                </button>
              )}
              <button
                onClick={analyze}
                disabled={!text.trim() || loading}
                style={{
                  background:    loading ? 'transparent' : emotion.accent,
                  border:        `1px solid ${emotion.accent}`,
                  color:         loading ? emotion.accent : '#000',
                  fontFamily:    'var(--font-display)',
                  fontSize:      '16px',
                  letterSpacing: '0.2em',
                  padding:       '10px 32px',
                  borderRadius:  '40px',
                  cursor:        text.trim() && !loading ? 'pointer' : 'not-allowed',
                  opacity:       text.trim() ? 1 : 0.4,
                  transition:    'all 1s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {loading ? '◌' : 'MORPH'}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#ff6b6b', marginTop: '12px' }}>
              {error}
            </p>
          )}

          {/* History */}
          {history.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '12px' }}>
                RECENT
              </p>
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => { setText(h.text.replace('…', '')); setEmotion(h.emotion); setAnalyzed(true) }}
                  style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '10px',
                    padding:    '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    cursor:     'pointer',
                    opacity:    1 - i * 0.15,
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: h.emotion.accent, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: h.emotion.accent }}>
                    {h.emotion.label.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Output */}
        <div style={{
          padding:       'clamp(32px, 5vw, 64px)',
          display:       'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          {/* Emotion label */}
          <div style={{ marginBottom: '40px', animation: analyzed ? 'fadeUp 0.6s ease' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '8px' }}>
              <h2 style={{
                fontFamily:    'var(--font-display)',
                fontSize:      'clamp(3rem, 7vw, 6rem)',
                color:         emotion.accent,
                transition:    'color 2s ease',
                letterSpacing: '0.05em',
                lineHeight:    1,
              }}>
                {emotion.label?.toUpperCase()}
              </h2>
              {analyzed && emotion.confidence > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
                  {Math.round(emotion.confidence * 100)}% conf.
                </span>
              )}
            </div>
            <p style={{
              fontFamily:  'var(--font-body)',
              fontStyle:   'italic',
              fontSize:    'clamp(15px, 2vw, 18px)',
              color:       'rgba(240,237,232,0.5)',
              transition:  'opacity 1s ease',
              maxWidth:    '400px',
              lineHeight:  1.5,
            }}>
              {emotion.description}
            </p>
          </div>

          {/* Color palette */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '12px' }}>
              EMOTIONAL PALETTE
            </p>
            <ColorPalette palette={emotion.palette} accent={emotion.accent} />
          </div>

          {/* Audio info */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em', marginBottom: '12px' }}>
              RESONANCE FREQUENCY
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <FrequencyBar
                frequency={emotion.frequency}
                waveform={emotion.waveform}
                isPlaying={audioOn}
                accent={emotion.accent}
              />
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: emotion.accent, letterSpacing: '0.05em', transition: 'color 2s ease', lineHeight: 1 }}>
                  {emotion.frequency}Hz
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)' }}>
                  {emotion.waveform?.toUpperCase()} WAVE
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          {analyzed && (
            <div style={{
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 '1px',
              background:          'rgba(255,255,255,0.05)',
              borderRadius:        '8px',
              overflow:            'hidden',
              marginBottom:        '32px',
              animation:           'fadeUp 0.8s ease',
            }}>
              {[
                ['PARTICLE', emotion.particle?.toUpperCase()],
                ['SHAPE',    emotion.shape?.toUpperCase()],
                ['INTENSITY', `${Math.round((emotion.intensity || 0) * 100)}%`],
                ['WORDS',    emotion.wordCount],
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '16px', background: 'rgba(5,5,5,0.8)' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: emotion.accent, letterSpacing: '0.05em', transition: 'color 2s ease' }}>{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Quote */}
          {emotion.quote && analyzed && (
            <blockquote style={{
              borderLeft:  `2px solid ${emotion.accent}60`,
              paddingLeft: '20px',
              animation:   'fadeUp 1s ease',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '15px', color: 'rgba(240,237,232,0.45)', lineHeight: 1.6 }}>
                "{emotion.quote}"
              </p>
            </blockquote>
          )}
        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{
        position:       'relative',
        zIndex:         10,
        padding:        '16px 40px',
        borderTop:      '1px solid rgba(255,255,255,0.04)',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
          REACT + NODE.JS + WEB AUDIO API + CANVAS
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.15em' }}>
          ⌘ + ENTER TO ANALYZE
        </span>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        textarea::placeholder { color: rgba(240,237,232,0.18); }
        textarea:focus { outline: none; }
        button:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────
function iconBtnStyle(active, accent) {
  return {
    background:    active ? accent + '20' : 'transparent',
    border:        `1px solid ${active ? accent : 'rgba(255,255,255,0.1)'}`,
    color:         active ? accent : 'var(--muted)',
    fontFamily:    'var(--font-mono)',
    fontSize:      '13px',
    padding:       '8px 14px',
    borderRadius:  '40px',
    cursor:        'pointer',
    display:       'flex',
    alignItems:    'center',
    transition:    'all 0.4s ease',
  }
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '255,255,255'
}

function localAnalyze(text) {
  const lower = text.toLowerCase()
  const QUICK = [
    [['happy','joy','excit','love','great','wonderful'],'joy','#FFD166','#0A0500',528],
    [['sad','depress','lonely','cry','hurt','hopeless'],'sadness','#6B7FC4','#010308',174],
    [['angry','rage','furious','hate','mad'],'anger','#FF4500','#0D0000',396],
    [['scar','anxious','nervous','worried','panic'],'fear','#7209B7','#050005',285],
    [['calm','peace','serene','relax','tranquil'],'calm','#2EC4B6','#010808',432],
    [['wonder','awe','amaz','curious','cosmic'],'wonder','#00E5FF','#010008',963],
    [['nostalgic','bittersweet','wistful','memory'],'melancholy','#E5989B','#060203',256],
  ]
  for (const [kws, label, accent, bg, freq] of QUICK) {
    if (kws.some(k => lower.includes(k))) {
      return { dominant: label.toLowerCase(), label, accent, bg, palette: [accent], frequency: freq, waveform: 'sine', intensity: 0.6, particle: 'float', shape: 'circle', description: `${label} detected`, quote: 'Feel it fully. — Unknown', confidence: 0.7, wordCount: text.split(' ').length }
    }
  }
  return { ...DEFAULT_EMOTION, wordCount: text.split(' ').length }
}

const DEFAULT_EMOTION = {
  dominant: 'neutral', palette: ['#222','#444','#666','#888','#aaa'],
  accent: '#888', bg: '#050505', particle: 'drift', shape: 'circle',
  frequency: 432, waveform: 'sine', intensity: 0.4,
  label: 'Neutral', description: 'A quiet canvas awaits your emotion',
  quote: 'In stillness, the world is restored. — Lao Tzu', confidence: 0, wordCount: 0
}
