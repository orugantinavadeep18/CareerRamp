// ── Web Audio API sound effects (no files needed) ──────────────────────────
let _ctx = null
const getCtx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  return _ctx
}

function tone(freq, type = 'sine', duration = 0.2, vol = 0.25, delay = 0) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  } catch { /* ignore — user hasn't interacted yet */ }
}

/** Pleasant 3-note arpeggio on login */
export function playLoginSound() {
  tone(523.25, 'sine', 0.18, 0.3, 0)      // C5
  tone(659.25, 'sine', 0.18, 0.28, 0.14)  // E5
  tone(783.99, 'sine', 0.28, 0.25, 0.28)  // G5
}

/** Victory chord fanfare after analysis */
export function playAnalysisSound() {
  tone(523.25, 'sine', 0.22, 0.25, 0)      // C5
  tone(659.25, 'sine', 0.22, 0.22, 0.10)  // E5
  tone(783.99, 'sine', 0.22, 0.20, 0.20)  // G5
  tone(1046.5, 'sine', 0.40, 0.18, 0.30)  // C6
}

/** Soft ping for notifications */
export function playNotificationSound() {
  tone(880, 'sine', 0.12, 0.2, 0)
  tone(1100, 'sine', 0.18, 0.15, 0.13)
}
