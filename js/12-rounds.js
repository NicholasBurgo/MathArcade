// js/12-rounds.js · rounds: a level's questions, learn mode
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- rounds: a level's questions, learn mode ----------
async function startRound(short, paper = false) {
  view.replaceChildren(h('p', 'loading', 'Shuffling the deck…'))
  await mathBoot
  const queue = []
  if (isReview(short)) {
    // every level once, then more, shuffled; never the same level twice in a row
    const parts = REVIEW[short]
    const order = []
    while (order.length < roundSize(short)) {
      const next = shuffleArr(parts)
      if (next[0] === order[order.length - 1]) next.push(next.shift())
      order.push(...next)
    }
    for (const level of order.slice(0, roundSize(short))) queue.push({ p: problemFor(level), level, seen: 0, missed: false })
    round = { short, paper, queue, at: 0, combo: 0, best: 0, misses: 0, marks: [] }
    showQuestion()
    return
  }
  if (isTree(short)) {
    // every distribution once, then repeats, never the same one twice in a row
    const shuffled = () => shuffleArr(TREE_LEAVES)
    const order = []
    while (order.length < roundSize(short)) {
      const next = shuffled()
      if (next[0] === order[order.length - 1]) next.push(next.shift())
      order.push(...next)
    }
    for (const leaf of order.slice(0, roundSize(short))) queue.push({ p: treeProblem(leaf, true), seen: 0, missed: false })
  }
  if (isMgf(short)) for (const p of mgfRound(roundSize(short))) queue.push({ p, seen: 0, missed: false })
  if (isParam(short)) for (const p of paramRound(roundSize(short), paper)) queue.push({ p, seen: 0, missed: false })
  if (!isWorld0(short)) for (const p of sectionRound(short)) queue.push({ p, seen: 0, missed: false })
  round = { short, paper, queue, at: 0, combo: 0, best: 0, misses: 0, marks: [] }
  showQuestion()
}

// A section level's round: its engine kinds, which play their work out; one of every
// kind first, in a random order, then picks weighted toward the bigger topics. A level
// with no engine kinds plays its quiz and derivation parts instead.
function sectionRound(short) {
  const n = roundSize(short)
  const kinds = levelKinds(short)
  if (!kinds.length) return sliceRound(short, n)
  const out = shuffleArr(kinds).map(({ tp }) => tp.generate())
  const topics = topicsOf(short)
  const weights = topics.map(t => t.templates.length)
  const total = weights.reduce((a, b) => a + b, 0)
  const pick = T2.createFreshPicker()
  while (out.length < n) {
    let r = Math.random() * total
    let t = topics[topics.length - 1]
    for (let j = 0; j < topics.length; j++) {
      r -= weights[j]
      if (r <= 0) { t = topics[j]; break }
    }
    out.push(pick(t))
  }
  return out
}

// learn mode: one question after another, tried or shown; it never counts or ends
const learnQ = short => {
  const level = isReview(short) ? pickOne(REVIEW[short]) : short
  return { p: problemFor(level), level: isReview(short) ? level : undefined, seen: 0, missed: false }
}
async function startLearn(short) {
  view.replaceChildren(h('p', 'loading', 'Shuffling the deck…'))
  await mathBoot
  round = { short, paper: false, learn: true, queue: [learnQ(short)], at: 0, combo: 0, best: 0, misses: 0, marks: [] }
  showQuestion()
}
// Show me: the right answer picked and checked for you (it plays the same animation
// as a right answer); a build plays whole
function learnBar(p, sheet) {
  const bar = h('div', 'learn-bar')
  const show = h('button', 'btn ghost learn-show', 'Show me')
  show.type = 'button'
  const done = h('button', 'btn ghost', 'Done')
  done.type = 'button'
  done.addEventListener('click', () => openCard(round.short))
  bar.append(h('span', 'learn-note', 'Learn mode: try it, or tap Show me. Nothing here counts.'), show, done)
  show.addEventListener('click', () => {
    if (p.buildIt && round.locked) return
    show.disabled = true
    const reveal = p.slice && sheet.querySelector('.slice-reveal')
    if (reveal) return reveal.click()
    if (p.buildIt) {
      round.locked = true
      sheet.querySelectorAll('.pick, .mgf.build').forEach(x => x.remove())
      const next = h('button', 'btn', 'Next')
      next.type = 'button'
      next.addEventListener('click', advance)
      const panel = mgfPlayer(p.build ?? p.mgf.build, { auto: true, next })
      sheet.append(panel)
      panel.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      return
    }
    const answerNext = () => {
      const w = [...sheet.querySelectorAll('.pick')].find(x => x.pickNth && !x.querySelector('.pick-toggle').disabled)
      if (!w || !(w.correctIndex >= 0)) return
      w.querySelector('.pick-label').textContent = 'The answer'
      w.pickNth(w.correctIndex)
      w.querySelector('.btn')?.click()
      setTimeout(answerNext, 60)
    }
    answerNext()
  })
  return bar
}

// once a learn-mode question is answered, there is nothing left to show
const learnAnswered = () => {
  const b = view.querySelector('.learn-show')
  if (b) b.disabled = true
}

// one question from a level: a distribution story, one of the level's kinds, or (with
// no engine kinds) one of its parts
function problemFor(level) {
  if (isTree(level)) return treeProblem(undefined, true)
  if (isMgf(level)) return Math.random() < 0.25 ? mgfName() : mgfBuildProblem()
  if (isParam(level)) return paramProblem()
  const kinds = levelKinds(level)
  if (!kinds.length) return sliceRound(level, 1)[0]
  return pickOne(kinds).tp.generate()
}
