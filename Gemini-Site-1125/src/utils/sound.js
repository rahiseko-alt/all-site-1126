const STORAGE_KEY = 'sound-enabled'
const MAX_SEMITONES = 24
const MAX_ECHO = 1
const ECHO_STEP = 0.08
export const ECHO_DECAY = 0.45

const INSTRUMENTS = [
  'synth',
  'piano',
  'drums',
  'guitar',
  'organ',
  'trumpet',
  'violin',
  'flute',
  'bass',
  'marimba'
]

class SoundEngine {
  constructor() {
    this.enabled = true
    this.ctx = null
    this.noise = null
    this.output = null
    this.delay = null
    this.wet = null
    this.semitones = 0
    this.echo = 0
    this.instrument = 0
    this.lastChar = 'a'
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) !== '0'
    } catch {}
  }

  setEnabled(enabled) {
    this.enabled = enabled
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
    } catch {}
    if (enabled) {
      this.blip({ pitch: 1.6 })
    }
  }

  ensureContext() {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null
      this.ctx = new AudioCtx()
      const len = this.ctx.sampleRate * 0.2
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const data = this.noise.getChannelData(0)
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1
      }
      this.output = this.ctx.createGain()
      this.delay = this.ctx.createDelay(MAX_ECHO)
      this.delay.delayTime.value = this.echo
      const feedback = this.ctx.createGain()
      feedback.gain.value = ECHO_DECAY
      this.wet = this.ctx.createGain()
      this.wet.gain.value = this.echo > 0 ? 0.5 : 0
      this.output.connect(this.ctx.destination)
      this.output.connect(this.delay)
      this.delay.connect(feedback).connect(this.delay)
      this.delay.connect(this.wet).connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  get pitch() {
    return 2 ** (this.semitones / 12)
  }

  get tone() {
    return this.semitones / MAX_SEMITONES
  }

  shiftPitch(dir) {
    this.semitones = Math.max(-24, Math.min(MAX_SEMITONES, this.semitones + dir * 2))
    this.key(this.lastChar)
  }

  shiftEcho(dir) {
    const next = this.echo + dir * ECHO_STEP
    this.echo = next < ECHO_STEP / 2 ? 0 : Math.min(MAX_ECHO, next)
    const ctx = this.ensureContext()
    if (ctx) {
      const now = ctx.currentTime
      this.delay.delayTime.setTargetAtTime(Math.max(this.echo, 0.001), now, 0.05)
      this.wet.gain.setTargetAtTime(this.echo > 0 ? 0.5 : 0, now, 0.05)
    }
    this.key(this.lastChar)
  }

  click({ pitch = 1, volume = 0.18, decay = 0.05 } = {}) {
    if (!this.enabled) return
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800 * pitch * this.pitch * (0.9 + Math.random() * 0.2)
    filter.Q.value = 4
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
    src.connect(filter).connect(gain).connect(this.output)
    src.start(now)
    src.stop(now + decay + 0.02)
  }

  blip({ pitch = 1, volume = 0.06, decay = 0.12 } = {}) {
    if (!this.enabled) return
    const ctx = this.ensureContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520 * pitch * this.pitch, now)
    osc.frequency.exponentialRampToValueAtTime(380 * pitch * this.pitch, now + decay)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
    osc.connect(gain).connect(this.output)
    osc.start(now)
    osc.stop(now + decay + 0.02)
  }

  setInstrument(key) {
    const idx = (Number(key) + 9) % 10
    if (INSTRUMENTS[idx]) {
      this.instrument = idx
      this.key(this.lastChar)
    }
  }

  get instrumentName() {
    return INSTRUMENTS[this.instrument]
  }

  key(char = '') {
    if (!this.enabled) return
    const ctx = this.ensureContext()
    if (!ctx) return
    this.lastChar = char
    const scale = [0, 2, 3, 5, 7, 8, 10]
    const lower = char.toLowerCase()
    let noteIdx
    if (lower >= 'a' && lower <= 'z') {
      noteIdx = lower.charCodeAt(0) - 97
    } else if (lower >= '0' && lower <= '9') {
      noteIdx = 26 + Number(lower)
    } else {
      noteIdx = Math.floor(Math.random() * 26)
    }
    const freq = 110 * 2 ** ((scale[noteIdx % 7] + 12 * Math.floor(noteIdx / 7)) / 12) * this.pitch
    this[this.instrumentName](ctx, freq, ctx.currentTime, noteIdx)
  }

  envelope(ctx, now, { peak, attack = 0.01, end }) {
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + end)
    return gain
  }

  lfo(ctx, now, { rate, depth, delay = 0, end, targets }) {
    const osc = ctx.createOscillator()
    osc.frequency.value = rate
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(depth, now + delay + 0.1)
    osc.connect(gain)
    targets.forEach(t => gain.connect(t))
    osc.start(now)
    osc.stop(now + end)
  }

  oscillator(ctx, now, { type = 'sine', frequency, detune = 0, end, into }) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, now)
    osc.detune.setValueAtTime(detune, now)
    osc.connect(into)
    osc.start(now)
    osc.stop(now + end + 0.05)
    return osc
  }

  noiseBurst(ctx, now, { type, frequency, Q = 1, volume, decay }) {
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = frequency
    filter.Q.value = Q
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
    src.connect(filter).connect(gain).connect(this.output)
    src.start(now)
    src.stop(now + decay + 0.02)
  }

  synth(ctx, freq, now) {
    const end = 0.45
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 8
    filter.frequency.setValueAtTime(freq * 2, now)
    filter.frequency.exponentialRampToValueAtTime(freq * 12, now + 0.03)
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + end)
    const env = this.envelope(ctx, now, { peak: 0.07, end })
    filter.connect(env).connect(this.output)
    this.oscillator(ctx, now, { type: 'sawtooth', frequency: freq, detune: -7, end, into: filter })
    this.oscillator(ctx, now, { type: 'square', frequency: freq, detune: 7, end, into: filter })
  }

  piano(ctx, freq, now) {
    const end = 1.6
    ;[1, 2, 3, 4].forEach((mult, idx) => {
      const env = this.envelope(ctx, now, {
        peak: 0.09 / mult ** 1.4,
        attack: 0.004,
        end: end / (1 + idx * 0.7)
      })
      env.connect(this.output)
      this.oscillator(ctx, now, {
        type: idx ? 'sine' : 'triangle',
        frequency: freq * mult,
        detune: idx * 1.5,
        end,
        into: env
      })
    })
    this.noiseBurst(ctx, now, {
      type: 'lowpass',
      frequency: freq * 4,
      volume: 0.03,
      decay: 0.03
    })
  }

  drums(ctx, freq, now, noteIdx) {
    const kind = noteIdx % 4
    if (kind === 0) {
      const env = this.envelope(ctx, now, { peak: 0.35, attack: 0.002, end: 0.4 })
      env.connect(this.output)
      this.oscillator(ctx, now, { frequency: 150, end: 0.4, into: env }).frequency.exponentialRampToValueAtTime(
        42,
        now + 0.15
      )
    } else if (kind === 1) {
      this.noiseBurst(ctx, now, { type: 'highpass', frequency: 1500, volume: 0.22, decay: 0.18 })
      const env = this.envelope(ctx, now, { peak: 0.12, attack: 0.002, end: 0.1 })
      env.connect(this.output)
      this.oscillator(ctx, now, { type: 'triangle', frequency: 190, end: 0.1, into: env })
    } else if (kind === 2) {
      this.noiseBurst(ctx, now, { type: 'highpass', frequency: 7000, volume: 0.12, decay: 0.05 })
    } else {
      const base = 80 + (freq % 160)
      const env = this.envelope(ctx, now, { peak: 0.25, attack: 0.002, end: 0.35 })
      env.connect(this.output)
      this.oscillator(ctx, now, {
        frequency: base * 1.6,
        end: 0.35,
        into: env
      }).frequency.exponentialRampToValueAtTime(base, now + 0.08)
    }
  }

  guitar(ctx, freq, now) {
    const end = 1.8
    const sr = ctx.sampleRate
    const buffer = ctx.createBuffer(1, Math.floor(sr * end), sr)
    const out = buffer.getChannelData(0)
    const period = Math.max(2, Math.round(sr / freq))
    const ring = new Float32Array(period).map(() => Math.random() * 2 - 1)
    for (let i = 0; i < out.length; i++) {
      const idx = i % period
      const next = ring[(idx + 1) % period]
      out[i] = ring[idx]
      ring[idx] = (ring[idx] + next) * 0.497
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 5000
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.setTargetAtTime(0.0001, now + end - 0.3, 0.08)
    src.connect(filter).connect(gain).connect(this.output)
    src.start(now)
  }

  organ(ctx, freq, now) {
    const end = 0.7
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.015)
    gain.gain.setValueAtTime(0.06, now + end - 0.12)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + end)
    gain.connect(this.output)
    const oscs = [0.5, 1, 1.5, 2, 3, 4].map((mult, idx) =>
      this.oscillator(ctx, now, {
        frequency: freq * mult,
        end,
        into: this.level(ctx, [0.6, 1, 0.5, 0.7, 0.35, 0.3][idx], gain)
      })
    )
    this.lfo(ctx, now, {
      rate: 6.5,
      depth: 6,
      end,
      targets: oscs.map(o => o.detune)
    })
  }

  trumpet(ctx, freq, now) {
    const end = 0.65
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 2
    filter.frequency.setValueAtTime(freq * 1.2, now)
    filter.frequency.exponentialRampToValueAtTime(freq * 7, now + 0.07)
    filter.frequency.exponentialRampToValueAtTime(freq * 3, now + end)
    const env = this.envelope(ctx, now, { peak: 0.06, attack: 0.04, end })
    filter.connect(env).connect(this.output)
    const osc = this.oscillator(ctx, now, {
      type: 'sawtooth',
      frequency: freq * 2,
      detune: -60,
      end,
      into: filter
    })
    osc.detune.linearRampToValueAtTime(0, now + 0.06)
    this.lfo(ctx, now, { rate: 5.5, depth: 12, delay: 0.15, end, targets: [osc.detune] })
  }

  violin(ctx, freq, now) {
    const end = 1.1
    const peak = ctx.createBiquadFilter()
    peak.type = 'peaking'
    peak.frequency.value = 2800
    peak.Q.value = 1.5
    peak.gain.value = 6
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = Math.min(freq * 2 * 8, 9000)
    const env = this.envelope(ctx, now, { peak: 0.045, attack: 0.18, end })
    lp.connect(peak).connect(env).connect(this.output)
    const oscs = [-5, 5].map(detune =>
      this.oscillator(ctx, now, {
        type: 'sawtooth',
        frequency: freq * 2,
        detune,
        end,
        into: lp
      })
    )
    this.lfo(ctx, now, { rate: 5.8, depth: 18, delay: 0.25, end, targets: oscs.map(o => o.detune) })
  }

  flute(ctx, freq, now) {
    const end = 0.8
    const f = freq * 4
    const env = this.envelope(ctx, now, { peak: 0.07, attack: 0.06, end })
    env.connect(this.output)
    const osc = this.oscillator(ctx, now, { frequency: f, end, into: env })
    this.oscillator(ctx, now, {
      type: 'triangle',
      frequency: f,
      end,
      into: this.level(ctx, 0.25, env)
    })
    this.lfo(ctx, now, { rate: 5, depth: 10, delay: 0.2, end, targets: [osc.detune] })
    this.noiseBurst(ctx, now, {
      type: 'bandpass',
      frequency: f,
      Q: 3,
      volume: 0.025,
      decay: end * 0.6
    })
  }

  bass(ctx, freq, now) {
    const end = 0.6
    const f = freq / 2
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 4
    filter.frequency.setValueAtTime(f * 10, now)
    filter.frequency.exponentialRampToValueAtTime(f * 2, now + 0.15)
    const env = this.envelope(ctx, now, { peak: 0.16, attack: 0.005, end })
    filter.connect(env).connect(this.output)
    this.oscillator(ctx, now, { type: 'sawtooth', frequency: f, end, into: filter })
    this.oscillator(ctx, now, { frequency: f, end, into: filter })
  }

  marimba(ctx, freq, now) {
    const f = freq * 2
    ;[
      [1, 0.12, 0.7],
      [4, 0.03, 0.12],
      [9.9, 0.012, 0.05]
    ].forEach(([mult, peak, end]) => {
      const env = this.envelope(ctx, now, { peak, attack: 0.003, end })
      env.connect(this.output)
      this.oscillator(ctx, now, { frequency: f * mult, end, into: env })
    })
  }

  level(ctx, gainVal, dest) {
    const g = ctx.createGain()
    g.gain.value = gainVal
    g.connect(dest)
    return g
  }

  hover() {
    this.blip({ pitch: 1 + Math.random() * 0.3, volume: 0.035, decay: 0.08 })
  }

  whoosh() {
    this.click({ pitch: 0.35, volume: 0.22, decay: 0.35 })
  }

  chime() {
    this.blip({ pitch: 1.5, volume: 0.07, decay: 0.18 })
    setTimeout(() => this.blip({ pitch: 2, volume: 0.06, decay: 0.25 }), 90)
  }
}

export const sound = new SoundEngine()
