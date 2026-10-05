// js/07-confetti.js · confetti
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- confetti ----------
const fx = document.getElementById('fx')
const ctx = fx.getContext('2d')
let bits = []
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
function burst(n = 120) {
  if (reduced()) return
  const cs = getComputedStyle(document.documentElement)
  const colors = ['--gold', '--rule', '--green', '--red', '--graphite'].map(v => cs.getPropertyValue(v).trim())
  const w = (fx.width = innerWidth * devicePixelRatio)
  fx.height = innerHeight * devicePixelRatio
  for (let i = 0; i < n; i++) {
    bits.push({
      x: w / 2 + (Math.random() - 0.5) * w * 0.3,
      y: fx.height * 0.35,
      vx: (Math.random() - 0.5) * 16 * devicePixelRatio,
      vy: (-6 - Math.random() * 12) * devicePixelRatio,
      r: (4 + Math.random() * 5) * devicePixelRatio,
      c: colors[i % colors.length],
      spin: Math.random() * 6,
      life: 0,
    })
  }
  if (bits.length === n) requestAnimationFrame(tick)
}
function tick() {
  ctx.clearRect(0, 0, fx.width, fx.height)
  bits = bits.filter(b => b.life < 160 && b.y < fx.height + 40)
  for (const b of bits) {
    b.life++
    b.vy += 0.35 * devicePixelRatio
    b.vx *= 0.99
    b.x += b.vx
    b.y += b.vy
    ctx.save()
    ctx.translate(b.x, b.y)
    ctx.rotate(b.spin + b.life * 0.1)
    ctx.fillStyle = b.c
    ctx.beginPath()
    ctx.ellipse(0, 0, b.r, b.r * 1.35, 0, 0, Math.PI * 2) // little filled-in bubbles
    ctx.fill()
    ctx.restore()
  }
  if (bits.length) requestAnimationFrame(tick)
  else ctx.clearRect(0, 0, fx.width, fx.height)
}
function toast(text) {
  const s = document.createElement('div')
  s.className = 'toast'
  s.textContent = text
  document.body.append(s)
  setTimeout(() => s.remove(), 1650)
}
