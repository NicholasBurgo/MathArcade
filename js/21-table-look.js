// js/21-table-look.js · table lookups, animated: a window of the printed table
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- table lookups, animated: a window of the printed table ----------
// the normal table's row and column for a z with 2 decimals (row −1.6, column 0.08 is −1.68)
const zCell = z => {
  const c = Math.round(Math.abs(z) * 100)
  return { row: (z < 0 ? '-' : '') + (Math.floor(c / 10) / 10).toFixed(1), col: ((c % 10) / 100).toFixed(2) }
}
const cellOf = (name, row, col) => {
  tables ??= printedTables()
  const t = tables[name]
  const r = t.rows.find(x => x.label === row)
  const j = t.cols.indexOf(col)
  return r && j >= 0 ? r.values[j] : null
}
// the z values (×100) whose entries are closest to an area (two when it is halfway)
function closestZ(A) {
  tables ??= printedTables()
  let best = Infinity, at = []
  for (const r of tables.normal.rows) r.values.forEach((v, j) => {
    const d = Math.abs(+v - A)
    const z = Math.round((r.label.startsWith('-') ? -1 : 1) * (Math.abs(+r.label) * 100 + j))
    if (d < best - 1e-12) { best = d; at = [z] }
    else if (Math.abs(d - best) <= 1e-12 && !at.includes(z)) at.push(z)
  })
  return at
}
const normEntry = z => {
  const { row, col } = zCell(z)
  return cellOf('normal', row, col)
}
// a window of one printed table: the row lights up, then the column, and they meet
// at the entry; reverse (an area to find) lights the entry first, then its edges.
// play(alive, fx): fx.table, fx.row, fx.col and fx.hit (each given the element) run as
// the table, its row, its column and its entry light up, so a chip can fly there.
function tableLook({ name, row, col, target = null, halfway = null }) {
  tables ??= printedTables()
  const t = tables[name]
  const ri = t.rows.findIndex(r => r.label === row)
  const ci = t.cols.indexOf(col)
  if (ri < 0 || ci < 0) return null
  const entry = t.rows[ri].values[ci]
  const wrap = h('div', 'tlook')
  const scroller = h('div', 'tlook-scroll')
  const table = h('table', 'tlook-table')
  const head = h('tr')
  head.append(h('th', 'corner', t.corner))
  const colHeads = t.cols.map(c => {
    const th = h('th', '', c)
    head.append(th)
    return th
  })
  table.append(head)
  const lo = Math.max(0, ri - 2), hi = Math.min(t.rows.length - 1, ri + 2)
  const gap = () => {
    const tr = h('tr', 'gap')
    tr.append(h('td', '', '⋮'))
    table.append(tr)
  }
  if (lo > 0) gap()
  let rowHead = null, rowCells = [], colCells = [], hit = null
  for (let i = lo; i <= hi; i++) {
    const tr = h('tr')
    const th = h('th', '', t.rows[i].label)
    tr.append(th)
    t.rows[i].values.forEach((v, j) => {
      const td = h('td', '', v)
      tr.append(td)
      if (i === ri) rowCells.push(td)
      if (j === ci) colCells.push(td)
      if (i === ri && j === ci) hit = td
    })
    if (i === ri) rowHead = th
    table.append(tr)
  }
  if (hi < t.rows.length - 1) gap()
  scroller.append(table)
  let cap
  if (name === 'normal') {
    const z = (row.startsWith('-') ? '-' : '') + (Math.abs(+row) + +col).toFixed(2)
    cap = halfway
      ? `${target} is exactly halfway between ${normEntry(halfway[0])} (z = ${halfway[0].toFixed(2)}) and ${normEntry(halfway[1])} (z = ${halfway[1].toFixed(2)}), so use the z halfway between them: ${((halfway[0] + halfway[1]) / 2).toFixed(3)}. This window shows ${entry} (z = ${z}).`
      : target != null
      ? `Look in the body for the entry closest to ${target}: ${entry}. Its row ${row} and column ${col} make z = ${z}.`
      : `Row ${row} (z cut off after one decimal, not rounded) and column ${col} (its second decimal) make z = ${z}. They meet at ${entry}, the area to the LEFT: P(Z < ${z}) = ${entry}.`
  } else if (name === 'chi2') {
    cap = target != null
      ? `In row γ = ${row}, find ${entry}. Its column, ${col}, is the area to its LEFT.`
      : `Row γ = ${row}, column ${col} (the area to the LEFT) meet at ${entry}.`
  } else {
    cap = `In the n = ${t.n ?? (name === 'binomial19' ? 19 : 20)} table, row x = ${row} and column p = ${col} meet at ${entry}: F(${row}) = P(X ≤ ${row}) = ${entry}.`
  }
  const caption = h('p', 'tlook-cap', cap)
  const label = h('div', 'piece-label', 'Reading the table · ' + t.title)
  wrap.append(label, scroller, caption)
  const centre = () => {
    if (hit) scroller.scrollLeft = Math.max(0, hit.offsetLeft - scroller.clientWidth / 2 + hit.offsetWidth / 2)
  }
  function final() {
    rowHead?.classList.add('on-row')
    rowCells.forEach(c => c.classList.add('on-row'))
    colHeads[ci].classList.add('on-col')
    colCells.forEach(c => c.classList.add('on-col'))
    hit?.classList.add('hit')
    caption.hidden = false
    requestAnimationFrame(centre)
  }
  async function play(alive, fx = {}) {
    caption.hidden = true
    requestAnimationFrame(centre)
    await wait(400)
    if (fx.table && alive()) await fx.table(label)
    const sweep = async (cells, cls, gapMs) => {
      for (const c of cells) {
        if (!alive()) return
        c.classList.add(cls)
        await wait(gapMs)
      }
    }
    if (target != null) {
      // an area to find: scan the row of the answer, stop on the closest entry
      await sweep(rowCells.slice(0, ci + 1), 'scan', 70)
      rowCells.forEach(c => c.classList.remove('scan'))
      hit?.classList.add('hit')
      tone(semis(523.25, 12), 0, 0.12, 'sine', 0.08)
      if (fx.hit && alive()) await fx.hit(hit)
      await wait(450)
      rowHead?.classList.add('on-row')
      if (fx.row && alive()) await fx.row(rowHead)
      await wait(300)
      colHeads[ci].classList.add('on-col')
      if (fx.col && alive()) await fx.col(colHeads[ci])
    } else {
      rowHead?.classList.add('on-row')
      if (fx.row && alive()) await fx.row(rowHead)
      await sweep(rowCells, 'on-row', 45)
      await wait(250)
      colHeads[ci].classList.add('on-col')
      if (fx.col && alive()) await fx.col(colHeads[ci])
      await sweep(colCells, 'on-col', 70)
      await wait(200)
      hit?.classList.add('hit')
      tone(semis(523.25, 12), 0, 0.12, 'sine', 0.08)
    }
    if (!alive()) return
    caption.hidden = false
    caption.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
    await wait(700)
  }
  return { el: wrap, play, final, hit, rowHead, colHead: colHeads[ci], label }
}
// the class's chi-squared table: the value in row γ under a LEFT-area column
const chiEntry = (g, col) => {
  tables ??= printedTables()
  const t = tables.chi2
  return t.rows[g - 1].values[t.cols.indexOf(fmt(col))]
}
