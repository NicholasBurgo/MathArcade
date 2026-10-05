// js/35-practice-quiz.js · the practice quiz: twins of the quiz questions, marked after hand-in
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the practice quiz: twins of the quiz questions, marked after hand-in ----------
let hwT = null
// full: one quiz question from every section; size: that many random sections instead;
// section: every quiz question of that one section. Questions keep the sections' order.
async function hwTestStart({ size = null, section = null } = {}) {
  view.replaceChildren(h('p', 'loading', 'Writing the practice quiz…'))
  await mathBoot.catch(() => {})
  const secs = hwSections()
  const picked = new Set(section ? secs.filter(s => s.id === section) : size ? shuffleArr(secs).slice(0, size) : secs)
  const ps = secs.filter(s => picked.has(s)).flatMap(s => {
    if (section) return s.ps
    const withTwin = s.ps.filter(p => p.twin)
    return [pickOne(withTwin.length ? withTwin : s.ps)]
  })
  if (!ps.length) return renderMap()
  const items = ps.map(p => ({ p, twin: Boolean(p.twin), built: p.twin ? p.make(p.twin()) : hwBuilt(p), typed: {}, marks: {} }))
  // kind ('full', 'short' or the section) is saved with the score; again makes another like it
  hwT = { items, kind: section ?? (size ? 'short' : 'full'), again: { size, section }, start: Date.now(), end: null, logged: null }
  stopClock()
  clockTimer = setInterval(() => {
    const el = document.getElementById('hw-clock')
    if (el && hwT && !hwT.end) el.textContent = mmss(Date.now() - hwT.start)
  }, 1000)
  hwTestShow()
}
const hwTestParts = () => hwT.items.flatMap(it => it.built.parts.map(pt => ({ it, pt })))
function hwTestShow() {
  screen = 'hw-test'
  const graded = Boolean(hwT.end)
  view.replaceChildren()
  const sheet = h('section', 'sheet hw-sheet')
  const top = h('div', 'qtop')
  const clock = h('span', 'clock', mmss((hwT.end ?? Date.now()) - hwT.start))
  clock.id = 'hw-clock'
  const sec = (HWX.SECTIONS ?? []).find(s => s.id === hwT.kind)
  const what = sec ? `Practice quiz · ${sec.id} ${sec.title}` : hwT.kind === 'short' ? 'Short practice quiz' : 'Practice quiz'
  top.append(h('div', 'eyebrow', graded ? `${what} · marked` : what), clock)
  sheet.append(top, h('h2', '', graded ? 'How you did' : 'Practice quiz'))
  const all = hwTestParts()
  const scoreLine = h('p', 'score-line')
  const paintScore = () => {
    const right = all.filter(({ it, pt }) => it.marks[pt.label] === true).length
    const left = all.filter(({ it, pt }) => it.marks[pt.label] == null).length
    scoreLine.textContent = `${right} of ${all.length} parts right` + (left ? ` · mark ${left} more yourself below` : ` · ${Math.round((right / all.length) * 100)}%`)
    if (hwT.logged != null) {
      state.hwTests[hwT.logged] = { at: hwT.end, right, total: all.length, ms: hwT.end - hwT.start, done: !left, kind: hwT.kind }
      save()
    }
  }
  if (graded) {
    paintScore()
    sheet.append(scoreLine, h('p', 'paper-note', 'Typed numbers are marked for you. Compare the rest with the solution and mark them yourself. Every mark counts toward your readiness.'))
  } else {
    const n = hwT.items.length
    sheet.append(h('p', 'paper-note', `${n === 1 ? 'One question' : `${n} questions`} like the quiz questions, with new numbers. Work on paper or with the pen. Type a number in a box if you want it marked for you. Hints and steps come after you hand it in.`))
  }
  hwT.items.forEach((it, qi) => {
    const q = h('section', 'hw-test-q')
    const s = (HWX.SECTIONS ?? []).find(x => x.id === it.p.section)
    q.append(h('div', 'eyebrow', `Question ${qi + 1}` + (graded ? ` · like ${hwQuizName(it.p)} · ${s?.title ?? ''}` : '')))
    q.append(hwPara('hw-story', it.built.text))
    for (const pt of it.built.parts) {
      const box = h('div', 'hw-part')
      const head = h('div', 'hw-part-head')
      if (pt.label) head.append(h('span', 'hw-label', `(${pt.label})`))
      head.append(hwPara('hw-ask', pt.ask))
      box.append(head)
      const typeable = pt.check.type === 'number' || pt.check.type === 'numbers'
      const items = pt.check.type === 'number' ? [{ label: null, value: pt.check.value, tol: pt.check.tol }] : pt.check.items ?? []
      if (!graded) {
        if (typeable) {
          const grid = h('div', 'hw-nums' + (items.length > 1 ? ' many' : ''))
          items.forEach((x, k) => {
            const row = h('label', 'hw-num')
            if (x.label) row.append(tex(x.label, false))
            const inp = h('input', 'answer-input')
            Object.assign(inp, { type: 'text', autocomplete: 'off', spellcheck: false, placeholder: 'optional', value: it.typed[pt.label]?.[k] ?? '' })
            inp.addEventListener('input', () => ((it.typed[pt.label] ??= [])[k] = inp.value))
            row.append(inp)
            grid.append(row)
          })
          box.append(grid)
        } else box.append(h('p', 'hw-self-note', 'Write it out.'))
      } else {
        const typed = it.typed[pt.label] ?? []
        if (typeable && typed.some(s => s?.trim())) {
          box.append(h('p', 'wrote', 'You wrote: ' + items.map((x, k) => typed[k] || '—').join(', ')))
        }
        const mark = h('div', 'hw-selfmark')
        const paintMark = () => {
          mark.replaceChildren()
          const m = it.marks[pt.label]
          if (m != null) {
            mark.append(h('span', 'mark ' + (m ? 'ok' : 'bad'), m ? 'Right' : 'Missed'))
            if (!typeable || !typed.some(s => s?.trim())) mark.append(hwBtn('Change', 'tool', () => { it.marks[pt.label] = null; paintMark(); paintScore() }))
            return
          }
          mark.append(h('span', '', 'Did yours match?'))
          const set = v => () => {
            it.marks[pt.label] = v
            hwRecord(it.p.id, pt.label, it.twin, v)
            paintMark()
            paintScore()
          }
          mark.append(hwBtn('Yes, I had it', 'btn', set(true)), hwBtn('Not yet', 'btn ghost', set(false)))
        }
        paintMark()
        const slot = h('div')
        const show = hwBtn('Show the solution', 'btn ghost hw-show', () => {
          show.remove()
          slot.append(hwWalk(pt, { all: true }))
        })
        const fin = h('div', 'hw-final')
        fin.append(h('div', 'piece-label', 'Answer'), tex(pt.answer))
        box.append(fin, mark, show, slot)
      }
      q.append(box)
    }
    sheet.append(q)
  })
  const acts = h('div', 'row-actions')
  if (!graded) {
    acts.append(hwBtn('Hand it in', 'btn', () => {
      hwT.end = Date.now()
      stopClock()
      // typed numbers are marked now; an empty box is left for you to mark
      for (const { it, pt } of all) {
        const items = pt.check.type === 'number' ? [{ value: pt.check.value, tol: pt.check.tol }] : pt.check.items
        const typed = it.typed[pt.label] ?? []
        if (!items || !typed.some(s => s?.trim())) continue
        const right = items.every((x, k) => typedRight(typed[k] ?? '', x.value, x.tol).ok)
        it.marks[pt.label] = right
        hwRecord(it.p.id, pt.label, it.twin, right)
      }
      state.hwTests ??= []
      hwT.logged = state.hwTests.push({ at: hwT.end, right: 0, total: all.length, ms: hwT.end - hwT.start, done: false, kind: hwT.kind }) - 1
      save()
      sfx.clear()
      hwTestShow()
    }))
    // quitting throws the test away: it takes a second tap
    const quit = hwBtn('Quit', 'btn ghost', () => {
      if (quit.dataset.sure) return renderMap()
      quit.dataset.sure = '1'
      quit.textContent = 'Tap again to quit (this quiz is lost)'
    })
    acts.append(quit)
  } else {
    acts.append(hwBtn('Another practice quiz', 'btn', () => hwTestStart(hwT.again)), hwBtn('See your weak spots', 'btn ghost', () => openSkills()), hwBtn('Home', 'btn ghost', renderMap))
  }
  sheet.append(acts)
  view.append(sheet)
  window.scrollTo({ top: 0 })
}
