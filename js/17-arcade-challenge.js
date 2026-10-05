// js/17-arcade-challenge.js · the practice test: one written question per level, graded after hand-in
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the practice test: one written question per level, graded after hand-in ----------
let boss = null
let clockTimer = null
const mmss = ms => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
function stopClock() {
  clearInterval(clockTimer)
  clockTimer = null
}

async function startBoss() {
  view.replaceChildren(h('p', 'loading', 'Writing the test…'))
  await mathBoot
  const pick = T2.createFreshPicker()
  const items = BOSS_ORDER.map(short => {
    if (isTree(short)) return { short, p: treeProblem(undefined, true), raw: '', paper: false, result: null }
    if (isMgf(short)) return { short, p: mgfBuildProblem(), raw: '', paper: false, result: null }
    if (isParam(short)) return { short, p: paramProblem('all'), raw: '', paper: false, result: null }
    // a level with no engine kinds: one of its parts, with a number to type when it has one
    const ks = sliceKinds(short), typed = ks.filter(k => k.typed)
    const topics = topicsOf(short)
    if (!topics.length) return { short, p: makeSlice(pickOne(typed.length ? typed : ks)), raw: '', paper: false, result: null }
    // a question that can be answered without its options, when the level has one
    let p
    for (let k = 0; k < 12; k++) {
      p = pick(topics[Math.floor(Math.random() * topics.length)])
      if (typeable(p)) break
    }
    // none of its kinds can be typed (a build): a typed part instead, when there is one
    if (!typeable(p) && typed.length) return { short, p: makeSlice(pickOne(typed)), raw: '', paper: false, result: null }
    return { short, p, raw: '', paper: false, result: null }
  })
  boss = { items, at: 0, start: Date.now(), end: null }
  stopClock()
  clockTimer = setInterval(() => {
    const el = document.getElementById('boss-clock')
    if (el && boss && !boss.end) el.textContent = mmss(Date.now() - boss.start)
  }, 1000)
  showBoss()
}

const bossDone = it => Boolean(it.raw || it.paper)
function showBoss(confirming = false) {
  screen = 'boss'
  const it = boss.items[boss.at]
  const p = it.p
  view.replaceChildren()
  const sheet = h('section', 'sheet')
  const top = h('div', 'qtop')
  const nav = h('nav', 'boss-nav')
  nav.setAttribute('aria-label', 'questions')
  boss.items.forEach((x, i) => {
    const b = h('button', (bossDone(x) ? 'done' : '') + (i === boss.at ? ' here' : ''), String(i + 1))
    b.type = 'button'
    b.setAttribute('aria-label', `question ${i + 1}: ${x.short}`)
    b.addEventListener('click', () => { boss.at = i; showBoss() })
    nav.append(b)
  })
  const clock = h('div', 'clock', mmss(Date.now() - boss.start))
  clock.id = 'boss-clock'
  top.append(nav, clock)
  sheet.append(top, h('div', 'eyebrow', `Arcade challenge · ${boss.at + 1} of ${boss.items.length} · ${it.short}`))
  if (p.slice) sliceHead(p, sheet)
  else {
    if (p.ask) sheet.append(h('p', 'ask', p.ask))
    if (p.text) sheet.append(h('p', 'story', p.text))
    sheet.append(tex(p.latex))
  }
  const last = boss.at === boss.items.length - 1
  const box = answerBox(p, () => (last ? showBoss(true) : go(1)))
  if (box.input) {
    box.input.value = it.raw
    box.input.addEventListener('input', () => {
      it.raw = box.input.value.trim()
      nav.children[boss.at].classList.toggle('done', bossDone(it))
    })
  }
  sheet.append(box.el)
  const onPaper = h('button', 'tool toggle', 'Done on paper')
  onPaper.type = 'button'
  onPaper.setAttribute('aria-pressed', String(it.paper))
  onPaper.addEventListener('click', () => {
    it.paper = !it.paper
    onPaper.setAttribute('aria-pressed', String(it.paper))
    nav.children[boss.at].classList.toggle('done', bossDone(it))
  })
  const mark = h('div', 'row-actions')
  mark.append(onPaper)
  sheet.append(mark)

  const go = d => { boss.at += d; showBoss() }
  const acts = h('div', 'row-actions')
  if (boss.at > 0) {
    const back = h('button', 'btn ghost', 'Back')
    back.type = 'button'
    back.addEventListener('click', () => go(-1))
    acts.append(back)
  }
  if (!last) {
    const next = h('button', 'btn', 'Next')
    next.type = 'button'
    next.addEventListener('click', () => go(1))
    acts.append(next)
  }
  if (confirming) {
    const left = boss.items.filter(x => !bossDone(x)).length
    acts.append(h('span', 'paper-note', `${left ? `${left} not done yet. ` : ''}Hand it in?`))
    const yes = h('button', 'btn', 'Hand it in')
    yes.type = 'button'
    yes.addEventListener('click', handIn)
    const no = h('button', 'btn ghost', 'Keep working')
    no.type = 'button'
    no.addEventListener('click', () => showBoss())
    acts.append(yes, no)
  } else {
    const hand = h('button', last ? 'btn' : 'btn ghost', 'Hand in')
    hand.type = 'button'
    hand.addEventListener('click', () => showBoss(true))
    acts.append(hand)
  }
  sheet.append(acts)
  view.append(sheet)
  window.scrollTo({ top: 0 })
  box.input?.focus({ preventScroll: true })
}

function handIn() {
  boss.end = Date.now()
  stopClock()
  for (const it of boss.items) {
    if (it.raw && typeable(it.p)) it.result = checkTyped(it.raw, it.p) ? 'ok' : 'bad'
  }
  renderReview()
}

function renderReview() {
  screen = 'boss-review'
  view.replaceChildren()
  const sheet = h('section', 'sheet')
  sheet.append(h('div', 'eyebrow', `Arcade challenge · handed in after ${mmss(boss.end - boss.start)}`))
  sheet.append(h('h2', '', 'Check your work'))
  sheet.append(h('p', 'paper-note', 'Typed answers are graded for you. For the rest, compare with your paper and be honest.'))
  const score = h('p', 'score-line')
  const finishBtn = h('button', 'btn', 'See my score')
  finishBtn.type = 'button'
  finishBtn.addEventListener('click', bossResults)
  const update = () => {
    const ok = boss.items.filter(x => x.result === 'ok').length
    const left = boss.items.filter(x => !x.result).length
    score.textContent = left ? `${ok} right so far · ${left} left to mark` : `${ok} / ${boss.items.length} right · all marked`
    finishBtn.disabled = left > 0
  }
  sheet.append(score)
  boss.items.forEach((it, i) => {
    const row = h('article', 'review-item')
    const head = h('h4', '', `${i + 1}. ${it.short}`)
    const badge = h('span', 'mark')
    const paint = () => {
      badge.className = 'mark ' + (it.result === 'ok' ? 'ok' : it.result === 'bad' ? 'bad' : 'todo')
      badge.textContent = it.result === 'ok' ? 'right' : it.result === 'bad' ? 'missed' : 'to mark'
    }
    paint()
    head.append(badge)
    row.append(head)
    if (it.p.slice) sliceHead(it.p, row)
    else {
      if (it.p.ask) row.append(h('p', 'ask', it.p.ask))
      if (it.p.text) row.append(h('p', 'story', it.p.text))
      row.append(tex(it.p.latex))
    }
    if (it.raw) row.append(h('p', 'wrote', 'You typed: ' + it.raw))
    row.append(solution(it.p))
    if (!it.result) {
      const acts = h('div', 'row-actions')
      const yes = h('button', 'btn', 'I had it')
      yes.type = 'button'
      const no = h('button', 'btn ghost', "I didn't")
      no.type = 'button'
      const decide = r => {
        it.result = r
        acts.remove()
        paint()
        update()
      }
      yes.addEventListener('click', () => decide('ok'))
      no.addEventListener('click', () => decide('bad'))
      acts.append(yes, no)
      row.append(acts)
    }
    sheet.append(row)
  })
  const end = h('div', 'row-actions')
  end.append(finishBtn)
  sheet.append(end)
  update()
  view.append(sheet)
  window.scrollTo({ top: 0 })
}

function bossResults() {
  screen = 'boss-results'
  const n = boss.items.length
  const ok = boss.items.filter(x => x.result === 'ok').length
  const r = ok / n
  state.boss = { best: Math.max(state.boss?.best ?? 0, ok), runs: (state.boss?.runs ?? 0) + 1, last: ok }
  for (const it of boss.items) state.practice[it.short] = it.result === 'ok'
  save()
  hud()
  view.replaceChildren()
  const sheet = h('section', 'sheet')
  sheet.append(h('div', 'eyebrow', 'Arcade challenge'))
  sheet.append(h('h2', '', `${ok} / ${n} · ${grade(r)}`))
  const tally = h('div', 'tally')
  const cell = (label, value) => {
    const c = h('div')
    c.append(h('b', '', value), document.createTextNode(label))
    return c
  }
  tally.append(cell('time', mmss(boss.end - boss.start)), cell('best ever', `${state.boss.best}/${n}`))
  sheet.append(tally)
  const missed = boss.items.filter(x => x.result !== 'ok')
  sheet.append(
    h('p', 'note', r >= 0.9 ? 'That is test-ready. Run it once more Monday night to be sure.' : r >= 0.7 ? 'Close. Clear the levels below once each, then take it again.' : 'Not yet. Each level below is about 5 minutes: clear them, then come back.'),
  )
  if (missed.length) {
    const redo = h('div', 'redo')
    for (const it of missed) {
      const b = h('button', 'tool', it.short)
      b.type = 'button'
      b.addEventListener('click', () => openCard(it.short))
      redo.append(b)
    }
    sheet.append(h('h3', '', 'Redo these levels'), redo)
  }
  const acts = h('div', 'row-actions')
  const again = h('button', 'btn', 'Take it again')
  again.type = 'button'
  again.addEventListener('click', startBoss)
  const map = h('button', 'btn ghost', 'Home')
  map.type = 'button'
  map.addEventListener('click', renderMap)
  acts.append(again, map)
  sheet.append(acts)
  view.append(sheet)
  window.scrollTo({ top: 0 })
  setTimeout(() => {
    if (r >= 0.7) {
      sfx.clear()
      burst(r >= 0.9 ? 200 : 110)
    } else sfx.right(0)
  }, 150)
  boss = null
}
