// js/31c-work-pieces.js · the work's hidden arithmetic, worked on the side, and its table lookups
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the work's hidden arithmetic, worked on the side, and its table lookups ----------
// A row like "= \binom{9}{2}(0.2)^{2}(0.8)^{7}" hides arithmetic done by hand: C(9, 2), two
// powers. Each such piece is worked on the side (like World 0's pieces) right after the
// step that needs it. A piece is only shown when its own arithmetic checks out.

// ---------- a small calculator for the work's LaTeX ----------
// Numbers, letters, powers, \frac, e^{…}, √, n!, Γ(n), brackets and implicit products,
// read into a function of the named letters. null when anything is unclear.
function workEvalTokens(src) {
  const out = []
  for (let i = 0; i < src.length; ) {
    const c = src[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|[\s\S]?)/.exec(src.slice(i))
      i += m[0].length
      const n = m[1]
      if (/^[,;:! ]$/.test(n) || /^(quad|qquad|displaystyle|left|right|big|Big|bigg|Bigg|bigl|bigr|Bigl|Bigr)$/.test(n)) continue
      if (n === 'frac' || n === 'tfrac' || n === 'dfrac') out.push({ t: 'frac' })
      else if (n === 'sqrt') out.push({ t: 'sqrt' })
      else if (n === 'cdot' || n === 'times') out.push({ t: 'op', v: '*' })
      else if (n === 'pi') out.push({ t: 'num', v: Math.PI })
      else if (n === 'Gamma') out.push({ t: 'Gamma' })
      else if (n in WORK_GREEK) out.push({ t: 'var', name: '\\' + n })
      else return null
      continue
    }
    const m = /^\d+(?:\{,\}\d{3})*(?:\.\d+)?/.exec(src.slice(i))
    if (m) { out.push({ t: 'num', v: parseFloat(m[0].replace(/\{,\}/g, '')) }); i += m[0].length; continue }
    if (c === 'e') out.push({ t: 'e' })
    else if (/[a-zA-Z]/.test(c)) out.push({ t: 'var', name: c })
    else if ('+-−*/^!'.includes(c)) out.push({ t: 'op', v: c === '−' ? '-' : c })
    else if ('([{'.includes(c)) out.push({ t: 'open', v: c })
    else if (')]}'.includes(c)) out.push({ t: 'close', v: c })
    else return null
    i++
  }
  return out
}
const workFact = n => (Number.isInteger(n) && n >= 0 && n <= 170 ? prod(1, n) : NaN)
function workTexFn(src, vars = ['x']) {
  const toks = workEvalTokens(src ?? '')
  if (!toks || !toks.length) return null
  let i = 0
  const fail = () => { throw new Error('unclear') }
  const starts = t => t && ['num', 'var', 'open', 'frac', 'sqrt', 'e', 'Gamma'].includes(t.t)
  const varRef = name => {
    if (!vars.includes(name)) fail()
    return env => env[name]
  }
  const group = () => {
    const t = toks[i]
    if (t?.t === 'open' && t.v === '{') {
      i++
      const e = expr()
      if (toks[i]?.t !== 'close' || toks[i].v !== '}') fail()
      i++
      return e
    }
    if (t?.t === 'num') { i++; return () => t.v }
    if (t?.t === 'var') { i++; return varRef(t.name) }
    fail()
  }
  function primary() {
    const t = toks[i++]
    if (!t) fail()
    if (t.t === 'num') return () => t.v
    if (t.t === 'var') return varRef(t.name)
    if (t.t === 'e') return () => Math.E
    if (t.t === 'open') {
      const close = { '(': ')', '[': ']', '{': '}' }[t.v]
      const e = expr()
      if (toks[i]?.t !== 'close' || toks[i].v !== close) fail()
      i++
      return e
    }
    if (t.t === 'frac') {
      const a = group(), b = group()
      return env => a(env) / b(env)
    }
    if (t.t === 'sqrt') {
      const a = group()
      return env => Math.sqrt(a(env))
    }
    if (t.t === 'Gamma') {
      const a = primary()
      return env => workFact(a(env) - 1)
    }
    fail()
  }
  function postfix() {
    let a = primary()
    while (toks[i]?.t === 'op' && toks[i].v === '!') {
      i++
      const f = a
      a = env => workFact(f(env))
    }
    return a
  }
  function power() {
    const b = postfix()
    if (toks[i]?.t === 'op' && toks[i].v === '^') {
      i++
      const e = group()
      return env => Math.pow(b(env), e(env))
    }
    return b
  }
  function unary() {
    if (toks[i]?.t === 'op' && (toks[i].v === '-' || toks[i].v === '+')) {
      const neg = toks[i++].v === '-'
      const u = unary()
      return neg ? env => -u(env) : u
    }
    return power()
  }
  function term() {
    let left = unary()
    for (;;) {
      const t = toks[i]
      if (t?.t === 'op' && (t.v === '*' || t.v === '/')) {
        i++
        const l = left, r = unary()
        left = t.v === '*' ? env => l(env) * r(env) : env => l(env) / r(env)
      } else if (starts(t)) {
        const l = left, r = power()
        left = env => l(env) * r(env)
      } else return left
    }
  }
  function expr() {
    let left = term()
    while (toks[i]?.t === 'op' && (toks[i].v === '+' || toks[i].v === '-')) {
      const op = toks[i++].v
      const l = left, r = term()
      left = op === '+' ? env => l(env) + r(env) : env => l(env) - r(env)
    }
    return left
  }
  try {
    const f = expr()
    if (i !== toks.length) return null
    return f
  } catch {
    return null
  }
}
// the value of a LaTeX expression with no letters (or with every letter set to 1, loose)
const workTexValue = (src, loose = false) => {
  const letters = loose ? [...new Set((src.replace(/\\[a-zA-Z]+/g, ' ').match(/[a-df-zA-Z]/g) ?? []))] : []
  const f = workTexFn(src, letters)
  if (!f) return null
  const v = f(Object.fromEntries(letters.map(l => [l, 1])))
  return Number.isFinite(v) ? v : null
}
// put a number in for a letter, in LaTeX: x^{4} at 2 is (2)^{4}; command names (and a
// \class's name) are left alone
function workTexSub(src, letter, v, shown = null) {
  const val = `(${shown ?? num(v, 6)})`
  let out = ''
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '\\') {
      const m = /^\\([a-zA-Z]+|[\s\S]?)/.exec(src.slice(i))
      let n = m[0].length
      // a \class's name, and words, stay as they are
      if (/^(class|text|textbf|textit|mathrm|operatorname)$/.test(m[1]) && src[i + n] === '{') n = matchBrace(src, i + n) + 1 - i
      out += src.slice(i, i + n)
      i += n - 1
      continue
    }
    // (xe^{x} is x times e^x: the letter is replaced wherever it stands)
    out += src[i] === letter ? val : src[i]
  }
  return out
}
const workClose = (a, b, rel = 1e-3) => a != null && b != null && Math.abs(a - b) <= rel * Math.max(1, Math.abs(b))
// a number as the work would write it: = when exact to 4 figures, else ≈
const workShown = x => `${rel(exact(x, 4))} ${num(x, 4)}`

// ---------- the pieces ----------
// A piece is a PLUG-style line ({ label, tex, steps, plain }) placed after step j of row r.
// numTex(r, j, start, tok) colours a number the way the work's row colours it.
function workPieces(p, rows, { numTex = (r, j, s, tok) => tok, level = null } = {}) {
  const out = []
  const seen = new Set()
  const once = key => (seen.has(key) ? false : (seen.add(key), true))
  const add = (r, j, line) => line && out.push({ r, j, line })
  rows.forEach((row, r) => row.forEach((c, j) => {
    const next = row[j + 1] ?? null
    const nextVal = next ? workTexValue(next.replace(/^\s*(?:=|\\approx)\s*/, '').replace(/,[\s\S]*$/, ''), true) : null
    // C(n, k)
    for (const m of c.matchAll(/\\binom\{(\d+)\}\{(\d+)\}/g)) {
      const n = +m[1], k = +m[2]
      if (k <= n && n > 1 && Math.min(k, n - k) >= 1 && once(`C${n},${k}`)) add(r, j, chooseWork(n, k))
    }
    // Γ(k) = (k − 1)!, unless the row works it out itself
    for (const m of c.matchAll(/\\Gamma\((\d+)\)/g)) {
      const k = +m[1]
      if (k < 2 || row.slice(j + 1).some(x => new RegExp(`\\(${k} - 1\\)!|(?:^|[^\\d])${k - 1}!`).test(x))) continue
      if (once(`G${k}`)) add(r, j, { order: [], label: `How to get Γ(${k})`, tex: () => `\\Gamma(${k}) = (${k} - 1)!`, steps: () => [`= ${k - 1}!`, ...(k - 1 >= 3 ? [`= ${Array.from({ length: k - 1 }, (_, i) => k - 1 - i).join(' \\cdot ')}`] : []), `= ${num(fact(k - 1))}`] })
    }
    // n! written out (3! and up)
    for (const m of c.matchAll(/(?<![\d.])(\d+)!/g)) {
      const n = +m[1]
      if (n >= 3 && n <= 12 && once(`F${n}`)) add(r, j, factWork(n))
    }
    // powers of a number, e to a number: a calculator line each
    const calc = []
    for (const pw of workPowers(c)) {
      if (!once(`P${pw.tex}`)) continue
      // (1/2)^4 stays a fraction, as the work writes it: 1/2^4 = 1/16
      if (pw.frac) add(r, j, { order: [], label: 'The power', tex: () => pw.tex, steps: () => [`= ${pw.frac}`] })
      else calc.push([pw.tex, pw.val])
    }
    if (calc.length) add(r, j, calcPiece(calc, calc.length > 1 ? 'The powers, on the calculator' : 'The power, on the calculator'))
    // a z-score: (x − μ)/σ, the subtraction then the division
    if (level === 'Normal word problems' || /(?:^|[^a-zA-Z\\])z\s*$|Z/.test(row[j - 1] ?? '') || /Z\s*[<>]|[<>]\s*Z/.test(c)) {
      const zs = []
      for (const m of c.matchAll(/\\frac\{(-?\d+(?:\.\d+)?) - (-?\d+(?:\.\d+)?)\}\{(\d+(?:\.\d+)?)\}/g)) {
        const a = +m[1], b = +m[2], s = +m[3], d = a - b, z = d / s
        const at = m.index + m[0].indexOf('{') + 1
        const ta = numTex(r, j, at, m[1]), tb = numTex(r, j, at + m[1].length + 3, m[2]), ts = numTex(r, j, m.index + m[0].lastIndexOf('{') + 1, m[3])
        if (once(`Z${m[0]}`)) zs.push(`${ta} - ${tb} &= ${num(d, 6)}`, `\\tfrac{${num(d, 6)}}{${ts}} &${workShown(z)}`)
      }
      if (zs.length) add(r, j, { order: [], label: zs.length > 2 ? 'How to get each z' : 'How to get z', plain: true, tex: () => zs[0].replace('&', ''), steps: () => zs.slice(1) })
    }
    // the bracket of an antiderivative: top minus bottom
    const br = workBracket(c, next, nextVal, (s, tok) => numTex(r, j, s, tok))
    if (br && once(`B${r},${j}`)) add(r, j, br)
  }))
  // E(X) or E(X²) of a discrete pdf, when the work only states it
  for (const pc of workSums(p, rows)) add(pc.r, pc.j, pc.line)
  return out
}
// the powers in a step whose base and power are numbers: (0.9)^{4}, 1.6^{2}, e^{-0.5}
function workPowers(c) {
  const out = []
  for (let i = 0; i < c.length; i++) {
    if (c[i] !== '^') continue
    // the power: {…} or one character
    let e, eEnd
    if (c[i + 1] === '{') {
      eEnd = matchBrace(c, i + 1)
      e = c.slice(i + 2, eEnd)
    } else {
      e = c[i + 1]
      eEnd = i + 1
    }
    const ev = workTexValue(e)
    if (ev == null) continue
    // the base: e, a number, or a bracket
    let s = i - 1
    while (s >= 0 && c[s] === ' ') s--
    let base, bStart
    if (c[s] === 'e' && !/[a-zA-Z\\]/.test(c[s - 1] ?? '')) {
      if (ev === 0) continue
      const v = Math.exp(ev)
      out.push({ tex: c.slice(s, eEnd + 1), val: v })
      continue
    }
    if (/\d/.test(c[s])) {
      bStart = s
      while (bStart > 0 && /[\d.]/.test(c[bStart - 1])) bStart--
      base = c.slice(bStart, s + 1)
    } else if (c[s] === ')') {
      // back to the matching bracket (\left( … \right) too)
      let d = 0, k = s
      for (; k >= 0; k--) {
        if (c[k] === ')') d++
        else if (c[k] === '(' && --d === 0) break
      }
      if (k < 0) continue
      bStart = c.slice(0, k).endsWith('\\left') ? k - 5 : k
      base = c.slice(bStart, s + 1)
    } else continue
    // a base that is a whole word's tail (x2) or an index is not a power of a number
    if (/[a-zA-Z_]$/.test(c.slice(0, bStart))) continue
    const bv = workTexValue(base)
    if (bv == null || !Number.isInteger(ev) || ev < 2 || bv === 1 || bv === 0) continue
    // a small whole number squared or cubed is done in your head
    if (Number.isInteger(bv) && Math.abs(bv ** ev) <= 1000) continue
    // a fraction 1/k to a power is 1/k^e, written as a fraction
    const fr = /^\\left\(\\tfrac\{1\}\{(\d+)\}\\right\)$|^\(\\tfrac\{1\}\{(\d+)\}\)$/.exec(base.replace(/\s+/g, ''))
    if (fr) {
      const k = +(fr[1] ?? fr[2])
      out.push({ tex: `${base}^{${e}} = \\tfrac{1}{${k}^{${e}}}`, val: 1 / k ** ev, frac: `\\tfrac{1}{${num(k ** ev)}}` })
      continue
    }
    out.push({ tex: `${base}^{${e}}`, val: bv ** ev })
  }
  return out
}
// "\Big[F\Big]_{a}^{b}": F at the top, F at the bottom, top minus bottom (times what is in front)
function workBracket(c, next, nextVal, wrap = (s, tok) => tok) {
  const open = c.search(/\\Big\[/)
  if (open < 0) return null
  const close = c.indexOf('\\Big]', open)
  if (close < 0) return null
  const inner = c.slice(open + 5, close)
  const lim = /^\\Big\](?:_\{([^{}]*)\}|_(\S))\^(?:\{([^{}]*)\}|(\S))/.exec(c.slice(close))
  if (!lim) return null
  const loTex = lim[1] ?? lim[2], hiTex = lim[3] ?? lim[4]
  // the limits as the row colours them (a limit from the question keeps its chip's colour)
  const loAt = close + lim[0].indexOf(loTex, 5), hiAt = close + lim[0].lastIndexOf(hiTex)
  const loShown = wrap(loAt, loTex), hiShown = wrap(hiAt, hiTex)
  const lo = workTexValue(loTex), hi = workTexValue(hiTex)
  if (lo == null || hi == null) return null
  const v = /t/.test(inner.replace(/\\[a-zA-Z]+/g, '')) && !/x/.test(inner.replace(/\\[a-zA-Z]+/g, '')) ? 't' : 'x'
  const F = workTexFn(inner, [v])
  if (!F) return null
  const Fb = F({ [v]: hi }), Fa = F({ [v]: lo })
  if (![Fb, Fa].every(Number.isFinite)) return null
  const diff = Fb - Fa
  // what multiplies the bracket: a number (\tfrac{1}{2}), a letter (c), or nothing
  const front = c.slice(0, open).replace(/^\s*(?:=|\\approx)\s*/, '').trim()
  const frontVal = front ? workTexValue(front) : 1
  const letterFront = front && frontVal == null && /^[a-zA-Z]$/.test(front)
  if (front && frontVal == null && !letterFront) return null
  const total = (frontVal ?? 1) * diff
  // the step after it must agree (a letter in front stays a letter: "= 2c")
  const ok = nextVal == null ? false : letterFront ? workClose(diff, nextVal) : workClose(total, nextVal) || workClose(diff, nextVal)
  if (!ok) return null
  // the question's numbers inside it keep their colours
  let shown = inner
  for (const t of numberTokens(inner, true).reverse()) shown = shown.slice(0, t.start) + wrap(open + 5 + t.start, t.tok) + shown.slice(t.end)
  const neg = x => (x < 0 ? `(${num(x, 4)})` : num(x, 4))
  const rows = [
    `${workTexSub(shown, v, hi, hiShown)} &${workShown(Fb)}`,
    `${workTexSub(shown, v, lo, loShown)} &${workShown(Fa)}`,
    `${num(Fb, 4)} - ${neg(Fa)} &${workShown(diff)}`,
  ]
  if (front && frontVal != null && Math.abs(frontVal - 1) > 1e-12) rows.push(`${front} \\cdot ${num(diff, 4)} &${workShown(total)}`)
  return { order: [], label: `Top minus bottom: ${v} = ${num(hi)}, then ${v} = ${num(lo)}`, plain: true, tex: () => rows[0].replace('&', ''), steps: () => rows.slice(1) }
}
// E(X) = Σ x f(x) and E(X²) = Σ x² f(x) for a discrete pdf the question gives, when the
// work states them without the sum (the variance questions)
function workSums(p, rows) {
  const pdf = questionPdf(p)
  if (!pdf || pdf.kind !== 'discrete' || !pdf.finite || pdf.xs.length > 8) return []
  const out = []
  rows.forEach((row, r) => {
    const m = /^\s*E\((X|X\^\{?2\}?)\)\s*$/.exec(row[0] ?? '')
    if (!m || row.length !== 2) return
    const sq = m[1] !== 'X'
    const stated = workTexValue(row[1].replace(/^\s*(?:=|\\approx)\s*/, ''))
    const terms = pdf.xs.map(x => (sq ? x * x : x) * pdf.f(x))
    const sum = terms.reduce((a, b) => a + b, 0)
    if (!workClose(sum, stated, 1e-6)) return
    const each = pdf.xs.map(x => `${x < 0 ? `(${x})` : x}${sq ? '^2' : ''} \\cdot ${pdf.fTex(x)}`)
    const top = pdf.common ? pdf.xs.reduce((a, x) => a + (sq ? x * x : x) * pdf.top(x), 0) : null
    const rowsT = [`E(X${sq ? '^2' : ''}) = \\sum x${sq ? '^2' : ''} f(x)`, `= ${each.join(' + ')}`]
    if (top != null) rowsT.push(`= \\tfrac{${num(top)}}{${pdf.common}}`)
    rowsT.push(`${rel(exact(sum, 4))} ${num(sum, 5)}`)
    out.push({ r, j: 0, line: { order: [], label: sq ? 'How to get E(X²): square each x, weight it by f(x), add' : 'How to get E(X): each x times its f(x), added', tex: () => rowsT[0], steps: () => rowsT.slice(1) } })
  })
  return out
}

// ---------- table lookups ----------
// the table cells a worked answer reads, found by checking the class's own table
// against the numbers in the work (so a cell is only shown if it really is the one)
function findLookups(p, level) {
  const work = workOf(p)
  if (!work) return []
  tables ??= printedTables()
  const toks = src => numberTokens(src ?? '', true, true)
  const workToks = toks(work).map(t => t.tok.replace('−', '-'))
  const inWork = str => workToks.includes(str) || workToks.includes('-' + str)
  const out = []
  const add = spec => {
    if (out.length < 2 && !out.some(o => o.name === spec.name && o.row === spec.row && o.col === spec.col)) out.push(spec)
  }
  if (level === 'Normal table' || level === 'Normal word problems') {
    // read backwards: "the closest entry to A is E" / "A is the entry at z"
    const back = [...work.matchAll(/closest entry to \}\s*(-?[\d.]+)\s*\\text\{ is \}\s*(-?[\d.]+)/g)].map(m => ({ target: m[1], entry: m[2] }))
    for (const m of work.matchAll(/(-?[\d.]+)\s*\\text\{ is the entry at \}/g)) back.push({ target: m[1], entry: (+m[1]).toFixed(4) })
    // "left area A: z = …": the entry closest to A
    // ("P(X < x) = 0.025, a left area": the share itself is the left area)
    const areas = [...work.matchAll(/left area \}\s*(\d*\.?\d+)|(\d*\.?\d+),?\s*\\text\{ a left area\}/g)].map(m => m[1] ?? m[2])
    // a z: two decimals, or anything written as "z = …"; never a row or column label
    const isZ = (src, t) => !/\\text\{(?:row|column) \}\s*$/.test(src.slice(0, t.start)) &&
      (/^-?\d\.\d\d$/.test(t.tok.replace('−', '-')) || /z(?:_\{?[\w.]*\}?)? = $/.test(src.slice(0, t.start)))
    const zs = [...toks(work).filter(t => isZ(work, t)), ...toks(p.latex ?? '').filter(t => isZ(p.latex ?? '', t))].filter(t => Math.abs(t.val) < 4)
    for (const t of zs) {
      const cell = zCell(t.val)
      const entry = cellOf('normal', cell.row, cell.col)
      if (!entry) continue
      const b = back.find(x => x.entry === entry)
      const area = areas.find(A => closestZ(+A).includes(Math.round(t.val * 100)))
      if (b) add({ name: 'normal', ...cell, target: b.target })
      else if (area != null) {
        const two = closestZ(+area)
        add({ name: 'normal', ...cell, target: area, halfway: two.length === 2 ? two.map(z => z / 100).sort((a, b) => a - b) : null })
      }
      else if (inWork(entry)) add({ name: 'normal', ...cell })
    }
  } else if (level === 'Binomial table') {
    const n = /n = (19|20) table/.exec(p.hint?.text ?? '')?.[1]
    const col = /column p = (\d*\.?\d+)/.exec(p.hint?.text ?? '')?.[1]
    if (n && col) {
      const name = n === '19' ? 'binomial19' : 'binomial'
      for (const m of work.matchAll(/F\((\d+)\)/g)) {
        const entry = cellOf(name, m[1], col)
        if (entry && inWork(entry)) add({ name, row: m[1], col })
      }
    }
  } else if (level === 'Chi-squared table') {
    const g = /γ = (\d+)/.exec(p.text ?? '')?.[1] ?? [...work.matchAll(/\\gamma = (\d+)/g)].at(-1)?.[1]
    const t = tables.chi2
    const r = g && t.rows[+g - 1]
    if (r) {
      const qToks = toks(p.latex).map(x => x.tok)
      r.values.forEach((v, j) => {
        if (inWork(v) || qToks.includes(v)) add({ name: 'chi2', row: g, col: t.cols[j], target: qToks.includes(v) ? v : null })
      })
    }
  }
  return out
}
// the spot in the work a lookup gives: the entry it reads, or (read backwards) the z or the
// column it finds. The lookup plays just before that step, and the number flies from the table.
function lookSpot(spec, rows, taken) {
  let want
  if (spec.target == null) want = cellOf(spec.name, spec.row, spec.col)
  else if (spec.name === 'normal') want = (spec.row.startsWith('-') ? '-' : '') + (Math.abs(+spec.row) + +spec.col).toFixed(2)
  else want = spec.col
  if (want == null) return null
  const colourable = c => new Set(numberTokens(c, true).map(t => t.start))
  for (let r = 0; r < rows.length; r++) for (let j = 0; j < rows[r].length; j++) {
    const can = colourable(rows[r][j])
    for (const t of numberTokens(rows[r][j], true, true)) {
      const sp = t.tok.replace('−', '-')
      if ((sp === want || (spec.target != null && spec.name === 'chi2' && +sp === +want)) && !taken.some(x => x.r === r && x.j === j && x.start === t.start)) {
        // in words ("halfway between −1.65 and −1.64"): the lookup plays there, nothing flies
        return can.has(t.start) ? { r, j, start: t.start, end: t.end, tok: t.tok } : { r, j, start: -1, end: -1, tok: t.tok, words: true }
      }
    }
  }
  return null
}
