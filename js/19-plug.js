// js/19-plug.js · plug it in: the story's numbers go into the formula
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- plug it in: the story's numbers go into the formula ----------
const SYM = { n: 'n', p: 'p', q: 'q', x: 'x', r: 'r', N: 'N', k: 'k', t: 't', s: 's', ra: 'r', A: 'A', B: 'B', lam: '\\lambda', mu: '\\mu', sig: '\\sigma', al: '\\alpha', be: '\\beta', ga: '\\gamma' }
const CHIP_SYM = { lam: 'λ', mu: 'μ', sig: 'σ', al: 'α', be: 'β', ga: 'γ', ra: 'right area' }
const choose = (n, k) => {
  if (k < 0 || k > n) return 0
  let c = 1
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i
  return Math.round(c)
}
const fact = n => (n <= 1 ? 1 : n * fact(n - 1))
const gcd = (a, b) => (b ? gcd(b, a % b) : a)
// numbers as worked by hand: 4 significant figures, whole numbers in full,
// very big or small ones as a × 10ⁿ
const num = (x, d = 4) => {
  const a = Math.abs(x)
  if (x !== 0 && (a < 1e-4 || (a >= 1e6 && !Number.isInteger(x)) || a >= 1e13)) {
    const [m, e] = x.toExponential(d - 1).split('e')
    return `${+m} \\times 10^{${+e}}`
  }
  if (Number.isInteger(x)) return a >= 1e4 ? x.toLocaleString('en-US').replace(/,/g, '{,}') : String(x)
  return String(Number(x.toPrecision(d)))
}
// a factor in the work: 5 significant figures, or the story's own fraction
const factor = (x, t) => (t && /frac/.test(t) ? t : num(x, 5))
const exact = (x, d = 4) => (Number.isInteger(x) ? Math.abs(x) < 1e13 : Math.abs(+x.toPrecision(d) - x) <= 1e-12 * Math.abs(x))
const rel = ok => (ok ? '=' : '\\approx')
const base = t => (/^\d+$/.test(t) ? t : `\\left(${t}\\right)`)
const xpow = e => (e === 1 ? 'x' : `x^{${e}}`)
