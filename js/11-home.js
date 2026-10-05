// js/11-home.js · screens
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- screens ----------
const view = document.getElementById('view')
let screen = 'map'
let round = null

function starsText(n, total = 3) {
  const wrap = h('span', 'stars')
  for (let i = 0; i < total; i++) {
    const s = h('span', i < n ? '' : 'off', '★')
    wrap.append(s)
  }
  return wrap
}

// the home screen is the arcade; the quiz questions have their own screen, one tap away
function renderMap() {
  screen = 'map'
  round = null
  stopClock()
  view.replaceChildren()
  arcadeBlock()
  quizLink()
  window.scrollTo({ top: 0 })
}

// a small card at the bottom of the home screen: the quiz questions, on their own screen
function quizLink() {
  const b = h('button', 'boss quiz-link')
  b.type = 'button'
  b.append(h('span', 'boss-title', 'Quiz questions'), h('span', '', 'The 16 possible quiz questions, worked step by step, with new numbers and a timed practice quiz.'))
  b.addEventListener('click', () => quizScreen())
  view.append(b)
}

function quizScreen() {
  screen = 'quiz'
  round = null
  stopClock()
  view.replaceChildren()
  quizBlock()
  const acts = h('div', 'row-actions')
  acts.append(hwBtn('Home', 'btn ghost', renderMap))
  view.append(acts)
  window.scrollTo({ top: 0 })
}

// the top of the home screen: readiness, next up, the quiz questions by section and the
// practice quiz (readiness counts the quiz questions' parts only)
function quizBlock() {
  const parts = hwAll()
  const r = hwScore(parts)
  const hero = h('section', 'hero')
  const words = h('div')
  words.append(h('h1', '', 'Test 2'))
  words.append(h('p', '', 'Work each quiz question step by step, then again with new numbers, and drill each section’s skills in the arcade below.'))
  const fig = h('figure', 'bell')
  fig.innerHTML = bellSvg(r)
  const cap = h('figcaption')
  if (r >= 0.6) cap.append(h('b', '', grade(r)))
  cap.append(document.createTextNode(`Ready ${Math.round(r * 100)}% · tap for weak spots`))
  fig.append(cap)
  fig.addEventListener('click', () => openSkills())
  hero.append(words, fig)
  view.append(hero)

  // next up: the first quiz part not yet right on the quiz's numbers, then on new numbers;
  // a question already started opens at that part
  const next = hwNext()
  if (next) {
    const first = hwBuilt(next.p).parts[0] === next.pt
    const cta = h('button', 'cta')
    cta.type = 'button'
    const ctaText = h('span')
    ctaText.append(
      h('small', '', next.twin ? 'Next up · new numbers' : 'Next up · the quiz’s numbers'),
      h('strong', '', `${first ? hwQuizName(next.p) : `${hwName(next.p)} (${next.pt.label})`} · ${next.p.title}`),
    )
    cta.append(ctaText, h('span', 'go', '→'))
    cta.addEventListener('click', () => hwOpen(next.p.id, { twin: next.twin, focus: first ? null : next.pt.label }))
    view.append(cta)
  }

  // the quiz questions, section by section: one dot per part
  const quiz = h('section', 'world')
  quiz.id = 'quiz-questions'
  const qh = h('div', 'world-head')
  qh.append(h('h2', '', 'Quiz questions'), h('em', '', `${hwTried(parts)}/${parts.length} parts tried`))
  quiz.append(qh, hwLegend())
  for (const s of hwSections()) {
    const sec = h('div', 'qz-sec')
    sec.id = 'qz-' + s.id
    const head = h('div', 'qz-head')
    head.append(h('h3', '', `${s.id} · ${s.title}`), h('em', '', `${Math.round(hwScore(s.ps.flatMap(hwPartsOf)) * 100)}% ready`))
    const acts = h('span', 'qz-acts')
    if (s.ps.some(p => p.twin)) acts.append(hwBtn('New numbers', 'tool', () => hwPractice(s.id)))
    const quizMe = hwBtn('Quiz me', 'tool', () => hwTestStart({ section: s.id }))
    quizMe.title = 'A timed practice quiz on this section, with new numbers'
    acts.append(quizMe)
    head.append(acts)
    const list = h('div', 'hw-list')
    for (const p of s.ps) {
      const b = hwBtn('', 'hw-prob', () => hwOpen(p.id))
      b.append(h('span', 'hw-num', hwQuizName(p)), h('span', 'hw-title', p.title), hwDots(p))
      list.append(b)
    }
    sec.append(head, list)
    quiz.append(sec)
  }
  view.append(quiz)

  // the practice quiz: new numbers, timed, marked after you hand it in; and the weak spots
  const plan = h('section', 'world')
  const ph = h('div', 'world-head')
  ph.append(h('h2', '', 'Practice quiz'))
  const grid = h('div', 'plan qz-plan')
  const card = (n, title, text, stat, fn) => {
    const b = h('button', 'plan-card')
    b.type = 'button'
    b.append(h('span', 'step-n', n), h('b', '', title), h('span', '', text))
    if (stat) b.append(h('span', 'plan-stat', stat))
    b.addEventListener('click', fn)
    grid.append(b)
  }
  // the best marked score of each kind (the old practice tests on the homework have no kind)
  const tests = state.hwTests ?? []
  const best = kind => {
    const mine = tests.filter(t => t.kind === kind)
    const done = mine.filter(t => t.done)
    if (done.length) return `Best: ${Math.round(Math.max(...done.map(t => (t.total ? t.right / t.total : 0))) * 100)}%`
    return mine.length ? 'Taken: finish marking it to see a score' : 'Not taken yet'
  }
  card(`${hwSections().length} questions`, 'Full quiz', 'One question from each section, with new numbers. Work it on paper, timed. Answers and steps after you hand it in.', best('full'), () => hwTestStart())
  card('3 questions', 'Short quiz', 'Three random sections, the same way. For when time is short.', best('short'), () => hwTestStart({ size: 3 }))
  card('Fix it', 'Weak spots', 'Every skill on the study guide, weakest first, with its quiz parts and arcade drills.', null, () => openSkills())
  plan.append(ph, grid)
  view.append(plan)
}

// the rest of the home screen: the arcade, its levels and the challenge
function arcadeBlock() {
  // readiness: the stars earned across every level that isn't a review, out of 3 each
  const drills = BOSS_ORDER
  const r = drills.length ? drills.reduce((s, k) => s + Math.min(3, state.stars[k] || 0), 0) / (3 * drills.length) : 0
  const hero = h('section', 'hero')
  const words = h('div')
  words.append(h('h1', '', 'Test 2 arcade'))
  words.append(h('p', '', 'Section by section, like the notes. Pick an answer from the list, then watch the work: the numbers fly into the formula, every piece is worked out, then the table and the graph.'))
  const fig = h('figure', 'bell')
  fig.innerHTML = bellSvg(r)
  const cap = h('figcaption')
  if (r >= 0.6) cap.append(h('b', '', grade(r)))
  cap.append(document.createTextNode(`${Math.round(r * 100)}% of the stars · tap for weak spots`))
  fig.append(cap)
  fig.addEventListener('click', () => openSkills())
  hero.append(words, fig)
  view.append(hero)
  const lit = nextUp()
  // next up: the first level without 2 stars (then without 3)
  const cta = h('button', 'cta')
  cta.type = 'button'
  const ctaText = h('span')
  ctaText.append(h('small', '', `Next up · ${placeOf(lit)}`), h('strong', '', lit))
  cta.append(ctaText, h('span', 'go', '→'))
  cta.addEventListener('click', () => openCard(lit))
  view.append(cta)
  // the fundamentals, then one block per section (its number, its title), then the mixes
  WORLDS.forEach(w => {
    const sec = h('section', 'world' + (w.sec ? ' arc-sec' : ''))
    const head = h('div', 'world-head')
    const got = w.levels.reduce((s, k) => s + Math.min(3, state.stars[k] || 0), 0)
    head.append(h('h2', '', w.sec ?? w.name), h('span', '', w.sec ? w.name : w.blurb), h('em', '', `${got}/${w.levels.length * 3} ★`))
    const lv = h('div', 'levels')
    w.levels.forEach((k, i) => {
      const s = state.stars[k] || 0
      const b = h('button', 'level' + (s ? ' cleared' : '') + (k === lit ? ' next' : ''))
      b.type = 'button'
      b.append(h('span', 'oval', String(i + 1)), h('span', 'name', k), starsText(s))
      b.addEventListener('click', () => openCard(k))
      lv.append(b)
    })
    sec.append(head, lv)
    view.append(sec)
  })
  const bossCard = h('button', 'boss')
  bossCard.type = 'button'
  bossCard.append(
    h('span', 'boss-title', 'Arcade challenge'),
    h('span', '', `One question from every arcade level, ${BOSS_ORDER.length} in all: no choices, a clock running, answers only after you hand it in.`),
  )
  if (state.boss) {
    const bestRun = h('span')
    bestRun.append(document.createTextNode('Best so far: '), h('b', '', `${state.boss.best}/${BOSS_ORDER.length}`), document.createTextNode(` · ${state.boss.runs} ${state.boss.runs === 1 ? 'run' : 'runs'}`))
    bossCard.append(bestRun)
  }
  bossCard.addEventListener('click', startBoss)
  view.append(bossCard)
}

function openCard(short) {
  screen = 'card'
  cardLevel = short
  view.replaceChildren()
  const sheet = h('section', 'sheet')
  sheet.append(h('div', 'eyebrow', `${placeOf(short)} · The idea`))
  sheet.append(h('h2', '', short))
  const ul = h('ul', 'points')
  if (isTree(short)) {
    sheet.classList.add('wide')
    if (!mathReady) mathBoot.then(() => { if (screen === 'card' && mathReady) openCard(short) })
    sheet.append(h('p', 'paper-note', 'Every question starts here. Read the chart left to right: is X a count or a measurement, then what does it count or measure? The stories are test-style, with traps: a rate that is really a fixed number of tries, a gamma that is really chi-squared, a pdf to recognise.'))
    sheet.append(treeWalk(), shapeGuide('pdf'))
  } else if (isParam(short)) {
    sheet.classList.add('wide')
    if (!mathReady) mathBoot.then(() => { if (screen === 'card' && mathReady) openCard(short) })
    sheet.append(h('p', 'paper-note', 'Each question names the distribution. Read one of its numbers off the story, or say what values X can take. This is all there is to it:'), paramGuide())
  } else if (isMgf(short)) {
    sheet.classList.add('wide')
    if (!mathReady) mathBoot.then(() => { if (screen === 'card' && mathReady) openCard(short) })
    sheet.append(h('p', 'paper-note', 'Every MGF comes from one recipe: multiply the pdf by eᵗˣ, add it up, then simplify with a few moves. Each question hands you a pdf, and you build its MGF one line at a time. Watch one built first, below; and given an MGF, read off which distribution it is.'), mgfCard())
  } else {
    if (isReview(short)) {
      ul.append(h('li', '', short === 'Everything'
        ? `${roundSize(short)} questions, one from every level, the fundamentals included, in a random order. The fundamentals’ questions use the distribution list.`
        : `${roundSize(short)} questions, one from every level of ${short.replace(' review', '')}, in a random order:`))
      if (short !== 'Everything') for (const w of WORLDS.filter(w => w.sec && w.levels.some(k => REVIEW[short].includes(k)))) ul.append(h('li', '', `${w.sec}: ${w.levels.join(' · ')}`))
    } else for (const line of CARDS[short] ?? []) ul.append(h('li', '', line))
    sheet.append(ul)
    if (!isReview(short) && !levelKinds(short).length && sliceKinds(short).length) sheet.append(sliceSource(short))
    // the table levels: each kind of lookup, worked on the printed table
    const tg = tableGuide(short)
    if (tg) {
      sheet.classList.add('wide')
      sheet.append(tg)
    }
  }
  const acts = h('div', 'row-actions')
  const go = h('button', 'btn', `Start · ${roundSize(short)} questions`)
  go.type = 'button'
  go.addEventListener('click', () => startRound(short))
  // the real test is written: same questions, no choices
  const paper = h('button', 'btn ghost')
  paper.type = 'button'
  paper.append(document.createTextNode('Paper mode'), h('span', 'mode', 'no choices'))
  paper.addEventListener('click', () => startRound(short, true))
  const back = h('button', 'btn ghost', 'Home')
  back.type = 'button'
  back.addEventListener('click', renderMap)
  // try it or have it shown, as many as you like; nothing counts
  const learn = h('button', 'btn ghost')
  learn.type = 'button'
  learn.append(document.createTextNode('Learn mode'), h('span', 'mode', 'try it or Show me · doesn’t count'))
  learn.addEventListener('click', () => startLearn(short))
  acts.append(go, learn, paper, back)
  sheet.append(acts)
  view.append(sheet)
  go.focus()
  window.scrollTo({ top: 0 })
}
