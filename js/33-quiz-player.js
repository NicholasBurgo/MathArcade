// js/33-quiz-player.js · the quiz questions, step by step, and their twins
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the quiz questions, step by step, and their twins ----------
// homework/*.js add the problems (window.HW); quiz.js keeps the possible quiz questions
// (p.quiz) and the study guide's derivations. A part counts half when it is right on
// the quiz's own numbers and the other half when it is right on new numbers (a twin):
// being able to do the new numbers is what the test asks.
const HWX = window.HW ?? { problems: [], groups: [], skills: {} }
const hwKey = (id, label) => `${id}|${label}`
const hwRec = (id, label) => state.hw?.[hwKey(id, label)] ?? null
const partScore = r => (r ? (r.h === 1 ? 0.5 : 0) + (r.t === 1 ? 0.5 : 0) : 0)
const partStatus = r => (!r ? 'todo' : partScore(r) === 1 ? 'solid' : r.h === 1 || r.t === 1 ? 'got' : 'miss')
const STATUS_TEXT = { todo: 'Not tried', miss: 'Missed', got: 'Halfway', solid: 'Solid' }
const hwName = p => (p.num === 'extra' ? `${p.section} extra practice` : `${p.section} #${p.num}`)
// the way the quiz lists it: 3.4 #24, or 3.8 #61 (e–i) when the quiz asks only some parts
const hwQuizName = p => hwName(p) + (p.listed ? ` (${p.listed})` : '')
// section order (3.4 … 4.4), then problem number; a section's derivations come last
const hwSort = ps => {
  const sec = s => s.split('.').map(Number)
  return [...ps].sort((a, b) => {
    const [a1, a2] = sec(a.section), [b1, b2] = sec(b.section)
    return a1 - b1 || a2 - b2 || (parseFloat(a.num) || 999) - (parseFloat(b.num) || 999)
  })
}
// the quiz questions, section by section: the home screen, readiness, next up, weak spots
const hwOrder = () => hwSort(HWX.problems.filter(p => p.quiz))
// the test's sections that have a quiz question, each with its questions (ps)
const hwSections = () => {
  const order = hwOrder()
  return (HWX.SECTIONS ?? []).map(s => ({ ...s, ps: order.filter(p => p.section === s.id) })).filter(s => s.ps.length)
}
const hwById = id => HWX.problems.find(p => p.id === id)
const hwCache = new Map()
const hwBuilt = p => {
  if (!hwCache.has(p.id)) hwCache.set(p.id, p.make(p.hw))
  return hwCache.get(p.id)
}
const hwPartsOf = p => hwBuilt(p).parts.map(pt => ({ p, pt }))
// every part of every quiz question (what readiness counts)
const hwAll = () => hwOrder().flatMap(hwPartsOf)
// every part of every problem, the study guide's derivations too (for the arcade)
const hwEvery = () => hwSort(HWX.problems).flatMap(hwPartsOf)
const hwScore =list => (list.length ? list.reduce((a, { p, pt }) => a + partScore(hwRec(p.id, pt.label)), 0) / list.length : 0)
const hwTried = list => list.filter(({ p, pt }) => hwRec(p.id, pt.label)).length
function hwRecord(id, label, twin, right, count = true) {
  state.hw ??= {}
  const r = (state.hw[hwKey(id, label)] ??= { n: 0 })
  r.n++
  r[twin ? 't' : 'h'] = right ? 1 : 0
  if (count) {
    state.answered++
    if (right) state.correct++
  }
  save()
}
// what to do next: the first quiz part not yet right on the quiz's own numbers, then
// the first not yet right on new numbers ({ p, pt, twin }, or null when all are solid)
function hwNext() {
  const all = hwAll()
  const own = all.find(({ p, pt }) => hwRec(p.id, pt.label)?.h !== 1)
  if (own) return { ...own, twin: false }
  const tw = all.find(({ p, pt }) => p.twin && hwRec(p.id, pt.label)?.t !== 1)
  return tw ? { ...tw, twin: true } : null
}

// homework text: \( … \) inline math, \[ … \] display math, **bold**
function hwRich(text) {
  const out = []
  String(text).split(/\\\[([\s\S]*?)\\\]/).forEach((part, i) => {
    if (i % 2) return out.push(tex(part, true))
    part.split(/\*\*([\s\S]*?)\*\*/).forEach((bit, j) => {
      if (!bit) return
      if (!(j % 2)) return out.push(...richNodes(bit))
      const b = document.createElement('b')
      b.append(...richNodes(bit))
      out.push(b)
    })
  })
  return out
}
const hwPara = (cls, text) => {
  const el = h(/\\\[/.test(text) ? 'div' : 'p', cls)
  el.append(...hwRich(text))
  return el
}
const hwBtn = (text, cls, fn) => {
  const b = h('button', cls, text)
  b.type = 'button'
  if (fn) b.addEventListener('click', fn)
  return b
}
// a typed number: 0.25, .25, 1/4, 25%, 1 - .95^3, sqrt(156), E[X] = 4.8
function hwParse(raw) {
  let s = String(raw).trim().replace(/^[\s\S]*[=≈]/, '').trim()
  s = s.replace(/(\d),(\d{3})(?!\d)/g, '$1$2').replace(/,/g, '.')
  const pct = /%$/.test(s)
  if (pct) s = s.slice(0, -1)
  if (!s) return null
  try {
    const v = calcEval(s, null)
    return pct ? v / 100 : v
  } catch {
    return null
  }
}
const within = (x, v, tol) => Math.abs(x - v) <= tol * (1 + 1e-9) + 1e-12
// A typed answer is right when it is within the tolerance, or when it is the answer
// rounded to fewer decimals but still has 2 significant digits (0.86 for 0.8647, not
// 0.9 or 0.03 for 0.0285): right, with a reminder to give more decimals.
function typedRight(raw, v, tol) {
  const x = hwParse(raw)
  if (x == null) return { ok: false, x: null }
  if (within(x, v, tol)) return { ok: true, x }
  // 0.86, or 86% / 86.5% (a percent has 2 more decimals than it shows)
  const m = /^\s*-?(\d*)(?:\.(\d+))?\s*(%?)\s*$/.exec(String(raw).replace(/^[\s\S]*[=≈]/, ''))
  if (m && (m[2] || m[3])) {
    const d = (m[2] ?? '').length + (m[3] ? 2 : 0)
    const sig = (m[1] + (m[2] ?? '')).replace(/^0+/, '').length
    if (sig >= 2 && Math.abs(+v.toFixed(d) - x) < 1e-12) return { ok: true, x, rounded: true }
  }
  return { ok: false, x }
}

// the same part's numbers on other twins (new numbers): [[the part's numbers], …]
function hwTwinNumbers(p, pt, want = 4) {
  const out = []
  for (let i = 0; i < 6 && out.length < want && p?.twin; i++) {
    try {
      const c = p.make(p.twin()).parts.find(x => x.label === pt.label)?.check
      if (c?.type === 'number') out.push([c.value])
      else if (c?.type === 'numbers') out.push(c.items.map(x => x.value))
    } catch {
      break
    }
  }
  return out
}
// the answer box for a part: a number picked from a long list (one list per number, or
// typed: the toggle), a choice, or (to write out) nothing. p is the problem: its
// twins put the same part's answer with other numbers in the list.
function hwAnswer(pt, onResult, p = null) {
  const c = pt.check
  const wrap = h('div', 'hw-in')
  const verdict = h('p', 'hw-verdict')
  verdict.hidden = true
  const say = (ok, text) => {
    verdict.hidden = false
    verdict.className = 'hw-verdict ' + (ok ? 'ok' : 'bad')
    verdict.replaceChildren(...hwRich(text))
  }
  if (c.type === 'number' || c.type === 'numbers') {
    const items = c.type === 'number' ? [{ label: null, value: c.value, tol: c.tol, wrong: c.wrong }] : c.items
    const many = items.length > 1
    // the score message, picked or typed
    const settle = (oks, rounded) => {
      const right = oks.every(Boolean)
      const got = oks.filter(Boolean).length
      const short = right && rounded
      say(right, short ? 'Right! On the test, give 3 or 4 decimals.' : right ? 'Right!' : many ? `${got} of ${oks.length} right. Fix the red ones, or open the steps.` : 'Not quite. Try again, or open the steps.')
      const note = onResult(right)
      if (note) say(right, note + (short ? ' On the test, give 3 or 4 decimals.' : ''))
      return right
    }
    // picked: a list per number (the answer, the part's real mistakes, the twins' answers,
    // values near it, smallest first), one Check for all
    const twins = hwTwinNumbers(p, pt)
    const picked = h('div', 'hw-picks' + (many ? ' many' : ''))
    const boxes = items.map((it, i) => {
      const opts = choicesForNumber({ value: it.value, tol: it.tol, wrong: it.wrong ?? [], siblings: twins.map(t => t[i]), words: [pt.ask, pt.answer].join(' '), printed: pt.answer }).map(o => ({ correct: o.correct, text: o.label, num: o.v }))
      const box = pickBox({
        placeholder: many ? 'Pick…' : 'Choose your answer…',
        label: 'Answers',
        cls: 'answers nums hw-pick',
        title: it.label ? tex(it.label, false) : 'Your answer',
        checkButton: false,
        items: opts.map((o, j) => ({ key: j, row: () => optNodes(o), shown: () => optNodes(o) })),
        onChoose: () => (pick.disabled = boxes.some(b => b.box.value() === null)),
      })
      picked.append(box)
      return { box, opts }
    })
    const pick = hwBtn('Check', 'btn', () => {
      const oks = boxes.map(b => b.opts[b.box.value()]?.correct === true)
      boxes.forEach((b, i) => {
        b.box.classList.toggle('right', oks[i])
        b.box.classList.toggle('wrong', !oks[i])
      })
      if (settle(oks, false)) boxes.forEach(b => b.box.lock())
    })
    pick.disabled = true
    const pickRow = h('div', 'row-actions hw-pick-acts')
    pickRow.append(pick)
    // typed: a box per number (0.25, 1/4 or 1 − .75)
    const typed = h('div', 'hw-typed')
    const grid = h('div', 'hw-nums' + (many ? ' many' : ''))
    const rows = items.map(it => {
      const row = h('label', 'hw-num')
      if (it.label) row.append(tex(it.label, false))
      const inp = h('input', 'answer-input')
      Object.assign(inp, { type: 'text', autocomplete: 'off', spellcheck: false, placeholder: many ? 'a number' : 'Your answer: 0.25, 1/4 or 1 − .75' })
      inp.setAttribute('autocapitalize', 'off')
      row.append(inp)
      grid.append(row)
      return { it, row, inp }
    })
    const go = hwBtn('Check', 'btn', () => {
      const res = rows.map(r => typedRight(r.inp.value, r.it.value, r.it.tol))
      if (res.some(r => r.x == null)) {
        return say(false, many ? 'Put a number in every box. 12/13, 92.3% and 1 − .95^3 work too.' : 'Type a number. 12/13, 92.3% and 1 − .95^3 work too.')
      }
      const oks = res.map(r => r.ok)
      rows.forEach((r, i) => {
        r.row.classList.toggle('ok', oks[i])
        r.row.classList.toggle('bad', !oks[i])
      })
      settle(oks, res.some(r => r.rounded))
    })
    rows.forEach(r => r.inp.addEventListener('keydown', e => e.key === 'Enter' && go.click()))
    typed.append(grid, go)
    typed.hidden = true
    // pick from the list (paper mode without the typing), or type it
    const mode = hwBtn('Type it instead', 'tool hw-mode', () => {
      typed.hidden = !typed.hidden
      picked.hidden = pickRow.hidden = !typed.hidden
      mode.textContent = typed.hidden ? 'Type it instead' : 'Pick from a list instead'
      if (!typed.hidden) rows[0].inp.focus()
    })
    wrap.append(picked, pickRow, typed, mode, verdict)
  } else if (c.type === 'choice') {
    const list = h('div', 'hw-choices')
    let done = false
    for (const { o, i } of shuffleArr(c.options.map((o, i) => ({ o, i })))) {
      const b = h('button', 'hw-choice')
      b.type = 'button'
      if (o.tex != null) b.append(tex(o.tex, false))
      else b.append(...hwRich(o.text))
      b.addEventListener('click', () => {
        if (done) return
        const right = i === c.correct
        b.classList.add(right ? 'ok' : 'bad')
        b.disabled = true
        if (right) {
          done = true
          list.querySelectorAll('button').forEach(x => (x.disabled = true))
        }
        say(right, right ? 'Right!' : 'Not that one. Try another, or open the steps.')
        const note = onResult(right)
        if (note) say(right, note)
      })
      list.append(b)
    }
    wrap.append(list, verdict)
  } else {
    wrap.append(h('p', 'hw-self-note', 'Write it out on paper or with the pen first. Then open the solution and compare.'))
  }
  return wrap
}

// a window of a printed table, row and column lit, and a button to open the whole table
function hwLook(look, animate) {
  const opts = { name: look.table, row: String(look.row), col: String(look.col) }
  if (look.target != null) {
    opts.target = look.target
    if (look.table === 'normal') {
      const f = HWX.zFor(+look.target)
      if (f.halfway) opts.halfway = f.cells.map(c => c.z)
    }
  }
  const tl = tableLook(opts)
  if (!tl) return h('p', 'note', `Table ${look.table}: row ${look.row}, column ${look.col}`)
  const wrap = h('div', 'hw-look')
  wrap.append(tl.el, hwBtn('Open the whole table', 'tool', () => openTables(look.table, { row: opts.row, col: opts.col })))
  if (animate) tl.play(() => wrap.isConnected)
  else tl.final()
  return wrap
}

// the steps, one at a time (tap Next step), played by themselves (auto), or all at
// once; then the boxed answer
function hwWalk(pt, { all = false, auto = false, onDone = null } = {}) {
  const wrap = h('div', 'hw-walk')
  const list = h('ol', 'hw-steps')
  const bar = h('div', 'hw-step-bar')
  const count = h('span', 'hw-count')
  const end = h('div', 'hw-final')
  end.append(h('div', 'piece-label', 'Answer'), tex(pt.answer))
  if (pt.trap) end.append(hwPara('hw-trap', '**Watch out:** ' + pt.trap))
  const n = pt.steps.length
  let at = 0, done = false
  const add = animate => {
    const s = pt.steps[at++]
    const li = h('li', 'hw-step' + (animate ? ' enter' : ''))
    li.append(hwPara('hw-say', s.say))
    for (const line of [].concat(s.tex ?? [])) li.append(tex(line))
    if (s.look) li.append(hwLook(s.look, animate))
    if (s.graph) {
      const g = drawGraph(s.graph)
      if (g) {
        li.append(g.el)
        if (animate) g.play(() => li.isConnected)
      }
    }
    if (s.why) li.append(hwPara('hw-why', s.why))
    list.append(li)
    return li
  }
  const finish = () => {
    if (done) return
    done = true
    bar.remove()
    wrap.append(end)
    onDone?.()
  }
  const next = hwBtn('Next step', 'btn', () => {
    const li = add(true)
    if (at >= n) finish()
    else count.textContent = `Step ${at} of ${n}`
    ;(at >= n ? end : li).scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  })
  const rest = hwBtn('Show all', 'btn ghost', () => {
    while (at < n) add(false)
    finish()
  })
  bar.append(...(auto ? [] : [next]), rest, count)
  wrap.append(list, bar)
  if (all || (auto && reduced())) {
    while (at < n) add(false)
    finish()
  } else {
    add(true)
    if (at >= n) finish()
    else count.textContent = `Step 1 of ${n}`
    // auto: the next step every second or so, while it is still on screen
    if (auto) {
      const tick = () => {
        if (done || !wrap.isConnected) return
        add(true)
        if (at >= n) finish()
        else {
          count.textContent = `Step ${at} of ${n}`
          setTimeout(tick, 1300)
        }
      }
      setTimeout(tick, 1300)
    }
  }
  return wrap
}

// one part: the question, its skill, a hint, the answer box and the steps
function hwPartEl(p, pt, twin) {
  const box = h('section', 'hw-part')
  box.dataset.label = pt.label
  const head = h('div', 'hw-part-head')
  if (pt.label) head.append(h('span', 'hw-label', `(${pt.label})`))
  head.append(hwPara('hw-ask', pt.ask))
  const meta = h('div', 'hw-meta')
  const status = h('span', 'hw-status')
  const paint = () => {
    const st = partStatus(hwRec(p.id, pt.label))
    status.className = 'hw-status ' + st
    status.textContent = STATUS_TEXT[st]
  }
  paint()
  meta.append(hwBtn(HWX.skills[pt.skill]?.name ?? pt.skill, 'hw-skill', () => openSkills(pt.skill)), status)
  box.append(head, meta)

  // the first answer counts; looking at the steps before answering doesn't count as right
  let tried = false, peeked = false, firstOk = false
  const record = right => {
    if (tried) return
    tried = true
    firstOk = right && !peeked
    hwRecord(p.id, pt.label, twin, firstOk)
    paint()
  }
  const self = pt.check.type === 'self'
  const hint = hwPara('first-move', '**First move:** ' + pt.hint)
  hint.hidden = true
  const hintBtn = hwBtn('Hint', 'tool', () => {
    hint.hidden = !hint.hidden
    hintBtn.setAttribute('aria-pressed', String(!hint.hidden))
  })
  hintBtn.setAttribute('aria-pressed', 'false')
  const tools = h('div', 'hw-tools')
  tools.append(hintBtn)
  const answer = hwAnswer(pt, right => {
    if (right) sfx.right(0)
    else sfx.wrong()
    const counts = !tried && !peeked
    if (right && counts) burst(40)
    record(right)
    // right, but not on the first answer: say why the chip still says Missed
    if (right && !counts && !firstOk) {
      const again = twin ? 'Tap New numbers again for a fresh one.' : 'Do it with new numbers to earn it.'
      return peeked && hwRec(p.id, pt.label)?.n === 1
        ? `Right! But you opened the steps first, so it doesn’t count yet. ${again}`
        : `Right! Only your first answer counts, so this part stays Missed for now. ${again}`
    }
  }, p)
  const selfMark = () => {
    const row = h('div', 'hw-selfmark')
    row.append(h('span', '', 'Did yours match?'))
    row.append(
      hwBtn('Yes, I had it', 'btn', () => {
        record(true)
        sfx.right(0)
        row.replaceChildren(h('p', 'hw-verdict ok', twin ? 'Nice. That one is yours.' : 'Nice. Now try it with new numbers to make it stick.'))
      }),
      hwBtn('Not yet', 'btn ghost', () => {
        record(false)
        row.replaceChildren(h('p', 'hw-verdict bad', 'That’s what practice is for. Read the steps once more, then try it with new numbers.'))
      }),
    )
    return row
  }
  const slot = h('div')
  const show = hwBtn(self ? 'Show the solution' : 'Show the steps', 'btn ghost hw-show', () => {
    if (!tried && !self) peeked = true
    show.remove()
    slot.append(hwWalk(pt, { onDone: () => self && !tried && slot.append(selfMark()) }))
  })
  box.append(tools, hint, answer, show, slot)
  return box
}
