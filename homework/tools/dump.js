// Prints homework problems as Markdown, the way a student reads them in the app.
//   node dump.js homework/g1-....js            -> homework numbers
//   TWINS=2 node dump.js homework/g1-....js    -> plus 2 twins each
//   ONLY=3.4-24 node dump.js ...               -> one problem
const path = require('path')
const fs = require('fs')
const ROOT = path.resolve(__dirname, '../..')
global.window = globalThis
require(path.join(ROOT, 'engine.js'))
require(path.join(ROOT, 'homework/core.js'))
const files = process.argv.slice(2).length
  ? process.argv.slice(2).map(f => path.resolve(ROOT, f))
  : fs.readdirSync(path.join(ROOT, 'homework')).filter(f => /^g\d.*\.js$/.test(f)).sort().map(f => path.join(ROOT, 'homework', f))
for (const f of files) require(f)
const TWINS = +(process.env.TWINS || 0)
const ONLY = process.env.ONLY

const T = HW.tables()
const cellText = l => {
  const t = T[l.table]
  const r = t.rows.find(x => x.label === String(l.row))
  const v = r.values[t.cols.indexOf(String(l.col))]
  return `[table ${t.title}: row ${l.row}, column ${l.col} → ${v}${l.target != null ? ` (looking for ${l.target})` : ''}]`
}
function dump(p, v, tag) {
  const b = p.make(v)
  console.log(`\n## ${p.section} #${p.num} · ${p.title} ${tag}\n`)
  console.log(b.text + '\n')
  for (const pt of b.parts) {
    console.log(`### (${pt.label}) ${pt.ask}   _skill: ${pt.skill}_\n`)
    console.log(`- **Hint:** ${pt.hint}`)
    const c = pt.check
    if (c.type === 'number') console.log(`- **Check:** type a number = ${+c.value.toPrecision(8)} (±${c.tol})${c.wrong ? ` · arcade wrong choices: ${c.wrong.map(x => +x.toPrecision(5)).join(', ')}` : ''}`)
    if (c.type === 'numbers') console.log(`- **Check:** ` + c.items.map(it => `${it.label} = ${+it.value.toPrecision(8)} (±${it.tol})${it.wrong ? ` [wrong: ${it.wrong.map(x => +x.toPrecision(5)).join(', ')}]` : ''}`).join('; '))
    if (c.type === 'choice') c.options.forEach((o, i) => console.log(`- **Choice ${i === c.correct ? '✓' : '✗'}:** ${o.tex ?? o.text}`))
    if (c.type === 'self') console.log('- **Check:** write it, then compare (self-marked)')
    console.log('- **Steps:**')
    pt.steps.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.say}`)
      for (const line of [].concat(s.tex ?? [])) console.log(`     $$ ${line} $$`)
      if (s.why) console.log(`     _why:_ ${s.why}`)
      if (s.look) console.log(`     ${cellText(s.look)}`)
      if (s.graph) console.log(`     [graph: ${s.graph.kind} ${s.graph.title ?? ''} ${s.graph.note ?? ''}]`)
    })
    console.log(`- **Answer:** $$ ${pt.answer} $$`)
    if (pt.trap) console.log(`- **Trap:** ${pt.trap}`)
    console.log('')
  }
}
for (const p of HW.problems) {
  if (ONLY && p.id !== ONLY) continue
  dump(p, p.hw, '(homework numbers)')
  for (let i = 0; i < TWINS && p.twin; i++) {
    const v = p.twin()
    dump(p, v, `(twin ${i + 1}: ${JSON.stringify(v)})`)
  }
}
