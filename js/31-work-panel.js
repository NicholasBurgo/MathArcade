// js/31-work-panel.js · show the work: an engine question's worked answer, played like World 0
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- show the work: an engine question's worked answer, played like World 0 ----------
// The rule first, with its symbols. Then each number the question gives lights up where the
// question says it and becomes a chip (the words, and the symbol when the work names one).
// The rows come one step at a time: the chips' numbers fly to their spots, the reason comes
// under each row, arithmetic a step hides is worked on the side, a table lookup plays just
// before the step that reads it (its entry flies in), the answer is boxed and the
// distribution drawn. Reduced motion shows the finished state at once.
// (The reading of the work is in 31b, the pieces and lookups in 31c.)

// a chip's symbol in TeX, to colour it in the rule
const WORK_SYM_TEX = { α: '\\alpha', β: '\\beta', γ: '\\gamma', λ: '\\lambda', μ: '\\mu', σ: '\\sigma', θ: '\\theta' }
// the rule's symbols in their chips' colours (never inside words, never the x of dx)
function workColourSyms(latex, givens) {
  const want = new Map()
  for (const g of givens) {
    if (!g.sym || !g.cls) continue
    const t = WORK_SYM_TEX[g.sym] ?? (/^[a-zA-Z]$/.test(g.sym) ? g.sym : null)
    if (t && !want.has(t)) want.set(t, g.cls)
  }
  if (!want.size) return latex
  const PARAM = /^[npqxkrstABN]$/
  let out = ''
  for (let i = 0; i < latex.length; ) {
    if (latex[i] === '\\') {
      const m = /^\\([a-zA-Z]+|[\s\S]?)/.exec(latex.slice(i))
      // words stay as they are
      if (/^(text|textbf|textit|mathrm|operatorname)$/.test(m[1]) && latex[i + m[0].length] === '{') {
        const close = matchBrace(latex, i + m[0].length)
        out += latex.slice(i, close + 1)
        i = close + 1
        continue
      }
      const cls = want.get(m[0])
      out += cls && !/[a-zA-Z]/.test(latex[i + m[0].length] ?? '') ? `{\\class{${cls}}{${m[0]}}}` : m[0]
      i += m[0].length
      continue
    }
    // a run of letters: each one a symbol (npq), or a word to leave alone (dx)
    const run = /^[a-zA-Z]+/.exec(latex.slice(i))
    if (run) {
      const letters = run[0].split('')
      const allSyms = run[0].length <= 4 && letters.every(c => PARAM.test(c) || want.has(c))
      out += allSyms ? letters.map(c => (want.has(c) ? `{\\class{${want.get(c)}}{${c}}}` : c)).join('') : run[0]
      i += run[0].length
      continue
    }
    out += latex[i++]
  }
  return out
}
// a PLUG-style line worked on the side, its first n rows lined up on the = sign
function workPieceTex(line, n) {
  const all = line.steps ? line.steps() : []
  const row = (st, j) => {
    const cls = j === all.length - 1 && !line.plain ? 'pvres' : 'pvstep'
    const at = st.indexOf('&')
    return at < 0 ? `&\\class{${cls}}{{}${st}}` : `${st.slice(0, at)}&\\class{${cls}}{{}${st.slice(at + 1)}}`
  }
  const rows = [line.tex().replace(/ (=|\\approx) /, ' &$1 ')]
  all.slice(0, n).forEach((st, j) => rows.push(row(st, j)))
  if (n >= all.length && line.tail) rows[rows.length - 1] += ' ' + line.tail()
  return `\\begin{aligned}${rows.join(' \\\\[2pt] ')}\\end{aligned}`
}

// a step of reading the work that goes wrong leaves its part out, never the work itself
const workSafe = (fn, fallback) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}
// A quiz walk (p.walk, js/37b) brings its own reading: rows (an empty row is a step with
// words only), a reason per row (say and why, or none), each table lookup with the rows it
// may land in (range), each graph with the row it follows, where the answer is (answerAt)
// and the first move (first). Its lookups that land nowhere play just before their step.
const workWalkLooks = (w, at) => w.looks.map((lw, i) => ({ spec: lw.spec, at: at(lw) ?? { r: lw.range[0], j: 0, start: -1, end: -1, tok: '', words: true }, cls: 'pvt' + i, hooks: {} }))
// the worked answer with nothing read into it: its rows, boxed at the end
function workPlainPlan(p) {
  if (p.walk) {
    const w = p.walk
    return { work: null, rows: w.rows, givens: [], links: [], looks: workWalkLooks(w, () => null), pieces: [], says: w.says, graph: null, graphs: w.graphs, extra: () => null, isAnswer: (r, j) => !!w.answerAt && r === w.answerAt.r && j === w.answerAt.j }
  }
  const work = workOf(p)
  const rows = work ? workSafe(() => workRows(work), [[work]]) : []
  const says = Array.isArray(p.steps) && p.steps.length === rows.length ? p.steps : null
  return { work, rows, givens: [], links: [], looks: [], pieces: [], says, graph: null, extra: () => null, isAnswer: (r, j) => r === rows.length - 1 && j === rows[r].length - 1 }
}
// everything one worked answer shows: rows, chips and their spots, pieces, lookups, graph
const workPlan = (p, level) => workSafe(() => workRead(p, level), null) ?? workPlainPlan(p)
function workRead(p, level) {
  const work = workOf(p)
  const rows = p.walk ? p.walk.rows : work ? workRows(work) : []
  const link = linkWork(p, rows, level)
  // (a quiz walk adds the story's fractions: p = 1/13 is one number, not two)
  if (p.walk?.moreGivens) workSafe(() => p.walk.moreGivens(rows, link), null)
  const { givens, links } = link
  const linkAt = (r, j, start) => links.find(l => l.r === r && l.j === j && l.start === start)
  const wrapG = g => `{\\class{${g.cls}}{${g.tok}}}`
  // table lookups, each tied to the step that uses what it reads
  const looks = []
  if (p.walk) {
    // (one at a time: a spot one lookup lands in is taken for the next)
    const spots = []
    looks.push(...workWalkLooks(p.walk, lw => {
      const at = workSafe(() => lookSpotIn(lw.spec, rows, lw.range, [...spots, ...links]), null)
      if (at) spots.push(at)
      return at
    }))
  } else for (const spec of workSafe(() => findLookups(p, level), [])) {
    const at = workSafe(() => lookSpot(spec, rows, [...looks.map(x => x.at).filter(Boolean), ...links]), null)
    looks.push({ spec, at, cls: 'pvt' + looks.length, hooks: {} })
  }
  // the chips a table needs: n and p choose the binomial table and its column, γ is the
  // χ² row, z is the normal table's row and column, a value read backwards is the entry
  const chipOf = spell => (spell == null ? null : givens.find(g => !g.derived && Math.abs(g.val - +spell) < 1e-12 && g.tok === String(spell)) ?? link.extra(String(spell)))
  for (const lk of looks) {
    const { name, row, col, target } = lk.spec
    const hk = (g, text) => (g ? { g, text: text ?? g.tok } : null)
    if (name === 'binomial' || name === 'binomial19') {
      lk.hooks.table = hk(chipOf(name === 'binomial19' ? '19' : '20'))
      lk.hooks.col = hk(chipOf(col))
    } else if (p.walk && /^binomial\d+$/.test(name)) {
      // (a quiz walk also reads the n = 10 and 15 tables)
      lk.hooks.table = hk(chipOf(name.slice(8)))
      lk.hooks.col = hk(chipOf(col))
    } else if (name === 'chi2') {
      lk.hooks.row = hk(chipOf(row))
      if (target != null) lk.hooks.hit = hk(chipOf(String(target)))
    } else if (name === 'normal') {
      if (target == null) {
        // (|Z| > c reads the table at −c: the chip is c)
        const zz = (Math.abs(+row) + +col).toFixed(2)
        const z = chipOf((row.startsWith('-') ? '-' : '') + zz) ?? (row.startsWith('-') ? chipOf(zz) : null)
        lk.hooks.row = hk(z, row.replace('-', '−'))
        lk.hooks.col = hk(z, col)
      } else lk.hooks.hit = hk(chipOf(String(target)))
    }
  }
  // the hidden arithmetic, worked on the side after the step that hides it
  const numTex = (r, j, start, tok) => {
    const l = linkAt(r, j, start)
    return l ? `{\\class{${l.g.cls}}{${tok}}}` : tok
  }
  const pieces = workSafe(() => workPieces(p, rows, { numTex, level }), [])
  // a number the question only implies (q = 1 − p): its line comes just before its first use
  for (const g of givens.filter(x => x.derived && x.first)) {
    const from = g.derived
    const symTex = s => WORK_SYM_TEX[s] ?? s
    const line = g.sym && from.sym && g.sym !== from.sym
      ? { order: [], label: `How to get ${g.sym}`, tex: () => `${symTex(g.sym)} = 1 - ${symTex(from.sym)}`, steps: () => [`= 1 - ${wrapG(from)}`, `= ${wrapG(g)}`] }
      : { order: [], label: `How to get ${g.tok}`, tex: () => `1 - ${wrapG(from)} = ${wrapG(g)}` }
    pieces.push({ r: g.first.r, j: g.first.j, line, before: true, g })
  }
  if (p.walk) return { work, rows, ...link, looks, pieces, says: p.walk.says, graph: null, graphs: p.walk.graphs }
  const says = Array.isArray(p.steps) && p.steps.length === rows.length ? p.steps : null
  return { work, rows, ...link, looks, pieces, says, graph: workSafe(() => inferGraph(p, level), null) }
}

function workPanel(p, { sheet = null, auto = false, next = null, level = null } = {}) {
  const plan = workPlan(p, level)
  const { work, rows, givens, links, looks, pieces, says, isAnswer } = plan
  const lastRow = rows.length - 1
  // a quiz walk: its graphs come after their rows, the answer can sit before the last row
  const walk = p.walk ?? null
  const graphsAt = r => (plan.graphs ?? []).filter(g => g.row === r)
  const bumpAt = (r, n) => (walk ? !!walk.answerAt && r === walk.answerAt.r && n === walk.answerAt.j + 1 : r === lastRow && n === rows[r].length)
  const el = h('div', 'plug work-panel' + (walk ? ' quiz-walk' : ''))
  el.append(h('h3', '', work || walk ? 'Show the work' : 'Why'))
  const rule = h('div', 'plug-line work-rule')
  const chips = h('div', 'plug-chips')
  const box = h('div', 'work-rows')
  const tail = h('div', 'work-tail')
  const why = p.hint?.text && !says ? h('p', 'plug-sub work-why', p.hint.text) : null
  el.append(rule, chips, box, tail)
  if (why) el.append(why)
  // (a quiz walk ends on the part's trap, as the steps do)
  const trap = walk?.trap ? hwPara('hw-trap', '**Watch out:** ' + walk.trap) : null
  if (trap) el.append(trap)
  const acts = h('div', 'row-actions')
  const replay = h('button', 'btn ghost', 'Replay')
  replay.type = 'button'
  acts.append(replay)
  if (next) acts.append(next)
  el.append(acts)

  // ---- TeX ----
  const ruleTex = lit => workColourSyms(p.hint?.latex ?? '', lit)
  // (typeset again only when its colours change: MathJax is the slow part on a tablet)
  let ruleShown = null
  // (a quiz walk opens on its first move, in words; its hint.latex only names the chips)
  const drawRule = lit => {
    const t = p.hint?.latex && !walk ? ruleTex(lit) : ''
    if (t === ruleShown && rule.firstChild) return
    ruleShown = t
    rule.replaceChildren(...(walk?.first ? [hwPara('first-move work-first', walk.first)] : []), ...(t ? [tex(t)] : []))
  }
  // the chips' numbers and the table's entries coloured by position; the answer boxed
  const marksAt = (r, j) => [
    ...links.filter(l => l.r === r && l.j === j).map(l => ({ start: l.start, end: l.end, cls: l.g.cls })),
    ...looks.filter(lk => lk.at && !lk.at.words && lk.at.r === r && lk.at.j === j).map(lk => ({ start: lk.at.start, end: lk.at.end, cls: lk.cls })),
  ]
  const wrapChunk = (r, j, c) => {
    let out = c
    for (const m of marksAt(r, j).sort((a, b) => b.start - a.start)) out = out.slice(0, m.start) + `{\\class{${m.cls}}{${out.slice(m.start, m.end)}}}` + out.slice(m.end)
    return out
  }
  const boxed = c => {
    const m = /^\s*(=|\\approx)\s*([\s\S]*)$/.exec(c)
    return m ? `${m[1]} \\boxed{${m[2]}}` : `\\boxed{${c}}`
  }
  const rowTex = (r, n) => rows[r].slice(0, n).map((c, j) => (isAnswer(r, j) ? `\\class{pvres}{{}${boxed(wrapChunk(r, j, c))}}` : wrapChunk(r, j, c))).join('')

  // ---- the question, lit up ----
  // where the question is: this sheet, or the example's own box ("How do I do this?"),
  // or the challenge's review item
  const host = () => sheet ?? el.closest('.howto-body, .review-item, .sheet')
  const fieldEl = field => {
    const H = host()
    if (!H) return null
    if (field === 'text') return H.querySelector('.story')
    if (field === 'ask') return H.querySelector('.ask')
    return H.querySelector('.q-math') ?? [...H.children].find(c => c.classList.contains('math-d')) ?? null
  }
  // the marks now in the question, for the words a chip flies from
  let markEls = new Map()
  let mathShown = null
  function lightQuestion(lit) {
    markEls = new Map()
    for (const field of ['text', 'ask']) {
      const src = field === 'text' ? p.text : p.ask
      const node = fieldEl(field)
      if (!src || !node) continue
      // rich text (m_X(t), \( … \)) keeps its drawing; a mark never cuts into its math
      const maths = [...src.matchAll(/\\\([\s\S]*?\\\)/g)].map(m => [m.index, m.index + m[0].length])
      const spans = []
      for (const g of lit) {
        if (g.words?.field === field) spans.push({ start: g.words.start, end: g.words.end, g })
        // the same number said again (the ask restating the story): just the number
        for (const o of g.occs ?? []) if (o.field === field && o !== g.occ) spans.push({ start: o.start, end: o.end + (o.pct ? 1 : 0), g, again: true })
      }
      spans.sort((a, b) => a.start - b.start)
      const para = h('p', node.className)
      const words = t => (RICH.test(t) ? richNodes(t) : [document.createTextNode(t)])
      let at = 0
      for (const s of spans) {
        if (s.start < at || maths.some(([a, b]) => s.start < b && s.end > a)) continue
        para.append(...words(src.slice(at, s.start)))
        const mk = h('mark', 'pvmark ' + s.g.cls, src.slice(s.start, s.end))
        para.append(mk)
        if (!s.again && !markEls.has(s.g)) markEls.set(s.g, mk)
        at = s.end
      }
      para.append(...words(src.slice(at)))
      node.replaceWith(para)
    }
    const node = fieldEl('math')
    if (p.latex && node) {
      let l = p.latex
      const spots = lit.flatMap(g => (g.occs ?? []).filter(o => o.field === 'math' && o.colourable).map(o => ({ ...o, g }))).sort((a, b) => b.start - a.start)
      for (const s of spots) l = l.slice(0, s.start) + `{\\class{${s.g.cls}}{${l.slice(s.start, s.end)}}}` + l.slice(s.end)
      let m = node
      if (l !== (mathShown ?? p.latex)) {
        m = tex(l)
        m.className = node.className
        node.replaceWith(m)
        mathShown = l
      }
      for (const g of lit) if (!markEls.has(g)) {
        const spot = m.querySelector(`svg g.${g.cls}`)
        if (spot) markEls.set(g, spot)
      }
    }
  }

  // ---- chips ----
  const chipEls = new Map()
  const chipFor = g => {
    if (chipEls.has(g)) return chipEls.get(g)
    const shown = g.tok.replace(/^-/, '−')
    const c = h('span', 'plug-chip ' + g.cls, g.sym ? `${g.sym} = ${shown}` : shown)
    // (a quiz walk leaves out words that only repeat the chip)
    const bare = t => String(t).replace(/[\s−-]/g, '')
    if (!(walk && (bare(g.where) === bare(g.tok) || bare(g.where) === bare(c.textContent)))) c.append(h('small', '', g.derived ? g.where : g.words ? `“${g.where}”` : g.where))
    chips.append(c)
    chipEls.set(g, c)
    return c
  }
  // the reason under a row: a sentence, or (a quiz walk) the step's move and its why
  const sayOf = r => says?.[r] ?? null
  const sayLength = r => (typeof sayOf(r) === 'string' ? sayOf(r).length : `${sayOf(r)?.say ?? ''} ${sayOf(r)?.why ?? ''}`.length)
  const say = r => {
    const s = sayOf(r)
    if (typeof s === 'string') return h('p', 'work-say', s)
    const d = h('div', 'work-say walk-say')
    if (s.say) d.append(hwPara('walk-move', s.say))
    if (s.why) d.append(hwPara('walk-why', s.why))
    return d
  }
  // a graph a quiz walk draws after one of its rows
  const graphEl = g => workSafe(() => drawGraph(g), null)
  // one row: tables and side work before it (read before its first step), the row, then
  // the side work and tables its later steps need, then the reason
  const rowGroup = () => {
    const G = { el: h('div', 'work-row'), before: h('div', 'work-side'), line: h('div', 'plug-line'), after: h('div', 'work-side') }
    G.el.append(G.before, G.line, G.after)
    return G
  }
  const pieceEl = (line, n) => {
    const wrap = h('div', 'work-piece')
    const d = h('div', 'plug-line work')
    d.append(tex(workPieceTex(line, n)))
    wrap.append(h('div', 'piece-label', line.label), d)
    return { wrap, d }
  }
  const looksAt = (r, j) => looks.filter(lk => lk.at && lk.at.r === r && lk.at.j === j)
  const piecesAt = (r, j, before) => pieces.filter(pc => pc.r === r && pc.j === j && !!pc.before === before)

  // the finished state at once (reduced motion, paper mode, a replay without motion)
  function showFinal() {
    run++
    try {
      drawFinal()
    } catch {
      // the plain rows, at least
      box.replaceChildren(...rows.filter(row => row.length).map(row => {
        const d = h('div', 'plug-line')
        d.append(tex(row.join('')))
        return d
      }))
    }
  }
  function drawFinal() {
    chipEls.clear()
    chips.replaceChildren()
    box.replaceChildren()
    tail.replaceChildren()
    drawRule(givens)
    // (in the order play brings them: the question's numbers, then the ones worked out)
    givens.filter(g => !g.derived).forEach(chipFor)
    givens.filter(g => g.derived).forEach(chipFor)
    rows.forEach((row, r) => {
      const G = rowGroup()
      box.append(G.el)
      // (a quiz walk's step in words only: its reason, then the table it reads)
      if (!row.length) {
        if (sayOf(r)) G.el.append(say(r))
        for (const lk of looksAt(r, 0)) {
          const tl = tableLook(lk.spec)
          if (tl) {
            G.el.append(tl.el)
            tl.final()
          }
        }
      }
      row.forEach((c, j) => {
        const side = j === 0 ? G.before : G.after
        for (const lk of looksAt(r, j)) {
          const tl = tableLook(lk.spec)
          if (tl) {
            side.append(tl.el)
            tl.final()
          }
        }
        for (const pc of piecesAt(r, j, true)) side.append(pieceEl(pc.line, Infinity).wrap)
        for (const pc of piecesAt(r, j, false)) G.after.append(pieceEl(pc.line, Infinity).wrap)
      })
      if (row.length) {
        G.line.append(tex(rowTex(r, row.length)))
        if (sayOf(r)) G.el.append(say(r))
      }
      for (const g of graphsAt(r)) {
        const gr = graphEl(g.spec)
        if (gr) G.el.append(gr.el)
      }
    })
    for (const lk of looks.filter(x => !x.at)) {
      const tl = tableLook(lk.spec)
      if (tl) {
        tail.append(tl.el)
        tl.final()
      }
    }
    const gr = drawGraph(plan.graph)
    if (gr) tail.append(gr.el)
    if (why) why.hidden = false
    if (trap) trap.hidden = false
    // (a panel not yet on the page lights its question once it is)
    if (host()) lightQuestion(givens)
    else setTimeout(() => el.isConnected && lightQuestion(givens), 0)
  }

  let run = 0
  async function play() {
    const me = ++run
    try {
      await playFrom(me)
    } catch {
      if (me === run && el.isConnected) showFinal()
    }
  }
  async function playFrom(me) {
    const alive = () => me === run && el.isConnected
    chipEls.clear()
    chips.replaceChildren()
    box.replaceChildren()
    tail.replaceChildren()
    if (why) why.hidden = true
    if (trap) trap.hidden = true
    lightQuestion([])
    // the rule first, with its symbols
    drawRule([])
    rule.classList.remove('enter')
    void rule.offsetWidth
    rule.classList.add('enter')
    await wait(500)
    // the question's numbers: the words light up, each number becomes a chip
    const lit = []
    for (const g of givens.filter(x => !x.derived)) {
      if (!alive()) return
      lit.push(g)
      lightQuestion(lit)
      drawRule(lit)
      const chip = chipFor(g)
      chip.style.opacity = '0'
      const from = markEls.get(g)
      const box0 = from?.getBoundingClientRect()
      // (from the words when they are on screen)
      if (box0 && box0.bottom > 0 && box0.top < window.innerHeight && (box0.width || box0.height)) await fly(from, chip, chip.firstChild?.textContent ?? g.tok, g.cls)
      if (!alive()) return
      chip.style.opacity = ''
      chip.animate([{ transform: 'scale(1.2)' }, { transform: 'none' }], { duration: 300 })
      tone(semis(523.25, 2 + lit.length * 2), 0, 0.06, 'sine', 0.05)
      await wait(220)
    }
    // the chips' numbers, and the tables' entries, fly to the spots new in this view
    const flyNew = async (container, seen) => {
      const landing = []
      for (const g of givens) {
        if (!chipEls.has(g)) continue
        const spots = [...container.querySelectorAll(`svg g.${g.cls}`)]
        spots.slice(seen[g.cls] ?? 0).forEach(s => landing.push({ s, from: chipEls.get(g), text: g.tok.replace(/^-/, '−'), cls: g.cls }))
        seen[g.cls] = spots.length
      }
      for (const lk of looks) {
        if (!lk.tl?.hit) continue
        const spots = [...container.querySelectorAll(`svg g.${lk.cls}`)]
        spots.slice(seen[lk.cls] ?? 0).forEach(s => landing.push({ s, from: lk.tl.hit, text: lk.at.tok.replace(/^-/, '−'), cls: 'pvt' }))
        seen[lk.cls] = spots.length
      }
      landing.forEach(x => (x.s.style.opacity = '0'))
      await Promise.all(landing.map(({ s, from, text, cls }, i) => wait(i * 90).then(() => alive() && fly(from, s, text, cls)).then(() => {
        s.style.opacity = ''
        s.classList.add('glow')
      })))
      return landing.length
    }
    // a line worked on the side: its rows one at a time
    const playPiece = async (line, into) => {
      const all = line.steps ? line.steps() : []
      const { wrap, d } = pieceEl(line, 0)
      into.append(wrap)
      wrap.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      wrap.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300 })
      const seen = {}
      await wait(300)
      await flyNew(d, seen)
      for (let n = 1; n <= all.length; n++) {
        await wait(550)
        if (!alive()) return
        d.replaceChildren(tex(workPieceTex(line, n)))
        const rs = d.querySelectorAll('svg g.pvstep, svg g.pvres')
        rs[rs.length - 1]?.classList.add('glow')
        await flyNew(d, seen)
        tone(semis(523.25, 7 + n * 2), 0, 0.08, 'sine', 0.06)
      }
      await wait(450)
    }
    // a table read just before the step that uses it; the chips fly to its row and column
    const playLook = async (lk, into) => {
      const tl = tableLook(lk.spec)
      if (!tl) return
      lk.tl = tl
      into.append(tl.el)
      tl.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      const hook = hk => hk && (async target => {
        if (!target || !alive()) return
        const c = chipFor(hk.g)
        c.animate([{ transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 300 })
        await fly(c, target, hk.text, hk.g.cls)
      })
      await tl.play(alive, { table: hook(lk.hooks.table), row: hook(lk.hooks.row), col: hook(lk.hooks.col), hit: hook(lk.hooks.hit) })
    }
    // the reason under a row, with time to read it
    const playSay = async (r, into) => {
      const s = say(r)
      into.append(s)
      s.animate([{ opacity: 0, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'none' }], { duration: 300 })
      await wait(Math.min(walk ? 3600 : 2600, 900 + 20 * sayLength(r)))
    }
    // a quiz walk's graph, right after the row it belongs to
    const playGraphs = async (r, into) => {
      for (const g of graphsAt(r)) {
        if (!alive()) return
        const gr = graphEl(g.spec)
        if (!gr) continue
        into.append(gr.el)
        gr.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
        await gr.play(alive)
      }
    }
    for (let r = 0; r < rows.length; r++) {
      if (!alive()) return
      const G = rowGroup()
      box.append(G.el)
      const seen = {}
      // (a quiz walk's step in words only: its reason, then the table it reads)
      if (!rows[r].length) {
        if (sayOf(r)) {
          G.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
          await playSay(r, G.el)
        }
        for (const lk of looksAt(r, 0)) {
          if (!alive()) return
          await playLook(lk, G.el)
        }
        await playGraphs(r, G.el)
        continue
      }
      for (let n = 1; n <= rows[r].length; n++) {
        const j = n - 1
        const side = j === 0 ? G.before : G.after
        for (const lk of looksAt(r, j)) {
          if (!alive()) return
          await playLook(lk, side)
        }
        // a number the question only implies: its line, then its chip
        for (const pc of piecesAt(r, j, true)) {
          if (!alive()) return
          await playPiece(pc.line, side)
          if (pc.g) chipFor(pc.g).animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 350 })
        }
        if (!alive()) return
        if (n === 1) G.line.classList.add('enter')
        G.line.replaceChildren(tex(rowTex(r, n)))
        if (n === 1) G.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
        const flew = await flyNew(G.line, seen)
        if (!alive()) return
        if (bumpAt(r, n)) {
          G.line.querySelector('svg g.pvres')?.classList.add('glow')
          G.line.classList.remove('enter')
          void G.line.offsetWidth
          G.line.classList.add('bump')
          sfx.right(2)
        } else tone(semis(523.25, 5 + n * 2), 0, 0.08, 'sine', 0.07)
        await wait(flew ? 300 : 600)
        // the arithmetic this step hides, worked on the side
        for (const pc of piecesAt(r, j, false)) {
          if (!alive()) return
          await playPiece(pc.line, G.after)
        }
      }
      // then why that row happened, with time to read it
      if (sayOf(r) && alive()) await playSay(r, G.el)
      if (alive()) await playGraphs(r, G.el)
    }
    // a lookup no step names, after the work
    for (const lk of looks.filter(x => !x.at)) {
      if (!alive()) return
      await playLook(lk, tail)
    }
    const gr = alive() && drawGraph(plan.graph)
    if (gr) {
      tail.append(gr.el)
      gr.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      await gr.play(alive)
    }
    if (why && alive()) {
      why.hidden = false
      why.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 })
    }
    if (trap && alive()) {
      trap.hidden = false
      trap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 })
    }
  }
  replay.addEventListener('click', () => {
    if (reduced()) showFinal()
    else play()
  })
  if (auto && !reduced()) setTimeout(play, 0)
  else showFinal()
  return el
}
