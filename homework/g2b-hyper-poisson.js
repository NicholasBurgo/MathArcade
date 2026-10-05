// Group 2 (b): hypergeometric and Poisson (3.7 #54, 55, 56, 59, 60; 3.8 #61, 63, 66)
;(() => {
  const R = String.raw
  const { num, frac } = HW

  // ---------- small helpers ----------
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
  const words = n => (Number.isInteger(n) && n >= 0 && n <= 20 ? WORDS[n] : num(n))
  // 150000 → '150,000' in words, '150{,}000' in TeX
  const big = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const bigT = n => big(n).replace(/,/g, '{,}')
  // whole numbers lo..hi in TeX: '2, 3, 4, 5' or '0, 1, \ldots, 20'
  const listT = (lo, hi) => (hi - lo <= 5 ? range(lo, hi).join(', ') : R`${lo}, ${lo + 1}, \ldots, ${hi}`)
  // a probability with enough decimals to say something
  const pf = x => num(x, x >= 0.01 ? 4 : x >= 0.001 ? 5 : 6)
  // accepts 3–4 significant figures, rejects the neighbouring answers
  const ptol = x => +Math.min(0.0005, x * 0.04).toPrecision(1)
  // '= 0.85' when a/b ends within 4 decimals, '\approx 0.7895' when it doesn't
  const eqDec = (a, b) => {
    const x = a / b
    return (Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-9 ? '= ' : R`\approx `) + num(x, 4)
  }
  // '= 0.0001' when x ends within d decimals, '\approx 0.0067' when it doesn't
  const decT = (x, d) => (Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-9 ? '= ' : R`\approx `) + num(x, d)
  // a fraction, then its decimal: '\frac{17}{4} = 4.25', or just '4' when it is whole
  const fracDec = (a, b) => (Number.isInteger(a / b) ? String(a / b) : R`${frac(a, b)} ${eqDec(a, b)}`)
  // the arcade's wrong choices: drop any that land on the answer (within 1.5 tol), repeat,
  // or aren't a probability when the answer is one
  const wrongs = (value, tol, xs, { prob = false } = {}) => {
    const seen = new Set(), out = []
    for (const x of xs) {
      if (!Number.isFinite(x) || Math.abs(x - value) <= tol * 1.5) continue
      if (prob && (x < 0 || x > 1)) continue
      const k = +x.toPrecision(4)
      if (!seen.has(k)) seen.add(k), out.push(x)
    }
    return out.slice(0, 5)
  }
  const t4 = x => +x.toFixed(4) // a sum or difference of printed entries, without float noise
  // e^{-k} to 6 significant figures, as a calculator shows it: 0.135335 or 4.53999 \times 10^{-5}
  // (fewer can flip the last digit: 0.1353 × 5 = 0.6765, but the answer is 0.6767)
  const sciT = x => {
    if (x >= 0.01) return String(+x.toPrecision(6))
    let e = Math.floor(Math.log10(x)), m = x / 10 ** e
    if (+m.toFixed(5) >= 10) { m /= 10; e += 1 }
    return R`${m.toFixed(5)} \times 10^{${e}}`
  }

  // ---------- hypergeometric helpers ----------
  const hyperGraph = (N, r, n, hits) => {
    const xs = range(0, n), lo = HW.hyper.lo(N, r, n), hi = HW.hyper.hi(N, r, n)
    const out = xs.filter(x => x < lo || x > hi)
    return {
      kind: 'bars',
      title: `hypergeometric · N = ${N}, r = ${r}, n = ${n}`,
      xs,
      ys: xs.map(x => HW.hyper.pmf(N, r, n, x)),
      hits: new Set(hits),
      note: out.length ? `x = ${out.join(', ')} ${out.length === 1 ? 'has' : 'have'} no bar: ${out.length === 1 ? 'it' : 'they'} can’t happen.` : `Every x from 0 to ${n} can happen.`,
    }
  }
  const hyperVar = (N, r, n) => (n * r * (N - r) * (N - n)) / (N * N * (N - 1))

  // ---------- 3.7 #54, #55, #56: possible values, mean, variance ----------
  // The plain wording is the homework's; the others give the same numbers a story.
  const BASIC_STORIES = [
    {
      text: v => R`Suppose that \(X\) is hypergeometric with \(N = ${v.N}\), \(r = ${v.r}\), and \(n = ${v.n}\).`,
      succ: 'successes', fail: 'failures', drawn: 'drawn',
    },
    {
      text: v => R`An urn holds ${v.N} marbles, and ${v.r} of them are red. You draw ${v.n} marbles at random without putting any back. Let \(X\) be the number of red marbles drawn.`,
      succ: 'red marbles', fail: 'marbles that aren’t red', drawn: 'drawn',
    },
    {
      text: v => R`A club has ${v.N} members, and ${v.r} of them are seniors. A committee of ${v.n} members is chosen at random. Let \(X\) be the number of seniors on the committee.`,
      succ: 'seniors', fail: 'members who aren’t seniors', drawn: 'chosen',
    },
    {
      text: v => R`A hatchery tank holds ${v.N} trout, and ${v.r} of them carry a tag. A worker nets ${v.n} trout at once. Let \(X\) be the number of tagged trout in the net.`,
      succ: 'tagged trout', fail: 'untagged trout', drawn: 'netted',
    },
    {
      text: v => R`A stack of ${v.N} trivia cards has ${v.r} sports questions in it. You deal ${v.n} cards off the shuffled stack. Let \(X\) be the number of sports questions dealt.`,
      succ: 'sports questions', fail: 'other questions', drawn: 'dealt',
    },
  ]
  // which end of the range is cut off: 'floor' (X can't be 0), 'cap' (X stops at r < n), 'free'
  const caseOf = (N, r, n) => {
    const lo = HW.hyper.lo(N, r, n), hi = HW.hyper.hi(N, r, n)
    return lo > 0 && hi === n ? 'floor' : lo === 0 && hi < n ? 'cap' : lo === 0 && hi === n ? 'free' : 'both'
  }

  const hyperBasic = (no, title, hw) =>
    HW.add({
      id: `3.7-${no}`,
      section: '3.7',
      num: String(no),
      group: 2,
      title,
      hw: { ...hw, s: 0 },
      twin: () => {
        const want = caseOf(hw.N, hw.r, hw.n)
        for (let t = 0; t < 2000; t++) {
          const N = HW.rand.pick([10, 12, 15, 16, 18, 20, 24, 25, 30])
          // at least 2 of each kind, so the story never says "1 of them are red"
          const n = HW.rand.int(3, 8), r = HW.rand.int(2, N - 2)
          if (caseOf(N, r, n) !== want) continue
          if (N === hw.N && n === hw.n && r === hw.r) continue
          return { N, r, n, s: HW.rand.int(0, BASIC_STORIES.length - 1) }
        }
        throw new Error('no twin found')
      },
      make: v => {
        const { N, r, n } = v
        const S = BASIC_STORIES[v.s]
        const lo = HW.hyper.lo(N, r, n), hi = HW.hyper.hi(N, r, n)
        const E = (n * r) / N, V = hyperVar(N, r, n)
        const npq = (n * r * (N - r)) / (N * N)
        // the range written out, and the ranges people get by mistake
        const rangeOpt = (a, b) => ({ key: `${a}-${b}`, tex: R`x = ${listT(a, b)}` })
        const wrong = [
          [0, n], // ignored both limits
          [Math.max(0, n - r), Math.min(n, N - r)], // swapped successes and failures
          ...(r > n ? [[lo, r]] : []), // ran up to r instead of min(n, r)
          ...(lo === 0 ? [[1, hi]] : []), // forgot 0
          [0, hi], // forgot the lower limit
          [lo, n], // forgot the upper limit
          ...(n - (N - r) < 0 ? [[n - (N - r), hi]] : []), // forgot the max(0, …)
          [lo, N], // ran up to N, the whole group
          [lo + 1, hi], // left out the bottom end
        ]
        const opts = [rangeOpt(lo, hi)]
        for (const [a, b] of wrong) if (opts.length < 4 && !opts.some(o => o.key === `${a}-${b}`)) opts.push(rangeOpt(a, b))
        const trapA =
          lo > 0
            ? `Starting the list at 0. There are only ${N - r} ${S.fail} in the whole group, so the ${n} ${S.drawn} must include at least ${lo} of the ${S.succ}.`
            : hi < n
              ? `Running the list up to n = ${n}. There are only ${r} ${S.succ} to draw, so X stops at ${r}.`
              : r > n
                ? `Running the list up to r = ${r}. Only ${n} are ${S.drawn}, so X stops at ${n}.`
                : `Starting the list at 1. Getting none of the ${S.succ} is possible here.`
        const varTop = n * r * (N - r) * (N - n), varBot = N * N * (N - 1)
        // E is a fraction over N ≤ 30: 2 decimals always pass; the tighter tol under 1
        // keeps E·(N − n)/(N − 1) (the variance factor put in the mean) from passing
        const tolE = E < 1 ? 0.005 : 0.01, tolV = 0.002
        const f2 = Math.round(((N - n) / (N - 1)) * 100) / 100 // the last factor rounded too early
        return {
          text: S.text(v),
          parts: [
            {
              label: 'a',
              ask: R`What are the possible values for \(X\)?`,
              skill: 'formulas',
              hint: 'Find the biggest X can be (it can’t beat n or r), then the smallest (think about how many failures there are to draw).',
              check: { type: 'choice', options: opts.map(o => ({ tex: o.tex })), correct: 0 },
              answer: R`x = ${listT(lo, hi)}`,
              steps: [
                {
                  say: R`A hypergeometric \(X\) runs from \(\max\bigl(0,\ n - (N - r)\bigr)\) up to \(\min(n, r)\). Here is where each end comes from.`,
                  tex: R`\max\bigl(0,\ n - (N - r)\bigr) \;\le\; x \;\le\; \min(n, r)`,
                },
                {
                  say: R`Top end: \(X\) counts ${S.succ} among the \(n = ${n}\) ${S.drawn}. It can’t be more than ${n}, and it can’t be more than the \(r = ${r}\) ${S.succ} there are.`,
                  tex: R`\min(n, r) = \min(${n}, ${r}) = ${hi}`,
                  why: hi < n ? `There are only ${r} ${S.succ} in all, so even ${n} ${S.drawn} can hold at most ${r}.` : `Only ${n} are ${S.drawn}, so X can’t go past ${n}.`,
                },
                {
                  say: R`Bottom end: the other \(n - X\) ${S.drawn} are ${S.fail}, and there are only \(N - r = ${N} - ${r} = ${N - r}\) of those.`,
                  tex: R`n - (N - r) = ${n} - ${N - r} = ${n - (N - r)}, \qquad \max(0,\ ${n - (N - r)}) = ${lo}`,
                  why: lo > 0 ? `The ${S.fail} can fill at most ${N - r} of the ${n} spots, so X is at least ${n} − ${N - r} = ${lo}.` : `There are enough ${S.fail} to fill all ${n} spots, so X = 0 can happen. A count can’t go below 0.`,
                },
                {
                  say: `List every whole number from ${lo} to ${hi}.`,
                  tex: R`x = ${listT(lo, hi)}`,
                  graph: hyperGraph(N, r, n, range(lo, hi)),
                },
              ],
              trap: trapA,
            },
            {
              label: 'b',
              ask: R`What is \(E[X]\)?`,
              skill: 'formulas',
              hint: 'The hypergeometric mean is n times the fraction of successes, r/N.',
              check: { type: 'number', value: E, tol: tolE, wrong: wrongs(E, tolE, [(n * (N - r)) / N, r / N, (E * (N - n)) / (N - 1), V]) },
              answer: R`E[X] = n\frac{r}{N} = ${fracDec(n * r, N)}`,
              steps: [
                {
                  say: 'The hypergeometric mean is n·r/N.',
                  tex: R`E[X] = n\,\frac{r}{N}`,
                  why: `r/N is the fraction of ${S.succ} in the whole group. A random ${n} get that same fraction on average.`,
                },
                {
                  say: `Put in n = ${n}, r = ${r} and N = ${N}.`,
                  tex: R`E[X] = ${n}\cdot\frac{${r}}{${N}} = \frac{${n * r}}{${N}} = ${fracDec(n * r, N)}`,
                },
              ],
              trap: 'The (N − n)/(N − 1) factor goes in the variance, not the mean.',
            },
            {
              label: 'c',
              ask: R`What is \(\operatorname{Var} X\)?`,
              skill: 'formulas',
              hint: 'Start like a binomial npq with p = r/N, then multiply by (N − n)/(N − 1).',
              check: { type: 'number', value: V, tol: tolV, wrong: wrongs(V, tolV, [npq, (varTop / varBot) * ((N - 1) / N), (npq * (N - 1)) / (N - n), Math.sqrt(V), E]) },
              answer: R`\operatorname{Var} X = ${frac(varTop, varBot)} ${eqDec(varTop, varBot)}`,
              steps: [
                {
                  say: R`The hypergeometric variance is the binomial \(npq\) with \(p = r/N\), times one more factor, \(\frac{N-n}{N-1}\).`,
                  tex: R`\operatorname{Var} X = n\cdot\frac{r}{N}\cdot\frac{N-r}{N}\cdot\frac{N-n}{N-1}`,
                  why: 'Drawing without putting back makes the sample a little less spread out than a binomial. The last factor is less than 1 and shrinks the variance to match.',
                },
                {
                  say: 'Work out each fraction.',
                  tex: [
                    R`\frac{r}{N} = \frac{${r}}{${N}} ${eqDec(r, N)}`,
                    R`\frac{N-r}{N} = \frac{${N - r}}{${N}} ${eqDec(N - r, N)}`,
                    R`\frac{N-n}{N-1} = \frac{${N} - ${n}}{${N} - 1} = \frac{${N - n}}{${N - 1}} ${eqDec(N - n, N - 1)}`,
                  ],
                },
                {
                  say: 'Multiply all four: tops together, bottoms together.',
                  tex: [
                    R`\operatorname{Var} X = ${n}\left(\frac{${r}}{${N}}\right)\left(\frac{${N - r}}{${N}}\right)\left(\frac{${N - n}}{${N - 1}}\right) = \frac{${n}\cdot ${r}\cdot ${N - r}\cdot ${N - n}}{${N}\cdot ${N}\cdot ${N - 1}} = \frac{${varTop}}{${varBot}}`,
                    HW.gcd(varTop, varBot) > 1 ? R`= ${frac(varTop, varBot)} ${eqDec(varTop, varBot)}` : eqDec(varTop, varBot),
                  ],
                  ...(num(npq * f2, 4) === num(V, 4) ? {} : { why: R`Keep the fractions to the end, or keep 4 decimals: rounding \(${frac(N - n, N - 1)}\) to ${num(f2, 2)} first gives ${num(npq * f2, 4)} instead of ${num(V, 4)}.` }),
                },
              ],
              trap: `Leaving off the last factor gives ${num(npq, 4)}, the binomial variance. And the bottom of that factor is N − 1 = ${N - 1}, not N.`,
            },
          ],
        }
      },
    })

  hyperBasic(54, 'Hypergeometric: values, mean, variance', { N: 20, r: 17, n: 5 })
  hyperBasic(55, 'Hypergeometric: values, mean, variance', { N: 20, r: 3, n: 5 })
  hyperBasic(56, 'Hypergeometric: values, mean, variance', { N: 20, r: 10, n: 5 })

  // ---------- 3.7 #59, #60: density, mean and variance, set-up, binomial approximation ----------
  // dir 'le' asks P[X ≤ c]; dir 'ge' asks P[X ≥ c] (through 1 − P[X ≤ c − 1]).
  // Story 0 is the homework's; twins pick 1…4. N is large so n/N ≤ .05 and the table applies.
  const SOFT_STORIES = [
    {
      text: v => R`A distributor of computer software wants to obtain some customer feedback concerning its newest package. The package has been purchased by ${big(v.N)} customers. Assume that ${big(v.r)} of these customers are dissatisfied with the product. A random sample of ${v.n} customers is questioned about the package. Let \(X\) denote the number of dissatisfied customers sampled.`,
      succ: 'dissatisfied customers', other: 'satisfied customers', pop: 'customers', oneIs: 'is dissatisfied', are: 'are dissatisfied', Ns: [3000],
    },
    {
      text: v => R`A city has ${big(v.N)} registered voters, and ${big(v.r)} of them support a new transit tax. A newspaper calls ${v.n} different voters chosen at random. Let \(X\) denote the number of supporters reached.`,
      succ: 'supporters', other: 'voters against it', pop: 'voters', oneIs: 'supports the tax', are: 'support the tax', Ns: [20000, 40000, 60000, 100000, 120000],
    },
    {
      text: v => R`A warehouse holds ${big(v.N)} phones, and ${big(v.r)} of them have a scratched screen. An inspector pulls ${v.n} phones at random for a close look. Let \(X\) denote the number of scratched phones in the sample.`,
      succ: 'scratched phones', other: 'unscratched phones', pop: 'phones', oneIs: 'is scratched', are: 'are scratched', Ns: [2000, 2400, 4000, 5000, 6000, 8000],
    },
    {
      text: v => R`A university has ${big(v.N)} students, and ${big(v.r)} of them live off campus. The student paper surveys ${v.n} different students chosen at random. Let \(X\) denote the number of off-campus students surveyed.`,
      succ: 'off-campus students', other: 'on-campus students', pop: 'students', oneIs: 'lives off campus', are: 'live off campus', Ns: [8000, 10000, 12000, 20000],
    },
    {
      text: v => R`A seed company has ${big(v.N)} packets in stock, and ${big(v.r)} of them come from a batch that failed a sprouting test. A garden store is sent ${v.n} packets picked at random. Let \(X\) denote the number of packets from the failed batch.`,
      succ: 'packets from the failed batch', other: 'good packets', pop: 'packets', oneIs: 'is from the failed batch', are: 'come from the failed batch', Ns: [2000, 4000, 5000, 6000],
    },
  ]
  const POLL_STORIES = [
    {
      text: v => R`A random telephone poll is conducted to ascertain public opinion concerning the construction of a nuclear power plant in a particular community. Assume that there are ${big(v.N)} numbers listed for private individuals and that ${big(v.r)} of these would elicit a negative response if contacted. Let \(X\) denote the number of negative responses obtained in ${v.n} calls.`,
      succ: 'numbers that would answer negatively', other: 'other numbers', pop: 'numbers', oneIs: 'answers negatively', are: 'would answer negatively', Ns: [150000],
    },
    {
      text: v => R`A county has ${big(v.N)} households, and ${big(v.r)} of them own a dog. A pet-food company calls ${v.n} different households chosen at random. Let \(X\) denote the number of dog owners reached.`,
      succ: 'dog-owning households', other: 'households without a dog', pop: 'households', oneIs: 'owns a dog', are: 'own a dog', Ns: [20000, 40000, 50000, 60000],
    },
    {
      text: v => R`A bank has ${big(v.N)} customer accounts, and ${big(v.r)} of them are set up for online banking. An auditor picks ${v.n} different accounts at random. Let \(X\) denote the number of online-banking accounts picked.`,
      succ: 'online-banking accounts', other: 'other accounts', pop: 'accounts', oneIs: 'uses online banking', are: 'use online banking', Ns: [5000, 8000, 10000, 12000],
    },
    {
      text: v => R`A state has ${big(v.N)} licensed hunters, and ${big(v.r)} of them have taken the new safety course. A game warden checks ${v.n} different hunters chosen at random. Let \(X\) denote the number who have taken the course.`,
      succ: 'hunters who took the course', other: 'hunters who didn’t', pop: 'hunters', oneIs: 'took the course', are: 'took the course', Ns: [40000, 60000, 100000, 120000],
    },
    {
      text: v => R`A library has ${big(v.N)} books, and ${big(v.r)} of them were checked out at least once last year. A librarian pulls ${v.n} different books off the shelves at random. Let \(X\) denote the number that were checked out last year.`,
      succ: 'books checked out last year', other: 'books nobody borrowed', pop: 'books', oneIs: 'was checked out', are: 'were checked out last year', Ns: [10000, 20000, 40000],
    },
  ]

  const hyperApprox = ({ no, title, dir, hw, stories }) =>
    HW.add({
      id: `3.7-${no}`,
      section: '3.7',
      num: String(no),
      group: 2,
      title,
      hw: { ...hw, s: 0 },
      twin: () => {
        for (let t = 0; t < 2000; t++) {
          const s = HW.rand.int(1, stories.length - 1)
          const n = HW.rand.pick([10, 15, 20])
          const pS = HW.rand.pick(dir === 'le' ? ['0.1', '0.2', '0.25', '0.3', '0.4', '0.5'] : ['0.3', '0.4', '0.5', '0.6', '0.7'])
          const N = HW.rand.pick(stories[s].Ns)
          const r = Math.round(+pS * N)
          const c = dir === 'le' ? HW.rand.int(1, 5) : HW.rand.int(2, 6)
          // 'ge' goes through the complement: keep it no longer than the direct sum
          if (dir === 'ge' && c > (n + 1) / 2) continue
          const P = dir === 'le' ? HW.binomTable(n, pS, c) : 1 - HW.binomTable(n, pS, c - 1)
          if (P < 0.05 || P > 0.98 || n / N > 0.05) continue
          return { N, r, n, c, s }
        }
        throw new Error('no twin found')
      },
      make: v => {
        const { N, r, n, c } = v
        const S = stories[v.s]
        const pS = HW.BINOM_PS.find(q => Math.abs(+q - r / N) < 1e-12)
        if (!pS) throw new Error(`r/N = ${r / N} is not a table column`)
        const p = +pS, q = +(1 - p).toFixed(2)
        const E = (n * r) / N, V = hyperVar(N, r, n), npq = n * p * q
        const tolVar = 0.005 // 2 decimals pass; on a huge population npq passes too (it is that close)
        const le = dir === 'le'
        const top = le ? c : c - 1 // the sum runs x = 0..top
        const xs = range(0, top)
        const f = x => HW.hyper.pmf(N, r, n, x)
        const exactCdf = xs.reduce((s, x) => s + f(x), 0)
        const exact = le ? exactCdf : 1 - exactCdf
        const F = HW.binomTable(n, pS, top)
        const approx = le ? F : 1 - F
        const askP = le ? R`P[X \le ${c}]` : R`P[X \ge ${c}]`
        const dens = (a, b) => R`\frac{\binom{${bigT(a)}}{x}\binom{${bigT(b)}}{${n} - x}}{\binom{${bigT(N)}}{${n}}}`
        const term = x => R`\frac{\binom{${bigT(r)}}{${x}}\binom{${bigT(N - r)}}{${n - x}}}{\binom{${bigT(N)}}{${n}}}`
        const fList = xs.map(x => `f(${x})`).join(' + ')
        // the density and the forms people write by mistake
        const densOpts = [
          R`f(x) = ${dens(r, N - r)}, \quad x = 0, 1, \ldots, ${n}`,
          R`f(x) = ${dens(N - r, r)}, \quad x = 0, 1, \ldots, ${n}`,
          R`f(x) = \binom{${n}}{x}(${num(p)})^{x}(${num(q)})^{${n} - x}, \quad x = 0, 1, \ldots, ${n}`,
          R`f(x) = \frac{\binom{${bigT(r)}}{x}\binom{${bigT(N - r)}}{${n} - x}}{\binom{${bigT(N)}}{${bigT(r)}}}, \quad x = 0, 1, \ldots, ${n}`,
          R`f(x) = \frac{\binom{${bigT(r)}}{x}\binom{${bigT(N - r)}}{${n}}}{\binom{${bigT(N)}}{${n}}}, \quad x = 0, 1, \ldots, ${n}`,
        ]
        const opts = []
        for (const o of densOpts) if (opts.length < 4 && !opts.includes(o)) opts.push(o)
        // the chance of a success on a later draw, at its lowest and highest
        const pLow = (r - n + 1) / (N - n + 1), pHigh = r / (N - n + 1)
        const nN = n / N
        const showTerms = xs.every(x => f(x) >= 0.001)
        // the terms to 5 decimals (6 if 5 would round the total the other way), so adding what
        // is shown gives what is shown
        const termD = [5, 6, 7].find(d => num(xs.reduce((s, x) => s + +HW.fix(f(x), d), 0), 4) === num(exact, 4)) ?? 7
        const shown = xs.map(x => HW.fix(f(x), termD)), shownSum = shown.reduce((s, t) => s + +t, 0)
        const diff = Math.abs(exact - approx)
        // (d) wants the TABLE value. tol .00045 passes it and its 3-decimal rounding (.411 for
        // .4114) but fails the exact value once that is .0005 away (.4109 in the homework).
        // A table value ending in 5 (.0905) needs .0005 so that .091 still passes.
        const tolD = Math.abs(Math.round(approx * 1000) / 1000 - approx) > 0.00045 ? 0.0005 : 0.00045
        const qS = HW.BINOM_PS.find(s => Math.abs(+s - (1 - p)) < 1e-9) // p and q swapped
        // le: the complement, X < c, only X = c, p and q swapped, X ≥ c, the exact value
        // ge: 1 − F(c), forgot the 1 −, p and q swapped, only X = c, 1 − F(c − 2), the exact value
        const tb = x => HW.binomTable(n, pS, x)
        const wrongD = (le
          ? [t4(1 - F), tb(c - 1), t4(F - tb(c - 1)), HW.binomTable(n, qS, c), t4(1 - tb(c - 1)), t4(exact)]
          : [t4(1 - tb(c)), F, t4(1 - HW.binomTable(n, qS, c - 1)), t4(tb(c) - F), t4(1 - tb(c - 2)), t4(exact)]
        ).filter(x => x > 0 && x < 1) // a table entry of 0.0000 or 1.0000 makes a silly choice
        return {
          text: S.text(v),
          parts: [
            {
              label: 'a',
              ask: R`Find the density for \(X\).`,
              skill: 'derive-pdf',
              hint: 'Is the sample drawn with or without putting anything back? Count the samples with exactly x of the r, and divide by all samples.',
              check: { type: 'choice', options: opts.map(tex => ({ tex })), correct: 0 },
              answer: R`f(x) = ${dens(r, N - r)}, \quad x = 0, 1, \ldots, ${n}`,
              steps: [
                {
                  say: R`Name the distribution. \(X\) counts ${S.succ} in a sample of \(n = ${n}\), taken without putting any back, from \(N = ${bigT(N)}\) ${S.pop}, of which \(r = ${bigT(r)}\) ${S.are}. That is hypergeometric.`,
                  why: 'A fixed group, a sample drawn without replacement, and a count of how many in the sample have some property: that is the hypergeometric set-up.',
                },
                {
                  say: R`Count the samples with exactly \(x\) ${S.succ}: choose \(x\) of the ${big(r)} ${S.succ} and the other \(${n} - x\) from the \(N - r = ${bigT(N - r)}\) ${S.other}.`,
                  tex: R`\binom{${bigT(r)}}{x}\binom{${bigT(N - r)}}{${n} - x}`,
                  why: 'Every way to pick the first group goes with every way to pick the second, so the two counts multiply.',
                },
                {
                  say: R`Divide by the number of all possible samples of ${n} from ${big(N)}.`,
                  tex: R`f(x) = ${dens(r, N - r)}`,
                  why: 'Every sample is equally likely, so the probability is (samples with x of them) / (all samples).',
                },
                {
                  say: R`Say which \(x\) are possible: from \(\max(0,\ n - (N - r))\) to \(\min(n, r)\).`,
                  tex: R`\max(0,\ ${n} - ${bigT(N - r)}) = 0, \quad \min(${n},\ ${bigT(r)}) = ${n} \quad\Rightarrow\quad x = 0, 1, \ldots, ${n}`,
                  why: `There are plenty of both kinds, so anything from none to all ${n} can turn up.`,
                },
              ],
              trap: `Not binomial: the ${S.pop} are drawn without being put back, so the exact density is hypergeometric. The binomial is only the shortcut in (d).`,
            },
            {
              label: 'b',
              ask: R`Find \(E[X]\) and \(\operatorname{Var} X\).`,
              skill: 'formulas',
              hint: 'Mean: n·r/N. Variance: n·(r/N)·((N − r)/N)·((N − n)/(N − 1)).',
              check: {
                type: 'numbers',
                items: [
                  { label: R`E[X]`, value: E, tol: 0.01, wrong: wrongs(E, 0.01, [n * q, p, npq]) },
                  { label: R`\operatorname{Var} X`, value: V, tol: tolVar, wrong: wrongs(V, tolVar, [npq, Math.sqrt(V), E, V + E * E]) },
                ],
              },
              answer: R`E[X] = ${num(E, 4)}, \quad \operatorname{Var} X \approx ${num(V, 4)}`,
              steps: [
                {
                  say: 'The hypergeometric mean is n·r/N.',
                  tex: R`E[X] = n\,\frac{r}{N} = ${n}\cdot\frac{${bigT(r)}}{${bigT(N)}} = ${n}(${num(p)}) = ${num(E, 4)}`,
                },
                {
                  say: R`The variance is the binomial \(npq\) with \(p = r/N\), times the factor \(\frac{N-n}{N-1}\).`,
                  tex: R`\operatorname{Var} X = n\cdot\frac{r}{N}\cdot\frac{N-r}{N}\cdot\frac{N-n}{N-1}`,
                },
                {
                  say: 'Work out the pieces.',
                  tex: [
                    R`n\cdot\frac{r}{N}\cdot\frac{N-r}{N} = ${n}(${num(p)})(${num(q)}) = ${num(npq, 4)}`,
                    R`\frac{N-n}{N-1} = \frac{${bigT(N - n)}}{${bigT(N - 1)}} \approx ${num((N - n) / (N - 1), 4)}`,
                  ],
                  why: 'The last factor is almost 1 because the sample is tiny next to the population. That is why the binomial works in (d).',
                },
                {
                  say: 'Multiply.',
                  tex: R`\operatorname{Var} X = ${num(npq, 4)}\cdot\frac{${bigT(N - n)}}{${bigT(N - 1)}} \approx ${num(V, 4)}`,
                },
              ],
              trap:
                Math.abs(npq - V) <= tolVar
                  ? `Don’t skip the (N − n)/(N − 1) factor in your working. Here it is so close to 1 that Var X comes out just under npq = ${num(npq, 4)}, but on a smaller population it matters.`
                  : `Var X is not just npq = ${num(npq, 4)}. The (N − n)/(N − 1) factor makes it a bit smaller.`,
            },
            {
              label: 'c',
              ask: R`Set up the calculations needed to find \(${askP}\).`,
              skill: 'disc-prob',
              hint: le ? `List the values of x that X ≤ ${c} allows, and write the density from (a) at each one.` : `X ≥ ${c} has many values. What is its opposite, and how many values does that have?`,
              check: { type: 'self' },
              answer: le
                ? R`P[X \le ${c}] = \sum_{x=0}^{${c}} ${dens(r, N - r)} \approx ${num(exact, 4)}`
                : R`P[X \ge ${c}] = 1 - \sum_{x=0}^{${c - 1}} ${dens(r, N - r)} \approx ${num(exact, 4)}`,
              steps: [
                le
                  ? {
                      say: R`\(X \le ${c}\) means \(X = ${listT(0, c)}\). Add the density from (a) at those ${words(c + 1)} values.`,
                      tex: R`P[X \le ${c}] = \sum_{x=0}^{${c}} f(x) = ${fList}`,
                    }
                  : {
                      say: R`\(X \ge ${c}\) means \(X = ${listT(c, n)}\): ${words(n - c + 1)} values. Its opposite, \(X \le ${c - 1}\), has only ${words(c)}, so use the complement.`,
                      tex: R`P[X \ge ${c}] = 1 - P[X \le ${c - 1}] = 1 - \sum_{x=0}^{${c - 1}} f(x)`,
                      why: R`Adding \(f(${c})\) through \(f(${n})\) directly is also right. The complement is just shorter to write.`,
                    },
                {
                  say: 'Write each term with the density from (a).',
                  tex: xs.map(x => R`f(${x}) = ${term(x)}`),
                  why: R`Every term has the same bottom: all \(\binom{${bigT(N)}}{${n}}\) possible samples.`,
                },
                {
                  say: R`Put it together. That is the set-up the question asks for.`,
                  tex: le ? R`P[X \le ${c}] = ${fList}` : R`P[X \ge ${c}] = 1 - \left[${fList}\right]`,
                },
                {
                  say: R`If you push it through a calculator’s nCr key, one term at a time, it comes to:`,
                  tex: le
                    ? R`P[X \le ${c}] \approx ${showTerms ? R`${shown.join(' + ')} = ${HW.fix(shownSum, termD)} \approx ` : ''}${num(exact, 4)}`
                    : R`P[X \ge ${c}] \approx 1 - ${pf(exactCdf)} \approx ${num(exact, 4)}`,
                  why: 'Keep this number. Part (d) gets nearly the same answer from the binomial table with far less work.',
                },
              ],
            },
            {
              label: 'd',
              ask: R`Use the binomial tables to approximate \(${askP}\).`,
              skill: 'binom-table',
              hint: 'Is n/N at most .05? Then use the binomial with the same n and p = r/N.',
              check: { type: 'number', value: approx, tol: tolD, wrong: wrongs(approx, tolD, wrongD, { prob: true }) },
              answer: R`${askP} \approx ${le ? '' : R`1 - ${num(F, 4)} = `}${num(approx, 4)}`,
              steps: [
                {
                  say: R`Check that the sample is small next to the population: \(n/N \le .05\).`,
                  tex: R`\frac{n}{N} = \frac{${n}}{${bigT(N)}} ${decT(nN, nN >= 0.001 ? 4 : 6)} \le 0.05`,
                  why: `Taking ${n} out of ${big(N)} barely changes the mix: the chance that the next one ${S.oneIs} stays between ${num(pLow, 4)} and ${num(pHigh, 4)} on every draw. So the draws act like independent tries with the same p, which is a binomial.`,
                },
                {
                  say: R`Use the binomial with the same \(n\) and \(p = r/N\).`,
                  tex: R`n = ${n}, \qquad p = \frac{r}{N} = \frac{${bigT(r)}}{${bigT(N)}} = ${num(p)}`,
                },
                le
                  ? {
                      say: R`The table gives \(P[X \le x]\) directly. Find the \(n = ${n}\) table, column \(p = ${num(p)}\), row ${c}.`,
                      tex: R`P[X \le ${c}] \approx F(${c}) = ${num(F, 4)}`,
                      look: HW.binomLook(n, pS, c),
                    }
                  : {
                      say: R`The table only gives \(P[X \le x]\), so use the complement: \(P[X \ge ${c}] = 1 - P[X \le ${c - 1}]\). Find the \(n = ${n}\) table, column \(p = ${num(p)}\), row ${c - 1}.`,
                      tex: R`F(${c - 1}) = ${num(F, 4)}`,
                      look: HW.binomLook(n, pS, c - 1),
                    },
                ...(le
                  ? []
                  : [
                      {
                        say: 'Subtract from 1.',
                        tex: R`P[X \ge ${c}] \approx 1 - ${num(F, 4)} = ${num(approx, 4)}`,
                      },
                    ]),
                {
                  say: 'Compare with the exact value from (c).',
                  tex: R`\text{exact} \approx ${num(exact, 4)}, \qquad \text{binomial} \approx ${num(approx, 4)}`,
                  why: +num(diff, 4) === 0
                    ? 'They agree to four decimals: that is how good the approximation is when n/N is this small.'
                    : `They differ by only about ${num(diff, 4)}: that is how good the approximation is when n/N is this small. The question says to use the table, so the answer is the table’s ${num(approx, 4)}.`,
                },
              ],
              trap: le
                ? 'Use p = r/N, the fraction of the population. n/N is only the check that the shortcut is allowed.'
                : `P[X ≥ ${c}] is 1 − F(${c - 1}), not 1 − F(${c}): X = ${c} has to stay in the answer.`,
            },
          ],
        }
      },
    })

  hyperApprox({ no: 59, title: 'Software customers', dir: 'le', hw: { N: 3000, r: 600, n: 20, c: 3 }, stories: SOFT_STORIES })
  hyperApprox({ no: 60, title: 'Telephone poll', dir: 'ge', hw: { N: 150000, r: 90000, n: 15, c: 6 }, stories: POLL_STORIES })

  // ---------- Poisson helpers ----------
  // adding e^{-k} k^x / x! for x = a..b, written the way you would on the test
  const poisSum = (k, a, b) => {
    const kT = num(k, 2), xs = range(a, b)
    const terms = xs.map(x => k ** x / HW.fact(x))
    const value = Math.exp(-k) * terms.reduce((s, t) => s + t, 0)
    // every term to the same decimals, and the total of what is shown, so the adding checks out
    const d = terms.reduce((s, t) => s + t, 0) >= 100 ? 3 : 4
    const shown = terms.map(t => Math.round(t * 10 ** d) / 10 ** d)
    const S = +shown.reduce((s, t) => s + t, 0).toFixed(d)
    const fr = x => R`\frac{${kT}^{${x}}}{${x}!}`
    const fracs = xs.length > 5 ? [fr(a), fr(a + 1), R`\cdots`, fr(b)].join(' + ') : xs.map(fr).join(' + ')
    // the powers and factorials worked out, when they are short enough to write: 1 + 10 + 100/2 + 1000/6
    const pow = x => num(k ** x, 4)
    const numFr = x => (x === 0 ? '1' : x === 1 ? kT : R`\frac{${pow(x)}}{${HW.fact(x)}}`)
    const showFr = xs.length > 1 && xs.length <= 6 && xs.some(x => x >= 2) && xs.every(x => pow(x).length <= 7 && Math.abs(+pow(x) - k ** x) < 1e-9)
    return {
      value,
      S,
      sumT: xs.length > 1 ? R`\sum_{x=${a}}^{${b}} \frac{e^{-${kT}}\,${kT}^{x}}{x!} = e^{-${kT}}\left(${fracs}\right)` : R`\frac{e^{-${kT}}\,${kT}^{${a}}}{${a}!}`,
      termsT:
        xs.length > 1
          ? [...(showFr ? [R`= e^{-${kT}}\left(${xs.map(numFr).join(' + ')}\right)`] : []), R`= e^{-${kT}}\left(${shown.map(t => num(t, d)).join(' + ')}\right)`, R`= e^{-${kT}}\,(${num(S, d)})`]
          : R`= e^{-${kT}}\cdot\frac{${pow(a)}}{${HW.fact(a)}} = e^{-${kT}}\,(${num(S, d)})`,
      mulT: R`\approx ${sciT(Math.exp(-k))} \times ${num(S, d)} \approx ${pf(value)}`,
    }
  }
  // why e^{-k} goes out front, and (when it is tiny) why to keep all its digits
  const factorWhy = kT => R`Every term has the same factor \(e^{-${kT}}\), so write it once in front: add the \(k^x/x!\) parts, then multiply by \(e^{-${kT}}\) once at the end.`
  const tinyWhy = (k, value) => {
    const e = Math.exp(-k), r4 = Math.round(e * 1e4) / 1e4
    if (e >= 0.01 || pf(r4 * (value / e)) === pf(value)) return null
    const say = R`On a calculator \(e^{-${num(k, 2)}} \approx ${e.toFixed(2 - Math.floor(Math.log10(e)))}\). Keep its digits:`
    return r4 === 0 ? `${say} rounded to 4 decimals it is 0, and so would be the answer.` : `${say} rounded to ${num(r4, 4)} it would give ${pf(r4 * (value / e))} instead of ${pf(value)}.`
  }
  const PDF_SAY = R`The Poisson pdf (it is on the formula sheet) is \(f(x) = \dfrac{e^{-k}k^x}{x!}\).`
  const poisGraph = (k, hitsLo, hitsHi, note) => {
    const top = Math.max(Number.isFinite(hitsHi) ? hitsHi + 2 : hitsLo + 4, Math.ceil(k + 3 * Math.sqrt(k)))
    const xs = range(0, top)
    return {
      kind: 'bars',
      title: `Poisson · k = ${num(k, 2)}`,
      xs,
      ys: xs.map(x => HW.pois.pmf(k, x)),
      hits: new Set(xs.filter(x => x >= hitsLo && x <= hitsHi)),
      note: note + (Number.isFinite(hitsHi) ? '' : ' (the lit bars run on forever to the right)'),
    }
  }

  // ---------- 3.8 #61 (e–i): Poisson k = 10, five probabilities ----------
  const POIS_STORIES = [
    { text: k => R`Let \(X\) be a Poisson random variable with parameter \(k = ${k}\).` },
    { text: k => R`A help desk gets an average of ${k} calls per hour, at random times. Let \(X\) be the number of calls in the next hour, so \(X\) is Poisson with \(k = ${k}\).` },
    { text: k => R`A busy intersection averages ${k} fender-benders a month. Let \(X\) be the number next month, so \(X\) is Poisson with \(k = ${k}\).` },
    { text: k => R`A bakery’s cookies average ${k} chocolate chips each. Let \(X\) be the number of chips in the cookie you pick, so \(X\) is Poisson with \(k = ${k}\).` },
    { text: k => R`A small online shop gets an average of ${k} orders a day. Let \(X\) be the number of orders tomorrow, so \(X\) is Poisson with \(k = ${k}\).` },
  ]

  HW.add({
    id: '3.8-61',
    section: '3.8',
    num: '61',
    group: 2,
    title: 'Poisson probabilities',
    hw: { k: 10, a: 4, b: 9, s: 0 },
    twin: () => {
      for (let t = 0; t < 2000; t++) {
        const k = HW.rand.pick([2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 11, 12])
        const a = HW.rand.int(2, 5), b = a + HW.rand.int(3, 5)
        const P = HW.pois.cdf
        const vals = [P(k, a), P(k, a - 1), HW.pois.pmf(k, a), 1 - P(k, a - 1), P(k, b) - P(k, a - 1)]
        if (Math.min(...vals) < 0.003 || 1 - P(k, a - 1) > 0.995 || vals[4] < 0.01) continue
        return { k, a, b, s: HW.rand.int(0, POIS_STORIES.length - 1) }
      }
      throw new Error('no twin found')
    },
    make: v => {
      const { k, a, b } = v
      const kT = num(k, 2)
      const le = poisSum(k, 0, a), lt = poisSum(k, 0, a - 1), eq = poisSum(k, a, a), mid = poisSum(k, a, b)
      const ge = 1 - lt.value
      const F = x => HW.pois.cdf(k, x), f = x => HW.pois.pmf(k, x), e0 = Math.exp(-k)
      const tol = { e: ptol(le.value), f: ptol(lt.value), g: ptol(eq.value), h: ptol(ge), i: ptol(mid.value) }
      const firstSay = (what, which) => [PDF_SAY, R`Here \(k = ${kT}\).`, what, R`Add \(f(x)\) for ${which}, and pull the common factor \(e^{-${kT}}\) out front.`].filter(Boolean).join(' ')
      return {
        text: POIS_STORIES[v.s].text(kT),
        parts: [
          {
            label: 'e',
            ask: R`Find \(P[X \le ${a}]\).`,
            skill: 'disc-prob',
            hint: `Which whole numbers are at most ${a}? Put each one into the Poisson pdf and add.`,
            // wrong: X < a, the complement, the sum started at x = 1, only the last term
            check: { type: 'number', value: le.value, tol: tol.e, wrong: wrongs(le.value, tol.e, [F(a - 1), 1 - F(a), F(a) - e0, f(a), F(a + 1)], { prob: true }) },
            answer: R`P[X \le ${a}] \approx ${pf(le.value)}`,
            steps: [
              {
                say: firstSay(R`\(X \le ${a}\) means \(X = ${listT(0, a)}\).`, R`\(x = 0\) to \(${a}\)`),
                tex: R`P[X \le ${a}] = ${le.sumT}`,
                why: R`The study guide names no Poisson table, so be ready to add the terms yourself. ${factorWhy(kT)}`,
                graph: poisGraph(k, 0, a, `lit: P[X ≤ ${a}] ≈ ${pf(le.value)}`),
              },
              { say: R`Work out each \(k^x/x!\), then add them.`, tex: le.termsT, why: R`\(k^0 = 1\) and \(0! = 1\), so the \(x = 0\) term is just 1.` },
              { say: R`Multiply by \(e^{-${kT}}\).`, tex: R`P[X \le ${a}] ${le.mulT}`, ...(tinyWhy(k, le.value) ? { why: tinyWhy(k, le.value) } : {}) },
            ],
            trap: 'Start the sum at x = 0. A Poisson count can be zero.',
          },
          {
            label: 'f',
            ask: R`Find \(P[X < ${a}]\).`,
            skill: 'disc-prob',
            hint: `X is a whole number. What is the biggest whole number less than ${a}?`,
            // wrong: kept X = a, the complement, one term short, the sum started at x = 1
            check: { type: 'number', value: lt.value, tol: tol.f, wrong: wrongs(lt.value, tol.f, [F(a), 1 - F(a - 1), F(a - 2), F(a - 1) - e0], { prob: true }) },
            answer: R`P[X < ${a}] = P[X \le ${a - 1}] \approx ${pf(lt.value)}`,
            steps: [
              {
                say: R`\(X\) only takes whole numbers, so “less than ${a}” stops at ${a - 1}.`,
                tex: R`P[X < ${a}] = P[X \le ${a - 1}]`,
                why: R`For a discrete \(X\), \(<\) and \(\le\) are different: \(X < ${a}\) leaves out \(X = ${a}\).`,
              },
              {
                say: firstSay('', R`\(x = 0\) to \(${a - 1}\)`),
                tex: R`P[X \le ${a - 1}] = ${lt.sumT}`,
                why: factorWhy(kT),
                graph: poisGraph(k, 0, a - 1, `lit: P[X < ${a}] ≈ ${pf(lt.value)}`),
              },
              { say: R`Work out each \(k^x/x!\), then add them.`, tex: lt.termsT },
              { say: R`Multiply by \(e^{-${kT}}\).`, tex: R`P[X < ${a}] ${lt.mulT}` },
            ],
            trap: `This is not the same as (e). P[X < ${a}] leaves out X = ${a}.`,
          },
          {
            label: 'g',
            ask: R`Find \(P[X = ${a}]\).`,
            skill: 'disc-prob',
            hint: `Just one term: put x = ${a} into the Poisson pdf.`,
            // wrong: no x!, the cdf instead, 1 − f, the term next door
            check: { type: 'number', value: eq.value, tol: tol.g, wrong: wrongs(eq.value, tol.g, [e0 * k ** a, F(a), 1 - f(a), f(a - 1), f(a + 1)], { prob: true }) },
            answer: R`P[X = ${a}] = \frac{e^{-${kT}}\,${kT}^{${a}}}{${a}!} \approx ${pf(eq.value)}`,
            steps: [
              {
                say: R`${PDF_SAY} Put in \(k = ${kT}\) and \(x = ${a}\).`,
                tex: R`P[X = ${a}] = f(${a}) = ${eq.sumT}`,
                graph: poisGraph(k, a, a, `lit: P[X = ${a}] ≈ ${pf(eq.value)}`),
              },
              { say: R`Work out \(${kT}^{${a}}\) and \(${a}!\).`, tex: eq.termsT },
              {
                say: R`Multiply by \(e^{-${kT}}\).`,
                tex: R`P[X = ${a}] ${eq.mulT}`,
                why: `It is also (e) minus (f): the only value in X ≤ ${a} that isn’t in X < ${a} is X = ${a}.`,
              },
            ],
            trap: R`Don’t forget to divide by \(${a}! = ${HW.fact(a)}\). Without it you get \(e^{-${kT}}\,${kT}^{${a}} \approx ${pf(Math.exp(-k) * k ** a)}\), which is far too big.`,
          },
          {
            label: 'h',
            ask: R`Find \(P[X \ge ${a}]\).`,
            skill: 'disc-prob',
            hint: `X ≥ ${a} goes on forever. What is its opposite?`,
            // wrong: 1 − (e), forgot the 1 −, only X = a
            check: { type: 'number', value: ge, tol: tol.h, wrong: wrongs(ge, tol.h, [1 - F(a), F(a - 1), f(a), 1 - F(a - 2)], { prob: true }) },
            answer: R`P[X \ge ${a}] = 1 - P[X \le ${a - 1}] \approx ${pf(ge)}`,
            steps: [
              {
                say: R`\(X \ge ${a}\) means \(X = ${a}, ${a + 1}, ${a + 2}, \ldots\) with no end. Use the complement: everything except \(X = ${listT(0, a - 1)}\).`,
                tex: R`P[X \ge ${a}] = 1 - P[X \le ${a - 1}]`,
                why: 'A Poisson X has no top value, so you can’t add up X ≥ ' + a + ' term by term. Its opposite has just ' + words(a) + ' terms.',
                graph: poisGraph(k, a, Infinity, `lit: P[X ≥ ${a}] ≈ ${pf(ge)}`),
              },
              {
                say: R`\(P[X \le ${a - 1}]\) is \(P[X < ${a}]\), which you found in (f).`,
                tex: [R`P[X \le ${a - 1}] = ${lt.sumT}`, ...[].concat(lt.termsT), R`${lt.mulT}`],
              },
              { say: 'Subtract from 1.', tex: R`P[X \ge ${a}] \approx 1 - ${pf(lt.value)} \approx ${pf(ge)}` },
            ],
            trap: `The opposite of X ≥ ${a} is X ≤ ${a - 1}, not X ≤ ${a}. Using 1 − (e) leaves out X = ${a}.`,
          },
          {
            label: 'i',
            ask: R`Find \(P[${a} \le X \le ${b}]\).`,
            skill: 'disc-prob',
            hint: `Both ends are included. List the whole numbers from ${a} to ${b} and add the pdf at each.`,
            // wrong: dropped the left end, dropped the right end, forgot to subtract, dropped both, the complement
            check: { type: 'number', value: mid.value, tol: tol.i, wrong: wrongs(mid.value, tol.i, [F(b) - F(a), F(b - 1) - F(a - 1), F(b), F(b - 1) - F(a), 1 - mid.value], { prob: true }) },
            answer: R`P[${a} \le X \le ${b}] = e^{-${kT}}\sum_{x=${a}}^{${b}} \frac{${kT}^{x}}{x!} \approx ${pf(mid.value)}`,
            steps: [
              {
                say: firstSay(R`\(${a} \le X \le ${b}\) means \(X = ${listT(a, b)}\): ${words(b - a + 1)} values, both ends included.`, R`\(x = ${a}\) to \(${b}\)`),
                tex: R`P[${a} \le X \le ${b}] = ${mid.sumT}`,
                why: `Another way is P[X ≤ ${b}] − P[X ≤ ${a - 1}], but that adds ${b + 1} terms and takes away ${a}. Adding the ${b - a + 1} you need is shorter.`,
                graph: poisGraph(k, a, b, `lit: P[${a} ≤ X ≤ ${b}] ≈ ${pf(mid.value)}`),
              },
              { say: R`Work out each \(k^x/x!\), then add them.`, tex: mid.termsT },
              { say: R`Multiply by \(e^{-${kT}}\).`, tex: R`P[${a} \le X \le ${b}] ${mid.mulT}` },
            ],
            trap: `If you subtract, take away P[X ≤ ${a - 1}], not P[X ≤ ${a}]: X = ${a} is part of the answer.`,
          },
        ],
      }
    },
  })

  // ---------- 3.8 #63, #66: name it Poisson with k = λs, then P[X ≤ c] ----------
  // Each story knows its rate unit and how long or big the region is. A story with
  // `perHour` gives the rate per hour and the stretch in minutes: s = minutes / 60.
  // (no rate of exactly 1: the stories would say "1 flaws per square yard")
  const rateStory = o => ({ lams: [1.5, 2, 2.5, 3], lens: [2, 3, 4, 5, 6], ...o })
  const ZIRCON_STORIES = [
    rateStory({
      text: v => R`Geophysicists determine the age of a zircon by counting the number of uranium fission tracks on a polished surface. A particular zircon is of such an age that the average number of tracks per square centimeter is ${words(v.lam)}. What is the probability that a ${v.len}-centimeter-square sample of this zircon will reveal at most ${words(v.c)} tracks, thus leading to an underestimation of the age of the material?`,
      events: 'tracks', where: 'on the sample', per: 'square centimeter', rateT: R`\text{tracks per cm}^2`, sT: v => R`${v.len}\ \text{cm}^2`,
      sWords: v => `${v.len} square centimeters`,
      sName: 'the area of the sample',
      sWhy: v => `Read “${v.len}-centimeter-square sample” as ${v.len} square centimeters of surface, so s = ${v.len} cm². That is how the book’s answer reads it. It does not mean a ${v.len} cm by ${v.len} cm square (that would be ${v.len * v.len} cm²).`,
      lams: [2, 3, 4, 5, 6], lens: [2, 3],
    }),
    rateStory({
      text: v => R`A glass plant makes window panes that have an average of ${num(v.lam)} tiny bubbles per square meter. What is the probability that a ${v.len}-square-meter pane has at most ${words(v.c)} bubbles?`,
      events: 'bubbles', where: 'in the pane', per: 'square meter', rateT: R`\text{bubbles per m}^2`, sT: v => R`${v.len}\ \text{m}^2`,
      sWords: v => `${v.len} square meters`,
      sName: 'the area of the pane',
      lams: [0.5, 1.5, 2, 2.5, 3], lens: [2, 3, 4, 5, 6],
    }),
    rateStory({
      text: v => R`After the winter, a county road averages ${num(v.lam)} potholes per mile. An inspector drives a ${v.len}-mile stretch. What is the probability that she finds at most ${words(v.c)} potholes?`,
      events: 'potholes', where: 'on the stretch', per: 'mile', rateT: R`\text{potholes per mile}`, sT: v => R`${v.len}\ \text{miles}`,
      sWords: v => `${v.len} miles`,
      sName: 'the length of road',
      lams: [0.5, 1.5, 2, 2.5, 3], lens: [2, 3, 4, 5, 6],
    }),
    rateStory({
      text: v => R`Water from a well has an average of ${num(v.lam)} bacteria colonies per milliliter. A lab tests a ${v.len}-milliliter sample. What is the probability that the sample shows at most ${words(v.c)} colonies?`,
      events: 'colonies', where: 'in the sample', per: 'milliliter', rateT: R`\text{colonies per mL}`, sT: v => R`${v.len}\ \text{mL}`,
      sWords: v => `${v.len} milliliters`,
      sName: 'the volume of the sample',
      lams: [1.5, 2, 2.5, 3, 4, 5], lens: [2, 3, 4],
    }),
    rateStory({
      text: v => R`A bolt of fabric has an average of ${num(v.lam)} flaws per square yard. A tablecloth is cut from ${v.len} square yards of it. What is the probability that the tablecloth has at most ${words(v.c)} flaws?`,
      events: 'flaws', where: 'in the tablecloth', per: 'square yard', rateT: R`\text{flaws per yd}^2`, sT: v => R`${v.len}\ \text{yd}^2`,
      sWords: v => `${v.len} square yards`,
      sName: 'the area of the tablecloth',
      lams: [0.5, 1.5, 2, 2.5], lens: [2, 3, 4, 6],
    }),
  ]
  const BURR_STORIES = [
    rateStory({
      text: v => R`A burr is a thin ridge or rough area that occurs when shaping a metal part. These must be removed by hand or by means of some newer method such as water jets, thermal energy, or electrochemical processing before the part can be used. Assume that a part used in automatic transmissions typically averages ${words(v.lam)} burrs each. What is the probability that the total number of burrs found on ${words(v.len)} randomly selected parts will be at most ${words(v.c)}?`,
      events: 'burrs', where: 'on the parts', per: 'part', rateT: R`\text{burrs per part}`, sT: v => R`${v.len}\ \text{parts}`,
      sWords: v => `${words(v.len)} parts`,
      sName: 'the number of parts',
      lams: [1.5, 2, 2.5, 3], lens: [3, 4, 5, 6, 8],
    }),
    rateStory({
      text: v => R`A writer’s first drafts average ${num(v.lam)} typos per page. What is the probability that a ${v.len}-page chapter has at most ${words(v.c)} typos in total?`,
      events: 'typos', where: 'in the chapter', per: 'page', rateT: R`\text{typos per page}`, sT: v => R`${v.len}\ \text{pages}`,
      sWords: v => `${v.len} pages`,
      sName: 'the number of pages',
      lams: [0.5, 1.5, 2, 2.5, 3], lens: [3, 4, 5, 6, 8, 10],
    }),
    rateStory({
      text: v => R`A bakery’s oatmeal cookies average ${num(v.lam)} raisins each. What is the probability that a bag of ${words(v.len)} cookies has at most ${words(v.c)} raisins in total?`,
      events: 'raisins', where: 'in the bag', per: 'cookie', rateT: R`\text{raisins per cookie}`, sT: v => R`${v.len}\ \text{cookies}`,
      sWords: v => `${words(v.len)} cookies`,
      sName: 'the number of cookies',
      lams: [2, 3, 4, 5], lens: [2, 3],
    }),
    rateStory({
      text: v => R`A hockey team scores an average of ${num(v.lam)} goals per game. What is the probability that it scores at most ${words(v.c)} goals in total over its next ${words(v.len)} games?`,
      events: 'goals', where: 'over the games', per: 'game', rateT: R`\text{goals per game}`, sT: v => R`${v.len}\ \text{games}`,
      sWords: v => `${words(v.len)} games`,
      sName: 'the number of games',
      lams: [2, 2.5, 3, 3.5], lens: [2, 3, 4],
    }),
    rateStory({
      text: v => R`A help desk gets an average of ${v.lam} calls per hour, at random times. What is the probability that at most ${words(v.c)} calls come in during a ${v.len}-minute stretch?`,
      events: 'calls', where: 'in the stretch', per: 'hour', rateT: R`\text{calls per hour}`, perHour: true,
      sT: v => R`${v.len}\ \text{min} = \frac{${v.len}}{60}\ \text{hour}${Number.isInteger((v.len / 60) * 100) ? R` = ${num(v.len / 60)}\ \text{hour}` : ''}`,
      sWords: v => `${v.len} minutes`,
      sName: 'the length of time',
      sWhy: () => 'The rate is per hour, so the length has to be in hours too. Change the minutes to hours first.',
      lams: [6, 8, 10, 12, 15, 18, 20, 24, 30], lens: [10, 15, 20, 30, 40, 45],
    }),
  ]

  const clean = x => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9 // at most 2 decimals
  const poisRate = ({ no, title, hw, stories }) =>
    HW.add({
      id: `3.8-${no}`,
      section: '3.8',
      num: String(no),
      group: 2,
      title,
      hw: { ...hw, s: 0 },
      twin: () => {
        for (let t = 0; t < 2000; t++) {
          const s = HW.rand.int(0, stories.length - 1), S = stories[s]
          const lam = HW.rand.pick(S.lams), len = HW.rand.pick(S.lens)
          const k = +(lam * len * (S.perHour ? 1 / 60 : 1)).toFixed(6)
          if (!clean(k) || k < 2 || k > 15) continue
          const c = HW.rand.int(2, 5)
          if (c >= k) continue
          const P = HW.pois.cdf(k, c)
          if (P < 0.001 || P > 0.6) continue
          if (s === 0 && lam === hw.lam && len === hw.len && c === hw.c) continue
          return { lam, len, c, s }
        }
        throw new Error('no twin found')
      },
      make: v => {
        const { lam, len, c } = v
        const S = stories[v.s]
        const sVal = S.perHour ? len / 60 : len
        const k = +(lam * sVal).toFixed(6), kT = num(k, 2), lamT = num(lam)
        const sNumT = S.perHour ? R`\frac{${len}}{60}` : String(len)
        const sum = poisSum(k, 0, c), tolB = ptol(sum.value)
        // the label and the parameters people pick by mistake
        const kOpts = [kT, lamT]
        if (S.perHour) kOpts.push(num(lam * len))
        else if (clean(lam / len)) kOpts.push(num(lam / len))
        else if (len !== lam && len !== k) kOpts.push(String(len))
        const opts = [...kOpts.map(x => R`\text{Poisson},\ k = ${x}`), R`\text{exponential},\ \beta = \frac{1}{${lamT}}`]
        return {
          text: S.text(v),
          parts: [
            {
              label: 'a',
              ask: R`Let \(X\) be the number of ${S.events} ${S.where}. What distribution does \(X\) have, and what is its parameter?`,
              skill: 'label',
              hint: 'X counts events that happen at an average rate. The rate is for one unit: how many units does the question cover?',
              check: { type: 'choice', options: opts.map(tex => ({ tex })), correct: 0 },
              answer: R`X \text{ is Poisson with } k = \lambda s = ${kT}`,
              steps: [
                {
                  say: R`\(X\) counts ${S.events} over ${S.sWords(v)}, and the story gives the average number per ${S.per}. Counting events in a stretch of time or space at an average rate is the Poisson set-up.`,
                  why: 'There is no fixed number of tries with a success or failure on each, so it isn’t binomial: the events just happen at random, at some average rate.',
                },
                {
                  say: R`Read off the rate \(\lambda\) and \(s\), ${S.sName}.`,
                  tex: R`\lambda = ${lamT}\ ${S.rateT}, \qquad s = ${S.sT(v)}`,
                  ...(S.sWhy ? { why: S.sWhy(v) } : {}),
                },
                {
                  say: R`The Poisson parameter \(k\) is the average number of ${S.events} in ${S.sWords(v)}: \(k = \lambda s\).`,
                  tex: R`k = \lambda s = ${lamT}\cdot ${sNumT} = ${kT}`,
                  why: `${lamT} ${S.events} per ${S.per}, over ${S.sWords(v)}, gives ${kT} ${S.events} on average.`,
                },
              ],
              trap: `k is not ${lamT}: that is the average for one ${S.per}. You want the average for ${S.sWords(v)}${S.perHour ? ` (${len}/60 of an hour)` : ''}, so multiply by s. And it isn’t exponential: the exponential is the wait until the first event, not a count.`,
            },
            {
              label: 'b',
              ask: R`Answer the question: find \(P[X \le ${c}]\).`,
              skill: 'disc-prob',
              hint: `“At most ${words(c)}” means X = ${range(0, c).join(', ')}. Use the Poisson pdf with the k from (a).`,
              // wrong: k = λ (forgot s), X < c, the complement, only X = c
              check: { type: 'number', value: sum.value, tol: tolB, wrong: wrongs(sum.value, tolB, [HW.pois.cdf(lam, c), HW.pois.cdf(k, c - 1), 1 - sum.value, HW.pois.pmf(k, c)], { prob: true }) },
              answer: R`P[X \le ${c}] = e^{-${kT}}\sum_{x=0}^{${c}} \frac{${kT}^{x}}{x!} \approx ${pf(sum.value)}`,
              steps: [
                {
                  say: R`From (a), \(X\) is Poisson with \(k = ${kT}\). ${PDF_SAY} “At most ${words(c)}” means \(X \le ${c}\): add \(f(0)\) through \(f(${c})\), with \(e^{-${kT}}\) pulled out front.`,
                  tex: R`P[X \le ${c}] = ${sum.sumT}`,
                  why: R`There is no Poisson table on this test, so you add the terms yourself. ${factorWhy(kT)}`,
                  graph: poisGraph(k, 0, c, `lit: P[X ≤ ${c}] ≈ ${pf(sum.value)}`),
                },
                { say: R`Work out each \(k^x/x!\), then add them.`, tex: sum.termsT, why: R`\(k^0 = 1\) and \(0! = 1\), so the \(x = 0\) term is just 1.` },
                { say: R`Multiply by \(e^{-${kT}}\).`, tex: R`P[X \le ${c}] ${sum.mulT}`, ...(tinyWhy(k, sum.value) ? { why: tinyWhy(k, sum.value) } : {}) },
              ],
              trap: '“At most” includes 0. Start the sum at x = 0, not x = 1.',
            },
          ],
        }
      },
    })

  poisRate({ no: 63, title: 'Zircon fission tracks', hw: { lam: 5, len: 2, c: 3 }, stories: ZIRCON_STORIES })
  poisRate({ no: 66, title: 'Burrs on parts', hw: { lam: 2, len: 7, c: 4 }, stories: BURR_STORIES })
})()
