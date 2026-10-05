// js/31b-work-numbers.js · reading a worked answer: its rows, the question's numbers, and where they land
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- reading a worked answer: its rows, the question's numbers, and where they land ----------
// The class app's worked answer (answerLatex) is split into rows and steps. Each number the
// question gives becomes a chip (with the words it came from and, when the work names it,
// its symbol), and every spot in the work where that number lands is found, so the chip
// can fly there. A link must never mislead: anything unsure stays unlinked.
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
      const m = /^\\([a-zA-Z]+|[\s\S]?)/.exec(src.slice(i))
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
// the worked answer, unless it is only the letter of a lettered option
const workOf = p => (p.options && /^\s*(?:\\text\{)?\(?[a-h]\)?\}?\s*$/.test(p.answerLatex ?? '') ? null : p.answerLatex ?? null)

// ---------- the words a number comes from ----------
// words a phrase stops before: little words, and the verbs the stories use after a count
const WORK_STOP = /^(?:the|a|an|of|to|in|on|at|is|are|was|were|who|that|them|and|or|with|by|for|from|did|it|its|be|will|has|have|than|after|before|until|each|arrives?|responds?|germinates?|makes?|takes?|includes?|contains?|holds?|chosen|picked|drawn|buys?|pays?|emits?|lasts?|weighs?|wins?|gets?|support|supports)$/i
// words before a number that say what it is: "at most 12", "fewer than 7", "within 4", "draw 8"
const WORK_LEAD = /(?:^|\s)((?:at (?:most|least)|(?:more|fewer|less|greater|narrower|wider|longer|shorter) than|within|after|exactly|between|from|under|over|below|above|draws?|tests?|picks?|asks?|nets?|chooses?|takes?|flipped|rolled|interviews?|calls?) )$/i
// A short phrase around the number at [start, end) of the story or the ask: "μ = 100",
// "1 every 15 seconds", "probability 0.8", "3 per minute", "P(X ≤ 4)", "at most 12",
// "20 free throws": the number's own words, stopping at a clause break, a little word
// or another number. Returns its span in the text.
function wordsAround(text, start, end) {
  const before = text.slice(0, start), after = text.slice(end)
  // the number's own tail: "%", "-question", "rd"
  const tail = /^(?:%|-[A-Za-z]+|(?:st|nd|rd|th)\b)/.exec(after)?.[0] ?? ''
  const e0 = end + tail.length
  let m
  // inside P(…) or F(…): the whole of it
  if ((m = /\b[PFf]\([^()]*$/.exec(before))) {
    const close = text.indexOf(')', end)
    if (close >= 0 && !/[()]/.test(text.slice(end, close))) return { start: m.index, end: close + 1 }
  }
  // "μ = 100", "σ² = 16", "p = 0.3"
  if ((m = /(?:^|[\s(])(\S{1,3} = )$/.exec(before))) return { start: start - m[1].length, end: e0 }
  // "1 every 15 seconds"
  if ((m = /\b(?:1|one) every $/i.exec(before))) {
    const u = /^ [A-Za-z]+/.exec(text.slice(e0))
    return { start: start - m[0].length, end: e0 + (u ? u[0].length : 0) }
  }
  // "probability 0.8"
  if ((m = /\bprobability $/i.exec(before))) return { start: start - m[0].length, end: e0 }
  // "3 per minute", "6000 per cubic millimeter"
  if ((m = /^ per (?:cubic )?[A-Za-z]+/.exec(text.slice(e0)))) return { start, end: e0 + m[0].length }
  // words before it that say what it is
  const lead = WORK_LEAD.exec(before)
  const s = lead ? start - lead[1].length : start
  // up to 2 words after it
  let e = e0
  const right = text.slice(e0)
  const words = [...right.matchAll(/\s+([^\s.,;:?!()[\]]+)/gy)]
  let taken = 0
  for (const [k, w] of words.entries()) {
    // "0.3 typos per page": the rate's unit too
    if (w[1] === 'per' && words[k + 1]) {
      e = e0 + words[k + 1].index + words[k + 1][0].length
      break
    }
    if (taken === 2 || /\d/.test(w[1]) || WORK_STOP.test(w[1])) break
    e = e0 + w.index + w[0].length
    taken++
    // a word that ends the clause ends the phrase
    if (/^[.,;:?!)\]]/.test(right.slice(w.index + w[0].length))) break
  }
  return { start: s, end: e }
}
// where a number sits in the question's math, in words: "in P(X < 18)", "in f(x)"
function workMathWhere(latex, start) {
  const plain = s => s.replace(/\\le(?:q)?(?![a-z])/g, '≤').replace(/\\ge(?:q)?(?![a-z])/g, '≥').replace(/\\chi\^\{?2\}?/g, 'χ²').replace(/\\(?:left|right|,|;|!)/g, '').replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '').replace(/\s+/g, ' ').replace(/-/g, '−').trim()
  // the P(…) or F(…) it sits in
  for (const m of latex.matchAll(/\b([PF])\(/g)) {
    let d = 0, k = m.index + 1
    for (; k < latex.length; k++) {
      if (latex[k] === '(') d++
      else if (latex[k] === ')' && --d === 0) break
    }
    if (start > m.index && start < k) return 'in ' + plain(latex.slice(m.index, k + 1))
  }
  const before = latex.slice(0, start)
  // "P(χ² > c) = 0.75", a subscript (z_{0.025}), an integral
  let m
  if ((m = /\bP\(((?:[^()]|\([^()]*\))*)\) = $/.exec(before))) return `in ${plain(m[0])} ${latex.slice(start).match(/^-?[\d.]+/)[0]}`
  if ((m = /(?:\\chi\^\{?2\}?|\b[zZ])_\{$/.exec(before))) return `in ${/chi/.test(m[0]) ? 'χ²' : 'z'}_${latex.slice(start).match(/^[\d.]+/)[0]}: the area to its right`
  if (/^\s*\\int/.test(latex)) return 'in the integral'
  if (/^\s*(?:\\begin\{gathered\}\s*)?f\(x\)/.test(latex)) return 'in f(x)'
  if (/^\s*(?:\\begin\{gathered\}\s*)?F\(x\)/.test(latex)) return 'in F(x)'
  if (/\\begin\{array\}/.test(latex)) return 'in the table'
  if (/m_X\(t\)/.test(latex)) return 'in the MGF'
  return 'in the question'
}

// ---------- symbols: which letter a number is ----------
const WORK_GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', lambda: 'λ', mu: 'μ', sigma: 'σ', theta: 'θ' }
const workSymText = s => (s[0] === '\\' ? WORK_GREEK[s.slice(1)] ?? null : s)
// LaTeX as atoms for lining a formula up with the same formula in numbers: \tfrac is
// \frac, \left( is (, spacing is dropped, words are one atom, a number is one atom (with
// its offset), and a bare power or index gets braces (q^x lines up with q^{4})
function workAtoms(src) {
  const out = []
  for (let i = 0; i < src.length; ) {
    const c = src[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '\\') {
      const m = /^\\([a-zA-Z]+|[\s\S]?)/.exec(src.slice(i))
      const name = m[1]
      i += m[0].length
      if (/^(text|textbf|textit|mathrm|operatorname)$/.test(name) && src[i] === '{') {
        const close = matchBrace(src, i)
        out.push('\\text:' + src.slice(i + 1, close).trim())
        i = close + 1
        continue
      }
      if (/^[,;:! ]$/.test(name) || /^(quad|qquad|displaystyle|left|right|big|Big|bigg|Bigg|bigl|bigr|Bigl|Bigr|limits)$/.test(name)) continue
      out.push('\\' + (name === 'tfrac' || name === 'dfrac' ? 'frac' : name))
      continue
    }
    const m = /^\d+(?:\{,\}\d{3})*(?:\.\d+)?/.exec(src.slice(i))
    if (m) {
      out.push({ num: m[0].replace(/\{,\}/g, ''), at: i, end: i + m[0].length })
      i += m[0].length
      continue
    }
    out.push(c === '−' ? '-' : c)
    i++
  }
  for (let k = out.length - 2; k >= 0; k--) if ((out[k] === '^' || out[k] === '_') && out[k + 1] !== '{') out.splice(k + 1, 1, '{', out[k + 1], '}')
  return out
}
const workIsSym = a => typeof a === 'string' && ((/^[a-zA-Z]$/.test(a) && a !== 'e') || (a[0] === '\\' && a.slice(1) in WORK_GREEK))
const workAtomEq = (a, b) => (typeof a === 'string' ? a === b : b?.num != null && +a.num === +b.num)
// Line up a formula in symbols (S) with numbers (N, from atom k0): every atom equal, except
// that a symbol may stand where a number (or a number in brackets) is. Returns the symbols'
// numbers with their offsets in N's source, or null.
function workAlign(S, N, k0 = 0) {
  const got = []
  let k = k0
  for (let i = 0; i < S.length; i++) {
    const s = S[i]
    const n = N[k]
    if (n == null) return null
    if (workAtomEq(s, n)) { k++; continue }
    // (a letter before a bracket is a function, f(x), P(…): it never stands for a number)
    if (!workIsSym(s) || S[i + 1] === '(') return null
    let num = null
    const unary = k === 0 || ['(', '{', '<', '>', '=', ',', '\\le', '\\ge', '\\lt', '\\gt', '\\leq', '\\geq'].includes(N[k - 1])
    if (n.num != null) { num = n; k++ }
    else if (n === '-' && unary && N[k + 1]?.num != null) { num = { num: '-' + N[k + 1].num, at: N[k + 1].at - 1, end: N[k + 1].end }; k += 2 }
    else if (n === '(' && N[k + 1]?.num != null && N[k + 2] === ')') { num = N[k + 1]; k += 3 }
    else return null
    got.push({ sym: s, num: num.num, at: num.at, end: num.end })
    // "λs" lined up with "4 \cdot 0.6": the dot is the product the letters leave out
    if ((N[k] === '\\cdot' || N[k] === '\\times') && workIsSym(S[i + 1])) k++
  }
  // one symbol, one number
  const by = new Map()
  for (const g of got) {
    if (by.has(g.sym) && +by.get(g.sym) !== +g.num) return null
    by.set(g.sym, g.num)
  }
  return got.length ? { list: got, end: k } : null
}
// The ways a formula in symbols lines up with a step in numbers. whole: the step is the
// formula's own next step ("= q^{4}p" then "= (0.9)^{4}(0.1)"), so all of it must line up.
// Otherwise the formula may sit anywhere inside the step, but only a formula with real
// structure (a fraction, brackets, signs) counts: "αβ" would line up with any "1 · 4".
function workAlignInside(symSrc, numSrc, whole = false) {
  const S = workAtoms(symSrc.replace(/^\s*(?:=|\\approx)\s*/, ''))
  if (!S.some(workIsSym) || S.length < 2) return []
  if (!whole) {
    const shape = S.filter(a => !workIsSym(a) && !['{', '}'].includes(a))
    if (shape.length < 2 || !shape.some(a => !['(', ')', '[', ']'].includes(a))) return []
  }
  const lead = /^\s*(?:=|\\approx)\s*/.exec(numSrc)?.[0].length ?? 0
  const N = workAtoms(numSrc.slice(lead)).map(a => (a.num != null ? { ...a, at: a.at + lead, end: a.end + lead } : a))
  if (whole) {
    const got = workAlign(S, N, 0)
    return got && got.end === N.length ? got.list : []
  }
  const out = []
  for (let k = 0; k < N.length; k++) {
    const got = workAlign(S, N, k)
    if (got) out.push(...got.list)
  }
  return out
}
// symbol names said in words: "β = 8", "p = 0.2", "σ² = 16", "z = −1.15"
function workSayings(text) {
  const out = []
  for (const m of (text ?? '').matchAll(/(?<![\p{L}\d])(\p{L})(²)? = ([−-]?\d+(?:\.\d+)?)(?![\d\p{L}]|\.\d)/gu)) out.push({ sym: m[1] + (m[2] ?? ''), num: m[3].replace('−', '-') })
  return out
}

// a number that is the whole bottom of a fraction: \frac{2x - 1}{9}, \tfrac{1}{9}
const workIsBottom = (src, t) => /\\[td]?frac\{(?:[^{}]|\{[^{}]*\})*\}\{$/.test(src.slice(0, t.start)) && src[t.end] === '}'

// ---------- the question's numbers ----------
// Each number the question gives, by its spelling, with every place it is said: the story,
// the ask, or the question's math. A percent is also its decimal ("90%" is 0.9).
function workGroups(p) {
  const groups = new Map()
  const add = (spell, val, occ) => {
    if (!groups.has(spell)) groups.set(spell, { spell, val, occ: [] })
    groups.get(spell).occ.push(occ)
  }
  for (const [field, src] of [['text', p.text], ['ask', p.ask], ['math', p.latex]]) {
    if (!src) continue
    const math = field === 'math'
    const colourable = math ? new Set(numberTokens(src, true).map(t => t.start)) : null
    // the values a discrete X takes (x = 1, 2, 3, 4, or a table's x row) are not parameters
    const support = math ? [...src.matchAll(/\\quad x = (?:-?\d+, )+(?:-?\d+|\\ldots)|\\begin\{array\}\{[^}]*\}\s*x &[^\\]*/g)].map(m => [m.index, m.index + m[0].length]) : []
    for (const t of math ? numberTokens(src, true, true) : numberTokens(src, false)) {
      if (support.some(([a, b]) => t.start >= a && t.start < b)) continue
      // (the 1 of "1 every 15 seconds" only says it is a rate)
      if (!math && /^ every\b/.test(src.slice(t.end)) && t.val === 1) continue
      const spell = t.tok.replace('−', '-')
      // the name it is given right there: "σ² = 36" in the story, "x = 36" in the math
      const before = src.slice(0, t.start)
      const named = math ? /(?:^|[\s{,;])((?:\\[a-z]+|[a-zA-Z])(?:\^\{?2\}?|_\{?\w+\}?)?) = $/.exec(before) : /(?:^|[\s(])(\S{1,2}) = $/.exec(before)
      const name = named ? named[1].replace(/\\([a-z]+)/, (m, w) => WORK_GREEK[w] ?? m).replace(/\^\{?2\}?/, '²') : null
      const occ = { field, start: t.start, end: t.end, name, colourable: math ? colourable.has(t.start) : true, power: math && /\^\{?\s*$/.test(before), bottom: math && workIsBottom(src, t) }
      if (!math && src[t.end] === '%') {
        const v = +(t.val / 100).toFixed(10)
        add(String(v), v, { ...occ, pct: true })
      } else add(spell, t.val, occ)
    }
  }
  return groups
}
// a group is clear when it names one thing: said once in the story and once in the ask
// at most, and once in the math at most (a big whole number may repeat in a formula:
// 1/10 and x/10 are the same β)
function workClearGroup(g) {
  const n = f => g.occ.filter(o => o.field === f).length
  if (n('text') > 1 || n('ask') > 1) return false
  // a number named in one place (σ² = 36) is something else where it has another name
  // (x = 36) or none: two things that happen to be equal
  const names = new Set(g.occ.map(o => o.name ?? ''))
  if (names.size > 1) return false
  if (n('math') <= 1) return true
  return !n('text') && !n('ask') && Number.isInteger(g.val) && Math.abs(g.val) >= 10
}

// ---------- links ----------
// symbols that a "SYM = number" step defines from the question (never c, A or z, which are solved for)
const WORK_DEF_SYM = /(?:^|[,:]|\\[;,]|\\quad|\\text\{[^{}]*\})\s*(\\(?:alpha|beta|gamma|lambda|mu|sigma)|[nNprkstxABq])\s*$/
// an integral's or a bracket's limits are not powers
const WORK_LIMIT = /(?:\\int|\\Big\]|\\big\]|\\right\]|\\Big\||\\sum|\\prod)(?:_\{[^{}]*\}|_[^{\s])\^\{?\s*$/
const workAfter = (a, b) => (a.r !== b.r ? a.r > b.r : a.j !== b.j ? a.j > b.j : a.start > b.start)

// Which numbers in the work came from the question, and where each one lands.
//  · A step that is just "= number" was worked out (a result); the same number later in
//    the work may be that result, so it is never linked after it. "β = 8" or "n = 20"
//    right after the symbol is a definition: the question's number, named.
//  · Never in the answer (unless the answer is a formula), never in \max(…), never in a
//    power (worked out: (0.8)^7's 7 is n − x) unless the question has it as a power too.
//  · 0, 1 and 2 only in a definition (or lined up with the symbol the story names). 3 to 9
//    turn up in sums and coefficients, so only in a definition, a limit, a P(…)/F(…)/f(…)/
//    C(n, k), lined up with a named symbol, or as the only spot of a number the story says.
//  · A number said twice in the story (two roles) is never linked.
function linkWork(p, rows, level) {
  const lastRow = rows.length - 1
  // the answer: the last step of the last row (the whole work, when it is just the answer;
  // the whole row, when it carries on an equation or says the answer in words)
  const isAnswer = (r, j) => r === lastRow && j === rows[r].length - 1 && (rows[r].length > 1 || rows.length === 1 || /^\s*(=|\\approx)/.test(rows[r][0]) || (typeof p.answer === 'string' && rows[r][0].includes(p.answer)))
  const groups = workGroups(p)
  const formulaAnswer = !!p.expr?.vars?.length
  const spellOf = t => t.tok.replace('−', '-')
  // the symbol each number is called (by value), from the strongest evidence to the weakest
  const strongSym = new Map()
  // results and definitions
  const results = [], defs = []
  rows.forEach((row, r) => row.forEach((c, j) => {
    const m = /^\s*(=|\\approx)\s*(-?\d+(?:\{,\}\d{3})*(?:\.\d+)?)(\\ldots)?\s*(?=$|[,:]|\\[;,]|\\quad|\\text)/.exec(c)
    if (!m) return
    const t = numberTokens(c, true)[0]
    if (!t) return
    // (a list, x = 4, 5, 6, …, is the values X takes, not a value given)
    const list = /^\s*=\s*-?[\d.]+\s*,\s*-?\d/.test(c)
    const tail = j > 0 && !list ? WORK_DEF_SYM.exec(rows[r][j - 1]) : null
    const g = groups.get(spellOf(t))
    // "P(X > x) = 0.02" right after a story's "2%" says the same thing in symbols
    const restated = j > 0 && /\bP\([^()]*\)\s*$/.test(rows[r][j - 1]) && g?.occ.some(o => o.pct)
    if ((tail || restated) && m[1] === '=' && !m[3] && g && workClearGroup(g)) {
      defs.push({ r, j, start: t.start })
      if (tail) strongSym.set(String(+t.val), workSymText(tail[1]))
    } else results.push({ r, j, start: t.start, val: t.val })
  }))
  // what the question itself calls its numbers ("μ = 100", "with p = 0.3"); a table's
  // f(x) row names each of its cells: f(2) = 0.35
  for (const src of [p.text, p.ask]) for (const s of workSayings(src)) if (!strongSym.has(String(+s.num))) strongSym.set(String(+s.num), s.sym)
  const arr = /\\begin\{array\}\{[^}]*\}\s*x &(.*?)\\\\\s*\\hline\s*f\(x\) &/.exec(p.latex ?? '')
  if (arr) {
    const xs = arr[1].split('&').map(s => s.trim())
    const from = arr.index + arr[0].length, to = p.latex.indexOf('\\end{array}', from)
    for (const g of groups.values()) for (const o of g.occ) {
      if (o.field !== 'math' || o.start < from || o.start > to) continue
      const cell = (p.latex.slice(from, o.start).match(/&/g) ?? []).length
      if (xs[cell] != null && !strongSym.has(String(+g.val))) strongSym.set(String(+g.val), `f(${xs[cell].replace(/^-/, '−')})`)
    }
  }
  // formulas lined up with their numbers: the rule against the work, and each step
  // against the next ("q^{4}p" then "(0.9)^{4}(0.1)")
  const aligned = new Map() // "r:j:start" → symbol text
  const rule = p.hint?.latex ?? ''
  const ruleParts = rule ? splitTop(rule, (src, i) => (/^(?:=|,|:)|^\\(?:quad|qquad|Rightarrow|to|approx)(?![a-zA-Z])/.exec(src.slice(i)) ?? [''])[0].length).map(s => s.replace(/^(?:=|,|:|\\quad|\\qquad|\\Rightarrow|\\to|\\approx)/, '')) : []
  const alignSyms = new Map()
  const noteAlign = (r, j, list) => {
    for (const a of list) {
      const t = workSymText(a.sym)
      if (!t) continue
      aligned.set(`${r}:${j}:${a.at}`, t)
      const key = String(+a.num)
      alignSyms.set(key, alignSyms.has(key) && alignSyms.get(key) !== t ? null : t)
    }
  }
  rows.forEach((row, r) => row.forEach((c, j) => {
    for (const part of ruleParts) noteAlign(r, j, workAlignInside(part, c))
    if (j > 0) noteAlign(r, j, workAlignInside(row[j - 1], c, true))
  }))
  for (const [k, t] of alignSyms) if (t && !strongSym.has(k)) strongSym.set(k, t)
  // the reasons and the hint, said in words
  for (const s of [...(p.steps ?? []), p.hint?.text ?? ''].flatMap(workSayings)) if (!/^[xtwX]$/.test(s.sym) && !strongSym.has(String(+s.num))) strongSym.set(String(+s.num), s.sym)

  // Once an integral is worked (its antiderivative's bracket) or a derivative taken, the
  // numbers that follow in that chain are worked out (∫ x dx gives 0.5x², not the question's
  // 0.5): there, and inside the bracket or a cases block, only a limit, a P(…)/F(…)/f(…)
  // and the support's bounds can be the question's. A new statement (E[X²] = …) starts fresh.
  const worked = new Set()
  let on = false
  rows.forEach((row, r) => {
    if (!/^\s*(?:=|\\approx)/.test(row[0] ?? '')) on = false
    row.forEach((c, j) => {
      if (on) worked.add(`${r}:${j}`)
      if (/\\Big\[|\\t?frac\{d\}\{d[xtw]\}|\b[Ff]'\(/.test(c)) on = true
    })
  })
  const insideOf = (c, open, close) => {
    const out = []
    for (const m of c.matchAll(open)) {
      const end = c.indexOf(close, m.index)
      out.push([m.index, end < 0 ? c.length : end])
    }
    return out
  }
  // every number in the work that could be the question's
  const cands = []
  rows.forEach((row, r) => row.forEach((c, j) => {
    const brackets = insideOf(c, /\\Big\[/g, '\\Big]')
    const cases = insideOf(c, /\\begin\{cases\}/g, '\\end{cases}')
    const ans = isAnswer(r, j)
    if (ans && !formulaAnswer) return
    // the step after a \max(…) holds its results, not the question's numbers
    if (j > 0 && /\\max\(/.test(row[j - 1])) return
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
      if (skip.some(([a, b]) => t.start >= a && t.start <= b)) continue
      const before = c.slice(0, t.start)
      // a column label is an area or a digit of z, not a number from the question
      // (a row label can be: the χ² table's row is the story's γ)
      if (/\\text\{column \}\s*$/.test(before)) continue
      const def = defs.some(d => d.r === r && d.j === j && d.start === t.start)
      if (!def && results.some(x => x.r === r && x.j === j && x.start === t.start)) continue
      const power = /\^\{?\s*$/.test(before) && !WORK_LIMIT.test(before)
      const limit = WORK_LIMIT.test(before) || /(?:\\int|\\Big\]|\\big\]|\\Big\||\\sum)_\{?\s*$/.test(before)
      // inside P(…), F(…), f(…) or C(n, k): the question's event or value, restated
      // (not Γ(…): its argument is worked out, α = n + 1)
      const call = /\b[PFf]\((?:[^()]*)$/.test(before) || /\\binom\{$/.test(before)
      // a bound of the support or of an event: 0 \le x \le 4, x > 0.6
      const bound = /(?:\\le|\\ge|<|>)\s*$/.test(before) || /^\s*(?:\\le|\\ge|<|>)/.test(c.slice(t.end))
      const inWorked = worked.has(`${r}:${j}`) || brackets.some(([a, b]) => t.start > a && t.start < b) || cases.some(([a, b]) => t.start > a && t.start < b)
      if (inWorked && !limit && !call && !bound) continue
      cands.push({ r, j, ...t, spell: spellOf(t), def, power, limit, call, ans, bottom: workIsBottom(c, t), sym: aligned.get(`${r}:${j}:${t.start}`) ?? null })
    }
  }))
  const groupOf = t => groups.get(t.spell) ?? [...groups.values()].find(g => g.occ.some(o => o.pct) && Math.abs(g.val - t.val) < 1e-12)
  const symFor = v => strongSym.get(String(+v)) ?? null
  // a chip for a number of the question: the words it comes from (the story's or the
  // ask's phrase, else where it sits in the math)
  const makeGiven = g => {
    // the story's words; the ask's when they say something ("within 4 hours", "P(X > 1.5)"),
    // else where it sits in the math ("0.1 ≤ x" in a note says less than "in f(x)")
    const askOcc = g.occ.find(o => o.field === 'ask')
    const askSays = askOcc && (o => {
      const w = wordsAround(p.ask, o.start, o.end)
      return /[A-Za-z]{2,}|\b[PFf]\(/.test(p.ask.slice(w.start, w.end))
    })(askOcc)
    const occ = g.occ.find(o => o.field === 'text') ?? (askSays ? askOcc : null) ?? g.occ.find(o => o.field === 'math') ?? askOcc
    const src = occ.field === 'text' ? p.text : occ.field === 'ask' ? p.ask : p.latex
    const span = occ.field === 'math' ? null : wordsAround(src, occ.start, occ.end)
    return {
      key: g.spell, tok: g.spell, val: g.val, sym: symFor(g.val), occ, occs: g.occ,
      words: span ? { field: occ.field, ...span } : null,
      where: span ? src.slice(span.start, span.end) : workMathWhere(p.latex ?? '', occ.start),
      first: null,
    }
  }

  const givens = []
  const links = []
  for (const g of groups.values()) {
    if (!workClearGroup(g)) continue
    const tiny = Number.isInteger(g.val) && Math.abs(g.val) <= 2
    const small = Number.isInteger(g.val) && Math.abs(g.val) < 10
    const sym = symFor(g.val)
    let spots = cands.filter(t => groupOf(t) === g)
      // after it is worked out as a result, the same number may be that result
      .filter(t => t.def || !results.some(x => Math.abs(x.val - t.val) < 1e-9 && workAfter(t, x)))
      // a power is worked out, unless the question has it as a power too
      .filter(t => !t.power || g.occ.some(o => o.power))
      .filter(t => !t.ans || !small)
    // (μ = 1 lined up with the rule's μ in (x − μ)/σ is the story's μ)
    // (said once only: a 0, 1 or 2 said twice may be two things)
    if (tiny) spots = g.occ.length > 1 && !spots.some(t => t.def) ? [] : spots.filter(t => t.def || (t.sym && t.sym === sym))
    else if (small) {
      // 3 to 9: where its role is plain; or its only spot, when the story (not a formula,
      // whose small numbers turn up again in sums) says it
      // (the bottom of a fraction in both, like f's 9 in \frac{2x - 1}{9} and \tfrac{1}{9}, is the same 9)
      const plain = spots.filter(t => t.def || t.limit || t.call || (t.sym && t.sym === sym) || (t.bottom && g.occ.some(o => o.bottom)))
      spots = plain.length ? plain : spots.length === 1 && g.occ.some(o => o.field !== 'math') ? spots : []
    }
    if (!spots.length) continue
    const giv = { ...makeGiven(g), first: spots[0] }
    givens.push(giv)
    for (const t of spots) links.push({ r: t.r, j: t.j, start: t.start, end: t.end, g: giv })
  }

  // A number the question only implies, 1 − p (q = 1 − p): worked on the side just before
  // its first use, then a chip of its own, as in World 0. Only when 1 − p is exact, never
  // a result already in the work, and p is a clear chance from the question.
  // (the rule or the work calls it q: a q of its own, never the q of \\qquad)
  const saysQ = src => /(?<![a-zA-Z])q(?![a-zA-Z])/.test((src ?? '').replace(/\\[a-zA-Z]+/g, ' '))
  // (a chance said in words, or a 1 − p the work writes out: 0.25 next to a coefficient
  // 0.75 is not a chance)
  const workText = rows.flat().join(' ')
  const formed = g => new RegExp(`(?:^|[^\\d.])1 - \\(?${g.spell.replace('.', '\\.')}(?![\\d])`).test(workText)
  const chances = [...groups.values()].filter(g => workClearGroup(g) && g.val > 0 && g.val < 1 && Math.abs(g.val - 0.5) > 1e-9 && (g.occ.some(o => o.field !== 'math') || formed(g)))
  const derivedBy = new Map()
  for (const t of cands) {
    if (groupOf(t) || (t.ans && !formulaAnswer) || !(t.val > 0 && t.val < 1) || t.power) continue
    if (results.some(x => Math.abs(x.val - t.val) < 1e-9 && !workAfter(x, t))) continue
    const base = chances.find(g => Math.abs(1 - g.val - t.val) < 1e-9)
    if (!base) continue
    if (!derivedBy.has(t.spell)) {
      let from = givens.find(g => g.key === base.spell)
      if (!from) {
        from = { ...makeGiven(base), first: t, viaPiece: true }
        givens.push(from)
      }
      const giv = { key: 'q:' + t.spell, tok: t.spell, val: t.val, sym: symFor(t.val) ?? (saysQ(p.hint?.latex) || saysQ(workOf(p)) ? 'q' : null), derived: from, where: `1 − ${from.tok}`, first: t, occs: [] }
      derivedBy.set(t.spell, giv)
      givens.push(giv)
    }
    links.push({ r: t.r, j: t.j, start: t.start, end: t.end, g: derivedBy.get(t.spell) })
  }

  // in the order the work first uses them; five colours, so five chips at most
  // (the question's own numbers first: they come in first, so they get the first colours)
  givens.sort((a, b) => (!!a.derived !== !!b.derived ? (a.derived ? 1 : -1) : workAfter(a.first, b.first) ? 1 : workAfter(b.first, a.first) ? -1 : 0))
  const kept = givens.slice(0, 5).filter(g => !g.derived || givens.slice(0, 5).includes(g.derived))
  kept.forEach((g, i) => (g.cls = 'pv' + i))
  return {
    givens: kept,
    links: links.filter(l => kept.includes(l.g)),
    isAnswer, results, groups, groupOf, makeGiven, symFor,
    // a chip for a number the work never shows but a table lookup uses (n, p, γ, z)
    extra(spell) {
      const have = kept.find(x => x.key === spell)
      if (have) return have
      const g = groups.get(spell)
      if (!g || !workClearGroup(g) || kept.length >= 5) return null
      const giv = { ...makeGiven(g), first: null, cls: 'pv' + kept.length }
      kept.push(giv)
      return giv
    },
  }
}
