// js/28b-build-as-one.js · a derivation asked as one question
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- a derivation asked as one question, then the whole derivation played ----------
// A build (an MGF, or a pdf, cdf or "show it is a pdf" derivation) used to be asked a line
// at a time, each line among a few near-copies. Now it is one question: its key line (the
// pdf, the cdf, the identity that makes the total 1, or the MGF), picked from a long list
// of the line's real slips, the same line with a number slipped, and the matching lines of
// the other distributions. Then the whole derivation plays, every line with its move and why.

// what the key line says, written with its left side
const ONE_LHS = { pdf: 'f(x)', cdf: 'F(x)', show: '\\sum f(x)', mgf: 'm_X(t)' }
const ONE_ASK = {
  pdf: 'Which line gives f(x)?',
  cdf: 'Which line gives F(x)?',
  show: 'Which line makes the total come to 1?',
  mgf: 'Which is the MGF?',
}
const oneNorm = t => t.replace(/\s+/g, '').replace(/\\[,;!: ]/g, '')

function oneFamily(p, b) {
  if (p.mgf) return 'mgf'
  if (b.lines.some(l => /≥ 0/.test(l.label ?? ''))) return 'show'
  if (/F\(x\)/.test(p.ask ?? '')) return 'cdf'
  return 'pdf'
}

// the key line: the last line with slips that isn't the "f(x) ≥ 0" check, the range, or a
// trivial "= 1"
function oneKeyIndex(b) {
  const fi = b.final ?? b.lines.length - 1
  let key = -1
  b.lines.forEach((l, i) => {
    if (i > fi || !l.slips?.length) return
    if (/≥ 0|Range/.test(l.label ?? '')) return
    if (/=\s*1\s*$/.test(plainTex(l.tex))) return
    key = i
  })
  return key >= 0 ? key : fi
}

// the line with its left side: "= q^{x-1}p" reads "f(x) = q^{x-1}p"; an MGF on its own gets "m_X(t) ="
function oneFull(t, fam) {
  const s = plainTex(t).trim()
  if (/^(=|\\approx)/.test(s)) return `${ONE_LHS[fam]} ${s}`
  if (fam === 'mgf' && !s.includes('=')) return `${ONE_LHS.mgf} = ${s}`
  return s
}

// the same line with one number slipped: a chance p for 1 − p, a whole number off by one
function oneTweaks(t) {
  const out = []
  const re = /\d+(?:\.\d+)?/g
  let m
  while ((m = re.exec(t))) {
    const s = m[0], v = +s
    // leave exponents and limits like x − 1 and Σ from 1 alone: only numbers that stand for a value
    const before = t.slice(Math.max(0, m.index - 2), m.index)
    if (/[-_^]\{?$/.test(before) && v <= 1) continue
    const swaps = v > 0 && v < 1 ? [String(+(1 - v).toFixed(6))] : Number.isInteger(v) && v >= 2 ? [String(v + 1), String(v - 1)] : []
    for (const w of swaps) out.push(t.slice(0, m.index) + w + t.slice(m.index + s.length))
  }
  return out
}

// the matching key lines of the other builds, per kind of line (the right line of one is a
// wrong one for another: the binomial theorem doesn't sum a Poisson)
let onePoolCache = null
function onePool() {
  if (onePoolCache) return onePoolCache
  onePoolCache = { pdf: [], show: [], cdf: [], mgf: [] }
  const add = (fam, b, p) => {
    const l = b.lines[oneKeyIndex(b)]
    for (const t of [l.tex, ...(l.slips ?? [])]) onePoolCache[fam].push(oneFull(t, fam))
  }
  for (const k of ['geometric-derive:pdf-build', 'discrete-derive:binom-build', 'discrete-derive:negbin-build', 'discrete-derive:hyper-build', 'geometric-derive:show-pdf', 'discrete-derive:binom-sum', 'discrete-derive:poisson-sum', 'geometric-derive:cdf-build']) {
    try {
      const p = KIND[k]?.tp.generate()
      if (p?.build) add(oneFamily(p, p.build), p.build, p)
    } catch {}
  }
  // the classic wrong cdfs (each one wrong for every p; the right 1 − q^x comes from the build)
  onePoolCache.cdf.push(...['F(x) = 1 - q^{x-1}', 'F(x) = q^{x}', 'F(x) = 1 - p^{x}', 'F(x) = q^{x-1}p', 'F(x) = \\frac{1 - q^{x}}{p}', 'F(x) = 1 - q^{x+1}'])
  // not the exponential in β or λ: each is the other written differently (β = 1/λ), so
  // one would be a second right answer to the other
  for (const make of [() => BUILDS.geo(), () => BUILDS.e1(), () => BUILDS.uni(null), () => BUILDS.gamma()]) {
    try {
      add('mgf', make())
    } catch {}
  }
  return onePoolCache
}

// the question: the build's own ask and pdf, the key line among up to ten
function buildAsOne(p) {
  const b = p.build ?? p.mgf.build
  const fam = oneFamily(p, b)
  const line = b.lines[oneKeyIndex(b)]
  const right = oneFull(line.tex, fam)
  const seen = new Set([oneNorm(right)])
  const wrong = []
  const add = t => {
    const n = oneNorm(t)
    if (seen.has(n)) return
    seen.add(n)
    wrong.push(t)
  }
  for (const s of line.slips ?? []) add(oneFull(s, fam))
  for (const t of oneTweaks(right)) add(t)
  // the other builds' lines only where they read like this one (letters with letters)
  const lettersOnly = !/\d\.\d|\d{2}/.test(right)
  const numbered = t => /\d\.\d|\d{2}/.test(t)
  if (lettersOnly) for (const t of shuffleArr(onePool()[fam])) if (wrong.length < 9 && !numbered(t)) add(t)
  const opts = [right, ...wrong.slice(0, 9)]
  const ask = fam === 'mgf'
    ? 'Find the MGF \\(m_X(t) = E\\big[e^{tX}\\big]\\) of this pdf. The work after shows every line, where it exists' + (b.use ? ', and E[X] and Var X from it.' : '.')
    : `${p.ask ?? ''} ${ONE_ASK[fam]} The whole derivation plays after.`.trim()
  return {
    ...p,
    buildIt: false,
    oneBuild: true,
    ask,
    options: opts.map(latex => ({ latex })),
    answer: 'a',
    order: shuffleArr(opts.map((_, i) => i)),
    mgf: { build: b, at: null },
    another: p.another ? () => buildAsOne(p.another()) : undefined,
  }
}
