// Particle system for each emotion type
export class ParticleSystem {
  constructor(canvas, emotion) {
    this.canvas    = canvas
    this.ctx       = canvas.getContext('2d')
    this.emotion   = emotion
    this.particles = []
    this.frame     = 0
    this.running   = false
    this.raf       = null

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    this.canvas.width  = this.canvas.offsetWidth  * window.devicePixelRatio
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    this.W = this.canvas.offsetWidth
    this.H = this.canvas.offsetHeight
  }

  setEmotion(emotion) {
    this.emotion = emotion
    this.particles = []
    this.frame = 0
    this.spawnBurst()
  }

  spawnBurst() {
    const count = this.getParticleCount()
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(i))
    }
  }

  getParticleCount() {
    const map = { burst: 120, rain: 80, shatter: 60, pulse: 40, float: 60, orbit: 50, cosmos: 150, drift: 50 }
    return map[this.emotion.particle] || 60
  }

  createParticle(i = 0) {
    const { W, H } = this
    const palette   = this.emotion.palette
    const color     = palette[Math.floor(Math.random() * palette.length)]
    const intensity = this.emotion.intensity

    const base = {
      color,
      alpha: 0,
      targetAlpha: 0.3 + Math.random() * 0.7 * intensity,
      size: 1 + Math.random() * 3,
      life: 0,
      maxLife: 200 + Math.random() * 400
    }

    switch (this.emotion.particle) {
      case 'burst':
        return { ...base, x: W / 2, y: H / 2, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, gravity: 0.05, size: 1 + Math.random() * 4 }
      case 'rain':
        return { ...base, x: Math.random() * W, y: -20, vx: -0.5 + Math.random() * 0.3, vy: 2 + Math.random() * 4, size: 0.5 + Math.random() * 1.5, maxLife: 300 }
      case 'shatter':
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 6
        return { ...base, x: W / 2 + (Math.random() - 0.5) * 200, y: H / 2 + (Math.random() - 0.5) * 200, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, rotation: Math.random() * Math.PI, rotSpeed: (Math.random() - 0.5) * 0.2, size: 2 + Math.random() * 8 }
      case 'pulse':
        return { ...base, x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, pulsePhase: Math.random() * Math.PI * 2, pulseSpeed: 0.02 + Math.random() * 0.04, size: 2 + Math.random() * 6 }
      case 'float':
        return { ...base, x: Math.random() * W, y: H + 20, vx: (Math.random() - 0.5) * 0.5, vy: -(0.3 + Math.random() * 1), waveAmp: 20 + Math.random() * 40, waveFreq: 0.01 + Math.random() * 0.02, wavePhase: Math.random() * Math.PI * 2, size: 2 + Math.random() * 5 }
      case 'orbit':
        const r = 50 + Math.random() * Math.min(W, H) * 0.35
        const a = (i / this.getParticleCount()) * Math.PI * 2
        return { ...base, cx: W / 2, cy: H / 2, radius: r, angle: a, speed: (0.002 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1), size: 1 + Math.random() * 3 }
      case 'cosmos':
        return { ...base, x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, twinklePhase: Math.random() * Math.PI * 2, twinkleSpeed: 0.01 + Math.random() * 0.03, size: 0.5 + Math.random() * 3, maxLife: 9999 }
      default:
        return { ...base, x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 }
    }
  }

  update() {
    const { W, H } = this
    this.frame++

    // Spawn new particles for continuous systems
    if (['rain', 'float', 'cosmos'].includes(this.emotion.particle) && this.particles.length < this.getParticleCount()) {
      this.particles.push(this.createParticle())
    }

    this.particles = this.particles.filter(p => {
      p.life++
      p.alpha = Math.min(p.alpha + 0.02, p.targetAlpha)

      if (p.life > p.maxLife * 0.8) {
        p.alpha *= 0.97
      }

      switch (this.emotion.particle) {
        case 'burst':
          p.x += p.vx; p.y += p.vy; p.vy += p.gravity
          p.vx *= 0.99; p.vy *= 0.99
          break
        case 'rain':
          p.x += p.vx; p.y += p.vy
          if (p.y > H + 20) return false
          break
        case 'shatter':
          p.x += p.vx; p.y += p.vy; p.vy += 0.1
          p.vx *= 0.97; p.vy *= 0.97
          p.rotation += p.rotSpeed
          break
        case 'pulse':
          p.pulsePhase += p.pulseSpeed
          p.currentSize = p.size * (1 + 0.5 * Math.sin(p.pulsePhase))
          p.alpha = p.targetAlpha * (0.5 + 0.5 * Math.sin(p.pulsePhase))
          break
        case 'float':
          p.wavePhase += p.waveFreq
          p.x += p.vx + Math.sin(p.wavePhase) * 0.5
          p.y += p.vy
          if (p.y < -20) return false
          break
        case 'orbit':
          p.angle += p.speed
          p.x = p.cx + Math.cos(p.angle) * p.radius
          p.y = p.cy + Math.sin(p.angle) * p.radius
          break
        case 'cosmos':
          p.twinklePhase += p.twinkleSpeed
          p.alpha = p.targetAlpha * (0.3 + 0.7 * Math.abs(Math.sin(p.twinklePhase)))
          p.life = 0 // immortal stars
          break
        default:
          p.x += p.vx; p.y += p.vy
          if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) { p.vx *= -1; p.vy *= -1 }
      }
      return p.life < p.maxLife && p.alpha > 0.001
    })
  }

  draw() {
    const ctx   = this.ctx
    const { W, H } = this

    // Fading trail
    ctx.fillStyle = this.emotion.bg + 'CC'
    ctx.fillRect(0, 0, W, H)

    this.particles.forEach(p => {
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha))
      ctx.fillStyle   = p.color
      ctx.strokeStyle = p.color

      switch (this.emotion.particle) {
        case 'shatter':
          ctx.translate(p.x, p.y)
          ctx.rotate(p.rotation || 0)
          ctx.beginPath()
          ctx.moveTo(0, -p.size)
          ctx.lineTo(p.size * 0.7, p.size * 0.7)
          ctx.lineTo(-p.size * 0.7, p.size * 0.7)
          ctx.closePath()
          ctx.fill()
          break
        case 'pulse':
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.currentSize || p.size, 0, Math.PI * 2)
          ctx.fill()
          // Glow ring
          ctx.globalAlpha = (p.currentSize || p.size) / p.size * 0.2
          ctx.beginPath()
          ctx.arc(p.x, p.y, (p.currentSize || p.size) * 2.5, 0, Math.PI * 2)
          ctx.lineWidth = 0.5
          ctx.stroke()
          break
        case 'orbit':
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          // Trailing glow
          ctx.globalAlpha *= 0.15
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'cosmos':
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          if (p.size > 1.5) {
            ctx.globalAlpha *= 0.3
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
            ctx.fill()
          }
          break
        default:
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
      }
      ctx.restore()
    })

    // Central glow for some emotions
    if (['joy', 'love', 'wonder'].includes(this.emotion.dominant)) {
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.4)
      grad.addColorStop(0, this.emotion.accent + '15')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    }
  }

  start() {
    this.running = true
    this.spawnBurst()
    const loop = () => {
      if (!this.running) return
      this.update()
      this.draw()
      this.raf = requestAnimationFrame(loop)
    }
    loop()
  }

  stop() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', () => this.resize())
  }
}
