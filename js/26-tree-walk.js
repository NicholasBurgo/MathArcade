// js/26-tree-walk.js · the tree, animated: which distribution, and why
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the tree, animated: which distribution, and why ----------
// A family-tree chart on its side. Boxes are the questions and the distributions;
// the answers are written on the lines between them, so each path reads as a
// sentence: "a count → successes in n independent tries → binomial". Playing a
// path lights each line and box in turn, fades the other branches, says why, and
// opens the distribution. The reasons are the tree's own (TREE), unchanged.
const CHART = {
  q: 'Is X a count or a measurement?',
  kids: [
    { a: 'A count', more: 'whole numbers 0, 1, 2, … (Ch 3)', why: TREE.branches[0].why, q: 'What is X counting?', kids: [
      { a: 'Events in a window, at a rate', leaf: 'poisson' },
      { a: 'Picks from a group, no putting back', leaf: 'hyper' },
      { a: 'Successes in n independent tries', leaf: 'binomial' },
      { a: 'Tries until the 1st success', leaf: 'geometric' },
      { a: 'Tries until the r-th success', leaf: 'negbin' },
    ] },
    { a: 'A measurement', more: 'any decimal in a range (Ch 4)', why: TREE.branches[1].why, q: 'What is X measuring?', kids: [
      { a: 'A value from A to B, all equally likely', leaf: 'uniform' },
      { a: 'The wait for the 1st event', leaf: 'exponential' },
      { a: 'A gamma pdf: x^(α−1)e^(−x/β)', leaf: 'gamma' },
      { a: 'A χ² value (γ degrees of freedom)', leaf: 'chi' },
      { a: 'A bell-shaped amount (μ and σ)', leaf: 'normal' },
    ] },
  ],
}
function treeWalk({ leaf: only = null } = {}) {
  const ROW = 62, PAD = 6, ROOTW = 120, MIDW = 128, LEAFW = 132, GAP1 = 130, GAP2 = 212
  const X0 = PAD, X1 = X0 + ROOTW + GAP1, X2 = X1 + MIDW + GAP2
  const W = X2 + LEAFW + PAD
  // nodes: the root question, the two "what is it" questions, the ten distributions
  const nodes = []
  const root = { q: CHART.q, x: X0, w: ROOTW, kids: [] }
  nodes.push(root)
  let row = 0
  for (const m of CHART.kids) {
    const mid = { parent: root, q: m.q, a: m.a, more: m.more, why: m.why, x: X1, w: MIDW, kids: [] }
    root.kids.push(mid)
    nodes.push(mid)
    for (const k of m.kids) {
      // the reason for each distribution is the tree's own sentence for it
      const why = pathTo(k.leaf).at(-1).b.why
      const more = pathTo(k.leaf).at(-1).b.more
      const leaf = { parent: mid, leaf: k.leaf, a: k.a, more, why, x: X2, w: LEAFW, cy: PAD + 26 + row++ * ROW + ROW / 2, kids: [] }
      mid.kids.push(leaf)
      nodes.push(leaf)
    }
    mid.cy = (mid.kids[0].cy + mid.kids[mid.kids.length - 1].cy) / 2
  }
  root.cy = (root.kids[0].cy + root.kids[1].cy) / 2
  const H = PAD * 2 + 26 + row * ROW
  const svg = svgEl('svg', { class: 'lineage', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Decision tree: which distribution' })
  svg.style.maxWidth = W + 'px'
  const lines = svgEl('g'), labels = svgEl('g')
  svg.append(lines, labels)
  const wrapText = (s, max) => {
    const out = []
    let line = ''
    for (const w of s.split(' ')) {
      if ((line + ' ' + w).trim().length > max && line) {
        out.push(line)
        line = w
      } else line = (line + ' ' + w).trim()
    }
    if (line) out.push(line)
    return out
  }
  // column headings, so the three columns read as question → answer → distribution
  const head = (x, t) => labels.append(svgEl('text', { x, y: PAD + 12, class: 'lt-head' }, t))
  head(X0, 'Ask')
  head(X0 + ROOTW + 14, 'Answer')
  head(X1, 'Then ask')
  head(X1 + MIDW + 14, 'Answer')
  head(X2, 'Distribution')
  for (const n of nodes) {
    const g = svgEl('g', { class: 'lt-node' + (n.leaf ? ' leaf' : '') + (n === root ? ' root' : '') })
    const rows = n.leaf
      ? [['name', LEAVES[n.leaf].name.toUpperCase()], ['sec', LEAVES[n.leaf].sec]]
      : wrapText(n.q, 15).map(t => ['q', t])
    const lh = { q: 17, name: 19, sec: 14 }
    const hgt = rows.reduce((s, [k]) => s + lh[k], 0) + 14
    n.h = hgt
    n.y = n.cy - hgt / 2
    g.append(svgEl('rect', { x: n.x, y: n.y, width: n.w, height: hgt, rx: 9 }))
    let ty = n.y + 7
    for (const [k, t] of rows) {
      ty += lh[k]
      g.append(svgEl('text', { x: n.x + n.w / 2, y: ty - 3, class: 'lt-' + k, 'text-anchor': 'middle' }, t))
    }
    if (n.leaf) {
      g.setAttribute('role', 'button')
      g.setAttribute('tabindex', '0')
      g.setAttribute('aria-label', `Show the path to ${LEAVES[n.leaf].name}`)
      g.addEventListener('click', () => play([n.leaf]))
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play([n.leaf]) } })
    }
    n.g = g
    svg.append(g)
  }
  // the lines, each with its answer written along the last stretch into the box
  for (const n of nodes) if (n.parent) {
    const p = n.parent, x1 = p.x + p.w, turn = x1 + 12
    const d = `M${x1},${p.cy} H${turn} V${n.cy} H${n.x}`
    lines.append(n.line = svgEl('path', { d, class: 'lt-line' }))
    lines.append(n.glow = svgEl('path', { d, class: 'lt-glow', pathLength: 100 }))
    const words = wrapText(n.a, n.leaf ? 28 : 14)
    const label = svgEl('text', { x: turn + 8, y: n.cy - 6 - (words.length - 1) * 14, class: 'lt-label' + (n.leaf ? '' : ' big') })
    words.forEach((w, i) => label.append(svgEl('tspan', { x: turn + 8, dy: i ? 14 : 0 }, w)))
    labels.append(label)
    n.label = label
  }
  const dot = svgEl('circle', { r: 6, class: 'lt-dot' })
  dot.style.display = 'none'
  svg.append(dot)

  const wrap = h('div', 'twalk')
  const bar = h('div', 'twalk-bar')
  const playAll = h('button', 'btn', only ? '▶ Play it again' : '▶ Play every path')
  playAll.type = 'button'
  const stop = h('button', 'btn ghost', 'Stop')
  stop.type = 'button'
  stop.hidden = true
  bar.append(playAll, stop, h('span', 'twalk-hint', only ? '' : 'or tap a distribution to see only its path'))
  const scroller = h('div', 'lineage-scroll')
  scroller.append(svg)
  // the caption sits above the chart, so the words stay in view while a path plays
  const caption = h('div', 'lt-caption')
  caption.hidden = true
  wrap.append(bar, caption, scroller)

  const follow = n => n.g.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' })
  function reset() {
    svg.classList.remove('walking')
    for (const n of nodes) {
      n.g.classList.remove('lit', 'nope', 'here')
      n.glow?.classList.remove('on')
      n.label?.classList.remove('lit', 'nope')
    }
    dot.style.display = 'none'
    caption.hidden = true
    caption.replaceChildren()
  }
  // the dot runs along the line to the next box
  const run = (n, ms) => new Promise(done => {
    const len = n.glow.getTotalLength()
    const t0 = performance.now()
    dot.style.display = ''
    const step = now => {
      const k = Math.min(1, (now - t0) / ms)
      const pt = n.glow.getPointAtLength(len * k)
      dot.setAttribute('cx', pt.x)
      dot.setAttribute('cy', pt.y)
      if (k < 1) requestAnimationFrame(step)
      else done()
    }
    requestAnimationFrame(step)
    setTimeout(done, ms + 200)
  })
  let runId = 0
  async function play(leaves) {
    const me = ++runId
    const alive = () => me === runId && wrap.isConnected
    playAll.hidden = true
    stop.hidden = false
    for (const leaf of leaves) {
      reset()
      svg.classList.add('walking')
      const end = nodes.find(x => x.leaf === leaf)
      const path = [root, end.parent, end]
      root.g.classList.add('lit', 'here')
      follow(root)
      caption.hidden = false
      caption.replaceChildren(h('p', 'lt-ask', root.q))
      tone(semis(523.25, 4), 0, 0.08, 'sine', 0.06)
      await wait(reduced() ? 0 : 900)
      for (const n of path.slice(1)) {
        if (!alive()) return
        for (const s of n.parent.kids) if (s !== n) {
          s.g.classList.add('nope')
          s.label.classList.add('nope')
        }
        n.glow.classList.add('on')
        n.label.classList.add('lit')
        follow(n)
        if (!reduced()) await run(n, 750)
        if (!alive()) return
        for (const x of nodes) x.g.classList.remove('here')
        n.g.classList.add('lit', 'here')
        const said = h('p', 'lt-said')
        said.append(h('b', '', n.a), document.createTextNode(n.more ? ' · ' + n.more : ''))
        caption.replaceChildren(h('p', 'lt-ask', n.parent.q), said, h('p', 'lt-why', n.why))
        tone(semis(523.25, 9), 0, 0.08, 'sine', 0.06)
        await wait(reduced() ? 0 : n.leaf ? 1200 : 2400)
      }
      if (!alive()) return
      dot.style.display = 'none'
      caption.append(leafCard(leaf))
      sfx.right(2)
      await wait(reduced() ? 0 : 4800)
      if (!alive()) return
    }
    playAll.hidden = false
    stop.hidden = true
  }
  playAll.addEventListener('click', () => play(only ? [only] : PICK_ORDER))
  stop.addEventListener('click', () => {
    runId++
    reset()
    playAll.hidden = false
    stop.hidden = true
  })
  if (only) setTimeout(() => play([only]), 0)
  return wrap
}
