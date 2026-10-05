// js/23-question-graphs.js · graphs for Worlds 1–4: read the distribution off the question
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- graphs for Worlds 1–4: read the distribution off the question ----------
// A graph is drawn only when one distribution, with numbers taken from the question,
// reproduces the question's own answer. If nothing (or more than one) does, no graph.
const erf = x => {
  const sgn = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a)
  return sgn * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a))
}
const Phi = z => (z === Infinity ? 1 : z === -Infinity ? 0 : 0.5 * (1 + erf(z / Math.SQRT2)))
// the regularized lower incomplete gamma function P(a, x)
function gammaP(a, x) {
  if (x <= 0) return 0
  if (x === Infinity) return 1
  const pre = Math.exp(-x + a * Math.log(x) - lgamma(a))
  if (x < a + 1) {
    let sum = 1 / a, term = sum
    for (let n = 1; n < 1000 && term > sum * 1e-16; n++) sum += term *= x / (a + n)
    return sum * pre
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, f = d
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < 1e-300) d = 1e-300
    c = b + an / c
    if (Math.abs(c) < 1e-300) c = 1e-300
    d = 1 / d
    const del = d * c
    f *= del
    if (Math.abs(del - 1) < 1e-16) break
  }
  return 1 - pre * f
}
const chiCdf = (x, g) => gammaP(g / 2, x / 2)
// the P(…) parts of a question as intervals on one variable: V is X, W, Z or C (χ²)
function regionOf(src) {
  const parts = []
  let v = null
  for (const m of (src ?? '').matchAll(/P\(((?:[^()]|\([^()]*\))*)\)/g)) {
    const t = m[1].replace(/\\le(?![a-z])|\\leq(?![a-z])/g, '≤').replace(/\\ge(?![a-z])|\\geq(?![a-z])/g, '≥').replace(/\\chi\^\{?2\}?/g, 'C').replace(/−/g, '-').replace(/\s+|\\[,;!]/g, '')
    let k
    if ((k = /^(X|W|Z|C)(<|≤|>|≥|=)(-?\d*\.?\d+)$/.exec(t))) {
      const c = +k[3]
      parts.push(k[2] === '=' ? { lo: c, hi: c, loIn: true, hiIn: true } : k[2][0] === '<' || k[2] === '≤' ? { lo: -Infinity, hi: c, loIn: false, hiIn: k[2] === '≤' } : { lo: c, hi: Infinity, loIn: k[2] === '≥', hiIn: false })
      v ??= k[1]
      if (v !== k[1]) return null
    } else if ((k = /^(-?\d*\.?\d+)(<|≤)(X|W|Z|C)(<|≤)(-?\d*\.?\d+)$/.exec(t))) {
      parts.push({ lo: +k[1], hi: +k[5], loIn: k[2] === '≤', hiIn: k[4] === '≤' })
      v ??= k[3]
      if (v !== k[3]) return null
    } else if ((k = /^\|Z\|>(\d*\.?\d+)$/.exec(t))) {
      parts.push({ lo: -Infinity, hi: -k[1], loIn: false, hiIn: false }, { lo: +k[1], hi: Infinity, loIn: false, hiIn: false })
      v = 'Z'
    } else if ((k = /^Z<(-\d*\.?\d+)\\text\{or\}Z>(\d*\.?\d+)$/.exec(t))) {
      parts.push({ lo: -Infinity, hi: +k[1], loIn: false, hiIn: false }, { lo: +k[2], hi: Infinity, loIn: false, hiIn: false })
      v = 'Z'
    } else return null
  }
  return parts.length ? { v, parts } : null
}
const VNAME = { X: 'X', W: 'W', Z: 'Z', C: 'χ²' }
const regionText = r => r.parts.map(({ lo, hi, loIn, hiIn }) => {
  const V = VNAME[r.v]
  if (lo === hi) return `P(${V} = ${lo})`
  if (lo === -Infinity) return `P(${V} ${hiIn ? '≤' : '<'} ${hi})`
  if (hi === Infinity) return `P(${V} ${loIn ? '≥' : '>'} ${lo})`
  return `P(${lo} ${loIn ? '≤' : '<'} ${V} ${hiIn ? '≤' : '<'} ${hi})`
}).join(' + ')
const shown4 = x => `${Math.abs(+x.toPrecision(4) - x) < 1e-12 ? '=' : '≈'} ${+x.toPrecision(4)}`
const close = (a, b, tol) => Math.abs(a - b) <= tol
const exactly = (a, b) => Math.abs(a - b) <= 1e-9 + 1e-6 * Math.abs(b)
// area of a region under a continuous cdf, and under a pmf on whole numbers
const areaCont = (r, cdf) => r.parts.reduce((s, { lo, hi }) => s + cdf(hi) - cdf(lo), 0)
function areaDisc(r, pmf, lo, hi) {
  let s = 0
  for (const part of r.parts) {
    const a = Math.max(lo, part.lo === -Infinity ? lo : part.loIn ? Math.ceil(part.lo) : Math.floor(part.lo) + 1)
    const b = Math.min(hi, part.hi === Infinity ? hi : part.hiIn ? Math.floor(part.hi) : Math.ceil(part.hi) - 1)
    if (part.hi === Infinity && hi === Infinity) {
      // a tail with no end: 1 − the rest
      let below = 0
      for (let x = lo; x < a; x++) below += pmf(x)
      s += 1 - below
    } else for (let x = a; x <= b; x++) s += pmf(x)
  }
  return s
}
const inRegion = (r, x) => r.parts.some(({ lo, hi, loIn, hiIn }) => (loIn ? x >= lo : x > lo) && (hiIn ? x <= hi : x < hi))

// the numbers a question offers: values, chances (decimals, percents, 1 in c, digit sets)
function questionNumbers(p) {
  const vals = new Set()
  for (const [src, latex] of [[p.text, false], [p.latex, true], [p.answerLatex, true]]) for (const t of numberTokens(src ?? '', latex, true)) vals.add(Math.abs(t.val))
  // never the answer itself (or its rounding): it would fit trivially
  if (typeof p.answer === 'number') for (const v of [...vals]) if (Math.abs(v - p.answer) < 1e-3 * Math.max(1, Math.abs(p.answer))) vals.delete(v)
  const probs = new Set([...vals].filter(v => v > 0 && v < 1))
  if (/fair coin/i.test(p.text ?? '')) probs.add(0.5)
  if (/\bdie\b|\bdice\b/i.test(p.text ?? '')) probs.add(1 / 6)
  for (const m of (p.text ?? '').matchAll(/(\d+(?:\.\d+)?)%/g)) probs.add(+m[1] / 100)
  for (const m of (p.text ?? '').matchAll(/(\d+) choices/g)) probs.add(1 / +m[1])
  for (const m of (p.text ?? '').matchAll(/\{([\d,\s]+)\}/g)) probs.add(m[1].split(',').length / 10)
  for (const q of [...probs]) probs.add(+(1 - q).toFixed(12))
  const ints = [...vals].filter(v => Number.isInteger(v) && v >= 1 && v <= 5000)
  return { vals: [...vals], probs: [...probs], ints }
}

function discreteGraph(p, r) {
  if (r.v !== 'X' || r.parts.some(q => ![q.lo, q.hi].every(x => !Number.isFinite(x) || Number.isInteger(x)))) return null
  const { vals, probs, ints } = questionNumbers(p)
  const found = []
  const canon = new Set() // distinct distributions found (r and n swapped is the same hypergeometric)
  // each family only where the story is worded like it
  const text = p.text ?? ''
  const storyMax = Math.max(0, ...numberTokens(text, false).map(t => t.val).filter(Number.isInteger))
  const waits = /until|\bfirst\b|to get the|needed for the|\d+(?:st|nd|rd|th)\b/i.test(text)
  const fits = {
    binomial: !waits || /\bbinomial\b/i.test(text),
    geometric: /\bfirst\b|\bgeometric\b/i.test(text),
    negbin: (/\d+(?:st|nd|rd|th)\b/.test(text) && waits) || /negative binomial/i.test(text),
    // a count of trials until something is never a draw from a group
    hyper: /without replacement|at random|committee|sample|hand|different|draw|nets|hypergeometric/i.test(text) && !/\buntil\b/i.test(text),
    poisson: /average|poisson|\bper\b/i.test(text),
  }
  const tryFam = (key, params, pmf, lo, hi) => {
    if (canon.size > 1 || !fits[key]) return
    const a = areaDisc(r, pmf, lo, hi)
    if (!exactly(a, p.answer)) return
    found.push({ key, params, pmf, lo, hi })
    canon.add(key === 'hyper' ? `hyper:${params.N}:${Math.min(params.r, params.n)}:${Math.max(params.r, params.n)}` : key + JSON.stringify(params))
  }
  for (const n of ints) if (n <= 200) for (const pp of probs) tryFam('binomial', { n, p: pp }, x => choose(n, x) * pp ** x * (1 - pp) ** (n - x), 0, n)
  for (const pp of probs) tryFam('geometric', { p: pp }, x => (1 - pp) ** (x - 1) * pp, 1, Infinity)
  for (const rr of ints) if (rr >= 2 && rr <= 20) for (const pp of probs) tryFam('negbin', { r: rr, p: pp }, x => choose(x - 1, rr - 1) * pp ** rr * (1 - pp) ** (x - rr), rr, Infinity)
  const Ns = new Set(ints)
  for (const a of ints) for (const b of ints) if (a + b <= 5000) Ns.add(a + b)
  for (const N of Ns) for (const rr of ints) for (const n of ints) {
    if (rr >= N || n > N || N < storyMax || canon.size > 1) continue
    tryFam('hyper', { N, r: rr, n }, x => (choose(rr, x) * choose(N - rr, n - x)) / choose(N, n), Math.max(0, n - (N - rr)), Math.min(n, rr))
  }
  for (const k of vals) if (k > 0 && k <= 60) tryFam('poisson', { k }, x => (Math.exp(-k) * k ** x) / fact(x), 0, Infinity)
  // exactly one distribution may fit; a hypergeometric with r and n swapped has the
  // same chances, so the story's sample says which number is n
  if (canon.size !== 1) return null
  if (found.length === 2 && found.every(f => f.key === 'hyper')) {
    const sample = new Set([...text.matchAll(/(?:n = |draws? |committee of |sample of |tests |calls on |interviews |picks |chooses |nets )(\d+)|(\d+)-card hand/g)].map(m => +(m[1] ?? m[2])))
    const pick = found.filter(f => sample.has(f.params.n))
    found.splice(0, found.length, ...pick)
  }
  if (found.length !== 1) return null
  const f = found[0]
  // draw from the low end to where (nearly) all of the chance is, and past the region
  let top = f.hi
  if (top === Infinity) {
    let cum = 0
    top = f.lo
    while (cum < 0.995 && top - f.lo < 160) cum += f.pmf(top++)
    for (const q of r.parts) if (Number.isFinite(q.hi)) top = Math.max(top, q.hi + 2)
    for (const q of r.parts) if (Number.isFinite(q.lo)) top = Math.max(top, q.lo + 2)
  }
  const xs = []
  for (let x = f.lo; x <= top; x++) xs.push(x)
  const P = f.params
  const title = {
    binomial: () => `binomial · n = ${P.n}, p = ${fmt(P.p)}`,
    geometric: () => `geometric · p = ${fmt(P.p)}`,
    negbin: () => `negative binomial · r = ${P.r}, p = ${fmt(P.p)}`,
    hyper: () => `hypergeometric · N = ${P.N}, r = ${P.r}, n = ${P.n}`,
    poisson: () => `Poisson · k = ${fmt(P.k)}`,
  }[f.key]()
  const tail = r.parts.some(q => q.hi === Infinity) && f.hi === Infinity ? ' (the lit bars run on to the right)' : ''
  return { kind: 'bars', title, xs, ys: xs.map(f.pmf), hits: new Set(xs.filter(x => inRegion(r, x))), note: `shaded: ${regionText(r)} ${shown4(p.answer)}${tail}` }
}

// the rate and mean in the wait's own units ("W is the wait, in minutes")
function expTitle(p, lam) {
  const unit = /wait, in (\w+?)s?\b/.exec(p.text ?? '')?.[1]
  return unit ? `exponential · λ = ${fmt(lam)} per ${unit} (mean β = ${fmt(1 / lam)} ${unit}s)` : `exponential · λ = ${fmt(lam)} (mean β = ${fmt(1 / lam)})`
}
function continuousGraph(p, r) {
  if (r.v !== 'X' && r.v !== 'W') return null
  const { vals } = questionNumbers(p)
  const found = []
  // uniform on [A, B]
  if (saysUniform(p)) for (const A of vals) for (const B of vals) if (B > A && found.length < 2) {
    const cdf = x => Math.min(1, Math.max(0, (x - A) / (B - A)))
    if (exactly(areaCont(r, cdf), p.answer)) found.push({ key: 'uniform', A, B, cdf })
  }
  // exponential, with the rate in the wait's units (per minute, hour, day, …)
  const rates = new Set()
  for (const c of vals) if (c > 0) for (const f of [1, 60, 1 / 60, 24, 1 / 24, 1440, 1 / 1440, 7, 1 / 7]) rates.add(c * f).add(f / c)
  if (saysRate(p)) for (const lam of rates) if (found.length < 2) {
    const cdf = x => (x <= 0 ? 0 : x === Infinity ? 1 : 1 - Math.exp(-lam * x))
    if (exactly(areaCont(r, cdf), p.answer)) found.push({ key: 'exponential', lam, cdf })
  }
  const kinds = new Set(found.map(f => f.key + (f.key === 'uniform' ? f.A + ',' + f.B : +f.lam.toPrecision(12))))
  if (kinds.size !== 1) return null
  const f = found[0]
  const shades = r.parts.map(q => [q.lo, q.hi])
  const note = `shaded: ${regionText(r)} ${shown4(p.answer)}`
  if (f.key === 'uniform') {
    const w = f.B - f.A
    return { kind: 'curve', title: `uniform · A = ${f.A}, B = ${f.B}`, lo: f.A - 0.2 * w, hi: f.B + 0.2 * w, pdf: x => (x >= f.A && x <= f.B ? 1 / w : 0), flat: [f.A, f.B], shades, ticks: [f.A, f.B], note }
  }
  const hi = Math.max(-Math.log(0.002) / f.lam, ...r.parts.flatMap(q => [q.lo, q.hi]).filter(Number.isFinite).map(x => x * 1.5))
  return { kind: 'curve', title: expTitle(p, f.lam), lo: 0, hi, pdf: x => (x < 0 ? 0 : f.lam * Math.exp(-f.lam * x)), shades, ticks: [0, ...r.parts.flatMap(q => [q.lo, q.hi]).filter(x => Number.isFinite(x) && x > 0)], note }
}

// the normal: standard (Z) or with μ and σ from the story; forwards or backwards
function normalGraph(p, r) {
  const text = p.text ?? ''
  let mu = 0, sig = 1, std = true
  const mm = /μ = (-?\d*\.?\d+)/.exec(text)
  if (mm) {
    const s1 = /σ = (\d*\.?\d+)/.exec(text), s2 = /σ² = ([\d,]*\.?\d+)/.exec(text)
    if (!s1 && !s2) return null
    mu = +mm[1]
    sig = s1 ? +s1[1] : Math.sqrt(+s2[1].replace(/,/g, ''))
    std = false
  } else if (!(r?.v === 'Z' || /Z|z_/.test(p.latex ?? ''))) return null
  const cdf = x => Phi((x - mu) / sig)
  const V = std ? 'Z' : 'X'
  // a percentile answer ("98.12th") is a number
  const ans = typeof p.answer === 'string' && /^\d*\.?\d+(st|nd|rd|th)$/.test(p.answer) ? parseFloat(p.answer) : p.answer
  let shades = null, marks = [], note = null
  const latex = (p.latex ?? '').replace(/\s+/g, ' ')
  if (r && (r.v === V || (std && r.v === 'Z')) && typeof ans === 'number') {
    if (!close(areaCont(r, cdf), ans, 0.006)) return null
    shades = r.parts.map(q => [q.lo, q.hi])
    note = `shaded: ${regionText(r)} ${shown4(ans)}`
  } else if (!std && /^x_1 = \\,\?, \\quad x_2 = \\,\?$/.test(latex) && typeof ans === 'string') {
    // the middle A%: the answer is both cut-offs
    const A = +(/middle (\d+(?:\.\d+)?)%/.exec(p.ask ?? '')?.[1] ?? NaN) / 100
    const [lo, hi2] = ans.split(' and ').map(Number)
    if (!(A > 0) || !(lo < hi2) || !close(cdf(hi2) - cdf(lo), A, 0.01)) return null
    shades = [[lo, hi2]]
    note = `shaded: the middle ${+(A * 100).toFixed(4)}%, from ${fmt(lo)} to ${fmt(hi2)}`
  } else if (typeof ans === 'number') {
    let k
    const sub = s => s.replace(/-z_0/g, String(-ans)).replace(/z_0/g, String(ans))
    if (std && (k = /^(P\(.*z_0.*\)) = (\d*\.?\d+)$/.exec(latex))) {
      const rr = regionOf(sub(k[1]))
      if (!rr || !close(areaCont(rr, cdf), +k[2], 0.006)) return null
      shades = rr.parts.map(q => [q.lo, q.hi])
      note = `shaded: ${regionText(rr)} = ${k[2]}, so z₀ = ${fmt(ans)}`
    } else if (std && (k = /^z_\{(\d*\.?\d+)\} = \\,\?$/.exec(latex))) {
      if (!close(1 - cdf(ans), +k[1], 0.006)) return null
      shades = [[ans, Infinity]]
      note = `shaded: the area ${k[1]} to the right of z = ${fmt(ans)}`
    } else if (!std && (k = /the (\d+(?:\.\d+)?)(?:st|nd|rd|th) percentile:\s*\}?\s*x/.exec(latex))) {
      if (!close(cdf(ans), +k[1] / 100, 0.01)) return null
      shades = [[-Infinity, ans]]
      note = `shaded: the lowest ${k[1]}%, left of x = ${fmt(ans)}`
    } else if (!std && (k = /^x = (-?\d*\.?\d+), \\quad \\text\{percentile\}/.exec(latex))) {
      const x = +k[1]
      // the percentile as a left area (0.9887) or as a percent (98.87)
      const pct = ans <= 1 ? ans * 100 : ans
      if (!close(100 * cdf(x), pct, 0.6)) return null
      shades = [[-Infinity, x]]
      note = `shaded: the area left of x = ${x}, about ${+pct.toFixed(2)}%`
    } else if (!std && (k = /^x = (-?\d*\.?\d+), \\quad z = /.exec(latex))) {
      const x = +k[1]
      if (!close((x - mu) / sig, ans, 0.006)) return null
      marks = [x]
      note = `x = ${x} sits ${fmt(Math.abs(ans))} standard deviations ${ans < 0 ? 'below' : 'above'} μ`
    } else if (!std && (k = /^P\(x_1 < X < x_2\) = (\d*\.?\d+)$/.exec(latex))) {
      // the answer is either cut-off; the other is the same distance on the other side of μ
      const lo = Math.min(ans, 2 * mu - ans), hi2 = Math.max(ans, 2 * mu - ans)
      if (!close(cdf(hi2) - cdf(lo), +k[1], 0.01)) return null
      shades = [[lo, hi2]]
      note = `shaded: the middle ${+(+k[1] * 100).toFixed(4)}%, from ${fmt(lo)} to ${fmt(hi2)}`
    } else if (!std && /^x = \\,\?$/.test(latex) && (k = /^P\(X ([<>]) x\) = (\d*\.?\d+)/.exec(p.answerLatex ?? ''))) {
      // the tallest (or cleanest) share: its side and size are in the worked answer
      const share = +k[2], top = k[1] === '>'
      if (!close(top ? 1 - cdf(ans) : cdf(ans), share, 0.01)) return null
      shades = [top ? [ans, Infinity] : [-Infinity, ans]]
      note = `shaded: the ${top ? 'top' : 'bottom'} ${+(share * 100).toFixed(4)}%, cut at x = ${fmt(ans)}`
    } else if (!std && (k = /(top|bottom) (\d+(?:\.\d+)?)%/.exec(text))) {
      const share = +k[2] / 100
      const area = k[1] === 'top' ? 1 - cdf(ans) : cdf(ans)
      if (!close(area, share, 0.01)) return null
      shades = [k[1] === 'top' ? [ans, Infinity] : [-Infinity, ans]]
      note = `shaded: the ${k[1]} ${k[2]}%, cut at x = ${fmt(ans)}`
    } else return null
  } else return null
  const lo = mu - 3.6 * sig, hi = mu + 3.6 * sig
  return { kind: 'curve', title: std ? 'standard normal · Z, μ = 0, σ = 1' : `normal · μ = ${fmt(mu)}, σ = ${fmt(sig)}`, lo, hi,
    pdf: x => Math.exp(-((x - mu) ** 2) / (2 * sig * sig)) / (sig * Math.sqrt(2 * Math.PI)),
    shades: (shades ?? []).map(([a, b]) => [Math.max(a, lo), Math.min(b, hi)]), marks, ticks: [-2, -1, 0, 1, 2].map(k => +(mu + k * sig).toFixed(6)), note }
}

function chiGraph(p, r) {
  const g = +(/γ = (\d+)/.exec(p.text ?? '')?.[1] ?? [...(p.answerLatex ?? '').matchAll(/\\gamma = (\d+)/g)].at(-1)?.[1] ?? NaN)
  if (!(g >= 1) || !/\\chi/.test(p.latex ?? '')) return null
  const cdf = x => chiCdf(x, g)
  const latex = (p.latex ?? '').replace(/\s+/g, ' ')
  const ans = p.answer
  let shades, note, k
  if (r && r.v === 'C' && typeof ans === 'number' && !/= \d*\.?\d+$/.test(latex.replace(/= \\,\?$/, ''))) {
    if (!close(areaCont(r, cdf), ans, 0.012)) return null
    shades = r.parts.map(q => [q.lo, q.hi])
    note = `shaded: ${regionText(r)} ${shown4(ans)}`
  } else if ((k = /^P\(\\chi\^2 (>|<|\\le|\\ge) c\) = (\d*\.?\d+)$/.exec(latex)) && typeof ans === 'number') {
    const right = k[1] === '>' || k[1] === '\\ge'
    const area = right ? 1 - cdf(ans) : cdf(ans)
    if (!close(area, +k[2], 0.012)) return null
    shades = [right ? [ans, Infinity] : [0, ans]]
    note = `shaded: the ${right ? 'right' : 'left'} area ${k[2]}, cut at c = ${fmt(ans)}`
  } else if ((k = /^\\chi\^2_\{(\d*\.?\d+)\} = \\,\?$/.exec(latex)) && typeof ans === 'number') {
    if (!close(1 - cdf(ans), +k[1], 0.012)) return null
    shades = [[ans, Infinity]]
    note = `shaded: the right area ${k[1]}, past χ² = ${fmt(ans)}`
  } else return null
  const hi = Math.max(g + 6 * Math.sqrt(2 * g), ...shades.flat().filter(Number.isFinite).map(x => x * 1.3))
  return { kind: 'curve', title: `chi-squared · γ = ${g}`, lo: 0, hi, pdf: x => gammaPdf(x, g / 2, 2), shades: shades.map(([a, b]) => [Math.max(0, a), Math.min(hi, b)]), ticks: [0, ...shades.flat().filter(x => Number.isFinite(x) && x > 0)], note }
}

// binomial table questions: n and the column p are named in the hint
function binomialTableGraph(p, r) {
  const n = +(/n = (19|20) table/.exec(p.hint?.text ?? '')?.[1] ?? NaN)
  const pp = +(/column p = (\d*\.?\d+)/.exec(p.hint?.text ?? '')?.[1] ?? NaN)
  if (!(n > 0) || !(pp > 0)) return null
  const rr = r ?? regionOf(p.answerLatex)
  if (!rr || rr.v !== 'X') return null
  const pmf = x => choose(n, x) * pp ** x * (1 - pp) ** (n - x)
  if (!close(areaDisc(rr, pmf, 0, n), p.answer, 0.0006)) return null
  const xs = Array.from({ length: n + 1 }, (_, i) => i)
  return { kind: 'bars', title: `binomial · n = ${n}, p = ${fmt(pp)}`, xs, ys: xs.map(pmf), hits: new Set(xs.filter(x => inRegion(rr, x))), note: `shaded: ${regionText(rr)} ${shown4(p.answer)}` }
}

// uniform and exponential questions about the mean, variance or σ
function statsGraph(p) {
  const latex = (p.latex ?? '').replace(/\s+/g, ' ')
  const ans = p.answer
  if (typeof ans !== 'number') return null
  const stat = /^E\[X\] = /.test(latex) ? 'mean' : /^\\operatorname\{Var\}X = /.test(latex) ? 'var' : /^\\sigma = /.test(latex) ? 'sd' : /^E\[X\^2\] = /.test(latex) ? 'm2'
    : /^E\[W\] = /.test(latex) ? 'Wmean' : /^\\sigma_W = /.test(latex) ? 'Wsd' : /^\\operatorname\{Var\}W = /.test(latex) ? 'Wvar' : null
  if (!stat) return null
  const { vals } = questionNumbers(p)
  if (stat[0] === 'W') {
    if (!saysRate(p)) return null
    const lam = stat === 'Wvar' ? 1 / Math.sqrt(ans) : 1 / ans
    // the rate must be one the story gives, in some units
    const ok = vals.some(c => [1, 60, 1 / 60, 24, 1 / 24].some(f => exactly(c * f, lam) || exactly(f / c, lam)))
    if (!ok) return null
    return { kind: 'curve', title: expTitle(p, lam), lo: 0, hi: -Math.log(0.01) / lam, pdf: x => lam * Math.exp(-lam * x), marks: [1 / lam], ticks: [0, 1 / lam], note: `the mean β = 1/λ = ${fmt(1 / lam)} is marked; σ is also β` }
  }
  if (!saysUniform(p)) return null
  const fits = list => {
    const out = []
    for (const A of list) for (const B of list) if (B > A) {
      const v = { mean: (A + B) / 2, var: (B - A) ** 2 / 12, sd: (B - A) / Math.sqrt(12), m2: (B ** 3 - A ** 3) / (3 * (B - A)) }[stat]
      if (exactly(v, ans)) out.push([A, B])
    }
    return out
  }
  // the story's own numbers first: the worked answer's can fit too (4 to 8 has the σ of 5 to 9)
  const story = [...new Set(numberTokens(p.text ?? '', false, true).map(t => Math.abs(t.val)))]
  let found = fits(story)
  if (!found.length) found = fits(vals)
  if (found.length !== 1) return null
  const [A, B] = found[0], w = B - A
  return { kind: 'curve', title: `uniform · A = ${A}, B = ${B}`, lo: A - 0.2 * w, hi: B + 0.2 * w, pdf: x => (x >= A && x <= B ? 1 / w : 0), flat: [A, B], marks: [(A + B) / 2], ticks: [A, (A + B) / 2, B], note: `the mean (A + B)/2 = ${fmt((A + B) / 2)} is marked` }
}

// a question that writes out its own pdf, cdf or table is not one of the named distributions
const ownsPdf = p => /\\begin\{cases\}|\\begin\{array\}|\\int|[fF]\(x\) =/.test(p.latex ?? '') || !p.text
const saysUniform = p => /equally likely|uniform/i.test(p.text ?? '')
const saysRate = p => /per (second|minute|hour|day|week|month|year)|\bevery\b|average rate/i.test(p.text ?? '')
// a question that only says P = ? (or P(scrapped) = ?) names its region in the worked answer
function answerRegion(p) {
  if (!/^P(\(\\text\{[^}]*\}\))? = \\,\?$/.test((p.latex ?? '').trim())) return null
  for (const line of (p.answerLatex ?? '').split(/\\\\/)) {
    const r = regionOf(line.replace(/P\(\\text\{[^}]*\}\)/g, ''))
    if (r) return r
  }
  return null
}
function inferGraph(p, level) {
  if (p.options || p.leaf) return null
  const r = regionOf(p.latex) ?? answerRegion(p)
  try {
    if (level === 'Binomial table') return binomialTableGraph(p, r)
    if (level === 'Chi-squared table') return chiGraph(p, r)
    if (level === 'Normal table' || level === 'Normal word problems') return normalGraph(p, r)
    if (/\\chi/.test(p.latex ?? '')) return chiGraph(p, r)
    if (ownsPdf(p)) return null
    if (r && typeof p.answer === 'number') {
      if (r.v === 'Z' || /μ = /.test(p.text ?? '')) return normalGraph(p, r)
      if (saysUniform(p) || r.v === 'W') return continuousGraph(p, r)
      return discreteGraph(p, r)
    }
    return statsGraph(p)
  } catch {
    return null
  }
}
