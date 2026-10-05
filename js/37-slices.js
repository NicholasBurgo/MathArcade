// js/37-slices.js · slices: one part of a quiz question or a study-guide derivation per question
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- slices: one part of a quiz question or a study-guide derivation per question ----------
// A level cuts single parts ("slices") from the problems it lists (LEVELS), with new
// numbers every time (a twin). A multi-number part is sliced again, one number per
// question. The fundamentals keep their own questions and mix slices in.
const sliceCache = new Map()
// every kind of question a level can ask: a problem, a part, and (for several numbers) one of them
function sliceKinds(short) {
  if (sliceCache.has(short)) return sliceCache.get(short)
  const out = []
  for (const [id, labels] of LEVELS[short]?.parts ?? []) {
    const p = hwById(id)
    if (!p) continue
    for (const pt of hwBuilt(p).parts) {
      if (labels && !labels.includes(pt.label)) continue
      const c = pt.check
      if (c.type === 'numbers') c.items.forEach((_, item) => out.push({ p, label: pt.label, item, self: false, typed: true }))
      else out.push({ p, label: pt.label, item: null, self: c.type === 'self', typed: c.type === 'number' })
    }
  }
  sliceCache.set(short, out)
  return out
}
function makeSlice({ p, label, item }) {
  let built = p.twin ? p.make(p.twin()) : hwBuilt(p)
  let pt = built.parts.find(x => x.label === label)
  if (!pt || (item != null && !pt.check.items?.[item])) {
    built = hwBuilt(p)
    pt = built.parts.find(x => x.label === label)
  }
  const c = pt.check
  return {
    slice: true,
    hwId: p.id,
    label,
    item,
    twin: Boolean(p.twin),
    quiz: Boolean(p.quiz),
    from: `${p.quiz ? hwName(p) : p.title}${label ? ` (${label})` : ''}`,
    text: built.text,
    ask: pt.ask,
    itemLabel: item != null ? c.items[item].label : null,
    check: item != null ? { type: 'number', ...c.items[item] } : c,
    steps: pt.steps,
    answerTex: pt.answer,
    trap: pt.trap,
    start: pt.hint,
    table: pt.steps.find(s => s.look)?.look.table ?? null,
    another: p.twin ? () => makeSlice({ p, label, item }) : null,
  }
}
// n questions for a level: every kind before any repeats, and at most one in three
// to write out and mark yourself (the rest have choices). A quiz question's level asks
// its parts in the quiz's order (js/37b).
function sliceRound(short, n, quick = false, own = false) {
  if (LEVELS[short]?.quiz) return quizLevelRound(short, n, quick, own)
  const ks = sliceKinds(short)
  const play = shuffleArr(ks.filter(k => !k.self)), write = shuffleArr(ks.filter(k => k.self))
  const out = []
  let i = 0, j = 0
  while (out.length < n && ks.length) {
    const wantWrite = write.length && (out.length % 3 === 2 || !play.length)
    out.push(makeSlice(wantWrite ? write[j++ % write.length] : play[i++ % play.length]))
  }
  return out
}
// the choices: a part's own options (all of them), or for a number the long list of
// numbers (13-answer-choices): the answer, the part's real mistakes (wrong), the same
// part with new numbers (another twin), values near it; smallest first
function sliceChoices(c, p = null) {
  if (c.type === 'choice') return shuffleArr(c.options.map((o, i) => ({ correct: i === c.correct, ...(o.tex != null ? { tex: o.tex } : { text: o.text }) })))
  const twins = []
  for (let i = 0; i < 6 && twins.length < 4 && p?.another; i++) {
    try {
      const s = p.another()
      if (s?.check?.type === 'number') twins.push(s.check.value)
    } catch {
      break
    }
  }
  return choicesForNumber({ value: c.value, tol: c.tol, wrong: c.wrong ?? [], siblings: twins, words: [p?.ask, p?.answerTex].join(' '), printed: p?.answerTex }).map(o => ({ correct: o.correct, text: o.label, num: o.v }))
}
// a slice counts toward its homework part's "new numbers" (once, on its first showing);
// one number of several only counts when it's missed (a quiz question's level: or once
// every number of the part is right in the round)
function sliceRecord(q, right) {
  const p = q.p
  if (round?.learn || q.seen !== 1) return
  if (p.item != null && right) {
    if (p.quizLevel) quizLevelItemRight(q)
    return
  }
  hwRecord(p.hwId, p.label, p.twin, right, false)
}
// where a level's parts come from: the quiz questions and the study guide's derivations,
// each a tap away
function sliceSource(short) {
  const ps = [...new Set(sliceKinds(short).map(k => k.p))]
  const from = [ps.some(p => p.quiz) && 'quiz questions', ps.some(p => !p.quiz) && 'study-guide derivations'].filter(Boolean).join(' and ')
  const el = h('div', 'slice-source')
  el.append(h('span', 'skill-tag', `From the ${from}, with new numbers`))
  for (const p of ps) el.append(hwBtn(p.quiz ? hwQuizName(p) : p.title, 'tool skill-part', () => hwOpen(p.id)))
  return el
}
function sliceHead(p, el) {
  el.append(h('div', 'slice-from', `${p.quiz ? 'Like' : 'Study guide:'} ${p.from}${p.twin ? ' · new numbers' : ''}`))
  el.append(hwPara('story', p.text))
  el.append(hwPara('ask', p.ask))
  if (p.itemLabel) {
    const l = h('p', 'slice-item')
    l.append('Find ', tex(p.itemLabel, false), '.')
    el.append(l)
  }
}
// the worked answer: played a step at a time after a right answer, all at once otherwise
// (a quiz question's level plays it like the arcade's work, right or wrong: js/37b)
function sliceSolution(p, { auto = false, next = null } = {}) {
  if (p.quizLevel) return quizSolution(p, { next })
  const box = h('div', 'plug slice-work')
  box.append(h('h3', '', 'The steps'))
  box.append(hwWalk({ steps: p.steps, answer: p.answerTex, trap: p.trap }, { auto, all: !auto }))
  if (next) {
    const acts = h('div', 'row-actions')
    acts.append(next)
    box.append(acts)
  }
  return box
}
function sliceHowTo(p) {
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
    const ex = p.another()
    body.replaceChildren(h('div', 'eyebrow', 'Same kind, new numbers · doesn’t count'))
    sliceHead(ex, body)
    body.append(sliceSolution(ex, { auto: true }))
    body.hidden = false
    btn.textContent = 'Hide the example'
    body.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  })
  wrap.append(btn, body)
  return wrap
}
function sliceQuestion(p, sheet, q) {
  if (p.quizLevel) return quizSliceQuestion(p, sheet, q)
  sliceHead(p, sheet)
  if (round.learn) sheet.append(learnBar(p, sheet))
  if (!round.paper && p.start) sheet.append(firstMove(p))
  if (!round.learn && !round.paper && p.another) sheet.append(sliceHowTo(p))
  if (p.check.type === 'self' || (round.paper && p.check.type === 'choice')) sliceWrite(p, sheet, q)
  else if (round.paper) sliceTyped(p, sheet, q)
  else {
    const opts = sliceChoices(p.check, p)
    const box = pickBox({
      placeholder: 'Choose an answer…',
      label: 'Answers',
      cls: 'answers' + (choicesAllNumbers(opts) ? ' nums' : ''),
      items: opts.map((o, i) => ({ key: i, row: () => optNodes(o), shown: () => optNodes(o) })),
      onCheck: (i, ui) => sliceAnswer(i, opts, sheet, ui),
    })
    box.correctIndex = opts.findIndex(o => o.correct)
    sheet.append(box)
  }
  view.append(sheet)
  window.scrollTo({ top: 0 })
}
function sliceAnswer(i, opts, sheet, { sel, check, wrap }) {
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
    const panel = sliceSolution(p, { auto: true, next })
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
  const picked = parseFloat(opts[i].text), a = p.check.value
  if (p.check.type === 'number' && a > 0 && a < 1 && Math.abs(picked + a - 1) < 1e-4) {
    why.append(h('p', 'diag', 'Your pick is 1 minus the answer: the other side. Check whether the question wants the area to the left (at most, less than) or the right (at least, more than).'))
  }
  why.append(sliceSolution(p))
  const { acts, cont } = gotIt(q)
  why.append(acts)
  sheet.append(why)
  cont.focus({ preventScroll: true })
  why.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
// right or wrong, once: a right one moves on, a wrong one shows the steps first
function sliceSettle(p, sheet, q, right, { shown = false } = {}) {
  if (round.locked) return
  round.locked = true
  sliceRecord(q, right)
  if (right) {
    award()
    sheet.append(h('div', 'verdict ok', shown ? 'Nice. Marked right.' : 'Correct!'))
    const next = hwBtn('Next', 'btn', advance)
    if (shown) {
      const acts = h('div', 'row-actions')
      acts.append(next)
      sheet.append(acts)
    } else sheet.append(sliceSolution(p, { auto: true, next }))
    next.focus({ preventScroll: true })
    return
  }
  miss(q)
  sheet.append(h('div', 'verdict bad', shown ? 'No problem: that’s what practice is for.' : 'Not quite.'))
  if (!shown) sheet.append(sliceSolution(p))
  const { acts, cont } = gotIt(q)
  sheet.append(acts)
  cont.focus({ preventScroll: true })
  acts.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
// the solution, then an honest "did yours match?"
function sliceMark(p, sheet, q) {
  sheet.append(sliceSolution(p))
  const mark = h('div', 'row-actions')
  const done = right => {
    mark.remove()
    sliceSettle(p, sheet, q, right, { shown: true })
  }
  mark.append(h('span', 'paper-note', 'Did yours match?'), hwBtn('Yes, I had it', 'btn', () => done(true)), hwBtn('Not yet', 'btn ghost', () => done(false)))
  sheet.append(mark)
  mark.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
// a part to write out (a derivation, or paper mode with no choices): work it, compare, be honest
function sliceWrite(p, sheet, q) {
  sheet.append(h('p', 'paper-note', 'Write it out on paper or with the pen. Then open the solution and say whether yours matched.'))
  const acts = h('div', 'row-actions')
  acts.append(hwBtn('Show the solution', 'btn slice-reveal', () => {
    acts.remove()
    sliceMark(p, sheet, q)
  }))
  sheet.append(acts)
}
// paper mode: type the number
function sliceTyped(p, sheet, q) {
  const wrap = h('div', 'written')
  const input = h('input', 'answer-input')
  Object.assign(input, { type: 'text', autocomplete: 'off', spellcheck: false, placeholder: '0.25, 1/4 or 1 − .75' })
  input.setAttribute('autocapitalize', 'none')
  const label = h('label', '', 'Your final answer (work it on paper first)')
  wrap.append(label, input)
  const acts = h('div', 'row-actions')
  const bad = h('p', 'paper-note')
  bad.hidden = true
  wrap.append(bad)
  const check = hwBtn('Check', 'btn', () => {
    const r = typedRight(input.value, p.check.value, p.check.tol)
    if (r.x == null) {
      bad.hidden = false
      bad.textContent = 'Type a number: 0.25, 1/4 or 1 − .75 all work.'
      return input.focus()
    }
    input.disabled = true
    acts.remove()
    sliceSettle(p, sheet, q, r.ok)
  })
  input.addEventListener('keydown', e => e.key === 'Enter' && check.click())
  acts.append(check, hwBtn('Show the solution', 'btn ghost slice-reveal', () => {
    acts.remove()
    input.disabled = true
    sliceMark(p, sheet, q)
  }))
  sheet.append(wrap, acts)
  setTimeout(() => input.focus({ preventScroll: true }), 0)
}
