// js/14-question.js · the question screen: ask, answer, then the worked answer
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the question screen: ask, answer, then the worked answer ----------
function showQuestion() {
  screen = 'question'
  const q = round.queue[round.at]
  q.seen++
  if (q.p.buildIt && !round.paper) q.p = buildAsOne(q.p)
  const p = q.p
  view.replaceChildren()
  const sheet = h('section', 'sheet')
  // once the question is drawn: Check, Hint, How do I do this? and Skip on one row
  queueMicrotask(() => questionActions(sheet))
  const top = h('div', 'qtop')
  const prog = h('div', 'progress')
  round.queue.forEach((x, i) => {
    const mark = round.marks[i]
    prog.append(h('i', mark === 'ok' ? 'ok' : mark === 'bad' ? 'bad' : mark === 'skip' ? 'skip' : i === round.at ? 'now' : ''))
  })
  top.append(round.learn ? h('span', 'learn-tag', 'Learn mode · doesn’t count') : prog, skipButton(q))
  sheet.append(top)
  sheet.append(h('div', 'eyebrow', round.short + (q.level ? ' · ' + q.level : '') + (round.paper ? ' · paper mode' : '') + (q.seen > 1 ? ' · second chance' : '')))
  if (p.slice) return sliceQuestion(p, sheet, q)
  if (p.ask) sheet.append(h('p', 'ask', p.ask))
  if (p.text) sheet.append(h('p', 'story', p.text))
  const qMath = tex(p.latex)
  qMath.classList.add('q-math')
  sheet.append(qMath)
  if (round.learn) sheet.append(learnBar(p, sheet))
  if (!round.paper && p.start) sheet.append(firstMove(p))
  if (!round.learn && !round.paper && p.another) {
    // a kind that is the same every time: its example is this answer, so peeking is a miss
    const peeked = () => {
      if (!q.missed) {
        q.missed = true
        round.misses++
      }
      if (q.seen < 3 && q.requeuedAt !== q.seen) {
        q.requeuedAt = q.seen
        round.queue.push(q)
      }
    }
    sheet.append(howTo(p, q.level ?? round.short, peeked))
  }
  if (round.paper) {
    paperQuestion(p, sheet)
    return
  }
  if (p.buildIt) {
    buildQuestion(p, sheet)
    view.append(sheet)
    window.scrollTo({ top: 0 })
    return
  }
  // a story to name (World 0): every distribution; a number (a plug level's story too)
  // or a formula: the long list from choicesFor
  if (p.leaf && p.vars && typeof p.answer !== 'number') {
    pickQuestion(p, sheet)
    view.append(sheet)
    window.scrollTo({ top: 0 })
    return
  }
  const opts = choicesFor(p)
  const box = pickBox({
    placeholder: 'Choose an answer…',
    label: 'Answers',
    cls: 'answers' + (choicesAllNumbers(opts) ? ' nums' : ''),
    items: opts.map((o, i) => ({ key: i, row: () => optNodes(o), shown: () => optNodes(o) })),
    onCheck: (i, ui) => answer(i, opts, sheet, ui),
  })
  box.correctIndex = opts.findIndex(o => o.correct && !o.also)
  sheet.append(box)
  view.append(sheet)
  window.scrollTo({ top: 0 })
}

// Check first (learn mode's Show me presses the box's first button), then Hint, How do I
// do this? and Skip, all on one row under the answer; what Hint and How do I do this? open
// goes under the row. A question without one Check keeps its own layout.
function questionActions(sheet) {
  if (!sheet.isConnected) return
  const check = [...sheet.querySelectorAll('button')].find(b => b.textContent.trim() === 'Check' && !b.closest('.why, .plug, .mgf, .q-acts'))
  if (!check) return
  const row = h('div', 'q-acts')
  check.before(row)
  row.append(check)
  const helps = [...sheet.querySelectorAll(':scope > .howto')]
  for (const w of helps) {
    const btn = w.querySelector(':scope > button')
    if (btn) row.append(btn)
  }
  const skip = sheet.querySelector('.skip-btn')
  if (skip) row.append(skip)
  row.after(...helps)
}

// Skip: the question goes to the end of the round to try again. Skipped a second time,
// or skipped after a miss, it counts as wrong and doesn't come back. Once it's answered,
// Skip just moves on. In learn mode nothing counts, so it just moves on.
function skipButton(q) {
  const b = h('button', 'btn ghost skip-btn', 'Skip')
  b.type = 'button'
  b.title = 'It comes back at the end. Skip it again and it counts as wrong.'
  b.addEventListener('click', () => {
    if (!round || screen !== 'question') return
    if (!round.locked && !round.learn) {
      if (!q.skipped && !q.missed) {
        q.skipped = true
        round.marks[round.at] = 'skip'
        round.queue.push(q)
      } else {
        track(false)
        state.answered++
        round.combo = 0
        if (!q.missed) {
          q.missed = true
          round.misses++
        }
        round.marks[round.at] = 'bad'
        save()
        hud()
      }
    }
    advance()
  })
  return b
}

// "First move": how to start, in plain words, never the answer
function firstMove(p) {
  const wrap = h('div', 'howto')
  const btn = h('button', 'btn ghost', 'Hint')
  btn.type = 'button'
  const body = h('p', 'first-move', p.start)
  body.hidden = true
  btn.addEventListener('click', () => {
    body.hidden = !body.hidden
    btn.textContent = body.hidden ? 'Hint' : 'Hide the hint'
    if (!body.hidden) body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 })
  })
  wrap.append(btn, body)
  return wrap
}
// "How do I do this?": the same kind of question with new numbers, worked and
// played, so the method is shown without giving this one's answer away
function howTo(p, level, peeked) {
  const wrap = h('div', 'howto')
  const btn = h('button', 'btn ghost', 'How do I do this?')
  btn.type = 'button'
  const body = h('div', 'howto-body')
  body.hidden = true
  wrap.append(btn, body)
  btn.addEventListener('click', () => {
    if (!body.hidden) {
      body.hidden = true
      body.replaceChildren()
      btn.textContent = 'How do I do this?'
      return
    }
    let ex = p.another()
    for (let i = 0; i < 8 && ex.latex === p.latex && ex.text === p.text; i++) ex = p.another()
    const same = ex.latex === p.latex && ex.text === p.text
    if (same) peeked()
    body.replaceChildren(h('div', 'eyebrow', same ? 'This one is the same every time · watch it, then do it yourself · counts as a miss, it comes back later' : 'Same kind, new numbers · doesn’t count'))
    if (ex.ask) body.append(h('p', 'ask', ex.ask))
    if (ex.text) body.append(h('p', 'story', ex.text))
    if (ex.latex) body.append(tex(ex.latex))
    const b = ex.build ?? ex.mgf?.build
    if ((ex.buildIt || ex.oneBuild) && b) body.append(mgfPlayer(b, { auto: true }))
    else {
      const box = h('div', 'reveal-box')
      box.append(h('h3', '', 'Answer'))
      if (ex.options) {
        const o = ex.options[CHOICE_LETTERS.indexOf(ex.answer)]
        box.append(typeof o === 'string' ? h('p', '', o) : tex(o.latex))
      } else box.append(tex(T2.answerDisplay(ex)))
      // a section level's story (p.plug) plays World 0's animation, lighting the example's story
      box.append(h('h3', '', 'How it works'), ex.plug ? plugPanel(ex, { auto: true, sheet: body }) : workPanel(ex, { auto: true, level }))
      body.append(box)
    }
    body.hidden = false
    btn.textContent = 'Hide the example'
    body.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  })
  return wrap
}

// the last 12 first tries on each level, for readiness
function track(right) {
  const q = round.queue[round.at]
  if (q.seen !== 1) return
  const r = (state.recent[q.level ?? round.short] ??= [])
  r.push(right ? 1 : 0)
  if (r.length > 12) r.shift()
  save()
}
// the streak, a sound and the progress mark for a right answer
function award() {
  if (round.learn) {
    round.combo++
    sfx.right(round.combo)
    learnAnswered()
    return
  }
  track(true)
  state.answered++
  state.correct++
  round.combo++
  round.best = Math.max(round.best, round.combo)
  round.marks[round.at] = 'ok'
  sfx.right(round.combo)
  hud()
}
// a miss: the streak resets, and the question comes back at the end of the round (up to twice)
function miss(q) {
  if (round.learn) {
    round.combo = 0
    sfx.wrong()
    learnAnswered()
    return
  }
  track(false)
  state.answered++
  round.combo = 0
  if (!q.missed) {
    q.missed = true
    round.misses++
  }
  round.marks[round.at] = 'bad'
  // once per showing (a peek may have sent it back already)
  if (q.seen < 3 && q.requeuedAt !== q.seen) {
    q.requeuedAt = q.seen
    round.queue.push(q)
  }
  sfx.wrong()
  hud()
}
function gotIt(q) {
  const acts = h('div', 'row-actions')
  const cont = h('button', 'btn', round.learn ? 'Next' : q.seen < 3 ? 'Got it · it comes back later' : 'Got it')
  cont.type = 'button'
  cont.addEventListener('click', advance)
  acts.append(cont)
  return { acts, cont }
}

// an option as it is drawn: a name and a formula, a formula, a number (with a real
// minus sign), or words
const optNodes = o =>
  o.name ? [h('b', 'choice-name', o.name), tex(o.tex, false)] : o.tex ? [tex(o.tex, false)] : o.num != null ? [h('span', 'pick-text pick-num', o.text.replace(/^-/, '−'))] : [h('span', 'pick-text', o.text)]
function answer(i, opts, sheet, { sel, check, wrap }) {
  if (round.locked) return
  round.locked = true
  sel.disabled = true
  check.disabled = true
  const q = round.queue[round.at]
  if (opts[i].correct) {
    wrap.classList.add('right')
    award()
    const p = q.p
    if (p.mgf) {
      showBuild(p, sheet)
      return
    }
    if (p.params) {
      showParams(p, sheet)
      return
    }
    // World 0's stories, and the section levels' (p.plug): the numbers fly into the formula
    if ((p.leaf || p.plug) && p.vars) {
      showPlug(p, sheet)
      return
    }
    const level = q.level ?? round.short
    if (!isTree(level) && (p.answerLatex || p.hint)) {
      const next = h('button', 'btn', 'Next')
      next.type = 'button'
      next.addEventListener('click', advance)
      const panel = workPanel(p, { sheet, auto: true, next, level })
      sheet.append(panel)
      next.focus({ preventScroll: true })
      panel.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      return
    }
    setTimeout(advance, 850)
    return
  }
  miss(q)
  wrap.classList.add('wrong')
  const good = opts.findIndex(o => o.correct)
  const why = h('div', 'why')
  why.append(h('h3', '', 'How it works'))
  const said = h('p', 'pick-said')
  said.append('You picked ', ...optNodes(opts[i]), '. The answer is ', ...optNodes(opts[good]), '.')
  why.append(said)
  const p = q.p
  // the commonest slip on a table: the other side (1 − the answer)
  const picked = parseFloat(opts[i].text)
  // (a section level's story names every slip in its own panel)
  if (!p.plug && typeof p.answer === 'number' && p.answer > 0 && p.answer < 1 && Math.abs(picked + p.answer - 1) < 1e-4) {
    why.append(h('p', 'diag', 'Your pick is 1 minus the answer: the area on the other side. A table gives the area to the LEFT (P(Z < z), or P(X ≤ x) for the binomial), so “more than” or “at least” is 1 − that.'))
  }
  // the same worked answer a right one plays: every step, the table, the graph
  const level = q.level ?? round.short
  // a section level's story: World 0's animation, and which slip the pick was
  if (p.plug) why.append(plugPanel(p, { sheet, auto: true, picked: opts[i] }))
  else if (!isWorld0(level) && !p.mgf && !p.params && (p.answerLatex || p.hint)) why.append(workPanel(p, { sheet, auto: true, level }))
  else {
    if (p.hint?.latex) why.append(tex(p.hint.latex))
    if (p.hint?.text) why.append(h('p', '', p.hint.text))
  }
  if (p.clue) sheet.querySelector('.story')?.replaceWith(storyEl({ text: p.text, clue: p.clue }, true))
  if (p.trap) why.append(h('p', 'trap', 'The trap: ' + p.trap))
  if (p.leaf) why.append(leafCard(p.leaf))
  if (p.mgf) why.append(mgfPlayer(p.mgf.build, { at: p.mgf.at, auto: Boolean(p.oneBuild) }))
  if (p.params) why.append(paramCard(p.params, { host: sheet }))
  const { acts, cont } = gotIt(q)
  why.append(acts)
  sheet.append(why)
  cont.focus({ preventScroll: true })
  why.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}

// a button that plays the tree's path to one distribution, right where it is
function walkButton(leaf) {
  const b = h('button', 'btn ghost tw-open', 'Walk the tree to the answer')
  b.type = 'button'
  b.addEventListener('click', () => b.replaceWith(treeWalk({ leaf })))
  return b
}

function showPlug(p, sheet) {
  const next = h('button', 'btn', 'Next')
  next.type = 'button'
  next.addEventListener('click', advance)
  const panel = plugPanel(p, { sheet, auto: true, next })
  sheet.append(panel)
  next.focus({ preventScroll: true })
  panel.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
