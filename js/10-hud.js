// js/10-hud.js · heads-up
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- heads-up ----------
function hud() {
  const snd = document.getElementById('sound')
  snd.setAttribute('aria-pressed', String(!state.muted))
  snd.textContent = state.muted ? 'Muted' : 'Sound'
}

// the readiness bell: the shaded left area under a normal curve is the share of stars earned
function invPhi(p) {
  // Acklam's rational approximation
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239]
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572]
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const lo = 0.02425
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (p > 1 - lo) return -invPhi(1 - p)
  const q = p - 0.5
  const r = q * q
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
}
function bellSvg(frac) {
  const W = 200, H = 96, base = 84, top = 10
  const X = z => ((z + 3.2) / 6.4) * W
  const Y = z => base - (base - top) * Math.exp(-(z * z) / 2)
  const pts = []
  for (let z = -3.2; z <= 3.2001; z += 0.1) pts.push([X(z), Y(z)])
  const curve = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  let shade = ''
  if (frac > 0) {
    const zc = frac >= 0.999 ? 3.2 : Math.max(-3.2, Math.min(3.2, invPhi(frac)))
    const sp = pts.filter(p => p[0] <= X(zc))
    sp.push([X(zc), Y(zc)])
    shade = `<path d="M${X(-3.2)} ${base} ${sp.map(p => 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')} L${X(zc).toFixed(1)} ${base} Z" fill="var(--gold)" opacity="0.85"/>
        <line x1="${X(zc).toFixed(1)}" y1="${base}" x2="${X(zc).toFixed(1)}" y2="${(Y(zc) - 6).toFixed(1)}" stroke="var(--ink)" stroke-width="1.5"/>`
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Readiness ${Math.round(frac * 100)} percent">
      ${shade}
      <path d="${curve}" fill="none" stroke="var(--rule)" stroke-width="2.5"/>
      <line x1="0" y1="${base}" x2="${W}" y2="${base}" stroke="var(--rule)" stroke-width="1.5"/>
      ${[-2, -1, 0, 1, 2].map(z => `<line x1="${X(z)}" y1="${base}" x2="${X(z)}" y2="${base + 5}" stroke="var(--rule)" stroke-width="1.2"/>`).join('')}
    </svg>`
}
