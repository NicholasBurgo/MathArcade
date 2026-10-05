// js/34-quiz-screens.js · the quiz question screens
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the quiz question screens ----------
let hwTable = null // the printed table the open problem uses, for the Tables button
async function hwOpen(id, { twin = false, queue = null, focus = null } = {}) {
  await mathBoot.catch(() => {})
  const p = hwById(id)
  if (!p) return hwHome()
  screen = 'hw'
  round = null
  stopClock()
  closeOverlay()
  const useTwin = Boolean(twin && p.twin)
  const built = useTwin ? p.make(p.twin()) : hwBuilt(p)
  hwTable = built.parts.flatMap(pt => pt.steps).find(s => s.look)?.look.table ?? null
  view.replaceChildren()
  const sheet = h('section', 'sheet hw-sheet')
  // a quiz question, or (from the arcade) one of the study guide's derivations
  const sec = (HWX.SECTIONS ?? []).find(s => s.id === p.section)
  const where = sec ? `${sec.id} ${sec.title}` : p.section
  sheet.append(h('div', 'eyebrow', [p.quiz ? 'Quiz question' : 'Derivation from the study guide', useTwin ? 'new numbers' : '', where].filter(Boolean).join(' · ')))
  sheet.append(h('h2', '', p.quiz ? `${hwQuizName(p)} · ${p.title}` : p.title))
  const sw = h('div', 'hw-switch')
  const own = hwBtn(p.quiz ? 'The quiz’s numbers' : 'Original numbers', 'tool', () => hwOpen(id, { queue }))
  own.setAttribute('aria-pressed', String(!useTwin))
  sw.append(own)
  if (p.twin) {
    const tw = hwBtn(useTwin ? 'New numbers again' : 'New numbers', 'tool', () => hwOpen(id, { twin: true, queue }))
    tw.setAttribute('aria-pressed', String(useTwin))
    sw.append(tw)
  }
  sheet.append(sw)
  sheet.append(h('p', 'paper-note', useTwin
    ? 'Same kind of problem, new story and new numbers: this is what a test question looks like. Your first answer counts.'
    : p.twin
      ? 'Answer each part before you look: your first answer is the one that counts, and if you open the steps first it won’t count as right. Stuck? Tap Hint. Then do it again with New numbers.'
      : 'This one has no numbers to change, so it’s the same every time. Practice writing it out from memory. Your first answer counts.'))
  sheet.append(hwPara('hw-story', built.text))
  const parts = built.parts.map(pt => hwPartEl(p, pt, useTwin))
  sheet.append(...parts)
  const list = queue ?? hwOrder().map(q => ({ id: q.id, twin: false }))
  const i = list.findIndex(x => x.id === id)
  const acts = h('div', 'row-actions')
  const go = k => () => hwOpen(list[k].id, { twin: list[k].twin, queue })
  if (i >= 0 && i < list.length - 1) {
    const nx = hwById(list[i + 1].id)
    acts.append(hwBtn(`Next: ${hwQuizName(nx)} →`, 'btn', go(i + 1)))
  }
  if (i > 0) acts.append(hwBtn('← Back', 'btn ghost', go(i - 1)))
  acts.append(p.quiz ? hwBtn('All quiz questions', 'btn ghost', () => hwHome(p.section)) : hwBtn('Home', 'btn ghost', renderMap))
  sheet.append(acts)
  view.append(sheet)
  const at = focus != null && parts.find(el => el.dataset.label === focus)
  if (at) {
    at.scrollIntoView({ block: 'start' })
    at.classList.add('flash')
  } else window.scrollTo({ top: 0 })
}

function hwDots(p) {
  const d = h('span', 'hw-dots')
  for (const pt of hwBuilt(p).parts) {
    const st = partStatus(hwRec(p.id, pt.label))
    const i = h('i', st)
    i.title = `(${pt.label || '–'}) ${STATUS_TEXT[st]}`
    d.append(i)
  }
  return d
}
const hwLegend = () => {
  const l = h('p', 'hw-legend')
  for (const st of ['todo', 'miss', 'got', 'solid']) {
    const s = h('span')
    s.append(h('i', st), STATUS_TEXT[st])
    l.append(s)
  }
  l.append(h('span', 'hw-legend-note', '“Halfway” = right on the quiz’s numbers or on new numbers. “Solid” = right on both.'))
  return l
}

// the quiz questions are on the home screen: go there, at one section's questions
function hwHome(sectionId = null) {
  quizScreen()
  document.getElementById(sectionId ? 'qz-' + sectionId : 'quiz-questions')?.scrollIntoView({ block: 'start' })
}

// twins, weakest first: questions whose parts aren't right on new numbers yet come
// first (one section's questions, or all of them)
function hwPractice(sectionId = null) {
  const twinScore = p => {
    const ps = hwBuilt(p).parts
    return ps.filter(pt => hwRec(p.id, pt.label)?.t === 1).length / ps.length
  }
  const ps = hwOrder().filter(p => p.twin && (sectionId == null || p.section === sectionId))
  if (!ps.length) return hwHome(sectionId)
  const queue = shuffleArr(ps).sort((a, b) => twinScore(a) - twinScore(b)).map(p => ({ id: p.id, twin: true }))
  hwOpen(queue[0].id, { twin: true, queue })
}
