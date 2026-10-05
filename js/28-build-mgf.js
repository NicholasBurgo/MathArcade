// js/28-build-mgf.js · World 0, level 3: where an MGF comes from
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- World 0, level 3: where an MGF comes from ----------
// Every MGF is one recipe, m_X(t) = E[e^(tX)]: e^(tx) times the pdf, added up
// (Σ for a count, ∫ for a measurement), then simplified with a few moves. The
// lines follow the class notes: the geometric's p/q script, f(x) = e^(−x), the
// exponential with β or λ, the uniform, a pdf table. \HL{…} marks what a line changed.
const R = String.raw
const hlTex = s => s.replace(/\\HL\{/g, '\\class{mg-hl}{')
const plainTex = s => s.replace(/\\HL\{/g, '{')
// the moves, coloured by kind: set up, rewrite, the sum or integral rule, tidy, check
const MOVES = {
  setup: { name: 'Set up', mv: 'mv-s', rule: R`m_X(t) = E[e^{tX}] = \sum_x e^{tx} f(x) \ \text{ or } \int e^{tx} f(x)\,dx` },
  from: { name: 'Start from', mv: 'mv-s' },
  combine: { name: 'Combine exponents', mv: 'mv-a', rule: R`e^{a}e^{b} = e^{a+b}` },
  square: { name: 'Complete the square', mv: 'mv-a' },
  diff: { name: 'Differentiate', mv: 'mv-a' },
  pull: { name: 'Pull out', mv: 'mv-b', rule: R`\begin{gathered} \textstyle\sum c\,g(x) = c\sum g(x) \\ \textstyle\int c\,g(x)\,dx = c\int g(x)\,dx \end{gathered}` },
  sub: { name: 'Swap in', mv: 'mv-b' },
  series: { name: 'Series rule', mv: 'mv-c', rule: R`\sum_{k=1}^{\infty} ar^{k-1} = \frac{a}{1-r}, \quad |r| < 1` },
  key: { name: 'Key integral', mv: 'mv-c', rule: R`\int_0^{\infty} e^{-cx}\,dx = \frac{1}{c}, \quad c > 0` },
  etx: { name: 'Integrate eᵗˣ', mv: 'mv-c', rule: R`\int_A^B e^{tx}\,dx = \frac{e^{Bt} - e^{At}}{t}, \quad t \ne 0` },
  gamma: { name: 'Gamma integral', mv: 'mv-c', rule: R`\int_0^{\infty} x^{\alpha-1}e^{-x/\beta}\,dx = \Gamma(\alpha)\beta^{\alpha}, \quad \alpha, \beta > 0` },
  one: { name: 'A pdf integrates to 1', mv: 'mv-c', rule: R`\int f(x)\,dx = 1` },
  zero: { name: 'Put in t = 0', mv: 'mv-c' },
  tidy: { name: 'Tidy up', mv: 'mv-d' },
  var: { name: 'Variance', mv: 'mv-d', rule: R`\operatorname{Var}X = E[X^2] - (E[X])^2` },
  exist: { name: 'Where it exists', mv: 'mv-e' },
  check: { name: 'Check', mv: 'mv-e', rule: R`m_X(0) = 1` },
}
const RECIPE = R`m_X(t) = E\big[e^{tX}\big] = \begin{cases} \displaystyle\sum_x e^{tx}\,f(x) & X \text{ discrete} \\[10pt] \displaystyle\int e^{tx}\,f(x)\,dx & X \text{ continuous} \end{cases}`

const TABLES = [
  { xs: [0, 1, 2], fs: ['0.2', '0.5', '0.3'] },
  { xs: [1, 2, 3], fs: ['0.1', '0.6', '0.3'] },
  { xs: [0, 1, 2, 3], fs: ['0.1', '0.2', '0.3', '0.4'] },
  { xs: [-1, 0, 1], fs: ['0.3', '0.4', '0.3'] },
  { xs: [1, 2, 3, 4], fs: ['0.4', '0.3', '0.2', '0.1'] },
  { xs: [0, 1, 2], fs: ['0.5', '0.3', '0.2'] },
  { xs: [-1, 0, 1, 2], fs: ['0.1', '0.2', '0.3', '0.4'] },
]
const PQS = [['0.1', '0.9'], ['0.2', '0.8'], ['0.25', '0.75'], ['0.3', '0.7'], ['0.4', '0.6'], ['0.6', '0.4'], ['0.7', '0.3'], ['0.75', '0.25'], ['0.8', '0.2'], ['0.9', '0.1']]
// f(x) = a formula over its total, on a few values (the notes' kind)
const FINITES = [
  { tex: 'x', w: x => x, xs: [1, 2, 3] },
  { tex: 'x', w: x => x, xs: [1, 2, 3, 4] },
  { tex: 'x + 1', w: x => x + 1, xs: [0, 1, 2] },
  { tex: '4 - x', w: x => 4 - x, xs: [0, 1, 2, 3] },
  { tex: '2x + 1', w: x => 2 * x + 1, xs: [0, 1, 2] },
  { tex: 'x^2', w: x => x * x, xs: [1, 2, 3] },
  { tex: 'x + 2', w: x => x + 2, xs: [-1, 0, 1, 2] },
]
const gcdN = (a, b) => (b ? gcdN(b, a % b) : Math.abs(a))
const UNIS = [{ a: 0, b: 2 }, { a: 0, b: 4 }, { a: 1, b: 3 }, { a: 2, b: 4 }, { a: 1, b: 5 }, { a: 0, b: 5 }]
const fmtN = v => String(+v.toFixed(6))
// e^(kt) in tex: 1, e^t, e^{-t}, e^{2t}
const eKt = k => (k === 0 ? '1' : k === 1 ? 'e^{t}' : k === -1 ? 'e^{-t}' : `e^{${fmtN(k)}t}`)
// Σ c·e^(kt) in tex, in order of k, like powers combined and zero terms dropped
function sumE(pairs) {
  const byK = new Map()
  for (const [c, k] of pairs) byK.set(k, (byK.get(k) ?? 0) + c)
  let out = ''
  for (const [k, c0] of [...byK].sort((a, b) => a[0] - b[0])) {
    const c = +c0.toFixed(6)
    if (!c) continue
    const size = Math.abs(c)
    const body = k === 0 ? fmtN(size) : (size === 1 ? '' : fmtN(size)) + eKt(k)
    out += c < 0 ? (out ? ` - ${body}` : `-${body}`) : out ? ` + ${body}` : body
  }
  return out || '0'
}

// the mean and variance from the MGF of a table: m′(0) = Σ x f(x), m″(0) = Σ x² f(x)
function momentsOfTable(xs, f) {
  const ex = xs.reduce((a, x, i) => a + x * f[i], 0), ex2 = xs.reduce((a, x, i) => a + x * x * f[i], 0)
  const v = ex2 - ex * ex
  // t = 1 put in where t = 0 belongs
  const at1 = xs.reduce((a, x, i) => a + x * f[i] * Math.exp(x), 0), at1b = xs.reduce((a, x, i) => a + x * x * f[i] * Math.exp(x), 0)
  const n = fmtN
  // a slip that lands on the right value anyway is no slip
  const differ = (right, list) => list.filter(([, val]) => Math.abs(val - right) > 1e-9).map(([t]) => t)
  return [
    { own: true, move: 'diff', tex: R`m_X'(t) = ${sumE(xs.map((x, i) => [x * f[i], x]))}`, why: 'Differentiate each term: e^(xt) gives x·e^(xt)',
      slips: [R`m_X'(t) = ${sumE(xs.map((x, i) => [f[i], x]))}`, R`m_X'(t) = ${sumE(xs.map((x, i) => [x * f[i], x - 1]))}`, R`m_X'(t) = ${sumE(xs.map((x, i) => [x * x * f[i], x]))}`] },
    { own: true, move: 'zero', tex: R`E[X] = m_X'(0) = ${n(ex)}`, why: 'At t = 0 every e is 1: this adds up x·f(x)',
      slips: differ(ex, [[R`E[X] = m_X'(0) = 1`, 1], [R`E[X] = m_X'(0) = ${n(ex2)}`, ex2], [R`E[X] = m_X'(0) = ${n(ex * ex)}`, ex * ex], [R`E[X] = m_X'(0) = 0`, 0], [R`E[X] = m_X'(1) = ${n(at1)}`, at1]]) },
    { own: true, move: 'zero', tex: R`E[X^2] = m_X''(0) = ${n(ex2)}`, why: 'Differentiate again and put in t = 0: this adds up x²·f(x)',
      slips: differ(ex2, [[R`E[X^2] = m_X''(0) = ${n(ex)}`, ex], [R`E[X^2] = m_X''(0) = ${n(ex * ex)}`, ex * ex], [R`E[X^2] = m_X''(0) = ${n(2 * ex)}`, 2 * ex], [R`E[X^2] = m_X''(0) = 1`, 1], [R`E[X^2] = m_X''(1) = ${n(at1b)}`, at1b]]) },
    { own: true, move: 'var', tex: R`\operatorname{Var}X = ${n(ex2)} - (${n(ex)})^2 = ${n(v)}`, why: 'Var = E[X²] − (E[X])². m″(0) alone is E[X²], not the variance',
      slips: differ(v, [[R`\operatorname{Var}X = m_X''(0) = ${n(ex2)}`, ex2], [R`\operatorname{Var}X = ${n(ex2)} - ${n(ex)} = ${n(ex2 - ex)}`, ex2 - ex], [R`\operatorname{Var}X = (${n(ex)})^2 - ${n(ex2)} = ${n(ex * ex - ex2)}`, ex * ex - ex2], [R`\operatorname{Var}X = ${n(ex2)} + (${n(ex)})^2 = ${n(ex2 + ex * ex)}`, ex2 + ex * ex], [R`\operatorname{Var}X = (${n(ex2)})^2 = ${n(ex2 * ex2)}`, ex2 * ex2], [R`\operatorname{Var}X = \sqrt{${n(ex2)}} = ${n(Math.sqrt(ex2))}`, Math.sqrt(ex2)]]) },
  ]
}
// the same for λ/(λ − t) (λ = 1 is the notes' 1/(1 − t)): E[X] = 1/λ, E[X²] = 2/λ², Var X = 1/λ²
function momentsOfRate(l) {
  const L = String(l), L2 = l * l, L3 = l * l * l
  const one = l === 1
  const m1 = one ? R`\frac{1}{(1-t)^2}` : R`\frac{${L}}{(${L} - t)^2}`
  const m2 = one ? R`\frac{2}{(1-t)^3}` : R`\frac{${2 * l}}{(${L} - t)^3}`
  const inv = d => (d === 1 ? '1' : R`\frac{1}{${d}}`)
  return [
    { own: true, move: 'diff', tex: R`m_X'(t) = ${m1}`, why: `Write m(t) = ${one ? '' : L}(${L} − t)^(−1): the power comes down, times −1 from inside`,
      slips: one ? [R`m_X'(t) = \frac{1}{1-t}`, R`m_X'(t) = -\frac{1}{(1-t)^2}`, R`m_X'(t) = \frac{2}{(1-t)^3}`] : [R`m_X'(t) = \frac{1}{(${L} - t)^2}`, R`m_X'(t) = -\frac{${L}}{(${L} - t)^2}`, R`m_X'(t) = \frac{${L}}{${L} - t}`] },
    { own: true, move: 'zero', tex: R`E[X] = m_X'(0) = ${inv(l)}`, why: 'Put in t = 0',
      slips: one ? [R`E[X] = m_X'(0) = 0`, R`E[X] = m_X'(0) = 2`, R`E[X] = m_X'(0) = -1`] : [R`E[X] = m_X'(0) = ${L}`, R`E[X] = m_X'(0) = \frac{1}{${L2}}`, R`E[X] = m_X'(0) = 1`] },
    { own: true, move: 'diff', tex: R`m_X''(t) = ${m2}`, why: 'Again: the −2 comes down, times −1 from inside',
      slips: one ? [R`m_X''(t) = \frac{1}{(1-t)^3}`, R`m_X''(t) = \frac{2}{(1-t)^2}`, R`m_X''(t) = -\frac{2}{(1-t)^3}`] : [R`m_X''(t) = \frac{${L}}{(${L} - t)^3}`, R`m_X''(t) = \frac{2}{(${L} - t)^3}`, R`m_X''(t) = \frac{${2 * l}}{(${L} - t)^2}`] },
    { own: true, move: 'zero', tex: R`E[X^2] = m_X''(0) = ${one ? '2' : R`\frac{2}{${L2}}`}`, why: 'Put in t = 0',
      slips: one ? [R`E[X^2] = m_X''(0) = 1`, R`E[X^2] = m_X''(0) = 4`, R`E[X^2] = m_X''(0) = 0`] : [R`E[X^2] = m_X''(0) = \frac{1}{${L2}}`, R`E[X^2] = m_X''(0) = \frac{2}{${L}}`, R`E[X^2] = m_X''(0) = \frac{4}{${L2}}`] },
    { own: true, move: 'var', tex: one ? R`\operatorname{Var}X = 2 - 1^2 = 1` : R`\operatorname{Var}X = \frac{2}{${L2}} - \Big(\frac{1}{${L}}\Big)^2 = \frac{1}{${L2}}`, why: 'Var = E[X²] − (E[X])². m″(0) alone is E[X²], not the variance',
      slips: one ? [R`\operatorname{Var}X = m_X''(0) = 2`, R`\operatorname{Var}X = 1^2 - 2 = -1`, R`\operatorname{Var}X = 2 + 1^2 = 3`] : [R`\operatorname{Var}X = m_X''(0) = \frac{2}{${L2}}`, R`\operatorname{Var}X = \frac{1}{${L}}`, R`\operatorname{Var}X = \frac{3}{${L2}}`] },
  ]
}

// Each build: its pdf, the lines after "m_X(t) =" (with the move each one makes,
// why, and the slips a question offers instead), and where the MGF exists.
const BUILDS = {
  table(n = TABLES[0]) {
    const { xs, fs } = n
    const f = fs.map(Number)
    const ex = xs.reduce((s, x, i) => s + x * f[i], 0)
    return {
      name: 'A pdf table',
      pdf: R`\begin{array}{c|${'c'.repeat(xs.length)}} x & ${xs.join(' & ')} \\ \hline f(x) & ${fs.join(' & ')} \end{array}`,
      lead0: R`m_X(t) &= \sum_x e^{tx} f(x) = `,
      lines: [
        { move: 'setup', tex: xs.map((x, i) => R`\HL{e^{${x}t}}(${fs[i]})`).join(' + '), why: 'One term per column: e^(xt) times f(x)',
          slips: [xs.map(x => `e^{${x}t}`).join(' + '), xs.map((x, i) => `${x}(${fs[i]})`).join(' + '), xs.map((x, i) => `e^{${fs[i]}t}(${x})`).join(' + '), xs.map((x, i) => `e^{t}(${fs[i]})`).join(' + ')] },
        { move: 'tidy', tex: sumE(xs.map((x, i) => [f[i], x])), why: [[0, 'e^(0t) = 1'], [1, 'e^(1t) = e^t'], [-1, 'e^(−1t) = e^(−t)']].filter(([x]) => xs.includes(x)).map(([, w]) => w).join(' and '),
          slips: [sumE(xs.map(x => [1, x])), sumE(xs.map((x, i) => [x * f[i], x])), sumE(xs.map((x, i) => [f[i], x + 1])), ex ? eKt(ex) : null].filter(Boolean) },
      ],
      check: { tex: R`m_X(0) = ${fs.join(' + ')} = 1`, why: 'At t = 0 every term’s e is 1, so they add to 1' },
      use: momentsOfTable(xs, f),
    }
  },
  formula(n = FINITES[0]) {
    const { xs, w } = n
    const S = xs.reduce((s, x) => s + w(x), 0)
    const M = xs.reduce((s, x) => s + x * w(x), 0), g = gcdN(M, S)
    const top = sumE(xs.map(x => [w(x), x]))
    // e^(E[X] t): the mean pulled inside the exponential
    const atMean = M / g === 1 && S / g === 1 ? 'e^{t}' : S / g === 1 ? `e^{${M / g}t}` : `e^{${M / g}t/${S / g}}`
    return {
      name: 'A pdf formula on a few values',
      pdf: R`f(x) = \frac{${n.tex}}{${S}}, \quad x = ${xs.join(', ')}`,
      lead0: R`m_X(t) &= \sum_x e^{tx} f(x) = `,
      lines: [
        { move: 'setup', tex: xs.map(x => R`\HL{e^{${x}t}}\cdot\frac{${w(x)}}{${S}}`).join(' + '), why: `List the values first: ${xs.map(x => `f(${x}) = ${w(x)}/${S}`).join(', ')}. Then one term per value`,
          slips: [xs.map(x => R`e^{${x}t}\cdot\frac{1}{${xs.length}}`).join(' + '), xs.map(x => R`${x}\cdot\frac{${w(x)}}{${S}}`).join(' + '), xs.map(x => R`e^{t}\cdot\frac{${w(x)}}{${S}}`).join(' + '), ...(xs.some(x => w(x) !== x) ? [xs.map(x => R`e^{${w(x)}t}\cdot\frac{${x}}{${S}}`).join(' + ')] : [])] },
        { move: 'tidy', tex: R`\frac{${top}}{${S}}`, why: `One fraction: ${S} is the common denominator`,
          slips: [top, R`\frac{${sumE(xs.map(x => [x * w(x), x]))}}{${S}}`, M ? atMean : R`\frac{${sumE(xs.map(x => [1, x]))}}{${xs.length}}`, R`\frac{${sumE(xs.map(x => [w(x), x + 1]))}}{${S}}`] },
      ],
      check: { tex: R`m_X(0) = \frac{${xs.map(w).join(' + ')}}{${S}} = 1`, why: 'At t = 0 every e is 1, so the terms add to 1' },
    }
  },
  geo() {
    return {
      name: 'Geometric',
      pdf: R`f(x) = q^{x-1}p, \quad x = 1, 2, 3, \ldots`,
      lines: [
        { move: 'setup', tex: R`\sum_{x=1}^{\infty} \HL{e^{tx}}\,q^{x-1}p`, why: 'e^(tx) times the pdf, summed over x = 1, 2, 3, …',
          slips: [R`\sum_{x=1}^{\infty} x\,q^{x-1}p`, R`\int_1^{\infty} e^{tx}\,q^{x-1}p\,dx`, R`\sum_{x=1}^{\infty} e^{t}\,q^{x-1}p`, R`\sum_{x=0}^{\infty} e^{tx}\,q^{x-1}p`] },
        { move: 'pull', tex: R`\HL{\frac{p}{q}}\sum_{x=1}^{\infty} \HL{(qe^t)^x}`, why: 'e^(tx)q^(x−1)p = (p/q)(qe^t)^x, so pull out p/q',
          slips: [R`p\sum_{x=1}^{\infty} (qe^t)^x`, R`pq\sum_{x=1}^{\infty} (qe^t)^x`, R`\frac{p}{q}\sum_{x=1}^{\infty} (q + e^t)^x`, R`\frac{p}{q}\sum_{x=1}^{\infty} (pe^t)^x`] },
        { move: 'series', tex: R`\frac{p}{q}\cdot\HL{\frac{qe^t}{1 - qe^t}}`, why: 'Series rule a/(1 − r), with a = r = qe^t',
          slips: [R`\frac{p}{q}\cdot\frac{1}{1 - qe^t}`, R`\frac{p}{q}\cdot\frac{qe^t}{1 - e^t}`, R`\frac{p}{q}\cdot\frac{e^t}{1 - qe^t}`, R`\frac{p}{q}\cdot\frac{qe^t}{1 + qe^t}`] },
        { move: 'tidy', tex: R`\frac{pe^t}{1 - qe^t}`, why: 'The q’s cancel',
          slips: [R`\frac{p}{1 - qe^t}`, R`\frac{pe^t}{1 - pe^t}`, R`\frac{qe^t}{1 - pe^t}`, R`\frac{e^t}{1 - qe^t}`] },
      ],
      exist: { upto: 2, tex: R`t < -\ln q`, why: 'The series needs r = qe^t < 1, so t < −ln q', slips: [R`t > -\ln q`, R`t < \ln q`, R`t < q`, R`t < 1`] },
    }
  },
  geoN([P, Q] = PQS[2]) {
    return {
      name: `Geometric, p = ${P}`,
      pdf: R`f(x) = (${Q})^{x-1}(${P}), \quad x = 1, 2, 3, \ldots`,
      lines: [
        { move: 'setup', tex: R`\sum_{x=1}^{\infty} \HL{e^{tx}}(${Q})^{x-1}(${P})`, why: 'e^(tx) times the pdf, summed over x = 1, 2, 3, …',
          slips: [R`\sum_{x=1}^{\infty} x(${Q})^{x-1}(${P})`, R`\int_1^{\infty} e^{tx}(${Q})^{x-1}(${P})\,dx`, R`\sum_{x=1}^{\infty} e^{t}(${Q})^{x-1}(${P})`, R`\sum_{x=0}^{\infty} e^{tx}(${Q})^{x-1}(${P})`] },
        { move: 'pull', moveOK: false, tex: R`\HL{${P}e^t}\sum_{x=1}^{\infty} \HL{(${Q}e^t)^{x-1}}`, why: `e^(tx)(${Q})^(x−1) = e^t(${Q}e^t)^(x−1), so pull out ${P}e^t`,
          slips: [R`${P}\sum_{x=1}^{\infty} (${Q}e^t)^{x-1}`, R`${P}e^t\sum_{x=1}^{\infty} (${P}e^t)^{x-1}`, R`${P}e^t\sum_{x=1}^{\infty} (${Q} + e^t)^{x-1}`, R`${Q}e^t\sum_{x=1}^{\infty} (${P}e^t)^{x-1}`] },
        { move: 'series', tex: R`${P}e^t\cdot\HL{\frac{1}{1 - ${Q}e^t}}`, why: `Series rule a/(1 − r), with a = 1 and r = ${Q}e^t`,
          slips: [R`${P}e^t\cdot\frac{${Q}e^t}{1 - ${Q}e^t}`, R`${P}e^t\cdot\frac{1}{1 - ${P}e^t}`, R`${P}e^t\cdot\frac{1}{1 + ${Q}e^t}`, R`${P}e^t\cdot(1 - ${Q}e^t)`] },
        { move: 'tidy', tex: R`\frac{${P}e^t}{1 - ${Q}e^t}`, why: 'One fraction',
          slips: [R`\frac{${P}}{1 - ${Q}e^t}`, R`\frac{${P}e^t}{1 - ${P}e^t}`, R`\frac{e^t}{1 - ${Q}e^t}`, R`\frac{${Q}e^t}{1 - ${P}e^t}`] },
      ],
      exist: { upto: 2, tex: R`t < -\ln ${Q}`, why: `The series needs r = ${Q}e^t < 1, so t < −ln ${Q}`, slips: [R`t > -\ln ${Q}`, R`t < \ln ${Q}`, R`t < ${Q}`, R`t < 1`] },
    }
  },
  series0([P, Q] = PQS[2]) {
    return {
      name: 'A series from x = 0',
      pdf: R`f(x) = ${P}(${Q})^x, \quad x = 0, 1, 2, \ldots`,
      lines: [
        { move: 'setup', tex: R`\sum_{x=0}^{\infty} \HL{e^{tx}}(${P})(${Q})^x`, why: 'e^(tx) times the pdf, summed over x = 0, 1, 2, …',
          slips: [R`\sum_{x=0}^{\infty} x(${P})(${Q})^x`, R`\int_0^{\infty} e^{tx}(${P})(${Q})^x\,dx`, R`\sum_{x=0}^{\infty} e^{t}(${P})(${Q})^x`, R`\sum_{x=1}^{\infty} e^{tx}(${P})(${Q})^x`] },
        { move: 'pull', tex: R`\HL{${P}}\sum_{x=0}^{\infty} \HL{(${Q}e^t)^x}`, why: `e^(tx)(${Q})^x = (${Q}e^t)^x, so pull out ${P}`,
          slips: [R`${P}\sum_{x=0}^{\infty} (${P}e^t)^x`, R`${P}e^t\sum_{x=0}^{\infty} (${Q}e^t)^x`, R`${P}\sum_{x=0}^{\infty} (${Q} + e^t)^x`, R`${Q}\sum_{x=0}^{\infty} (${P}e^t)^x`] },
        { move: 'series', tex: R`\frac{${P}}{1 - ${Q}e^t}`, why: `Series rule a/(1 − r): first term 1, r = ${Q}e^t, then times ${P}`,
          slips: [R`\frac{${P}e^t}{1 - ${Q}e^t}`, R`\frac{${P}}{1 - ${P}e^t}`, R`\frac{1}{1 - ${Q}e^t}`, R`\frac{${P}}{1 + ${Q}e^t}`] },
      ],
      exist: { upto: 2, tex: R`t < -\ln ${Q}`, why: `The series needs r = ${Q}e^t < 1, so t < −ln ${Q}`, slips: [R`t > -\ln ${Q}`, R`t < \ln ${Q}`, R`t < ${Q}`, R`t < 1`] },
    }
  },
  e1() {
    return {
      name: 'f(x) = e^(−x), the notes',
      pdf: R`f(x) = e^{-x}, \quad x > 0`,
      lines: [
        { move: 'setup', tex: R`\int_0^{\infty} \HL{e^{tx}}\,e^{-x}\,dx`, why: 'e^(tx) times the pdf, integrated over x > 0',
          slips: [R`\int_0^{\infty} e^{tx}\,dx`, R`\int_0^{\infty} x\,e^{-x}\,dx`, R`\int_0^{\infty} e^{t}\,e^{-x}\,dx`, R`\sum_{x=0}^{\infty} e^{tx}\,e^{-x}`, R`\int_{-\infty}^{0} e^{tx}\,e^{-x}\,dx`] },
        { move: 'combine', tex: R`\int_0^{\infty} e^{\HL{-(1-t)x}}\,dx`, why: 'Same base, so add the exponents: tx − x = −(1 − t)x',
          slips: [R`\int_0^{\infty} e^{-tx^2}\,dx`, R`\int_0^{\infty} e^{-(1+t)x}\,dx`, R`\int_0^{\infty} e^{(1+t)x}\,dx`, R`\int_0^{\infty} e^{-x/t}\,dx`] },
        { move: 'key', tex: R`\frac{1}{1-t}`, why: 'Key integral with c = 1 − t',
          slips: [R`\frac{1}{t-1}`, R`\frac{1}{1+t}`, R`1-t`, R`\frac{t}{1-t}`] },
      ],
      exist: { upto: 2, tex: R`t < 1`, why: 'The key integral needs c = 1 − t > 0', slips: [R`t > 1`, R`t \ne 1`, R`t < 0`, R`t > 0`] },
      use: momentsOfRate(1),
    }
  },
  expB(n = null) {
    const B = n ? String(n.b) : R`{\beta}`, Bt = n ? n.b : 'β'
    return {
      name: n ? `Exponential, β = ${n.b}` : 'Exponential (β)',
      pdf: R`f(x) = \frac{1}{${B}}e^{-x/${B}}, \quad x > 0`,
      lines: [
        { move: 'setup', tex: R`\int_0^{\infty} \HL{e^{tx}}\,\frac{1}{${B}}e^{-x/${B}}\,dx`, why: 'e^(tx) times the pdf, integrated over x > 0',
          slips: [R`\int_0^{\infty} x\,\frac{1}{${B}}e^{-x/${B}}\,dx`, R`\int_0^{\infty} e^{tx}\,dx`, R`\int_0^{${B}} e^{tx}\,\frac{1}{${B}}e^{-x/${B}}\,dx`, R`\sum_{x=0}^{\infty} e^{tx}\,\frac{1}{${B}}e^{-x/${B}}`] },
        { move: 'combine', moveOK: false, tex: R`\HL{\frac{1}{${B}}}\int_0^{\infty} e^{\HL{-(1/${B} - t)x}}\,dx`, why: `Pull out 1/${Bt}; then tx − x/${Bt} = −(1/${Bt} − t)x`,
          slips: [R`\frac{1}{${B}}\int_0^{\infty} e^{-(${B} - t)x}\,dx`, R`\frac{1}{${B}}\int_0^{\infty} e^{-(1/${B} + t)x}\,dx`, R`\frac{1}{${B}}\int_0^{\infty} e^{-tx^2/${B}}\,dx`, R`${B}\int_0^{\infty} e^{-(1/${B} - t)x}\,dx`] },
        { move: 'key', tex: R`\frac{1}{${B}}\cdot\HL{\frac{1}{1/${B} - t}}`, why: `Key integral with c = 1/${Bt} − t`,
          slips: [R`\frac{1}{${B}}\cdot\frac{1}{t - 1/${B}}`, R`\frac{1}{${B}}\cdot\Big(\frac{1}{${B}} - t\Big)`, R`\frac{1}{${B}}\cdot\frac{1}{1/${B} + t}`, R`\frac{1}{${B}}\cdot\frac{1}{${B} - t}`] },
        { move: 'tidy', tex: R`\frac{1}{1 - ${B}t}`, why: `Multiply the top and bottom by ${Bt}`,
          slips: [R`\frac{${B}}{1 - ${B}t}`, R`\frac{1}{1 - t/${B}}`, R`\frac{1}{1 + ${B}t}`, R`\frac{1}{${B} - t}`] },
      ],
      exist: { upto: 2, tex: R`t < \frac{1}{${B}}`, why: `The key integral needs c = 1/${Bt} − t > 0`, slips: [R`t > \frac{1}{${B}}`, R`t < ${B}`, R`t \ne \frac{1}{${B}}`, R`t < 0`] },
    }
  },
  expL(n = null) {
    const L = n ? String(n.l) : R`{\lambda}`, Lt = n ? n.l : 'λ'
    return {
      name: n ? `Exponential, λ = ${n.l}` : 'Exponential (λ)',
      pdf: R`f(x) = ${L}e^{-${L}x}, \quad x > 0`,
      // λ/(λ − t) is how the notes leave it, so that is the answer to "find the MGF"
      final: 2,
      lines: [
        { move: 'setup', tex: R`\int_0^{\infty} \HL{e^{tx}}\,${L}e^{-${L}x}\,dx`, why: 'e^(tx) times the pdf, integrated over x > 0',
          slips: [R`\int_0^{\infty} x\,${L}e^{-${L}x}\,dx`, R`\int_0^{\infty} e^{tx}\,dx`, R`\int_0^{\infty} e^{t}\,${L}e^{-${L}x}\,dx`, R`\sum_{x=0}^{\infty} e^{tx}\,${L}e^{-${L}x}`] },
        { move: 'combine', moveOK: false, tex: R`\HL{${L}}\int_0^{\infty} e^{\HL{-(${L} - t)x}}\,dx`, why: `Pull out ${Lt}; then tx − ${Lt}x = −(${Lt} − t)x`,
          slips: [R`${L}\int_0^{\infty} e^{-(${L} + t)x}\,dx`, R`${L}\int_0^{\infty} e^{-${L}tx^2}\,dx`, R`${L}\int_0^{\infty} e^{(${L} + t)x}\,dx`, R`\int_0^{\infty} e^{-(${L} + t)x}\,dx`] },
        { move: 'key', tex: R`\frac{${L}}{${L} - t}`, why: `Key integral with c = ${Lt} − t, times the ${Lt} in front`,
          slips: [R`\frac{1}{${L} - t}`, R`\frac{${L}}{${L} + t}`, R`\frac{1}{1 - ${L}t}`, R`\frac{${L}}{t - ${L}}`] },
        { move: 'tidy', tex: R`\frac{1}{1 - t/${L}}`, why: `Divide the top and bottom by ${Lt}: the 1/(1 − βt) shape, with β = 1/${Lt}`,
          slips: [R`\frac{1}{1 - ${L}t}`, R`\frac{${L}}{1 - t}`, R`\frac{1}{${L} - t}`, R`\frac{1}{1 + t/${L}}`] },
      ],
      exist: { upto: 2, tex: R`t < ${L}`, why: `The key integral needs c = ${Lt} − t > 0`, slips: [R`t > ${L}`, R`t < \frac{1}{${L}}`, R`t \ne ${L}`, R`t < 0`] },
      use: n ? momentsOfRate(n.l) : undefined,
    }
  },
  uni(n = null) {
    const A = n ? String(n.a) : 'A', B = n ? String(n.b) : 'B'
    const W = n ? String(n.b - n.a) : 'B-A', Wp = n ? W : '(B-A)'
    const Wt = n ? `${n.b - n.a}t` : '(B-A)t'
    const eb = n ? eKt(n.b) : 'e^{Bt}', ea = n ? eKt(n.a) : 'e^{At}'
    return {
      name: n ? `Uniform on [${n.a}, ${n.b}]` : 'Uniform on [A, B]',
      pdf: R`f(x) = \frac{1}{${W}}, \quad ${A} \le x \le ${B}`,
      lines: [
        { move: 'setup', tex: R`\int_{${A}}^{${B}} \HL{e^{tx}}\,\frac{1}{${W}}\,dx`, why: `e^(tx) times the pdf, integrated from ${A} to ${B}`,
          slips: [R`\int_{${A}}^{${B}} x\,\frac{1}{${W}}\,dx`, R`\int_0^{\infty} e^{tx}\,\frac{1}{${W}}\,dx`, R`\int_{${A}}^{${B}} e^{t}\,\frac{1}{${W}}\,dx`, R`\sum_{x=${A}}^{${B}} e^{tx}\,\frac{1}{${W}}`] },
        { move: 'pull', tex: R`\HL{\frac{1}{${W}}}\int_{${A}}^{${B}} e^{tx}\,dx`, why: 'Pull the constant out front',
          slips: [R`${Wp}\int_{${A}}^{${B}} e^{tx}\,dx`, R`\frac{1}{${W}}\int_{${A}}^{${B}} e^{x}\,dx`, R`\frac{1}{${W}}\int_{${A}}^{${B}} e^{t}\,dx`] },
        { move: 'etx', tex: R`\frac{1}{${W}}\cdot\HL{\frac{${eb} - ${ea}}{t}}`, why: `e^(tx) integrates to e^(tx)/t (t ≠ 0); put in ${B}, take away ${A}`,
          slips: [R`\frac{1}{${W}}\cdot\frac{${ea} - ${eb}}{t}`, R`\frac{1}{${W}}\cdot(${eb} - ${ea})`, R`\frac{1}{${W}}\cdot t(${eb} - ${ea})`, R`\frac{1}{${W}}\cdot\frac{${eb} - ${ea}}{t^2}`] },
        { move: 'tidy', tex: R`\frac{${eb} - ${ea}}{${Wt}}`, why: 'One fraction',
          slips: [R`\frac{${eb} - ${ea}}{${W}}`, R`\frac{${ea} - ${eb}}{${Wt}}`, R`\frac{${eb} - ${ea}}{t^2}`, R`\frac{${eb} - ${ea}}{${W} + t}`] },
      ],
      exist: { upto: 2, tex: R`\text{every } t`, why: 'A finite interval: nothing blows up. (The final formula has t below, but at t = 0 the MGF is just 1.)', slips: [R`t > 0`, R`t < \frac{1}{${W}}`, R`t < ${B}`, R`t < 0`] },
    }
  },
  moments() {
    return {
      name: 'Then use it: the mean and variance',
      pdf: R`m_X(t) = \frac{1}{1 - \beta t} \ \text{(exponential)}`,
      strip: false,
      lines: [
        { move: 'tidy', own: true, tex: R`m_X(t) = \frac{1}{1-\beta t} = \HL{(1-\beta t)^{-1}}`, why: 'Write it as a power' },
        { move: 'diff', own: true, tex: R`m_X'(t) = -1(1-\beta t)^{-2}\cdot(-\beta) = \HL{\beta(1-\beta t)^{-2}}`, why: 'Chain rule: the power comes down, times −β from inside' },
        { move: 'zero', own: true, tex: R`m_X'(0) = \HL{\beta} = E[X]`, why: 'At t = 0 the base is 1, and m′(0) = E[X]' },
        { move: 'diff', own: true, tex: R`m_X''(t) = -2\beta(1-\beta t)^{-3}\cdot(-\beta) = \HL{2\beta^2(1-\beta t)^{-3}}`, why: 'Again: the −2 comes down, times −β' },
        { move: 'zero', own: true, tex: R`m_X''(0) = \HL{2\beta^2} = E[X^2]`, why: 'At t = 0 the base is 1, and m″(0) = E[X²]' },
        { move: 'var', own: true, tex: R`\operatorname{Var}X = m_X''(0) - [m_X'(0)]^2 = 2\beta^2 - \beta^2 = \HL{\beta^2}`, why: 'Var = E[X²] − (E[X])²' },
      ],
    }
  },
  gamma() {
    return {
      name: 'Gamma',
      pdf: R`f(x) = \frac{x^{\alpha-1}e^{-x/\beta}}{\Gamma(\alpha)\beta^{\alpha}}, \quad x > 0`,
      lines: [
        { move: 'setup', tex: R`\int_0^{\infty} \HL{e^{tx}}\,\frac{x^{\alpha-1}e^{-x/\beta}}{\Gamma(\alpha)\beta^{\alpha}}\,dx`, why: 'e^(tx) times the pdf, integrated over x > 0',
          slips: [R`\int_0^{\infty} e^{t}\,\frac{x^{\alpha-1}e^{-x/\beta}}{\Gamma(\alpha)\beta^{\alpha}}\,dx`, R`\int_0^{\infty} x\,\frac{x^{\alpha-1}e^{-x/\beta}}{\Gamma(\alpha)\beta^{\alpha}}\,dx`, R`\sum_{x=0}^{\infty} e^{tx}\,\frac{x^{\alpha-1}e^{-x/\beta}}{\Gamma(\alpha)\beta^{\alpha}}`, R`\int_0^{\infty} e^{tx}\,x^{\alpha-1}e^{-x/\beta}\,dx`] },
        { move: 'combine', tex: R`\HL{\frac{1}{\Gamma(\alpha)\beta^{\alpha}}}\int_0^{\infty} x^{\alpha-1}e^{\HL{-x(1-\beta t)/\beta}}\,dx`, why: 'Pull out the constant; then tx − x/β = −x(1 − βt)/β',
          slips: [R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\int_0^{\infty} x^{\alpha-1}e^{-x(1+\beta t)/\beta}\,dx`, R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\int_0^{\infty} x^{\alpha-1}e^{-x(1-t)/\beta}\,dx`, R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\int_0^{\infty} x^{\alpha}e^{-x(1-\beta t)/\beta}\,dx`, R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\int_0^{\infty} x^{\alpha-1}e^{-tx^2/\beta}\,dx`] },
        { move: 'gamma', tex: R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\cdot\HL{\Gamma(\alpha)\Big(\frac{\beta}{1-\beta t}\Big)^{\alpha}}`, why: 'Gamma integral, with β/(1 − βt) in the place of β',
          slips: [R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\cdot\Gamma(\alpha)\beta^{\alpha}`, R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\cdot\Gamma(\alpha)\Big(\frac{1-\beta t}{\beta}\Big)^{\alpha}`, R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\cdot\Gamma(\alpha+1)\Big(\frac{\beta}{1-\beta t}\Big)^{\alpha}`, R`\frac{1}{\Gamma(\alpha)\beta^{\alpha}}\cdot\Gamma(\alpha)\Big(\frac{\beta}{1+\beta t}\Big)^{\alpha}`] },
        { move: 'tidy', tex: R`\Big(\frac{1}{1-\beta t}\Big)^{\alpha} = \HL{(1-\beta t)^{-\alpha}}`, why: 'Γ(α) cancels, and so does β^α',
          slips: [R`\Big(\frac{1}{1-\beta t}\Big)^{\alpha} = (1-\beta t)^{\alpha}`, R`\Big(\frac{1}{1+\beta t}\Big)^{\alpha} = (1+\beta t)^{-\alpha}`, R`\Big(\frac{\beta}{1-\beta t}\Big)^{\alpha} = \beta^{\alpha}(1-\beta t)^{-\alpha}`, R`\Big(\frac{1}{1-t/\beta}\Big)^{\alpha} = (1-t/\beta)^{-\alpha}`] },
      ],
      exist: { upto: 2, tex: R`t < \frac{1}{\beta}`, why: 'β/(1 − βt) must be positive: 1 − βt > 0', slips: [R`t > \frac{1}{\beta}`, R`t < \beta`, R`t \ne \frac{1}{\beta}`, R`t < 0`] },
      // then the notes' next example: the mean and variance from this MGF
      use: [
        { own: true, move: 'diff', tex: R`m_X'(t) = \alpha\beta(1-\beta t)^{-\alpha-1}`, why: 'The power −α comes down, times −β from inside',
          slips: [R`m_X'(t) = -\alpha\beta(1-\beta t)^{-\alpha-1}`, R`m_X'(t) = \alpha(1-\beta t)^{-\alpha-1}`, R`m_X'(t) = \alpha\beta(1-\beta t)^{-\alpha+1}`] },
        { own: true, move: 'zero', tex: R`E[X] = m_X'(0) = \alpha\beta`, why: 'Put in t = 0: the base is 1',
          slips: [R`E[X] = m_X'(0) = \alpha`, R`E[X] = m_X'(0) = \beta`, R`E[X] = m_X'(0) = \alpha\beta^2`] },
        { own: true, move: 'diff', tex: R`m_X''(t) = \alpha(\alpha+1)\beta^2(1-\beta t)^{-\alpha-2}`, why: 'Again: −(α + 1) comes down, times −β from inside',
          slips: [R`m_X''(t) = \alpha(\alpha+1)\beta(1-\beta t)^{-\alpha-2}`, R`m_X''(t) = \alpha^2\beta^2(1-\beta t)^{-\alpha-2}`, R`m_X''(t) = \alpha(\alpha-1)\beta^2(1-\beta t)^{-\alpha-2}`] },
        { own: true, move: 'zero', tex: R`E[X^2] = m_X''(0) = \alpha(\alpha+1)\beta^2`, why: 'Put in t = 0',
          slips: [R`E[X^2] = m_X''(0) = \alpha^2\beta^2`, R`E[X^2] = m_X''(0) = \alpha(\alpha+1)\beta`, R`E[X^2] = m_X''(0) = \alpha\beta^2`] },
        { own: true, move: 'var', tex: R`\operatorname{Var}X = \alpha(\alpha+1)\beta^2 - (\alpha\beta)^2 = \alpha\beta^2`, why: 'Var = E[X²] − (E[X])²: the α²β² cancels',
          slips: [R`\operatorname{Var}X = m_X''(0) = \alpha(\alpha+1)\beta^2`, R`\operatorname{Var}X = \alpha^2\beta^2`, R`\operatorname{Var}X = \alpha\beta`] },
      ],
    }
  },
  chi() {
    return {
      name: 'Chi-squared',
      strip: false,
      pdf: R`\chi^2 \text{ with } \gamma \text{ degrees of freedom} = \text{gamma with } \alpha = \tfrac{\gamma}{2},\ \beta = 2`,
      lead0: R`m_X(t) &= `,
      lines: [
        { move: 'from', tex: R`(1 - \beta t)^{-\alpha}`, why: 'Start from the gamma MGF' },
        { move: 'sub', tex: R`(1 - \HL{2}t)^{-\HL{\gamma/2}}`, why: 'Put in β = 2 and α = γ/2' },
      ],
      exist: { upto: 2, tex: R`t < \frac{1}{2}`, why: 'Needs 1 − 2t > 0' },
    }
  },
  normal() {
    return {
      name: 'Normal',
      pdf: R`f(x) = \frac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\mu)^2/(2\sigma^2)}`,
      lines: [
        { move: 'setup', tex: R`\int_{-\infty}^{\infty} \HL{e^{tx}}\,\frac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\mu)^2/(2\sigma^2)}\,dx`, why: 'e^(tx) times the pdf, integrated over every x' },
        { move: 'square', tex: R`\HL{e^{\mu t + \sigma^2t^2/2}}\int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\HL{(\mu+\sigma^2t)})^2/(2\sigma^2)}\,dx`, why: 'Complete the square in the exponent: tx − (x − μ)²/(2σ²) = μt + σ²t²/2 − (x − μ − σ²t)²/(2σ²)' },
        { move: 'one', tex: R`e^{\mu t + \sigma^2t^2/2}\cdot\HL{1}`, why: 'What is left is a normal pdf (mean μ + σ²t), and a pdf integrates to 1' },
      ],
      exist: { upto: 3, tex: R`\text{every } t`, why: 'Nothing blows up' },
    }
  },
}
// the builds a question can use, with numbers or letters (not series0: a pdf from x = 0
// is not the course's geometric, and no quiz or homework problem has one)
const MGF_BUILDS = [
  () => BUILDS.table(pickOne(TABLES)),
  () => BUILDS.geo(),
  () => BUILDS.geoN(pickOne(PQS)),
  () => BUILDS.e1(),
  () => BUILDS.expB(Math.random() < 0.5 ? null : { b: pickOne([2, 3, 4, 5, 10]) }),
  () => BUILDS.expL(Math.random() < 0.5 ? null : { l: pickOne([2, 3, 5]) }),
  () => BUILDS.uni(Math.random() < 0.5 ? null : pickOne(UNIS)),
  () => BUILDS.gamma(),
]
// "X has this MGF: which distribution?", answered from World 0's list, with the MGF read on a right answer
const mgfName = () => treeProblem(pickOne(MGF_LEAVES), true, { mgf: true })
const firstLead = b => b.lead0 ?? R`m_X(t) &= E[e^{tX}] = `
// a row's chip: its own label (a derivation's "Independence"), else its move's
const chipOf = r => ({ name: r.label ?? MOVES[r.move]?.name ?? 'Step', mv: MOVES[r.move]?.mv ?? 'mv-b' })
// a build as rows: each line (the first after its "m_X(t) = E[e^(tX)] ="), then where it exists
const rowsOf = b => [
  ...b.lines.map((l, i) => ({ ...l, kind: 'line', i, right: plainTex(l.tex), show: l.own ? l.tex : (i === 0 ? firstLead(b) : '= ').replace('&', '') + l.tex })),
  ...(b.exist ? [{ move: 'exist', kind: 'exist', right: b.exist.tex, slips: b.exist.slips, show: R`m_X(t) \text{ exists for } ${b.exist.tex}`, why: b.exist.why }] : []),
  ...(b.check ? [{ move: 'check', kind: 'check', show: b.check.tex, why: b.check.why }] : []),
  // then use it: the mean and variance from the MGF just built
  ...(b.use ?? []).map(l => ({ ...l, kind: 'use', right: plainTex(l.tex), show: l.tex })),
]

// A question: a pdf, and its MGF to build. Each line is asked in turn among the usual
// slips; the right line goes in either way, with its move and why, so the build is
// always whole. Every step right first time counts as right.
const mgfBuildProblem = (make = pickOne(MGF_BUILDS), b = make()) => ({
  another: () => mgfBuildProblem(make),
  // discrete: a table, or a pdf listed on its values (x = −1, 0, 1, 2 too)
  start: /\\begin\{array\}|x = -?\d/.test(b.pdf)
    ? 'Multiply each f(x) by e^(tx), then add them all up: X takes separate values, so it is a sum Σ.'
    : 'Multiply f(x) by e^(tx), then integrate over where f(x) isn’t 0. Then simplify.',
  ask: `Find ${b.exist ? 'the MGF \\(m_X(t) = E\\big[e^{tX}\\big]\\) of this pdf, and say for which \\(t\\) it exists' : '\\(m_X(t) = E\\big[e^{tX}\\big]\\) for this pdf'}${b.use ? ', then use it for E[X] and Var X' : ''}.`,
  latex: b.pdf,
  buildIt: true,
  mgf: { build: b, at: null },
})
// a round shaped like the test (study guide and notes): the geometric MGF; e^(−x) or an
// exponential, then its mean and variance; one more continuous or a pdf table; the gamma,
// then its mean and variance; and one MGF to name. Longer rounds add random builds.
const MGF_SLOTS = [
  () => (Math.random() < 0.5 ? BUILDS.geo() : BUILDS.geoN(pickOne(PQS))),
  () => (Math.random() < 0.5 ? BUILDS.e1() : BUILDS.expL({ l: pickOne([2, 3, 5]) })),
  () => pickOne([() => BUILDS.expB(Math.random() < 0.5 ? null : { b: pickOne([2, 3, 4, 5, 10]) }), () => BUILDS.uni(Math.random() < 0.5 ? null : pickOne(UNIS)), () => BUILDS.table(pickOne(TABLES))])(),
  () => BUILDS.gamma(),
]
function mgfRound(n) {
  const builds = MGF_SLOTS.slice(0, Math.max(0, n - 1)).map(make => mgfBuildProblem(make))
  while (builds.length < n - 1) builds.push(mgfBuildProblem())
  return shuffleArr([...builds, mgfName()])
}
// A build asked a line at a time: an MGF from its pdf, or (from the engine) a pdf
// derived the way the test writes it. Lines with slips are asked in order, up to the
// build's final line; the others are shown as they come. The right line goes in after
// every pick, so the build always ends whole.
function buildQuestion(p, sheet) {
  const b = p.build ?? p.mgf.build
  const isMgfBuild = b.strip !== false
  const data = rowsOf(b)
  const L = b.lines
  const fi = b.final ?? L.length - 1
  // asked: a row with slips (a line only up to the build's final one); the rest are shown
  const items = data.map(r => ({ row: r, right: r.right, slips: r.slips ?? [], own: r.kind !== 'line' || Boolean(r.own), ask: Boolean(r.slips?.length) && (r.kind !== 'line' || r.i <= fi), first: r.kind === 'line' && r.i === 0, exist: r.kind === 'exist', use: r.kind === 'use' }))
  const asked = items.filter(x => x.ask).length
  const wrap = h('div', 'mgf build')
  const pills = isMgfBuild ? ['① Multiply by eᵗˣ', '② Add it up: Σ or ∫', '③ Simplify'].map(t => h('span', '', t)) : []
  if (pills.length) {
    const st = h('div', 'mgf-steps')
    st.append(...pills)
    wrap.append(st)
  }
  const rows = h('div')
  wrap.append(rows)
  sheet.append(wrap)
  let firstTry = 0
  let n = 0
  const rowEl = r => {
    const row = h('div', 'mgf-row')
    const m = chipOf(r)
    row.append(h('span', 'mgf-move ' + m.mv, m.name), tex(hlTex(r.show)), h('p', 'mgf-why', r.why))
    return row
  }
  const light = s => pills.forEach((x, j) => x.classList.toggle('on', Boolean(s) && !s.use && (s.first ? j < 2 : !s.exist && j === 2)))
  function step(k) {
    if (k >= items.length) return done()
    const s = items[k]
    if (!s.ask) {
      rows.append(rowEl(s.row))
      return step(k + 1)
    }
    n++
    light(s)
    const title = s.exist ? 'Where does it exist?' : s.use ? `Step ${n} · now use it` : n === 1 ? (isMgfBuild ? 'Step 1 · set it up: \\(e^{tx}\\) times the pdf, added up' : 'Step 1 · the first line') : `Step ${n} · the next line`
    // every slip the line knows (up to 9), so the pick is close to writing the line
    const opts = shuffleArr([s.right, ...shuffleArr([...new Set(s.slips)].filter(w => w !== s.right)).slice(0, 9)])
    const shown = o => [tex(`\\displaystyle ${s.exist || s.own || s.first ? '' : '= '}${o}`, false)]
    const box = pickBox({
      placeholder: 'Choose the line…',
      label: 'Lines',
      cls: 'answers',
      title,
      items: opts.map((o, i) => ({ key: i, row: () => shown(o), shown: () => shown(o) })),
      onCheck: (i, ui) => {
        ui.sel.disabled = true
        ui.check.disabled = true
        const good = opts[i] === s.right
        if (good) firstTry++
        good ? sfx.right(firstTry) : sfx.wrong()
        const row = rowEl(s.row)
        row.classList.add(good ? 'got' : 'fixed')
        if (!good) {
          const not = h('p', 'mgf-not')
          not.append('You picked ', tex(opts[i], false), '; the line above is the right one.')
          row.append(not)
        }
        box.remove()
        rows.append(row)
        row.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 350 })
        step(k + 1)
      },
    })
    sheet.append(box)
    box.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  }
  function done() {
    light(null)
    const q = round.queue[round.at]
    round.locked = true
    const all = firstTry === asked
    const whole = isMgfBuild ? 'MGF' : 'derivation'
    const sum = h('p', 'build-sum ' + (all ? 'ok' : 'bad'), all ? `All ${asked} steps right: that is the whole ${whole}.` : `${firstTry} of ${asked} steps right first time. The ${whole} above is complete${round.learn ? '.' : '; this one comes back later.'}`)
    sheet.append(sum)
    if (all) {
      award()
      const acts = h('div', 'row-actions')
      const next = h('button', 'btn', 'Next')
      next.type = 'button'
      next.addEventListener('click', advance)
      acts.append(next)
      sheet.append(acts)
      next.focus({ preventScroll: true })
    } else {
      miss(q)
      const { acts, cont } = gotIt(q)
      sheet.append(acts)
      cont.focus({ preventScroll: true })
    }
    sum.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  }
  step(0)
}

// A build, line by line: the move each line makes, the line, and why.
// `at` marks the line a question asked about.
function mgfPlayer(b, { at = null, auto = false, next = null } = {}) {
  const el = h('div', 'mgf')
  const head = h('div', 'mgf-head')
  head.append(h('b', '', b.name), tex(b.pdf, false))
  el.append(head)
  const pills = b.strip === false ? [] : ['① Multiply by eᵗˣ', '② Add it up: Σ or ∫', '③ Simplify'].map(s => h('span', '', s))
  if (pills.length) {
    const st = h('div', 'mgf-steps')
    st.append(...pills)
    el.append(st)
  }
  const data = rowsOf(b)
  const rows = data.map((r, i) => {
    const row = h('div', 'mgf-row' + (i === at ? ' asked' : ''))
    const m = chipOf(r)
    row.append(h('span', 'mgf-move ' + m.mv, m.name), tex(hlTex(r.show)), h('p', 'mgf-why', r.why))
    return row
  })
  el.append(...rows)
  const acts = h('div', 'row-actions')
  const replay = h('button', 'btn ghost', auto ? 'Replay' : '▶ Play')
  replay.type = 'button'
  acts.append(replay)
  if (next) acts.append(next)
  el.append(acts)
  // ① and ② are the set-up line; every move after it is ③
  const light = r => pills.forEach((p, k) => p.classList.toggle('on', Boolean(r) && (r.move === 'setup' ? k < 2 : r.move !== 'exist' && r.move !== 'check' && k === 2)))
  let run = 0
  async function play() {
    const me = ++run
    const alive = () => me === run && el.isConnected
    replay.textContent = 'Replay'
    rows.forEach(r => (r.hidden = true))
    for (let i = 0; i < rows.length; i++) {
      await wait(reduced() ? 0 : i ? 2000 : 300)
      if (!alive()) return
      light(data[i])
      rows[i].hidden = false
      rows[i].animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 350 })
      tone(semis(523.25, i === at ? 12 : 7), 0, 0.08, 'sine', 0.06)
    }
    await wait(reduced() ? 0 : 1500)
    if (alive()) light(null)
  }
  replay.addEventListener('click', play)
  if (auto) play()
  return el
}

// the level's card: the recipe, the moves, and every build to watch
function mgfCard() {
  const wrap = h('div', 'mgf-card')
  const recipe = tex(RECIPE)
  recipe.classList.add('mgf-recipe')
  const st = h('div', 'mgf-steps big')
  st.append(...['① Multiply the pdf by eᵗˣ', '② Add it up: Σ if discrete, ∫ if continuous', '③ Simplify with the moves'].map(s => h('span', 'on', s)))
  wrap.append(recipe, st, h('h3', 'shapes-title', 'The moves'))
  const mv = h('div', 'mgf-moves')
  // (the gamma integral is the gamma build's move)
  for (const k of ['combine', 'pull', 'series', 'key', 'etx', 'gamma']) {
    const d = h('div')
    d.append(h('span', 'mgf-move ' + MOVES[k].mv, MOVES[k].name), tex(MOVES[k].rule))
    mv.append(d)
  }
  wrap.append(mv, h('h3', 'shapes-title', 'Watch one built'))
  const stage = h('div')
  const all = []
  const groups = [
    // the gamma's MGF is a class example and 4.3 #38 asks the chi-squared's; the normal's
    // is only given in the notes, so it has no build here
    ['On the test', [['e1', 'e^(−x)'], ['geo', 'Geometric'], ['expB', 'Exponential (β)'], ['expL', 'Exponential (λ)'], ['uni', 'Uniform'], ['table', 'A pdf table'], ['formula', 'A pdf formula'], ['gamma', 'Gamma'], ['chi', 'Chi-squared'], ['moments', 'Mean and variance']]],
  ]
  for (const [label, list] of groups) {
    const row = h('div', 'mgf-pick')
    row.append(h('span', 'mgf-pick-label', label))
    for (const [key, name] of list) {
      const b = h('button', 'tool toggle', name)
      b.type = 'button'
      b.setAttribute('aria-pressed', 'false')
      b.addEventListener('click', () => {
        all.forEach(x => x.setAttribute('aria-pressed', String(x === b)))
        stage.replaceChildren(mgfPlayer(BUILDS[key](), { auto: true }))
      })
      row.append(b)
      all.push(b)
    }
    wrap.append(row)
  }
  // the notes' example, ready to play
  all[0].setAttribute('aria-pressed', 'true')
  stage.append(mgfPlayer(BUILDS.e1()))
  wrap.append(stage, shapeGuide('MGF'))
  return wrap
}

function showBuild(p, sheet) {
  const next = h('button', 'btn', 'Next')
  next.type = 'button'
  next.addEventListener('click', advance)
  const panel = mgfPlayer(p.mgf.build, { at: p.mgf.at, auto: true, next })
  sheet.append(panel)
  next.focus({ preventScroll: true })
  panel.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
