// js/22-distribution-graph.js · the graph: the distribution with the story's numbers
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the graph: the distribution with the story's numbers ----------
const lgamma = z => {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z)
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
  z -= 1
  let x = c[0]
  for (let i = 1; i < 9; i++) x += c[i] / (z + i)
  const t = z + 7.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}
const gammaPdf = (x, a, b) => (x <= 0 ? 0 : Math.exp((a - 1) * Math.log(x) - x / b - lgamma(a) - a * Math.log(b)))
// what to draw for each distribution: bars (counting) or a curve (measuring),
// which bar or area the story asked about, and a title with the parameters
function graphOf(leaf, v, txt = {}) {
  const say = k => txt[k] ?? fmt(v[k])
  const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
  const upTo = (lo, pmf, cap) => {
    let x = lo, cum = 0
    while (cum < 0.99 && x - lo < cap) cum += pmf(x++)
    return x
  }
  const bars = (title, xs, pmf, at) => ({ kind: 'bars', title, xs, ys: xs.map(pmf), at, atLabel: `f(${at}) ≈ ${+pmf(at).toPrecision(3)}` })
  switch (leaf) {
    case 'binomial': {
      const pmf = x => choose(v.n, x) * v.p ** x * v.q ** (v.n - x)
      return bars(`binomial · n = ${v.n}, p = ${say('p')}`, range(0, v.n), pmf, v.x)
    }
    case 'geometric': {
      const pmf = x => v.q ** (x - 1) * v.p
      return bars(`geometric · p = ${say('p')}`, range(1, Math.max(v.x + 2, upTo(1, pmf, 120))), pmf, v.x)
    }
    case 'negbin': {
      const pmf = x => choose(x - 1, v.r - 1) * v.p ** v.r * v.q ** (x - v.r)
      return bars(`negative binomial · r = ${v.r}, p = ${say('p')}`, range(v.r, Math.max(v.x + 2, upTo(v.r, pmf, 140))), pmf, v.x)
    }
    case 'hyper': {
      const pmf = x => (choose(v.r, x) * choose(v.N - v.r, v.n - x)) / choose(v.N, v.n)
      return bars(`hypergeometric · N = ${v.N}, r = ${v.r}, n = ${v.n}`, range(Math.max(0, v.n - (v.N - v.r)), Math.min(v.n, v.r)), pmf, v.x)
    }
    case 'poisson': {
      const pmf = x => (Math.exp(-v.k) * v.k ** x) / fact(x)
      return bars(`Poisson · k = ${fmt(v.k)}`, range(0, Math.max(v.x + 2, upTo(0, pmf, 26))), pmf, v.x)
    }
    case 'uniform': {
      const w = v.B - v.A
      return { kind: 'curve', title: `uniform · A = ${v.A}, B = ${v.B}`, lo: v.A - 0.2 * w, hi: v.B + 0.2 * w, pdf: x => (x >= v.A && x <= v.B ? 1 / w : 0), ticks: [v.A, v.B], flat: [v.A, v.B], note: `height 1/(B − A) = 1/${fmt(w)}` }
    }
    case 'exponential': {
      const hi = Math.max(-Math.log(0.01) / v.lam, v.t * 1.6)
      return { kind: 'curve', title: `exponential · λ = ${say('lam')}`, lo: 0, hi, pdf: x => (x < 0 ? 0 : v.lam * Math.exp(-v.lam * x)), shade: [v.t, hi], ticks: [0, v.t], note: `shaded: P[X > ${fmt(v.t)}] ≈ ${+Math.exp(-v.lam * v.t).toPrecision(3)}` }
    }
    case 'gamma': {
      const m = v.al * v.be, sd = Math.sqrt(v.al) * v.be
      return { kind: 'curve', title: `gamma · α = ${v.al}, β = ${say('be')}`, lo: 0, hi: m + 4 * sd, pdf: x => gammaPdf(x, v.al, v.be), ticks: [0, m], note: `mean αβ ${Math.abs(+m.toPrecision(4) - m) < 1e-12 ? '=' : '≈'} ${+m.toPrecision(4)}` }
    }
    case 'chi': {
      const g = v.ga, hi = g + 5 * Math.sqrt(2 * g)
      const pdf = x => gammaPdf(x, g / 2, 2)
      if ('ra' in v) {
        const cs = chiEntry(g, 1 - v.ra), c = +cs
        return { kind: 'curve', title: `chi-squared · γ = ${g}`, lo: 0, hi: Math.max(hi, c * 1.15), pdf, shade: [c, Math.max(hi, c * 1.15)], ticks: [0, c], note: `shaded: the right area ${fmt(v.ra)}, past c = ${cs}` }
      }
      return { kind: 'curve', title: `chi-squared · γ = ${g}`, lo: 0, hi, pdf, ticks: [0, g], note: `mean γ = ${g}` }
    }
    case 'normal': {
      const z2 = +((v.x - v.mu) / v.sig).toFixed(2)
      return { kind: 'curve', title: `normal · μ = ${fmt(v.mu)}, σ = ${fmt(v.sig)}`, lo: v.mu - 3.5 * v.sig, hi: v.mu + 3.5 * v.sig, pdf: x => Math.exp(-((x - v.mu) ** 2) / (2 * v.sig ** 2)) / (v.sig * Math.sqrt(2 * Math.PI)),
        shade: [v.mu - 3.5 * v.sig, v.x], ticks: [v.mu - 2 * v.sig, v.mu - v.sig, v.mu, v.mu + v.sig, v.mu + 2 * v.sig], mark: v.x,
        note: `shaded: P[X < ${fmt(v.x)}] ${Math.abs(z2 - (v.x - v.mu) / v.sig) < 1e-12 ? '=' : '≈'} ${normEntry(z2)}` }
    }
  }
  return null
}
// a counting distribution: its pdf, its first and last values (Infinity: no top) and
// a title with its numbers; the section levels add up its terms and draw it
function countOf(leaf, v, txt = {}) {
  const say = k => txt[k] ?? fmt(v[k])
  switch (leaf) {
    case 'binomial': return { lo: 0, hi: v.n, pmf: x => choose(v.n, x) * v.p ** x * v.q ** (v.n - x), title: `binomial · n = ${v.n}, p = ${say('p')}` }
    case 'geometric': return { lo: 1, hi: Infinity, pmf: x => v.q ** (x - 1) * v.p, title: `geometric · p = ${say('p')}` }
    case 'negbin': return { lo: v.r, hi: Infinity, pmf: x => choose(x - 1, v.r - 1) * v.p ** v.r * v.q ** (x - v.r), title: `negative binomial · r = ${v.r}, p = ${say('p')}` }
    case 'hyper': return { lo: Math.max(0, v.n - (v.N - v.r)), hi: Math.min(v.n, v.r), pmf: x => (choose(v.r, x) * choose(v.N - v.r, v.n - x)) / choose(v.N, v.n), title: `hypergeometric · N = ${v.N}, r = ${v.r}, n = ${v.n}` }
    case 'poisson': return { lo: 0, hi: Infinity, pmf: x => (Math.exp(-v.k) * v.k ** x) / fact(x), title: `Poisson · k = ${say('k')}` }
  }
  return null
}
// a section question's bars: the values it asks about lit (hits), up to at least `upTo`,
// or its mean marked (with ± one σ when it asks for a spread)
function plugBars(leaf, v, { hits = null, upTo = 0, mean = null, sd = null, note = '', txt = {} } = {}) {
  const c = countOf(leaf, v, txt)
  if (!c) return null
  let hi = c.hi
  if (hi === Infinity) {
    // enough bars to hold 99% of the probability, the asked values, and the mean ± 2σ
    let x = c.lo, cum = 0
    while (cum < 0.99 && x - c.lo < 140) cum += c.pmf(x++)
    hi = Math.max(x, upTo, mean != null ? Math.ceil(mean + 2 * (sd ?? 0)) : 0)
  }
  const xs = Array.from({ length: hi - c.lo + 1 }, (_, i) => c.lo + i)
  const ys = xs.map(c.pmf)
  const one = hits && hits.size === 1 ? [...hits][0] : null
  return { kind: 'bars', title: c.title, xs, ys, hits: one == null ? hits : null, at: one, atLabel: one == null ? null : `f(${one}) ≈ ${+c.pmf(one).toPrecision(3)}`, mean, sd, note }
}
// a section question's uniform: flat from A to B, the asked stretch shaded
function plugFlat(v, { shade = null, ticks = [], note = '' } = {}) {
  const w = v.B - v.A
  return { kind: 'curve', title: `uniform · A = ${v.A}, B = ${v.B}`, lo: v.A - 0.2 * w, hi: v.B + 0.2 * w, pdf: x => (x >= v.A && x <= v.B ? 1 / w : 0), ticks: [...new Set([v.A, ...ticks, v.B])], flat: [v.A, v.B], shade, note }
}
const SVGNS = 'http://www.w3.org/2000/svg'
const svgEl = (tag, attrs = {}, text) => {
  const e = document.createElementNS(SVGNS, tag)
  for (const [k, val] of Object.entries(attrs)) e.setAttribute(k, val)
  if (text != null) e.textContent = text
  return e
}
const tickText = x => String(+(+x).toPrecision(4))
function distGraph(leaf, v, txt) {
  return drawGraph(graphOf(leaf, v, txt))
}
// draws a graph spec: bars (counting) with the asked bars lit, or a curve
// (measuring) with the asked areas shaded
function drawGraph(g) {
  if (!g) return null
  const W = 340, H = 180, L = 34, R = 12, Tp = 18, B = 30, pw = W - L - R, ph = H - Tp - B
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'dgraph', role: 'img', 'aria-label': `Graph of the ${g.title} distribution` })
  svg.append(svgEl('line', { x1: L, y1: Tp + ph, x2: L + pw, y2: Tp + ph, class: 'axis' }))
  svg.append(svgEl('line', { x1: L, y1: Tp, x2: L, y2: Tp + ph, class: 'axis' }))
  if (g.kind === 'bars') {
    // (room above the bars for the mean's label)
    const top = Math.max(...g.ys) * (g.mean != null ? 1.35 : 1.12)
    const slot = pw / g.xs.length
    const every = Math.ceil(g.xs.length / 12)
    const isHit = x => (g.hits ? g.hits.has(x) : x === g.at)
    g.xs.forEach((x, i) => {
      const hgt = (g.ys[i] / top) * ph
      const hit = isHit(x)
      const bar = svgEl('rect', { x: L + i * slot + slot * 0.15, y: Tp + ph - hgt, width: Math.max(1, slot * 0.7), height: Math.max(0, hgt), class: 'bar' + (hit ? ' hit' : '') })
      bar.style.setProperty('--i', i)
      svg.append(bar)
      if ((hit && !g.hits) || i % every === 0) svg.append(svgEl('text', { x: L + (i + 0.5) * slot, y: Tp + ph + 13, class: 'tick' + (hit ? ' hit' : ''), 'text-anchor': 'middle' }, String(x)))
      if (hit && g.atLabel) {
        const lx = Math.min(Math.max(L + (i + 0.5) * slot, L + 40), L + pw - 40)
        svg.append(svgEl('text', { x: lx, y: Math.max(Tp + 10, Tp + ph - hgt - 6), class: 'val', 'text-anchor': 'middle' }, g.atLabel))
      }
    })
    // the mean: the balance point of the bars, a dashed line; ± one σ a bracket under the label
    if (g.mean != null) {
      const at = m => L + (Math.min(Math.max(m, g.xs[0] - 0.5), g.xs[g.xs.length - 1] + 0.5) - g.xs[0] + 0.5) * slot
      const mx = at(g.mean)
      svg.append(svgEl('line', { x1: mx, y1: Tp + 14, x2: mx, y2: Tp + ph, class: 'mark' }))
      svg.append(svgEl('text', { x: Math.min(Math.max(mx, L + 46), L + pw - 46), y: Tp + 9, class: 'val', 'text-anchor': 'middle' }, `E[X] = ${+g.mean.toPrecision(4)}`))
      if (g.sd) {
        const y = Tp + 18
        svg.append(svgEl('line', { x1: at(g.mean - g.sd), y1: y, x2: at(g.mean + g.sd), y2: y, class: 'mark' }))
        for (const e of [g.mean - g.sd, g.mean + g.sd]) svg.append(svgEl('line', { x1: at(e), y1: y - 4, x2: at(e), y2: y + 4, class: 'mark' }))
      }
    }
    svg.append(svgEl('text', { x: L - 4, y: Tp + 4, class: 'tick', 'text-anchor': 'end' }, String(+top.toPrecision(2))))
    svg.append(svgEl('text', { x: L + pw / 2, y: H - 3, class: 'axis-name', 'text-anchor': 'middle' }, 'x'))
  } else {
    const N = 160, xs = Array.from({ length: N + 1 }, (_, i) => g.lo + ((g.hi - g.lo) * i) / N)
    const ys = xs.map(g.pdf)
    const top = Math.max(...ys) * 1.15
    const X = x => L + ((Math.min(g.hi, Math.max(g.lo, x)) - g.lo) / (g.hi - g.lo)) * pw
    const Y = y => Tp + ph - (Math.min(y, top) / top) * ph
    const shades = (g.shades ?? (g.shade ? [g.shade] : [])).map(([a, b]) => [Math.max(a, g.lo), Math.min(b, g.hi)]).filter(([a, b]) => b > a)
    // a flat pdf is only shaded where it is not zero: between A and B
    const filled = g.flat ? shades.map(([a, b]) => [Math.max(a, g.flat[0]), Math.min(b, g.flat[1])]).filter(([a, b]) => b > a) : shades
    for (const [a, b] of filled) {
      // a flat pdf is drawn exactly; a curve between sample points
      const inner = g.flat ? [] : xs.filter(x => x > a && x < b)
      const poly = [[a, 0], [a, g.pdf(a)], ...inner.map(x => [x, g.pdf(x)]), [b, g.pdf(b)], [b, 0]]
      svg.append(svgEl('path', { d: 'M' + poly.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' L') + ' Z', class: 'shade' }))
    }
    const d = g.flat
      ? `M${X(g.lo)},${Y(0)} L${X(g.flat[0])},${Y(0)} L${X(g.flat[0])},${Y(g.pdf((g.flat[0] + g.flat[1]) / 2))} L${X(g.flat[1])},${Y(g.pdf((g.flat[0] + g.flat[1]) / 2))} L${X(g.flat[1])},${Y(0)} L${X(g.hi)},${Y(0)}`
      : 'M' + xs.map((x, i) => `${X(x).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join(' L')
    svg.append(svgEl('path', { d, class: 'curve', pathLength: 1000 }))
    for (const t of g.ticks) {
      svg.append(svgEl('line', { x1: X(t), y1: Tp + ph, x2: X(t), y2: Tp + ph + 4, class: 'axis' }))
      svg.append(svgEl('text', { x: X(t), y: Tp + ph + 15, class: 'tick', 'text-anchor': 'middle' }, tickText(t)))
    }
    // dashed lines: the marked values and the inside edges of each shaded area
    const marks = new Set(g.marks ?? (g.mark != null ? [g.mark] : []))
    for (const [a, b] of shades) {
      if (a > g.lo + 1e-9) marks.add(a)
      if (b < g.hi - 1e-9) marks.add(b)
    }
    for (const m of marks) if (m >= g.lo && m <= g.hi) svg.append(svgEl('line', { x1: X(m), y1: Tp + 4, x2: X(m), y2: Tp + ph, class: 'mark' }))
  }
  const wrap = h('div', 'dgraph-wrap')
  // the title keeps its case: capital μ and σ would read as M and Σ
  wrap.append(h('div', 'piece-label', 'The graph'), h('div', 'graph-title', g.title), svg)
  if (g.note) wrap.append(h('p', 'tlook-cap', g.note))
  return {
    el: wrap,
    async play(alive) {
      svg.classList.add('play')
      await wait(g.kind === 'bars' ? Math.min(1400, 400 + g.xs.length * 35) : 1500)
      if (alive()) tone(semis(523.25, 14), 0, 0.12, 'sine', 0.07)
    },
  }
}
