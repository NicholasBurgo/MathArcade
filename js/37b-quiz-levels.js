// js/37b-quiz-levels.js · the quiz questions as arcade levels
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the quiz questions as levels ----------
// One level per quiz question ("Quiz 3.4 #24 · Wildcat wells"). Its rounds are the parts the
// quiz lists, in the quiz's order (a part with several numbers asks one question per number),
// each with a new story and new numbers (a twin). A part the quiz writes in letters that the
// new numbers turn into another question (the uniform cdf) is asked in the quiz's own words
// too. Every question is a long dropdown, and every answer, right or wrong, plays the part's
// steps the way the arcade plays its work (quizWalk, through workPanel): the first move, the
// story's numbers as chips that fly into the rows, each step with its reason, the tables read
// just before the step that uses them, the graphs, the answer boxed. The levels stay out of
// the arcade's sections, reviews and challenge: the quiz screen opens them.

const quizLevelTry = (fn, fallback) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}
// ---------- the levels ----------
const QUIZ_LEVELS = {}
const quizLevelName = p => `Quiz ${hwQuizName(p)} · ${p.title}`
const isQuizLevel = short => Object.prototype.hasOwnProperty.call(QUIZ_LEVELS, short)
// the quiz level after this one (the last one goes back to the first)
const quizLevelAfter = short => {
  const names = Object.keys(QUIZ_LEVELS)
  return names[(names.indexOf(short) + 1) % names.length]
}

// What a level asks, in the quiz's order: each part it lists, with new numbers (one question
// per number of a part with several); and a part the quiz writes in letters, when its twin
// asks it with numbers instead, also in the quiz's own words (mode 'own'). own: every part
// on the quiz's own numbers (the card's "The quiz's own numbers").
const quizLevelKindCache = new Map()
function quizLevelKinds(short, own = false) {
  const key = short + (own ? '|own' : '')
  if (quizLevelKindCache.has(key)) return quizLevelKindCache.get(key)
  const { p } = QUIZ_LEVELS[short]
  const twinParts = new Map((p.twin ? quizLevelTry(() => p.make(p.twin()).parts, []) : []).map(pt => [pt.label, pt]))
  const out = []
  for (const pt of hwBuilt(p).parts) {
    const c = pt.check
    const tw = twinParts.get(pt.label)
    const mode = p.twin && tw && !own ? 'twin' : 'own'
    if (mode === 'twin' && c.type === 'self' && tw.check.type !== 'self') out.push({ p, label: pt.label, item: null, mode: 'own' })
    if (c.type === 'numbers') c.items.forEach((_, item) => out.push({ p, label: pt.label, item, mode }))
    else out.push({ p, label: pt.label, item: null, mode })
  }
  quizLevelKindCache.set(key, out)
  return out
}

for (const p of hwOrder()) {
  const short = quizLevelName(p)
  QUIZ_LEVELS[short] = { id: p.id, p }
  // (LEVELS, not SECTION_LEVELS: the arcade's sections, reviews and challenge never see them)
  LEVELS[short] = { kinds: [], parts: [[p.id, HWX.QUIZ?.[p.id] ?? null]], quiz: p.id }
  // every question once; a level with fewer than four asks more with new numbers
  LEVELS[short].size = Math.max(QUICK_ROUND, quizLevelKinds(short).length)
  if (QUIZ_VIDEOS[p.id]) LEVEL_VIDEOS[short] = QUIZ_VIDEOS[p.id]
}

// ---------- one question ----------
function quizLevelSlice(short, kind) {
  const { p, label, item, mode } = kind
  const quizOwn = hwBuilt(p)
  let built = mode === 'twin' && p.twin ? quizLevelTry(() => p.make(p.twin()), null) : null
  let pt = built?.parts.find(x => x.label === label)
  if (!pt || (item != null && !pt.check.items?.[item])) {
    built = quizOwn
    pt = built.parts.find(x => x.label === label)
  }
  const twin = built !== quizOwn
  const c = pt.check
  const s = {
    slice: true,
    quizLevel: short,
    kind,
    hwId: p.id,
    label,
    item,
    twin,
    quiz: true,
    from: `${hwName(p)}${label ? ` (${label})` : ''} · ${twin ? 'new numbers' : p.hw?.letters ? 'the quiz’s own words' : 'the quiz’s own numbers'}`,
    text: built.text,
    ask: pt.ask,
    itemLabel: item != null ? c.items[item].label : null,
    check: item != null ? { type: 'number', ...c.items[item] } : c,
    steps: pt.steps,
    answerTex: pt.answer,
    trap: pt.trap,
    start: pt.hint,
    table: pt.steps.find(st => st.look)?.look.table ?? null,
    // the same part with new numbers; the quiz's letters get the same part with numbers
    another: () => quizLevelSlice(short, mode === 'own' && p.twin ? { ...kind, mode: 'twin' } : kind),
  }
  // a part to write out, asked as one question on its key line, with its real slips
  if (c.type === 'self') {
    const one = quizLevelTry(() => quizOneLine(s), null)
    if (one) Object.assign(s, { ask: one.ask, check: one.check, oneLine: one })
  }
  return s
}

// a round: every question in the quiz's order; a quick one, one question from each of four
// parts (in order); a short level fills up with more new numbers. own: every part once, on
// the quiz's own numbers
function quizLevelRound(short, n, quick = false, own = false) {
  if (own) return quizLevelKinds(short, true).map(k => quizLevelSlice(short, k))
  const ks = quizLevelKinds(short)
  const want = quick ? Math.min(QUICK_ROUND, n) : n
  let pick
  if (quick) {
    const labels = [...new Set(ks.map(k => k.label))]
    const chosen = new Set(shuffleArr(labels).slice(0, want))
    pick = labels.filter(l => chosen.has(l)).map(l => pickOne(ks.filter(k => k.label === l)))
  } else pick = [...ks]
  const more = ks.filter(k => k.mode === 'twin').length ? ks.filter(k => k.mode === 'twin') : ks
  for (let i = 0; pick.length < want && more.length; i++) pick.push(more[i % more.length])
  return pick.slice(0, Math.max(want, 1)).map(k => quizLevelSlice(short, k))
}
// learn mode: the parts in order, round and round (from the first part each time the card opens)
const quizLevelLearnAt = new Map()
function quizLevelNext(short) {
  const ks = quizLevelKinds(short)
  const i = quizLevelLearnAt.get(short) ?? 0
  quizLevelLearnAt.set(short, i + 1)
  return quizLevelSlice(short, ks[i % ks.length])
}
// a part with several numbers counts once all of them are right in the round
function quizLevelItemRight(q) {
  const p = q.p
  const n = hwBuilt(hwById(p.hwId)).parts.find(x => x.label === p.label)?.check.items?.length ?? 0
  const got = ((round.quizItems ??= {})[`${hwKey(p.hwId, p.label)}|${p.twin ? 't' : 'h'}`] ??= new Set())
  got.add(p.item)
  if (n && got.size >= n) hwRecord(p.hwId, p.label, p.twin, true, false)
}

// ---------- the story, plain where it can be ----------
// Numbers are read with a leading zero (.2 is 0.2), simple inline math becomes words (so its
// numbers can light up and fly), and display math is the question's math (a .q-math line).
const QUIZ_GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', lambda: 'λ', mu: 'μ', sigma: 'σ', chi: 'χ', theta: 'θ' }
const QUIZ_SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const QUIZ_SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' }
const quizZero = s => String(s ?? '').replace(/(^|[^\d.\w\\])\.(\d)/g, '$10.$2')
function quizPlainMath(m) {
  const bit = t => (/^[\w.]+$/.test(t.trim()) ? t.trim() : `(${t.trim()})`)
  let s = m
  s = s.replace(/\\[td]?frac\{([^{}]+)\}\{([^{}]+)\}/g, (_, a, b) => `${bit(a)}/${bit(b)}`)
  s = s.replace(/\\operatorname\{([A-Za-z]+)\}\s*/g, '$1 ')
  s = s.replace(/\\text\{([^{}]*)\}/g, '$1')
  s = s.replace(/\\(?:le|leq)(?![a-zA-Z])/g, '≤').replace(/\\(?:ge|geq)(?![a-zA-Z])/g, '≥').replace(/\\ne(?![a-zA-Z])/g, '≠')
  s = s.replace(/\\cdot(?![a-zA-Z])/g, '·').replace(/\\times(?![a-zA-Z])/g, '×')
  s = s.replace(/\\(alpha|beta|gamma|lambda|mu|sigma|chi|theta)(?![a-zA-Z])/g, (_, g) => QUIZ_GREEK[g])
  s = s.replace(/\^\{(\d)\}|\^(\d)/g, (_, a, b) => QUIZ_SUP[a ?? b])
  s = s.replace(/_\{(\d+)\}|_(\d)/g, (_, a, b) => [...(a ?? b)].map(d => QUIZ_SUB[d]).join(''))
  s = s.replace(/\\[,;! ]|\\quad|\\qquad/g, ' ')
  if (/[\\{}^_]/.test(s)) return null
  return s.replace(/-/g, '−').replace(/\s+/g, ' ').trim()
}
const quizPlain = text => quizZero(String(text ?? '').replace(/\*\*/g, '').replace(/\\\(([\s\S]*?)\\\)/g, (all, m) => quizPlainMath(m) ?? all))
function quizStory(text) {
  const t = String(text ?? '')
  const blocks = [...t.matchAll(/\\\[([\s\S]*?)\\\]/g)].map(m => m[1].trim())
  const prose = t.replace(/\\\[[\s\S]*?\\\]/g, ' ').replace(/\s+/g, ' ').trim()
  const latex = !blocks.length ? null : blocks.length === 1 ? blocks[0] : `\\begin{gathered} ${blocks.join(' \\\\ ')} \\end{gathered}`
  return { text: quizPlain(prose), latex: latex && quizZero(latex) }
}
// The story's numbers the walk leaves alone: one that is no parameter (a 6-foot batter, 8:00,
// Exercise 5, the next 2 years), the top or bottom of a fraction (1/13 is one number, not
// two), and a number said twice, once by name (6 orders a day … k = 6), but for the named one.
function quizWalkSkip(field, t, src) {
  if (field === 'math') return false
  const after = src.slice(t.end), before = src.slice(0, t.start)
  if (field === 'text' && (/^-[A-Za-z]/.test(after) || /^:\d/.test(after) || /\d:$/.test(before) || /(?:Exercise|Table|Section|App\.|next) $/.test(before))) return true
  if (/^\/[\d(]/.test(after) || /\/\(?$/.test(before)) return true
  const esc = t.tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return field === 'text' && new RegExp(`(?:^|[\\s(])\\S{1,2} = ${esc}(?![\\d.])`).test(src) && !/(?:^|[\s(])\S{1,2} = $/.test(before)
}
// the words a number comes from: P[…] whole (the class writes P with brackets), else as the
// arcade reads them
function quizWalkWords(text, start, end) {
  const before = text.slice(0, start)
  const m = /\b[PF]\[[^[\]]*$/.exec(before)
  const close = m ? text.indexOf(']', end) : -1
  if (m && close >= 0 && !/[[\]]/.test(text.slice(end, close))) return { start: m.index, end: close + 1 }
  // "P[−z ≤ Z ≤ z] = 0.95": the whole statement
  const said = /\b[PF]\[[^[\]]*\]\s*=\s*$/.exec(before)
  if (said) return { start: said.index, end }
  return wordsAround(text, start, end)
}
// the story's fractions as chips (p = 1/13), each flying to the work's \frac{1}{13}, and
// 1 minus one (q = 12/13) worked on the side where the work uses it
function quizWalkFractions(text, rows, link) {
  const fr = [...String(text).matchAll(/(?<![\d.\/])(\d+)\/(\d+)(?![\d.\/])/g)].map(m => ({ a: +m[1], b: +m[2], start: m.index, end: m.index + m[0].length }))
  const once = fr.filter(f => fr.filter(g => g.a === f.a && g.b === f.b).length === 1 && f.a < f.b)
  const taken = (r, j, a, b) => link.links.some(l => l.r === r && l.j === j && l.start < b && l.end > a)
  const spotsOf = (a, b) => {
    const out = []
    rows.forEach((row, r) => row.forEach((c, j) => {
      if (link.isAnswer(r, j)) return
      for (const m of c.matchAll(new RegExp(`\\\\[dt]?frac\\{${a}\\}\\{${b}\\}`, 'g'))) if (!taken(r, j, m.index, m.index + m[0].length)) out.push({ r, j, start: m.index, end: m.index + m[0].length })
    }))
    return out
  }
  // the work names it: "p = \frac{1}{13}"
  const symOf = (a, b) => {
    for (const row of rows) for (let j = 1; j < row.length; j++) {
      const m = /([a-zA-Z])\s*$/.exec(row[j - 1])
      if (m && new RegExp(`^\\s*=\\s*\\\\[dt]?frac\\{${a}\\}\\{${b}\\}\\s*(?:$|,)`).test(row[j])) return m[1]
    }
    return null
  }
  for (const f of once) {
    if (link.givens.length >= 5) return
    const spots = spotsOf(f.a, f.b)
    if (!spots.length) continue
    const words = quizWalkWords(text, f.start, f.end)
    const g = { key: `frac:${f.a}/${f.b}`, tok: `${f.a}/${f.b}`, val: f.a / f.b, sym: symOf(f.a, f.b), occ: { field: 'text', start: f.start, end: f.end }, occs: [], words: { field: 'text', ...words }, where: text.slice(words.start, words.end), first: spots[0], cls: 'pv' + link.givens.length }
    link.givens.push(g)
    for (const sp of spots) link.links.push({ ...sp, g })
    // 1 minus it, where the work writes it
    const q = spotsOf(f.b - f.a, f.b)
    if (q.length && link.givens.length < 5) {
      const d = { key: `q:${f.b - f.a}/${f.b}`, tok: `${f.b - f.a}/${f.b}`, val: 1 - f.a / f.b, sym: symOf(f.b - f.a, f.b), derived: g, where: `1 − ${f.a}/${f.b}`, first: q[0], occs: [], cls: 'pv' + link.givens.length }
      link.givens.push(d)
      for (const sp of q) link.links.push({ ...sp, g: d })
    }
  }
}

// the question as the level shows it: where it comes from, the story, its math, the ask
function quizHead(p, el) {
  const st = quizStory(p.text)
  el.append(h('div', 'slice-from', p.from))
  if (st.text) el.append(hwPara('story', st.text))
  if (st.latex) {
    const m = tex(st.latex)
    m.classList.add('q-math')
    el.append(m)
  }
  el.append(hwPara('ask', quizPlain(p.ask)))
  if (p.itemLabel) {
    const l = h('p', 'slice-item')
    l.append('Find ', tex(p.itemLabel, false), '.')
    el.append(l)
  }
}

// ---------- the walk: a part's steps, played like the arcade's work ----------
// split a row of TeX at its = and ≈ signs (not inside brackets, braces or \left … \right)
function quizWalkChunks(src) {
  const parts = []
  let d = 0, from = 0
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|[\s\S]?)/.exec(src.slice(i))
      if (m[1] === 'left' || m[1] === 'begin') d++
      else if (m[1] === 'right' || m[1] === 'end') d--
      else if (d === 0 && i > from && m[1] === 'approx') {
        parts.push(src.slice(from, i))
        from = i
      }
      i += m[0].length - 1
      continue
    }
    if (c === '{' || c === '(' || c === '[') d++
    else if (c === '}' || c === ')' || c === ']') d--
    else if (d === 0 && i > from && c === '=') {
      parts.push(src.slice(from, i))
      from = i
    }
  }
  parts.push(src.slice(from))
  return parts.filter(x => x.trim())
}
// a step's look, as tableLook reads it (a normal area read halfway uses the z between)
function quizWalkLook(look) {
  const spec = { name: look.table, row: String(look.row), col: String(look.col) }
  if (look.target != null) {
    spec.target = look.target
    if (look.table === 'normal') {
      const f = quizLevelTry(() => HWX.zFor(+look.target), null)
      if (f?.halfway) spec.halfway = f.cells.map(x => x.z)
    }
  }
  return spec
}
const quizTexNorm = t => quizZero(String(t ?? '')).replace(/\\left|\\right|\\[,;!: ]|\\quad|\\qquad|\s+/g, '').replace(/\\[dt]frac/g, '\\frac')
// the value a chunk says ("= 0.9231", "\approx 12.49 \text{ hours}"), or null
function quizChunkValue(c) {
  const t = c.replace(/^\s*(?:=|\\approx)\s*/, '').replace(/\\text\{[^{}]*\}/g, '').replace(/,?\s*\\q?quad[\s\S]*$/, '').replace(/\\[,;! ]/g, ' ').trim()
  if (!t || /[a-zA-Z]/.test(t.replace(/\\[td]?frac|\\sqrt|\\cdot|\\times|\\left|\\right/g, ''))) return null
  return workTexValue(t)
}
// an antiderivative's bracket with its limits as the arcade writes it, \Big[ … \Big]_a^b, so the
// work reads it the same way (worked on the side, top minus bottom)
function quizWalkBrackets(t) {
  let out = t
  for (let at = out.indexOf('\\left['); at >= 0; at = out.indexOf('\\left[', at + 1)) {
    let d = 0, k = at
    for (; k < out.length; k++) {
      if (out.startsWith('\\left', k)) d++
      else if (out.startsWith('\\right', k) && --d === 0) break
    }
    if (k >= out.length || !out.startsWith('\\right]', k) || out[k + 7] !== '_') continue
    out = `${out.slice(0, at)}\\Big[${out.slice(at + 6, k)}\\Big]${out.slice(k + 7)}`
  }
  return out
}
function quizWalk(p) {
  const st = quizStory(p.text)
  const rows = [], says = [], looks = [], graphs = [], firstRow = []
  p.steps.forEach((s, i) => {
    firstRow[i] = rows.length
    // (\qquad as two \quad, so "n = 10, \qquad p = 0.2" reads p as named)
    const lines = [].concat(s.tex ?? []).map(l => quizWalkBrackets(quizZero(l).replace(/\\qquad(?![a-zA-Z])/g, '\\quad\\quad')))
    const reason = { say: quizZero(s.say), why: s.why ? quizZero(s.why) : null }
    if (!lines.length) {
      rows.push([])
      says.push(reason)
    }
    lines.forEach((l, k) => {
      rows.push(quizWalkChunks(l))
      says.push(k === lines.length - 1 ? reason : null)
    })
    if (s.graph) graphs.push({ row: rows.length - 1, spec: s.graph })
  })
  // each lookup lands in its own step's rows or the next step's
  p.steps.forEach((s, i) => {
    if (!s.look) return
    const end = i + 1 < p.steps.length ? firstRow[i + 2] ?? rows.length : rows.length
    looks.push({ spec: quizWalkLook(s.look), range: [firstRow[i], Math.max(firstRow[i], end - 1)] })
  })
  // the answer: a number is boxed where the work last says it; a line or a formula is boxed
  // whole, as the last row (the last step's row when it already is that line)
  let answerAt = null
  const c = p.check
  const want = c.type === 'number' ? c : null
  if (want) {
    for (let r = rows.length - 1; r >= 0 && !answerAt; r--) {
      for (let j = rows[r].length - 1; j >= 0; j--) {
        if (j === 0 && rows[r].length > 1) continue
        const v = quizChunkValue(rows[r][j])
        if (v != null && Math.abs(v - want.value) <= Math.max(want.tol, 1e-9 * Math.abs(want.value))) {
          answerAt = { r, j }
          break
        }
      }
    }
  }
  if (!answerAt) {
    // (a part to write out asked as one line ends on what it shows, the part's answer)
    const right = c.type === 'choice' && !p.oneLine ? c.options[c.correct] : null
    const ans = quizZero(right?.tex ?? p.answerTex)
    const last = rows.length - 1
    if (want) {
      // (a number the work never states: its own line, from the part's answer)
      rows.push(p.itemLabel ? [p.itemLabel + ' ', `${rel(exact(want.value))} ${num(want.value)}`] : quizWalkChunks(ans))
      says.push(null)
    } else if (last >= 0 && rows[last].length && quizTexNorm(rows[last].join('')) === quizTexNorm(ans)) rows[last] = [ans]
    else {
      rows.push([ans])
      says.push(null)
    }
    answerAt = { r: rows.length - 1, j: rows[rows.length - 1].length - 1 }
  }
  // the formulas the steps write in letters (f(x) = e^(−k)k^x/x!) line the work's numbers up
  // with their letters; they are not drawn
  const rules = p.steps.flatMap(s => [...`${s.say} ${s.why ?? ''}`.matchAll(/\\\(([\s\S]*?)\\\)/g)].map(m => m[1]))
    .filter(m => /=/.test(m) && /\\[dt]?frac|\^/.test(m) && !/[PF]\[|[PF]\(/.test(m) && numberTokens(m, true).every(t => Number.isInteger(t.val) && Math.abs(t.val) <= 2))
  // (a story that lists every part's integral: its numbers are other parts')
  const latex = st.latex && !/\\text\{\([a-z]\)\}/.test(st.latex) ? st.latex : null
  return {
    text: st.text,
    ask: quizPlain(p.ask),
    latex,
    steps: quizWalkNames(p, rows),
    hint: rules.length ? { latex: rules.slice(0, 2).join(' \\quad ') } : null,
    workSkip: quizWalkSkip,
    workWords: quizWalkWords,
    walk: { rows, says, looks, graphs, answerAt, first: p.start ? `**First move:** ${p.start}` : null, trap: p.trap ?? null, moreGivens: (rs, link) => quizWalkFractions(st.text, rs, link) },
  }
}
// The names of the work's numbers, as "n = 10" sayings (workPanel names the chips with them):
// a row in letters, then the same left side in numbers (E[X] = np, then E[X] = 10(0.2)), and
// what the steps say ("Put in r = 4, p = .1"). A letter given two numbers, or a number two
// letters, names nothing.
function quizWalkNames(p, rows) {
  const got = []
  for (let r = 0; r + 1 < rows.length; r++) {
    const a = rows[r], b = rows[r + 1]
    if (a.length !== 2 || b.length < 2 || quizTexNorm(a[0]) !== quizTexNorm(b[0])) continue
    for (const x of quizLevelTry(() => workAlignInside(a[1], b[1], true), [])) {
      const sym = workSymText(x.sym)
      if (sym && !/^[xtwXe]$/.test(sym)) got.push({ sym, num: x.num })
    }
  }
  for (const st of p.steps) for (const x of workSayings(quizPlain(`${st.say} ${st.why ?? ''}`))) if (!/^[xtwX]$/.test(x.sym)) got.push(x)
  const bySym = new Map(), byNum = new Map()
  for (const x of got) {
    ;(bySym.get(x.sym) ?? bySym.set(x.sym, new Set()).get(x.sym)).add(+x.num)
    ;(byNum.get(+x.num) ?? byNum.set(+x.num, new Set()).get(+x.num)).add(x.sym)
  }
  const ok = [...new Map(got.filter(x => bySym.get(x.sym).size === 1 && byNum.get(+x.num).size === 1).map(x => [x.sym, x])).values()]
  return [ok.map(x => `${x.sym} = ${x.num}`).join(', ')]
}
// the walk as a panel; it plays straight away, right answer or wrong (the finished state with
// reduced motion), and Replay plays it again
function quizSolution(p, { next = null, sheet = null } = {}) {
  const panel = quizLevelTry(() => workPanel(quizWalk(p), { sheet, auto: true, next, level: null }), null)
  if (panel) return panel
  // (if the walk can't be read, the steps one at a time, as the old view shows them)
  const box = h('div', 'plug slice-work')
  box.append(h('h3', '', 'The steps'), hwWalk({ steps: p.steps, answer: p.answerTex, trap: p.trap }, { auto: true }))
  if (next) {
    const acts = h('div', 'row-actions')
    acts.append(next)
    box.append(acts)
  }
  return box
}

// ---------- the dropdown ----------
// Numbers: the long list of 12 (the answer, its real mistakes, the same part's answer with
// other numbers, values near it). Choices: the part's own options, the slips it leaves out (a
// cdf's), and the same part's options with other numbers, never one that says the same as
// the answer: up to 10.
const QUIZ_PICK_MAX = 10
function quizPickNumbers(p) {
  const c = p.check
  const sibs = []
  for (let i = 0; i < 6 && sibs.length < 4; i++) {
    const s = quizLevelTry(() => p.another(), null)
    if (s?.check?.type === 'number') sibs.push(s.check.value)
  }
  const opts = choicesForNumber({ value: c.value, tol: c.tol, wrong: c.wrong ?? [], siblings: sibs, words: [p.ask, p.answerTex].join(' '), printed: p.answerTex }).map(o => ({ correct: o.correct, text: o.label, num: o.v }))
  opts.siblings = sibs
  return opts
}
// ---- when two options say the same ----
// a list of values (x = 0, 1, …, 4), as a set
function quizValueSet(t) {
  const m = /^\s*x\s*=\s*([-\d\s,]+(?:\\[lc]?dots\s*,?\s*-?\d+)?)\s*$/.exec(quizTexNorm(t).replace(/,/g, ', ').replace(/\\ldots/g, ' \\ldots '))
  if (!m) return null
  const toks = m[1].split(',').map(x => x.trim()).filter(Boolean)
  const vals = []
  for (let k = 0; k < toks.length; k++) {
    if (/^\\[lc]?dots/.test(toks[k])) {
      const a = vals[vals.length - 1], b = parseInt(toks[k].replace(/^\\[lc]?dots/, '') || toks[k + 1], 10)
      if (!Number.isInteger(a) || !Number.isInteger(b)) return null
      for (let x = a + 1; x < b; x++) vals.push(x)
      if (!toks[k].replace(/^\\[lc]?dots/, '')) continue
      vals.push(b)
      continue
    }
    if (!/^-?\d+$/.test(toks[k])) return null
    if (!vals.includes(+toks[k])) vals.push(+toks[k])
  }
  return [...new Set(vals)].sort((a, b) => a - b)
}
// a formula's values at a few points (its letters set to them), or null
function quizFnSig(t) {
  const body = t.replace(/^[^=]*=/, '').replace(/,\s*\\q?quad[\s\S]*$/, '')
  const letters = [...new Set(body.replace(/\\[a-zA-Z]+/g, ' ').match(/[a-df-zA-Z]/g) ?? [])]
  const f = workTexFn(body, letters)
  if (!f) return null
  const vals = []
  for (const at of [0.13, 0.37, 0.71, 1.3, 2.9]) {
    const env = Object.fromEntries(letters.map((l, k) => [l, at + k * 0.53]))
    const v = f(env)
    if (!Number.isFinite(v)) return null
    vals.push(+v.toPrecision(9))
  }
  return vals.join(',')
}
// what an option says, in one canonical string
function quizOptionSig(o) {
  if (o.tex == null) return 'text:' + quizZero(o.text ?? '').replace(/\s+/g, ' ').trim()
  const t = o.tex
  const set = quizValueSet(t)
  if (set) return 'set:' + set.join(',')
  const name = /\\text\{\s*([A-Za-z ]+?)\s*\}/.exec(t)?.[1]
  if (name && !/cases/.test(t)) {
    const pairs = [...t.matchAll(/([a-zA-Z])\s*=\s*([^,]+?)(?=,|$)/g)].map(m => `${m[1]}=${+(workTexValue(quizZero(m[2]).replace(/\\[,;! ]/g, ' ')) ?? NaN).toPrecision(9)}`)
    return `dist:${name.toLowerCase()}:${pairs.sort().join(';')}`
  }
  const cases = /\\begin\{cases\}([\s\S]*)\\end\{cases\}/.exec(t)
  if (cases) {
    const pieces = cases[1].split('\\\\').map(pc => pc.split('&').map(x => x.trim()))
    return 'cases:' + pieces.map(([e, cond]) => `${quizFnSig(`=${e}`) ?? quizTexNorm(e)}@${quizTexNorm(cond)}`).join('|') + '|' + quizTexNorm(t.replace(cases[0], ''))
  }
  const sup = /,\s*\\q?quad\s*([\s\S]*)$/.exec(t)?.[1] ?? ''
  const fn = quizFnSig(t)
  return fn ? `fn:${quizTexNorm(t.split('=')[0])}:${fn}|${quizTexNorm(sup)}` : 'tex:' + quizTexNorm(t)
}
const quizSameOption = (a, b) => quizOptionSig(a) === quizOptionSig(b) || (a.tex ?? a.text) === (b.tex ?? b.text)

// ---- a cdf in three pieces (the uniform's): its real slips ----
function quizCdfParts(t) {
  const m = /^F\(x\) = \\begin\{cases\} 0 & x \\le (\S+) \\\\ \\dfrac\{x - \1\}\{([^{}]+)\} & \1 < x < (\S+) \\\\ 1 & x \\ge \3 \\end\{cases\}$/.exec(String(t ?? '').trim())
  return m ? { A: m[1], W: m[2], B: m[3] } : null
}
function quizCdfSlips(t) {
  const c = quizCdfParts(t)
  if (!c) return []
  const { A, W, B } = c
  const cdf = (lo, mid, hi) => `F(x) = \\begin{cases} ${lo} & x \\le ${A} \\\\ ${mid} & ${A} < x < ${B} \\\\ ${hi} & x \\ge ${B} \\end{cases}`
  const mid = `\\dfrac{x - ${A}}{${W}}`
  return [
    { tex: cdf(0, `\\dfrac{x}{${W}}`, 1), why: `starts the area at 0: it starts at ${A}, so the middle piece is (x − ${A}) over the length.` },
    { tex: cdf(0, `\\dfrac{1}{${W}}`, 1), why: `is the pdf, the height of the rectangle: F(x) is the area up to x, the height times the width x − ${A}.` },
    { tex: cdf(0, `\\dfrac{${B} - x}{${W}}`, 1), why: 'is the area to the RIGHT of x: F(x) = P[X ≤ x] is the area to the left.' },
    { tex: cdf(0, `\\dfrac{x + ${A}}{${W}}`, 1), why: `flips a sign: x/(length) − ${A}/(length) is (x − ${A})/(length).` },
    { tex: cdf(0, mid, 0), why: `drops back to 0 after ${B}: f is 0 there, but F keeps all the area built up, so F = 1.` },
    { tex: cdf(1, mid, 0), why: 'has the ends swapped: a cdf starts at 0 on the left and climbs to 1 on the right.' },
    { tex: `F(x) = ${mid}`, why: `is only the middle piece: “for every x” needs F = 0 before ${A} and F = 1 after ${B} too.` },
  ]
}

// ---- a part to write out, asked as one question on its key line ----
function quizOneLine(s) {
  // a cdf in letters or numbers: the right one among its real slips
  const cdf = quizCdfParts(s.answerTex)
  if (cdf) {
    const slips = quizCdfSlips(s.answerTex)
    return {
      ask: `${s.ask} Which is \\(F(x)\\)?`,
      check: { type: 'choice', options: [{ tex: s.answerTex }, ...slips.map(x => ({ tex: x.tex }))], correct: 0 },
      whys: slips.map(x => x.why),
    }
  }
  // "verify it is a density" for f(x) = c·x^m on 0 < x < B: the area line among its slips
  const m = /f\(x\) = (\\frac\{(\d+)\}\{(\d+)\})(x(?:\^\{(\d+)\})?) \\qquad 0 < x < (\d+)/.exec(s.text)
  if (m && /valid density/i.test(s.ask)) {
    const C = m[1], pw = +(m[5] ?? 1), B = m[6], q = pw + 1
    const xp = k => (k === 1 ? 'x' : `x^{${k}}`)
    const lhs = `\\int_0^{${B}} ${C}${xp(pw)}\\,dx = `
    const line = (inner, front = C) => `${lhs}${front}\\left[${inner}\\right]_0^{${B}}`
    const opts = [
      { tex: line(`\\frac{${xp(q)}}{${q}}`), why: null },
      { tex: line(xp(q)), why: `doesn’t divide by the new power: the antiderivative of ${pw === 1 ? 'x' : `x^${pw}`} is x^${q}/${q}.` },
      { tex: line(`\\frac{${xp(pw)}}{${q}}`), why: `doesn’t raise the power: the power rule adds 1 to the power, then divides by the new power.` },
      { tex: line(`\\frac{${xp(q)}}{${q}}`, ''), why: `drops the constant ${quizPlainMath(C)}: it stays in front of the integral.` },
      { tex: line(`\\frac{${xp(q + 1)}}{${q + 1}}`), why: 'integrates x·f(x): that is E[X], the mean. The total area integrates f(x) alone.' },
    ]
    if (pw >= 2) {
      opts.push({ tex: line(`\\frac{${xp(q)}}{${pw}}`), why: `divides by the old power ${pw}: divide by the new power, ${q}.` })
      opts.push({ tex: line(`${pw}${xp(pw - 1)}`), why: `takes the derivative: the area needs the antiderivative, x^${q}/${q}.` })
    }
    return {
      ask: `${s.ask} The first check, f(x) ≥ 0, you can see. Which line sets up and integrates the total area correctly?`,
      check: { type: 'choice', options: opts.map(o => ({ tex: o.tex })), correct: 0 },
      whys: opts.slice(1).map(o => o.why),
    }
  }
  return null
}

// ---- why a wrong option is wrong, when the part says ----
const QUIZ_SET_WHY = (pick, right) => {
  const out = []
  if (pick[0] < 0) out.push('starts below 0: a count can’t be negative.')
  else if (pick[0] < right[0]) out.push('starts too low: there aren’t enough failures to fill the draw, so at least n − (N − r) of the draws are successes.')
  else if (pick[0] > right[0]) out.push('starts too high: there are enough failures to fill the draw, so X can be as low as max(0, n − (N − r)).')
  if (pick[pick.length - 1] > right[right.length - 1]) out.push('runs too high: X can’t be more than n (the number drawn) or r (the successes there are).')
  else if (pick[pick.length - 1] < right[right.length - 1]) out.push('stops too soon: X runs all the way up to min(n, r).')
  return out.length ? out.join(' And it ') : null
}
// (pad: the option is another story's; only the slips that hold whatever the numbers are named)
function quizOptionWhy(p, o, right, pad = false) {
  const t = o.tex ?? o.text ?? ''
  const rt = right.tex ?? right.text ?? ''
  const set = o.tex != null && quizValueSet(t), rset = right.tex != null && quizValueSet(rt)
  if (set && rset) return QUIZ_SET_WHY(set, rset)
  if (pad && !/\\text\{(?:geometric|binomial|negative binomial|Poisson)\}/.test(rt)) return null
  const has = re => re.test(t)
  if (/\\text\{(?:geometric|binomial|negative binomial|Poisson)\}/.test(rt)) {
    const dist = s => /\\text\{([^{}]+)\}/.exec(s)?.[1]
    const d = dist(t), rd = dist(rt)
    const val = (s, k) => workTexValue(quizZero(new RegExp(`(?:^|[^a-zA-Z])${k}\\s*=\\s*([^,]+?)(?=,|$)`).exec(s)?.[1] ?? '').replace(/\\[,;! ]/g, ' '))
    if (d && d !== rd) {
      if (d === 'Poisson') return 'is a Poisson, which counts events in a stretch of time or space. X counts tries.'
      if (d === 'geometric') return 'is geometric, which counts tries until the FIRST success.' + (rd === 'binomial' ? ' Here the number of tries is fixed: X counts successes in it.' : ' X here waits for more than one success.')
      if (d === 'binomial') return 'is binomial, which fixes the number of tries and counts successes. Here the number of tries is what X counts.'
      if (d === 'negative binomial') return 'is negative binomial, which counts tries until the r-th success.'
      return null
    }
    for (const k of ['n', 'r']) if (val(t, k) != null && val(rt, k) != null && Math.abs(val(t, k) - val(rt, k)) > 1e-9) return k === 'n' ? 'has the wrong n: n is the fixed number of tries in the story.' : 'has the wrong r: r is how many successes X waits for.'
    if (val(t, 'p') != null && val(rt, 'p') != null && Math.abs(val(t, 'p') + val(rt, 'p') - 1) < 1e-9) return 'uses the chance of the other outcome: p goes with what X counts (or waits for), and the other chance is q = 1 − p.'
    if (val(t, 'p') != null && val(rt, 'p') != null && Math.abs(val(t, 'p') - val(rt, 'p')) > 1e-9) return 'has another p: read the chance of a success off this story.'
    return null
  }
  if (/^f\(x\)/.test(rt) && /\\quad x = 1/.test(rt)) {
    if (has(/x = 0/)) return 'starts at x = 0, but the first success comes on try 1 at the earliest.'
    if (has(/\^\{x\}/)) return 'has the power x: on try x there are only x − 1 failures before the success.'
    return 'swaps p and q: each of the x − 1 failures has chance q, and the success has chance p.'
  }
  if (/^m_X\(t\)/.test(rt)) {
    if (has(/\\left\(/)) return 'is a binomial’s MGF, (q + pe^t)^n. X here is geometric.'
    // (the top of the fraction: the brace group after \dfrac)
    const at = t.indexOf('\\dfrac{')
    const top = at < 0 ? '' : t.slice(at + 7, matchBrace(t, at + 6))
    if (!/e\^t/.test(top)) return 'drops the e^t on top: pulling pe^t out of the sum leaves pe^t over (1 − qe^t).'
    return 'swaps p and q: p goes on top with e^t, q in the bottom with e^t.'
  }
  if (o.text != null && /^Yes\./.test(rt)) {
    const k = +(/X \\ge (\d+)\]/.exec(rt)?.[1] ?? NaN)
    if (/bigger than 0/.test(t)) return 'mixes up possible and likely: a chance this small is rare enough to be surprising.'
    if (Number.isFinite(k) && /^Yes\./.test(t)) return `reads the wrong row: “at least ${k}” is 1 − F(${k - 1}); 1 − F(${k}) leaves ${k} itself out.`
    if (Number.isFinite(k) && /^No\./.test(t)) return `stops at F(${k - 1}), the chance of at most ${k - 1}: the question wants the other side, 1 minus it.`
  }
  return null
}

// the options: [{ correct, tex | text, why, from }]
function quizPickChoices(p) {
  const c = p.check
  const right = c.options[c.correct]
  const out = []
  const seen = new Set([quizOptionSig(right)])
  const add = (o, from, why) => {
    if (out.length >= QUIZ_PICK_MAX - 1) return
    const k = quizOptionSig(o)
    if (seen.has(k) || quizSameOption(o, right)) return
    seen.add(k)
    out.push({ correct: false, ...(o.tex != null ? { tex: o.tex } : { text: o.text }), from, why: why ?? null })
  }
  // the part's own slips, then the slips it leaves out (a cdf's)
  const extra = quizCdfSlips(right.tex)
  const whyOf = o => p.oneLine?.whys[c.options.indexOf(o) - 1] ?? extra.find(x => x.tex === o.tex)?.why ?? quizOptionWhy(p, o, right)
  c.options.forEach((o, i) => i !== c.correct && add(o, 'own', whyOf(o)))
  for (const x of extra) add({ tex: x.tex }, 'slip', x.why)
  // the same part with other numbers: the ones asked the same way first, their right
  // answers (the right form, other numbers) before their slips
  // (a question in letters gets no numbers: a formula with numbers is no answer to it)
  const pads = []
  const letters = !p.twin && QUIZ_LEVELS[p.quizLevel]?.p.hw?.letters
  for (let i = 0; i < 10 && pads.length < 24 && !letters; i++) {
    const s = quizLevelTry(() => p.another(), null)
    if (s?.check?.type !== 'choice') continue
    s.check.options.forEach((o, j) => pads.push({ o, right: j === s.check.correct, same: quizPlain(s.ask) === quizPlain(p.ask) }))
  }
  pads.sort((a, b) => b.same - a.same || b.right - a.right)
  for (const x of pads) add(x.o, x.right ? 'twin' : 'twin-slip', quizOptionWhy(p, x.o, right, true))
  return shuffleArr([{ correct: true, ...(right.tex != null ? { tex: right.tex } : { text: right.text }) }, ...out])
}
function quizPickOptions(p) {
  if (p.check.type === 'number') return quizPickNumbers(p)
  if (p.check.type === 'choice') return quizPickChoices(p)
  return null
}

// ---------- a wrong pick: which slip it was ----------
// numbers: the other side (1 − the answer), a step on the way in the work, one of the part's
// real mistakes (named by its trap when the trap says that number), or the same part's
// answer with another story's numbers. Choices: the slip the option makes.
const quizSpellings = v => {
  const out = new Set()
  for (let d = 0; d <= 4; d++) {
    const s = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d)
    out.add(s)
    out.add(String(+s))
    if (/^-?0\./.test(s)) out.add(s.replace(/^(-?)0\./, '$1.'))
  }
  return [...out].filter(s => s.replace(/\D/g, '').replace(/^0+/, '').length >= 2 || Number.isInteger(+s))
}
const quizSays = (text, v) => quizSpellings(v).some(s => new RegExp(`(^|[^\\d.])${s.replace('.', '\\.').replace('-', '[-−]')}(?![\\d])`).test(text))
function quizSlipNote(p, picked, opts) {
  const lab = picked.text ?? ''
  if (p.check.type !== 'number' || picked.num == null) {
    if (picked.why) return `Your pick ${picked.why}`
    if (picked.from === 'twin') return 'Your pick is the right kind of answer, but for another story’s numbers. Read the numbers off this story.'
    if (picked.from === 'twin-slip') return 'Your pick has another story’s numbers, and a slip besides.'
    return picked.from === 'own' && p.trap ? 'Your pick is one of the slips this part sets up. The trap here is below.' : null
  }
  const v = picked.num, a = p.check.value, tol = p.check.tol
  const near = x => Math.abs(x - v) <= Math.max(tol, 1e-9 * Math.abs(x))
  const shown = lab.replace(/^-/, '−')
  if (a > 0 && a < 1 && Math.abs(v + a - 1) < 1e-4) return `Your pick, ${shown}, is 1 minus the answer: the other side. Check whether the question wants the area to the left (at most, less than) or to the right (at least, more than).`
  // a value the work reaches on the way
  const w = quizLevelTry(() => quizWalk(p), null)
  if (w) {
    for (const row of w.walk.rows) {
      for (let j = 1; j < row.length; j++) {
        const x = quizChunkValue(row[j])
        if (x == null || !near(x) || near(a)) continue
        const lhs = row[0].replace(/\\(?:Rightarrow|iff)[\s\S]*$/, '').trim()
        if (!lhs || !/[a-zA-Z]/.test(lhs)) continue
        return `Your pick, ${shown}, is \\(${lhs}\\), a step on the way in the work below, not what this question asks for.`
      }
    }
  }
  if ((p.check.wrong ?? []).some(near)) {
    if (p.trap && quizSays(quizZero(p.trap), v)) return `Your pick, ${shown}, is the slip this part is known for. ${p.trap}`
    return `Your pick, ${shown}, is one of the usual slips on this part.${p.trap ? ' The trap here is below.' : ''}`
  }
  if ((opts?.siblings ?? []).some(near)) return `Your pick, ${shown}, is this part’s answer for another story’s numbers. Use this story’s numbers.`
  return null
}

// ---------- the question ----------
function quizSliceQuestion(p, sheet, q) {
  quizHead(p, sheet)
  if (round.learn) sheet.append(learnBar(p, sheet))
  if (!round.paper && p.start) sheet.append(firstMove(p))
  if (!round.learn && !round.paper && p.another) sheet.append(quizHowTo(p))
  const opts = !round.paper && quizPickOptions(p)
  if (!opts) {
    // paper mode (a number typed, a line written out) or a part with no fair list
    if (p.check.type === 'number') sliceTyped(p, sheet, q)
    else sliceWrite(p, sheet, q)
  } else {
    const box = pickBox({
      placeholder: 'Choose an answer…',
      label: 'Answers',
      cls: 'answers' + (choicesAllNumbers(opts) ? ' nums' : ''),
      items: opts.map((o, i) => ({ key: i, row: () => optNodes(o), shown: () => optNodes(o) })),
      onCheck: (i, ui) => quizSliceAnswer(i, opts, sheet, ui),
    })
    box.correctIndex = opts.findIndex(o => o.correct)
    sheet.append(box)
  }
  view.append(sheet)
  window.scrollTo({ top: 0 })
}
function quizSliceAnswer(i, opts, sheet, { sel, check, wrap }) {
  if (round.locked) return
  round.locked = true
  sel.disabled = true
  check.disabled = true
  const q = round.queue[round.at]
  const p = q.p
  if (opts[i].correct) {
    wrap.classList.add('right')
    sliceRecord(q, true)
    award()
    const next = hwBtn('Next', 'btn', advance)
    const panel = quizSolution(p, { next, sheet })
    sheet.append(panel)
    next.focus({ preventScroll: true })
    panel.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
    return
  }
  sliceRecord(q, false)
  miss(q)
  wrap.classList.add('wrong')
  const good = opts.findIndex(o => o.correct)
  const why = h('div', 'why')
  why.append(h('h3', '', 'Not quite'))
  const said = (who, o) => {
    const el = h('p', 'pick-said')
    el.append(h('b', '', who), ...optNodes(o))
    return el
  }
  why.append(said('You picked: ', opts[i]), said('The answer: ', opts[good]))
  const note = quizLevelTry(() => quizSlipNote(p, opts[i], opts), null)
  if (note) why.append(hwPara('plug-sub plug-slip', note))
  why.append(quizSolution(p, { sheet }))
  const { acts, cont } = gotIt(q)
  why.append(acts)
  sheet.append(why)
  cont.focus({ preventScroll: true })
  why.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
// "How do I do this?": the same part with new numbers, answered, and its work played
function quizHowTo(p) {
  const wrap = h('div', 'howto')
  const body = h('div', 'howto-body')
  body.hidden = true
  const btn = hwBtn('How do I do this?', 'btn ghost', () => {
    if (!body.hidden) {
      body.hidden = true
      body.replaceChildren()
      btn.textContent = 'How do I do this?'
      return
    }
    const ex = quizLevelTry(() => p.another(), null)
    if (!ex) return
    body.replaceChildren(h('div', 'eyebrow', p.twin ? 'Same kind, new numbers · doesn’t count' : 'The same question with numbers · doesn’t count'))
    quizHead(ex, body)
    const box = h('div', 'reveal-box')
    const c = ex.check
    box.append(h('h3', '', 'Answer'))
    if (c.type === 'choice') {
      const o = c.options[c.correct]
      box.append(o.tex != null ? tex(o.tex) : hwPara('', o.text))
    } else if (c.type === 'number') {
      const l = h('p', 'pick-said')
      if (ex.itemLabel) l.append(tex(ex.itemLabel, false), ' = ')
      l.append(h('span', 'pick-num', fmtChoice(c.value).replace(/^-/, '−')))
      box.append(l)
    } else box.append(tex(ex.answerTex))
    body.append(box, quizSolution(ex))
    body.hidden = false
    btn.textContent = 'Hide the example'
    body.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  })
  wrap.append(btn, body)
  return wrap
}

// ---------- the level's card ----------
// the quiz's own story, cut short: whole sentences up to about 220 characters (its math kept)
function quizShortStory(text) {
  const t = String(text ?? '').trim()
  if (t.length <= 260 || /\\\[/.test(t)) return t
  let cut = 0
  for (const m of t.matchAll(/[.?!](?=\s)/g)) {
    if (m.index > 220) break
    cut = m.index + 1
  }
  return cut ? `${t.slice(0, cut)} …` : t
}
function quizLevelCard(short) {
  const { p } = QUIZ_LEVELS[short]
  screen = 'card'
  cardLevel = short
  quizLevelLearnAt.delete(short)
  view.replaceChildren()
  const sheet = h('section', 'sheet qz-card')
  const sec = (HWX.SECTIONS ?? []).find(s => s.id === p.section)
  sheet.append(h('div', 'eyebrow', `${p.section}${sec ? ' · ' + sec.title : ''} · Quiz question`))
  sheet.append(h('h2', '', short))
  const built = hwBuilt(p)
  sheet.append(hwPara('hw-story', quizShortStory(built.text)))
  const ul = h('ul', 'points qz-parts')
  for (const pt of built.parts) {
    const li = h('li')
    if (pt.label) li.append(h('b', '', `(${pt.label}) `))
    li.append(...hwRich(pt.ask))
    ul.append(li)
  }
  sheet.append(h('div', 'eyebrow qz-card-sub', built.parts.length === 1 ? 'What it asks' : `The ${built.parts.length} parts it asks`), ul)
  const kinds = quizLevelKinds(short)
  const letters = kinds.some(k => k.mode === 'own') && p.twin
  sheet.append(h('p', 'paper-note', `Every question is one part of it, from a long list of answers, with a new story and new numbers each time${letters ? ' (and the part written in letters, in the quiz’s own words)' : ''}. Right or wrong, the work then plays out: the story’s numbers fly in, each step with its reason, the table and the graph. A part counts toward Ready when you get it right on new numbers, and again on the quiz’s own numbers.`))
  const dots = h('div', 'qz-card-dots')
  dots.append(h('span', 'skill-tag', 'Ready'), hwDots(p))
  sheet.append(dots)
  const vids = videoCard(short)
  if (vids) sheet.append(vids)
  const acts = h('div', 'row-actions')
  const go = hwBtn(`Start · ${roundSize(short)} questions`, 'btn', () => startRound(short))
  const quick = hwBtn(`Quick round · ${Math.min(QUICK_ROUND, roundSize(short))} questions`, 'btn', () => startRound(short, false, true))
  const learn = hwBtn('', 'btn ghost', () => startLearn(short))
  learn.append(document.createTextNode('Learn mode'), h('span', 'mode', 'try it or Show me · doesn’t count'))
  const paper = hwBtn('', 'btn ghost', () => startRound(short, true))
  paper.append(document.createTextNode('Paper mode'), h('span', 'mode', 'no choices'))
  const back = hwBtn('Quiz questions', 'btn ghost', () => hwHome(p.section))
  acts.append(go, quick, learn, paper, back)
  sheet.append(acts)
  // the quiz's own numbers, every part once: the other half of being ready
  const ownRow = h('div', 'row-actions qz-own')
  const ownBtn = hwBtn('', 'btn ghost', () => startRound(short, false, false, true))
  ownBtn.append(document.createTextNode(`The quiz’s own numbers · ${quizLevelKinds(short, true).length} questions`), h('span', 'mode', 'the quiz as written'))
  ownRow.append(ownBtn)
  sheet.append(ownRow)
  // the older page: every part at once, on the quiz's own numbers
  const old = h('p', 'qz-old')
  old.append(hwBtn('Old view', 'tool', () => hwOpen(p.id)), h('span', 'paper-note', ' every part on one page, with the quiz’s own numbers'))
  sheet.append(old)
  view.append(sheet)
  go.focus()
  window.scrollTo({ top: 0 })
}
