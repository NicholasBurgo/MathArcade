// The homework: every assigned problem, worked step by step, and a twin of each with
// new numbers. Each group file calls HW.add(problem); index.html draws them.
// Load after engine.js (the printed tables come from it).
;(() => {
  const HW = (window.HW = { problems: [] })

  // ---------- the seven groups (extraction/test-homework) ----------
  HW.groups = [
    { id: 1, title: 'Discrete pdfs, cdfs and MGFs', blurb: 'Geometric and binomial: write the pdf, the cdf and the MGF, then get the mean and variance from them.' },
    { id: 2, title: 'Discrete probabilities', blurb: 'Name the distribution from the story, then find a probability with its pdf or the binomial table.' },
    { id: 3, title: 'Continuous pdfs and cdfs', blurb: 'Find the constant, find a probability by integrating, go from pdf to cdf and back.' },
    { id: 4, title: 'Continuous mean, variance and MGF', blurb: 'E[X] and E[X²] by integrating, the MGF, gamma integrals and the gamma distribution.' },
    { id: 5, title: 'Waiting for the first event', blurb: 'A Poisson process: how long until the first event?' },
    { id: 6, title: 'Chi-squared and normal tables', blurb: 'Read the tables both ways, and normal word problems: x → z → area.' },
    { id: 7, title: 'Gaps: derivations the homework skips', blurb: 'The study guide says derive these, but no homework problem makes you. The test might.' },
  ]

  // ---------- the skills the test asks for (study guide "Be able to") ----------
  // lesson: the whole idea in a few plain lines. levels: arcade levels that drill it.
  HW.skills = {
    label: {
      name: 'Name the distribution from the story',
      lesson: [
        'Fixed number of tries n, each a success with the same p, count the successes → binomial.',
        'Count the tries until the FIRST success → geometric.',
        'Count the tries until the r-th success → negative binomial.',
        'Draw n items WITHOUT putting them back, from N items of which r are "successes" → hypergeometric.',
        'Count events in a stretch of time or space at an average rate → Poisson, with k = λs (rate × length of time or space).',
      ],
      levels: ['Which distribution? (all chapters)', 'Read off the numbers'],
    },
    formulas: {
      name: 'Write a named distribution’s pdf, mean, variance or MGF',
      lesson: [
        'Once you know which distribution it is and its numbers, put the numbers into its formulas.',
        'Learn the means, variances and MGFs: tap Formulas (top bar) to see which ones the test sheet gives you.',
      ],
      levels: ['Read off the numbers', 'Mean and variance from an MGF', 'Binomial probabilities and mean', 'Hypergeometric values and probabilities'],
    },
    'derive-pdf': {
      name: 'Derive a discrete pdf',
      lesson: [
        'Geometric: x − 1 failures then a success, so f(x) = q^(x−1)·p.',
        'Binomial: one order of x successes has probability p^x·q^(n−x), and there are C(n, x) orders.',
        'Negative binomial: the first x − 1 tries hold r − 1 successes, then try x is a success.',
        'Hypergeometric: ways to pick x of the r successes and n − x of the N − r others, over all ways to pick n.',
      ],
      levels: ['Geometric pdf', 'Binomial pdf', 'Negative binomial pdf', 'Hypergeometric pdf'],
    },
    'show-pdf': {
      name: 'Show a function is a pdf',
      lesson: [
        'Two checks: f(x) ≥ 0 for every x, and the total is 1.',
        'Discrete: add f(x) over every x. Continuous: integrate f(x) over its range.',
      ],
      levels: ['Geometric pdf', 'Verify a pdf, or find the constant'],
    },
    'geo-cdf': {
      name: 'Derive the geometric cdf',
      lesson: [
        'F(x) = P[X ≤ x] = add q^(k−1)·p for k = 1 up to x.',
        'That is a finite geometric series (on the formula sheet) with a = p, r = q.',
        'It simplifies to F(x) = 1 − q^x.',
      ],
      levels: ['Geometric cdf'],
    },
    'geo-mgf': {
      name: 'Derive the geometric MGF',
      lesson: [
        'm(t) = E[e^(tX)] = add e^(tx)·q^(x−1)·p over x = 1, 2, 3, …',
        'Pull out p·e^t; what is left is a geometric series in q·e^t.',
        'Answer: p·e^t / (1 − q·e^t), for t < −ln q.',
      ],
      levels: ['Geometric MGF', 'Build the MGF'],
    },
    'mgf-def': {
      name: 'Find an MGF from the definition',
      lesson: [
        'm(t) = E[e^(tX)]: multiply each e^(tx) by f(x) and add them up (or integrate).',
        'For a pdf on a few values, that is one term per value: f(3)e^(3t) + f(4)e^(4t) + …',
      ],
      levels: ['Geometric MGF', 'Build the MGF'],
    },
    'mgf-moments': {
      name: 'Mean and variance from an MGF',
      lesson: [
        'E[X] = m′(0): take the derivative, then put in t = 0.',
        'E[X²] = m″(0). Then Var X = E[X²] − (E[X])².',
      ],
      levels: ['Mean and variance from an MGF', 'Continuous MGF'],
    },
    'disc-prob': {
      name: 'Probabilities from a discrete pdf',
      lesson: [
        'Name the distribution and its numbers first, then put each x into the pdf.',
        '"At least 1" = 1 − f(0). "At most 3" = f(0) + f(1) + f(2) + f(3).',
      ],
      levels: ['Geometric cdf', 'Binomial probabilities and mean', 'Negative binomial probabilities', 'Hypergeometric values and probabilities', 'Poisson probabilities'],
    },
    'binom-table': {
      name: 'Use the binomial table',
      lesson: [
        'The table gives P[X ≤ x]. Find the table for n, the column for p, the row for x.',
        'P[X ≥ x] = 1 − P[X ≤ x − 1]. P[X = x] = row x − row (x − 1).',
      ],
      levels: ['Binomial table'],
    },
    'find-c': {
      name: 'Find the constant that makes a pdf',
      lesson: [
        'Integrate f over its range with the constant left in.',
        'Set the result equal to 1 and solve for the constant.',
      ],
      levels: ['Verify a pdf, or find the constant', 'Discrete pdf: find c, probabilities, mean'],
    },
    'cont-prob': {
      name: 'Probabilities from a continuous pdf',
      lesson: [
        'P[a ≤ X ≤ b] = the integral of f(x) from a to b: the area under f.',
        'P[X = a] = 0 (a single point has no width), so < and ≤ give the same answer.',
      ],
      levels: ['Continuous probabilities', 'Uniform pdf'],
    },
    'cont-cdf': {
      name: 'Derive a continuous cdf',
      lesson: [
        'F(x) = integral of f(t) from the left end of the range up to x.',
        'Write it in three pieces: 0 before the range, the integral inside, 1 after.',
      ],
      levels: ['pdf ↔ cdf'],
    },
    'pdf-from-cdf': {
      name: 'Find the pdf from a cdf',
      lesson: [
        'f(x) = F′(x): take the derivative of each piece.',
        'A continuous cdf starts at 0, ends at 1, never goes down, and has no jumps. If one fails, say which.',
      ],
      levels: ['pdf ↔ cdf'],
    },
    'uniform-pdf': {
      name: 'Derive the uniform pdf',
      lesson: [
        'Uniform on (a, b) means flat: f(x) = c on (a, b).',
        'The area must be 1: c·(b − a) = 1, so c = 1/(b − a).',
      ],
      levels: ['Uniform pdf'],
    },
    'mean-var': {
      name: 'Mean and variance from the pdf',
      lesson: [
        'E[X] = Σ x·f(x) or ∫ x·f(x) dx. E[X²] = Σ x²·f(x) or ∫ x²·f(x) dx.',
        'Var X = E[X²] − (E[X])², and σ = √Var X.',
      ],
      levels: ['Mean and variance from a pdf', 'Discrete pdf: find c, probabilities, mean'],
    },
    'cont-mgf': {
      name: 'Derive a continuous MGF',
      lesson: [
        'm(t) = ∫ e^(tx)·f(x) dx over the range.',
        'Combine the exponents, integrate, and say which t make the integral finite.',
      ],
      levels: ['Continuous MGF', 'Build the MGF'],
    },
    'gamma-fn': {
      name: 'Gamma function integrals',
      lesson: [
        'Γ(n) = (n − 1)!, so ∫₀^∞ zⁿ e^(−z) dz = Γ(n + 1) = n!.',
        'With e^(−x/β): ∫₀^∞ x^(α−1) e^(−x/β) dx = Γ(α)·β^α.',
      ],
      levels: ['Gamma integrals'],
    },
    'first-event': {
      name: 'Time until the first event (Poisson process)',
      lesson: [
        'Rate λ events per unit. The wait W for the first one is exponential with β = 1/λ: P[W > t] = e^(−λt).',
        'P[W ≤ t] = 1 − e^(−λt). Put the rate and the time in the same units first.',
      ],
      levels: ['First event (exponential)'],
    },
    'chi-table': {
      name: 'Use the chi-squared table',
      lesson: [
        'Row = degrees of freedom. Each column heading is the area to the LEFT of the value.',
        'χ²ᵣ means area r to the RIGHT, so read the column for 1 − r.',
      ],
      levels: ['Chi-squared table'],
    },
    'normal-table': {
      name: 'Use the normal table',
      lesson: [
        'The table gives the area to the LEFT of z.',
        'Right area = 1 − left area. Between two z’s = bigger left area − smaller left area.',
        'Backwards: find the area inside the table, read z off its row and column.',
        'z with a subscript has that area to its RIGHT: for z.10 look up .90, so z.10 = 1.28.',
        'Middle area A between −z and z: look up (1 + A)/2. Middle .95 → .975 → z = 1.96.',
      ],
      levels: ['Normal table'],
    },
    'normal-word': {
      name: 'Normal word problems: x → z → area',
      lesson: [
        'z = (x − μ)/σ. Then the table gives the area to the left of z.',
        'Backwards: area → z from the table → x = μ + z·σ.',
        'Check whether you were given σ or the variance σ².',
      ],
      levels: ['Normal word problems'],
    },
  }

  // ---------- registering ----------
  HW.add = p => {
    if (HW.problems.some(q => q.id === p.id)) throw new Error('two problems with id ' + p.id)
    HW.problems.push(p)
    return p
  }

  // ---------- counting and distributions ----------
  const fact = n => {
    let f = 1
    for (let i = 2; i <= n; i++) f *= i
    return f
  }
  const choose = (n, k) => {
    if (k < 0 || k > n) return 0
    k = Math.min(k, n - k)
    let c = 1
    for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i
    return Math.round(c) === c || c > 1e15 ? c : Math.round(c)
  }
  const lgamma = z => {
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z)
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]
    z -= 1
    let x = c[0]
    for (let i = 1; i < 9; i++) x += c[i] / (z + i)
    const t = z + 7.5
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
  }
  HW.fact = fact
  HW.choose = choose
  HW.gamma = x => (Number.isInteger(x) && x > 0 ? fact(x - 1) : Math.exp(lgamma(x)))
  HW.binom = {
    pmf: (n, p, x) => choose(n, x) * p ** x * (1 - p) ** (n - x),
    cdf: (n, p, x) => {
      let s = 0
      for (let i = 0; i <= Math.min(x, n); i++) s += HW.binom.pmf(n, p, i)
      return s
    },
  }
  HW.pois = {
    pmf: (k, x) => (Math.exp(-k) * k ** x) / fact(x),
    cdf: (k, x) => {
      let s = 0
      for (let i = 0; i <= x; i++) s += HW.pois.pmf(k, i)
      return s
    },
  }
  HW.hyper = {
    pmf: (N, r, n, x) => (choose(r, x) * choose(N - r, n - x)) / choose(N, n),
    lo: (N, r, n) => Math.max(0, n - (N - r)),
    hi: (N, r, n) => Math.min(n, r),
  }

  // ---------- the printed tables (the same ones the Tables button shows) ----------
  // The engine has binomial n = 19 and 20, the normal and chi-squared tables; the
  // homework also needs binomial n = 10 and 15, built here the same way (4 decimals).
  HW.BINOM_PS = ['0.1', '0.2', '0.25', '0.3', '0.4', '0.5', '0.6', '0.7', '0.75', '0.8', '0.9']
  const binomTable = n => ({
    title: `Cumulative binomial, n = ${n}`,
    note: 'Row x, column p: the entry is P(X ≤ x).',
    corner: 'x \\ p',
    n,
    cols: HW.BINOM_PS,
    rows: Array.from({ length: n + 1 }, (_, x) => ({ label: String(x), values: HW.BINOM_PS.map(p => HW.binom.cdf(n, +p, x).toFixed(4)) })),
  })
  let printed = null
  HW.tables = () => {
    if (printed) return printed
    const t = window.Test2.unit.printedTables()
    t.binomial19.n = 19
    t.binomial.n = 20
    printed = { binomial10: binomTable(10), binomial15: binomTable(15), ...t }
    return printed
  }
  // the name of the binomial table for n (10, 15, 19 or 20), or null
  HW.binomName = n => ({ 10: 'binomial10', 15: 'binomial15', 19: 'binomial19', 20: 'binomial' })[n] ?? null
  HW.BINOM_NS = [10, 15, 19, 20]
  // a printed entry as written ('0.6778'), by table name, row label and column label
  HW.cell = (name, row, col) => {
    const t = HW.tables()[name]
    const r = t?.rows.find(x => x.label === String(row))
    const j = t ? t.cols.indexOf(String(col)) : -1
    if (!r || j < 0) throw new Error(`no cell ${name} ${row} ${col}`)
    return r.values[j]
  }
  // binomial table: P(X ≤ x) as printed, and the look for it
  HW.binomTable = (n, p, x) => +HW.cell(HW.binomName(n), x, String(p))
  HW.binomLook = (n, p, x) => ({ table: HW.binomName(n), row: String(x), col: String(p) })
  // normal table: z (rounded to 2 decimals) → its row and column labels
  HW.zCell = z => {
    z = Math.round(z * 100) / 100
    const a = Math.abs(z)
    const tenths = Math.floor(a * 10 + 1e-9) / 10
    const row = (z < 0 || Object.is(z, -0) ? '-' : '') + tenths.toFixed(1)
    const col = (Math.round((a - tenths) * 100) / 100).toFixed(2)
    return { row, col }
  }
  // the printed left area for z, as a number (z beyond ±3.99 reads as 0 or 1)
  HW.phi = z => {
    z = Math.round(z * 100) / 100
    if (z <= -3.995) return 0
    if (z >= 3.995) return 1
    const { row, col } = HW.zCell(z)
    return +HW.cell('normal', row, col)
  }
  HW.zLook = z => ({ table: 'normal', ...HW.zCell(z) })
  // backwards: the z whose printed entry is closest to the area A. When two entries are
  // equally close (like .9495 and .9505 for .95), z is halfway between: 1.645.
  HW.zFor = A => {
    const t = HW.tables().normal
    let best = Infinity, at = []
    for (const r of t.rows) r.values.forEach((v, j) => {
      const d = Math.abs(+v - A)
      const z = Math.round((r.label.startsWith('-') ? -1 : 1) * (Math.abs(+r.label) * 100 + j)) / 100
      if (d < best - 1e-12) { best = d; at = [{ z, entry: v, row: r.label, col: t.cols[j] }] }
      else if (Math.abs(d - best) <= 1e-12 && !at.some(a => a.z === z)) at.push({ z, entry: v, row: r.label, col: t.cols[j] })
    })
    at.sort((a, b) => a.z - b.z)
    const z = at.length === 2 && Math.abs(at[1].z - at[0].z - 0.01) < 1e-9 ? Math.round(((at[0].z + at[1].z) / 2) * 1000) / 1000 : at[0].z
    return { z, cells: at, halfway: at.length === 2, look: { table: 'normal', row: at[0].row, col: at[0].col, target: A } }
  }
  // chi-squared: the value in row γ under a LEFT-area column, as printed ('25.0')
  HW.CHI_COLS = ['0.005', '0.01', '0.025', '0.05', '0.1', '0.25', '0.5', '0.75', '0.9', '0.95', '0.975', '0.99', '0.995']
  HW.chi = (g, left) => HW.cell('chi2', g, String(left))
  HW.chiLook = (g, left, target = null) => ({ table: 'chi2', row: String(g), col: String(left), ...(target != null ? { target } : {}) })
  // the column (left area) whose entry in row γ is the printed value s, or null
  HW.chiArea = (g, s) => {
    const t = HW.tables().chi2
    const r = t.rows[g - 1]
    const j = r.values.findIndex(v => +v === +s)
    return j < 0 ? null : +t.cols[j]
  }

  // ---------- writing numbers ----------
  // round to d decimals and drop trailing zeros: 0.92307 → '0.9231', 2.50 → '2.5'
  HW.num = (x, d = 4) => {
    if (!Number.isFinite(x)) return String(x)
    const s = (Math.round(x * 10 ** d) / 10 ** d).toFixed(d)
    return s.includes('.') ? s.replace(/\.?0+$/, '') || '0' : s
  }
  // exactly d decimals: 0.5 → '0.5000'
  HW.fix = (x, d = 4) => (Math.round(x * 10 ** d) / 10 ** d).toFixed(d)
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
  HW.gcd = gcd
  // a reduced fraction in TeX: (12, 13) → '\frac{12}{13}', (4, 2) → '2', (-1, 3) → '-\frac{1}{3}'
  HW.frac = (n, d) => {
    if (d < 0) { n = -n; d = -d }
    const g = gcd(n, d) || 1
    n /= g
    d /= g
    if (d === 1) return String(n)
    return (n < 0 ? '-' : '') + `\\frac{${Math.abs(n)}}{${d}}`
  }
  // the same as plain text: '12/13'
  HW.fracText = (n, d) => {
    if (d < 0) { n = -n; d = -d }
    const g = gcd(n, d) || 1
    return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`
  }

  // ---------- random numbers for twins ----------
  HW.rand = {
    int: (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
    chance: p => Math.random() < p,
    shuffle: arr => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    },
    // a number from lo to hi in steps of `step`, as a number with no float noise
    step: (lo, hi, step) => {
      const k = Math.floor(Math.random() * (Math.round((hi - lo) / step) + 1))
      return +(lo + k * step).toFixed(10)
    },
  }
})()
