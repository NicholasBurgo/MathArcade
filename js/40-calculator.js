// js/40-calculator.js · calculator: a pop-up for the arithmetic
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- calculator: a pop-up for the arithmetic ----------
// A small parser, not eval: + − × ÷ ^, brackets, x!, C(n, k), √, ln, log, eˣ, π, e,
// Ans and #1, #2, … (the tape's answers). 2(3), 2π and 3e^(−1) read as times, and an
// unclosed bracket closes itself.
function calcEval(src, ans, refs = []) {
  const s = src.replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, ' pi ').replace(/√/g, ' sqrt ')
  const toks = []
  const re = /\s*(?:(\d+(?:\.\d*)?|\.\d+)|([A-Za-z]+)|(\S))/y
  let m
  while (re.lastIndex < s.length && (m = re.exec(s))) {
    if (m[1] !== undefined) toks.push({ n: parseFloat(m[1]) })
    else if (m[2] !== undefined) toks.push({ id: m[2].toLowerCase() })
    else if (m[3] !== undefined) toks.push({ c: m[3] })
    else break
  }
  let i = 0
  const peek = () => toks[i]
  const isChar = c => peek()?.c === c
  const startsValue = t => t && (t.n !== undefined || t.id !== undefined || t.c === '(' || t.c === '#')
  const fact = n => {
    if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error('x! needs a whole number from 0 to 170')
    let f = 1
    for (let k = 2; k <= n; k++) f *= k
    return f
  }
  const choose = (n, k) => {
    if (![n, k].every(Number.isInteger) || k < 0 || n < 0 || k > n) throw new Error('C(n, k) needs whole numbers with 0 ≤ k ≤ n')
    let c = 1
    for (let j = 1; j <= Math.min(k, n - k); j++) c = (c * (n - j + 1)) / j
    return Math.round(c)
  }
  const closeBracket = () => {
    if (isChar(')')) i++
    else if (i < toks.length) throw new Error('Check the brackets')
  }
  const FUN = { sqrt: Math.sqrt, ln: Math.log, log: Math.log10, exp: Math.exp, abs: Math.abs }
  function expr() {
    let v = term()
    while (isChar('+') || isChar('-')) {
      const op = toks[i++].c
      const w = term()
      v = op === '+' ? v + w : v - w
    }
    return v
  }
  function term() {
    let v = unary()
    for (;;) {
      if (isChar('*') || isChar('/')) {
        const op = toks[i++].c
        const w = unary()
        v = op === '*' ? v * w : v / w
      } else if (startsValue(peek())) v *= power()
      else return v
    }
  }
  function unary() {
    if (isChar('-')) {
      i++
      return -unary()
    }
    if (isChar('+')) {
      i++
      return unary()
    }
    return power()
  }
  function power() {
    const b = postfix()
    if (isChar('^')) {
      i++
      return b ** unary()
    }
    return b
  }
  function postfix() {
    let v = primary()
    while (isChar('!')) {
      i++
      v = fact(v)
    }
    return v
  }
  function primary() {
    const t = toks[i++]
    if (!t) throw new Error('Unfinished')
    if (t.n !== undefined) return t.n
    if (t.c === '(') {
      const v = expr()
      closeBracket()
      return v
    }
    if (t.c === '#') {
      const n = toks[i++]
      if (n?.n === undefined) throw new Error('Write #1, #2, … for a line’s answer')
      if (refs[n.n - 1] === undefined) throw new Error(`There’s no line #${n.n} yet`)
      return refs[n.n - 1]
    }
    if (t.id === 'pi') return Math.PI
    if (t.id === 'e') return Math.E
    if (t.id === 'ans') return ans
    if (t.id === 'c' || t.id === 'ncr') {
      if (!isChar('(')) throw new Error('Write C(n, k)')
      i++
      const n = expr()
      if (!isChar(',')) throw new Error('Write C(n, k)')
      i++
      const k = expr()
      closeBracket()
      return choose(n, k)
    }
    if (FUN[t.id]) {
      // a bracket after it, or just the next number: √16, ln 2
      if (isChar('(')) {
        i++
        const v = expr()
        closeBracket()
        return FUN[t.id](v)
      }
      return FUN[t.id](postfix())
    }
    throw new Error(t.id ? `Unknown: ${t.id}` : `Unexpected ${t.c}`)
  }
  if (!toks.length) throw new Error('Unfinished')
  const v = expr()
  if (i < toks.length) throw new Error(`Unexpected ${toks[i].c ?? toks[i].id ?? toks[i].n}`)
  if (!Number.isFinite(v)) throw new Error('Not a number (dividing by 0?)')
  return v
}
const calcFmt = v => (v !== 0 && (Math.abs(v) >= 1e12 || Math.abs(v) < 1e-6) ? v.toExponential(6).replace(/\.?0+e/, 'e') : String(parseFloat(v.toPrecision(10))))

const calc = document.getElementById('calc')
const calcBtn = document.getElementById('open-calc')
const CALC_POS = 'math3800-arcade.calc'
let calcAns = 0
// the tape: every line worked so far, oldest first; #1, #2, … in a line use their answers
const calcTape = []
{
  const head = h('div', 'calc-head')
  const clearAll = h('button', 'calc-clear', 'Clear all')
  clearAll.type = 'button'
  const close = h('button', 'calc-x', '×')
  close.type = 'button'
  close.setAttribute('aria-label', 'Close the calculator')
  head.append(h('b', '', 'Calculator'), clearAll, close)
  const tape = h('div', 'calc-tape')
  // the line being typed: its number, the expression, its answer as you type
  const now = h('div', 'calc-line now')
  const num = h('span', 'calc-n', '#1')
  const inp = h('input', 'calc-in')
  inp.type = 'text'
  // the keypad types; a tablet's own keyboard would cover the question
  inp.setAttribute('inputmode', 'none')
  inp.autocomplete = 'off'
  inp.spellcheck = false
  inp.setAttribute('aria-label', 'Expression')
  inp.placeholder = 'e.g. C(10,7)0.9^7 0.1^3, then ='
  const out = h('span', 'calc-out')
  out.setAttribute('aria-live', 'polite')
  now.append(num, inp, out)
  const msg = h('div', 'calc-msg')
  const answers = () => calcTape.map(x => x.v)
  const live = () => {
    msg.textContent = ''
    try {
      out.textContent = inp.value.trim() ? '= ' + calcFmt(calcEval(inp.value, calcAns, answers())) : ''
    } catch {
      out.textContent = ''
    }
  }
  const put = text => {
    inp.value = text
    inp.focus({ preventScroll: true })
    inp.setSelectionRange(text.length, text.length)
    live()
  }
  const insert = text => {
    const a = inp.selectionStart ?? inp.value.length
    const b = inp.selectionEnd ?? a
    inp.value = inp.value.slice(0, a) + text + inp.value.slice(b)
    inp.focus({ preventScroll: true })
    inp.setSelectionRange(a + text.length, a + text.length)
    live()
  }
  const back = () => {
    const a = inp.selectionStart ?? inp.value.length
    const b = inp.selectionEnd ?? a
    const from = a === b ? Math.max(0, a - 1) : a
    inp.value = inp.value.slice(0, from) + inp.value.slice(b)
    inp.focus({ preventScroll: true })
    inp.setSelectionRange(from, from)
    live()
  }
  // each worked line: tap its expression to put it back and change it, tap its answer to use it (#n)
  const renderTape = () => {
    tape.replaceChildren(...calcTape.map((x, i) => {
      const line = h('div', 'calc-line')
      const src = h('button', 'calc-src', x.src)
      src.type = 'button'
      src.title = 'Put this line back in, to change it'
      src.addEventListener('click', () => put(x.src))
      const val = h('button', 'calc-val', '= ' + calcFmt(x.v))
      val.type = 'button'
      val.title = `Use this answer in the line you’re typing (#${i + 1})`
      val.addEventListener('click', () => insert(`#${i + 1}`))
      line.append(h('span', 'calc-n', `#${i + 1}`), src, val)
      return line
    }))
    tape.hidden = !calcTape.length
    num.textContent = `#${calcTape.length + 1}`
    tape.scrollTop = tape.scrollHeight
  }
  // = works the line, keeps it on the tape, and starts a fresh one
  const equals = () => {
    const src = inp.value.trim()
    if (!src) return
    try {
      const v = calcEval(src, calcAns, answers())
      calcAns = v
      calcTape.push({ src, v })
      put('')
      renderTape()
    } catch (err) {
      msg.textContent = err.message
    }
  }
  // Σ all: a line that adds every answer on the tape (the terms of an "at most")
  const addAll = () => {
    if (calcTape.length) put(calcTape.map((_, i) => `#${i + 1}`).join(' + '))
  }
  clearAll.addEventListener('click', () => {
    calcTape.length = 0
    renderTape()
    put('')
  })
  const KEYS = [
    ['C(n,k)', 'C(', 'fn'], ['x!', '!', 'fn'], ['xʸ', '^', 'op'], ['(', '(', 'op'], [')', ')', 'op'], ['⌫', back, 'op'], ['AC', () => put(''), 'op'],
    ['7', '7'], ['8', '8'], ['9', '9'], ['÷', '÷', 'op'], ['√', '√(', 'fn'], ['eˣ', 'e^(', 'fn'], ['ln', 'ln(', 'fn'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['×', '×', 'op'], ['e', 'e', 'fn'], ['π', 'π', 'fn'], ['1 −', '1−', 'fn'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['−', '−', 'op'], [',', ',', 'op'], ['Ans', 'Ans', 'fn'], ['Σ all', addAll, 'fn'],
    ['0', '0'], ['.', '.'], ['+', '+', 'op'], ['=', equals, 'eq'],
  ]
  const keys = h('div', 'calc-keys')
  for (const [label, act, cls] of KEYS) {
    const b = h('button', cls ?? '', label)
    b.type = 'button'
    b.addEventListener('click', () => (typeof act === 'function' ? act() : insert(act)))
    keys.append(b)
  }
  inp.addEventListener('input', live)
  inp.addEventListener('keydown', e => {
    // keys typed here are the calculator's, not the page's shortcuts
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      equals()
    } else if (e.key === 'ArrowUp' && calcTape.length) {
      e.preventDefault()
      put(calcTape[calcTape.length - 1].src)
    } else if (e.key === 'Escape') showCalc(false)
  })
  renderTape()
  calc.append(head, tape, now, msg, keys)

  // drag it by its title bar, out of the question's way; it stays where it was left
  const place = (x, y) => {
    const r = calc.getBoundingClientRect()
    x = Math.max(4, Math.min(innerWidth - r.width - 4, x))
    y = Math.max(4, Math.min(innerHeight - r.height - 4, y))
    Object.assign(calc.style, { left: x + 'px', top: y + 'px', right: 'auto', bottom: 'auto' })
    return { x, y }
  }
  let drag = null
  head.addEventListener('pointerdown', e => {
    if (e.target === close || e.target === clearAll) return
    const r = calc.getBoundingClientRect()
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }
    try { head.setPointerCapture(e.pointerId) } catch {}
    e.preventDefault()
  })
  head.addEventListener('pointermove', e => {
    if (drag) place(e.clientX - drag.dx, e.clientY - drag.dy)
  })
  const drop = () => {
    if (!drag) return
    drag = null
    const r = calc.getBoundingClientRect()
    try { localStorage.setItem(CALC_POS, JSON.stringify({ x: r.left, y: r.top })) } catch {}
  }
  head.addEventListener('pointerup', drop)
  head.addEventListener('pointercancel', drop)
  // turning the tablet can leave it off the edge: bring it back in
  addEventListener('resize', () => {
    if (calc.hidden || !calc.style.left) return
    const r = calc.getBoundingClientRect()
    place(r.left, r.top)
  })

  function showCalc(on) {
    calc.hidden = !on
    calcBtn.setAttribute('aria-pressed', String(on))
    if (!on) return
    try {
      const at = JSON.parse(localStorage.getItem(CALC_POS))
      if (at) place(at.x, at.y)
    } catch {}
    inp.focus({ preventScroll: true })
  }
  close.addEventListener('click', () => showCalc(false))
  calcBtn.addEventListener('click', () => showCalc(calc.hidden))
}
