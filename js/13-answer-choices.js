// js/13-answer-choices.js · answer choices: the options in the dropdown
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- answer choices: the options in the dropdown ----------
// Six options where the question allows it: the answer plus five wrong ones.
// Template distractors (the common mistakes) go first, then nearby values, the
// same way the class app picks its four. Fixed lettered options stay as they are.
const fmtChoice = v => String(parseFloat(Math.abs(v) < 1 ? v.toPrecision(4) : v.toFixed(4)))
const shuffleArr = arr => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const WRONG = 5
function buildChoices6(p) {
  if (typeof p.answer === 'string') {
    if (p.options) return p.options.map((_, i) => ({ label: 'abcdefgh'[i], correct: 'abcdefgh'[i] === p.answer }))
    if (p.choices) {
      const wrong = [...new Set(p.choices.filter(c => c !== p.answer))].slice(0, WRONG)
      return shuffleArr([{ label: p.answer, correct: true }, ...wrong.map(w => ({ label: w, correct: false }))])
    }
    return T2.buildChoices(p)
  }
  const a = p.answer
  const tol = Math.max(p.tolerance ?? 1e-6, 1e-9)
  const generic =
    a > 0 && a < 1
      ? [1 - a, Math.min(0.99, a * 2), a / 2, Math.min(0.99, a + 0.1), Math.max(0.01, a - 0.1), Math.min(0.99, a + 0.05), Math.max(0.01, a - 0.05), Math.min(0.99, a + 0.2), Math.max(0.01, a - 0.2)]
      : Number.isInteger(a)
        ? [a + 1, a - 1, a * 2, Math.round(a / 2), a + 10, a + 2, a - 2, a * 3]
        : [a * 2, a / 2, a + 0.5, a - 0.5, a + 1, a - 1, a * 1.5]
  const used = new Set([fmtChoice(a)])
  const picked = []
  for (const c of [...(p.distractors ?? []), ...generic]) {
    if (picked.length === WRONG) break
    if (!Number.isFinite(c) || Math.abs(c - a) <= tol * (1 + 1e-9) || (a >= 0 && c < 0)) continue
    const l = fmtChoice(c)
    if (used.has(l) || Math.abs(parseFloat(l) - a) <= tol * (1 + 1e-9)) continue
    used.add(l)
    picked.push(c)
  }
  let bump = 1
  while (picked.length < WRONG) {
    const c = a + (Number.isInteger(a) ? bump : bump * 0.15)
    const l = fmtChoice(c)
    if (!used.has(l) && Math.abs(parseFloat(l) - a) > tol * (1 + 1e-9)) {
      used.add(l)
      picked.push(c)
    }
    bump += 1
  }
  return shuffleArr([{ label: fmtChoice(a), correct: true }, ...picked.map(v => ({ label: fmtChoice(v), correct: false }))])
}
// typed answers: the class app's check, except that "16" for 0.16 needs the % sign,
// so a reciprocal slip (10 for 0.1) or a missing decimal is not marked right
function checkTyped(raw, p) {
  if (p.slice) return typedRight(raw, p.check.value, p.check.tol).ok
  const ok = T2.checkAnswer(raw, p)
  if (!ok || p.accept || typeof p.answer !== 'number' || /%/.test(raw)) return ok
  let t = String(raw).trim().toLowerCase().replace(/\s+/g, '').replace(/^[a-z]=/, '').replace(',', '.')
  const f = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/)
  const n = f ? (Number(f[2]) === 0 ? null : Number(f[1]) / Number(f[2])) : t !== '' && Number.isFinite(Number(t)) ? Number(t) : null
  return n !== null && Math.abs(n - p.answer) < (p.tolerance ?? 1e-6)
}
function choicesFor(p) {
  return buildChoices6(p).map(c => {
    if (p.options) {
      const o = p.options['abcdefgh'.indexOf(c.label)]
      if (typeof o === 'string') return { correct: c.correct, text: o }
      return o.name ? { correct: c.correct, name: o.name, tex: o.latex } : { correct: c.correct, tex: o.latex }
    }
    if (p.expr) return { correct: c.correct, tex: T2.toLatex(c.label, p.expr.vars) ?? c.label }
    return { correct: c.correct, text: c.label }
  })
}
