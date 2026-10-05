// Group 1: discrete pdfs, cdfs and MGFs (3.4 #24, 25, 27, 31; 3.5 #36, 43)
;(() => {
  const R = String.raw
  const { num, frac } = HW

  // ---------- helpers ----------
  const dec = x => num(x, 4).replace(/^0\./, '.') // .05, the way the book writes it
  const ends = x => Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6 // has at most 4 decimals
  // n/d for the middle of a line: a short decimal when it ends, else the fraction
  const T = (n, d) => (ends(n / d) ? num(n / d, 4) : frac(n, d))
  // what goes after T(n, d) at the end of a line: nothing, or ≈ the decimal
  const A = (n, d) => (ends(n / d) ? '' : R` \approx ${num(n / d, 4)}`)
  const eq = x => (ends(x) ? '=' : R`\approx`)
  const eq6 = x => (Math.abs(x * 1e6 - Math.round(x * 1e6)) < 1e-6 ? '=' : R`\approx`) // the same, for 6 decimals
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
  // e^{xt} in TeX, '' when x = 0 (the term is then just its number)
  const ex = x => (x === 0 ? '' : x === 1 ? 'e^{t}' : `e^{${x}t}`)
  // a coefficient in front of e^t: 1 is not written
  const co = n => (n === 1 ? '' : String(n))
  // the geometric pdf as bars, x = 1 … 12, with the asked bars lit
  const geoBars = (p, hit, note) => {
    const xs = Array.from({ length: 12 }, (_, i) => i + 1)
    return { kind: 'bars', title: `geometric · p = ${num(p)}`, xs, ys: xs.map(x => (1 - p) ** (x - 1) * p), hits: new Set(xs.filter(hit)), note }
  }
  // a tolerance that lets every 2-decimal or 3-significant-figure rounding pass
  const rtol = x => Math.max(0.01, +(Math.abs(x) * 0.003).toPrecision(1))
  // the arcade's wrong choices: drop any that land on the answer, repeats and negatives; keep 5
  const W = (value, tol, cands) => {
    const out = [], seen = new Set()
    for (const c of cands) {
      if (!Number.isFinite(c) || c < 0 || Math.abs(c - value) <= 2 * tol) continue
      const k = +c.toPrecision(4)
      if (seen.has(k)) continue
      seen.add(k)
      out.push(c)
    }
    return out.slice(0, 5)
  }
  // geometric with chance p: the four moments, each with its tolerance and the usual slips
  const geoChecks = (p, { mean, varX, ex2, sd }) => {
    const q = 1 - p
    const it = (label, value, cands) => ({ label, value, tol: rtol(value), wrong: W(value, rtol(value), cands) })
    return [
      // p and q swapped; q/p; the chance p itself
      it(R`E[X]`, mean, [1 / q, q / p, p]),
      // forgot the variance; forgot the mean²; added σ instead of σ²
      it(R`E[X^2]`, ex2, [mean * mean, varX, sd + mean * mean]),
      // forgot to square p; forgot q; σ for σ²; E[X²]
      it(R`\sigma^2`, varX, [q / p, 1 / (p * p), sd, ex2]),
      // σ² for σ; √E[X²]; √(q/p); the mean
      it(R`\sigma`, sd, [varX, Math.sqrt(ex2), Math.sqrt(q / p), mean]),
    ]
  }
  // P[X ≥ m] for a geometric: the slips are one more failure, the complement, P[X = m], P[X ≤ m]
  const atLeastWrong = (p, m, tol) => {
    const q = 1 - p
    return W(q ** (m - 1), tol, [q ** m, 1 - q ** (m - 1), q ** (m - 1) * p, 1 - q ** m])
  }
  // the steps for P[X ≥ m], m ≥ 2: complement, the pdf values, subtract, then the shortcut.
  // pW and qW are p and q as TeX, already in brackets; fails(k) says "the first k tries fail" in the story's words.
  const atLeastSteps = ({ m, p, pW, qW, fails }) => {
    const q = 1 - p
    const below = Array.from({ length: m - 1 }, (_, i) => i + 1) // x = 1 … m − 1
    const terms = below.map(x => q ** (x - 1) * p)
    const atLeast = q ** (m - 1)
    return [
      {
        say: `“At least ${m}” is X ≥ ${m}. Use the complement: X ≥ ${m} is everything except X = ${below.join(', ')}.`,
        tex: R`P[X \ge ${m}] = 1 - P[X \le ${m - 1}] = 1 - ${below.length > 1 ? R`\left[${below.map(x => `f(${x})`).join(' + ')}\right]` : 'f(1)'}`,
        why: `X ≥ ${m} has infinitely many values to add up. Its opposite has just ${WORDS[m - 1]}.`,
        graph: geoBars(p, x => x >= m, `lit: x ≥ ${m} (and on forever), total ${num(atLeast, 4)}`),
      },
      {
        say: 'Get each of those values from the pdf f(x) = q^(x−1)·p.',
        tex: below.map((x, i) => R`f(${x}) = ${qW}^{${x - 1}}${pW} ${eq6(terms[i])} ${num(terms[i], 6)}`),
      },
      {
        say: 'Subtract their total from 1.',
        tex: below.length > 1
          ? R`P[X \ge ${m}] = 1 - (${terms.map(t => num(t, 6)).join(' + ')}) ${eq6(1 - atLeast)} 1 - ${num(1 - atLeast, 6)} ${eq(atLeast)} ${num(atLeast, 4)}`
          : R`P[X \ge ${m}] = 1 - ${num(terms[0], 6)} ${eq(atLeast)} ${num(atLeast, 4)}`,
      },
      {
        say: `Check it a faster way: X ≥ ${m} happens exactly when ${fails(m - 1)}.`,
        tex: R`P[X \ge ${m}] = q^{${m - 1}} = ${qW}^{${m - 1}} ${eq(atLeast)} ${num(atLeast, 4)}`,
        why: 'Each of those tries is a failure with chance q, and they are independent, so multiply. Same answer, and quicker on a test.',
      },
    ]
  }

  // ---------- 3.4 #24: wildcat wells (geometric) ----------
  // p = a/b. Each story says what one try is, what success is, and what X counts.
  // ok(p): the chances that make sense for the story (twins only use those).
  const WELL_STORIES = [
    {
      story: p => R`The probability that a wildcat well will be productive is \(${p}\). Assume that a group is drilling wells in various parts of the country so that the status of one well has no bearing on that of any other. Let \(X\) denote the number of wells drilled to obtain the first strike.`,
      ok: () => true,
      success: 'a productive well (a strike)',
      tries: 'wells drilled',
      indep: 'the status of one well has no bearing on any other',
      fails: k => (k === 1 ? 'the first well is dry' : `the first ${k} wells are ${k === 2 ? 'both' : 'all'} dry`),
    },
    {
      story: p => R`A basketball player makes each free throw with probability \(${p}\), and one shot has no effect on the next. Let \(X\) denote the number of free throws taken until the player makes the first one.`,
      ok: p => p >= 1 / 3,
      success: 'a made free throw',
      tries: 'free throws',
      indep: 'one shot has no effect on the next',
      fails: k => (k === 1 ? 'the player misses the first free throw' : `the player misses the first ${k} free throws`),
    },
    {
      story: p => R`Each scratch-off ticket sold at a gas station is a winner with probability \(${p}\), independently of every other ticket. Let \(X\) denote the number of tickets a customer buys to get the first winner.`,
      ok: p => p <= 0.25,
      success: 'a winning ticket',
      tries: 'tickets bought',
      indep: 'tickets are independent of each other',
      fails: k => (k === 1 ? 'the first ticket is a loser' : `the first ${k} tickets are ${k === 2 ? 'both' : 'all'} losers`),
    },
    {
      story: p => R`A help line is busy so often that each call gets through with probability \(${p}\), and the calls are independent. Let \(X\) denote the number of calls a customer makes until one gets through.`,
      ok: p => p <= 0.5,
      success: 'a call that gets through',
      tries: 'calls made',
      indep: 'the calls are independent',
      fails: k => (k === 1 ? 'the first call does not get through' : `none of the first ${k} calls gets through`),
    },
  ]
  const geoMoments = (a, b) => {
    // p = a/b: mean 1/p = b/a, Var q/p² = (b − a)b/a², E[X²] = Var + mean²
    const mean = b / a, varX = ((b - a) * b) / (a * a)
    return { mean, varX, ex2: varX + mean * mean, sd: Math.sqrt(varX) }
  }

  HW.add({
    id: '3.4-24',
    section: '3.4',
    num: '24',
    group: 1,
    title: 'Wildcat wells',
    hw: { a: 1, b: 13, s: 0, m: 2 },
    twin: () => {
      const [a, b] = HW.rand.pick([[1, 4], [1, 5], [1, 6], [1, 8], [1, 10], [1, 20], [2, 5], [3, 10], [3, 4], [1, 3], [2, 7]])
      // a story whose chance makes sense (never the homework's own wells)
      const ok = WELL_STORIES.map((S, i) => i).filter(i => i > 0 && WELL_STORIES[i].ok(a / b))
      return { a, b, s: HW.rand.pick(ok), m: HW.rand.int(2, 4) }
    },
    make: v => {
      const { a, b, m } = v
      const S = WELL_STORIES[v.s]
      const p = frac(a, b), q = frac(b - a, b)
      const pv = a / b
      const mo = geoMoments(a, b)
      const { mean, varX, ex2, sd } = mo
      // P(X ≥ m) = q^(m−1): the first m − 1 tries all fail
      const atLeast = ((b - a) / b) ** (m - 1)
      const meanT = frac(b, a), varT = frac((b - a) * b, a * a), ex2T = frac((2 * b - a) * b, a * a)
      const tMax = R`t < -\ln\left(${q}\right) = \ln\left(${frac(b, b - a)}\right) \approx ${num(-Math.log((b - a) / b), 4)}`
      const mgfClean = R`\frac{${co(a)}e^t}{${b} - ${co(b - a)}e^t}`
      return {
        text: S.story(p),
        parts: [
          {
            label: 'a',
            ask: R`Verify that \(X\) is geometric, and identify the value of the parameter \(p\).`,
            skill: 'label',
            hint: 'What does X count: successes in a fixed number of tries, or tries until the first success?',
            check: {
              type: 'choice',
              options: [
                { tex: R`\text{geometric},\ p = ${p}` },
                { tex: R`\text{geometric},\ p = ${q}` },
                { tex: R`\text{binomial},\ n = ${b},\ p = ${p}` },
                { tex: R`\text{Poisson},\ k = ${p}` },
              ],
              correct: 0,
            },
            answer: R`X \text{ is geometric with } p = ${p}`,
            steps: [
              {
                say: `Ask what X counts. Here it counts ${S.tries} until the first success. There is no fixed number of tries: X can be 1, 2, 3, and so on.`,
                why: 'Counting tries until the FIRST success is exactly what a geometric random variable does.',
              },
              {
                say: 'Check the three things a geometric needs.',
                tex: [
                  R`\text{1. Each try is a success or a failure.}`,
                  R`\text{2. The tries are independent.}`,
                  R`\text{3. Every try has the same chance of success } p.`,
                ],
                why: `The story gives all three: each try either is ${S.success} or isn't, ${S.indep}, and the chance is always \\(${p}\\).`,
              },
              {
                say: `Success is ${S.success}, so p is its chance.`,
                tex: R`p = ${p}`,
              },
            ],
            trap: 'Not binomial: a binomial has a fixed number of tries n and counts successes. Here the number of tries is what X counts.',
          },
          {
            label: 'b',
            ask: R`What is the exact expression for the density for \(X\)?`,
            skill: 'derive-pdf',
            hint: 'X = x means x − 1 failures in a row, then a success.',
            check: {
              type: 'choice',
              options: [
                { tex: R`f(x) = \left(${q}\right)^{x-1}\left(${p}\right), \quad x = 1, 2, 3, \ldots` },
                { tex: R`f(x) = \left(${p}\right)^{x-1}\left(${q}\right), \quad x = 1, 2, 3, \ldots` },
                { tex: R`f(x) = \left(${q}\right)^{x}\left(${p}\right), \quad x = 1, 2, 3, \ldots` },
                { tex: R`f(x) = \left(${q}\right)^{x-1}\left(${p}\right), \quad x = 0, 1, 2, \ldots` },
              ],
              correct: 0,
            },
            answer: R`f(x) = \left(${q}\right)^{x-1}\left(${p}\right), \quad x = 1, 2, 3, \ldots`,
            steps: [
              {
                say: 'Find q, the chance of a failure.',
                tex: R`q = 1 - p = 1 - ${p} = ${q}`,
              },
              {
                say: 'X = x means the first x − 1 tries fail and try x succeeds.',
                tex: R`P[X = x] = \underbrace{q \cdot q \cdots q}_{x-1 \text{ failures}} \cdot p = q^{x-1}p`,
                why: 'The tries are independent, so the chances multiply.',
              },
              {
                say: 'Put in the numbers, and say which x are possible.',
                tex: R`f(x) = \left(${q}\right)^{x-1}\left(${p}\right), \quad x = 1, 2, 3, \ldots`,
                why: 'The first success can come on try 1 at the earliest, and there is no last try.',
              },
            ],
            trap: 'The power is x − 1, not x: on try x there are only x − 1 failures before the success.',
          },
          {
            label: 'c',
            ask: R`What is the exact expression for the moment generating function for \(X\)?`,
            skill: 'geo-mgf',
            hint: 'Write m(t) = E[e^(tX)] as a sum, pull out p·e^t, and use the geometric series.',
            check: {
              type: 'choice',
              options: [
                { tex: R`m_X(t) = \dfrac{${p}\,e^t}{1 - ${q}\,e^t}` },
                { tex: R`m_X(t) = \dfrac{${q}\,e^t}{1 - ${p}\,e^t}` },
                { tex: R`m_X(t) = \dfrac{${p}}{1 - ${q}\,e^t}` },
                { tex: R`m_X(t) = \left(${q} + ${p}\,e^t\right)^{${b}}` },
              ],
              correct: 0,
            },
            answer: R`m_X(t) = \dfrac{${p}\,e^t}{1 - ${q}\,e^t} = ${mgfClean}, \quad ${tMax}`,
            steps: [
              {
                say: 'Start from the definition: the MGF is the expected value of e^(tX). For a discrete X that is a sum over every x.',
                tex: R`m_X(t) = E\left[e^{tX}\right] = \sum_{x=1}^{\infty} e^{tx}\, q^{x-1} p`,
              },
              {
                say: 'Write e^(tx) as e^t · e^(t(x−1)), so it has the same power x − 1 as q. Then pull pe^t, which doesn’t change with x, out of the sum.',
                tex: [R`e^{tx}\,q^{x-1}p = pe^t \cdot e^{t(x-1)}q^{x-1} = pe^t\left(qe^t\right)^{x-1}`, R`m_X(t) = pe^t \sum_{x=1}^{\infty} \left(qe^t\right)^{x-1}`],
                why: 'Now every term is the same number, qe^t, to the power x − 1: a geometric series.',
              },
              {
                say: 'Use the infinite geometric series from the formula sheet, with a = 1 and r = qe^t.',
                tex: [R`\sum_{k=1}^{\infty} ar^{k-1} = \frac{a}{1 - r}`, R`m_X(t) = pe^t \cdot \frac{1}{1 - qe^t} = \frac{pe^t}{1 - qe^t}`],
                why: 'The series only adds up when r < 1, that is qe^t < 1, so t < −ln q.',
              },
              {
                say: `Put in p and q. Multiplying top and bottom by ${b} clears the small fractions.`,
                tex: R`m_X(t) = \frac{${p}\,e^t}{1 - ${q}\,e^t} = ${mgfClean}, \quad ${tMax}`,
              },
            ],
            trap: 'p goes on top with e^t (the success), q goes in the bottom with e^t. Swapping them is the usual slip.',
          },
          {
            label: 'd',
            ask: R`What are the numerical values of \(E[X]\), \(E[X^2]\), \(\sigma^2\), and \(\sigma\)?`,
            skill: 'formulas',
            hint: 'Geometric: E[X] = 1/p and Var X = q/p². Then E[X²] = Var X + (E[X])².',
            check: { type: 'numbers', items: geoChecks(pv, mo) },
            answer: R`E[X] = ${meanT},\ E[X^2] = ${ex2T},\ \sigma^2 = ${varT},\ \sigma \approx ${num(sd, 2)}`,
            steps: [
              {
                say: 'The geometric mean is 1/p.',
                tex: R`E[X] = \frac{1}{p} = \frac{1}{${p}} = ${meanT}${Number.isInteger(mean) ? '' : R` \approx ${num(mean, 4)}`}`,
                why: a === 1 ? `If 1 try in ${b} succeeds, you wait ${b} tries for a success on average.` : 'The rarer a success is, the longer you wait: the mean is 1 over the chance.',
              },
              {
                say: 'The geometric variance is q/p².',
                tex: R`\sigma^2 = \frac{q}{p^2} = \frac{${q}}{\left(${p}\right)^2} = ${varT}${Number.isInteger(varX) ? '' : R` \approx ${num(varX, 4)}`}`,
                why: 'Neither 1/p nor q/p² is on the formula sheet, so learn them. Both come from the geometric MGF: E[X] = m′(0), and σ² = m″(0) − (m′(0))².',
              },
              {
                say: 'Get E[X²] by turning the variance formula around.',
                tex: R`\sigma^2 = E[X^2] - (E[X])^2 \;\Rightarrow\; E[X^2] = \sigma^2 + (E[X])^2 = ${varT} + \left(${meanT}\right)^2 = ${ex2T}${Number.isInteger(ex2) ? '' : R` \approx ${num(ex2, 4)}`}`,
              },
              {
                say: 'σ is the square root of the variance.',
                tex: R`\sigma = \sqrt{${varT}} \approx ${num(sd, 4)}`,
              },
            ],
            trap: 'E[X²] is not (E[X])². They differ by exactly the variance.',
          },
          {
            label: 'e',
            ask: m === 2 ? R`Find \(P[X \ge 2]\).` : R`Find \(P[X \ge ${m}]\).`,
            skill: 'disc-prob',
            hint: m === 2 ? 'The opposite of X ≥ 2 is X = 1.' : `The opposite of X ≥ ${m} is X ≤ ${m - 1}. Or: X ≥ ${m} means the first ${m - 1} tries all fail.`,
            check: { type: 'number', value: atLeast, tol: 0.0005, wrong: atLeastWrong(pv, m, 0.0005) },
            answer: m === 2 ? R`P[X \ge 2] = ${q} ${eq(atLeast)} ${num(atLeast, 4)}` : R`P[X \ge ${m}] = \left(${q}\right)^{${m - 1}} ${eq(atLeast)} ${num(atLeast, 4)}`,
            steps: m === 2
              ? [
                  {
                    say: 'Use the complement: X ≥ 2 is everything except X = 1.',
                    tex: R`P[X \ge 2] = 1 - P[X = 1]`,
                    why: 'X ≥ 2 has infinitely many values to add up. Its opposite has just one.',
                  },
                  {
                    say: 'P[X = 1] is the pdf at x = 1: no failures, then a success.',
                    tex: R`P[X = 1] = q^{0} p = ${p}`,
                  },
                  {
                    say: 'Subtract.',
                    tex: R`P[X \ge 2] = 1 - ${p} = ${q} ${eq(atLeast)} ${num(atLeast, 4)}`,
                  },
                ]
              : atLeastSteps({ m, p: pv, pW: R`\left(${p}\right)`, qW: R`\left(${q}\right)`, fails: S.fails }),
            trap: `“At least ${m}” includes ${m} itself, so the complement stops at ${m - 1}: use 1 − P[X ≤ ${m - 1}], not 1 − P[X ≤ ${m}].`,
          },
        ],
      }
    },
  })

  // ---------- 3.4 #25 and #27: coating runs (geometric; "success" is the BAD outcome) ----------
  // p = P/100. In every story the thing X waits for is bad news, like the homework's
  // unacceptable lot, so the student has to decide what "success" means.
  const LOT_STORIES = [
    {
      story: p => R`The zinc-phosphate coating on the threads of steel tubes used in oil and gas wells is critical to their performance. To monitor the coating process, an uncoated metal sample with known outside area is weighed and treated along with the lot of tubing. This sample is then stripped and reweighed. From this it is possible to determine whether or not the proper amount of coating was applied to the tubing. Assume that the probability that a given lot is unacceptable is \(${p}\). Let \(X\) denote the number of runs conducted to produce an unacceptable lot. Assume that the runs are independent in the sense that the outcome of one run has no effect on that of any other.`,
      success: 'an unacceptable lot',
      other: 'an acceptable lot',
      first: 'unacceptable lot',
      unit: 'runs',
      each: 'each run gives either an unacceptable lot or an acceptable one',
      indep: 'the outcome of one run has no effect on that of any other',
      atLeast: m => `the number of runs required to produce an unacceptable lot is at least ${m}`,
      atMost: m => `at most ${WORDS[m]} runs are required to produce an unacceptable lot`,
      fails: k => (k === 1 ? 'the first run gives an acceptable lot' : `the first ${k} runs ${k === 2 ? 'both' : 'all'} give acceptable lots`),
    },
    {
      story: p => R`A bottling plant weighs every case that comes off its line. The probability that a given case is short-filled (at least one bottle under weight) is \(${p}\), and one case has no effect on any other. Let \(X\) denote the number of cases filled to produce the first short-filled case.`,
      success: 'a short-filled case',
      other: 'a properly filled case',
      first: 'short-filled case',
      unit: 'cases',
      each: 'each case is either short-filled or properly filled',
      indep: 'one case has no effect on any other',
      atLeast: m => `the number of cases filled to produce the first short-filled case is at least ${m}`,
      atMost: m => `at most ${WORDS[m]} cases are filled to produce the first short-filled case`,
      fails: k => (k === 1 ? 'the first case is properly filled' : `the first ${k} cases are ${k === 2 ? 'both' : 'all'} properly filled`),
    },
    {
      story: p => R`A software team builds its app and runs the full test suite every night. The probability that a given night's build fails the tests is \(${p}\), and one night has no effect on another. Let \(X\) denote the number of nights until the first failed build.`,
      success: 'a failed build',
      other: 'a build that passes',
      first: 'failed build',
      unit: 'nights',
      each: 'each night’s build either fails or passes',
      indep: 'one night has no effect on another',
      atLeast: m => `it takes at least ${m} nights to get the first failed build`,
      atMost: m => `at most ${WORDS[m]} nights are needed to get the first failed build`,
      fails: k => (k === 1 ? 'the first night’s build passes' : `the builds on the first ${k} nights ${k === 2 ? 'both' : 'all'} pass`),
    },
    {
      story: p => R`A hospital lab screens blood samples one at a time. The probability that a given sample is contaminated is \(${p}\), independently of every other sample. Let \(X\) denote the number of samples screened to find the first contaminated one.`,
      success: 'a contaminated sample',
      other: 'a clean sample',
      first: 'contaminated sample',
      unit: 'samples',
      each: 'each sample is either contaminated or clean',
      indep: 'the samples are independent',
      atLeast: m => `at least ${m} samples must be screened to find the first contaminated one`,
      atMost: m => `at most ${WORDS[m]} samples must be screened to find the first contaminated one`,
      fails: k => (k === 1 ? 'the first sample is clean' : `the first ${k} samples are ${k === 2 ? 'both' : 'all'} clean`),
    },
    {
      story: p => R`On a commuter rail line, the probability that a given train arrives more than 10 minutes late is \(${p}\), and one train has no effect on another. Let \(X\) denote the number of trains a commuter rides to get the first one that is more than 10 minutes late.`,
      success: 'a train more than 10 minutes late',
      other: 'a train that is on time or less late than that',
      first: 'train more than 10 minutes late',
      unit: 'trains',
      each: 'each train is either more than 10 minutes late or not',
      indep: 'one train has no effect on another',
      atLeast: m => `the commuter rides at least ${m} trains to get the first one more than 10 minutes late`,
      atMost: m => `the commuter rides at most ${WORDS[m]} trains to get the first one more than 10 minutes late`,
      fails: k => (k === 1 ? 'the first train is not more than 10 minutes late' : `none of the first ${k} trains is more than 10 minutes late`),
    },
  ]
  const LOT_PS = [2, 4, 8, 10, 15, 20, 25] // twins, in hundredths (the homework has 5)

  HW.add({
    id: '3.4-25',
    section: '3.4',
    num: '25',
    group: 1,
    title: 'Zinc-phosphate coating',
    hw: { P: 5, s: 0, m: 3 },
    twin: () => ({ P: HW.rand.pick(LOT_PS), s: HW.rand.int(1, LOT_STORIES.length - 1), m: HW.rand.int(2, 5) }),
    make: v => {
      const { P, m } = v
      const S = LOT_STORIES[v.s]
      const p = P / 100, q = (100 - P) / 100
      const pd = num(p), qd = num(q)
      const g = HW.gcd(P, 100), a = P / g, b = 100 / g // p = a/b in lowest terms
      const mo = geoMoments(P, 100)
      const { sd } = mo
      // E[X] = 100/P, Var = (100 − P)·100/P², E[X²] = (200 − P)·100/P², all over P²
      const P2 = P * P
      const atLeast = q ** (m - 1)
      return {
        text: S.story(dec(p)),
        parts: [
          {
            label: 'a',
            ask: R`Verify that \(X\) is geometric. What is “success” in this experiment? What is the numerical value of \(p\)?`,
            skill: 'label',
            hint: 'What does X count, and which outcome makes the counting stop? Whatever X is waiting for is called the success.',
            check: {
              type: 'choice',
              options: [
                { text: R`Geometric. Success is ${S.success}, so \(p = ${pd}\).` },
                { text: R`Geometric. Success is ${S.other}, so \(p = ${qd}\).` },
                { text: R`Geometric. Success is ${S.success}, so \(p = ${qd}\).` },
                { text: R`Binomial. Each of the ${S.unit} is a trial and success is ${S.success}, so \(p = ${pd}\).` },
              ],
              correct: 0,
            },
            answer: R`X \text{ is geometric; success} = \text{${S.success}};\ p = ${pd}`,
            steps: [
              {
                say: `Ask what X counts: the number of ${S.unit} up to and including the first ${S.first}. There is no fixed number of ${S.unit}: X can be 1, 2, 3, and so on.`,
                why: 'Counting tries until the FIRST success is exactly what a geometric random variable does.',
              },
              {
                say: 'Check the three things a geometric needs.',
                tex: [
                  R`\text{1. Each try is a success or a failure.}`,
                  R`\text{2. The tries are independent.}`,
                  R`\text{3. Every try has the same chance of success } p.`,
                ],
                why: R`The story gives all three: ${S.each}, ${S.indep}, and the chance is always \(${pd}\).`,
              },
              {
                say: `“Success” is the outcome X is waiting for: ${S.success}.`,
                tex: R`\text{success} = \text{${S.success}}`,
                why: 'In probability, “success” just means the outcome you are counting up to. It does not have to be good news, and here it is the bad one.',
              },
              {
                say: 'p is the chance of a success on one try, and q = 1 − p is the chance of a failure.',
                tex: R`p = ${pd}, \qquad q = 1 - ${pd} = ${qd}`,
              },
            ],
            trap: `“Success” sounds like good news, so people pick ${S.other} and p = ${qd}. But X stops at ${S.success}, so that is the success, and p = ${pd}.`,
          },
          {
            label: 'b',
            ask: R`What is the exact expression for the density for \(X\)?`,
            skill: 'derive-pdf',
            hint: 'X = x means x − 1 failures in a row, then the first success.',
            check: {
              type: 'choice',
              options: [
                { tex: R`f(x) = (${qd})^{x-1}(${pd}), \quad x = 1, 2, 3, \ldots` },
                { tex: R`f(x) = (${pd})^{x-1}(${qd}), \quad x = 1, 2, 3, \ldots` },
                { tex: R`f(x) = (${qd})^{x}(${pd}), \quad x = 1, 2, 3, \ldots` },
                { tex: R`f(x) = (${qd})^{x-1}(${pd}), \quad x = 0, 1, 2, \ldots` },
              ],
              correct: 0,
            },
            answer: R`f(x) = (${qd})^{x-1}(${pd}), \quad x = 1, 2, 3, \ldots`,
            steps: [
              {
                say: 'From part (a): a success has chance p, a failure has chance q.',
                tex: R`p = ${pd}, \qquad q = 1 - p = ${qd}`,
              },
              {
                say: 'X = x means the first x − 1 tries are failures and try x is the first success.',
                tex: R`P[X = x] = \underbrace{q \cdot q \cdots q}_{x-1 \text{ failures}} \cdot p = q^{x-1}p`,
                why: `Here a failure is ${S.other} and a success is ${S.success}. The tries are independent, so the chances multiply.`,
              },
              {
                say: 'Put in the numbers, and say which x are possible.',
                tex: R`f(x) = (${qd})^{x-1}(${pd}), \quad x = 1, 2, 3, \ldots`,
                why: 'The first success can come on try 1 at the earliest, and there is no last try.',
              },
            ],
            trap: `The power is x − 1, not x: before the success on try x there are only x − 1 failures. And q = ${qd} goes with the failures, p = ${pd} with the one success.`,
          },
          {
            label: 'c',
            ask: R`What is the exact expression for the moment generating function for \(X\)?`,
            skill: 'geo-mgf',
            hint: 'Write m(t) = E[e^(tX)] as a sum over x = 1, 2, 3, …, pull out p·e^t, and use the geometric series.',
            check: {
              type: 'choice',
              options: [
                { tex: R`m_X(t) = \dfrac{${pd}\,e^t}{1 - ${qd}\,e^t}` },
                { tex: R`m_X(t) = \dfrac{${qd}\,e^t}{1 - ${pd}\,e^t}` },
                { tex: R`m_X(t) = \dfrac{${pd}}{1 - ${qd}\,e^t}` },
                { tex: R`m_X(t) = \dfrac{${pd}\,e^t}{1 - ${pd}\,e^t}` },
              ],
              correct: 0,
            },
            answer: R`m_X(t) = \dfrac{${pd}\,e^t}{1 - ${qd}\,e^t} = \dfrac{${co(a)}e^t}{${b} - ${co(b - a)}e^t}, \quad t < -\ln ${qd} \approx ${num(-Math.log(q), 4)}`,
            steps: [
              {
                say: 'Start from the definition: the MGF is the expected value of e^(tX). For a discrete X that is a sum over every x.',
                tex: R`m_X(t) = E\left[e^{tX}\right] = \sum_{x=1}^{\infty} e^{tx}\, q^{x-1} p`,
              },
              {
                say: 'Write e^(tx) as e^t · e^(t(x−1)), so it has the same power x − 1 as q. Then pull pe^t, which doesn’t change with x, out of the sum.',
                tex: [R`e^{tx}\,q^{x-1}p = pe^t \cdot e^{t(x-1)}q^{x-1} = pe^t\left(qe^t\right)^{x-1}`, R`m_X(t) = pe^t \sum_{x=1}^{\infty} \left(qe^t\right)^{x-1}`],
                why: 'Now every term is the same number, qe^t, to the power x − 1: a geometric series.',
              },
              {
                say: 'Use the infinite geometric series from the formula sheet, with a = 1 and r = qe^t.',
                tex: [R`\sum_{k=1}^{\infty} ar^{k-1} = \frac{a}{1 - r}`, R`m_X(t) = pe^t \cdot \frac{1}{1 - qe^t} = \frac{pe^t}{1 - qe^t}`],
                why: 'The series only adds up when r < 1, that is qe^t < 1, so t < −ln q.',
              },
              {
                say: `Put in p = ${pd} and q = ${qd}. Multiplying top and bottom by ${b} clears the decimals.`,
                tex: R`m_X(t) = \frac{${pd}\,e^t}{1 - ${qd}\,e^t} = \frac{${co(a)}e^t}{${b} - ${co(b - a)}e^t}, \quad t < -\ln ${qd} \approx ${num(-Math.log(q), 4)}`,
              },
            ],
            trap: 'p goes on top with e^t (the success), q goes in the bottom with e^t. Swapping them is the usual slip.',
          },
          {
            label: 'd',
            ask: R`What are the numerical values of \(E[X]\), \(E[X^2]\), \(\sigma^2\), and \(\sigma\)?`,
            skill: 'formulas',
            hint: 'Geometric: E[X] = 1/p and Var X = q/p². Then E[X²] = Var X + (E[X])².',
            check: { type: 'numbers', items: geoChecks(p, mo) },
            answer: R`E[X] = ${T(100, P)},\ E[X^2] = ${T((200 - P) * 100, P2)},\ \sigma^2 = ${T((100 - P) * 100, P2)},\ \sigma \approx ${num(sd, 2)}`,
            steps: [
              {
                say: 'The geometric mean is 1/p.',
                tex: R`E[X] = \frac{1}{p} = \frac{1}{${pd}} = ${T(100, P)}${A(100, P)}`,
                why: R`A success comes along about once every \(${T(100, P)}\) ${S.unit}, so that is the average wait.`,
              },
              {
                say: 'The geometric variance is q/p². Square the decimal carefully.',
                tex: R`\sigma^2 = \frac{q}{p^2} = \frac{${qd}}{(${pd})^2} = \frac{${qd}}{${num(p * p, 6)}} = ${T((100 - P) * 100, P2)}${A((100 - P) * 100, P2)}`,
              },
              {
                say: 'Get E[X²] by turning the variance formula around.',
                tex: [
                  R`\sigma^2 = E[X^2] - (E[X])^2 \;\Rightarrow\; E[X^2] = \sigma^2 + (E[X])^2`,
                  R`E[X^2] = ${T((100 - P) * 100, P2)} + \left(${T(100, P)}\right)^2 = ${T((100 - P) * 100, P2)} + ${T(10000, P2)} = ${T((200 - P) * 100, P2)}${A((200 - P) * 100, P2)}`,
                ],
              },
              {
                say: 'σ is the square root of the variance.',
                tex: R`\sigma = \sqrt{${T((100 - P) * 100, P2)}} ${eq(sd)} ${num(sd, 4)}`,
              },
            ],
            trap: `Count decimal places when you square: (${pd})² = ${num(p * p, 6)}. And E[X²] is not (E[X])²: they differ by the variance.`,
          },
          {
            label: 'e',
            ask: `Find the probability that ${S.atLeast(m)}.`,
            skill: 'disc-prob',
            hint: `Turn the words into X ≥ ${m}. Its opposite, X ≤ ${m - 1}, has only ${WORDS[m - 1]} value${m === 2 ? '' : 's'} to add up.`,
            check: { type: 'number', value: atLeast, tol: 0.0005, wrong: atLeastWrong(p, m, 0.0005) },
            answer: R`P[X \ge ${m}] = (${qd})^{${m - 1}} ${eq(atLeast)} ${num(atLeast, 4)}`,
            steps: atLeastSteps({ m, p, pW: `(${pd})`, qW: `(${qd})`, fails: S.fails }),
            trap: `“At least ${m}” includes ${m} itself, so the complement stops at ${m - 1}: use 1 − P[X ≤ ${m - 1}], not 1 − P[X ≤ ${m}].`,
          },
        ],
      }
    },
  })

  HW.add({
    id: '3.4-27',
    section: '3.4',
    num: '27',
    group: 1,
    title: 'Coating runs: the cdf',
    hw: { P: 5, s: 0, m: 3 },
    twin: () => ({ P: HW.rand.pick(LOT_PS), s: HW.rand.int(1, LOT_STORIES.length - 1), m: HW.rand.int(2, 6) }),
    make: v => {
      const { P, m } = v
      const S = LOT_STORIES[v.s]
      const p = P / 100, q = (100 - P) / 100
      const pd = num(p), qd = num(q)
      const atMost = 1 - q ** m
      const upto = Array.from({ length: m }, (_, i) => q ** i * p) // f(1) … f(m)
      return {
        text: v.s === 0
          ? R`**Exercise 25:** ${S.story(dec(p))} **Exercise 27:** Find the expression for the cumulative distribution function for the random variable of Exercise 25. Use this function to find the probability that ${S.atMost(m)}.`
          : R`${S.story(dec(p))} Find the expression for the cumulative distribution function for \(X\). Use this function to find the probability that ${S.atMost(m)}.`,
        parts: [
          {
            label: 'a',
            ask: R`Find the expression for the cumulative distribution function \(F(x) = P[X \le x]\).`,
            skill: 'geo-cdf',
            hint: 'F(x) adds up the pdf q^(k−1)·p from k = 1 to x. Which formula on the sheet adds up a finite string of powers?',
            check: { type: 'self' },
            answer: R`F(x) = 1 - (${qd})^{x}, \quad x = 1, 2, 3, \ldots`,
            steps: [
              {
                say: `${v.s === 0 ? 'From Exercise 25, X is geometric' : `X counts ${S.unit} up to the first ${S.first} (the “success”), so it is geometric`} with p = ${pd}, and its pdf is f(k) = q^(k−1)·p. The cdf is the chance X is at most x: add the pdf from the smallest value up to x.`,
                tex: R`F(x) = P[X \le x] = \sum_{k=1}^{x} f(k) = \sum_{k=1}^{x} q^{k-1}p, \quad x = 1, 2, 3, \ldots`,
                why: 'Use k as the counting letter, because x is already taken: it is where the adding stops.',
              },
              {
                say: 'Write out the terms. The first term is p, and each term is the one before times q: a finite geometric series.',
                tex: R`F(x) = p + qp + q^2p + \cdots + q^{x-1}p`,
                why: 'There are x terms, one for each k from 1 to x.',
              },
              {
                say: 'Use the finite geometric series from the formula sheet, with first term a = p, ratio r = q, and n = x terms.',
                tex: [R`\sum_{k=1}^{n} ar^{k-1} = \frac{a(1 - r^n)}{1 - r}`, R`F(x) = \frac{p(1 - q^x)}{1 - q}`],
              },
              {
                say: 'Simplify: 1 − q = p, so the p on top cancels the p on the bottom.',
                tex: R`F(x) = \frac{p(1 - q^x)}{p} = 1 - q^x`,
              },
              {
                say: `Put in q = ${qd}.`,
                tex: R`F(x) = 1 - (${qd})^{x}, \quad x = 1, 2, 3, \ldots`,
                why: R`Quick check: \(F(1) = 1 - ${qd} = ${pd}\), which is \(f(1) = p\), as it should be.`,
              },
              {
                say: 'If F has to be written for every real x, not only whole numbers: it is 0 below 1, and between two whole numbers it stays at its value for the lower one.',
                tex: R`F(x) = \begin{cases} 0, & x < 1 \\ 1 - (${qd})^{\lfloor x \rfloor}, & x \ge 1 \end{cases}`,
                why: R`\(\lfloor x \rfloor\) means x rounded down, so \(F(2.7) = F(2)\). X only takes whole-number values, so F only jumps at 1, 2, 3, …`,
              },
            ],
            trap: 'Don’t use the infinite series a/(1 − r): that adds every term and gives 1, the total. The cdf stops at x, so it is the finite one.',
          },
          {
            label: 'b',
            ask: `Use this function to find the probability that ${S.atMost(m)}.`,
            skill: 'geo-cdf',
            hint: 'Turn the words into an inequality for X first, then put the number into F.',
            // slips: F(m − 1), the complement, p for q, just P[X = m]
            check: { type: 'number', value: atMost, tol: 0.0005, wrong: W(atMost, 0.0005, [1 - q ** (m - 1), q ** m, 1 - p ** m, q ** (m - 1) * p]) },
            answer: R`P[X \le ${m}] = F(${m}) = 1 - (${qd})^{${m}} ${eq(atMost)} ${num(atMost, 4)}`,
            steps: [
              {
                say: `“At most ${WORDS[m]}” means X ≤ ${m}, and P[X ≤ x] is exactly what the cdf gives.`,
                tex: R`P[X \le ${m}] = F(${m})`,
              },
              {
                say: `Put x = ${m} into F(x) = 1 − (${qd})^x.`,
                tex: R`F(${m}) = 1 - (${qd})^{${m}} ${eq6(q ** m)} 1 - ${num(q ** m, 6)} ${eq(atMost)} ${num(atMost, 4)}`,
                graph: geoBars(p, x => x <= m, `lit: x = 1 to ${m}, total ${num(atMost, 4)}`),
              },
              {
                say: `Check by adding the pdf for x = 1 to ${m}.`,
                tex: R`${upto.map((_, i) => `f(${i + 1})`).join(' + ')} ${upto.every(t => eq6(t) === '=') ? '=' : R`\approx`} ${upto.map(t => num(t, 6)).join(' + ')} ${eq6(atMost)} ${num(atMost, 6)}`,
                why: 'Same answer: the cdf is a shortcut for this sum.',
              },
            ],
            trap: `Use q in F, not p: 1 − (${pd})^${m} is wrong. And “at most ${m}” includes ${m}, so it is F(${m}), not F(${m - 1}).`,
          },
        ],
      }
    },
  })

  // ---------- 3.4 #31: a pdf on three values ----------
  // v.kind 'sq':    f(x) = (x − c)²/k at x = c + D[i]   (the homework: c = 3, D = 0, 1, 2)
  //        'lin':   f(x) = (x + c)/k at x = a, a + 1, a + 2
  //        'table': f(x) = ns[i]/10 at x = xs[i], given as a table
  const pdf31 = v => {
    const xs = v.kind === 'sq' ? v.D.map(d => v.c + d) : v.kind === 'lin' ? [v.a, v.a + 1, v.a + 2] : v.xs
    const ns = v.kind === 'sq' ? v.D.map(d => d * d) : v.kind === 'lin' ? xs.map(x => x + v.c) : v.ns
    const k = ns.reduce((s, n) => s + n, 0)
    const table = v.kind === 'table'
    // n/k as written in the steps: over k for a formula (so the terms add easily), a decimal for a table
    const over = n => (n === 0 ? '0' : table ? num(n / k, 4) : `\\frac{${n}}{${k}}`)
    // a final answer n/k: the fraction, reduced, then its decimal
    const tot = n => {
      if (table) return num(n / k, 4)
      let s = `\\frac{${n}}{${k}}`
      if (frac(n, k) !== s) s += ` = ${frac(n, k)}`
      if (!Number.isInteger(n / k)) s += ends(n / k) ? ` = ${num(n / k, 4)}` : ` \\approx ${num(n / k, 4)}`
      return s
    }
    // Σ coef·e^{xt} over the x with coef ≠ 0
    const terms = (cs, t = x => ex(x)) => xs.map((x, i) => (cs[i] === 0 ? null : over(cs[i]) + t(x))).filter(Boolean).join(' + ')
    let def, at, pos
    if (v.kind === 'sq') {
      def = R`f(x) = \frac{(x-${v.c})^2}{${k}}`
      at = i => R`f(${xs[i]}) = \frac{(${xs[i]}-${v.c})^2}{${k}} = ${over(ns[i])}`
      pos = R`Each value is a square, which is never negative, divided by \(${k}\).`
    } else if (v.kind === 'lin') {
      const top = v.c ? `x+${v.c}` : 'x'
      def = R`f(x) = \frac{${top}}{${k}}`
      at = i => R`f(${xs[i]}) = \frac{${xs[i]}${v.c ? '+' + v.c : ''}}{${k}} = ${over(ns[i])}`
      pos = R`The top, \(${top}\), is positive for \(x = ${xs.join(', ')}\), and \(${k} > 0\).`
    } else {
      def = R`\begin{array}{c|ccc} x & ${xs.join(' & ')} \\ \hline f(x) & ${ns.map(n => num(n / k, 4)).join(' & ')} \end{array}`
      at = i => R`f(${xs[i]}) = ${over(ns[i])}`
      pos = 'Every entry in the f(x) row is a positive number.'
    }
    const S1 = xs.reduce((s, x, i) => s + x * ns[i], 0)
    const S2 = xs.reduce((s, x, i) => s + x * x * ns[i], 0)
    return { xs, ns, k, table, over, tot, terms, def, at, pos, S1, S2 }
  }

  HW.add({
    id: '3.4-31',
    section: '3.4',
    num: '31',
    group: 1,
    title: 'A pdf on three values',
    hw: { kind: 'sq', c: 3, D: [0, 1, 2] },
    twin: () => {
      const kind = HW.rand.pick(['sq', 'sq', 'lin', 'table'])
      if (kind === 'sq') {
        let D, c
        do {
          D = HW.rand.pick([[0, 1, 2], [1, 2, 3], [-1, 1, 2], [-2, -1, 0], [0, 1, 3], [-1, 0, 2], [-2, 0, 1]])
          c = HW.rand.int(Math.max(1, -Math.min(...D)), 6)
        } while (c === 3 && D.join() === '0,1,2')
        return { kind, c, D }
      }
      if (kind === 'lin') {
        const c = HW.rand.int(0, 3)
        return { kind, c, a: c === 0 ? HW.rand.int(1, 3) : HW.rand.int(0, 2) }
      }
      const xs = HW.rand.pick([[0, 1, 2], [1, 2, 3], [0, 2, 4], [1, 3, 5], [2, 4, 6], [0, 1, 3]])
      const n1 = HW.rand.int(1, 7), n2 = HW.rand.int(1, 9 - n1)
      return { kind, xs, ns: [n1, n2, 10 - n1 - n2] }
    },
    make: v => {
      const F = pdf31(v)
      const { xs, ns, k, table, over, tot, terms, S1, S2 } = F
      const live = xs.map((x, i) => i).filter(i => ns[i] !== 0) // the x with f(x) ≠ 0
      const mean = S1 / k, ex2 = S2 / k
      const V = S2 * k - S1 * S1 // Var = V / k²
      const varX = V / (k * k), sd = Math.sqrt(varX)
      // numbers for the arcade's wrong choices
      const avgX = xs.reduce((s, x) => s + x, 0) / xs.length // the x's averaged, ignoring f
      const sqXf = xs.reduce((s, x, i) => s + ((x * ns[i]) / k) ** 2, 0) // Σ (x·f(x))², squaring too much
      const flip = xs.reduce((s, x, i) => s + (x * ns[2 - i]) / k, 0) // each x paired with the wrong f
      const mgf = terms(ns)
      const m1 = terms(xs.map((x, i) => x * ns[i]))
      const m2 = terms(xs.map((x, i) => x * x * ns[i]))
      const muT = table || ends(mean) ? num(mean, 4) : frac(S1, k)
      // wrong MGFs people write: x·f(x) as the weights, e^(t·E[X]), no t, the weights paired with the wrong x
      const wrong = [
        m1,
        `e^{${muT}t}`,
        terms(ns, x => (x === 0 ? '' : x === 1 ? 'e' : `e^{${x}}`)),
        xs.map((x, i) => (ns[2 - i] === 0 ? null : over(ns[2 - i]) + ex(x))).filter(Boolean).join(' + '),
      ]
      const seen = new Set([mgf.replace(/\s/g, '')])
      const distract = []
      for (const w of wrong) {
        const key = w.replace(/\s/g, '')
        if (!seen.has(key) && distract.length < 3) { seen.add(key); distract.push(w) }
      }
      const varLine = table
        ? R`\sigma^2 = ${num(ex2, 4)} - (${num(mean, 4)})^2 = ${num(ex2, 4)} - ${num(mean * mean, 4)} = ${num(varX, 4)}`
        : R`\sigma^2 = \frac{${S2}}{${k}} - \left(\frac{${S1}}{${k}}\right)^2 = \frac{${S2}}{${k}} - \frac{${S1 * S1}}{${k * k}} = \frac{${S2 * k}}{${k * k}} - \frac{${S1 * S1}}{${k * k}} = \frac{${V}}{${k * k}}${frac(V, k * k) !== `\\frac{${V}}{${k * k}}` ? ' = ' + frac(V, k * k) : ''}${Number.isInteger(varX) ? '' : (ends(varX) ? ' = ' : R` \approx `) + num(varX, 4)}`
      const varT = table ? num(varX, 4) : frac(V, k * k)
      return {
        text: table
          ? R`Consider the random variable \(X\) whose density is given by the table \[${F.def}\]`
          : R`Consider the random variable \(X\) whose density is given by \[${F.def} \qquad x = ${xs.join(', ')}\]`,
        parts: [
          {
            label: 'a',
            ask: `Verify that this ${table ? 'table' : 'function'} is a density for a discrete random variable.`,
            skill: 'show-pdf',
            hint: 'There are two things to check. Work out f(x) for each of the three x values first.',
            check: { type: 'self' },
            answer: R`f(x) \ge 0 \text{ and } \sum f(x) = ${live.map(i => over(ns[i])).join(' + ')} = 1`,
            steps: [
              {
                say: 'A discrete density needs two things: no negative values, and a total of 1.',
                tex: [R`\text{1. } f(x) \ge 0 \text{ for every } x`, R`\text{2. } \sum_{\text{all } x} f(x) = 1`],
              },
              {
                say: table ? 'Read the value for each x off the table.' : 'Work out f(x) for each x.',
                tex: xs.map((x, i) => F.at(i)),
                graph: { kind: 'bars', title: 'the pdf of X', xs, ys: ns.map(n => n / k), hits: new Set(xs), note: 'one bar for each x; their heights must add to 1' },
              },
              {
                say: 'Condition 1: none of them is negative.',
                why: F.pos,
              },
              {
                say: 'Condition 2: add them up.',
                tex: R`\sum f(x) = ${xs.map((x, i) => over(ns[i])).join(' + ')} = ${table ? 1 : R`\frac{${k}}{${k}} = 1`}`,
                why: 'Both conditions hold, so f is a density.',
              },
            ],
            trap: 'Checking only that the total is 1 is not enough: you also have to say that no value is negative.',
          },
          {
            label: 'b',
            ask: R`Find \(E[X]\) directly. That is, evaluate \(\sum_{\text{all } x} x f(x)\).`,
            skill: 'mean-var',
            hint: 'Multiply each x by its f(x), then add the three products.',
            // slips: the x's averaged as if equally likely, forgot to divide by k, E[X²], the products averaged not added, f's paired with the wrong x
            check: { type: 'number', value: mean, tol: 0.01, wrong: W(mean, 0.01, [avgX, S1, ex2, mean / 3, flip]) },
            answer: R`E[X] = ${tot(S1)}`,
            steps: [
              {
                say: 'E[X] is each value times its probability, all added up.',
                tex: R`E[X] = \sum_{\text{all } x} x f(x)`,
              },
              {
                say: 'Write one term for each x.',
                tex: R`E[X] = ${xs.map((x, i) => `${x} \\cdot ${over(ns[i])}`).join(' + ')}`,
              },
              {
                say: 'Multiply, then add.',
                tex: R`E[X] = ${xs.map((x, i) => over(x * ns[i])).join(' + ')} = ${tot(S1)}`,
                why: table ? null : `Keeping everything over ${k} makes the adding easy.`,
              },
            ].map(s => (s.why ? s : { say: s.say, tex: s.tex })),
          },
          {
            label: 'c',
            ask: R`Find the moment generating function for \(X\).`,
            skill: 'mgf-def',
            hint: 'm(t) = E[e^(tX)]: the same recipe as E[X], with e^(tx) in place of x.',
            check: {
              type: 'choice',
              options: [{ tex: R`m_X(t) = ${mgf}` }, ...distract.map(w => ({ tex: R`m_X(t) = ${w}` }))],
              correct: 0,
            },
            answer: R`m_X(t) = ${mgf}`,
            steps: [
              {
                say: 'The MGF is the expected value of e^(tX). Like E[X], it is a sum over every x, with e^(tx) in place of x.',
                tex: R`m_X(t) = E\left[e^{tX}\right] = \sum_{\text{all } x} e^{tx} f(x)`,
              },
              {
                say: 'Write one term for each x.',
                tex: R`m_X(t) = ${xs.map((x, i) => `${x === 1 ? 'e^{t}' : `e^{${x}t}`} \\cdot ${over(ns[i])}`).join(' + ')}`,
                ...(ns.includes(0) || xs.includes(0)
                  ? { why: [ns.includes(0) ? `f(${xs[ns.indexOf(0)]}) = 0, so that term drops out.` : '', xs.includes(0) && ns[xs.indexOf(0)] !== 0 ? 'e^(0·t) = 1, so the x = 0 term is just a number.' : ''].filter(Boolean).join(' ') }
                  : {}),
              },
              {
                say: 'Tidy up. That is the MGF.',
                tex: R`m_X(t) = ${mgf}`,
                why: R`Check: every MGF has \(m_X(0) = 1\), because \(e^{0} = 1\). Here \(m_X(0) = ${live.map(i => over(ns[i])).join(' + ')} = 1\).`,
              },
            ],
            trap: 'The exponent is t times x, with each x from the list. Writing x·f(x) as the weights mixes the MGF up with E[X].',
          },
          {
            label: 'd',
            ask: R`Use the moment generating function to find \(E[X]\), thus verifying your answer to part (b) of this exercise.`,
            skill: 'mgf-moments',
            hint: 'E[X] = m′(0). Differentiate each term of m(t), then put in t = 0.',
            // slips: m(0) = 1 (no derivative, or x never came down), the x's averaged, forgot to divide by k, m″(0)
            check: { type: 'number', value: mean, tol: 0.01, wrong: W(mean, 0.01, [1, avgX, S1, ex2, flip]) },
            answer: R`E[X] = m_X'(0) = ${tot(S1)}`,
            steps: [
              {
                say: 'E[X] is the first derivative of the MGF, at t = 0.',
                tex: R`E[X] = m_X'(0)`,
              },
              {
                say: 'Differentiate term by term. By the chain rule, the number in front of t comes down.',
                tex: R`\frac{d}{dt}\,e^{at} = a\,e^{at}`,
              },
              {
                say: 'So each term gets multiplied by its own x.',
                tex: R`m_X'(t) = ${live.map(i => `${xs[i]} \\cdot ${over(ns[i])}${ex(xs[i])}`).join(' + ')} = ${m1}`,
              },
              {
                say: 'Put in t = 0. Every e^0 is 1, so only the numbers are left.',
                tex: R`m_X'(0) = ${live.filter(i => xs[i] !== 0).map(i => over(xs[i] * ns[i])).join(' + ')} = ${tot(S1)}`,
                why: 'The same as part (b), as it should be.',
              },
            ],
            trap: 'Differentiate first, then put in t = 0. Putting t = 0 into m(t) itself just gives 1.',
          },
          {
            label: 'e',
            ask: R`Find \(E[X^2]\) directly. That is, evaluate \(\sum_{\text{all } x} x^2 f(x)\).`,
            skill: 'mean-var',
            hint: 'Like part (b), but square each x before multiplying by f(x).',
            // slips: (E[X])², E[X], Σ (x·f(x))², forgot to divide by k
            check: { type: 'number', value: ex2, tol: 0.01, wrong: W(ex2, 0.01, [mean * mean, mean, sqXf, S2]) },
            answer: R`E[X^2] = ${tot(S2)}`,
            steps: [
              {
                say: 'E[X²] is each value squared times its probability, all added up.',
                tex: R`E[X^2] = \sum_{\text{all } x} x^2 f(x)`,
              },
              {
                say: 'Write one term for each x.',
                tex: R`E[X^2] = ${xs.map((x, i) => `${x}^2 \\cdot ${over(ns[i])}`).join(' + ')}`,
              },
              {
                say: 'Square, multiply, then add.',
                tex: R`E[X^2] = ${xs.map((x, i) => over(x * x * ns[i])).join(' + ')} = ${tot(S2)}`,
              },
            ],
            trap: 'Square only the x: it is x²·f(x), not (x·f(x))². And E[X²] is not (E[X])².',
          },
          {
            label: 'f',
            ask: R`Use the moment generating function to find \(E[X^2]\), thus verifying your answer to part (e) of this exercise.`,
            skill: 'mgf-moments',
            hint: 'E[X²] = m″(0). Differentiate your m′(t) from part (d) once more.',
            // slips: (m′(0))², m′(0) (differentiated once), m(0) = 1
            check: { type: 'number', value: ex2, tol: 0.01, wrong: W(ex2, 0.01, [mean * mean, mean, 1, sqXf]) },
            answer: R`E[X^2] = m_X''(0) = ${tot(S2)}`,
            steps: [
              {
                say: 'E[X²] is the second derivative of the MGF, at t = 0.',
                tex: R`E[X^2] = m_X''(0)`,
              },
              {
                say: 'Start from m′(t) in part (d) and differentiate again: each term gets multiplied by its x once more.',
                tex: [R`m_X'(t) = ${m1}`, R`m_X''(t) = ${live.filter(i => xs[i] !== 0).map(i => `${xs[i]} \\cdot ${over(xs[i] * ns[i])}${ex(xs[i])}`).join(' + ')} = ${m2}`],
              },
              {
                say: 'Put in t = 0.',
                tex: R`m_X''(0) = ${live.filter(i => xs[i] !== 0).map(i => over(xs[i] * xs[i] * ns[i])).join(' + ')} = ${tot(S2)}`,
                why: 'The same as part (e).',
              },
            ],
          },
          {
            label: 'g',
            ask: R`Find \(\sigma^2\) and \(\sigma\).`,
            skill: 'mean-var',
            hint: 'Use Var X = E[X²] − (E[X])² with your answers from (b) and (e).',
            check: {
              type: 'numbers',
              items: [
                // slips: subtracted E[X] not (E[X])², σ for σ², forgot to subtract
                { label: R`\sigma^2`, value: varX, tol: 0.006, wrong: W(varX, 0.006, [ex2 - mean, sd, ex2]) },
                // slips: σ² for σ, √E[X²], √(E[X²] − E[X])
                { label: R`\sigma`, value: sd, tol: 0.006, wrong: W(sd, 0.006, [varX, Math.sqrt(ex2), Math.sqrt(ex2 - mean)]) },
              ],
            },
            answer: R`\sigma^2 = ${varT}${!table && varT.includes('frac') ? (ends(varX) ? ' = ' : R` \approx `) + num(varX, 4) : ''},\ \sigma ${eq(sd)} ${num(sd, 4)}`,
            steps: [
              {
                say: 'Use the shortcut formula for the variance.',
                tex: R`\sigma^2 = E[X^2] - (E[X])^2`,
              },
              {
                say: 'Put in E[X²] from part (e) and E[X] from part (b).',
                tex: varLine,
                why: table ? 'Square E[X] before subtracting.' : 'Keep the fractions exact until the end: rounding E[X] first can throw the variance off.',
              },
              {
                say: 'σ is the square root of the variance.',
                tex: R`\sigma = \sqrt{${varT}} ${eq(sd)} ${num(sd, 4)}`,
              },
            ],
            trap: 'Subtract (E[X])², not E[X]. And σ is the square root of σ², not the other way round.',
          },
        ],
      }
    },
  })

  // ---------- 3.5 #36: binomial pdf, MGF, and moments from the MGF ----------
  const BIN_STORIES = [
    { ok: () => true, story: (n, p) => R`Let \(X\) be binomial with parameters \(n = ${n}\) and \(p = ${dec(p)}\).` },
    {
      ok: p => p >= 0.6,
      story: (n, p) => R`A gardener plants ${n} seeds from one packet, and each seed sprouts with probability \(${dec(p)}\), independently of the others. Let \(X\) be the number of seeds that sprout, so \(X\) is binomial with parameters \(n = ${n}\) and \(p = ${dec(p)}\).`,
    },
    {
      ok: p => p >= 0.6,
      story: (n, p) => R`A basketball player makes each free throw with probability \(${dec(p)}\), and one shot has no effect on the next. In practice she takes ${n} free throws. Let \(X\) be the number she makes, so \(X\) is binomial with parameters \(n = ${n}\) and \(p = ${dec(p)}\).`,
    },
    {
      ok: p => p === 0.2 || p === 0.25,
      story: (n, p) => R`A student guesses on every question of a ${n}-question multiple-choice quiz. Each question has ${p === 0.2 ? 'five' : 'four'} choices, so each guess is right with probability \(${dec(p)}\), independently. Let \(X\) be the number of questions the student gets right, so \(X\) is binomial with parameters \(n = ${n}\) and \(p = ${dec(p)}\).`,
    },
    {
      ok: p => p <= 0.3,
      story: (n, p) => R`An inspector pulls ${n} parts from a machine whose parts are defective with probability \(${dec(p)}\), independently of each other. Let \(X\) be the number of defective parts, so \(X\) is binomial with parameters \(n = ${n}\) and \(p = ${dec(p)}\).`,
    },
  ]

  HW.add({
    id: '3.5-36',
    section: '3.5',
    num: '36',
    group: 1,
    title: 'Binomial: pdf, MGF, moments',
    hw: { n: 15, p: 0.2, s: 0 },
    twin: () => {
      let n, p
      do {
        n = HW.rand.pick([10, 12, 15, 20, 25])
        p = HW.rand.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.7, 0.75, 0.8])
        // np = 1 would make the slip m(0) = 1 land on E[X]
      } while ((n === 15 && p === 0.2) || Math.abs(n * p - 1) < 1e-9)
      const ok = BIN_STORIES.map((S, i) => i).filter(i => BIN_STORIES[i].ok(p))
      return { n, p, s: HW.rand.pick(ok) }
    },
    make: v => {
      const { n, p } = v
      const q = 1 - p
      const pd = num(p), qd = num(q)
      const np = n * p, npq = n * p * q
      const c1 = (n - 1) * p // the number in front of v′ = (n − 1)(…)^(n−2)·pe^t
      const c2 = n * p * (n - 1) * p // n(n − 1)p², the second term of m″(0)
      const ex2 = np + c2
      const base = R`(${qd} + ${pd}e^t)`
      const npT = num(np, 4), c1T = num(c1, 4), c2T = num(c2, 4)
      return {
        text: BIN_STORIES[v.s].story(n, p),
        parts: [
          {
            label: 'a',
            ask: R`Find the expression for the density for \(X\).`,
            skill: 'derive-pdf',
            hint: 'Find the chance of one particular order of x successes and n − x failures, then count how many orders there are.',
            check: {
              type: 'choice',
              options: [
                { tex: R`f(x) = \binom{${n}}{x}(${pd})^{x}(${qd})^{${n}-x}, \quad x = 0, 1, \ldots, ${n}` },
                { tex: R`f(x) = \binom{${n}}{x}(${qd})^{x}(${pd})^{${n}-x}, \quad x = 0, 1, \ldots, ${n}` },
                { tex: R`f(x) = (${pd})^{x}(${qd})^{${n}-x}, \quad x = 0, 1, \ldots, ${n}` },
                { tex: R`f(x) = \binom{${n}}{x}(${pd})^{x}(${qd})^{${n}-x}, \quad x = 1, 2, \ldots, ${n}` },
              ],
              correct: 0,
            },
            answer: R`f(x) = \binom{${n}}{x}(${pd})^{x}(${qd})^{${n}-x}, \quad x = 0, 1, 2, \ldots, ${n}`,
            steps: [
              {
                say: 'Find q, the chance of a failure on one try.',
                tex: R`q = 1 - p = 1 - ${pd} = ${qd}`,
              },
              {
                say: `Take one particular order with x successes and ${n} − x failures, say all the successes first.`,
                tex: R`\underbrace{p \cdots p}_{x}\;\underbrace{q \cdots q}_{${n}-x} = p^x q^{${n}-x}`,
                why: 'The tries are independent, so the chances multiply. Every other order has the same number of p’s and q’s, so it has the same chance.',
              },
              {
                say: `Count the orders: choose which x of the ${n} tries are the successes.`,
                tex: R`\binom{${n}}{x} = \frac{${n}!}{x!\,(${n}-x)!} \text{ orders}`,
              },
              {
                say: 'Multiply (number of orders) × (chance of each), put in the numbers, and say which x are possible.',
                tex: R`f(x) = \binom{${n}}{x}(${pd})^{x}(${qd})^{${n}-x}, \quad x = 0, 1, 2, \ldots, ${n}`,
                why: `X counts successes in ${n} tries, so it can be anything from 0 (none) to ${n} (all of them).`,
              },
            ],
            trap: 'Don’t forget the binomial coefficient: p^x q^(n−x) on its own is the chance of just one order.',
          },
          {
            label: 'b',
            ask: R`Find the expression for the moment generating function for \(X\).`,
            skill: 'formulas',
            hint: 'Write m(t) = E[e^(tX)] as a sum over x = 0 to n, then put e^(tx) together with p^x.',
            check: {
              type: 'choice',
              options: [
                { tex: R`m_X(t) = ${base}^{${n}}` },
                { tex: R`m_X(t) = (${pd} + ${qd}e^t)^{${n}}` },
                { tex: R`m_X(t) = \dfrac{${pd}\,e^t}{1 - ${qd}\,e^t}` },
                { tex: R`m_X(t) = (${qd})^{${n}} + (${pd}e^t)^{${n}}` },
              ],
              correct: 0,
            },
            answer: R`m_X(t) = ${base}^{${n}}`,
            steps: [
              {
                say: 'Start from the definition: m(t) = E[e^(tX)], a sum over x = 0 to n.',
                tex: R`m_X(t) = E\left[e^{tX}\right] = \sum_{x=0}^{n} e^{tx}\binom{n}{x}p^x q^{n-x}`,
              },
              {
                say: 'e^(tx) is (e^t)^x, so it joins p^x.',
                tex: R`m_X(t) = \sum_{x=0}^{n} \binom{n}{x}\left(pe^t\right)^x q^{n-x}`,
              },
              {
                say: 'That is the binomial theorem read backwards, with a = pe^t and b = q.',
                tex: [R`(a + b)^n = \sum_{x=0}^{n}\binom{n}{x}a^x b^{n-x}`, R`m_X(t) = \left(q + pe^t\right)^n`],
                why: 'The binomial theorem is how you multiply out (a + b)^n. Reading it backwards packs the whole sum into one power.',
              },
              {
                say: `Put in n = ${n}, p = ${pd} and q = ${qd}.`,
                tex: R`m_X(t) = ${base}^{${n}}`,
                why: 'This one works for every t: the sum has only n + 1 terms, so it can’t fail to add up.',
              },
            ],
            trap: 'p goes with e^t, not q: e^(tx) rides along with the x successes.',
          },
          {
            label: 'c',
            ask: R`Find \(E[X]\) and \(\operatorname{Var} X\).`,
            skill: 'formulas',
            hint: 'Binomial: E[X] = np and Var X = npq.',
            check: {
              type: 'numbers',
              items: [
                // slips: p and q swapped, the variance, the geometric mean 1/p
                { label: R`E[X]`, value: np, tol: 0.01, wrong: W(np, 0.01, [n * q, npq, 1 / p]) },
                // slips: np², σ, the mean, the geometric variance q/p²
                { label: R`\operatorname{Var} X`, value: npq, tol: 0.01, wrong: W(npq, 0.01, [n * p * p, Math.sqrt(npq), np, q / (p * p)]) },
              ],
            },
            answer: R`E[X] = ${num(np, 4)},\ \operatorname{Var} X = ${num(npq, 4)}`,
            steps: [
              {
                say: 'The binomial mean is np.',
                tex: R`E[X] = np = ${n}(${pd}) = ${num(np, 4)}`,
                why: `${n} tries, and each one adds ${pd} of a success on average.`,
              },
              {
                say: 'The binomial variance is npq.',
                tex: R`\operatorname{Var} X = npq = ${n}(${pd})(${qd}) = ${num(npq, 4)}`,
              },
            ],
            trap: 'Var X is npq, not np². And the standard deviation √(npq) is a different number from the variance.',
          },
          {
            label: 'd',
            ask: R`Find \(E[X]\), \(E[X^2]\), and \(\operatorname{Var} X\) using the moment generating function, thus verifying your answer to part (c) of this exercise.`,
            skill: 'mgf-moments',
            hint: 'E[X] = m′(0) and E[X²] = m″(0). m′ needs the chain rule; m″ needs the product rule too.',
            check: {
              type: 'numbers',
              items: [
                // slips: chain rule without the inside's derivative p (gives n), m(0) = 1, p and q swapped, the variance
                { label: R`E[X]`, value: np, tol: 0.01, wrong: W(np, 0.01, [n, 1, n * q, npq]) },
                // slips: lost the u′v term, lost the uv′ term, (m′(0))², v′ without its p
                { label: R`E[X^2]`, value: ex2, tol: 0.01, wrong: W(ex2, 0.01, [c2, np, np * np, np + np * (n - 1)]) },
                // slips: subtracted E[X] not (E[X])², forgot to subtract, σ, np²
                { label: R`\operatorname{Var} X`, value: npq, tol: 0.01, wrong: W(npq, 0.01, [ex2 - np, ex2, Math.sqrt(npq), n * p * p]) },
              ],
            },
            answer: R`E[X] = ${npT},\ E[X^2] = ${num(ex2, 4)},\ \operatorname{Var} X = ${num(npq, 4)}`,
            steps: [
              {
                say: 'Start from the MGF in part (b). The moments are its derivatives at t = 0.',
                tex: [R`m_X(t) = ${base}^{${n}}`, R`E[X] = m_X'(0), \qquad E[X^2] = m_X''(0)`],
              },
              {
                say: `First derivative, by the chain rule: bring the power ${n} down and lower it to ${n - 1}, then multiply by the derivative of the inside, ${qd} + ${pd}e^t.`,
                tex: [R`\frac{d}{dt}${base} = ${pd}e^t`, R`m_X'(t) = ${n}${base}^{${n - 1}} \cdot ${pd}e^t = ${npT}e^t${base}^{${n - 1}}`],
                why: `${qd} is a constant, so its derivative is 0. Then ${n} × ${pd} = ${npT}.`,
              },
              {
                say: `Put in t = 0. Then e^0 = 1, so the inside becomes q + p = ${qd} + ${pd} = 1, and 1 to any power is 1.`,
                tex: R`E[X] = m_X'(0) = ${npT}(1)(${qd} + ${pd})^{${n - 1}} = ${npT}(1)^{${n - 1}} = ${npT}`,
                why: 'q + p = 1 always, because q = 1 − p. That is what makes these derivatives easy at t = 0.',
              },
              {
                say: `For E[X²], differentiate m′(t) = ${npT}e^t${base}^{${n - 1}}. It is a product of two pieces that both have t in them, so use the product rule (uv)′ = u′v + uv′. First write each piece and its derivative.`,
                tex: [
                  R`u = ${npT}e^t, \qquad u' = ${npT}e^t`,
                  R`v = ${base}^{${n - 1}}, \qquad v' = ${n - 1}${base}^{${n - 2}} \cdot ${pd}e^t = ${c1T}e^t${base}^{${n - 2}}`,
                ],
                why: `v′ is the chain rule again, the same way as m′: the power ${n - 1} comes down, then multiply by the inside’s derivative ${pd}e^t. And ${n - 1} × ${pd} = ${c1T}.`,
              },
              {
                say: 'Put the pieces into u′v + uv′.',
                tex: [
                  R`m_X''(t) = \underbrace{${npT}e^t${base}^{${n - 1}}}_{u'v} + \underbrace{${npT}e^t \cdot ${c1T}e^t${base}^{${n - 2}}}_{uv'}`,
                  R`m_X''(t) = ${npT}e^t${base}^{${n - 1}} + ${c2T}e^{2t}${base}^{${n - 2}}`,
                ],
                why: `e^t · e^t = e^(2t), and ${npT} × ${c1T} = ${c2T}.`,
              },
              {
                say: `Put in t = 0. Again every e^0 is 1 and the inside is q + p = ${qd} + ${pd} = 1, so both powers are 1.`,
                tex: R`E[X^2] = m_X''(0) = ${npT}(1)(1)^{${n - 1}} + ${c2T}(1)(1)^{${n - 2}} = ${npT} + ${c2T} = ${num(ex2, 4)}`,
              },
              {
                say: 'Variance from the shortcut formula.',
                tex: R`\operatorname{Var} X = E[X^2] - (E[X])^2 = ${num(ex2, 4)} - (${npT})^2 = ${num(ex2, 4)} - ${num(np * np, 4)} = ${num(npq, 4)}`,
                why: 'The same as part (c): the MGF agrees with np and npq.',
              },
            ],
            trap: 'm″ needs the product rule: e^t and (q + pe^t)^(n−1) both change with t. Differentiating only one of them loses a term.',
          },
        ],
      }
    },
  })

  // ---------- 3.5 #43 (b, c): E[X] and E[X²] from an MGF, in letters ----------
  // The homework is the binomial; a twin does the same for another distribution's MGF.
  const MGF_SHOW = {
    binomial: {
      text: R`**Setup (part (a), not assigned):** \(m_X(t)\) is the moment generating function for a binomial random variable with parameters \(n\) and \(p\): \[m_X(t) = \left(q + pe^t\right)^n, \qquad q = 1 - p.\]`,
      mean: 'np',
      ex2: 'n^2p^2 - np^2 + np',
      hintB: 'E[X] = m′(0). The MGF is (something)^n: use the chain rule.',
      b: [
        { say: 'The mean is the first derivative of the MGF at t = 0.', tex: R`E[X] = m_X'(0)` },
        {
          say: 'Differentiate with the chain rule: bring the power n down and lower it to n − 1, then multiply by the derivative of the inside, q + pe^t.',
          tex: [R`\frac{d}{dt}\left(q + pe^t\right) = pe^t`, R`m_X'(t) = n\left(q + pe^t\right)^{n-1} \cdot pe^t`],
          why: 'q is a constant, so its derivative is 0.',
        },
        {
          say: 'Put in t = 0. Then e^0 = 1, so the inside becomes q + p, which is 1, and 1 to any power is 1.',
          tex: R`m_X'(0) = n\left(q + pe^0\right)^{n-1} \cdot pe^0 = n(q + p)^{n-1}p = n(1)^{n-1}p = np`,
          why: 'q + p = 1 because q is defined as 1 − p.',
        },
      ],
      hintC: 'E[X²] = m″(0). Your m′(t) is a product of two pieces with t in both: use the product rule.',
      c: [
        {
          say: 'The second moment is the second derivative at t = 0. Start from m′(t) in part (b), with the constants n and p gathered in front.',
          tex: [R`E[X^2] = m_X''(0)`, R`m_X'(t) = n\left(q + pe^t\right)^{n-1} \cdot pe^t = np\,e^t\left(q + pe^t\right)^{n-1}`],
        },
        {
          say: 'm′(t) is a product of two pieces that both have t in them, so use the product rule (uv)′ = u′v + uv′. First write each piece and its derivative.',
          tex: [R`u = np\,e^t, \qquad u' = np\,e^t`, R`v = \left(q + pe^t\right)^{n-1}, \qquad v' = (n-1)\left(q + pe^t\right)^{n-2} \cdot pe^t`],
          why: 'v′ is the chain rule again, as in part (b): the power n − 1 comes down, then multiply by the inside’s derivative pe^t.',
        },
        {
          say: 'Put the pieces into u′v + uv′.',
          tex: R`m_X''(t) = \underbrace{np\,e^t\left(q + pe^t\right)^{n-1}}_{u'v} + \underbrace{np\,e^t \cdot (n-1)\left(q + pe^t\right)^{n-2}pe^t}_{uv'}`,
        },
        {
          say: 'Put in t = 0. Every e^0 is 1, and the inside becomes q + p = 1, so both powers are 1.',
          tex: [
            R`m_X''(0) = np\,e^0\left(q + pe^0\right)^{n-1} + np\,e^0(n-1)\left(q + pe^0\right)^{n-2}pe^0`,
            R`= np(q + p)^{n-1} + np(n-1)(q + p)^{n-2}p`,
            R`= np(1) + np(n-1)p(1) = np + n(n-1)p^2`,
          ],
          why: 'q + p = 1 because q = 1 − p.',
        },
        {
          say: 'Multiply out n(n − 1)p² to match the form asked for.',
          tex: R`E[X^2] = np + n^2p^2 - np^2 = n^2p^2 - np^2 + np`,
          why: R`Bonus: \(\operatorname{Var} X = E[X^2] - (np)^2 = np - np^2 = np(1 - p) = npq\), the binomial variance.`,
        },
      ],
    },
    poisson: {
      text: R`Let \(X\) be a Poisson random variable with parameter \(k\). Its moment generating function is \[m_X(t) = e^{k(e^t - 1)}.\]`,
      mean: 'k',
      ex2: 'k^2 + k',
      hintB: 'E[X] = m′(0). The MGF is e^(something): use the chain rule.',
      b: [
        { say: 'The mean is the first derivative of the MGF at t = 0.', tex: R`E[X] = m_X'(0)` },
        {
          say: 'Chain rule: the derivative of e^(stuff) is e^(stuff) times the derivative of the stuff. Here the stuff is k(e^t − 1).',
          tex: R`m_X'(t) = e^{k(e^t - 1)} \cdot ke^t = ke^t\,e^{k(e^t - 1)}`,
          why: 'k(e^t − 1) = ke^t − k, and its derivative is ke^t.',
        },
        {
          say: 'Put in t = 0. Then e^0 = 1, so the exponent is k(1 − 1) = 0.',
          tex: R`m_X'(0) = e^{k(1 - 1)} \cdot k = e^0 \cdot k = k`,
        },
      ],
      hintC: 'E[X²] = m″(0). Your m′(t) is a product of two pieces with t in both: use the product rule.',
      c: [
        {
          say: 'The second moment is the second derivative at t = 0. Start from m′(t) in part (b).',
          tex: [R`E[X^2] = m_X''(0)`, R`m_X'(t) = ke^t \cdot e^{k(e^t - 1)}`],
        },
        {
          say: 'm′(t) is a product, so use the product rule (uv)′ = u′v + uv′.',
          tex: [R`u = ke^t, \qquad u' = ke^t`, R`v = e^{k(e^t - 1)}, \qquad v' = ke^t\,e^{k(e^t - 1)}`],
          why: 'v′ is the same chain rule as in part (b).',
        },
        {
          say: 'Put the pieces together.',
          tex: R`m_X''(t) = ke^t\,e^{k(e^t - 1)} + ke^t \cdot ke^t\,e^{k(e^t - 1)}`,
        },
        {
          say: 'Put in t = 0: every e^0 is 1, and the exponent k(e^0 − 1) is 0.',
          tex: R`E[X^2] = m_X''(0) = k + k \cdot k = k^2 + k`,
          why: R`Bonus: \(\operatorname{Var} X = (k^2 + k) - k^2 = k\). A Poisson’s variance equals its mean.`,
        },
      ],
    },
    geometric: {
      text: R`Let \(X\) be a geometric random variable with parameter \(p\), and \(q = 1 - p\). Its moment generating function is \[m_X(t) = \frac{pe^t}{1 - qe^t}, \qquad t < -\ln q.\]`,
      mean: R`\frac{1}{p}`,
      ex2: R`\frac{1 + q}{p^2}`,
      hintB: 'E[X] = m′(0). The MGF is a fraction: use the quotient rule.',
      b: [
        { say: 'The mean is the first derivative of the MGF at t = 0.', tex: R`E[X] = m_X'(0)` },
        {
          say: 'm(t) is a fraction, so use the quotient rule (f/g)′ = (f′g − fg′)/g².',
          tex: [R`f = pe^t, \quad f' = pe^t, \qquad g = 1 - qe^t, \quad g' = -qe^t`, R`m_X'(t) = \frac{pe^t(1 - qe^t) - pe^t(-qe^t)}{(1 - qe^t)^2}`],
        },
        {
          say: 'Multiply out the top: the pqe^(2t) terms cancel.',
          tex: R`m_X'(t) = \frac{pe^t - pqe^{2t} + pqe^{2t}}{(1 - qe^t)^2} = \frac{pe^t}{(1 - qe^t)^2}`,
        },
        {
          say: 'Put in t = 0, and use 1 − q = p.',
          tex: R`m_X'(0) = \frac{p}{(1 - q)^2} = \frac{p}{p^2} = \frac{1}{p}`,
        },
      ],
      hintC: 'E[X²] = m″(0). Write m′(t) as pe^t·(1 − qe^t)^(−2) and use the product rule.',
      c: [
        {
          say: 'The second moment is the second derivative at t = 0. Write m′(t) from part (b) with a negative power, so it is a product.',
          tex: [R`E[X^2] = m_X''(0)`, R`m_X'(t) = pe^t(1 - qe^t)^{-2}`],
        },
        {
          say: 'Product rule (uv)′ = u′v + uv′, with the chain rule for v′.',
          tex: [R`u = pe^t, \qquad u' = pe^t`, R`v = (1 - qe^t)^{-2}, \qquad v' = -2(1 - qe^t)^{-3}(-qe^t) = 2qe^t(1 - qe^t)^{-3}`],
          why: 'The inside, 1 − qe^t, has derivative −qe^t. The two minus signs cancel.',
        },
        {
          say: 'Put the pieces together.',
          tex: R`m_X''(t) = pe^t(1 - qe^t)^{-2} + 2pqe^{2t}(1 - qe^t)^{-3}`,
        },
        {
          say: 'Put in t = 0, and use 1 − q = p.',
          tex: R`m_X''(0) = \frac{p}{(1 - q)^2} + \frac{2pq}{(1 - q)^3} = \frac{p}{p^2} + \frac{2pq}{p^3} = \frac{1}{p} + \frac{2q}{p^2}`,
        },
        {
          say: 'Put both over p², and use p + q = 1.',
          tex: R`E[X^2] = \frac{p}{p^2} + \frac{2q}{p^2} = \frac{p + 2q}{p^2} = \frac{1 + q}{p^2}`,
          why: R`p + 2q = (p + q) + q = 1 + q. Bonus: \(\operatorname{Var} X = \frac{1 + q}{p^2} - \frac{1}{p^2} = \frac{q}{p^2}\), the geometric variance.`,
        },
      ],
    },
    exponential: {
      text: R`Let \(X\) be an exponential random variable with parameter \(\beta\). Its moment generating function is \[m_X(t) = \frac{1}{1 - \beta t}, \qquad t < \frac{1}{\beta}.\]`,
      mean: R`\beta`,
      ex2: R`2\beta^2`,
      hintB: 'E[X] = m′(0). Write m(t) as (1 − βt)^(−1) and use the chain rule.',
      b: [
        {
          say: 'The mean is the first derivative at t = 0. Write m(t) as a negative power: it is easier to differentiate than a fraction.',
          tex: [R`E[X] = m_X'(0)`, R`m_X(t) = (1 - \beta t)^{-1}`],
        },
        {
          say: 'Chain rule: bring the power down, lower it by 1, and multiply by the derivative of the inside, −β.',
          tex: R`m_X'(t) = -1(1 - \beta t)^{-2}(-\beta) = \beta(1 - \beta t)^{-2}`,
          why: 'The two minus signs cancel.',
        },
        {
          say: 'Put in t = 0.',
          tex: R`m_X'(0) = \beta(1)^{-2} = \beta`,
        },
      ],
      hintC: 'E[X²] = m″(0). Differentiate m′(t) = β(1 − βt)^(−2) once more, with the chain rule.',
      c: [
        {
          say: 'The second moment is the second derivative at t = 0. Start from m′(t) in part (b).',
          tex: [R`E[X^2] = m_X''(0)`, R`m_X'(t) = \beta(1 - \beta t)^{-2}`],
        },
        {
          say: 'Chain rule again: power −2 comes down, the power drops to −3, times −β.',
          tex: R`m_X''(t) = \beta(-2)(1 - \beta t)^{-3}(-\beta) = 2\beta^2(1 - \beta t)^{-3}`,
        },
        {
          say: 'Put in t = 0.',
          tex: R`E[X^2] = m_X''(0) = 2\beta^2(1)^{-3} = 2\beta^2`,
          why: R`Bonus: \(\operatorname{Var} X = 2\beta^2 - \beta^2 = \beta^2\), the exponential variance.`,
        },
      ],
    },
    gamma: {
      text: R`Let \(X\) be a gamma random variable with parameters \(\alpha\) and \(\beta\). Its moment generating function is \[m_X(t) = (1 - \beta t)^{-\alpha}, \qquad t < \frac{1}{\beta}.\]`,
      mean: R`\alpha\beta`,
      ex2: R`\alpha^2\beta^2 + \alpha\beta^2`,
      hintB: 'E[X] = m′(0). The MGF is (1 − βt) to a power: use the chain rule.',
      b: [
        { say: 'The mean is the first derivative of the MGF at t = 0.', tex: R`E[X] = m_X'(0)` },
        {
          say: 'Chain rule: bring the power −α down, lower it by 1, and multiply by the derivative of the inside, −β.',
          tex: R`m_X'(t) = -\alpha(1 - \beta t)^{-\alpha - 1}(-\beta) = \alpha\beta(1 - \beta t)^{-\alpha - 1}`,
          why: 'The two minus signs cancel.',
        },
        {
          say: 'Put in t = 0.',
          tex: R`m_X'(0) = \alpha\beta(1)^{-\alpha - 1} = \alpha\beta`,
        },
      ],
      hintC: 'E[X²] = m″(0). Differentiate m′(t) = αβ(1 − βt)^(−α−1) once more, with the chain rule.',
      c: [
        {
          say: 'The second moment is the second derivative at t = 0. Start from m′(t) in part (b).',
          tex: [R`E[X^2] = m_X''(0)`, R`m_X'(t) = \alpha\beta(1 - \beta t)^{-\alpha - 1}`],
        },
        {
          say: 'Chain rule again: the power −α − 1 comes down, the power drops to −α − 2, times −β.',
          tex: R`m_X''(t) = \alpha\beta(-\alpha - 1)(1 - \beta t)^{-\alpha - 2}(-\beta) = \alpha(\alpha + 1)\beta^2(1 - \beta t)^{-\alpha - 2}`,
          why: '(−α − 1)(−β) = (α + 1)β.',
        },
        {
          say: 'Put in t = 0.',
          tex: R`m_X''(0) = \alpha(\alpha + 1)\beta^2`,
        },
        {
          say: 'Multiply out to match the form asked for.',
          tex: R`E[X^2] = \alpha^2\beta^2 + \alpha\beta^2`,
          why: R`Bonus: \(\operatorname{Var} X = \alpha^2\beta^2 + \alpha\beta^2 - (\alpha\beta)^2 = \alpha\beta^2\), the gamma variance.`,
        },
      ],
    },
    chi: {
      text: R`Let \(X\) be a chi-squared random variable with \(\gamma\) degrees of freedom. Its moment generating function is \[m_X(t) = (1 - 2t)^{-\gamma/2}, \qquad t < \frac{1}{2}.\]`,
      mean: R`\gamma`,
      ex2: R`\gamma^2 + 2\gamma`,
      hintB: 'E[X] = m′(0). The MGF is (1 − 2t) to a power: use the chain rule.',
      b: [
        { say: 'The mean is the first derivative of the MGF at t = 0.', tex: R`E[X] = m_X'(0)` },
        {
          say: 'Chain rule: bring the power −γ/2 down, lower it by 1, and multiply by the derivative of the inside, −2.',
          tex: R`m_X'(t) = -\frac{\gamma}{2}(1 - 2t)^{-\gamma/2 - 1}(-2) = \gamma(1 - 2t)^{-\gamma/2 - 1}`,
          why: '(−γ/2)(−2) = γ.',
        },
        {
          say: 'Put in t = 0.',
          tex: R`m_X'(0) = \gamma(1)^{-\gamma/2 - 1} = \gamma`,
        },
      ],
      hintC: 'E[X²] = m″(0). Differentiate m′(t) = γ(1 − 2t)^(−γ/2−1) once more, with the chain rule.',
      c: [
        {
          say: 'The second moment is the second derivative at t = 0. Start from m′(t) in part (b).',
          tex: [R`E[X^2] = m_X''(0)`, R`m_X'(t) = \gamma(1 - 2t)^{-\gamma/2 - 1}`],
        },
        {
          say: 'Chain rule again: the power −γ/2 − 1 comes down, the power drops by 1, times −2.',
          tex: R`m_X''(t) = \gamma\left(-\frac{\gamma}{2} - 1\right)(1 - 2t)^{-\gamma/2 - 2}(-2) = \gamma(\gamma + 2)(1 - 2t)^{-\gamma/2 - 2}`,
          why: '(−γ/2 − 1)(−2) = γ + 2.',
        },
        {
          say: 'Put in t = 0 and multiply out.',
          tex: R`E[X^2] = m_X''(0) = \gamma(\gamma + 2) = \gamma^2 + 2\gamma`,
          why: R`Bonus: \(\operatorname{Var} X = \gamma^2 + 2\gamma - \gamma^2 = 2\gamma\), the chi-squared variance.`,
        },
      ],
    },
    normal: {
      text: R`Let \(X\) be normal with parameters \(\mu\) and \(\sigma\). Its moment generating function is \[m_X(t) = e^{\mu t + \sigma^2 t^2/2}.\]`,
      mean: R`\mu`,
      ex2: R`\mu^2 + \sigma^2`,
      hintB: 'E[X] = m′(0). The MGF is e^(something): use the chain rule.',
      b: [
        { say: 'The mean is the first derivative of the MGF at t = 0.', tex: R`E[X] = m_X'(0)` },
        {
          say: 'Chain rule: the derivative of e^(stuff) is e^(stuff) times the derivative of the stuff, μt + σ²t²/2.',
          tex: R`m_X'(t) = (\mu + \sigma^2 t)\,e^{\mu t + \sigma^2 t^2/2}`,
          why: 'The derivative of σ²t²/2 is σ²t.',
        },
        {
          say: 'Put in t = 0: the exponent is 0, so the e part is 1.',
          tex: R`m_X'(0) = (\mu + 0)\,e^{0} = \mu`,
        },
      ],
      hintC: 'E[X²] = m″(0). Your m′(t) is a product of two pieces with t in both: use the product rule.',
      c: [
        {
          say: 'The second moment is the second derivative at t = 0. Start from m′(t) in part (b).',
          tex: [R`E[X^2] = m_X''(0)`, R`m_X'(t) = (\mu + \sigma^2 t)\,e^{\mu t + \sigma^2 t^2/2}`],
        },
        {
          say: 'm′(t) is a product, so use the product rule (uv)′ = u′v + uv′.',
          tex: [R`u = \mu + \sigma^2 t, \qquad u' = \sigma^2`, R`v = e^{\mu t + \sigma^2 t^2/2}, \qquad v' = (\mu + \sigma^2 t)\,e^{\mu t + \sigma^2 t^2/2}`],
          why: 'v′ is the same chain rule as in part (b).',
        },
        {
          say: 'Put the pieces together.',
          tex: R`m_X''(t) = \sigma^2 e^{\mu t + \sigma^2 t^2/2} + (\mu + \sigma^2 t)^2 e^{\mu t + \sigma^2 t^2/2}`,
        },
        {
          say: 'Put in t = 0: the e part is 1.',
          tex: R`E[X^2] = m_X''(0) = \sigma^2 + \mu^2`,
          why: R`Bonus: \(\operatorname{Var} X = \mu^2 + \sigma^2 - \mu^2 = \sigma^2\).`,
        },
      ],
    },
  }

  HW.add({
    id: '3.5-43',
    section: '3.5',
    num: '43',
    group: 1,
    title: 'Mean and E[X²] from the MGF',
    hw: { d: 'binomial' },
    twin: () => ({ d: HW.rand.pick(['poisson', 'geometric', 'exponential', 'gamma', 'chi', 'normal']) }),
    make: v => {
      const D = MGF_SHOW[v.d]
      return {
        text: D.text,
        parts: [
          {
            label: 'b',
            ask: R`Use \(m_X(t)\) to show that \(E[X] = ${D.mean}\).`,
            skill: 'mgf-moments',
            hint: D.hintB,
            check: { type: 'self' },
            answer: R`E[X] = m_X'(0) = ${D.mean}`,
            steps: D.b,
            trap: 'Differentiate first, then put in t = 0. Putting t = 0 into m(t) itself just gives 1.',
          },
          {
            label: 'c',
            ask: R`Use \(m_X(t)\) to show that \(E[X^2] = ${D.ex2}\).`,
            skill: 'mgf-moments',
            hint: D.hintC,
            check: { type: 'self' },
            answer: R`E[X^2] = m_X''(0) = ${D.ex2}`,
            steps: D.c,
            trap: 'E[X²] is m″(0), not (m′(0))². Squaring the mean leaves out the variance.',
          },
        ],
      }
    },
  })
})()
