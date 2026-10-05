// js/24c-plug-levels.js · the section levels' questions (3.4–3.8, and 4.1's uniform): a number to find, worked like World 0
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the section levels' questions: a number to find, worked like World 0 ----------
// A question is a story (js/24b-plug-stories.js) and one thing to find about its X: P[X = x],
// a cumulative probability (at most, fewer than, at least, more than, between), the mean,
// the variance, E[X²], σ, the values X can take, or k = λs; for a uniform, the height of its
// pdf, F(x) or the chance of a stretch. Its worked answer plays in
// plugPanel like World 0's: the story's numbers fly into the formula, every piece is worked
// on the side, the answer is boxed, and the distribution is drawn with the asked part lit.
// p.plug holds that animation (leaf, lines, title, plan, trap, graph); p.slips the real
// mistakes (a number and what it does), and p.distractors their numbers.

// ---------- events: what a question asks about X ----------
// op: eq, le (at most), lt (fewer than), ge (at least), gt (more than), or in (a ≤ X ≤ b)
const PL_OPS = { eq: '=', le: '\\le', lt: '<', ge: '\\ge', gt: '>' }
const PL_SAYS = { eq: '=', le: '≤', lt: '<', ge: '≥', gt: '>' }
const plHas = (ev, x) => (ev.op === 'in' ? x >= ev.a && x <= ev.b : ev.op === 'eq' ? x === ev.x : ev.op === 'le' ? x <= ev.x : ev.op === 'lt' ? x < ev.x : ev.op === 'ge' ? x >= ev.x : x > ev.x)
// the event in symbols: TeX, plain text, and with its numbers as slots that fly in
const plEvTex = ev => (ev.op === 'in' ? `P[${ev.a} \\le X \\le ${ev.b}]` : `P[X ${PL_OPS[ev.op]} ${ev.x}]`)
const plEvSay = ev => (ev.op === 'in' ? `P[${ev.a} ≤ X ≤ ${ev.b}]` : `P[X ${PL_SAYS[ev.op]} ${ev.x}]`)
const plEvSlot = (s, ev) => (ev.op === 'in' ? `P[${s('a')} \\le X \\le ${s('b')}]` : `P[X ${PL_OPS[ev.op]} ${s('x')}]`)
const plEvKeys = ev => (ev.op === 'in' ? ['a', 'b'] : ['x'])
// the same question about the other side, n − X: "at least 8 survive" is "at most 2 die"
const plFlipEv = (ev, n) => ({ op: { eq: 'eq', le: 'ge', lt: 'gt', ge: 'le', gt: 'lt' }[ev.op], x: n - ev.x })
// the words: "at most 4", "fewer than 4", "at least one", "between 2 and 5"
const plWords = ev => (ev.op === 'in' ? `between ${ev.a} and ${ev.b}` : ev.op === 'ge' && ev.x === 1 ? 'at least one' : `${{ eq: 'exactly', le: 'at most', lt: 'fewer than', ge: 'at least', gt: 'more than' }[ev.op]} ${ev.x}`)
const plList = xs => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}` : String(xs[0]))
// a number as an answer option shows it (4 significant figures)
const plLabel = x => String(parseFloat(Math.abs(x) < 1 ? x.toPrecision(4) : x.toFixed(4)))

// ---------- probabilities ----------
// P[event], adding up terms of the pdf (an open top is 1 minus the values below it)
function plProb(leaf, v, ev) {
  const c = countOf(leaf, v)
  let s = 0
  if (c.hi === Infinity && (ev.op === 'ge' || ev.op === 'gt')) {
    for (let x = c.lo; !plHas(ev, x); x++) s += c.pmf(x)
    return 1 - s
  }
  const end = c.hi === Infinity ? (ev.op === 'in' ? ev.b : ev.x) : c.hi
  for (let x = c.lo; x <= end; x++) if (plHas(ev, x)) s += c.pmf(x)
  return s
}
// the n = 20 table: F(x) = P[X ≤ x], to 4 decimals, as printed
const plF20 = (p, x) => (x < 0 ? 0 : x >= 20 ? 1 : +cellOf('binomial', String(x), fmt(p)))
const plR4 = y => +y.toFixed(4)
function plTable(p, ev) {
  const F = x => plF20(p, x)
  if (ev.op === 'le') return F(ev.x)
  if (ev.op === 'lt') return F(ev.x - 1)
  if (ev.op === 'ge') return plR4(1 - F(ev.x - 1))
  if (ev.op === 'gt') return plR4(1 - F(ev.x))
  if (ev.op === 'in') return plR4(F(ev.b) - F(ev.a - 1))
  return plR4(F(ev.x) - F(ev.x - 1))
}
// the values a sum adds up, and whether the answer is 1 minus their sum: the shorter
// side, so no more terms than needed; with no top value, "at least" is always 1 − the rest
function plSide(leaf, v, ev) {
  const c = countOf(leaf, v)
  const end = c.hi === Infinity ? (ev.op === 'in' ? ev.b : ev.x) : c.hi
  const inside = [], outside = []
  for (let x = c.lo; x <= end; x++) (plHas(ev, x) ? inside : outside).push(x)
  if (c.hi === Infinity) return ev.op === 'ge' || ev.op === 'gt' ? { xs: outside, minus: true } : { xs: inside, minus: false }
  return outside.length < inside.length && ev.op !== 'in' ? { xs: outside, minus: true } : { xs: inside, minus: false }
}
// how a question works its probability out: one term, the geometric's shortcuts, the
// n = 20 table (the test gives it), or adding up terms
const PL_TABLE_P = ['0.1', '0.2', '0.25', '0.3', '0.4', '0.5', '0.6', '0.7', '0.75', '0.8', '0.9']
const plMethod = (leaf, v, ev) => (ev.op === 'eq' ? 'exact' : leaf === 'geometric' ? 'shortcut' : leaf === 'binomial' && v.n === 20 && PL_TABLE_P.includes(fmt(v.p)) ? 'table' : 'sum')
const plValue = (q, ev, v = q.v) => (q.method === 'table' ? plTable(v.p, ev) : plProb(q.leaf, v, ev))

// ---------- the work, as plugPanel lines ----------
// a line: { order: the numbers that fly in, tex: s => the formula with slots, steps (rows of
// work), pieces (worked on the side), finish, look (a table), mid (on the way, not boxed) }
const plSteps = rows => () => rows.filter(Boolean)
// one term of a pdf, worked in a row
function plTermRow(leaf, v, T, x) {
  const f = countOf(leaf, v).pmf(x)
  if (leaf === 'binomial') {
    const C = choose(v.n, x), A = v.p ** x, B = v.q ** (v.n - x)
    return `f(${x}) &= \\binom{${v.n}}{${x}}${base(T.p)}^{${x}}${base(T.q)}^{${v.n - x}} ${rel(exact(A, 5) && exact(B, 5))} ${num(C)} \\cdot ${num(A, 5)} \\cdot ${num(B, 5)} ${rel(exact(f))} ${num(f)}`
  }
  if (leaf === 'negbin') {
    const C = choose(x - 1, v.r - 1), P = v.p ** v.r, Q = v.q ** (x - v.r)
    return `f(${x}) &= \\binom{${x - 1}}{${v.r - 1}}${base(T.p)}^{${v.r}}${base(T.q)}^{${x - v.r}} ${rel(exact(P, 5) && exact(Q, 5))} ${num(C)} \\cdot ${num(P, 5)} \\cdot ${num(Q, 5)} ${rel(exact(f))} ${num(f)}`
  }
  const C1 = choose(v.r, x), C2 = choose(v.N - v.r, v.n - x), C3 = choose(v.N, v.n)
  return `f(${x}) &= \\frac{\\binom{${v.r}}{${x}}\\binom{${v.N - v.r}}{${v.n - x}}}{\\binom{${v.N}}{${v.n}}} = \\frac{${num(C1)} \\cdot ${num(C2)}}{${num(C3)}} ${rel(exact(f))} ${num(f)}`
}
// the pdf with the story's numbers flying in (x stays x)
const PL_PDF = {
  binomial: { order: ['n', 'p', 'q'], tex: s => `f(x) = \\binom{${s('n')}}{x}${s('p', 1)}^{x}${s('q', 1)}^{${s('n')}-x}` },
  negbin: { order: ['r', 'p', 'q'], tex: s => `f(x) = \\binom{x-1}{${s('r')}-1}${s('p', 1)}^{${s('r')}}${s('q', 1)}^{x-${s('r')}}` },
  hyper: { order: ['N', 'r', 'n'], tex: s => `f(x) = \\frac{\\binom{${s('r')}}{x}\\binom{${s('N')}-${s('r')}}{${s('n')}-x}}{\\binom{${s('N')}}{${s('n')}}}` },
}
const PL_PDF_TEX = { geometric: 'q^{x-1}p', binomial: '\\binom{n}{x}p^x q^{n-x}', negbin: '\\binom{x-1}{r-1}p^r q^{x-r}', hyper: '\\frac{\\binom{r}{x}\\binom{N-r}{n-x}}{\\binom{N}{n}}', poisson: '\\frac{e^{-k}k^x}{x!}' }
// one value: P[X = x], every piece worked, like World 0
function plExactLines(q) {
  const { leaf, v, T } = q, x = q.ev.x, lhs = `P[X = ${x}]`
  const done = (ok, parts, f) => ({ lhs, steps: () => [`${rel(ok)} ${parts}`, `${rel(exact(f))} ${num(f)}`] })
  if (leaf === 'geometric') {
    const Q = v.q ** (x - 1)
    return [{ order: ['x', 'p', 'q'], tex: s => `P[X = ${s('x')}] = ${s('q', 1)}^{${s('x')}-1}${s('p', 2)}`,
      steps: () => [`= ${base(T.q)}^{${x - 1}}${base(T.p)}`],
      pieces: () => [powPiece([[T.q, v.q, x - 1]])],
      finish: () => done(exact(Q, 5) && (/frac/.test(T.p) || exact(v.p, 5)), `${num(Q, 5)} \\cdot ${factor(v.p, T.p)}`, Q * v.p) }]
  }
  if (leaf === 'binomial') {
    const C = choose(v.n, x), A = v.p ** x, B = v.q ** (v.n - x)
    return [{ order: ['x', 'n', 'p', 'q'], tex: s => `P[X = ${s('x')}] = \\binom{${s('n')}}{${s('x')}}${s('p', 1)}^{${s('x')}}${s('q', 1)}^{${s('n')}-${s('x')}}`,
      steps: () => [`= \\binom{${v.n}}{${x}}${base(T.p)}^{${x}}${base(T.q)}^{${v.n - x}}`],
      pieces: () => [chooseWork(v.n, x), powPiece([[T.p, v.p, x], [T.q, v.q, v.n - x]])],
      finish: () => done(exact(A, 5) && exact(B, 5), `${num(C)} \\cdot ${num(A, 5)} \\cdot ${num(B, 5)}`, C * A * B) }]
  }
  if (leaf === 'negbin') {
    const C = choose(x - 1, v.r - 1), P = v.p ** v.r, Q = v.q ** (x - v.r)
    return [{ order: ['x', 'r', 'p', 'q'], tex: s => `P[X = ${s('x')}] = \\binom{${s('x')}-1}{${s('r')}-1}${s('p', 1)}^{${s('r')}}${s('q', 1)}^{${s('x')}-${s('r')}}`,
      steps: () => [`= \\binom{${x - 1}}{${v.r - 1}}${base(T.p)}^{${v.r}}${base(T.q)}^{${x - v.r}}`],
      pieces: () => [chooseWork(x - 1, v.r - 1), powPiece([[T.p, v.p, v.r], [T.q, v.q, x - v.r]])],
      finish: () => done(exact(P, 5) && exact(Q, 5), `${num(C)} \\cdot ${num(P, 5)} \\cdot ${num(Q, 5)}`, C * P * Q) }]
  }
  if (leaf === 'hyper') {
    const C1 = choose(v.r, x), C2 = choose(v.N - v.r, v.n - x), C3 = choose(v.N, v.n), f = (C1 * C2) / C3
    return [{ order: ['x', 'N', 'r', 'n'], tex: s => `P[X = ${s('x')}] = \\frac{\\binom{${s('r')}}{${s('x')}}\\binom{${s('N')}-${s('r')}}{${s('n')}-${s('x')}}}{\\binom{${s('N')}}{${s('n')}}}`,
      steps: () => [`= \\frac{\\binom{${v.r}}{${x}}\\binom{${v.N - v.r}}{${v.n - x}}}{\\binom{${v.N}}{${v.n}}}`],
      pieces: () => [chooseWork(v.r, x), chooseWork(v.N - v.r, v.n - x), chooseWork(v.N, v.n)],
      finish: () => ({ lhs, steps: () => [`= \\frac{${num(C1)} \\cdot ${num(C2)}}{${num(C3)}}`, `${rel(exact(C1 * C2) && exact(C3))} \\frac{${num(C1 * C2)}}{${num(C3)}}`, `${rel(exact(f))} ${num(f)}`] }) }]
  }
  const E = Math.exp(-v.k), K = v.k ** x, F = fact(x)
  return [{ order: ['x', 'k'], tex: s => `P[X = ${s('x')}] = \\frac{e^{-${s('k')}}${s('k', 1)}^{${s('x')}}}{${s('x')}!}`,
    pieces: () => [calcPiece([[`e^{-${T.k}}`, E], ...(x >= 2 ? [[`${base(T.k)}^{${x}}`, K]] : [])]), factWork(x)],
    finish: () => ({ lhs, steps: () => [`${rel(exact(E, 5) && exact(K, 5))} \\frac{${num(E, 5)} \\cdot ${num(K, 5)}}{${num(F)}}`, `${rel(exact((E * K) / F))} ${num((E * K) / F)}`] }) }]
}
// the geometric's shortcuts, from the cdf you derive: F(x) = 1 − qˣ and P[X > x] = qˣ
function plShortcutLines(q) {
  const { v, T, ev, answer: ans } = q, x = ev.x
  const pw = e => `${base(T.q)}^{${e}}`, Q = e => v.q ** e
  const end = `${rel(exact(ans))} ${num(ans)}`
  if (ev.op === 'le') return [{ order: ['x', 'q'], tex: s => `P[X \\le ${s('x')}] = 1 - ${s('q', 1)}^{${s('x')}}`, steps: plSteps([`${rel(exact(Q(x), 5))} 1 - ${num(Q(x), 5)}`, end]) }]
  if (ev.op === 'lt') return [{ order: ['x', 'q'], tex: s => `P[X < ${s('x')}] = P[X \\le ${s('x')} - 1] = 1 - ${s('q', 1)}^{${s('x')}-1}`, steps: plSteps([`= 1 - ${pw(x - 1)}`, `${rel(exact(Q(x - 1), 5))} 1 - ${num(Q(x - 1), 5)}`, end]) }]
  if (ev.op === 'ge') return [{ order: ['x', 'q'], tex: s => `P[X \\ge ${s('x')}] = P[X > ${s('x')} - 1] = ${s('q', 1)}^{${s('x')}-1}`, steps: plSteps([`= ${pw(x - 1)}`, end]) }]
  if (ev.op === 'gt') return [{ order: ['x', 'q'], tex: s => `P[X > ${s('x')}] = ${s('q', 1)}^{${s('x')}}`, steps: plSteps([end]) }]
  const { a, b } = ev
  return [
    { mid: true, order: ['a', 'b'], tex: s => `P[${s('a')} \\le X \\le ${s('b')}] = F(${s('b')}) - F(${s('a')} - 1)`,
      steps: plSteps([`= F(${b}) - F(${a - 1})`, `= (1 - q^{${b}}) - (1 - q^{${a - 1}})`, `= q^{${a - 1}} - q^{${b}}`]) },
    { order: ['q'], tex: s => `P[${a} \\le X \\le ${b}] = ${s('q', 1)}^{${a - 1}} - ${s('q', 1)}^{${b}}`,
      steps: plSteps([`${rel(exact(Q(a - 1), 5) && exact(Q(b), 5))} ${num(Q(a - 1), 5)} - ${num(Q(b), 5)}`, end]) },
  ]
}
// the Poisson's terms with e^(−k) pulled out: e^(−k)(1 + k + k²/2! + …); kPow is k as a base
function plPoisTerms(xs, k, kPow = k) {
  const one = t => (t === 0 ? '1' : t === 1 ? k : `\\frac{${kPow}^{${t}}}{${t}!}`)
  return `e^{-${k}}\\left(${xs.map(one).join(' + ')}\\right)`
}
// the event's first line: the values to add (terms), or 1 minus the other side (inner)
function plEventLine(q, minus, inner, terms) {
  const { ev } = q
  const lhs = s => plEvSlot(s, ev)
  const rest = terms ? [`= ${minus ? (terms.includes('+') ? `1 - \\left[${terms}\\right]` : `1 - ${terms}`) : terms}`] : []
  const line = (tex, rows) => ({ mid: true, order: plEvKeys(ev), tex, steps: plSteps(rows) })
  if (!minus) {
    if (ev.op === 'lt') return line(s => `${lhs(s)} = P[X \\le ${s('x')} - 1]`, [`= ${inner}`, ...rest])
    if (ev.op === 'gt') return line(s => `${lhs(s)} = P[X \\ge ${s('x')} + 1]`, [`= ${inner}`, ...rest])
    return line(s => `${lhs(s)} = ${terms}`, [])
  }
  const other = { ge: s => `P[X \\le ${s('x')} - 1]`, gt: s => `P[X \\le ${s('x')}]`, le: s => `P[X \\ge ${s('x')} + 1]`, lt: s => `P[X \\ge ${s('x')}]` }[ev.op]
  return line(s => `${lhs(s)} = 1 - ${other(s)}`, [(ev.op === 'ge' || ev.op === 'le') && `= 1 - ${inner}`, ...rest])
}
// adding up terms: the event, the pdf with the numbers in, each term, the total
function plSumLines(q) {
  const { leaf, v, T, ev } = q
  const { xs, minus } = plSide(leaf, v, ev)
  // the side that gets added up, as an event
  const inner = minus
    ? { ge: `P[X \\le ${ev.x - 1}]`, gt: `P[X \\le ${ev.x}]`, le: `P[X \\ge ${ev.x + 1}]`, lt: `P[X \\ge ${ev.x}]` }[ev.op]
    : ev.op === 'lt' ? `P[X \\le ${ev.x - 1}]` : ev.op === 'gt' ? `P[X \\ge ${ev.x + 1}]` : plEvTex(ev)
  const pmf = countOf(leaf, v).pmf
  const S = xs.reduce((t, x) => t + pmf(x), 0)
  const total = `${rel(exact(S))} ${num(S)}`
  const lines = []
  if (leaf === 'poisson') {
    // the k's fly into every term; e^(−k) and each kˣ/x! go on the calculator
    const turn = minus || ev.op === 'lt' || ev.op === 'gt'
    if (turn) lines.push(plEventLine(q, minus, inner, null))
    const E = Math.exp(-v.k), parts = xs.map(t => v.k ** t / fact(t)), inside = parts.reduce((a, b) => a + b, 0)
    const shown = xs.map((t, i) => (t === 0 ? '1' : t === 1 ? T.k : num(parts[i], 4)))
    lines.push({ order: turn ? ['k'] : [...plEvKeys(ev), 'k'], tex: s => `${turn ? inner : plEvSlot(s, ev)} = ${plPoisTerms(xs, s('k'), s('k', 1))}`,
      pieces: () => [calcPiece([[`e^{-${T.k}}`, E], ...xs.filter(t => t >= 2).map(t => [`\\frac{${base(T.k)}^{${t}}}{${t}!}`, v.k ** t / fact(t)])])],
      finish: () => ({ lhs: inner, mid: minus, steps: () => [`${rel(exact(E, 5))} ${num(E, 5)}\\left(${shown.join(' + ')}\\right)`, `${rel(exact(E, 5) && exact(inside, 5))} ${num(E, 5)} \\cdot ${num(inside, 5)}`, total] }) })
  } else {
    const rows = xs.map(t => plTermRow(leaf, v, T, t))
    lines.push(plEventLine(q, minus, inner, xs.map(t => `f(${t})`).join(' + ')))
    lines.push({ ...PL_PDF[leaf], mid: true, tail: () => `\\quad \\text{for } x = ${xs.join(', ')}` })
    lines.push({ order: [], label: xs.length > 1 ? 'Each term' : 'The term', plain: true, tex: () => rows[0].replace('&', ''), steps: () => rows.slice(1) })
    lines.push({ order: [], lhs: inner, mid: minus, steps: () => (xs.length > 1 ? [`${rel(xs.every(t => exact(pmf(t))))} ${xs.map(t => num(pmf(t))).join(' + ')}`, total] : [total]) })
  }
  if (minus) lines.push({ order: [], lhs: plEvTex(ev), steps: () => [`${rel(exact(S))} 1 - ${num(S)}`, `${rel(exact(q.answer))} ${num(q.answer)}`] })
  return lines
}
// the n = 20 table: write it with F, read each F off the table, finish
function plTableLines(q) {
  const { v, T, ev } = q
  const F = t => cellOf('binomial', String(t), fmt(v.p))
  const reads = ev.op === 'le' ? [ev.x] : ev.op === 'lt' || ev.op === 'ge' ? [ev.x - 1] : ev.op === 'gt' ? [ev.x] : ev.a > 0 ? [ev.b, ev.a - 1] : [ev.b]
  const lhs = s => plEvSlot(s, ev)
  const first = {
    le: { tex: s => `${lhs(s)} = F(${s('x')})` },
    lt: { tex: s => `${lhs(s)} = P[X \\le ${s('x')} - 1] = F(${s('x')} - 1)`, steps: plSteps([`= F(${ev.x - 1})`]) },
    ge: { tex: s => `${lhs(s)} = 1 - P[X \\le ${s('x')} - 1] = 1 - F(${s('x')} - 1)`, steps: plSteps([`= 1 - F(${ev.x - 1})`]) },
    gt: { tex: s => `${lhs(s)} = 1 - P[X \\le ${s('x')}] = 1 - F(${s('x')})` },
    in: ev.a > 0 ? { tex: s => `${lhs(s)} = F(${s('b')}) - F(${s('a')} - 1)`, steps: plSteps([`= F(${ev.b}) - F(${ev.a - 1})`]) } : { tex: s => `${lhs(s)} = F(${s('b')})` },
  }[ev.op]
  const lines = [{ mid: true, order: plEvKeys(ev), ...first }]
  // the table's own answer when one F is all it takes
  const last = reads.length === 1 && (ev.op === 'le' || ev.op === 'lt' || ev.op === 'in')
  const pIs = T.p === fmt(v.p) ? '' : ` = ${fmt(v.p)}`
  reads.forEach((t, i) => lines.push({ order: i ? [] : ['n', 'p'], mid: !last, answer: last,
    tex: s => `F(${t}) = \\text{row } ${t} \\text{ of the } n = ${i ? 20 : s('n')} \\text{ table, column } p = ${i ? fmt(v.p) : s('p') + pIs}`,
    steps: plSteps([`= ${F(t)}`]), look: () => ({ name: 'binomial', row: String(t), col: fmt(v.p) }) }))
  if (!last) lines.push({ order: [], lhs: plEvTex(ev), steps: () => [ev.op === 'in' ? `= ${F(ev.b)} - ${F(ev.a - 1)}` : `= 1 - ${F(reads[0])}`, `= ${q.answer.toFixed(4)}`] })
  return lines
}
// a question about the other side ("at least 8 survive"): first turn it into one about X
function plOtherLine(q) {
  const { st, ev, said } = q
  const w = said.op === 'ge' && said.x === 1 ? 'at least 1' : plWords(said)
  return { mid: true, order: ['n'], tex: s => `P[\\text{${w} ${st.otherIs}}] = P[X ${PL_OPS[ev.op]} ${s('n')} - ${said.x}]`, steps: plSteps([`= ${plEvTex(ev)}`]) }
}

// ---------- the mean, the variance, E[X²], σ ----------
const plMoments = (leaf, v) => {
  if (leaf === 'geometric') return { mean: 1 / v.p, var: v.q / v.p ** 2 }
  if (leaf === 'binomial') return { mean: v.n * v.p, var: v.n * v.p * v.q }
  if (leaf === 'negbin') return { mean: v.r / v.p, var: (v.r * v.q) / v.p ** 2 }
  if (leaf === 'hyper') return { mean: (v.n * v.r) / v.N, var: v.n * (v.r / v.N) * ((v.N - v.r) / v.N) * ((v.N - v.n) / (v.N - 1)) }
  return { mean: v.k, var: v.k }
}
// the formula with its slots, and its rows of work; head is what stands on the left
function plMomentLine(leaf, what, v, head = null) {
  const m = plMoments(leaf, v)
  const val = what === 'mean' ? m.mean : m.var
  const end = `${rel(exact(val))} ${num(val)}`
  const lhs = s => (head ? head(s) : what === 'mean' ? 'E[X]' : '\\operatorname{Var}X')
  if (leaf === 'geometric') return what === 'mean'
    ? { order: ['p'], tex: s => `${lhs(s)} = \\frac{1}{${s('p')}}`, steps: plSteps([end]) }
    : { order: ['p', 'q'], tex: s => `${lhs(s)} = \\frac{${s('q')}}{${s('p', 2)}^{2}}`, steps: plSteps([`${rel(exact(v.q, 5) && exact(v.p ** 2, 5))} \\frac{${num(v.q, 5)}}{${num(v.p ** 2, 5)}}`, end]) }
  if (leaf === 'binomial') return what === 'mean'
    ? { order: ['n', 'p'], tex: s => `${lhs(s)} = ${s('n')}\\,${s('p', 2)}`, steps: plSteps([end]) }
    : { order: ['n', 'p', 'q'], tex: s => `${lhs(s)} = ${s('n')}\\,${s('p', 2)}${s('q', 2)}`, steps: plSteps([end]) }
  if (leaf === 'negbin') return what === 'mean'
    ? { order: ['r', 'p'], tex: s => `${lhs(s)} = \\frac{${s('r')}}{${s('p')}}`, steps: plSteps([end]) }
    : { order: ['r', 'p', 'q'], tex: s => `${lhs(s)} = \\frac{${s('r')}${s('q', 2)}}{${s('p', 2)}^{2}}`, steps: plSteps([`${rel(exact(v.r * v.q, 5) && exact(v.p ** 2, 5))} \\frac{${num(v.r * v.q, 5)}}{${num(v.p ** 2, 5)}}`, end]) }
  if (leaf === 'hyper') {
    const { N, r, n } = v
    return what === 'mean'
      ? { order: ['n', 'r', 'N'], tex: s => `${lhs(s)} = ${s('n')} \\cdot \\frac{${s('r')}}{${s('N')}}`, steps: plSteps([`= \\frac{${n * r}}{${N}}`, end]) }
      : { order: ['n', 'r', 'N'], tex: s => `${lhs(s)} = ${s('n')} \\cdot \\frac{${s('r')}}{${s('N')}} \\cdot \\frac{${s('N')} - ${s('r')}}{${s('N')}} \\cdot \\frac{${s('N')} - ${s('n')}}{${s('N')} - 1}`,
        steps: plSteps([`= ${n} \\cdot \\frac{${r}}{${N}} \\cdot \\frac{${N - r}}{${N}} \\cdot \\frac{${N - n}}{${N - 1}}`, `= \\frac{${num(n * r * (N - r) * (N - n))}}{${num(N * N * (N - 1))}}`, end]) }
  }
  return { order: ['k'], tex: s => `${lhs(s)} = ${s('k')}`, steps: plSteps([`= ${num(v.k)}`]) }
}
// a mean or a variance worked out first, then a chip to plug into E[X²] or σ
const plWorkedMoment = (leaf, what, v) => {
  const m = plMoments(leaf, v), val = what === 'mean' ? m.mean : m.var
  return worked(V(val, null, 'worked out above', num(val), plLabel(val)), plMomentLine(leaf, what, v, s => s(what)))
}

// ---------- slips: real mistakes, each a number and what it does ----------
// each why finishes the sentence "Your pick, 0.1074, …"
function plProbSlips(q) {
  const { leaf, v, ev } = q
  const out = []
  const lo = countOf(leaf, v).lo
  const add = (ev2, why, v2 = v) => out.push({ value: plValue(q, ev2, v2), why })
  const x = ev.x
  if (ev.op === 'eq') {
    add({ op: 'le', x }, `is P[X ≤ ${x}], every value up to ${x}: “exactly ${x}” is the one term f(${x}).`)
    add({ op: 'ge', x }, `is P[X ≥ ${x}]: “exactly ${x}” is the one term f(${x}).`)
    if (x - 1 >= lo) add({ op: 'eq', x: x - 1 }, `is f(${x - 1}): one value too low.`)
    add({ op: 'eq', x: x + 1 }, `is f(${x + 1}): one value too high.`)
    out.push({ value: 1 - q.answer, why: `is 1 − f(${x}): every value except ${x}.` })
  } else if (ev.op === 'le') {
    add({ op: 'lt', x }, `is P[X < ${x}]: it leaves out X = ${x}, and “at most ${x}” includes ${x}.`)
    add({ op: 'le', x: x + 1 }, `is P[X ≤ ${x + 1}]: one value too many.`)
    add({ op: 'eq', x }, `is f(${x}) alone: “at most ${x}” adds every value up to ${x}.`)
    add({ op: 'gt', x }, `is P[X > ${x}], the other side (1 minus the answer).`)
  } else if (ev.op === 'lt') {
    add({ op: 'le', x }, `is P[X ≤ ${x}]: “fewer than ${x}” stops at ${x - 1}.`)
    if (x - 2 >= lo) add({ op: 'le', x: x - 2 }, `is P[X ≤ ${x - 2}]: one value too few. “Fewer than ${x}” is at most ${x - 1}.`)
    add({ op: 'eq', x: x - 1 }, `is f(${x - 1}) alone: add every value below ${x}.`)
    add({ op: 'ge', x }, `is P[X ≥ ${x}], the other side (1 minus the answer).`)
  } else if (ev.op === 'ge') {
    add({ op: 'gt', x }, `is P[X > ${x}]: it leaves out X = ${x}, and “at least ${x}” includes ${x}.`)
    if (x - 1 > lo) add({ op: 'ge', x: x - 1 }, `is P[X ≥ ${x - 1}]: one value too many.`)
    add({ op: 'lt', x }, `is P[X ≤ ${x - 1}], the short side: the 1 − is missing.`)
    add({ op: 'eq', x }, `is f(${x}) alone: “at least ${x}” counts every value from ${x} up.`)
  } else if (ev.op === 'gt') {
    add({ op: 'ge', x }, `is P[X ≥ ${x}]: “more than ${x}” starts at ${x + 1}.`)
    add({ op: 'le', x }, `is P[X ≤ ${x}], the short side: the 1 − is missing.`)
    add({ op: 'eq', x: x + 1 }, `is f(${x + 1}) alone: “more than ${x}” counts every value above ${x}.`)
    add({ op: 'gt', x: x + 1 }, `is P[X > ${x + 1}]: one value too few.`)
  } else {
    const { a, b } = ev
    add({ op: 'in', a: a + 1, b }, `leaves out X = ${a}: F(${b}) − F(${a}) instead of F(${b}) − F(${a - 1}).`)
    add({ op: 'in', a, b: b - 1 }, `leaves out X = ${b}.`)
    add({ op: 'le', x: b }, `is F(${b}) = P[X ≤ ${b}]: the values below ${a} still need taking away.`)
    out.push({ value: 1 - q.answer, why: `is 1 minus the answer: the values outside ${a} to ${b}.` })
  }
  // p and q swapped: the chance of the other outcome
  if (v.q != null && Math.abs(v.p - v.q) > 1e-9) add(ev, `uses p = ${fmt(v.q)}, which is q: p = ${fmt(v.p)} is the chance of what X counts.`, { ...v, p: v.q, q: v.p })
  if (ev.op === 'eq') {
    if (leaf === 'geometric' && x > 1) out.push({ value: v.q ** (x - 1), why: `is q^${x - 1} alone: after the ${x - 1} ${x - 1 === 1 ? 'failure' : 'failures'}, the success itself has chance p.` })
    if (leaf === 'binomial') out.push({ value: v.p ** x * v.q ** (v.n - x), why: `leaves out C(${v.n}, ${x}): p^${x}q^${v.n - x} is one order of the successes, and C(${v.n}, ${x}) counts the orders.` })
    if (leaf === 'negbin') {
      out.push({ value: choose(x, v.r) * v.p ** v.r * v.q ** (x - v.r), why: `uses C(${x}, ${v.r}), as if any ${v.r} of the ${x} tries could be the successes: the ${plOrd(x)} try must be the ${plOrd(v.r)} success, so it is C(${x - 1}, ${v.r - 1}).` })
      out.push({ value: v.p ** v.r * v.q ** (x - v.r), why: `leaves out C(${x - 1}, ${v.r - 1}), the ways to place the first ${v.r - 1} ${v.r - 1 === 1 ? 'success' : 'successes'}.` })
    }
    if (leaf === 'poisson') out.push({ value: Math.exp(-v.k) * v.k ** x, why: `leaves out the ${x}! below.` })
  }
  // Poisson where it is binomial: a rate, when there is a fixed number of tries
  if (leaf === 'binomial') out.push({ value: plProb('poisson', { k: v.n * v.p }, ev), why: `is the Poisson with k = np = ${fmt(v.n * v.p)}: X counts successes in a fixed number of tries, so binomial.` })
  // binomial where it is hypergeometric: as if each draw were put back
  if (leaf === 'hyper') {
    const pb = v.r / v.N
    out.push({ value: plProb('binomial', { n: v.n, p: pb, q: 1 - pb }, ev), why: `is the binomial with p = r/N = ${fmt(pb)}, as if each draw were put back. Nothing is put back here: hypergeometric.` })
  }
  // k not scaled to the window
  if (leaf === 'poisson' && q.vars.lam && q.vars.s) {
    const lam = q.vars.lam.val
    if (Math.abs(lam - v.k) > 1e-9) add(ev, `uses k = λ = ${fmt(lam)}, the rate for one unit: this window has k = λs = ${fmt(v.k)}.`, { k: lam })
    if (q.st.raw && Math.abs(lam * q.st.raw - v.k) > 1e-9) add(ev, `uses s = ${q.st.raw} without changing its units: k = λs needs s in the rate’s units.`, { k: lam * q.st.raw })
  }
  return out
}
// a mean, a variance, E[X²] or σ: the formulas that get mixed up
function plMomentSlips(leaf, what, v, lam = null) {
  const m = plMoments(leaf, v), sd = Math.sqrt(m.var), out = []
  const add = (value, why) => out.push({ value, why })
  const k = leaf === 'poisson' && lam != null && Math.abs(lam - v.k) > 1e-9
  if (what === 'mean') {
    add(m.var, 'is the variance, not the mean.')
    add(sd, 'is σ, not the mean.')
    if (leaf === 'geometric') { add(1 / v.q, 'is 1/q: the mean is 1/p, with p the chance of the success X waits for.'); add(v.q / v.p, 'is q/p: the mean is 1/p.') }
    if (leaf === 'binomial') { add(v.n * v.q, 'is nq: p and q are swapped.'); add(v.n / v.p, 'is n/p: the binomial mean is np.') }
    if (leaf === 'negbin') { add(v.r / v.q, 'is r/q: p and q are swapped.'); add(1 / v.p, `is 1/p, the geometric’s mean: waiting for the ${plOrd(v.r)} success takes r/p.`); add(v.r * v.p, 'is rp: the mean is r/p.') }
    if (leaf === 'hyper') { add((v.n * (v.N - v.r)) / v.N, 'is n(N − r)/N: that counts the failures.'); add(v.r / v.N, 'is r/N, the chance for one draw: times n draws.'); add((v.N * v.r) / v.n, 'is N·r/n: the mean is n·r/N.') }
    if (k) add(lam, `is λ, the rate for one unit: the mean is k = λs = ${fmt(v.k)}.`)
  } else if (what === 'var') {
    add(m.mean, `is the mean${leaf === 'poisson' ? ' (for a Poisson they are equal: check k)' : ', not the variance'}.`)
    add(sd, 'is σ: the variance is σ², without the square root.')
    if (leaf === 'geometric') { add(v.q / v.p, 'is q/p: the variance is q/p², p squared.'); add(v.p / v.q ** 2, 'is p/q²: p and q are swapped.'); add(1 / v.p ** 2, 'is 1/p², the mean squared.') }
    if (leaf === 'binomial') { add(v.n * v.p * v.p, 'is np²: the variance is npq.'); add(v.n * v.q, 'is nq: the variance is npq.') }
    if (leaf === 'negbin') { add((v.r * v.q) / v.p, 'is rq/p: the variance is rq/p², p squared.'); add((v.r * v.p) / v.q ** 2, 'is rp/q²: p and q are swapped.'); add(v.q / v.p ** 2, `is q/p², the geometric’s: times r = ${v.r}.`) }
    if (leaf === 'hyper') {
      const pb = v.r / v.N
      add(v.n * pb * (1 - pb), 'is the binomial’s npq with p = r/N: it leaves out (N − n)/(N − 1), the factor for not putting back.')
      add(v.n * pb * (1 - pb) * ((v.N - v.n) / v.N), 'uses (N − n)/N: the last factor is (N − n)/(N − 1).')
    }
    if (leaf === 'poisson') { add(v.k ** 2, 'is k²: the variance is k.'); if (k) add(lam, `is λ, the rate for one unit: the variance is k = λs = ${fmt(v.k)}.`) }
  } else if (what === 'sd') {
    add(m.var, 'is σ², the variance: σ is its square root.')
    add(m.mean, 'is the mean, not σ.')
    add(Math.sqrt(m.mean), 'is the square root of the mean.')
    if (leaf === 'geometric') add(Math.sqrt(v.q / v.p), 'is √(q/p): the variance is q/p², p squared.')
    if (leaf === 'binomial') { add(Math.sqrt(v.n * v.p), 'is √(np): the variance is npq.'); add(Math.sqrt(v.n * v.q), 'is √(nq): the variance is npq.') }
    if (leaf === 'poisson') { add(v.k / 2, 'is k/2: σ = √k.'); if (k) add(Math.sqrt(lam), `is √λ: k = λs = ${fmt(v.k)}, so σ = √k.`) }
  } else {
    add(m.var, 'is Var X alone: E[X²] = Var X + (E[X])².')
    add(m.mean ** 2, 'is (E[X])² alone: E[X²] = Var X + (E[X])².')
    add(m.var - m.mean ** 2, 'is Var X − (E[X])²: it is a plus, since Var X = E[X²] − (E[X])².')
    add(m.var + m.mean, 'adds E[X], not its square.')
    add(sd, 'is σ.')
  }
  return out
}

// ---------- a question ----------
// the first move: which distribution, with its numbers (never the answer)
function plWhich(leaf, st, v) {
  const P = st.vars.p?.txt
  if (leaf === 'geometric') return `Tries until the first success: geometric with p = ${P}.`
  if (leaf === 'binomial') return `A fixed number of tries (n = ${v.n}), counting successes: binomial with p = ${P}.`
  if (leaf === 'negbin') return `Tries until the ${plOrd(v.r)} success: negative binomial with r = ${v.r}, p = ${P}.`
  if (leaf === 'hyper') return st.math ? `Hypergeometric: N = ${v.N} in all, r = ${v.r} successes, n = ${v.n} drawn.` : `Drawn without putting back: hypergeometric with N = ${v.N}, r = ${v.r}, n = ${v.n}.`
  if (leaf === 'uniform') return `Every value from ${v.A} to ${v.B} equally likely: uniform, flat at height 1/(B − A).`
  return st.math ? `Poisson with k = ${fmt(v.k)}.` : 'Events at a rate, counted over a window: Poisson with k = λs (λ and s in the same units).'
}
// typed answers (paper mode): right to the digits typed, so rounding is fine
function plAccept(ans, tol) {
  return raw => {
    let t = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').replace(/≈/g, '=')
    if (t.includes('=')) t = t.slice(t.lastIndexOf('=') + 1)
    const pct = t.endsWith('%')
    if (pct) t = t.slice(0, -1)
    const f = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(t)
    let n = f ? (Number(f[2]) ? Number(f[1]) / Number(f[2]) : NaN) : t ? Number(t) : NaN
    if (!Number.isFinite(n)) return false
    if (pct) n /= 100
    if (Math.abs(n - ans) <= tol) return true
    // rounded: within half a unit of the last digit typed, with 2 or more significant digits
    const m = /^-?(\d*)\.?(\d*)$/.exec(t)
    if (!m || f || pct) return false
    return (m[1] + m[2]).replace(/^0+/, '').length >= 2 && Math.abs(n - ans) <= 0.5 * 10 ** -m[2].length + 1e-12
  }
}
// the slips worth showing: real numbers, not the answer, not repeated; a probability in (0, 1)
function plDistractors(slips, ans, tol, prob) {
  const seen = new Set([plLabel(ans)]), out = []
  for (const s of slips) {
    if (!Number.isFinite(s.value) || s.value < 0 || Math.abs(s.value - ans) <= tol) continue
    if (prob && (s.value <= 1e-5 || s.value >= 1 - 1e-5)) continue
    const l = plLabel(s.value)
    if (seen.has(l)) continue
    seen.add(l)
    out.push(s)
  }
  return out
}
// a question of one kind (PLUG_LEVEL_KINDS in js/02) for one distribution; keep pins what
// it asks (another() keeps "fewer than" as "fewer than", σ as σ)
function plugLevelProblem(leaf, kind, keep = {}) {
  // (a story whose numbers don't suit is skipped; after a while, any version of the kind)
  for (let i = 0; i < 400; i++) {
    const p = plMake(leaf, kind, i < 200 ? keep : {})
    if (p) return p
  }
  throw new Error(`no ${leaf} ${kind} question`)
}
function plMake(leaf, kind, keep) {
  const st = pickOne(PL_STORIES[leaf])()
  if (kind === 'k' && !st.vars.lam) return null
  const vars = { ...st.vars }
  const v = Object.fromEntries(Object.entries(vars).map(([k, x]) => [k, x.val]))
  const T = Object.fromEntries(Object.entries(vars).map(([k, x]) => [k, x.tex]))
  const q = { leaf, st, v, T, vars, kind }
  const out = leaf === 'uniform' ? plUniformQuestion(q, keep) : ['exactly', 'at-most', 'at-least', 'between'].includes(kind) ? plProbQuestion(q, keep) : kind === 'values' ? plValuesQuestion(q, keep) : kind === 'k' ? plKQuestion(q) : plMomentQuestion(q, keep)
  if (!out) return null
  out.answer = +out.answer.toPrecision(12)
  for (const sl of out.slips) sl.value = +sl.value.toPrecision(12)
  const tol = out.tol ?? Math.max(Math.abs(out.answer) * 0.005, out.prob ? 5e-6 : 1e-6)
  const slips = plDistractors(out.slips, out.answer, tol, out.prob)
  if (slips.length < 3) return null
  const which = plWhich(leaf, st, v)
  const txt = Object.fromEntries(Object.entries(vars).map(([k, x]) => [k, x.txt]))
  const p = {
    ask: out.ask,
    text: st.text,
    latex: out.latex,
    answer: out.answer,
    answerLatex: out.answerLatex,
    start: `${which} ${out.plan}`,
    hint: { latex: out.rule, text: `${which} ${out.plan}` },
    tolerance: tol,
    accept: plAccept(out.answer, tol),
    placeholder: out.prob ? 'e.g. 0.1234' : Number.isInteger(out.answer) ? 'a number' : 'e.g. 2.5',
    distractors: slips.map(s => s.value),
    slips,
    clue: st.clue,
    vars,
    plug: { leaf, lines: out.lines, title: `${LEAVES[leaf].name} · ${out.title}`, plan: out.plan, trap: st.trap ?? null, graph: leaf === 'uniform' ? plugFlat(v, out.graph) : plugBars(leaf, v, { ...out.graph, txt }) },
  }
  p.another = () => plugLevelProblem(leaf, kind, out.keep)
  return p
}
// P[X = x], at most, fewer than, at least, more than, between
function plProbQuestion(q, keep) {
  const { leaf, st, v, vars, kind } = q
  const c = countOf(leaf, v)
  const op = keep.op ?? (kind === 'exactly' ? 'eq' : kind === 'at-most' ? pickOne(['le', 'lt']) : kind === 'at-least' ? pickOne(['ge', 'gt']) : 'in')
  // the other side ("at least 8 survive"), for a binomial story that has one
  if (keep.other && !st.other) return null
  const other = Boolean(!st.math && st.other && op !== 'in' && (keep.other ?? Math.random() < 0.35))
  // the values worth asking about: up to where most of the probability is, and
  // test-sized (no more than a dozen past the first value)
  let top = c.hi
  if (top === Infinity) {
    let cum = 0
    for (top = c.lo; cum < 0.9; top++) cum += c.pmf(top)
    top = Math.min(top, c.lo + 12)
  }
  // the question: in the story's words, or in symbols
  const words = !st.math && (other || (keep.words ?? Math.random() < 0.7))
  // the event as the question words it, then as it is about X ("exactly 0" only in symbols,
  // or in a story's own words for none)
  const said = { op }
  if (op === 'in') {
    said.a = ri(c.lo + 1, Math.max(c.lo + 1, top - 2))
    said.b = said.a + ri(1, 5)
    if (said.b > c.hi) return null
  } else if (op === 'eq') {
    const low = words && !st.zero ? Math.max(c.lo, 1) : c.lo
    said.x = words && st.zero && !other && Math.random() < 0.3 ? 0 : ri(low, Math.max(low, Math.min(top, c.lo + 10)))
  } else said.x = ri(c.lo + (op === 'lt' ? 2 : 1), Math.max(c.lo + 2, top))
  // a binomial "at least one", like the quiz
  if (op === 'ge' && leaf === 'binomial' && !other && Math.random() < 0.25) said.x = 1
  const ev = other ? plFlipEv(said, v.n) : said
  if (ev.op !== 'in' && (ev.x < c.lo || ev.x > c.hi)) return null
  Object.assign(q, { ev, said, method: plMethod(leaf, v, ev) })
  q.answer = plValue(q, ev)
  const ans = q.answer
  if (!(ans > (ev.op === 'eq' ? 0.001 : 0.01) && ans < 0.99)) return null
  if (q.method === 'sum') {
    const { xs } = plSide(leaf, v, ev)
    if (!xs.length || xs.length > (leaf === 'poisson' ? 7 : 6)) return null
  }
  let ask, latex = 'P = \\,?'
  if (words) {
    const sayer = other ? st.other : st.say
    if (op === 'eq' && said.x === 0 && st.zero) {
      ask = `Find the probability that ${st.zero}.`
      vars.x = V(0, st.zero.split(' ').slice(0, 3).join(' '), 'none of them: X = 0')
    } else if (op === 'eq' && st.on && !other && Math.random() < 0.5) {
      const [sentence, from] = st.on(said.x)
      ask = `Find the probability that ${sentence}.`
      vars.x = V(said.x, from, `X = ${said.x}`)
    } else {
      const qx = plWords(said)
      ask = `Find the probability that ${sayer(qx, op !== 'gt' && op !== 'lt' && op !== 'in' && said.x === 1)}${op === 'in' ? ', counting both ends' : ''}.`
      if (op === 'in') {
        vars.a = V(ev.a, `between ${said.a}`, 'the low end, included')
        vars.b = V(ev.b, `and ${said.b}`, 'the high end, included')
      } else vars.x = V(ev.x, other ? null : qx, other ? `${v.n} − ${said.x} = ${ev.x}` : plEvSay(ev))
    }
  } else {
    ask = `Find ${plEvSay(ev)}.`
    latex = `${plEvTex(ev)} = \\,?`
    if (ev.op === 'in') {
      vars.a = V(ev.a, `P[${ev.a} ≤`, 'the low end, included')
      vars.b = V(ev.b, `≤ ${ev.b}]`, 'the high end, included')
    } else vars.x = V(ev.x, plEvSay(ev), { eq: 'the value asked about', le: 'the most X can be', lt: 'X stays below it', ge: 'the least X can be', gt: 'X goes past it' }[ev.op])
  }
  const lines = [...(other ? [plOtherLine(q)] : []), ...{ exact: plExactLines, shortcut: plShortcutLines, table: plTableLines, sum: plSumLines }[q.method](q)]
  // the picture: every value asked about lit
  const shownTop = c.hi === Infinity ? Math.max(ev.op === 'in' ? ev.b + 2 : ev.x + 3, top) : c.hi
  const hits = new Set()
  for (let t = c.lo; t <= shownTop; t++) if (plHas(ev, t)) hits.add(t)
  const table = q.method === 'table'
  const shown = table ? ans.toFixed(4) : num(ans)
  return {
    ask, latex, prob: true, answer: ans, tol: table ? 2e-4 : undefined,
    answerLatex: `${plEvTex(ev)} ${table ? '=' : rel(exact(ans))} ${shown}`,
    rule: { exact: `f(x) = ${PL_PDF_TEX[leaf]}`, shortcut: 'F(x) = 1 - q^x, \\quad P[X > x] = q^x', table: 'P[X \\le x] = F(x) \\ \\text{(the table)}', sum: `f(x) = ${PL_PDF_TEX[leaf]}` }[q.method],
    lines, slips: plProbSlips(q), plan: plProbPlan(q, other),
    title: { eq: 'exactly', le: 'at most', lt: 'fewer than', ge: 'at least', gt: 'more than', in: 'between' }[op],
    graph: { hits, upTo: shownTop, note: `Lit: ${plEvSay(ev)} ${table || exact(ans) ? '=' : '≈'} ${plLabel(ans)}` },
    keep: { op, other, words },
  }
}
// why the work goes the way it does, in plain words
function plProbPlan(q, other) {
  const { leaf, v, ev, said, method, st } = q
  const x = ev.x
  const flip = other ? `X counts the other side, so ${plWords(said)} ${st.otherIs} is ${plEvSay(ev)}. ` : ''
  if (method === 'exact') return flip + {
    geometric: `X = ${x} means ${x - 1} ${x - 1 === 1 ? 'failure' : 'failures'} (q each), then a success (p): q^${x - 1}·p.`,
    binomial: x === 0 ? `None of the ${v.n} tries succeed: every one fails, q^${v.n}.` : x === v.n ? `All ${v.n} tries succeed: p^${v.n}.` : `Choose which ${x} of the ${v.n} tries are the successes, C(${v.n}, ${x}) ways; each way has chance p^${x}q^${v.n - x}.`,
    negbin: `The ${plOrd(v.r)} success comes on try ${x}: ${v.r - 1} ${v.r - 1 === 1 ? 'success' : 'successes'} somewhere in the first ${x - 1} tries, C(${x - 1}, ${v.r - 1}) ways, then a success: C(${x - 1}, ${v.r - 1})·p^${v.r}·q^${x - v.r}.`,
    hyper: `Choose ${x} of the ${v.r} successes and ${v.n - x} of the ${v.N - v.r} others, over all C(${v.N}, ${v.n}) ways to draw ${v.n}.`,
    poisson: `One value: the formula sheet’s e^(−k)k^${x}/${x}!.`,
  }[leaf]
  if (method === 'shortcut') return flip + {
    le: `At most ${x} tries means the success came by try ${x}: F(${x}) = 1 − q^${x}, the cdf you derive.`,
    lt: `Fewer than ${x} is at most ${x - 1}, since X is a whole number: F(${x - 1}) = 1 − q^${x - 1}.`,
    ge: `At least ${x} tries means the first ${x - 1} all failed: q^${x - 1}.`,
    gt: `More than ${x} tries means the first ${x} all failed: q^${x}.`,
    in: `Up to ${ev.b}, minus up to ${ev.a - 1}: F(${ev.b}) − F(${ev.a - 1}), and the 1s cancel.`,
  }[ev.op]
  const turn = ev.op === 'lt' ? `Fewer than ${x} is at most ${x - 1} (X is a whole number). ` : ev.op === 'gt' ? `More than ${x} is at least ${x + 1}. ` : ''
  if (method === 'table') {
    const use = { le: `at most ${x} is F(${x})`, lt: `that is F(${x - 1})`, ge: `at least ${x} is 1 − F(${x - 1}): everything but 0 to ${x - 1}`, gt: `more than ${x} is 1 − F(${x})`, in: ev.a > 0 ? `${ev.a} to ${ev.b} is F(${ev.b}) − F(${ev.a - 1})` : `0 to ${ev.b} is F(${ev.b})` }[ev.op]
    return `${flip}${turn}n = 20, and the test gives that table: F(x) = P[X ≤ x] in row x, column p = ${fmt(v.p)}. So ${use}.`
  }
  const { xs, minus } = plSide(leaf, v, ev)
  const c = countOf(leaf, v)
  // where X starts matters when the sum starts there
  const fromLo = xs[0] === c.lo
  const start = !fromLo ? '' : leaf === 'negbin' ? `X starts at r = ${v.r}: it takes at least ${v.r} tries to get ${v.r} successes. ` : leaf === 'hyper' && c.lo > 0 ? `X can’t be below ${c.lo} here. ` : ''
  const pulled = leaf === 'poisson' ? ', with e^(−k) pulled out of every term' : ''
  const terms = xs.length <= 3 ? xs.map(t => `f(${t})`).join(' + ') : `f(${xs[0]}) + … + f(${xs[xs.length - 1]})`
  const how = !minus ? `Add f(x) for X = ${plList(xs)}${pulled}.`
    : xs.length === 1 ? `That is everything but X = ${xs[0]}: 1 − f(${xs[0]})${pulled.replace('every term', 'it')}.`
    : c.hi === Infinity ? `X has no top value, so take 1 minus the values below: 1 − [${terms}]${pulled}.`
    : `The other side, X = ${plList(xs)}, has fewer terms: 1 minus them.`
  return flip + turn + start + how
}
// the mean, the variance, E[X²], σ
function plMomentQuestion(q, keep) {
  const { leaf, st, v, vars, kind } = q
  const what = keep.what ?? (kind === 'mean-var' ? pickOne(['mean', 'var', 'sd']) : kind === 'var' && leaf === 'binomial' ? pickOne(['var', 'var', 'sd']) : kind)
  const m = plMoments(leaf, v), sd = Math.sqrt(m.var)
  const ans = { mean: m.mean, var: m.var, sd, second: m.var + m.mean ** 2 }[what]
  const end = `${rel(exact(ans))} ${num(ans)}`
  const lines = []
  if (what === 'mean' || what === 'var') lines.push(plMomentLine(leaf, what, v))
  if (what === 'sd') {
    vars.var = plWorkedMoment(leaf, 'var', v)
    lines.push({ order: ['var'], tex: s => `\\sigma = \\sqrt{${s('var')}}`, steps: plSteps([end]) })
  }
  if (what === 'second') {
    vars.var = plWorkedMoment(leaf, 'var', v)
    vars.mean = plWorkedMoment(leaf, 'mean', v)
    lines.push({ order: ['var', 'mean'], tex: s => `E[X^2] = ${s('var')} + ${s('mean', 2)}^{2}`, steps: plSteps([`${rel(exact(m.mean ** 2))} ${num(m.var)} + ${num(m.mean ** 2)}`, end]) })
  }
  const VAR = { geometric: '\\frac{q}{p^2}', binomial: 'npq', negbin: '\\frac{rq}{p^2}', hyper: 'n\\frac{r}{N}\\cdot\\frac{N-r}{N}\\cdot\\frac{N-n}{N-1}', poisson: 'k' }
  const MEAN = { geometric: '\\frac{1}{p}', binomial: 'np', negbin: '\\frac{r}{p}', hyper: 'n\\frac{r}{N}', poisson: 'k' }
  const why = {
    mean: { geometric: 'On average it takes 1/p tries to get the first success.', binomial: `${v.n} tries, each a success with chance p: on average np of them.`, negbin: `${v.r} successes, about 1/p tries each: r/p.`, hyper: 'n draws, each a success with chance r/N: n·r/N, the same as a binomial.', poisson: 'For a Poisson the mean is k.' },
    var: { geometric: 'The geometric variance is q/p² (not on the formula sheet: know it).', binomial: 'The binomial variance is npq.', negbin: 'The negative binomial variance is rq/p²: r times the geometric’s q/p².', hyper: 'Like the binomial’s npq with p = r/N, times (N − n)/(N − 1), because nothing is put back.', poisson: 'For a Poisson the variance is k too, the same as the mean.' },
  }
  const plan = what === 'mean' || what === 'var' ? why[what][leaf]
    : what === 'sd' ? `σ is the square root of the variance. ${why.var[leaf]}`
    : 'Var X = E[X²] − (E[X])², so E[X²] = Var X + (E[X])²: work out the mean and the variance first.'
  const ask = what === 'mean' ? (st.avg && !st.math && (keep.avg ?? Math.random() < 0.6) ? st.avg : 'Find E[X], the mean of X.') : what === 'var' ? 'Find Var X, the variance of X.' : what === 'sd' ? 'Find σ, the standard deviation of X.' : 'Find E[X²].'
  const lhs = { mean: 'E[X]', var: '\\operatorname{Var}X', sd: '\\sigma', second: 'E[X^2]' }[what]
  return {
    ask, latex: `${lhs} = \\,?`, answer: ans, answerLatex: `${lhs} ${end}`,
    rule: what === 'second' ? 'E[X^2] = \\operatorname{Var}X + (E[X])^2' : what === 'sd' ? `\\sigma = \\sqrt{\\operatorname{Var}X}, \\quad \\operatorname{Var}X = ${VAR[leaf]}` : `${lhs} = ${(what === 'mean' ? MEAN : VAR)[leaf]}`,
    lines, slips: plMomentSlips(leaf, what, v, vars.lam?.val ?? null), plan,
    title: { mean: 'the mean', var: 'the variance', sd: 'σ', second: 'E[X²]' }[what],
    graph: { mean: m.mean, sd: what === 'mean' ? null : sd, note: what === 'mean' ? 'The dashed line is the mean: the balance point of the bars.' : 'The dashed line is the mean; the bracket reaches one σ either side of it.' },
    keep: { what },
  }
}
// the values a hypergeometric X can take: its smallest or its largest
function plValuesQuestion(q, keep) {
  const { v } = q
  const end = keep.end ?? pickOne(['low', 'high'])
  const lo = Math.max(0, v.n - (v.N - v.r)), hi = Math.min(v.n, v.r)
  // mostly an end that takes some thought
  if (end === 'low' && lo === 0 && Math.random() < 0.6) return null
  if (end === 'high' && hi === v.n && Math.random() < 0.5) return null
  const ans = end === 'low' ? lo : hi
  const all = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
  const lines = [
    { order: ['n', 'N', 'r'], mid: end !== 'low', answer: end === 'low', tex: s => `\\text{smallest } X = \\max\\big(0,\\ ${s('n')} - (${s('N')} - ${s('r')})\\big)`, steps: plSteps([`= \\max(0,\\ ${v.n - (v.N - v.r)})`, `= ${lo}`]) },
    { order: ['n', 'r'], mid: end !== 'high', answer: end === 'high', tex: s => `\\text{largest } X = \\min(${s('n')},\\ ${s('r')})`, steps: plSteps([`= ${hi}`]) },
    { order: [], label: 'So X can be', plain: true, tex: () => `X = ${runTex(lo, hi)}` },
  ]
  const slips = end === 'low'
    ? [{ value: 0, why: `is 0, but the ${v.N - v.r} failures can’t fill all ${v.n} draws, so at least ${lo} must be successes.` }, { value: hi, why: 'is the largest value, not the smallest.' }, { value: lo + 1, why: 'is one too high.' }, { value: Math.max(0, lo - 1), why: 'is one too low.' }, { value: v.n - v.r, why: 'is n − r: the smallest is n − (N − r), the draws the failures can’t fill.' }, { value: v.N - v.r, why: 'is N − r, the number of failures.' }]
    : [{ value: v.n, why: `is n, but there are only ${v.r} successes to draw.` }, { value: v.r, why: `is r, but only ${v.n} are drawn.` }, { value: lo, why: 'is the smallest value, not the largest.' }, { value: hi - 1, why: 'is one too low.' }, { value: hi + 1, why: 'is one too high.' }, { value: v.N - v.r, why: 'is N − r, the number of failures.' }]
  return {
    ask: end === 'low' ? 'What is the smallest value X can take?' : 'What is the largest value X can take?',
    latex: `\\text{${end === 'low' ? 'smallest' : 'largest'} possible } X = \\,?`, answer: ans, tol: 1e-6,
    answerLatex: `\\text{${end === 'low' ? 'smallest' : 'largest'} } X = ${ans} \\quad (X = ${runTex(lo, hi)})`,
    rule: '\\max(0,\\ n - (N - r)) \\le X \\le \\min(n,\\ r)',
    lines, slips,
    plan: `X can’t be more than n (only ${v.n} are drawn) or r (there are only ${v.r} successes). And when the N − r = ${v.N - v.r} failures can’t fill the ${v.n} draws, the rest must be successes: n − (N − r).`,
    title: 'the values X can take',
    graph: { hits: new Set(all), note: `X can be ${plList(all)}.` },
    keep: { end },
  }
}
// k = λs, from a rate and a window
function plKQuestion(q) {
  const { v, st, vars } = q
  const lam = vars.lam.val, s = vars.s.val
  const slips = [{ value: lam, why: 'is λ, the rate for one unit: k = λs counts the whole window.' }, { value: s, why: 'is s alone: k = λs.' }, { value: lam / s, why: 'is λ/s: k = λs, the rate times the window.' }]
  if (st.raw) slips.push({ value: lam * st.raw, why: `uses s = ${st.raw} without changing its units: s has to be in the rate’s units.` }, { value: lam / st.raw, why: 'divides by the window: k = λs multiplies.' })
  return {
    ask: 'Find k, the Poisson parameter of X.', latex: 'k = \\,?', answer: v.k,
    answerLatex: `k = \\lambda s ${rel(exact(v.k))} ${num(v.k)}`, rule: 'k = \\lambda s',
    lines: [{ ...vars.k.work, answer: true }], slips,
    plan: 'k = λs: the rate times the size of the window, with both in the same units. k is the mean number of events in the window.',
    title: 'k = λs',
    graph: { mean: v.k, note: 'k is the mean count in the window: the dashed line.' },
    keep: {},
  }
}
// 4.1's uniform: the height of its pdf, F(x), and the chance of a stretch, each a length
// over the whole length
function plUniformQuestion(q, keep) {
  const { st, v, vars, kind } = q
  const A = v.A, B = v.B, w = B - A
  // a value inside, on a sensible grid (degrees in 30s, a 100 cm rod in 10s)
  const step = w > 40 ? w / (w % 12 === 0 ? 12 : 10) : 1
  const inside = () => A + step * ri(1, Math.round(w / step) - 1)
  const end = x => `${rel(exact(x))} ${num(x)}`
  const words = keep.words ?? Math.random() < 0.7
  const whole = s => `${s('B')} - ${s('A')}`
  if (kind === 'height') {
    const ans = 1 / w
    const slips = [{ value: w, why: 'is B − A, the length: the height is 1 over the length, so the area is 1.' }, { value: 1 / (w + 1), why: `is 1/(B − A + 1), as if X were a whole number: X can be any value from ${A} to ${B}.` }, { value: (A + B) / 2, why: 'is the mean, (A + B)/2, not the height.' }, { value: 1, why: 'is the total area under the pdf: the height is what makes that area 1.' }]
    if (A) slips.push({ value: 1 / B, why: `is 1/B: the length is B − A = ${w}.` }, { value: 1 / (A + B), why: 'is 1/(A + B): the length is B − A.' })
    return {
      ask: `Find f(x), the pdf of X, for ${A} < x < ${B}.`, latex: 'f(x) = \\,?', answer: ans, answerLatex: `f(x) = \\frac{1}{${w}} ${end(ans)}`, rule: 'f(x) = \\frac{1}{B - A}',
      lines: [{ order: ['A', 'B'], tex: s => `f(x) = \\frac{1}{${whole(s)}}`, steps: plSteps([`= \\frac{1}{${w}}`, end(ans)]), tail: () => `\\quad \\text{for } ${A} < x < ${B}` }],
      slips, plan: `Flat from A to B, and the area under it must be 1: height × (B − A) = 1, so the height is 1/(B − A).`,
      title: 'the height of the pdf', graph: { note: `height 1/(B − A) = 1/${w}` }, keep: {},
    }
  }
  if (kind === 'cdf') {
    const x = inside(), op = keep.op ?? pickOne(['le', 'lt'])
    const ans = (x - A) / w, sym = op === 'le' ? '\\le' : '<', say = op === 'le' ? '≤' : '<'
    const qx = `${op === 'le' ? 'at most' : 'less than'} ${x}`
    const ask = words ? `Find the probability that ${st.say(qx)}.` : `Find F(${x}) = P[X ${say} ${x}].`
    vars.x = V(x, words ? qx : `F(${x})`, `X ${say} ${x}`)
    const slips = [{ value: 1 - ans, why: `is P[X > ${x}], the other side.` }, { value: 1 / w, why: 'is the height f(x), not the area up to x.' }, { value: (x - A + 1) / (w + 1), why: 'counts whole numbers, as if X were discrete: the lengths are what count.' }]
    if (A) slips.push({ value: (x - A) / B, why: `divides by B: the whole length is B − A = ${w}.` }, { value: x / w, why: `is x/(B − A): the stretch up to x starts at A = ${A}, so its length is x − A.` })
    return {
      ask, latex: words ? 'P = \\,?' : `F(${x}) = \\,?`, prob: true, answer: ans, answerLatex: `F(${x}) = \\frac{${x - A}}{${w}} ${end(ans)}`, rule: 'F(x) = \\frac{x - A}{B - A}',
      lines: [{ order: ['x', 'A', 'B'], tex: s => `P[X ${sym} ${s('x')}] = F(${s('x')}) = \\frac{${s('x')} - ${s('A')}}{${whole(s)}}`, steps: plSteps([`= \\frac{${x - A}}{${w}}`, end(ans)]) }],
      slips, plan: `F(x) = (x − A)/(B − A): the length from A up to x, over the whole length. For a continuous X, < and ≤ give the same: P[X = ${x}] = 0.`,
      title: 'F(x)', graph: { shade: [A, x], ticks: [x], note: `shaded: P[X ${say} ${x}] ${exact(ans) ? '=' : '≈'} ${plLabel(ans)}` }, keep: { op, words },
    }
  }
  // a stretch: between c and d, or past c
  const op = keep.op ?? pickOne(['in', 'in', 'gt'])
  let c = inside(), d = inside()
  if (op === 'in' && c === d) return null
  if (c > d) [c, d] = [d, c]
  const hi = op === 'in' ? d : B
  const ans = (hi - c) / w
  let ask, latex = 'P = \\,?', lines
  if (op === 'in') {
    ask = words ? `Find the probability that ${st.say(`between ${c} and ${d}`)}.` : `Find P[${c} < X < ${d}].`
    if (!words) latex = `P[${c} < X < ${d}] = \\,?`
    vars.c = V(c, words ? `between ${c}` : `P[${c} <`, 'where the stretch starts')
    vars.d = V(d, words ? `and ${d}` : `< ${d}]`, 'where it ends')
    lines = [{ order: ['c', 'd', 'A', 'B'], tex: s => `P[${s('c')} < X < ${s('d')}] = \\frac{${s('d')} - ${s('c')}}{${whole(s)}}`, steps: plSteps([`= \\frac{${d - c}}{${w}}`, end(ans)]) }]
  } else {
    ask = words ? `Find the probability that ${st.say(`more than ${c}`)}.` : `Find P[X > ${c}].`
    if (!words) latex = `P[X > ${c}] = \\,?`
    vars.c = V(c, words ? `more than ${c}` : `P[X > ${c}]`, 'where the stretch starts')
    lines = [{ order: ['c', 'A', 'B'], tex: s => `P[X > ${s('c')}] = \\frac{${s('B')} - ${s('c')}}{${whole(s)}}`, steps: plSteps([`= \\frac{${B - c}}{${w}}`, end(ans)]) }]
  }
  const slips = [{ value: 1 - ans, why: 'is 1 minus the answer: the part outside the stretch.' }, { value: 1 / w, why: 'is the height f(x), not an area.' }, { value: (c - A) / w, why: `is P[X < ${c}], the stretch before ${c}.` }]
  if (op === 'in') slips.push({ value: (d - A) / w, why: `is F(${d}) = P[X < ${d}]: the stretch starts at ${c}, so take away F(${c}).` }, { value: (d - c + 1) / (w + 1), why: 'counts whole numbers, as if X were discrete: the lengths are what count.' })
  if (A) slips.push({ value: (hi - c) / B, why: `divides by B: the whole length is B − A = ${w}.` })
  return {
    ask, latex, prob: true, answer: ans, answerLatex: `${op === 'in' ? `P[${c} < X < ${d}]` : `P[X > ${c}]`} = \\frac{${hi - c}}{${w}} ${end(ans)}`, rule: 'P[c < X < d] = \\frac{d - c}{B - A}',
    lines, slips, plan: `Flat, so a probability is a length over the whole length: the stretch from ${c} to ${hi} is ${fmt(hi - c)} long, out of ${w}. For a continuous X, < and ≤ give the same.`,
    title: op === 'in' ? 'between' : 'more than', graph: { shade: [c, hi], ticks: op === 'in' ? [c, d] : [c], note: `shaded: ${op === 'in' ? `P[${c} < X < ${d}]` : `P[X > ${c}]`} ${exact(ans) ? '=' : '≈'} ${plLabel(ans)}` }, keep: { op, words },
  }
}
// what a wrong pick was, when it is one of the question's slips
function plugSlipNote(p, picked) {
  // (an option carries its number as num, or shows it as text)
  const val = typeof picked === 'number' ? picked : picked?.num ?? parseFloat(picked?.value ?? picked?.text ?? picked?.label)
  if (!Number.isFinite(val)) return null
  let best = null
  for (const s of p.slips ?? []) {
    const d = Math.abs(s.value - val)
    if (d <= Math.max(1e-9, 1e-3 * Math.abs(s.value)) && (!best || d < best.d)) best = { s, d }
  }
  return best ? `Your pick, ${plLabel(val)}, ${best.s.why}` : null
}
