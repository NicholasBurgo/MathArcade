// js/06-sound.js · sound
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- sound ----------
let ac = null
function audio() {
  if (state.muted) return null
  try {
    ac ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ac.state === 'suspended') ac.resume()
    return ac
  } catch { return null }
}
function tone(freq, at, dur, type = 'triangle', gain = 0.16) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + at
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}
const semis = (base, n) => base * Math.pow(2, n / 12)
const sfx = {
  right(combo) {
    const base = semis(523.25, Math.min(combo, 12))
    tone(base, 0, 0.14)
    tone(semis(base, 7), 0.07, 0.22)
  },
  wrong() {
    tone(150, 0, 0.22, 'square', 0.07)
    tone(110, 0.09, 0.28, 'square', 0.06)
  },
  clear() { [0, 4, 7, 12, 16].forEach((n, i) => tone(semis(523.25, n), i * 0.09, 0.3)) },
}
