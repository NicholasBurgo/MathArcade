// js/20-pieces.js · the pieces: what you work out inside a formula
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the pieces: what you work out inside a formula ----------
const prod = (lo, hi) => {
  let r = 1
  for (let i = lo; i <= hi; i++) r *= i
  return r
}
// C(n, k) by hand: n!/(k!(n − k)!), the bigger factorial cancels, multiply out the rest
function chooseWork(n, k) {
  const small = Math.min(k, n - k), big = n - small, C = choose(n, k)
  const top = Array.from({ length: small }, (_, i) => n - i)
  const line = { order: [], label: `How to get C(${n}, ${k})`, tex: () => `\\binom{${n}}{${k}} = \\frac{${n}!}{${k}!\\,${n - k}!}` }
  if (small === 0) return { ...line, steps: () => ['= 1'], tail: () => '\\quad (0! = 1)' }
  const cancel = `\\frac{${top.join(' \\cdot ')} \\cdot \\cancel{${big}!}}{${small}! \\cdot \\cancel{${big}!}}`
  if (small === 1) return { ...line, steps: () => [`= ${cancel}`, `= ${n}`] }
  if (small > 6) return { ...line, steps: () => [`= \\frac{${n} \\cdot ${n - 1} \\cdots ${big + 1}}{${small}!}`, `= ${num(C)}`], tail: () => '\\quad \\text{(nCr on a calculator)}' }
  const bottom = Array.from({ length: small }, (_, i) => small - i)
  return { ...line, steps: () => [`= ${cancel}`, `= \\frac{${top.join(' \\cdot ')}}{${bottom.join(' \\cdot ')}}`, `= \\frac{${num(prod(big + 1, n))}}{${num(fact(small))}}`, `= ${num(C)}`] }
}
// x! written out
function factWork(x) {
  const out = x <= 6 ? Array.from({ length: x }, (_, i) => x - i).join(' \\cdot ') : `${x} \\cdot ${x - 1} \\cdots 2 \\cdot 1`
  if (x <= 1) return { order: [], label: `How to get ${x}!`, tex: () => `${x}! = 1`, tail: () => (x === 0 ? '\\quad (0! = 1 \\text{ by definition})' : '') }
  return { order: [], label: `How to get ${x}!`, tex: () => `${x}! = ${out}`, steps: () => [`= ${num(fact(x))}`] }
}
// calculator punches, one per row: [left side, value]
const calcPiece = (items, label = 'On the calculator') => {
  if (!items.length) return null
  const rows = items.map(([l, x]) => `${l} &${rel(exact(x, 5))} ${num(x, 5)}`)
  return { order: [], label, plain: true, tex: () => rows[0].replace('&', ''), steps: () => rows.slice(1) }
}
// the powers worth a line ([base tex, base, exponent]; ^0 and ^1 need no work)
const powPiece = list => calcPiece(list.filter(([, , e]) => e >= 2).map(([t, b, e]) => [`${base(t)}^{${e}}`, b ** e]))

// each line: a formula with slots (s(key) is the symbol, or the number once it is
// plugged in; mode 1 wraps a non-whole number in brackets, mode 2 any number), the
// order the numbers go in, rows of work under it; then the pieces worked on the
// side (pieces), and the rows that finish it with them (finish)
const PLUG = {
  binomial: [{ order: ['n', 'p', 'q', 'x'], tex: s => `f(${s('x')}) = \\binom{${s('n')}}{${s('x')}}${s('p', 1)}^{${s('x')}}${s('q', 1)}^{${s('n')}-${s('x')}}`,
    steps: (v, T) => [`= \\binom{${v.n}}{${v.x}}${base(T.p)}^{${v.x}}${base(T.q)}^{${v.n - v.x}}`],
    pieces: (v, T) => [chooseWork(v.n, v.x), powPiece([[T.p, v.p, v.x], [T.q, v.q, v.n - v.x]])],
    finish: v => {
      const C = choose(v.n, v.x), A = v.p ** v.x, B = v.q ** (v.n - v.x), f = C * A * B
      return { lhs: `f(${v.x})`, steps: () => [`${rel(exact(A, 5) && exact(B, 5))} ${num(C)} \\cdot ${num(A, 5)} \\cdot ${num(B, 5)}`, `${rel(exact(f))} ${num(f)}`] }
    } }],
  geometric: [{ order: ['p', 'q', 'x'], tex: s => `f(${s('x')}) = ${s('q', 1)}^{${s('x')}-1}${s('p', 2)}`,
    steps: (v, T) => [`= ${base(T.q)}^{${v.x - 1}}${base(T.p)}`],
    pieces: (v, T) => [powPiece([[T.q, v.q, v.x - 1]])],
    finish: (v, T) => {
      const Q = v.q ** (v.x - 1), f = Q * v.p, pFrac = /frac/.test(T.p)
      return { lhs: `f(${v.x})`, steps: () => [`${rel(exact(Q, 5) && (pFrac || exact(v.p, 5)))} ${num(Q, 5)} \\cdot ${factor(v.p, T.p)}`, `${rel(exact(f))} ${num(f)}`] }
    } }],
  negbin: [{ order: ['r', 'p', 'q', 'x'], tex: s => `f(${s('x')}) = \\binom{${s('x')}-1}{${s('r')}-1}${s('p', 1)}^{${s('r')}}${s('q', 1)}^{${s('x')}-${s('r')}}`,
    steps: (v, T) => [`= \\binom{${v.x - 1}}{${v.r - 1}}${base(T.p)}^{${v.r}}${base(T.q)}^{${v.x - v.r}}`],
    pieces: (v, T) => [chooseWork(v.x - 1, v.r - 1), powPiece([[T.p, v.p, v.r], [T.q, v.q, v.x - v.r]])],
    finish: v => {
      const C = choose(v.x - 1, v.r - 1), P = v.p ** v.r, Q = v.q ** (v.x - v.r), f = C * P * Q
      return { lhs: `f(${v.x})`, steps: () => [`${rel(exact(P, 5) && exact(Q, 5))} ${num(C)} \\cdot ${num(P, 5)} \\cdot ${num(Q, 5)}`, `${rel(exact(f))} ${num(f)}`] }
    } }],
  hyper: [{ order: ['N', 'r', 'n', 'x'], tex: s => `f(${s('x')}) = \\frac{\\binom{${s('r')}}{${s('x')}}\\binom{${s('N')}-${s('r')}}{${s('n')}-${s('x')}}}{\\binom{${s('N')}}{${s('n')}}}`,
    steps: v => [`= \\frac{\\binom{${v.r}}{${v.x}}\\binom{${v.N - v.r}}{${v.n - v.x}}}{\\binom{${v.N}}{${v.n}}}`],
    pieces: v => [chooseWork(v.r, v.x), chooseWork(v.N - v.r, v.n - v.x), chooseWork(v.N, v.n)],
    finish: v => {
      const C1 = choose(v.r, v.x), C2 = choose(v.N - v.r, v.n - v.x), C3 = choose(v.N, v.n), f = (C1 * C2) / C3
      return { lhs: `f(${v.x})`, steps: () => [`= \\frac{${num(C1)} \\cdot ${num(C2)}}{${num(C3)}}`, `${rel(exact(C1 * C2) && exact(C3))} \\frac{${num(C1 * C2)}}{${num(C3)}}`, `${rel(exact(f))} ${num(f)}`] }
    } }],
  poisson: [
    { mid: true, order: ['lam', 's'], tex: s => `${s('k')} = ${s('lam')}${s('s', 2)}`,
      steps: (v, T) => (/\{60\}/.test(T.s) ? [`= \\frac{${Math.round(v.lam * v.s * 60)}}{60}`, `= ${fmt(v.k)}`] : [`= ${fmt(v.k)}`]) },
    { order: ['k', 'x'], tex: s => `f(${s('x')}) = \\frac{e^{-${s('k')}}${s('k', 1)}^{${s('x')}}}{${s('x')}!}`,
      pieces: (v, T) => [calcPiece([[`e^{-${T.k}}`, Math.exp(-v.k)], ...(v.x >= 2 ? [[`${base(T.k)}^{${v.x}}`, v.k ** v.x]] : [])]), factWork(v.x)],
      finish: v => {
        const E = Math.exp(-v.k), K = v.k ** v.x, F = fact(v.x), f = (E * K) / F
        return { lhs: `f(${v.x})`, steps: () => [`${rel(exact(E, 5) && exact(K, 5))} \\frac{${num(E, 5)} \\cdot ${num(K, 5)}}{${num(F)}}`, `${rel(exact(f))} ${num(f)}`] }
      } },
  ],
  uniform: [{ order: ['A', 'B'], tex: s => `f(x) = \\frac{1}{${s('B')} - ${s('A')}}`,
    steps: v => [`= \\frac{1}{${fmt(v.B - v.A)}}`, `${rel(exact(1 / (v.B - v.A)))} ${num(1 / (v.B - v.A))}`], tail: v => `\\quad \\text{for } ${v.A} \\le x \\le ${v.B}` }],
  exponential: [
    // the sheet's form first: β = 1/λ turns it into the rate's form
    { order: ['lam'], tex: s => `f(x) = \\tfrac{1}{\\beta}e^{-x/\\beta} = ${s('lam')}e^{-${s('lam')}x}`, tail: () => '\\quad \\text{for } x > 0,\\ \\beta = \\tfrac{1}{\\lambda}' },
    { order: ['lam', 't'], tex: s => `P[X > ${s('t')}] = e^{-${s('lam')}${s('t', 2)}}`,
      steps: (v, T) => {
        const P = v.lam * v.t, f = Math.exp(-P)
        // λ = 1/m with a whole t: keep the exponent exact as t/m
        const m = /^\\tfrac\{1\}\{(\d+)\}$/.exec(T.lam)
        const ex = m && Number.isInteger(v.t) && !exact(P) ? `= e^{-\\tfrac{${v.t}}{${m[1]}}}` : `${rel(exact(P))} e^{-${num(P)}}`
        return [ex, `${rel(exact(f))} ${num(f)}`]
      } },
  ],
  gamma: [{ order: ['al', 'be'], tex: s => `f(x) = \\frac{x^{${s('al')}-1}e^{-x/${s('be', 1)}}}{\\Gamma(${s('al')})\\,${s('be', 1)}^{${s('al')}}}`,
    pieces: (v, T) => {
      const a = v.al, rate = Math.round(1 / v.be), frac1 = /frac/.test(T.be)
      const gam = { order: [], label: `How to get Γ(${a})`, tex: () => `\\Gamma(${a}) = (${a} - 1)!`,
        steps: () => [`= ${a - 1}!`, ...(a - 1 >= 2 ? [`= ${Array.from({ length: a - 1 }, (_, i) => a - 1 - i).join(' \\cdot ')}`] : []), `= ${fact(a - 1)}`] }
      const pow = frac1
        ? { order: [], label: 'The power', tex: () => `\\left(\\tfrac{1}{${rate}}\\right)^{${a}} = \\frac{1}{${rate}^{${a}}}`, steps: () => [`= \\frac{1}{${num(rate ** a)}}`] }
        : { order: [], label: 'The power', tex: () => `${T.be}^{${a}} = ${num(v.be ** a)}` }
      const flip = frac1 ? { order: [], label: 'Dividing by a fraction flips it', tex: () => `\\frac{x}{\\tfrac{1}{${rate}}} = ${rate}x` } : null
      return [gam, pow, flip]
    },
    finish: (v, T) => {
      const a = v.al, den = fact(a - 1)
      if (/frac/.test(T.be)) {
        const l = Math.round(1 / v.be), top = l ** a, g = gcd(top, den)
        const coef = den / g === 1 ? `${num(top / g)}` : `\\frac{${num(top / g)}}{${den / g}}`
        return { lhs: 'f(x)', steps: () => [`= \\frac{${xpow(a - 1)}e^{-${l}x}}{${den} \\cdot \\frac{1}{${num(top)}}}`, `= ${coef}${xpow(a - 1)}e^{-${l}x}`], tail: () => '\\quad \\text{for } x > 0' }
      }
      const b = v.be, all = den * b ** a
      return { lhs: 'f(x)', steps: () => [`= \\frac{${xpow(a - 1)}e^{-x/${b}}}{${den} \\cdot ${num(b ** a)}}`, `= \\frac{1}{${num(all)}}${xpow(a - 1)}e^{-x/${b}}`], tail: () => '\\quad \\text{for } x > 0' }
    } }],
  chi: [
    { mid: true, order: ['ga'], tex: s => `\\alpha = \\frac{${s('ga')}}{2}`, steps: v => [`= ${fmt(v.ga / 2)}`] },
    { order: [], tex: () => '\\beta = 2' },
    // when the story asks for a value from the table: a right area r is column 1 − r
    { when: v => 'ra' in v, mid: true, order: ['ra'], tex: s => `\\text{column} = 1 - ${s('ra')}`, steps: v => [`= ${fmt(1 - v.ra)}`] },
    { when: v => 'ra' in v, order: ['ga'], tex: (s, v) => `c = \\text{row } ${s('ga')},\\ \\text{column } ${fmt(1 - v.ra)}`, steps: v => [`= ${chiEntry(v.ga, 1 - v.ra)}`],
      look: v => ({ name: 'chi2', row: String(v.ga), col: fmt(1 - v.ra) }) },
  ],
  normal: [
    { order: ['mu', 'sig'], tex: s => `f(x) = \\frac{1}{\\sqrt{2\\pi}\\,${s('sig', 1)}}e^{-(x-${s('mu')})^2/2${s('sig', 2)}^2}`,
      pieces: (v, T) => [calcPiece([[`\\sqrt{2\\pi}\\,\\left(${T.sig}\\right)`, v.sig * Math.sqrt(2 * Math.PI)], [`2\\left(${T.sig}\\right)^2`, 2 * v.sig ** 2]])],
      finish: (v, T) => ({ lhs: 'f(x)', mid: true, steps: () => [`\\approx \\frac{1}{${num(v.sig * Math.sqrt(2 * Math.PI))}}e^{-(x-${T.mu})^2/${num(2 * v.sig ** 2)}}`] }) },
    { mid: true, order: ['x', 'mu', 'sig'], tex: s => `z = \\frac{${s('x')} - ${s('mu')}}{${s('sig')}}`,
      steps: (v, T) => {
        const z = (v.x - v.mu) / v.sig, z2 = +z.toFixed(2)
        return [`= \\frac{${fmt(v.x - v.mu)}}{${T.sig}}`, `${rel(Math.abs(z2 - z) < 1e-12)} ${z2.toFixed(2)}`]
      } },
    // then the table: round z to 2 decimals, and the entry is the area to its left
    { order: [], label: 'Then the table', answer: true, tex: (s, v) => {
        const z = (v.x - v.mu) / v.sig, z2 = +z.toFixed(2)
        return `P[X < ${fmt(v.x)}] ${rel(Math.abs(z2 - z) < 1e-12)} P[Z < ${z2.toFixed(2)}]`
      },
      steps: v => [`= ${normEntry(+((v.x - v.mu) / v.sig).toFixed(2))}`],
      look: v => ({ name: 'normal', ...zCell(+((v.x - v.mu) / v.sig).toFixed(2)) }) },
  ],
}
