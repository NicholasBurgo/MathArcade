// js/29-read-off-numbers.js · World 0, level 2: read off the numbers
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- World 0, level 2: read off the numbers ----------
// A story whose distribution is named; the question is one of its numbers (n, p,
// r, N or k) or the values X can take. A right answer lights each number's words in
// the story, lands it on its letter with what the letter means, then says what X
// can be and why. The stories are World 0's, which know where every number comes from.
const PARAMS = { binomial: ['n', 'p'], geometric: ['p'], negbin: ['r', 'p'], hyper: ['N', 'r', 'n'], poisson: ['k'] }
// what each letter means (r is a different thing in the two that use it)
const MEANS = {
  binomial: { n: 'the number of tries, fixed in advance', p: 'the chance of a success on each try' },
  geometric: { p: 'the chance of a success on each try' },
  negbin: { r: 'how many successes you need', p: 'the chance of a success on each try' },
  hyper: { N: 'how many are in the whole group', r: 'how many in the group are successes', n: 'how many you pick' },
  poisson: { lam: 'the rate', s: 'the amount: time, pages, miles… in the rate’s units', k: 'the average count for this window: rate × amount' },
}
const PARAM_ROWS = { binomial: ['n', 'p'], geometric: ['p'], negbin: ['r', 'p'], hyper: ['N', 'r', 'n'], poisson: ['lam', 's', 'k'] }
const LETTER = { n: 'n', p: 'p', r: 'r', N: 'N', k: 'k', lam: '\\lambda', s: 's' }
// a list of whole numbers: 0, 1, 2, …, 12 (or all of them when there are few)
const runTex = (lo, hi) => (hi === Infinity ? `${lo}, ${lo + 1}, ${lo + 2}, \\ldots` : hi - lo <= 3 ? Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).join(', ') : `${lo}, ${lo + 1}, \\ldots, ${hi}`)
// the values X can take, why, and the sets a hurried reader picks instead
function valuesOf(leaf, v) {
  if (leaf === 'binomial') {
    const n = v.n.val
    return { lo: 0, hi: n, why: `From no successes up to all ${n} tries.`, slips: [[1, n], [0, n - 1], [0, Infinity], [1, Infinity]] }
  }
  if (leaf === 'geometric') return { lo: 1, hi: Infinity, why: 'The first success can come on try 1 at the earliest, and there is no top: it can take any number of tries.', slips: [[0, Infinity], [2, Infinity], [0, 1]] }
  if (leaf === 'negbin') {
    const r = v.r.val
    return { lo: r, hi: Infinity, why: `${r} successes take at least ${r} tries, and there is no top.`, slips: [[0, Infinity], [1, Infinity], [0, r], [r + 1, Infinity]] }
  }
  if (leaf === 'hyper') {
    const N = v.N.val, r = v.r.val, n = v.n.val
    const lo = Math.max(0, n - (N - r)), hi = Math.min(n, r)
    const most = `Most: min(n, r) = min(${n}, ${r}) = ${hi}. You can’t get more successes than you pick${r < n ? ', or than there are' : ''}.`
    const fewest = lo > 0
      ? `Fewest: max(0, n − (N − r)) = max(0, ${n} − ${N - r}) = ${lo}. Only ${N - r} are not successes, so at least ${lo} of your ${n} must be.`
      : `Fewest: 0. There are ${N - r} that are not successes, enough to fill all ${n} picks.`
    return { lo, hi, why: `${most} ${fewest}`, slips: [[0, n], [0, r], [0, hi], [lo, n], [1, hi], [0, N], [0, N - r], [0, Infinity]] }
  }
  const k = v.k.val
  return { lo: 0, hi: Infinity, why: 'X counts events: from none, with no top. k is the average, not a limit.', slips: [[0, Math.max(1, Math.round(k))], [1, Infinity], [0, Math.max(2, Math.round(2 * k))]] }
}
const rowTex = (key, vars) => {
  const v = vars[key]
  if (key === 'k') return `k = \\lambda s = ${vars.lam.tex} \\cdot ${vars.s.tex} = ${v.tex}`
  if (v.work?.tex) return `${v.work.tex(k => LETTER[k] ?? k)} ${(v.work.steps?.() ?? []).join(' ')}`
  return `${LETTER[key]} = ${v.tex}`
}
// the story with several phrases marked, each in its colour
function storyMarks(text, marks) {
  const p = h('p', 'story')
  const spots = marks
    .map(m => ({ ...m, at: m.phrase ? text.indexOf(m.phrase) : -1 }))
    .filter(m => m.at >= 0)
    .sort((a, b) => a.at - b.at)
  let i = 0
  for (const m of spots) {
    if (m.at < i) continue
    p.append(document.createTextNode(text.slice(i, m.at)), h('mark', 'pvmark ' + m.cls, m.phrase))
    i = m.at + m.phrase.length
  }
  p.append(document.createTextNode(text.slice(i)))
  return p
}

// One question: a story (easy or test-style) for a distribution, and one thing to read off it.
const gcdI = (a, b) => (b ? gcdI(b, a % b) : a)
const fracTex = (a, b) => {
  const g = gcdI(a, b)
  return b / g === 1 ? String(a / g) : `\\tfrac{${a / g}}{${b / g}}`
}
// the wrong values a hurried reader gives for one letter: the story's other numbers,
// the other letters, the usual slip for that letter, then nearby values
function paramSlips(leaf, sc, kind) {
  const v = sc.vars[kind]
  // a fraction (1/6 from a die) gets fraction slips: its complement, half, double, square
  const fm = /^\\tfrac\{(\d+)\}\{(\d+)\}$/.exec(v.tex)
  if (kind === 'p' && fm) {
    const [a, b] = [+fm[1], +fm[2]]
    return [...new Set([fracTex(b - a, b), fracTex(a, 2 * b), fracTex(2 * a, b), fracTex(a * a, b * b)])].filter(t => t !== v.tex && t !== '1')
  }
  const nums = [...sc.text.matchAll(/(\d+(?:\.\d+)?)(%?)/g)].flatMap(m => (m[2] ? [+m[1], +m[1] / 100] : [+m[1]]))
  const others = Object.entries(sc.vars).filter(([k]) => k !== kind && k !== 'x' && k !== 'q').map(([, o]) => o.val)
  // k with the window left in its own units: 4 per hour for 30 minutes read as 4 × 30
  const sNums = (sc.vars.s?.from ?? '').match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []
  const slips =
    kind === 'p' ? [1 - v.val]
    : kind === 'k' ? [...sNums.map(x => x * sc.vars.lam.val), sc.vars.lam.val, sc.vars.s.val, sc.vars.lam.val / sc.vars.s.val]
    : kind === 'N' ? [sc.vars.N.val - sc.vars.r.val]
    : []
  const near = kind === 'p' ? [v.val * 2, v.val / 2, v.val + 0.1, v.val - 0.05] : [v.val + 1, v.val - 1, v.val * 2]
  const seen = new Set([fmt(v.val)])
  const out = []
  for (const c of [...slips, ...others, ...nums, ...near]) {
    if (!Number.isFinite(c) || c <= 0 || (kind === 'p' && c >= 1)) continue
    const f = fmt(c)
    if (seen.has(f)) continue
    seen.add(f)
    out.push(f)
  }
  return out
}

// One question: a story (easy or test-style) for a distribution, and what to read off
// it. 'all' is the whole question as the test asks it (HW 6): name the distribution,
// give its parameters, and list the values X can take. The others name the distribution
// and ask one letter, or the values.
function paramProblem(kind = null, leaf = pickOne(Object.keys(PARAMS))) {
  kind ??= pickOne([...PARAMS[leaf], 'values', 'all'])
  let sc
  // half the hypergeometric "values" questions use the class whose lowest value is not 0
  if (leaf === 'hyper' && kind !== 'N' && kind !== 'r' && kind !== 'n' && Math.random() < 0.5) sc = HARD.hyper[HARD.hyper.length - 1]()
  else {
    do sc = pickOne([...STORIES[leaf], ...HARD[leaf]])()
    while (sc.latex)
  }
  // "X is binomial", but "X is Poisson"
  const name = leaf === 'poisson' ? 'Poisson' : LEAVES[leaf].name.toLowerCase()
  let ask, latex, right, wrong, hint
  if (kind === 'all') {
    const val = valuesOf(leaf, sc.vars)
    const keys = PARAMS[leaf]
    const set = runTex(val.lo, val.hi)
    const card = (nm, vals, xs) => `\\text{${nm}},\\ ${vals.map(([k, t]) => `${LETTER[k]} = ${t}`).join(',\\ ')};\\ x = ${xs}`
    const mine = keys.map(k => [k, sc.vars[k].tex])
    right = card(LEAVES[leaf].name, mine, set)
    // one thing wrong at a time: the values, one letter, the name it is mistaken for
    const setSlips = paramValueSlips(val).map(([a, b]) => runTex(a, b))
    const letterSlips = keys.flatMap(k => paramSlips(leaf, sc, k).slice(0, 3).map(w => card(LEAVES[leaf].name, mine.map(([kk, t]) => [kk, kk === k ? w : t]), set)))
    const nameSlips = CONFUSED[leaf].filter(c => PARAMS[c]).slice(0, 2).map(c => card(LEAVES[c].name, mine, set))
    wrong = [...setSlips.slice(0, 2).map(x => card(LEAVES[leaf].name, mine, x)), ...letterSlips.slice(0, 2), nameSlips[0], ...setSlips.slice(2, 3).map(x => card(LEAVES[leaf].name, mine, x)), ...letterSlips.slice(2), ...nameSlips.slice(1)].filter(Boolean)
    ask = 'Name the distribution of X, give its parameters, and list the possible values of X.'
    latex = 'X \\sim \\,?'
    hint = { text: `${LEAVES[leaf].name}: ${keys.map(k => `${k} is ${MEANS[leaf][k]}`).join('; ')}. ${val.why}` }
  } else if (kind === 'values') {
    const val = valuesOf(leaf, sc.vars)
    ask = `X is ${name}. What values can X take?`
    latex = 'X = \\;?'
    right = runTex(val.lo, val.hi)
    wrong = paramValueSlips(val).map(([a, b]) => runTex(a, b))
    hint = { text: val.why }
  } else {
    const v = sc.vars[kind]
    ask = `X is ${name}. Find ${kind}.`
    latex = `${LETTER[kind]} = \\;?`
    right = v.tex
    hint = { text: `${kind} is ${MEANS[leaf][kind]}${v.from ? `: “${v.from}”` : ''}${v.note ? ` (${v.note})` : ''}.` }
  }
  // the options: a letter's are numbers in order from smallest to largest (fractions
  // when the answer is one); the rest are shuffled. The answer is stored first (so
  // p.answer is 'a' wherever it is read) and shown in p.order.
  let opts, order
  if (kind in LETTER) {
    const list = paramLetterChoices(leaf, sc, kind)
    opts = [right, ...list.filter(o => !o.correct).map(o => o.tex)]
    let w = 0
    order = list.map(o => (o.correct ? 0 : ++w))
  } else {
    opts = [right, ...[...new Set(wrong)].filter(x => x !== right).slice(0, 9)]
    order = shuffleArr(opts.map((_, i) => i))
  }
  return {
    ask,
    text: sc.text,
    latex,
    options: opts.map(o => ({ latex: o })),
    answer: 'a',
    order,
    hint,
    placeholder: 'a, b, c, …',
    params: { leaf, sc, at: kind },
  }
}
// a letter's options: the answer, the slips a hurried reader makes and values near it,
// 10 in all, smallest first ({ tex, correct })
const paramTexValue = t => {
  const m = /^\\tfrac\{(\d+)\}\{(\d+)\}$/.exec(t)
  return m ? +m[1] / +m[2] : parseFloat(t)
}
function paramLetterChoices(leaf, sc, kind) {
  const v = sc.vars[kind]
  const isFrac = /^\\tfrac/.test(v.tex)
  // a value as a fraction, when the answer is one (1/6 among 1/3, 5/6, 1/12, …)
  const asFrac = x => {
    for (let d = 1; d <= 240; d++) if (Math.abs(Math.round(x * d) / d - x) < 1e-9) return fracTex(Math.round(x * d), d)
    return fmt(x)
  }
  // (the numbers are exact: the tolerance only covers 4-figure printing, 1/6 as 0.1667)
  const list = choicesForNumber({ value: v.val, tol: Math.max(1e-6, 5e-4 * Math.abs(v.val)), wrong: paramSlips(leaf, sc, kind).map(paramTexValue), words: kind === 'p' ? 'probability' : '', n: 10 })
  return list.map(o => ({ correct: o.correct, tex: o.correct ? v.tex : isFrac ? asFrac(o.v) : o.label }))
}
// the sets of values a hurried reader gives: the story's own slips, then one end moved
// by one (the off-by-one slips), up to 7
function paramValueSlips(val) {
  const { lo, hi } = val
  const finite = hi !== Infinity
  const more = [[lo + 1, hi], [lo - 1, hi], ...(finite ? [[lo, hi - 1], [lo, hi + 1], [lo, Infinity]] : [])]
  const out = []
  for (const [a, b] of [...val.slips, ...more]) {
    if (a < 0 || a > b || (a === lo && b === hi) || out.some(([x, y]) => x === a && y === b)) continue
    if (runTex(a, b) === runTex(lo, hi) || out.some(([x, y]) => runTex(x, y) === runTex(a, b))) continue
    out.push([a, b])
  }
  return out.slice(0, 7)
}
function paramRound(n, paper = false) {
  // every distribution twice, never the same one twice in a row; two of every ten are the
  // whole test question (on paper, all of them), a third of the rest the values
  const leaves = []
  while (leaves.length < n) {
    const next = shuffleArr(Object.keys(PARAMS))
    if (next[0] === leaves[leaves.length - 1]) next.push(next.shift())
    leaves.push(...next)
  }
  return leaves.slice(0, n).map((leaf, i) => paramProblem(paper || i % 5 === 4 ? 'all' : i % 3 === 2 ? 'values' : pickOne(PARAMS[leaf]), leaf))
}

// The story read off, row by row: each letter, the words it comes from, what it
// means; then what X can be. `host` is the question sheet whose story lights up;
// without one the card shows the story itself.
function paramCard(pp, { auto = false, next = null, host = null } = {}) {
  const { leaf, sc, at } = pp
  const el = h('div', 'pcard')
  const head = h('div', 'pcard-head')
  head.append(h('b', '', LEAVES[leaf].name), h('span', '', 'read off the numbers'))
  el.append(head)
  const own = host ? null : storyMarks(sc.text, [])
  if (own) el.append(own)
  const keys = PARAM_ROWS[leaf]
  const cls = Object.fromEntries(keys.map((k, i) => [k, 'pv' + (i % 5)]))
  const rows = keys.map(k => {
    const v = sc.vars[k]
    const row = h('div', 'pcard-row ' + cls[k] + (k === at ? ' asked' : ''))
    const say = h('p', 'pcard-say')
    if (v.from) say.append(h('q', '', v.from), ' · ')
    say.append(MEANS[leaf][k] + (v.note && k !== 'k' ? ` (${v.note})` : ''))
    row.append(tex(rowTex(k, sc.vars)), say)
    return row
  })
  const val = valuesOf(leaf, sc.vars)
  const vRow = h('div', 'pcard-row values' + (at === 'values' ? ' asked' : ''))
  vRow.append(tex(`X = ${runTex(val.lo, val.hi)}`), h('p', 'pcard-say', val.why))
  el.append(...rows, vRow)
  const acts = h('div', 'row-actions')
  const replay = h('button', 'btn ghost', auto ? 'Replay' : '▶ Play')
  replay.type = 'button'
  acts.append(replay)
  if (next) acts.append(next)
  el.append(acts)
  const marksUpTo = i => keys.slice(0, i).map(k => ({ phrase: sc.vars[k].from, cls: cls[k] }))
  let run = 0
  async function play() {
    const me = ++run
    const alive = () => me === run && el.isConnected
    replay.textContent = 'Replay'
    const all = [...rows, vRow]
    all.forEach(r => (r.hidden = true))
    lightUpTo(0)
    for (let i = 0; i < all.length; i++) {
      await wait(reduced() ? 0 : i ? 1700 : 300)
      if (!alive()) return
      if (i < rows.length) lightUpTo(i + 1)
      all[i].hidden = false
      all[i].animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 350 })
      tone(semis(523.25, i === all.length - 1 ? 12 : 7), 0, 0.08, 'sine', 0.06)
    }
  }
  // the story's phrases, marked up to row i
  let shown = own
  function lightUpTo(i) {
    const fresh = storyMarks(sc.text, marksUpTo(i))
    const story = host ? host.querySelector('.story') : shown
    if (!story) return
    story.replaceWith(fresh)
    if (!host) shown = fresh
  }
  replay.addEventListener('click', play)
  if (auto) play()
  else lightUpTo(keys.length)
  return el
}

// the level's card: what to read off each distribution, and one of each to watch
function paramGuide() {
  const wrap = h('div', 'pguide')
  const table = h('div', 'pguide-table')
  for (const leaf of Object.keys(PARAMS)) {
    const row = h('div', 'pguide-row')
    const name = h('b', '', LEAVES[leaf].name)
    const what = h('div', 'pguide-what')
    for (const k of PARAM_ROWS[leaf]) {
      const line = h('p')
      line.append(tex(LETTER[k], false), ` = ${MEANS[leaf][k]}`)
      what.append(line)
    }
    const vals = { binomial: '0, 1, 2, \\ldots, n', geometric: '1, 2, 3, \\ldots', negbin: 'r, r + 1, r + 2, \\ldots', hyper: '\\max(0,\\, n - (N - r)), \\ldots, \\min(n,\\, r)', poisson: '0, 1, 2, \\ldots' }[leaf]
    const x = h('div', 'pguide-x')
    x.append(h('span', '', 'X can be'), tex(vals, false))
    row.append(name, what, x)
    table.append(row)
  }
  wrap.append(table, h('h3', 'shapes-title', 'Watch one read off'))
  const pick = h('div', 'mgf-pick')
  const stage = h('div')
  const all = []
  for (const leaf of Object.keys(PARAMS)) {
    const b = h('button', 'tool toggle', LEAVES[leaf].name)
    b.type = 'button'
    b.setAttribute('aria-pressed', 'false')
    b.addEventListener('click', () => {
      all.forEach(x => x.setAttribute('aria-pressed', String(x === b)))
      let sc
      do sc = pickOne([...STORIES[leaf], ...HARD[leaf]])()
      while (sc.latex)
      stage.replaceChildren(paramCard({ leaf, sc, at: null }, { auto: true }))
    })
    pick.append(b)
    all.push(b)
  }
  wrap.append(pick, stage)
  return wrap
}

function showParams(p, sheet) {
  const next = h('button', 'btn', 'Next')
  next.type = 'button'
  next.addEventListener('click', advance)
  const panel = paramCard(p.params, { auto: true, next, host: sheet })
  sheet.append(panel)
  next.focus({ preventScroll: true })
  panel.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
