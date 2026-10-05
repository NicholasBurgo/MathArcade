// js/31-work-panel.js · show the work: World 1's worked answers, step by step
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- show the work: World 1's worked answers, step by step ----------
// The class app's worked answer (answerLatex) is split into rows and steps, and
// every number in it that comes from the question flies in from a chip.
const matchBrace = (src, open) => {
  let d = 0
  for (let i = open; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue }
    if (src[i] === '{') d++
    else if (src[i] === '}' && --d === 0) return i
  }
  return src.length - 1
}
// the numbers in a piece of text or LaTeX, signed; words in \text{…} are skipped
// unless keepText (a number there can be read, but not coloured)
function numberTokens(src, latex, keepText = false) {
  const out = []
  let i = 0
  while (i < src.length) {
    if (latex && src[i] === '\\') {
      const m = /^\\([a-zA-Z]+)/.exec(src.slice(i))
      if (!m) { i += 2; continue }
      if (/^(text|textbf|textit|mathrm|operatorname)$/.test(m[1]) && src[i + m[0].length] === '{') {
        const open = i + m[0].length
        const close = matchBrace(src, open)
        // words: skipped, or read as plain text (their minus signs follow text rules)
        if (keepText) for (const t of numberTokens(src.slice(open + 1, close), false)) out.push({ ...t, start: t.start + open + 1, end: t.end + open + 1 })
        i = close + 1
      } else i += m[0].length
      continue
    }
    const m = /^\d+(?:\{,\}\d{3})*(?:\.\d+)?/.exec(src.slice(i))
    if (m && !/[\d.]/.test(src[i - 1] ?? '')) {
      let val = parseFloat(m[0].replace(/\{,\}/g, ''))
      let start = i
      let j = i - 1
      while (j >= 0 && src[j] === ' ') j--
      if (j >= 0 && (src[j] === '-' || src[j] === '−')) {
        const before = src.slice(0, j).trimEnd()
        // a minus after a number or a bracket is a subtraction; anywhere else it is a sign
        const afterWords = latex && /\}$/.test(before) && /\\(text|textbf|textit|mathrm|operatorname)\{[^{}]*\}$/.test(before)
        const binary = latex
          ? /[\d)}\]a-zA-Z]$/.test(before) && !afterWords && !/\\(le|ge|leq|geq|approx|to|Rightarrow|cdot|times|quad|qquad|pm|lt|gt)$/.test(before)
          : /[\d)]$/.test(before)
        if (!binary) {
          val = -val
          start = j
        }
      }
      out.push({ start, end: i + m[0].length, val, tok: src.slice(start, i + m[0].length) })
      i += m[0].length
      continue
    }
    i++
  }
  return out
}
// 0, 1 and 2 turn up everywhere (1 − p, 2σ²…): never claim those came from the question
const linkable = v => !(Number.isInteger(v) && Math.abs(v) <= 2)
// split LaTeX at its top level (outside braces and \left…\right) where sepAt(i) says so
function splitTop(src, sepAt) {
  const parts = []
  let d = 0, from = 0
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(src.slice(i))
      if (m[1] === 'left' || m[1] === 'begin') d++
      else if (m[1] === 'right' || m[1] === 'end') d--
      else if (d === 0 && i > from) {
        const n = sepAt(src, i)
        if (n) {
          parts.push(src.slice(from, i))
          from = i
          i += n - 1
          continue
        }
      }
      i += m[0].length - 1
      continue
    }
    if (c === '{' || c === '(') d++
    else if (c === '}' || c === ')') d--
    else if (d === 0 && i > from) {
      const n = sepAt(src, i)
      if (n) {
        parts.push(src.slice(from, i))
        from = i
        i += n - 1
      }
    }
  }
  parts.push(src.slice(from))
  return parts
}
const trimSpace = t => t.replace(/^(?:\s|\\[;,!: ]|\\quad|\\qquad)+|(?:\s|\\[;,!: ]|\\quad|\\qquad)+$/g, '')
// rows: a new row at a colon, a ⇒, a \quad; the colon itself is dropped
function workRows(latex) {
  // an aligned or gathered block: each of its lines is worked on its own
  const env = /^\s*\\begin\{(aligned|gathered)\}([\s\S]*)\\end\{\1\}\s*$/.exec(latex)
  if (env) {
    return splitTop(env[2], (src, i) => (/^\\\\(?:\[[^\]]*\])?/.exec(src.slice(i)) ?? [''])[0].length)
      .map(l => l.replace(/^\\\\(?:\[[^\]]*\])?/, '').replace(/\\begin\{(\w+)\}[\s\S]*?\\end\{\1\}|&/g, m => (m === '&' ? '' : m)))
      .flatMap(workRows)
  }
  const rows = splitTop(latex, (src, i) => {
    if (src[i] === ':') return 1
    // (a pdf's "0 otherwise" stays on its line)
    const m = /^(?:\;)?\\Rightarrow(?:\;)?|^\\quad(?!\s*0\s*\\text\{\s*otherwise)/.exec(src.slice(i))
    return m ? m[0].length : 0
  })
  return rows
    // (a row split off before \quad keeps no trailing comma)
    .map(r => trimSpace(r.replace(/^:/, '').replace(/^\\quad/, '')).replace(/(?:\s|\\[;,!])*,(?:\s|\\[;,!])*$/, ''))
    .filter(Boolean)
    .map(r => splitTop(r, (src, i) => (src[i] === '=' ? 1 : (/^\\approx(?![a-zA-Z])|^\\to(?![a-zA-Z])/.exec(src.slice(i)) ?? [''])[0].length)))
}
// a few words of the question around the number at q (its own spot, not a search)
function around(text, q) {
  const tok = text.slice(q.start, q.end)
  const leftClause = text.slice(0, q.start).split(/[.;?!]\s|, | and | with /).pop()
  const rightClause = text.slice(q.end).split(/[.;?!,]| and | with /)[0]
  let left = (leftClause.match(/(?:\S+\s+){0,3}$/) ?? [''])[0]
  let right = (rightClause.match(/^\S*(?:\s+\S+){0,4}/) ?? [''])[0]
  // never stop on a little word ("… of them are")
  while (/\s(?:the|a|an|of|to|in|on|at|is|are|was|were|who|that|them|and|or|with|by|for|from|did)$/i.test(right)) right = right.replace(/\s+\S+$/, '')
  // a bare number ("an IQ score of 93?"): reach back past the clause break
  if (!left.trim() && !right.trim()) left = (text.slice(0, q.start).match(/(?:\S+\s+){0,4}$/) ?? [''])[0]
  return (left + tok + right).trim()
}

// the worked answer, unless it is only the letter of a lettered option
const workOf = p => (p.options && /^\s*(?:\\text\{)?\(?[a-h]\)?\}?\s*$/.test(p.answerLatex ?? '') ? null : p.answerLatex ?? null)
// the table cells a worked answer reads, found by checking the class's own table
// against the numbers in the work (so a cell is only shown if it really is the one)
function findLookups(p, level) {
  const work = workOf(p)
  if (!work) return []
  tables ??= printedTables()
  const toks = src => numberTokens(src ?? '', true, true)
  const workToks = toks(work).map(t => t.tok.replace('−', '-'))
  const inWork = str => workToks.includes(str) || workToks.includes('-' + str)
  const out = []
  const add = spec => {
    if (out.length < 2 && !out.some(o => o.name === spec.name && o.row === spec.row && o.col === spec.col)) out.push(spec)
  }
  if (level === 'Normal table' || level === 'Normal word problems') {
    // read backwards: "the closest entry to A is E" / "A is the entry at z"
    const back = [...work.matchAll(/closest entry to \}\s*(-?[\d.]+)\s*\\text\{ is \}\s*(-?[\d.]+)/g)].map(m => ({ target: m[1], entry: m[2] }))
    for (const m of work.matchAll(/(-?[\d.]+)\s*\\text\{ is the entry at \}/g)) back.push({ target: m[1], entry: (+m[1]).toFixed(4) })
    // "left area A: z = …": the entry closest to A
    // ("P(X < x) = 0.025, a left area": the share itself is the left area)
    const areas = [...work.matchAll(/left area \}\s*(\d*\.?\d+)|(\d*\.?\d+),?\s*\\text\{ a left area\}/g)].map(m => m[1] ?? m[2])
    // a z: two decimals, or anything written as "z = …"; never a row or column label
    const isZ = (src, t) => !/\\text\{(?:row|column) \}\s*$/.test(src.slice(0, t.start)) &&
      (/^-?\d\.\d\d$/.test(t.tok.replace('−', '-')) || /z(?:_\{?[\w.]*\}?)? = $/.test(src.slice(0, t.start)))
    const zs = [...toks(work).filter(t => isZ(work, t)), ...toks(p.latex ?? '').filter(t => isZ(p.latex ?? '', t))].filter(t => Math.abs(t.val) < 4)
    for (const t of zs) {
      const cell = zCell(t.val)
      const entry = cellOf('normal', cell.row, cell.col)
      if (!entry) continue
      const b = back.find(x => x.entry === entry)
      const area = areas.find(A => closestZ(+A).includes(Math.round(t.val * 100)))
      if (b) add({ name: 'normal', ...cell, target: b.target })
      else if (area != null) {
        const two = closestZ(+area)
        add({ name: 'normal', ...cell, target: area, halfway: two.length === 2 ? two.map(z => z / 100).sort((a, b) => a - b) : null })
      }
      else if (inWork(entry)) add({ name: 'normal', ...cell })
    }
  } else if (level === 'Binomial table') {
    const n = /n = (19|20) table/.exec(p.hint?.text ?? '')?.[1]
    const col = /column p = (\d*\.?\d+)/.exec(p.hint?.text ?? '')?.[1]
    if (n && col) {
      const name = n === '19' ? 'binomial19' : 'binomial'
      for (const m of work.matchAll(/F\((\d+)\)/g)) {
        const entry = cellOf(name, m[1], col)
        if (entry && inWork(entry)) add({ name, row: m[1], col })
      }
    }
  } else if (level === 'Chi-squared table') {
    const g = /γ = (\d+)/.exec(p.text ?? '')?.[1] ?? [...work.matchAll(/\\gamma = (\d+)/g)].at(-1)?.[1]
    const t = tables.chi2
    const r = g && t.rows[+g - 1]
    if (r) {
      const qToks = toks(p.latex).map(x => x.tok)
      r.values.forEach((v, j) => {
        if (inWork(v) || qToks.includes(v)) add({ name: 'chi2', row: g, col: t.cols[j], target: qToks.includes(v) ? v : null })
      })
    }
  }
  return out
}

// Which numbers in the work came from the question. A number is linked only when its
// exact spelling ("0.5000" is not "0.5") appears once in the question and once in the
// work, outside results ("= 0.75") and the answer, and outside \max(…) (whose inputs
// are worked out). Anything less certain stays unlinked: a link must never mislead.
function linkWork(p, rows, level) {
  const lastRow = rows.length - 1
  // the answer: the last step of the last row (the whole work, when it is just the answer;
  // the whole row, when it carries on an equation or says the answer in words)
  const isAnswer = (r, j) => r === lastRow && j === rows[r].length - 1 && (rows[r].length > 1 || rows.length === 1 || /^\s*(=|\\approx)/.test(rows[r][0]) || (typeof p.answer === 'string' && rows[r][0].includes(p.answer)))
  // The table levels' questions are stories and tables, where each given number has one role.
  // Elsewhere a formula question's numbers turn up again in computed results by
  // chance, so only story questions link, and never through an exponent (worked out).
  const world1 = typeof level !== 'string' || TABLE_LEVELS.has(level)
  if (!world1 && !p.text) return { used: [], links: [], isAnswer }
  const spell = t => t.tok.replace('−', '-')
  const colourable = new Set(numberTokens(p.latex ?? '', true).map(t => t.start))
  const q = [
    ...numberTokens(p.text ?? '', false).map(t => ({ ...t, inText: true })),
    ...numberTokens(p.latex ?? '', true, true).map(t => ({ ...t, inText: false, colourable: colourable.has(t.start) })),
  ].filter(t => linkable(t.val))
  const cands = []
  rows.forEach((row, r) => row.forEach((c, j) => {
    if (isAnswer(r, j) || /^\s*(=|\\approx)\s*-?[\d.]+(\\ldots)?\s*[,:]?\s*$/.test(c)) return
    // the step after a \max(…) holds its results, not the question's numbers
    if (j > 0 && /\\max\(/.test(row[j - 1])) return
    // "= 150, …": the 150 is a result, whatever follows it
    const lead = /^\s*(=|\\approx)\s*-?[\d.]+\s*[,:]/.exec(c)?.[0].length ?? 0
    const skip = []
    for (const m of c.matchAll(/\\max\(/g)) {
      let d = 0, k = m.index + 4
      for (; k < c.length; k++) {
        if (c[k] === '(') d++
        else if (c[k] === ')' && --d === 0) break
      }
      skip.push([m.index, k])
    }
    for (const t of numberTokens(c, true)) {
      if (!linkable(t.val) || t.start < lead || skip.some(([a, b]) => t.start >= a && t.start <= b)) continue
      if (!world1 && /\^\{?\s*$/.test(c.slice(0, t.start))) continue
      // a column label is an area or a digit of z, not a number from the question
      // (a row label can be: the χ² table's row is the story's γ)
      if (/\\text\{column \}\s*$/.test(c.slice(0, t.start))) continue
      cands.push({ r, j, ...t })
    }
  }))
  const used = [], links = []
  for (const t of cands) {
    const sp = spell(t)
    const inQ = q.filter(x => spell(x) === sp)
    // once in the story and once more in the formula is the same number said twice
    const inStory = inQ.filter(x => x.inText)
    const once = inQ.length === 1 || (level === 'Normal word problems' && inQ.length === 2 && inStory.length === 1)
    if (!once || cands.filter(x => spell(x) === sp).length !== 1) continue
    const src = inStory[0] ?? inQ[0]
    if (used.length >= 5) continue
    const u = { src, tok: sp, val: t.val, cls: 'pv' + used.length, where: src.inText ? around(p.text, src) : null }
    used.push(u)
    links.push({ r: t.r, j: t.j, start: t.start, end: t.end, u })
  }
  return { used, links, isAnswer }
}

function workPanel(p, { sheet = null, auto = false, next = null, level = null } = {}) {
  // a lettered option's letter is no work, just the reason
  const work = workOf(p)
  const el = h('div', 'plug')
  el.append(h('h3', '', work ? 'Show the work' : 'Why'))
  const rule = h('div', 'plug-line work-rule')
  if (p.hint?.latex) rule.append(tex(p.hint.latex))
  const chips = h('div', 'plug-chips')
  const box = h('div', 'work-rows')
  const why = p.hint?.text ? h('p', 'plug-sub work-why', p.hint.text) : null
  el.append(rule, chips, box)
  const looks = findLookups(p, level)
  const lookBox = h('div')
  el.append(lookBox)
  // the distribution, when the question pins one down
  const graphSpec = inferGraph(p, level)
  const graphBox = h('div')
  el.append(graphBox)
  if (why) el.append(why)
  const acts = h('div', 'row-actions')
  const replay = h('button', 'btn ghost', 'Replay')
  replay.type = 'button'
  acts.append(replay)
  if (next) acts.append(next)
  el.append(acts)

  // the question's numbers, and which of them the work uses (a colour each)
  const rows = work ? workRows(work) : []
  const lastRow = rows.length - 1
  // a plain-words reason for each row, when the question has one per row
  const says = Array.isArray(p.steps) && p.steps.length === rows.length ? p.steps : null
  if (says && why) why.remove()
  const say = i => h('p', 'work-say', says[i])
  const { used, links, isAnswer } = linkWork(p, rows, level)
  // colour only the linked spots, by position
  const wrapChunk = (r, j, c) => {
    let out = c
    for (const l of links.filter(l => l.r === r && l.j === j).sort((a, b) => b.start - a.start)) out = out.slice(0, l.start) + `{\\class{${l.u.cls}}{${out.slice(l.start, l.end)}}}` + out.slice(l.end)
    return out
  }
  // the answer is boxed, as in World 0
  const boxed = c => {
    const m = /^\s*(=|\\approx)\s*([\s\S]*)$/.exec(c)
    return m ? `${m[1]} \\boxed{${m[2]}}` : `\\boxed{${c}}`
  }
  const rowTex = (r, n) =>
    rows[r].slice(0, n).map((c, j) => (isAnswer(r, j) ? `\\class{pvres}{{}${boxed(c)}}` : wrapChunk(r, j, c))).join('')
  // the question itself, with the numbers lit up in their colours
  const story = () => sheet?.querySelector('.story')
  const qMath = () => sheet?.querySelector('.q-math')
  function lightQuestion() {
    if (!sheet || !used.length) return
    if (p.text && story()) {
      const para = h('p', 'story')
      let at = 0
      for (const u of used.filter(u => u.src.inText).sort((a, b) => a.src.start - b.src.start)) {
        para.append(document.createTextNode(p.text.slice(at, u.src.start)), h('mark', 'pvmark ' + u.cls, p.text.slice(u.src.start, u.src.end)))
        at = u.src.end
      }
      para.append(document.createTextNode(p.text.slice(at)))
      story().replaceWith(para)
    }
    const inMath = used.filter(u => !u.src.inText && u.src.colourable)
    if (p.latex && qMath() && inMath.length) {
      let l = p.latex
      for (const u of inMath.sort((a, b) => b.src.start - a.src.start)) l = l.slice(0, u.src.start) + `{\\class{${u.cls}}{${l.slice(u.src.start, u.src.end)}}}` + l.slice(u.src.end)
      const m = tex(l)
      m.classList.add('q-math')
      qMath().replaceWith(m)
    }
  }
  const chipFor = u => {
    let c = chips.querySelector(`[data-v="${u.val}"]`)
    if (c) return c
    c = h('span', 'plug-chip ' + u.cls, u.tok)
    c.dataset.v = String(u.val)
    c.append(h('small', '', u.where ? `“${u.where}”` : 'in the question'))
    chips.append(c)
    return c
  }

  function showFinal() {
    if (why) why.hidden = false
    used.forEach(chipFor)
    box.replaceChildren(...rows.flatMap((r, i) => {
      const d = h('div', 'plug-line')
      d.append(tex(rowTex(i, r.length)))
      return says ? [d, say(i)] : [d]
    }))
    lookBox.replaceChildren()
    for (const spec of looks) {
      const tl = tableLook(spec)
      if (tl) {
        lookBox.append(tl.el)
        tl.final()
      }
    }
    graphBox.replaceChildren()
    const gr = drawGraph(graphSpec)
    if (gr) graphBox.append(gr.el)
    lightQuestion()
  }
  let run = 0
  async function play() {
    const me = ++run
    const alive = () => me === run && el.isConnected
    chips.replaceChildren()
    box.replaceChildren()
    lookBox.replaceChildren()
    graphBox.replaceChildren()
    // the reason comes last, under the finished work
    if (why && rows.length) why.hidden = true
    rule.classList.remove('enter')
    void rule.offsetWidth
    rule.classList.add('enter')
    lightQuestion()
    await wait(500)
    for (const u of used) {
      if (!alive()) return
      chipFor(u)
      tone(semis(523.25, 2), 0, 0.06, 'sine', 0.05)
      await wait(300)
    }
    for (let r = 0; r < rows.length; r++) {
      const d = h('div', 'plug-line enter')
      box.append(d)
      const seen = {}
      for (let n = 1; n <= rows[r].length; n++) {
        if (!alive()) return
        d.replaceChildren(tex(rowTex(r, n)))
        // the numbers new in this step start hidden, then fly in from their chips
        const landing = []
        for (const u of used) {
          const spots = [...d.querySelectorAll(`svg g.${u.cls}`)]
          spots.slice(seen[u.cls] ?? 0).forEach(g => {
            g.style.opacity = '0'
            landing.push({ g, u })
          })
          seen[u.cls] = spots.length
        }
        await Promise.all(landing.map(({ g, u }, i) => wait(i * 90).then(() => alive() && fly(chipFor(u), g, u.tok, u.cls)).then(() => {
          g.style.opacity = ''
          g.classList.add('glow')
        })))
        if (!alive()) return
        const last = r === lastRow && n === rows[r].length
        if (last) {
          d.querySelector('svg g.pvres')?.classList.add('glow')
          d.classList.remove('enter')
          void d.offsetWidth
          d.classList.add('bump')
          sfx.right(2)
        } else tone(semis(523.25, 5 + n * 2), 0, 0.08, 'sine', 0.07)
        await wait(landing.length ? 250 : 600)
      }
      // then why that row happened, with time to read it
      if (says && alive()) {
        const s = say(r)
        box.append(s)
        s.animate([{ opacity: 0, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'none' }], { duration: 300 })
        await wait(Math.min(2600, 900 + 20 * says[r].length))
      }
    }
    // how the table gives the numbers the work used
    for (const spec of looks) {
      if (!alive()) return
      const tl = tableLook(spec)
      if (!tl) continue
      lookBox.append(tl.el)
      tl.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      await tl.play(alive)
    }
    const gr = alive() && drawGraph(graphSpec)
    if (gr) {
      graphBox.append(gr.el)
      gr.el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      await gr.play(alive)
    }
    if (why && alive()) {
      why.hidden = false
      why.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 })
    }
  }
  replay.addEventListener('click', () => {
    if (reduced()) showFinal()
    else play()
  })
  if (auto && !reduced()) setTimeout(play, 0)
  else showFinal()
  return el
}
