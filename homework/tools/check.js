// Checks homework problem files: shape, numbers, TeX, and prints the homework answers.
//   node homework/tools/check.js                      -> every homework/g*.js
//   node homework/tools/check.js homework/g1-....js   -> just those files
//   TWINS=500 node homework/tools/check.js ...        -> more twins per problem
//   QUIET=1 node homework/tools/check.js ...          -> don't print the answers
const path = require('path')
const fs = require('fs')
const ROOT = path.resolve(__dirname, '../..')
// MathJax for the TeX check: npm install mathjax-full@3.2.2 somewhere, then MATHJAX_DIR=<that folder>
const SCRATCH = process.env.MATHJAX_DIR || path.resolve(__dirname, '../..')
global.window = globalThis
require(path.join(ROOT, 'engine.js'))
require(path.join(ROOT, 'homework/core.js'))

// ---------- MathJax (node) ----------
const { mathjax } = require(path.join(SCRATCH, 'node_modules/mathjax-full/js/mathjax.js'))
const { TeX } = require(path.join(SCRATCH, 'node_modules/mathjax-full/js/input/tex.js'))
const { AllPackages } = require(path.join(SCRATCH, 'node_modules/mathjax-full/js/input/tex/AllPackages.js'))
const { SVG } = require(path.join(SCRATCH, 'node_modules/mathjax-full/js/output/svg.js'))
const { liteAdaptor } = require(path.join(SCRATCH, 'node_modules/mathjax-full/js/adaptors/liteAdaptor.js'))
const { RegisterHTMLHandler } = require(path.join(SCRATCH, 'node_modules/mathjax-full/js/handlers/html.js'))
const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const doc = mathjax.document('', {
  InputJax: new TeX({ packages: AllPackages.filter(p => !['noerrors', 'noundefined', 'autoload', 'require'].includes(p)), formatError: (jax, err) => { throw err } }),
  OutputJax: new SVG({ fontCache: 'none' }),
})
const texCache = new Map()
function texError(src, display = true) {
  if (texCache.has(src)) return texCache.get(src)
  let err = null
  try { doc.convert(src, { display }) } catch (e) { err = e.message || String(e) }
  texCache.set(src, err)
  return err
}

// ---------- load the files ----------
const files = process.argv.slice(2).length
  ? process.argv.slice(2).map(f => path.resolve(ROOT, f))
  : fs.readdirSync(path.join(ROOT, 'homework')).filter(f => /^g\d.*\.js$/.test(f)).sort().map(f => path.join(ROOT, 'homework', f))
const owner = new Map()
for (const f of files) {
  const before = HW.problems.length
  try { require(f) } catch (e) { console.error(`✗ ${path.basename(f)} failed to load: ${e.stack}`); process.exitCode = 1; continue }
  for (const p of HW.problems.slice(before)) owner.set(p, path.basename(f))
}
const TWINS = +(process.env.TWINS || 200)
const QUIET = !!process.env.QUIET

// ---------- checks ----------
const errs = []
const err = (where, msg) => errs.push(`${where}: ${msg}`)
const isStr = s => typeof s === 'string' && s.trim().length > 0
const BAD = /\bundefined\b|\bNaN\b|\bInfinity\b|\[object Object\]/
const TABLES = HW.tables()

function checkText(where, s, { optional = false } = {}) {
  if (s == null && optional) return
  if (!isStr(s)) return err(where, 'missing text')
  if (BAD.test(s)) err(where, `has undefined/NaN/Infinity: ${s.slice(0, 120)}`)
  if (/(^|[^\\])\$/.test(s)) err(where, `uses $ for math (use \\( \\) or \\[ \\]): ${s.slice(0, 100)}`)
  const opens = (s.match(/\\\(/g) || []).length, closes = (s.match(/\\\)/g) || []).length
  if (opens !== closes) err(where, `unbalanced \\( \\): ${s.slice(0, 100)}`)
  const dOpen = (s.match(/\\\[/g) || []).length, dClose = (s.match(/\\\]/g) || []).length
  if (dOpen !== dClose) err(where, `unbalanced \\[ \\]: ${s.slice(0, 100)}`)
  for (const m of s.matchAll(/\\\(([\s\S]*?)\\\)/g)) { const e = texError(m[1], false); if (e) err(where, `TeX error "${e}" in \\(${m[1]}\\)`) }
  for (const m of s.matchAll(/\\\[([\s\S]*?)\\\]/g)) { const e = texError(m[1], true); if (e) err(where, `TeX error "${e}" in \\[${m[1]}\\]`) }
}
function checkTex(where, s) {
  if (!isStr(s)) return err(where, 'missing TeX')
  if (BAD.test(s)) err(where, `has undefined/NaN/Infinity: ${s.slice(0, 120)}`)
  if (/\\\(|\\\)/.test(s)) err(where, `TeX field has \\( \\) in it: ${s.slice(0, 100)}`)
  const e = texError(s, true)
  if (e) err(where, `TeX error "${e}" in ${s.slice(0, 160)}`)
}
function checkLook(where, look) {
  if (!look) return
  const t = TABLES[look.table]
  if (!t) return err(where, `look: no table ${look.table}`)
  const r = t.rows.find(x => x.label === String(look.row))
  if (!r) return err(where, `look: table ${look.table} has no row ${look.row}`)
  if (t.cols.indexOf(String(look.col)) < 0) err(where, `look: table ${look.table} has no column ${look.col}`)
}
function checkGraph(where, g) {
  if (!g) return
  if (g.kind === 'curve') {
    if (typeof g.pdf !== 'function' || !(g.hi > g.lo)) err(where, 'graph: curve needs pdf, lo < hi')
    else for (let i = 0; i <= 20; i++) { const y = g.pdf(g.lo + ((g.hi - g.lo) * i) / 20); if (!Number.isFinite(y)) { err(where, `graph: pdf not finite at ${g.lo + ((g.hi - g.lo) * i) / 20}`); break } }
    if (!Array.isArray(g.ticks)) err(where, 'graph: curve needs ticks')
  } else if (g.kind === 'bars') {
    if (!Array.isArray(g.xs) || !Array.isArray(g.ys) || g.xs.length !== g.ys.length) err(where, 'graph: bars need xs and ys of the same length')
    else if (g.ys.some(y => !Number.isFinite(y))) err(where, 'graph: a bar height is not finite')
  } else err(where, `graph: unknown kind ${g.kind}`)
  if (g.title != null && !isStr(g.title)) err(where, 'graph: bad title')
}
function checkCheck(where, c) {
  if (!c || typeof c !== 'object') return err(where, 'missing check')
  // the arcade's wrong choices: real mistakes, all different, none within tol of the answer
  const checkWrong = (w, value, tol, wrong) => {
    if (wrong == null) return
    if (!Array.isArray(wrong) || wrong.length > 6) return err(w, 'wrong must be an array of up to 6 numbers')
    const seen = new Set()
    wrong.forEach(x => {
      if (!Number.isFinite(x)) return err(w, `wrong value not finite: ${x}`)
      if (Math.abs(x - value) <= tol * 1.5) err(w, `wrong value ${x} is within tol of the answer ${value}`)
      const k = +(+x).toPrecision(4)
      if (seen.has(k)) err(w, `wrong values repeat (${k})`)
      seen.add(k)
    })
  }
  if (c.type === 'number') {
    if (!Number.isFinite(c.value)) err(where, `check value not finite: ${c.value}`)
    if (!(c.tol > 0)) err(where, 'check needs tol > 0')
    else if (c.value !== 0 && c.tol > Math.abs(c.value) * 0.2) err(where, `tol ${c.tol} is more than 20% of the answer ${c.value}`)
    checkWrong(where, c.value, c.tol, c.wrong)
  } else if (c.type === 'numbers') {
    if (!Array.isArray(c.items) || !c.items.length) return err(where, 'numbers check needs items')
    c.items.forEach((it, i) => {
      checkTex(`${where} item ${i} label`, it.label)
      if (!Number.isFinite(it.value)) err(where, `item ${i} value not finite: ${it.value}`)
      if (!(it.tol > 0)) err(where, `item ${i} needs tol > 0`)
      else if (it.value !== 0 && it.tol > Math.abs(it.value) * 0.2) err(where, `item ${i} tol ${it.tol} is more than 20% of ${it.value}`)
      checkWrong(`${where} item ${i}`, it.value, it.tol, it.wrong)
    })
  } else if (c.type === 'choice') {
    if (!Array.isArray(c.options) || c.options.length < 2 || c.options.length > 6) return err(where, 'choice needs 2–6 options')
    if (!(c.correct >= 0 && c.correct < c.options.length)) err(where, 'choice correct index out of range')
    const seen = new Set()
    c.options.forEach((o, i) => {
      if (o.tex != null) checkTex(`${where} option ${i}`, o.tex)
      else if (o.text != null) checkText(`${where} option ${i}`, o.text)
      else err(where, `option ${i} needs tex or text`)
      const key = (o.tex ?? o.text ?? '').replace(/\s+/g, '')
      if (seen.has(key)) err(where, `two options are the same: ${key.slice(0, 100)}`)
      seen.add(key)
    })
  } else if (c.type !== 'self') err(where, `unknown check type ${c.type}`)
}
function checkProblem(p, built, tag) {
  const w = `${p.id}${tag}`
  if (!built || typeof built !== 'object') return err(w, 'make() returned nothing')
  checkText(`${w} text`, built.text)
  if (!Array.isArray(built.parts) || !built.parts.length) return err(w, 'no parts')
  const labels = new Set()
  built.parts.forEach((pt, i) => {
    const pw = `${w} (${pt.label || i})`
    if (typeof pt.label !== 'string') err(pw, 'label must be a string')
    if (labels.has(pt.label)) err(pw, 'duplicate label')
    labels.add(pt.label)
    checkText(`${pw} ask`, pt.ask)
    if (!HW.skills[pt.skill]) err(pw, `unknown skill ${pt.skill}`)
    checkText(`${pw} hint`, pt.hint)
    checkText(`${pw} trap`, pt.trap, { optional: true })
    checkCheck(`${pw} check`, pt.check)
    checkTex(`${pw} answer`, pt.answer)
    if (!Array.isArray(pt.steps) || pt.steps.length < 1) return err(pw, 'needs steps')
    if (pt.steps.length > 8) err(pw, `${pt.steps.length} steps is a lot (aim for 2–7)`)
    pt.steps.forEach((s, j) => {
      const sw = `${pw} step ${j + 1}`
      checkText(`${sw} say`, s.say)
      checkText(`${sw} why`, s.why, { optional: true })
      if (s.tex != null) for (const line of [].concat(s.tex)) checkTex(`${sw} tex`, line)
      checkLook(sw, s.look)
      checkGraph(sw, s.graph)
      for (const k of Object.keys(s)) if (!['say', 'tex', 'why', 'look', 'graph'].includes(k)) err(sw, `unknown step key ${k}`)
    })
    for (const k of Object.keys(pt)) if (!['label', 'ask', 'skill', 'hint', 'check', 'answer', 'steps', 'trap'].includes(k)) err(pw, `unknown part key ${k}`)
  })
}

const show = c => c.type === 'number' ? `${+c.value.toPrecision(6)} (±${c.tol})`
  : c.type === 'numbers' ? c.items.map(it => `${it.label}=${+it.value.toPrecision(6)}`).join(', ')
  : c.type === 'choice' ? `choice #${c.correct}` : 'self-check'

for (const p of HW.problems) {
  if (!owner.has(p)) continue
  const w = p.id
  for (const k of ['id', 'section', 'num', 'title']) if (!isStr(p[k])) err(w, `needs ${k}`)
  if (!HW.groups.some(g => g.id === p.group)) err(w, `bad group ${p.group}`)
  if (typeof p.make !== 'function') { err(w, 'needs make()'); continue }
  if (p.hw === undefined) err(w, 'needs hw')
  let built
  try { built = p.make(p.hw) } catch (e) { err(w, `make(hw) threw: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); continue }
  checkProblem(p, built, ' [hw]')
  // progress is saved by part label, and the arcade cuts parts (and numbers) by label:
  // a twin must have every homework label (it may add parts, and may turn a write-it-out
  // part into one with a number), and a part with several numbers keeps their count
  const hwParts = (built?.parts ?? []).map(pt => ({ label: pt.label, items: pt.check?.type === 'numbers' ? pt.check.items.length : null }))
  const shapeErr = b => {
    const tw = new Map((b?.parts ?? []).map(pt => [pt.label, pt]))
    const bad = []
    for (const { label, items } of hwParts) {
      const t = tw.get(label)
      if (!t) bad.push(`no part (${label})`)
      else if (items != null && !(t.check?.type === 'numbers' && t.check.items.length === items)) bad.push(`(${label}) needs ${items} numbers like the homework`)
    }
    return bad.join('; ')
  }
  if (!QUIET) {
    console.log(`\n${p.section} #${p.num} · ${p.title}  (${owner.get(p)})`)
    for (const pt of built.parts ?? []) console.log(`  (${pt.label}) [${pt.skill}] ${show(pt.check ?? {})}\n      answer: ${pt.answer}`)
  }
  if (p.twin) {
    const seenTexts = new Set()
    for (let i = 0; i < TWINS; i++) {
      let v
      try { v = p.twin() } catch (e) { err(w, `twin() threw: ${e.message}`); break }
      try { built = p.make(v) } catch (e) { err(w, `make(twin) threw on ${JSON.stringify(v)}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); break }
      seenTexts.add(built?.text)
      const n = errs.length
      checkProblem(p, built, ` [twin ${JSON.stringify(v)}]`)
      const se = shapeErr(built)
      if (se) err(`${w} [twin ${JSON.stringify(v)}]`, `twin doesn't match the homework's parts: ${se}`)
      if (errs.length > n + 5) break
    }
    if (seenTexts.size < Math.min(3, TWINS)) err(w, `twins look the same every time (${seenTexts.size} different stories in ${TWINS})`)
  }
}

// one copy of each message is enough
const uniq = [...new Map(errs.map(e => [e.replace(/\[twin [^\]]*\]/, '[twin]'), e])).values()]
console.log(`\n${HW.problems.filter(p => owner.has(p)).length} problems, ${uniq.length} problem(s) found`)
for (const e of uniq.slice(0, 80)) console.log('✗ ' + e)
if (uniq.length > 80) console.log(`… and ${uniq.length - 80} more`)
if (uniq.length) process.exitCode = 1
