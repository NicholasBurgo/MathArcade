// js/27-read-pdf-mgf.js · reading a pdf or an MGF: which distribution, and its numbers
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- reading a pdf or an MGF: which distribution, and its numbers ----------
// Each shape: its general form with the parameters coloured, an example in the same
// colours, how to read each number, and what it is (special cases included).
const shp = (k, body) => `\\class{pv${k}}{${body}}`
const SHAPES = [
  { kind: 'MGF', leaf: 'normal', general: `m(t) = e^{${shp(0, '\\mu')}t + ${shp(1, '\\sigma^2/2')}\\,t^2}`, example: `m(t) = e^{${shp(0, '3')}t + ${shp(1, '8')}t^2}`,
    notes: [[0, 'the number times t is μ: μ = 3'], [1, 'the number times t² is σ²/2: σ² = 2(8) = 16, so σ = 4']], verdict: 'normal, μ = 3, σ = 4' },
  { kind: 'MGF', leaf: 'gamma', general: `m(t) = (1 - ${shp(0, '\\beta')}t)^{-${shp(1, '\\alpha')}}`, example: `m(t) = (1 - ${shp(0, '3')}t)^{-${shp(1, '4')}}`,
    notes: [[0, 'the number times t is β: β = 3'], [1, 'the power, without its minus, is α: α = 4']], verdict: 'gamma, α = 4, β = 3. If β = 2 it is chi-squared (γ = 2α); if α = 1 it is exponential' },
  { kind: 'MGF', leaf: 'chi', general: `m(t) = (1 - 2t)^{-${shp(0, '\\gamma/2')}}`, example: `m(t) = (1 - 2t)^{-${shp(0, '5')}}`,
    notes: [[0, 'β is 2, so it is chi-squared; the power is γ/2 = 5, so γ = 10']], verdict: 'chi-squared, γ = 10' },
  { kind: 'MGF', leaf: 'exponential', general: `m(t) = \\frac{1}{1 - ${shp(0, '\\beta')}t}`, example: `m(t) = \\frac{1}{1 - ${shp(0, '4')}t}`,
    notes: [[0, 'the power is −1 (α = 1), and the number times t is β = 4, so λ = 1/4']], verdict: 'exponential, β = 4, λ = 1/4' },
  { kind: 'MGF', leaf: 'geometric', general: `m(t) = \\frac{${shp(0, 'p')}e^t}{1 - ${shp(1, 'q')}e^t}`, example: `m(t) = \\frac{${shp(0, '0.3')}e^t}{1 - ${shp(1, '0.7')}e^t}`,
    notes: [[0, 'the number on top, times eᵗ, is p = 0.3'], [1, 'the number subtracted below is q = 0.7 (and p + q = 1)']], verdict: 'geometric, p = 0.3' },
  { kind: 'pdf', leaf: 'uniform', general: `f(x) = \\frac{1}{${shp(1, 'B')} - ${shp(0, 'A')}},\\ ${shp(0, 'A')} \\le x \\le ${shp(1, 'B')}`, example: `f(x) = \\frac{1}{8},\\ ${shp(0, '2')} \\le x \\le ${shp(1, '10')}`,
    notes: [[0, 'a constant, from A = 2'], [1, 'to B = 10; the height is 1/(10 − 2) = 1/8']], verdict: 'uniform, A = 2, B = 10' },
  // as the formula sheet prints it (4.2 #17 hands you this one)
  { kind: 'pdf', leaf: 'exponential', general: `f(x) = \\frac{1}{${shp(0, '\\beta')}}e^{-x/${shp(0, '\\beta')}},\\ x > 0`, example: `f(x) = \\frac{1}{${shp(0, '10')}}e^{-x/${shp(0, '10')}},\\ x > 0`,
    notes: [[0, '1 over β in front, x over β in the exponent: β = 10, the mean. The rate is λ = 1/β = 1/10; written with λ it is λe^(−λx)']], verdict: 'exponential, β = 10, λ = 1/10 (a gamma with α = 1)' },
  { kind: 'pdf', leaf: 'gamma', general: `f(x) = \\frac{x^{${shp(0, '\\alpha')}-1}e^{-x/${shp(1, '\\beta')}}}{\\Gamma(\\alpha)\\beta^{\\alpha}}`, example: `f(x) = \\frac{1}{16}\\,x^{${shp(0, '1')}}e^{-x/${shp(1, '4')}},\\ x > 0`,
    notes: [[0, 'the power of x is α − 1 = 1, so α = 2'], [1, 'x is divided by β = 4 in the exponent (check: Γ(2)·4² = 16)']], verdict: 'gamma, α = 2, β = 4. With β = 2 it would be chi-squared' },
  { kind: 'pdf', leaf: 'normal', general: `f(x) = \\frac{1}{\\sqrt{2\\pi}\\,${shp(1, '\\sigma')}}e^{-(x - ${shp(0, '\\mu')})^2/(2${shp(1, '\\sigma')}^2)}`, example: `f(x) = \\frac{1}{\\sqrt{2\\pi}\\,${shp(1, '5')}}e^{-(x - ${shp(0, '70')})^2/50}`,
    notes: [[0, 'x minus μ is squared in the exponent: μ = 70'], [1, 'σ = 5 in front; below, 2σ² = 2(25) = 50']], verdict: 'normal, μ = 70, σ = 5' },
]
function shapeGuide(kind) {
  const wrap = h('section', 'shapes')
  wrap.append(h('h3', 'shapes-title', kind === 'MGF' ? 'Given an MGF? Read its shape' : 'Given a pdf instead of a story? Read its shape'),
    h('p', 'paper-note', 'Match the formula to a shape below. The colours show where each number sits in the shape, and what it is.'))
  const play = h('button', 'btn ghost', '▶ Play the shapes')
  play.type = 'button'
  const list = h('div', 'shape-list')
  const cards = SHAPES.filter(sh => sh.kind === kind).map(sh => {
    const card = h('div', 'shape-card')
    const top = h('div', 'shape-top')
    top.append(h('b', '', LEAVES[sh.leaf].name), h('span', '', sh.kind))
    const row = (label, latex) => {
      const r = h('div', 'shape-row')
      r.append(h('span', '', label), tex(latex))
      return r
    }
    const parts = [...sh.notes.map(([k, t]) => h('p', `read-note pv${k}`, t)), h('p', 'read-shape', '→ ' + sh.verdict)]
    card.append(top, row('Shape', sh.general), row('Example', sh.example), ...parts)
    // (the normal's MGF is given in the notes, never derived: no build for it)
    const from = { gamma: 'gamma', chi: 'chi', exponential: 'expB', geometric: 'geo' }[sh.leaf]
    if (sh.kind === 'MGF' && from) {
      const b = h('button', 'tool', 'Where it comes from')
      b.type = 'button'
      b.addEventListener('click', () => {
        card.classList.add('open')
        b.replaceWith(mgfPlayer(BUILDS[from](), { auto: true }))
      })
      card.append(b)
    }
    list.append(card)
    return { card, parts }
  })
  let run = 0
  play.addEventListener('click', async () => {
    const me = ++run
    const alive = () => me === run && wrap.isConnected
    for (const c of cards) for (const x of c.parts) x.hidden = true
    for (const c of cards) {
      if (!alive()) return
      for (const x of cards) x.card.classList.remove('lit')
      c.card.classList.add('lit')
      c.card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
      await wait(reduced() ? 0 : 800)
      for (const x of c.parts) {
        if (!alive()) return
        x.hidden = false
        x.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300 })
        tone(semis(523.25, 7), 0, 0.08, 'sine', 0.06)
        await wait(reduced() ? 0 : 1500)
      }
      await wait(reduced() ? 0 : 700)
    }
    for (const x of cards) x.card.classList.remove('lit')
  })
  wrap.append(play, list)
  return wrap
}
// the formula a question gives, its numbers coloured and read off one by one
function readBlock(p, color) {
  const r = p.read
  const cw = (k, body) => `\\class{${color[k] ?? 'pv0'}}{${body}}`
  const el = h('div', 'read-block')
  const parts = [...r.notes.map(([k, text]) => h('p', 'read-note ' + (color[k] ?? 'pv0'), text)), h('p', 'read-shape', '→ ' + r.shape)]
  el.append(h('div', 'piece-label', `Read the ${r.kind}`), tex(r.tex(cw)), ...parts)
  return {
    el,
    async play(alive) {
      for (const x of parts) x.hidden = true
      await wait(reduced() ? 0 : 600)
      for (const x of parts) {
        if (!alive()) return
        x.hidden = false
        x.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300 })
        tone(semis(523.25, 7), 0, 0.08, 'sine', 0.06)
        await wait(reduced() ? 0 : 1500)
      }
    },
  }
}
