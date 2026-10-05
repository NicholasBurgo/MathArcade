// js/13-answer-choices.js · answer choices: the options in the dropdown
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- answer choices: the options in the dropdown ----------
// Paper mode without the typing: the dropdown is a long list, so the work is finding
// your own answer in it, and a guess is a long shot.
//  - A number gets 12 options: the answer, every real mistake the question knows
//    (distractors), the same question's answer with other numbers (another()), the usual
//    slips (1 − p, ×2, ÷2) and values near it written the same way. They are listed from
//    smallest to largest, and where the answer sits in that order is random.
//  - A formula gets the engine's wrong ones, the same formula with other numbers, and
//    the usual slips (p and q swapped, a sign, the power one off), up to 10.
//  - Lettered options (a, b, c, …) stay as they are: all of them, none made up.
const fmtChoice = v => String(parseFloat(Math.abs(v) < 1 ? v.toPrecision(4) : v.toFixed(4)))
const shuffleArr = arr => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
// the letters of lettered options (a problem's p.answer is one of them)
const CHOICE_LETTERS = 'abcdefghijklmnopqrstuvwxyz'
const CHOICE_COUNT_NUMBER = 12
const CHOICE_COUNT_FORMULA = 10

// ---------- numbers ----------
// what the number is: a probability (0 to 1), a value that can't be negative, or any
// value (a z, a slip with a sign). The question's words and its known wrong answers
// decide: a P(…) whose real mistakes are all positive is a probability.
const CHOICE_PROB_WORDS = /(^|[^A-Za-z\\])[PF]\s*(\(|\[|\\left|\\big|\\Big)|probabilit|chance/
function choiceRange(a, known, words = '') {
  const unitish = v => v >= -1e-12 && v <= 1 + 1e-12
  if (unitish(a) && (known.every(unitish) || (known.every(v => v >= 0) && CHOICE_PROB_WORDS.test(words)))) return 'prob'
  if (a >= 0 && known.every(v => v >= 0)) return 'nonneg'
  return 'any'
}
// how the answer is written, so the made-up neighbours look like it: a whole number
// (counted in steps of u), a short decimal (k places), a fraction (1/3 = 0.3333: its
// neighbours are fractions too) or 4 significant figures
function choiceStyle(a, range) {
  const x = Math.abs(a)
  if (Math.abs(a - Math.round(a)) < 1e-9) {
    // 0 or 1 as a probability: its neighbours are decimals
    if (range === 'prob') return { kind: 'dec', k: 2 }
    const s = String(Math.round(x))
    const zeros = s.match(/0*$/)[0].length
    return { kind: 'int', u: Math.min(10 ** Math.min(zeros, s.length - 1), 10 ** Math.max(0, s.length - 2)) }
  }
  for (let k = 1; k <= 4; k++) if (Math.abs(a - +a.toFixed(k)) < 1e-9 * Math.max(1, x)) return { kind: 'dec', k }
  for (let m = 3; m <= 60; m++) if (Math.abs(a * m - Math.round(a * m)) < 1e-7) return { kind: 'frac', dens: [m, 2 * m, 3 * m] }
  return { kind: 'sig' }
}
// a target value moved onto the answer's grid
function choiceSnap(t, style) {
  if (style.kind === 'int') return Math.round(t / style.u) * style.u
  if (style.kind === 'dec') return +t.toFixed(style.k)
  if (style.kind === 'frac') {
    const d = style.dens[Math.floor(Math.random() * style.dens.length)]
    return Math.round(t * d) / d
  }
  return Math.abs(t) < 1 ? +t.toPrecision(4) : +t.toFixed(4)
}
const choiceUnit = (a, style) =>
  style.kind === 'int' ? style.u : style.kind === 'dec' ? 10 ** -style.k : style.kind === 'frac' ? 1 / style.dens[style.dens.length - 1] : Math.abs(a) < 1 ? 10 ** (Math.floor(Math.log10(Math.abs(a) || 1)) - 3) : 1e-4
// how many places the worked answer prints when it keeps a final 0 (a table's 0.3300,
// χ² = 25.0, z = −1.30): every option gets at least that many
function choicePlaces(printed, a, tol) {
  const nums = String(printed ?? '').match(/\d*\.\d+|\d+/g) ?? []
  for (let i = nums.length - 1; i >= 0; i--) {
    if (Math.abs(parseFloat(nums[i]) - Math.abs(a)) > Math.max(tol, 1e-9) * 1.01) continue
    const dec = nums[i].split('.')[1] ?? ''
    return dec.endsWith('0') ? Math.min(dec.length, 4) : 0
  }
  return 0
}
const choiceLabeler = pad => v => {
  let s = fmtChoice(v)
  if (s === '-0') s = '0'
  if (pad && (s.split('.')[1] ?? '').length < pad) s = v.toFixed(pad)
  return s
}
// candidate values near the answer on one side (side = −1 below, +1 above), on its grid,
// spread at random over a stretch that grows with n (the same spacing on both sides):
// [[label, value], …] in a random order, none taken yet
function choiceNearPool(a, side, n, ctx) {
  const { style, tol, lo, hi, used, label, step } = ctx
  const unit = choiceUnit(a, style)
  const gap = Math.max(2.1 * tol, 0.999 * unit)
  const room = side < 0 ? a - lo : hi - a
  const reach = Math.min(room, gap + step * (n + 2))
  const pool = new Map()
  for (let i = 0; i < 40 + 12 * n && reach > gap; i++) {
    const v = choiceSnap(a + side * (gap + Math.random() * (reach - gap)), style)
    if (!(side < 0 ? v < a : v > a) || Math.abs(v - a) <= gap || v < lo - 1e-12 || v > hi + 1e-12) continue
    // a made-up value is never exactly 0, nor 1 for a probability
    if (Math.abs(v) < 1e-12 || (hi === 1 && v >= 1 - 1e-12)) continue
    const l = label(v)
    if (!used.has(l) && Math.abs(parseFloat(l) - a) > 2 * tol) pool.set(l, v)
  }
  return { cands: shuffleArr([...pool]), step, unit }
}
// n of them, kept apart from each other and from the other options; `tight` lets them
// come closer when there is no room otherwise
function choiceNearValues(a, side, n, ctx, tight = false) {
  const out = []
  if (n <= 0) return out
  const { used, others, style } = ctx
  const { cands, step, unit } = choiceNearPool(a, side, n, ctx)
  for (let sep = step * 0.6; out.length < n && sep >= (tight ? unit * 0.5 : step * 0.6); sep /= 2) {
    for (const [l, v] of cands) {
      if (out.length >= n) break
      if (used.has(l) || others.some(o => Math.abs(o - v) < sep)) continue
      used.add(l)
      others.push(v)
      out.push(v)
    }
  }
  // a short decimal runs out of room (0.1 … 0.9): one more place
  if (out.length < n && tight && style.kind === 'dec' && style.k < 4) out.push(...choiceNearValues(a, side, n - out.length, { ...ctx, style: { kind: 'dec', k: style.k + 1 } }, true))
  return out
}
// The options for a number: [{ v, label, correct }], smallest first.
//   value, tol    the answer and how far a right answer may be off
//   wrong         the real mistakes (all kept when they fit)
//   siblings      the same question's answer with other numbers
//   words         the question and its worked answer (P(…) says "a probability")
//   printed       the worked answer as printed (for its decimal places)
// The list must not give the answer away. Real mistakes hang off the answer (1 − p,
// 2p, the next cell of a table), which would make it the one value the others point
// to, so a few made-up values get the same company (decoys: c with 1 − c, 2c, c ± a
// cell). The rest are values near it, as many below as above at random.
function choicesForNumber({ value: a, tol, wrong = [], siblings = [], words = '', printed = '', n = CHOICE_COUNT_NUMBER }) {
  tol = Math.max(tol ?? 1e-6, 1e-9)
  const real = wrong.filter(Number.isFinite)
  const sibs = siblings.filter(Number.isFinite)
  const range = choiceRange(a, [...real, ...sibs], words)
  const lo = range === 'any' ? -Infinity : 0
  const hi = range === 'prob' ? 1 : Infinity
  const places = choicePlaces(printed, a, tol)
  const label = choiceLabeler(places)
  let aLabel = label(a)
  if (Math.abs(parseFloat(aLabel) - a) > tol) aLabel = String(+a.toPrecision(8))
  const used = new Set([aLabel])
  // tiny values print as 1.2e-8: only next to a tiny answer
  const tiny = v => v !== 0 && Math.abs(v) < 1e-4 && Math.abs(a) >= 1e-3
  // (a made-up value, made = true, is never exactly 0, nor 1 for a probability)
  const fits = (v, gap, made = false) => {
    if (!Number.isFinite(v) || tiny(v) || v < lo - 1e-12 || v > hi + 1e-12 || Math.abs(v - a) <= gap) return null
    if (made && (Math.abs(v) < 1e-12 || (hi === 1 && v > 1 - 1e-12))) return null
    const l = label(v)
    return used.has(l) || Math.abs(parseFloat(l) - a) <= gap ? null : l
  }
  const W = n - 1
  const take = []
  const add = (v, l) => {
    used.add(l)
    take.push({ v, l })
  }
  // 1. every real mistake that fits (a real mistake may sit just outside the tolerance),
  // then the usual slips: the other side (1 − p), and for tails and middles ×2 and ÷2.
  // Made-up ones keep clear of the answer (twice the tolerance), so an answer that is
  // right but rounded differently is still nearest the right option.
  for (const v of real) {
    if (take.length >= W) break
    const l = fits(v, tol)
    if (l) add(v, l)
  }
  const twoSided = range === 'prob' && /tail|outside|both|either|middle/i.test(words)
  const hasNear = v => take.some(x => Math.abs(x.v - v) <= tol)
  const usual = range !== 'prob' ? [] : [1 - a, ...(twoSided && !hasNear(2 * a) && !hasNear(a / 2) ? [a <= 0.5 ? 2 * a : a / 2] : [])]
  for (const v of usual) {
    const l = take.length < W && !hasNear(v) && fits(v, 2 * tol)
    if (l) add(v, l)
  }
  let style = choiceStyle(a, range)
  // printed with places (z = 1.00): its neighbours have them too
  if (places && (style.kind === 'int' || (style.kind === 'dec' && style.k < places))) style = { kind: 'dec', k: places }
  const known = [...real, ...sibs].map(Math.abs).filter(v => v > 0).sort((x, y) => x - y)
  const scale = a !== 0 ? Math.abs(a) : known.length ? known[Math.floor(known.length / 2)] : range === 'prob' ? 0.2 : 1
  const unit = choiceUnit(a, style)
  // made-up values sit as close together as the real mistakes nearest the answer (a
  // table's next entries are close), so the answer is never the one crowded spot
  const closest = Math.min(...real.map(v => Math.abs(v - a)).filter(d => d > tol && d < 0.15 * scale))
  const step = Math.max(2.1 * tol * 1.3, unit, Math.min(0.1 * scale, closest * 1.2))
  const ctx = { style, tol, lo, hi, used, label, step, others: take.map(x => x.v) }
  // 2. the answer's company: what the options already tie to it (1 − p, ×2, ÷2, the
  // sign), and the run of next cells it sits in (a table's 0.87, 0.88, 0.89). Made-up
  // values get the same company (decoys), and the run grows a cell or two at its ends,
  // so the answer is neither the one value with company nor the middle of the run.
  const tied = v => take.some(x => label(x.v) === label(v))
  const ties = []
  if (range === 'prob' && tied(1 - a)) ties.push(x => 1 - x)
  if (a !== 0 && tied(2 * a)) ties.push(x => 2 * x)
  if (a !== 0 && tied(a / 2)) ties.push(x => x / 2)
  if (range === 'any' && a !== 0 && tied(-a)) ties.push(x => -x)
  const cellOf = v => Math.round(v / unit)
  const cells = new Set(take.map(x => cellOf(x.v)))
  let rlo = cellOf(a)
  let rhi = rlo
  while (cells.has(rlo - 1)) rlo--
  while (cells.has(rhi + 1)) rhi++
  // a value with the first t of the answer's ties, if they all fit
  const withCompany = (c, t) => {
    const group = [c, ...ties.slice(0, t).map(f => f(c))]
    const labels = group.map(v => fits(v, 2 * tol, true))
    if (labels.some(l => !l) || new Set(labels).size < group.length) return false
    group.forEach((v, i) => {
      add(v, labels[i])
      ctx.others.push(v)
    })
    return true
  }
  // a place is kept for one of the question's siblings
  const room = () => W - take.length - Math.min(1, sibs.length)
  if (rhi > rlo) {
    for (let k = 0; k < 2 && room() > 0; k++) {
      const ends = Math.random() < 0.5 ? [rlo - 1, rhi + 1] : [rhi + 1, rlo - 1]
      for (const c of ends) {
        const v = +(c * unit).toPrecision(12)
        if (!withCompany(v, Math.min(ties.length, room() - 1)) && !withCompany(v, 0)) continue
        if (c < rlo) rlo = c
        else rhi = c
        break
      }
    }
  }
  // up to 3 decoys with all of the company, or fewer with less of it
  let T = ties.length
  while (T > 1 && T + 1 > room()) T--
  const decoys = T ? Math.min(3, Math.floor(room() / (T + 1))) : 0
  for (let k = 0; k < decoys; k++) {
    const side = Math.random() < 0.5 ? -1 : 1
    const pool = [...choiceNearPool(a, side, 4, ctx).cands, ...choiceNearPool(a, -side, 4, ctx).cands]
    for (const [, c] of pool) if (!ctx.others.some(o => Math.abs(o - c) < unit * 1.5) && withCompany(c, T)) break
  }
  // 3. the same question with other numbers
  for (const v of shuffleArr(sibs)) {
    if (take.length >= W) break
    const l = fits(v, 2 * tol)
    if (l) {
      add(v, l)
      ctx.others.push(v)
    }
  }
  // 4. values near it fill the rest, a random share below and the rest above; a side
  // with no room passes its share on, and only then do they bunch up
  const fill = (side, k, tight) => {
    const vs = choiceNearValues(a, side, k, ctx, tight)
    for (const v of vs) take.push({ v, l: label(v) })
    return k - vs.length
  }
  const F = Math.max(0, W - take.length)
  const fb = Math.floor(Math.random() * (F + 1))
  const shortA = fill(1, F - fb + fill(-1, fb, false), false)
  if (shortA > 0) fill(1, fill(-1, shortA, true), true)
  return [{ v: a, label: aLabel, correct: true }, ...take.map(x => ({ v: x.v, label: x.l, correct: false }))].sort((x, y) => x.v - y.v)
}
// the question with other numbers, a few times: the answers of the ones that ask the
// same thing (the digits aside)
const choiceAskShape = q => String(q?.ask ?? '').replace(/-?\d+(\.\d+)?/g, '#')
function choiceSiblings(p, want = 4, tries = 8) {
  const out = []
  if (typeof p.another !== 'function') return out
  for (let i = 0; i < tries && out.length < want; i++) {
    let s
    try {
      s = p.another()
    } catch {
      break
    }
    if (s && typeof s.answer === typeof p.answer && choiceAskShape(s) === choiceAskShape(p)) out.push(s.answer)
  }
  return out
}

// ---------- formulas ----------
// the usual slips in a formula, made from the right one; each is checked before it is
// used (it must read as a formula and must not equal the answer)
function choiceFormulaSlips(s, vars, ask = '') {
  const out = []
  const add = x => {
    if (x && x !== s) out.push(x)
  }
  const has = v => vars.includes(v)
  // p and q swapped
  if (has('p') && has('q')) add(s.replace(/[pq]/g, c => (c === 'p' ? 'q' : 'p')))
  // a number and its complement swapped (0.3 and 0.7), or one turned into its complement
  const nums = [...new Set(s.match(/\d*\.\d+/g) ?? [])]
  for (const x of nums) {
    const y = String(+(1 - parseFloat(x)).toFixed(6))
    if (parseFloat(x) <= 0 || parseFloat(x) >= 1) continue
    if (nums.includes(y)) add(s.replace(new RegExp(`${x.replace('.', '\\.')}|${y.replace('.', '\\.')}`, 'g'), m => (m === x ? y : x)))
    else add(s.replace(x, y))
  }
  // a sign: 1 − … turned into 1 + …, t − 1 for 1 − t, e^(tx) for e^(−x)
  add(s.replace(/\(1-(?=[^)]*t)/, '(1+'))
  add(s.replace(/\(1-t\)/, '(t-1)'))
  add(s.replace(/\(t-1\)/, '(1-t)'))
  add(s.replace(/-t\b/, '+t'))
  add(s.replace(/e\^\((t\w*)\)/, 'e^(-$1)'))
  add(s.replace(/e\^\(-(\w+)\)/, 'e^($1)'))
  // the power one off: x − 1 for x, x for x − 1
  add(s.replace(/\^\(x-1\)/, '^x'))
  add(s.replace(/\^x(?![\w(])/, '^(x-1)'))
  // e^t lost from the top
  add(s.replace(/^([\d.]*[pq]?)e\^t\//, (m, c) => (c || '1') + '/'))
  // 1 − F(x) and F(x) mixed up
  if (/^1\s*-\s*[^()]*$/.test(s) || /^1\s*-\s*\S+\^/.test(s)) add(s.replace(/^1\s*-\s*/, ''))
  // a rate and a mean mixed up: e^(−x/β) for e^(−λx)
  add(s.replace(/e\^\(-(\w)\/(\d+(?:\.\d+)?)\)/, 'e^(-$2$1)'))
  // a sign: a plus for the first minus in a bracket that is not a power or C(n, k):
  // 1/(B + A) for 1/(B − A); and for an integral, the antiderivative's sign lost
  // (−1/(1 − t) for 1/(1 − t)), when the answer is one term
  add(s.replace(/(^|[^\^C\w])\(([^()]*?[A-Za-z)])-([^()]*)\)/, '$1($2+$3)'))
  let depth = 0
  const oneTerm = ![...s].some((ch, i, all) => {
    depth += ch === '(' ? 1 : ch === ')' ? -1 : 0
    return depth === 0 && (ch === '+' || ch === '-') && i > 0 && all[i - 1] !== '^'
  })
  if (/integral/i.test(ask) && oneTerm && !s.startsWith('-')) add(`-${s}`)
  // upside down: q/p for p/q, and 1 − t for 1/(1 − t)
  const f = /^(\w+)\/(\w+)$/.exec(s)
  if (f) add(`${f[2]}/${f[1]}`)
  const g = /^1\/\(([^()]+)\)$/.exec(s)
  if (g) add(g[1])
  return [...new Set(out)]
}
// The options for a string answer: the answer, the engine's wrong ones (all of them),
// the same question's answer with other numbers, then the usual slips, shuffled.
function choicesForString(p) {
  const right = p.answer
  const vars = p.expr?.vars ?? []
  // two options are the same when they are drawn the same
  const norm = x => (p.expr ? T2.toLatex(x, vars) ?? '' : String(x)).replace(/\s+|\*|\\,/g, '')
  const seen = new Set([norm(right)])
  const wrong = []
  const sameAsAnswer = x => {
    try {
      return Boolean(p.accept?.(x))
    } catch {
      return false
    }
  }
  const take = x => {
    if (typeof x !== 'string' || seen.has(norm(x)) || wrong.length >= CHOICE_COUNT_FORMULA - 1) return
    if (p.expr && T2.toLatex(x, vars) == null) return
    if (sameAsAnswer(x)) return
    seen.add(norm(x))
    wrong.push(x)
  }
  for (const c of p.choices ?? []) take(c)
  for (const s of choiceSiblings(p, 5)) take(s)
  if (p.expr) for (const s of choiceFormulaSlips(right, vars, p.ask)) take(s)
  return shuffleArr([{ label: right, correct: true }, ...wrong.map(w => ({ label: w, correct: false }))])
}

// ---------- every kind of answer ----------
// [{ label, correct, also?, v? }]: lettered options by their letter (in p.order when the
// problem gives one; a tree story's other right names are `also`), a formula or word
// answer by its text, a number by its printed value
function answerChoices(p) {
  if (p.options) {
    const order = p.order ?? p.options.map((_, i) => i)
    return order.map(i => {
      const l = CHOICE_LETTERS[i]
      const also = l !== p.answer && Boolean(p.options[i]?.key) && Boolean(p.alsoRight?.includes(p.options[i].key))
      return { label: l, correct: l === p.answer || also, also }
    })
  }
  if (typeof p.answer === 'string') {
    if (p.choices || p.expr) return choicesForString(p)
    return T2.buildChoices(p)
  }
  return choicesForNumber({
    value: p.answer,
    tol: p.tolerance,
    wrong: p.distractors ?? [],
    siblings: choiceSiblings(p),
    words: [p.ask, p.latex].join(' '),
    printed: p.answerLatex,
  }).map(o => ({ label: o.label, correct: o.correct, v: o.v }))
}
// the old name (the #dev panel lists it)
const buildChoices6 = answerChoices
// typed answers: the class app's check, except that "16" for 0.16 needs the % sign,
// so a reciprocal slip (10 for 0.1) or a missing decimal is not marked right
function checkTyped(raw, p) {
  if (p.slice) return typedRight(raw, p.check.value, p.check.tol).ok
  const ok = T2.checkAnswer(raw, p)
  if (!ok || p.accept || typeof p.answer !== 'number' || /%/.test(raw)) return ok
  let t = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/^[a-z]=/, '').replace(',', '.')
  const f = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/)
  const n = f ? (Number(f[2]) === 0 ? null : Number(f[1]) / Number(f[2])) : t !== '' && Number.isFinite(Number(t)) ? Number(t) : null
  return n !== null && Math.abs(n - p.answer) < (p.tolerance ?? 1e-6)
}
// the options as the dropdown draws them: { correct, also?, text | tex | name + tex, num? }
function choicesFor(p) {
  return answerChoices(p).map(c => {
    if (p.options) {
      const o = p.options[CHOICE_LETTERS.indexOf(c.label)]
      const base = { correct: c.correct, also: c.also }
      if (typeof o === 'string') return { ...base, text: o }
      return o.name ? { ...base, name: o.name, tex: o.latex } : { ...base, tex: o.latex }
    }
    if (p.expr) return { correct: c.correct, tex: T2.toLatex(c.label, p.expr.vars) ?? c.label }
    return c.v != null ? { correct: c.correct, text: c.label, num: c.v } : { correct: c.correct, text: c.label }
  })
}
// a list of plain numbers (laid out in columns, smallest first)
const choicesAllNumbers = opts => opts.length > 0 && opts.every(o => o.num != null)
