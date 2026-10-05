// js/24-plug-panel.js · plug it in, animated: the story's numbers fly into the formula
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- plug it in, animated: the story's numbers fly into the formula ----------
const wait = ms => new Promise(r => setTimeout(r, ms))
// send a copy of a chip's number from the chip to a spot in the formula
function fly(fromEl, toEl, text, cls) {
  const a = fromEl.getBoundingClientRect()
  const b = toEl.getBoundingClientRect()
  const f = h('div', 'flyer ' + cls, text)
  document.body.append(f)
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2
  const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2
  const anim = f.animate(
    [
      { transform: `translate(${x0}px, ${y0}px) translate(-50%, -50%) scale(1.15)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 40}px) translate(-50%, -50%) scale(1.25)`, offset: 0.45 },
      { transform: `translate(${x1}px, ${y1}px) translate(-50%, -50%) scale(0.8)`, opacity: 0.4 },
    ],
    { duration: 560, easing: 'cubic-bezier(.45,0,.3,1)', fill: 'forwards' },
  )
  // a busy or backgrounded tab can stall an animation: never wait on it for long
  return Promise.race([anim.finished.catch(() => {}), wait(800)]).then(() => f.remove())
}
// the story with one phrase lit up in a number's colour
function storyMark(text, phrase, cls) {
  const p = h('p', 'story')
  const at = phrase ? text.indexOf(phrase) : -1
  if (at < 0) p.textContent = text
  else p.append(document.createTextNode(text.slice(0, at)), h('mark', 'pvmark ' + cls, phrase), document.createTextNode(text.slice(at + phrase.length)))
  return p
}
// the panel: chips for the story's numbers, the formula lines, and a replay.
// auto: play straight away (a right answer); otherwise it starts filled in
function plugPanel(p, { sheet = null, auto = false, next = null } = {}) {
  const vars = p.vars
  // a number the story only implies gets its own line of work, just before it is used
  const val = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v.val]))
  const T = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v.tex]))
  const TXT = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v.txt]))
  const lines = []
  for (const line of PLUG[p.leaf]) {
    if (line.when && !line.when(val)) continue
    for (const k of line.order) if (vars[k]?.work && !lines.some(l => l.key === k)) lines.push({ ...vars[k].work, key: k })
    lines.push(line)
    // the pieces on the side, then the rows that finish the formula with them
    if (line.pieces) lines.push(...line.pieces(val, T).filter(Boolean))
    if (line.finish) lines.push({ order: [], ...line.finish(val, T) })
    if (line.look) lines.push({ order: [], lookAt: line.look(val) })
  }
  const keys = [...new Set(lines.flatMap(l => l.order))]
  const color = Object.fromEntries(keys.map((k, i) => [k, 'pv' + (i % 5)]))
  const el = h('div', 'plug')
  const L = LEAVES[p.leaf]
  el.append(h('h3', '', `${L.name} · plug it in`))
  if (p.trap) el.append(h('p', 'plug-sub trap', 'The trap: ' + p.trap))
  el.append(h('p', 'plug-sub', 'Every number in the story has a spot in the formula. Numbers the story only hints at get worked out first, and so does every piece inside it.'))
  const chips = h('div', 'plug-chips')
  const box = h('div')
  el.append(chips, box)
  const acts = h('div', 'row-actions')
  const replay = h('button', 'btn ghost', 'Replay')
  replay.type = 'button'
  acts.append(replay)
  if (next) acts.append(next)
  el.append(acts)

  const stepsOf = line => (line.steps ? line.steps(val, T) : [])
  // the formula, then n rows of work under it, lined up on the = sign
  const lineTex = (line, done, n) => {
    const s = (k, mode = 0) => {
      let body = SYM[k]
      if (done.has(k)) {
        const t = vars[k].tex
        body = mode === 2 || (mode === 1 && !/^\d+$/.test(t)) ? `\\left(${t}\\right)` : `{${t}}`
      }
      return color[k] ? `\\class{${color[k]}}{${body}}` : body
    }
    const all = stepsOf(line)
    const cls = j => (j === all.length - 1 && !line.plain ? 'pvres' : 'pvstep')
    // the answer is boxed: the last row of a line that is not work on the side or a step on the way
    const mid = typeof line.mid === 'function' ? line.mid(val) : line.mid
    const answer = line.answer || (!line.key && !line.label && !line.plain && !mid && !line.pieces && !line.finish && !line.lookAt)
    const boxed = st => {
      const m = /^(=|\\approx)\s*([\s\S]*)$/.exec(st)
      return m ? `${m[1]} \\boxed{${m[2]}}` : `\\boxed{${st}}`
    }
    // a row with its own left side (calculator rows) keeps it outside the colour
    const row = (st, j) => {
      if (answer && j === all.length - 1 && !st.includes('&')) st = boxed(st)
      const at = st.indexOf('&')
      return at < 0 ? `&\\class{${cls(j)}}{{}${st}}` : `${st.slice(0, at)}&\\class{${cls(j)}}{{}${st.slice(at + 1)}}`
    }
    let rows
    if (line.lhs) {
      // finishing rows: one left side, the first row there from the start
      rows = all.slice(0, Math.max(1, n)).map((st, j) => (j ? '' : line.lhs + ' ') + row(st, j))
    } else {
      rows = [line.tex(s, val).replace(/ (=|\\approx) /, ' &$1 ')]
      all.slice(0, n).forEach((st, j) => rows.push(row(st, j)))
    }
    if (n >= all.length && done.size === line.order.length && line.tail) rows[rows.length - 1] += ' ' + line.tail(val)
    return `\\begin{aligned}${rows.join(' \\\\[2pt] ')}\\end{aligned}`
  }
  const chipFor = k => {
    let c = chips.querySelector(`[data-k="${k}"]`)
    if (c) return c
    const v = vars[k]
    c = h('span', 'plug-chip ' + color[k], `${CHIP_SYM[k] ?? k} = ${v.txt}`)
    c.dataset.k = k
    const why = v.from ? `“${v.from}”${v.note ? ' · ' + v.note : ''}` : v.note
    if (why) c.append(h('small', '', why))
    chips.append(c)
    return c
  }
  const story = () => sheet?.querySelector('.story')
  const lightStory = (phrase, cls) => story()?.replaceWith(storyMark(p.text, phrase, cls))

  function showFinal() {
    box.replaceChildren()
    if (p.read) box.append(readBlock(p, color).el)
    for (const line of lines) {
      if (line.lookAt) {
        const tl = tableLook(line.lookAt)
        if (tl) {
          box.append(tl.el)
          tl.final()
        }
        continue
      }
      line.order.forEach(chipFor)
      if (line.key) chipFor(line.key)
      if (line.label) box.append(h('div', 'piece-label', line.label))
      const d = h('div', 'plug-line' + (line.key || line.label ? ' work' : ''))
      d.append(tex(lineTex(line, new Set(line.order), Infinity)))
      box.append(d)
    }
    const gr = distGraph(p.leaf, val, TXT)
    if (gr) box.append(gr.el)
    if (sheet && p.clue) story()?.replaceWith(storyEl({ text: p.text, clue: p.clue }, true))
  }
  let run = 0
  async function play() {
    const me = ++run
    const alive = () => me === run && el.isConnected
    chips.replaceChildren()
    box.replaceChildren()
    // a question that gives a pdf or an MGF: read its numbers first
    if (p.read) {
      const rb = readBlock(p, color)
      box.append(rb.el)
      await rb.play(alive)
      if (!alive()) return
    }
    for (const line of lines) {
      if (line.lookAt) {
        const tl = tableLook(line.lookAt)
        if (!tl) continue
        box.append(tl.el)
        await tl.play(alive)
        if (!alive()) return
        continue
      }
      const done = new Set()
      // finishing rows show their first row straight away
      const first = line.lhs ? 1 : 0
      let n = first
      if (line.label) box.append(h('div', 'piece-label', line.label))
      const d = h('div', 'plug-line enter' + (line.key || line.label ? ' work' : ''))
      const draw = () => d.replaceChildren(tex(lineTex(line, done, n)))
      // a line of work starts at the words it comes from
      if (line.key && vars[line.key].from) lightStory(vars[line.key].from, color[line.key])
      draw()
      box.append(d)
      await wait(450)
      for (const k of line.order) {
        if (!alive()) return
        const v = vars[k]
        if (v.from) lightStory(v.from, color[k])
        const chip = chipFor(k)
        chip.animate([{ transform: 'scale(1.15)' }, { transform: 'none' }], { duration: 300 })
        await wait(420)
        if (!alive()) return
        const spots = [...d.querySelectorAll(`svg g.${color[k]}`)]
        await Promise.all(spots.map((g, i) => wait(i * 90).then(() => alive() && fly(chip, g, v.txt, color[k]))))
        if (!alive()) return
        done.add(k)
        draw()
        d.querySelectorAll(`svg g.${color[k]}`).forEach(g => g.classList.add('glow'))
        tone(semis(523.25, 4 + done.size * 2), 0, 0.09, 'sine', 0.08)
        await wait(260)
      }
      // the work, one row at a time; the last row is the answer
      const steps = stepsOf(line)
      for (let j = first; j <= steps.length; j++) {
        if (j === steps.length && !line.tail) break
        await wait(j > first ? 650 : 350)
        if (!alive()) return
        n = j + 1
        draw()
        const rows = d.querySelectorAll('svg g.pvstep, svg g.pvres')
        rows[rows.length - 1]?.classList.add('glow')
        if (j < steps.length) tone(semis(523.25, 9 + j * 2), 0, 0.1, 'sine', 0.07)
      }
      if (steps.length) {
        d.classList.remove('enter')
        void d.offsetWidth
        d.classList.add('bump')
        if (!line.key && !line.label) sfx.right(2)
      }
      // a worked-out number becomes a chip, ready to plug in
      if (line.key) chipFor(line.key).animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 350 })
      await wait(550)
    }
    // last, the picture: the distribution with these numbers, and the part asked about
    const gr = alive() && distGraph(p.leaf, val, TXT)
    if (gr) {
      box.append(gr.el)
      gr.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      await gr.play(alive)
    }
    if (alive() && sheet && p.clue) story()?.replaceWith(storyEl({ text: p.text, clue: p.clue }, true))
  }
  replay.addEventListener('click', () => {
    if (reduced()) showFinal()
    else play()
  })
  if (auto && !reduced()) setTimeout(play, 0)
  else showFinal()
  return el
}
