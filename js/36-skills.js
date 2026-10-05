// js/36-skills.js · skills: what the test asks for, weakest first
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- skills: what the test asks for, weakest first ----------
// a skill's quiz parts and its arcade levels; a skill no quiz question uses still shows
// (it is on the study guide) with its levels
function skillRow(id, { open = false } = {}) {
  const sk = HWX.skills[id]
  const parts = hwAll().filter(({ pt }) => pt.skill === id)
  // a level the arcade renamed or dropped is left out
  const lv = (sk.levels ?? []).filter(k => ORDER.includes(k))
  const v = hwScore(parts)
  const pct = Math.round(v * 100) + '%'
  const band = v >= 0.8 ? 'rb-good' : v >= 0.5 ? 'rb-mid' : 'rb-low'
  const row = h('div', 'ready-row')
  const top = h('div', 'ready-top')
  top.append(h('b', '', sk.name), h('span', parts.length ? 'ready-pct ' + band : 'ready-pct', parts.length ? pct : '–'))
  const bar = h('div', 'ready-bar')
  const fill = h('i', band)
  fill.style.width = Math.round(v * 100) + '%'
  bar.append(fill)
  const how = h('details', 'skill-how')
  how.open = open
  how.append(h('summary', '', 'How it works'))
  const ul = h('ul', 'points')
  for (const line of sk.lesson) ul.append(h('li', '', line))
  how.append(ul)
  row.append(top)
  if (parts.length) row.append(bar)
  // a skill shown on its own says why it has no quiz parts (the full list says it once)
  else if (open) row.append(h('p', 'note', `No quiz question asks this, but the study guide lists it${lv.length ? ': drill it in the arcade.' : '.'}`))
  row.append(how)
  if (parts.length) {
    const chips = h('div', 'ready-levels')
    chips.append(h('span', 'skill-tag', 'Quiz'))
    for (const { p, pt } of parts) {
      const st = partStatus(hwRec(p.id, pt.label))
      const b = hwBtn(`${hwName(p)}${pt.label ? ` (${pt.label})` : ''}`, 'tool skill-part ' + st, () => hwOpen(p.id, { focus: pt.label }))
      b.title = STATUS_TEXT[st]
      chips.append(b)
    }
    row.append(chips)
  }
  if (lv.length) {
    const chips = h('div', 'ready-levels')
    chips.append(h('span', 'skill-tag', 'Arcade drill'))
    for (const k of lv) {
      const s = state.stars[k] || 0
      chips.append(hwBtn(`${k} ${'★'.repeat(s)}${'☆'.repeat(3 - s)}`, 'tool', () => {
        closeOverlay()
        openCard(k)
      }))
    }
    row.append(chips)
  }
  return { row, v, n: parts.length }
}
// the whole list, weakest first; or one skill (from a part's skill chip)
function openSkills(only = null) {
  if (only && !HWX.skills[only]) only = null
  overlay.replaceChildren()
  const inner = h('div', 'overlay-inner')
  const head = h('div', 'overlay-head')
  head.append(h('strong', '', only ? 'Skill' : 'Weak spots'))
  head.append(hwBtn('Close', 'tool', closeOverlay))
  inner.append(head)
  if (only) {
    inner.append(skillRow(only, { open: true }).row)
    inner.append(hwBtn('See every skill', 'tool skill-all', () => openSkills()))
  } else {
    const all = hwScore(hwAll())
    const band = all >= 0.8 ? 'rb-good' : all >= 0.5 ? 'rb-mid' : 'rb-low'
    const overall = h('p', 'ready-overall')
    overall.append(h('b', band, Math.round(all * 100) + '%'), 'ready on the quiz questions.')
    inner.append(overall, h('p', 'paper-note', 'Each quiz part is worth half for the quiz’s numbers and half for new numbers. Your first answer each time counts, and a later miss takes that half back. If you open the steps before answering, that answer counts as a miss. Weakest first: tap a part to work it, or an arcade level to drill it.'), hwLegend())
    if (!hwAll().some(({ p, pt }) => hwRec(p.id, pt.label))) inner.append(h('p', 'first-move', 'Nothing tried yet. Start with Next up on the home screen.'))
    const rows = Object.keys(HWX.skills).map(id => skillRow(id))
    const list = h('div', 'ready-list')
    rows.filter(r => r.n).sort((a, b) => a.v - b.v).forEach(r => list.append(r.row))
    inner.append(list)
    // on the study guide but in no quiz question: the arcade drills them
    const rest = rows.filter(r => !r.n)
    if (rest.length) {
      const more = h('div', 'ready-list')
      rest.forEach(r => more.append(r.row))
      inner.append(h('h3', '', 'Also on the study guide'), h('p', 'paper-note', 'No quiz question asks these, but the test can: drill them in the arcade.'), more)
    }
  }
  overlay.append(inner)
  overlay.hidden = false
  overlay.scrollTop = 0
  document.body.style.overflow = 'hidden'
}
