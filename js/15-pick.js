// js/15-pick.js · World 0: pick from every distribution
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- World 0: pick from every distribution ----------
// All ten, in the tree's order (counting, then measuring), so where a name sits
// gives nothing away. Picking one shows its formula; Check grades it.
const PICK_ORDER = ['binomial', 'geometric', 'negbin', 'hyper', 'poisson', 'uniform', 'exponential', 'gamma', 'chi', 'normal']
// A dropdown answer: the options in a list (formulas drawn), the choice shown in the
// box, then Check. Each item is { key, group?, row: () => nodes, shown: () => nodes }.
// A long list scrolls inside itself; plain numbers (cls 'nums') sit in columns,
// smallest first, read down each column. With checkButton false there is no Check of
// its own: onChoose(key) says what was picked, and value() and lock() serve a Check
// shared by several boxes. title is words or a node (a formula).
function pickBox({ placeholder, label, items, onCheck, cls = '', title = 'Your answer', checkButton = true, onChoose = null }) {
  const wrap = h('div', 'pick' + (cls ? ' ' + cls : ''))
  const box = h('div', 'pick-box')
  const toggle = h('button', 'pick-toggle')
  toggle.type = 'button'
  toggle.setAttribute('aria-haspopup', 'listbox')
  toggle.setAttribute('aria-expanded', 'false')
  const shown = h('span', 'pick-shown', placeholder)
  toggle.append(shown, h('span', 'pick-caret', '▾'))
  const list = h('div', 'pick-list')
  list.setAttribute('role', 'listbox')
  list.setAttribute('aria-label', label)
  list.hidden = true
  const rows = items.map(it => {
    if (it.group) list.append(h('div', 'pick-group', it.group))
    const row = h('button', 'pick-opt')
    row.type = 'button'
    row.setAttribute('role', 'option')
    row.setAttribute('aria-selected', 'false')
    row.append(...it.row())
    row.addEventListener('click', () => choose(it, row))
    list.append(row)
    return row
  })
  box.append(toggle, list)
  const check = h('button', 'btn', 'Check')
  check.type = 'button'
  check.disabled = true
  let chosen = null
  let chosenRow = null
  const away = e => {
    if (!box.contains(e.target)) open(false)
  }
  function open(on) {
    list.hidden = !on
    toggle.setAttribute('aria-expanded', String(on))
    if (on) {
      document.addEventListener('pointerdown', away, true)
      ;(chosenRow ?? rows[0])?.focus({ preventScroll: true })
      box.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
      // a long list opens on the one already picked
      if (chosenRow) list.scrollTop = Math.max(0, chosenRow.offsetTop - list.offsetTop - list.clientHeight / 2)
    } else document.removeEventListener('pointerdown', away, true)
  }
  function choose(it, row) {
    chosen = it.key
    chosenRow = row
    shown.replaceChildren(...it.shown())
    rows.forEach(r => r.setAttribute('aria-selected', String(r === row)))
    check.disabled = false
    open(false)
    onChoose?.(it.key)
    ;(checkButton ? check : toggle).focus({ preventScroll: true })
  }
  toggle.addEventListener('click', () => open(list.hidden))
  // arrows (and Home, End) move through the options in order, Escape closes
  list.addEventListener('keydown', e => {
    const i = rows.indexOf(document.activeElement)
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: rows.length - 1 }[e.key]
    if (to !== undefined) {
      e.preventDefault()
      rows[Math.min(rows.length - 1, Math.max(0, to))]?.focus()
    } else if (e.key === 'Escape') {
      open(false)
      toggle.focus()
    }
  })
  check.addEventListener('click', () => {
    if (chosen !== null) onCheck(chosen, { sel: toggle, check, wrap })
  })
  const head = h('div', 'pick-label', typeof title === 'string' ? title : null)
  if (typeof title !== 'string') head.append(title)
  wrap.append(head, box)
  if (checkButton) wrap.append(check)
  // a key on the keyboard (1–8, a–h) picks that option; learn mode's Show me too
  wrap.pickNth = i => {
    if (!toggle.disabled) rows[i]?.click()
  }
  wrap.value = () => chosen
  wrap.lock = () => {
    open(false)
    toggle.disabled = true
    check.disabled = true
  }
  return wrap
}

function pickQuestion(p, sheet) {
  // every distribution with its formula, grouped like the tree
  const items = PICK_ORDER.map((k, i) => {
    const L = LEAVES[k]
    return {
      key: k,
      group: i === 0 ? 'Counting · whole numbers (Ch 3)' : k === 'uniform' ? 'Measuring · any decimal (Ch 4)' : null,
      row: () => {
        const name = h('span', 'pick-name', L.name)
        name.append(h('small', '', L.sec))
        return [name, tex(L.tex, false)]
      },
      shown: () => [h('b', 'choice-name', L.name), tex(L.tex, false)],
    }
  })
  const box = pickBox({ placeholder: 'Choose a distribution…', label: 'Distributions', items, onCheck: (k, ui) => answerPick(k, p, sheet, ui) })
  box.correctIndex = PICK_ORDER.indexOf(p.leaf)
  sheet.append(box)
}
// The parameters to pick once an MGF's distribution is named: the right ones, the
// slips the story knows, and the same distribution's parameters read off other MGFs
// (other numbers), 8 in all. A slip that says the same as the answer (γ = 4, when the
// answer is γ = 4 with a note) is left out.
function mgfParamChoices(p) {
  const pp = p.mgfParams
  const bare = t => String(t).replace(/\\ \\ \(.*$/, '').replace(/\s+/g, '')
  const seen = new Set([bare(pp.right)])
  const out = []
  const take = t => {
    if (typeof t !== 'string' || seen.has(bare(t)) || out.length >= 7) return
    seen.add(bare(t))
    out.push(t)
  }
  pp.slips.forEach(take)
  for (let i = 0; i < 12 && out.length < 7; i++) take(treeProblem(p.leaf, true, { mgf: true }).mgfParams?.right)
  return shuffleArr([pp.right, ...out])
}
function askParams(p, sheet, q) {
  const pp = p.mgfParams
  const opts = mgfParamChoices(p)
  const box = pickBox({
    placeholder: 'Choose its parameters…',
    label: 'Parameters',
    cls: 'answers',
    title: 'Right. Now its parameters',
    items: opts.map((o, i) => ({ key: i, row: () => [tex(o, false)], shown: () => [tex(o, false)] })),
    onCheck: (i, ui) => {
      ui.sel.disabled = true
      ui.check.disabled = true
      if (opts[i] === pp.right) {
        ui.wrap.classList.add('right')
        award()
        showPlug(p, sheet)
        return
      }
      ui.wrap.classList.add('wrong')
      miss(q)
      const why = h('div', 'why')
      why.append(h('h3', '', 'How it works'))
      const said = h('p', 'pick-said')
      said.append('You picked ', tex(opts[i], false), '. The parameters are ', tex(pp.right, false), '.')
      why.append(said)
      if (p.read) why.append(readBlock(p, Object.fromEntries(p.read.notes.map(([k], j) => [k, 'pv' + j]))).el)
      const { acts, cont } = gotIt(q)
      why.append(acts)
      sheet.append(why)
      cont.focus({ preventScroll: true })
      why.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
    },
  })
  box.correctIndex = opts.indexOf(pp.right)
  sheet.append(box)
  box.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
function answerPick(pick, p, sheet, { sel, check, wrap }) {
  if (round.locked || !LEAVES[pick]) return
  round.locked = true
  sel.disabled = true
  check.disabled = true
  const q = round.queue[round.at]
  if (pick === p.leaf || p.alsoRight?.includes(pick)) {
    wrap.classList.add('right')
    if (pick !== p.leaf && ALSO_NOTE[p.leaf]) sheet.append(h('p', 'also-right', ALSO_NOTE[p.leaf]))
    // from an MGF the name is half the answer: then its parameters
    if (p.mgfParams) return askParams(p, sheet, q)
    award()
    showPlug(p, sheet)
    return
  }
  miss(q)
  wrap.classList.add('wrong')
  const why = h('div', 'why')
  why.append(h('h3', '', 'How it works'))
  why.append(h('p', '', `You picked ${LEAVES[pick].name}. The answer is ${LEAVES[p.leaf].name}.`))
  if (p.hint?.text) why.append(h('p', '', p.hint.text))
  if (p.clue) sheet.querySelector('.story')?.replaceWith(storyEl({ text: p.text, clue: p.clue }, true))
  if (p.trap) why.append(h('p', 'trap', 'The trap: ' + p.trap))
  if (p.read) why.append(readBlock(p, Object.fromEntries(p.read.notes.map(([k], i) => [k, 'pv' + i]))).el)
  why.append(leafCard(p.leaf))
  why.append(walkButton(p.leaf))
  const { acts, cont } = gotIt(q)
  why.append(acts)
  sheet.append(why)
  cont.focus({ preventScroll: true })
  why.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
}
