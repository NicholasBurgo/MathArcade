// js/38-tables-and-sheet.js · tables and formula sheet
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- tables and formula sheet ----------
const overlay = document.getElementById('overlay')
const TAB_NAMES = { binomial10: 'Binomial n = 10', binomial15: 'Binomial n = 15', binomial19: 'Binomial n = 19', binomial: 'Binomial n = 20', normal: 'Normal z', chi2: 'Chi-squared' }
let tables = null
// the table for what is on screen: a table level's own (the n = 19 binomial table when
// the question's n is 19), else the first
let cardLevel = null
function tableHere() {
  const q = screen === 'question' && round ? round.queue[round.at] : null
  if (q?.p.slice && q.p.table) return q.p.table
  const level = q ? q.level ?? round.short : screen === 'card' ? cardLevel : null
  if (level === 'Binomial table') return /\b19\b/.test(`${q?.p.text ?? ''} ${q?.p.latex ?? ''}`) ? 'binomial19' : 'binomial'
  if (level === 'Chi-squared table') return 'chi2'
  if (level === 'Normal table' || level === 'Normal word problems') return 'normal'
  if (screen === 'hw' && hwTable) return hwTable
  return unit.tables[0]
}
function closeOverlay() {
  overlay.hidden = true
  overlay.replaceChildren()
  document.body.style.overflow = ''
}
// The printed tables, in a panel that floats over the page, so the question stays
// there to write on and press. Drag it by its title bar; it stays where it is left.
const tablesPop = document.getElementById('tables-pop')
const tablesBtn = document.getElementById('open-tables')
const TABLES_POS = 'math3800-arcade.tables'
const placeTables = (x, y) => {
  const r = tablesPop.getBoundingClientRect()
  x = Math.max(4, Math.min(innerWidth - r.width - 4, x))
  y = Math.max(4, Math.min(innerHeight - Math.min(r.height, 120) - 4, y))
  Object.assign(tablesPop.style, { left: x + 'px', top: y + 'px', right: 'auto' })
}
function closeTables() {
  tablesPop.hidden = true
  tablesBtn.setAttribute('aria-pressed', 'false')
}
function openTables(which = unit.tables[0], at = null) {
  tables ??= printedTables()
  tablesPop.replaceChildren()
  const head = h('div', 'tp-head')
  const tabs = h('div', 'tp-tabs')
  for (const name of TABLE_LIST) {
    const b = h('button', 'tool', TAB_NAMES[name] ?? name)
    b.type = 'button'
    b.setAttribute('aria-pressed', String(name === which))
    b.addEventListener('click', () => openTables(name))
    tabs.append(b)
  }
  const close = h('button', 'calc-x', '×')
  close.type = 'button'
  close.setAttribute('aria-label', 'Close the tables')
  close.addEventListener('click', closeTables)
  head.append(h('b', '', 'Tables'), tabs, close)
  const t = tables[which]
  const body = h('div', 'tp-body')
  body.append(h('p', 'tp-title', t.title), h('p', 'note', t.note))
  const table = h('table', 'ptable')
  const thead = h('thead')
  const hr = h('tr')
  hr.append(h('th', '', t.corner))
  t.cols.forEach(c => hr.append(h('th', '', c)))
  thead.append(hr)
  const tbody = h('tbody')
  t.rows.forEach(row => {
    const tr = h('tr')
    tr.append(h('th', '', row.label))
    row.values.forEach(v => tr.append(h('td', '', v)))
    tbody.append(tr)
  })
  table.append(thead, tbody)
  // tap a cell to light up its row and column, like a finger on the paper
  table.addEventListener('click', e => {
    const td = e.target.closest('td')
    if (!td) return
    const ri = td.parentElement.rowIndex
    const ci = td.cellIndex
    table.querySelectorAll('.line, .here').forEach(x => x.classList.remove('line', 'here'))
    for (const tr of table.rows) {
      if (tr.rowIndex === ri) for (const c of tr.cells) c.classList.add('line')
      else if (tr.cells[ci]) tr.cells[ci].classList.add('line')
    }
    td.classList.remove('line')
    td.classList.add('here')
  })
  body.append(table)
  tablesPop.append(head, body)
  tablesPop.hidden = false
  tablesBtn.setAttribute('aria-pressed', 'true')
  try {
    const pos = JSON.parse(localStorage.getItem(TABLES_POS))
    if (pos) placeTables(pos.x, pos.y)
  } catch {}
  // a step's "Open the whole table": light its cell and bring it into view
  const ri = at ? t.rows.findIndex(r => r.label === at.row) : -1
  const ci = at ? t.cols.indexOf(at.col) : -1
  if (ri >= 0 && ci >= 0) {
    const td = tbody.rows[ri].cells[ci + 1]
    td.click()
    requestAnimationFrame(() => {
      const r = td.getBoundingClientRect(), b = body.getBoundingClientRect()
      body.scrollTop += r.top - b.top - b.height / 2
      body.scrollLeft += r.left - b.left - b.width / 2
    })
  }
  // drag by the title bar (not its buttons)
  let drag = null
  head.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return
    const r = tablesPop.getBoundingClientRect()
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top }
    try { head.setPointerCapture(e.pointerId) } catch {}
    e.preventDefault()
  })
  head.addEventListener('pointermove', e => {
    if (drag) placeTables(e.clientX - drag.dx, e.clientY - drag.dy)
  })
  const drop = () => {
    if (!drag) return
    drag = null
    const r = tablesPop.getBoundingClientRect()
    try { localStorage.setItem(TABLES_POS, JSON.stringify({ x: r.left, y: r.top })) } catch {}
  }
  head.addEventListener('pointerup', drop)
  head.addEventListener('pointercancel', drop)
}
async function openSheet() {
  await mathBoot
  overlay.replaceChildren()
  const inner = h('div', 'overlay-inner')
  const head = h('div', 'overlay-head')
  head.append(h('strong', '', 'Formula sheet'))
  const close = h('button', 'tool', 'Close')
  close.type = 'button'
  close.addEventListener('click', closeOverlay)
  head.append(close)
  inner.append(head)
  const group = (title, lines) => {
    inner.append(h('h3', '', title))
    const grid = h('div', 'sheet-grid')
    for (const f of lines) {
      const card = h('div', 'formula')
      card.append(h('p', '', f.label), tex(f.latex))
      grid.append(card)
    }
    inner.append(grid)
  }
  // World 0 sweep: never on the sheet (study guide, Formulas), so know these cold. The
  // engine's list missed means and variances the quiz asks for (negative binomial,
  // hypergeometric, uniform) and listed the negative binomial pdf, which may be given.
  const know = [
    { label: 'A pdf', latex: R`f(x) \ge 0, \quad \sum f(x) = 1 \;\text{ or }\; \int_{-\infty}^{\infty} f(x)\,dx = 1` },
    { label: 'cdf and pdf', latex: R`F(x) = P[X \le x] = \sum_{t \le x} f(t) \;\text{ or }\; \int_{-\infty}^{x} f(t)\,dt, \qquad f(x) = F'(x)` },
    { label: 'Mean and variance', latex: R`\begin{gathered} E[X] = \sum x f(x) \;\text{ or }\; \int x f(x)\,dx \\ \operatorname{Var}X = E[X^2] - (E[X])^2, \quad \sigma = \sqrt{\operatorname{Var}X} \end{gathered}` },
    { label: 'MGF', latex: R`m_X(t) = E[e^{tX}], \qquad E[X^k] = \frac{d^k}{dt^k}m_X(t)\Big|_{t=0}` },
    { label: 'Integration by parts', latex: R`\int u\,dv = uv - \int v\,du, \qquad \int xe^{ax}\,dx = \frac{x}{a}e^{ax} - \frac{e^{ax}}{a^2} + C` },
    { label: 'Gamma integral (the gamma pdf integrates to 1)', latex: R`\int_0^{\infty} x^{\alpha-1}e^{-x/\beta}\,dx = \Gamma(\alpha)\beta^{\alpha}, \qquad \Gamma(\alpha+1) = \alpha\Gamma(\alpha)` },
    { label: 'Maclaurin series', latex: R`e^z = \sum_{k=0}^{\infty} \frac{z^k}{k!}` },
    { label: 'Binomial theorem', latex: R`(a+b)^n = \sum_{k=0}^{n}\binom{n}{k}a^k b^{n-k}` },
    { label: 'Geometric', latex: R`\begin{gathered} F(x) = 1 - q^x,\; E[X] = \frac{1}{p},\; \operatorname{Var}X = \frac{q}{p^2} \\ m_X(t) = \frac{pe^t}{1-qe^t},\ t < -\ln q \end{gathered}` },
    { label: 'Binomial', latex: R`E[X] = np,\; \operatorname{Var}X = npq,\; m_X(t) = (q + pe^t)^n` },
    { label: 'Negative binomial', latex: R`\begin{gathered} E[X] = \frac{r}{p},\; \operatorname{Var}X = \frac{rq}{p^2} \\ f(x) = P[r-1 \text{ successes in } x-1 \text{ trials}] \cdot p \end{gathered}` },
    { label: 'Hypergeometric', latex: R`\begin{gathered} E[X] = n\frac{r}{N},\; \operatorname{Var}X = n\frac{r}{N}\cdot\frac{N-r}{N}\cdot\frac{N-n}{N-1} \\ x = \max(0,\, n-(N-r)), \ldots, \min(n,\, r) \end{gathered}` },
    { label: 'Poisson', latex: R`k = \lambda s, \qquad E[X] = \operatorname{Var}X = k` },
    { label: 'Uniform on (a, b)', latex: R`\begin{gathered} f(x) = \frac{1}{b-a},\; F(x) = \frac{x-a}{b-a} \\ E[X] = \frac{a+b}{2},\; \operatorname{Var}X = \frac{(b-a)^2}{12} \end{gathered}` },
    { label: 'Gamma', latex: R`\mu = \alpha\beta,\; \sigma^2 = \alpha\beta^2,\; m_X(t) = (1 - \beta t)^{-\alpha}` },
    { label: 'First event, rate λ (exponential)', latex: R`\begin{gathered} \beta = \tfrac{1}{\lambda}:\; P[W \le t] = 1 - e^{-\lambda t},\; P[W > t] = e^{-\lambda t} \\ \mu = \beta,\; \sigma^2 = \beta^2,\; m_X(t) = \frac{1}{1-\beta t} \end{gathered}` },
    { label: 'Chi-squared', latex: R`\begin{gathered} \text{gamma with } \alpha = \tfrac{\gamma}{2},\; \beta = 2:\; \mu = \gamma,\; \sigma^2 = 2\gamma,\; m_X(t) = (1 - 2t)^{-\gamma/2} \\ \chi^2_r \text{ has area } r \text{ to its right} \end{gathered}` },
    { label: 'Normal', latex: R`\begin{gathered} Z = \frac{X - \mu}{\sigma}, \quad \text{percentile} = \text{left area}, \quad m_X(t) = e^{\mu t + \sigma^2 t^2/2} \\ z_r \text{ has area } r \text{ to its right} \end{gathered}` },
  ]
  inner.append(h('p', 'paper-note', 'The study guide: the test hands you a formula sheet with the first group (the second maybe), minus any formula a question asks you to derive, plus the tables.'))
  group('Printed on the sheet: you get these', unit.sheet.given)
  group('Might be on the sheet, might not: learn to build these yourself', unit.sheet.maybe)
  group('Never on the sheet: memorize these', know)
  overlay.append(inner)
  overlay.hidden = false
  document.body.style.overflow = 'hidden'
}
