// js/32-table-cards.js · the table levels' cards: how to find each table value, on the printed tables
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the table levels' cards: how to find each table value, on the printed tables ----------
// Worked examples for each table level. Every number is read off the printed tables
// when the card opens, so the steps always say exactly what the table says.
const f4 = v => v.toFixed(4)
// the column of a chi-squared row whose entry is closest to a value
const chiCol = (row, v) => {
  tables ??= printedTables()
  const r = tables.chi2.rows.find(x => x.label === row)
  let best = 0
  r.values.forEach((x, j) => { if (Math.abs(+x - v) < Math.abs(+r.values[best] - v)) best = j })
  return { col: tables.chi2.cols[best], entry: r.values[best] }
}
const zOf = zi => ({ name: 'normal', ...zCell(zi / 100) })
const TABLE_EXAMPLES = {
  'Normal table': () => {
    const a = normEntry(1.25), lo = normEntry(-0.5), hi = normEntry(1.5)
    const zb = closestZ(0.975)[0]
    return [
      { q: 'P(Z < 1.25)', steps: ['Split z = 1.25 into its row, 1.2 (cut after one decimal, not rounded), and its column, 0.05 (the second decimal).', `They meet at ${a}. The table always gives the area to the LEFT.`], looks: [zOf(125)], answer: `P(Z < 1.25) = ${a}` },
      { q: 'P(Z > 1.25)', steps: ['The table only gives areas to the left, so look up 1.25 the same way.', `The area to the right is the rest: 1 − ${a}.`], looks: [zOf(125)], answer: `P(Z > 1.25) = 1 − ${a} = ${f4(1 - +a)}` },
      { q: 'P(−0.50 < Z < 1.50)', steps: [`Look up the top end: P(Z < 1.50) = ${hi}.`, `Look up the bottom end: P(Z < −0.50) = ${lo}.`, 'Between two z values: bigger area − smaller area.'], looks: [zOf(150), zOf(-50)], answer: `${hi} − ${lo} = ${f4(+hi - +lo)}` },
      { q: 'The z with area 0.025 to its right (z₀.₀₂₅)', steps: ['Backwards: the area is the given thing, so look for it INSIDE the table. 0.025 to the right is 1 − 0.025 = 0.975 to the left.', `The entry closest to 0.975 is ${normEntry(zb / 100)}, in row ${zCell(zb / 100).row} and column ${zCell(zb / 100).col}.`], looks: [{ ...zOf(zb), target: 0.975 }], answer: `z = ${(zb / 100).toFixed(2)}` },
    ]
  },
  'Normal word problems': () => {
    const a1 = normEntry(1), a2 = normEntry(2)
    const z80 = closestZ(0.8)[0], z975 = closestZ(0.975)[0]
    const x80 = 100 + (z80 / 100) * 15, d = (z975 / 100) * 15
    return [
      { q: 'IQ has μ = 100, σ = 15. What percentile is an IQ of 115?', steps: ['Turn x into z: z = (x − μ)/σ = (115 − 100)/15 = 1.00.', `Look up 1.00: row 1.0, column 0.00 meet at ${a1}.`, 'A percentile is the area to the left.'], looks: [zOf(100)], answer: `P(IQ < 115) = ${a1}: about the ${Math.round(+a1 * 100)}th percentile` },
      { q: 'IQ: P(IQ > 130)?', steps: ['z = (130 − 100)/15 = 2.00.', `Look up 2.00: ${a2} is to the left.`, 'More than 130 is the area to the right.'], looks: [zOf(200)], answer: `1 − ${a2} = ${f4(1 - +a2)}` },
      { q: 'IQ: what score is the 80th percentile?', steps: ['Backwards: the 80th percentile has area 0.80 to its left, so look for 0.80 inside the table.', `The closest entry is ${normEntry(z80 / 100)}, at z = ${(z80 / 100).toFixed(2)}.`, `Back to x: x = μ + zσ = 100 + ${(z80 / 100).toFixed(2)}(15).`], looks: [{ ...zOf(z80), target: 0.8 }], answer: `x = ${+x80.toFixed(1)}` },
      { q: 'IQ: between what two scores is the middle 95%?', steps: ['The middle 95% leaves 2.5% in each tail, so the top cut-off has 0.975 to its left.', `0.975 is at z = ${(z975 / 100).toFixed(2)}; the bottom cut-off is the same distance below: −${(z975 / 100).toFixed(2)}.`, `x = 100 ± ${(z975 / 100).toFixed(2)}(15) = 100 ± ${+d.toFixed(1)}.`], looks: [{ ...zOf(z975), target: 0.975 }], answer: `${+(100 - d).toFixed(1)} and ${+(100 + d).toFixed(1)}` },
    ]
  },
  'Binomial table': () => {
    const F = x => cellOf('binomial', String(x), '0.3')
    const G = cellOf('binomial19', '7', '0.4')
    return [
      { q: 'n = 20, p = 0.3: P(X ≤ 5)', steps: ['Use the table for your n: the n = 20 one.', `Row x = 5, column p = 0.3: ${F(5)}. The entries are cumulative: P(X ≤ x).`], looks: [{ name: 'binomial', row: '5', col: '0.3' }], answer: `P(X ≤ 5) = ${F(5)}` },
      { q: 'n = 20, p = 0.3: P(X ≥ 5)', steps: ['At least 5 is everything except 0 to 4, so read the row for 4.', `F(4) = ${F(4)}; at least 5 is 1 − F(4).`], looks: [{ name: 'binomial', row: '4', col: '0.3' }], answer: `1 − ${F(4)} = ${f4(1 - +F(4))}` },
      { q: 'n = 20, p = 0.3: P(X = 6)', steps: ['Exactly 6 = (at most 6) − (at most 5): two lookups in the same column.', `F(6) = ${F(6)}.`, `F(5) = ${F(5)}.`], looks: [{ name: 'binomial', row: '6', col: '0.3' }, { name: 'binomial', row: '5', col: '0.3' }], answer: `${F(6)} − ${F(5)} = ${f4(+F(6) - +F(5))}` },
      { q: 'n = 20, p = 0.3: P(X < 8) and P(X > 8)', steps: ['Fewer than 8 means at most 7: read row 7.', 'More than 8 means 1 − (at most 8): read row 8.'], looks: [{ name: 'binomial', row: '7', col: '0.3' }, { name: 'binomial', row: '8', col: '0.3' }], answer: `P(X < 8) = ${F(7)};  P(X > 8) = 1 − ${F(8)} = ${f4(1 - +F(8))}` },
      { q: 'n = 19, p = 0.4: P(X ≤ 7)', steps: ['A different n means a different table: the n = 19 one.', `Row x = 7, column p = 0.4: ${G}.`], looks: [{ name: 'binomial19', row: '7', col: '0.4' }], answer: `P(X ≤ 7) = ${G}` },
    ]
  },
  'Chi-squared table': () => {
    const right05 = cellOf('chi2', '10', '0.95')
    const a = chiCol('10', 3.94), b = chiCol('10', 16.0)
    return [
      { q: 'γ = 10: χ²₀.₀₅, the value with area 0.05 to its RIGHT', steps: ['The columns are areas to the LEFT. 0.05 to the right is 1 − 0.05 = 0.95 to the left: the 0.95 column.', `Row γ = 10, column 0.95: ${right05}.`], looks: [{ name: 'chi2', row: '10', col: '0.95' }], answer: `χ²₀.₀₅ = ${right05}` },
      { q: 'γ = 10: P(χ² < 3.94)', steps: ['Backwards: now the value is given, so find it INSIDE row γ = 10.', `${a.entry} sits in the ${a.col} column: that much area is to its left.`], looks: [{ name: 'chi2', row: '10', col: a.col, target: 3.94 }], answer: `P(χ² < 3.94) ≈ ${a.col}` },
      { q: 'γ = 10: P(χ² > 16.0)', steps: [`Find 16.0 in row γ = 10: the closest entry is ${b.entry}, in the ${b.col} column.`, `That is ${b.col} to the LEFT, so the right is 1 − ${b.col}.`], looks: [{ name: 'chi2', row: '10', col: b.col, target: 16 }], answer: `P(χ² > 16.0) ≈ ${(1 - +b.col).toFixed(b.col.length > 4 ? 3 : 2)}` },
    ]
  },
}
function tableGuide(short) {
  const make = TABLE_EXAMPLES[short]
  if (!make) return null
  const examples = make()
  const wrap = h('section', 'tguide')
  const head = h('div', 'tg-head')
  const all = h('button', 'btn ghost', '▶ Play every example')
  all.type = 'button'
  head.append(h('h3', 'shapes-title', 'How to find each table value'), all)
  wrap.append(head)
  const cards = examples.map(e => {
    const card = h('div', 'tg-ex')
    const top = h('div', 'tg-q')
    const play = h('button', 'tool', '▶ Play')
    play.type = 'button'
    top.append(h('b', '', e.q), play)
    const looks = e.looks.map(tableLook).filter(Boolean)
    const steps = e.steps.map(t => h('p', 'tg-step', t))
    const ans = h('p', 'tg-ans', '→ ' + e.answer)
    // a step, then its lookup; the steps left over come after the last lookup
    const order = []
    steps.forEach((s, i) => {
      order.push({ step: s })
      if (looks[i]) order.push({ look: looks[i] })
    })
    for (let i = steps.length; i < looks.length; i++) order.push({ look: looks[i] })
    card.append(top, ...order.map(o => o.step ?? o.look.el), ans)
    looks.forEach(l => l.final())
    let run = 0
    async function go() {
      const me = ++run
      const alive = () => me === run && card.isConnected
      steps.forEach(s => (s.hidden = true))
      ans.hidden = true
      looks.forEach(l => (l.el.hidden = true))
      card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
      for (const o of order) {
        if (!alive()) return
        if (o.step) {
          o.step.hidden = false
          o.step.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
          await wait(reduced() ? 0 : 1100)
        } else {
          o.look.el.hidden = false
          await o.look.play(alive)
        }
      }
      if (!alive()) return
      ans.hidden = false
      ans.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300 })
      tone(semis(523.25, 12), 0, 0.1, 'sine', 0.07)
      await wait(reduced() ? 0 : 900)
    }
    play.addEventListener('click', () => go())
    return { go, card }
  })
  let allRun = 0
  all.addEventListener('click', async () => {
    const me = ++allRun
    for (const c of cards) {
      if (me !== allRun || !wrap.isConnected) return
      await c.go()
    }
  })
  wrap.append(...cards.map(c => c.card))
  return wrap
}
