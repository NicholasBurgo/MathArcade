// js/16-written-answers.js · written answers: paper mode and the boss
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- written answers: paper mode and the boss ----------
const typeable = p => (p.slice ? p.check.type === 'number' : (!p.options || p.accept) && !p.buildIt)
// the right answer and how to get it
function solution(p) {
  if (p.slice) return sliceSolution(p)
  if (p.buildIt) {
    const box = h('div', 'reveal-box')
    box.append(h('h3', '', 'Answer'), mgfPlayer(p.build ?? p.mgf.build))
    return box
  }
  if (p.leaf) {
    const box = h('div', 'reveal-box')
    box.append(h('h3', '', 'Answer'), leafCard(p.leaf))
    if (p.alsoRight?.length && ALSO_NOTE[p.leaf]) box.append(h('p', 'also-right', ALSO_NOTE[p.leaf].replace(/^Right: /, 'Also right: ')))
    if (p.mgfParams) {
      const pr = h('p', 'pick-said')
      pr.append('Its parameters: ', tex(p.mgfParams.right, false))
      box.append(pr)
    }
    box.append(h('h3', '', 'How the tree gets there'), h('p', '', p.hint.text), walkButton(p.leaf))
    if (p.vars) box.append(plugPanel(p))
    return box
  }
  const box = h('div', 'reveal-box')
  box.append(h('h3', '', 'Answer'))
  if (p.options) {
    const o = p.options['abcdefgh'.indexOf(p.answer)]
    box.append(typeof o === 'string' ? h('p', '', o) : tex(o.latex))
  } else box.append(tex(T2.answerDisplay(p)))
  if (!p.mgf && !p.params && p.answerLatex) {
    box.append(h('h3', '', 'How it works'), workPanel(p, { auto: false }))
  } else if (p.hint?.latex || p.hint?.text) {
    box.append(h('h3', '', 'How it works'))
    if (p.hint.latex) box.append(tex(p.hint.latex))
    if (p.hint.text) box.append(h('p', '', p.hint.text))
  }
  if (p.mgf) box.append(mgfPlayer(p.mgf.build, { at: p.mgf.at }))
  if (p.params) box.append(paramCard(p.params))
  return box
}
// a typed answer (formulas preview as you type), or a note to answer on paper
// when the question only makes sense with its options
function answerBox(p, onEnter) {
  const wrap = h('div', 'written')
  if (!typeable(p)) {
    wrap.append(h('p', 'paper-note', 'Write your answer on paper (the real test has no choices), then check it.'))
    return { el: wrap, input: null, value: () => '' }
  }
  const id = 'answer-' + Math.random().toString(36).slice(2, 8)
  const label = h('label', '', 'Your final answer (work it on paper first)')
  label.htmlFor = id
  const input = h('input', 'answer-input')
  input.id = id
  input.autocomplete = 'off'
  input.setAttribute('autocapitalize', 'none')
  input.spellcheck = false
  input.placeholder = p.placeholder ?? 'answer'
  input.enterKeyHint = 'go'
  wrap.append(label, input)
  if (p.expr) {
    const letters = p.expr.vars.join(', ')
    const hintText = letters ? `a formula in ${letters}: use ^ for powers, e^(...), C(n,k)` : 'a number: fractions like 1/9 work, and ^, e^(...), C(n,k)'
    const preview = h('div', 'preview')
    let timer
    input.addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const raw = input.value.trim()
        const l = raw ? T2.toLatex(raw, p.expr.vars) : null
        preview.replaceChildren(l ? tex(l, false) : document.createTextNode(raw ? `that doesn't read as ${letters ? 'a formula in ' + letters : 'a number'} yet` : hintText))
      }, 200)
    })
    preview.textContent = hintText
    wrap.append(preview)
  }
  if (!p.expr && typeof p.answer === 'string' && p.choices?.length) {
    wrap.append(h('p', 'paper-note', 'Answer with one of: ' + [p.answer, ...p.choices].sort().join(', ')))
  }
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEnter?.()
    }
  })
  return { el: wrap, input, value: () => input.value.trim() }
}

function paperQuestion(p, sheet) {
  const q = round.queue[round.at]
  const acts = h('div', 'row-actions')
  const box = answerBox(p, () => check.click())
  const check = h('button', 'btn', 'Check')
  check.type = 'button'
  const show = h('button', 'btn ghost', typeable(p) ? 'Show answer' : 'Check my answer')
  show.type = 'button'
  const settle = (right, revealed) => {
    if (round.locked) return
    round.locked = true
    acts.remove()
    if (box.input) box.input.disabled = true
    if (right) {
      sheet.append(h('div', 'verdict ok', revealed ? 'Counted. Nice.' : 'Correct!'))
      award()
      setTimeout(advance, revealed ? 600 : 1100)
      return
    }
    miss(q)
    sheet.append(h('div', 'verdict bad', revealed ? 'No problem: that is what practice is for.' : 'Not quite.'))
    if (!revealed) sheet.append(solution(p))
    const { acts: next, cont } = gotIt(q)
    sheet.append(next)
    cont.focus({ preventScroll: true })
    next.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  }
  check.addEventListener('click', () => {
    const raw = box.value()
    if (!raw) return box.input?.focus()
    settle(checkTyped(raw, p), false)
  })
  show.addEventListener('click', () => {
    // look at the answer, then be honest about it
    acts.replaceChildren()
    sheet.insertBefore(solution(p), acts)
    const yes = h('button', 'btn', 'I had it')
    yes.type = 'button'
    yes.addEventListener('click', () => settle(true, true))
    const no = h('button', 'btn ghost', "I didn't")
    no.type = 'button'
    no.addEventListener('click', () => settle(false, true))
    acts.append(yes, no)
  })
  if (typeable(p)) acts.append(check)
  acts.append(show)
  sheet.append(box.el, acts)
  view.append(sheet)
  window.scrollTo({ top: 0 })
  box.input?.focus({ preventScroll: true })
}

function advance() {
  if (!round || screen !== 'question') return
  round.locked = false
  round.at++
  if (round.learn && round.at >= round.queue.length) round.queue.push(learnQ(round.short))
  if (round.at >= round.queue.length) finish()
  else showQuestion()
}

function finish() {
  screen = 'results'
  const r = round
  const stars = r.misses === 0 ? 3 : r.misses <= 2 ? 2 : 1
  const prev = state.stars[r.short] || 0
  state.stars[r.short] = Math.max(prev, stars)
  state.plays[r.short] = (state.plays[r.short] || 0) + 1
  save()
  hud()

  view.replaceChildren()
  const sheet = h('section', 'sheet')
  sheet.append(h('div', 'eyebrow', r.paper ? 'Level cleared · paper mode' : 'Level cleared'))
  sheet.append(h('h2', '', r.short))
  const st = h('div', 'result-stars')
  for (let i = 0; i < 3; i++) {
    const s = h('span', i < stars ? '' : 'off', '★')
    s.style.animationDelay = i * 0.25 + 's'
    st.append(s)
  }
  sheet.append(st)
  const tally = h('div', 'tally')
  const cell = (label, value) => {
    const c = h('div')
    c.append(h('b', '', value), document.createTextNode(label))
    return c
  }
  tally.append(cell('best streak', String(r.best)), cell('first-try misses', String(r.misses)))
  sheet.append(tally)
  const msg = stars === 3 ? 'Clean sheet. Every answer right the first time.' : stars === 2 ? 'Good run. One with no misses gets the third star.' : 'Cleared. Run it again: the questions change every time.'
  sheet.append(h('p', 'note', msg + (stars > prev && prev ? ' New best!' : '')))
  const acts = h('div', 'row-actions')
  const i = ORDER.indexOf(r.short)
  const nextShort = ORDER[(i + 1) % ORDER.length]
  const again = h('button', stars < 3 ? 'btn' : 'btn ghost', 'Run it again')
  again.type = 'button'
  again.addEventListener('click', () => startRound(r.short))
  const nxt = h('button', stars < 3 ? 'btn ghost' : 'btn', 'Next level')
  nxt.type = 'button'
  nxt.addEventListener('click', () => openCard(nextShort))
  const map = h('button', 'btn ghost', 'Home')
  map.type = 'button'
  map.addEventListener('click', renderMap)
  acts.append(again, nxt, map)
  sheet.append(acts)
  view.append(sheet)
  window.scrollTo({ top: 0 })
  setTimeout(() => {
    sfx.clear()
    burst(stars === 3 ? 160 : 90)
  }, 150)
  round = null
}
