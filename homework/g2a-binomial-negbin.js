// Group 2a: binomial and negative binomial (3.5 #37, 42, 44; 3.6 #47, 48)
;(() => {
  const R = String.raw
  const { num, fix } = HW
  const { pick, int, chance } = HW.rand

  // ---------- small helpers ----------
  // the book writes probabilities without the leading zero: .2, .6778
  const bk = s => s.replace(/^(-?)0\./, '$1.')
  const dp = x => bk(num(x, 4)) // a parameter: .25, .1
  const d4 = x => bk(fix(x, 4)) // a table-style entry, always 4 decimals: .6778, .9600
  const sig = (x, s = 4) => bk(String(+x.toPrecision(s))) // a small answer: .001458
  const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i)
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
  const ORD = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth']
  const cnt = (k, [one, many]) => `${k} ${k === 1 ? one : many}`
  const pctOf = p => Math.round(p * 100)
  const tbl = (n, p, x) => HW.binomTable(n, p, x)
  const binomBars = (n, p, hits, note) => {
    const xs = range(0, n)
    return { kind: 'bars', title: `binomial · n = ${n}, p = ${dp(p)}`, xs, ys: xs.map(x => HW.binom.pmf(n, p, x)), hits: new Set(hits), note }
  }
  // f(lo) + … + f(hi) for binomial(n, p), each term to 4 decimals, shortened with ⋯ when long.
  // shownSum is what the shown terms add to (it can be 1 off in the last digit from rounding).
  const binomTerms = (n, p, lo, hi) => {
    const xs = range(lo, hi)
    const t = xs.map(x => d4(HW.binom.pmf(n, p, x)))
    const shownSum = xs.length <= 4 ? t.reduce((s, x) => s + +x, 0) : null
    return { tex: xs.length <= 4 ? t.join(' + ') : [t[0], t[1], R`\cdots`, t[t.length - 1]].join(' + '), shownSum }
  }
  const pdfSum = (n, p, lo, hi) => R`\sum_{x=${lo}}^{${hi}} \binom{${n}}{x}(${dp(p)})^x(${dp(1 - p)})^{${n}-x}`
  const binomFourChecks = n => [
    R`\text{1. A fixed number of tries: } n = ${n}`,
    R`\text{2. Each try is a success or a failure}`,
    R`\text{3. The tries are independent}`,
    R`\text{4. Every try has the same chance of success } p`,
  ]
  // a power written out: (.9)^{3}, or (.68) when the power is 1
  const pw = (b, e) => (e === 1 ? R`(${b})` : R`(${b})^{${e}}`)
  const ex = x => bk(String(+x.toPrecision(5))) // a factor like (.32)^4 ≈ .010486
  const exact = x => Math.abs(+x.toPrecision(5) - x) <= 1e-12 * Math.abs(x) // ex(x) shows x exactly
  // the arcade's wrong choices: drop any that land on the answer (within 1.5 tol) or repeat
  const wrongs = (value, tol, xs) => {
    const seen = new Set(), out = []
    for (const x of xs) {
      if (!Number.isFinite(x) || Math.abs(x - value) <= tol * 1.5) continue
      const k = +x.toPrecision(4)
      if (!seen.has(k)) seen.add(k), out.push(x)
    }
    return out.slice(0, 5)
  }
  const t4 = x => +x.toFixed(4) // a sum or difference of printed entries, without float noise

  // ---------- negative binomial P[X = x]: shared by 3.6 #47 and #48 ----------
  // S: tries ('samples'), oneTry ('sample'), sW/fW: [one, many] words for a success / failure
  const negbinSteps = (S, r, p, x) => {
    const q = 1 - p, c = HW.choose(x - 1, r - 1), v = c * p ** r * q ** (x - r)
    const P = dp(p), Q = dp(q)
    return {
      v,
      wrong: wrongs(v, negbinTol(v), [
        c * q ** r * p ** (x - r), // p and q swapped
        HW.choose(x, r) * p ** r * q ** (x - r), // the binomial C(x, r)
        p ** r * q ** (x - r), // no coefficient
        HW.choose(x - 1, r) * p ** r * q ** (x - r), // C(x − 1, r)
      ]),
      steps: [
        {
          say: `X counts ${S.tries} until the ${S.nth(r)}, so it is negative binomial. Write its pdf.`,
          tex: R`f(x) = \binom{x-1}{r-1}\, p^r q^{x-r}, \quad x = r,\ r+1,\ r+2,\ \ldots`,
          why: 'This pdf is only “possibly given” on the test, so know it, and know where it comes from (next step).',
        },
        {
          say: `X = ${x} means ${S.oneTry} ${x} is the ${S.nth(r)}. So ${S.oneTry} ${x} ${S.sIs}, and the first ${x - 1} ${S.tries} hold exactly ${cnt(r - 1, S.sW)} and ${cnt(x - r, S.fW)}, in any order.`,
          tex: R`\underbrace{\text{${cnt(r - 1, S.sW)}, ${cnt(x - r, S.fW)}}}_{\text{${S.tries} 1 to ${x - 1}, any order}} \quad \underbrace{\text{${S.sW[0]}}}_{\text{${S.oneTry} ${x}}}`,
          why: `There are \\(\\binom{${x - 1}}{${r - 1}} = ${c}\\) ways to place the ${cnt(r - 1, S.sW)} among the first ${x - 1} ${S.tries}. Each way has chance \\(p^{${r}}${x - r === 1 ? 'q' : `q^{${x - r}}`}\\), because the ${S.tries} are independent.`,
        },
        {
          say: `Put in r = ${r}, p = ${P}, q = 1 − p = ${Q} and x = ${x}.`,
          tex: R`P[X = ${x}] = \binom{${x - 1}}{${r - 1}}${pw(P, r)}${pw(Q, x - r)} ${exact(p ** r) && exact(q ** (x - r)) ? '=' : R`\approx`} ${c}(${ex(p ** r)})(${ex(q ** (x - r))})`,
          why: `p is the chance of ${S.succ}, the outcome X waits for (part (a)).`,
        },
        {
          say: 'Multiply.',
          tex: R`P[X = ${x}] \approx ${sig(v)}`,
        },
      ],
    }
  }
  const negbinTol = v => Math.min(0.0005, v * 0.035)
  const negbinTrap = (r, x) => `Not the binomial \\(\\binom{${x}}{${r}}\\): that counts every order of ${r} successes in ${x} tries, including ones where try ${x} is a failure (then the ${ORD[r]} success came earlier, and X would be less than ${x}). The last try must be the ${ORD[r]} success, so only the first ${x - 1} tries get shuffled: \\(\\binom{${x - 1}}{${r - 1}}\\).`

  // ---------- 3.5 #37: albino rats (binomial: label, mean, table, "surprised?") ----------
  const RAT_STORIES = [
    {
      story: (P, n) => R`Albino rats used to study the hormonal regulation of a metabolic pathway are injected with a drug that inhibits body synthesis of protein. The probability that a rat will die from the drug before the experiment is over is \(${P}\). Suppose ${n} animals are treated with the drug.`,
      askB: 'How many are expected to die before the experiment ends?',
      askC: m => `What is the probability that at least ${WORDS[m]} will survive?`,
      askD: k => `Would you be surprised if at least ${WORDS[k]} died during the course of the experiment? Explain, based on the probability of this occurring.`,
      one: 'rat', many: 'rats', failV: 'die', failedV: 'died', okV: 'survive',
      succ: 'a rat that dies', either: 'each one either dies or survives',
      indep: 'one rat dying has no effect on whether another does',
    },
    {
      story: (P, n) => R`A seed company is testing a new variety of pepper. The probability that a seed of this variety fails to sprout is \(${P}\), and each seed sprouts or fails independently of the others. Suppose ${n} seeds are planted.`,
      askB: 'How many are expected to fail to sprout?',
      askC: m => `What is the probability that at least ${WORDS[m]} will sprout?`,
      askD: k => `Would you be surprised if at least ${WORDS[k]} failed to sprout? Explain, based on the probability of this occurring.`,
      one: 'seed', many: 'seeds', failV: 'fail to sprout', failedV: 'failed to sprout', okV: 'sprout',
      succ: 'a seed that fails to sprout', either: 'each one either sprouts or does not',
      indep: 'each seed sprouts or fails on its own',
    },
    {
      story: (P, n) => R`Before shipping, every circuit board a factory makes is run through a heat stress test. The probability that a board fails the test is \(${P}\), independently from board to board. Suppose ${n} boards are tested.`,
      askB: 'How many boards are expected to fail?',
      askC: m => `What is the probability that at least ${WORDS[m]} will pass?`,
      askD: k => `Would you be surprised if at least ${WORDS[k]} failed? Explain, based on the probability of this occurring.`,
      one: 'board', many: 'boards', failV: 'fail', failedV: 'failed', okV: 'pass',
      succ: 'a board that fails', either: 'each one either passes or fails',
      indep: 'one board failing has no effect on the next',
    },
    {
      story: (P, n) => R`A clinic is giving a new vaccine. The probability that a patient runs a fever the day after the shot is \(${P}\), and patients react independently of each other. Suppose ${n} patients get the shot.`,
      askB: 'How many are expected to run a fever?',
      askC: m => `What is the probability that at least ${WORDS[m]} will not run a fever?`,
      askD: k => `Would you be surprised if at least ${WORDS[k]} ran a fever? Explain, based on the probability of this occurring.`,
      one: 'patient', many: 'patients', failV: 'run a fever', failedV: 'ran a fever', okV: 'do not run a fever',
      succ: 'a patient who runs a fever', either: 'each one either runs a fever or does not',
      indep: 'one patient’s reaction has no effect on another’s',
    },
  ]
  const RARE = 0.05
  const tailAt = (n, p, k) => 1 - tbl(n, p, k - 1) // P[X ≥ k] from the printed table

  HW.add({
    id: '3.5-37',
    section: '3.5',
    num: '37',
    group: 2,
    title: 'Albino rats',
    hw: { n: 10, p: 0.2, m: 8, k: 5, s: 0 },
    twin: () => {
      for (;;) {
        const n = pick(HW.BINOM_NS), p = pick([0.1, 0.2, 0.25, 0.3])
        const mean = n * p
        // "at least m are fine" = "at most d fail", with d near the mean
        const d = int(Math.max(1, Math.floor(mean) - 1), Math.ceil(mean) + 1)
        // "at least k fail": rare (a yes) or not rare (a no)
        const ks = range(Math.ceil(mean) + 1, n)
        const yes = ks.filter(k => tailAt(n, p, k) <= 0.035 && tailAt(n, p, k) >= 0.002 && tailAt(n, p, k + 1) >= 0.0005)
        const no = ks.filter(k => tailAt(n, p, k) >= 0.15 && tailAt(n, p, k) <= 0.45)
        const list = chance(0.65) ? yes.slice(0, 1) : no
        if (!list.length) continue
        return { n, p, m: n - d, k: pick(list), s: int(1, RAT_STORIES.length - 1) }
      }
    },
    make: v => {
      const { n, p, m, k } = v
      const S = RAT_STORIES[v.s]
      const q = 1 - p, P = dp(p), Q = dp(q), d = n - m
      const mean = +(n * p).toFixed(10)
      // (c): at least m fine = X ≤ d
      const Fd = tbl(n, p, d)
      const Fy = tbl(n, q, m - 1) // the other way: Y = n − X is binomial(n, q)
      const termsC = binomTerms(n, p, 0, d)
      // (d): at least k fail = 1 − F(k − 1)
      const Fk1 = tbl(n, p, k - 1), Fk = tbl(n, p, k)
      const tail = +(1 - Fk1).toFixed(4), off = +(1 - Fk).toFixed(4)
      const rare = x => x < RARE
      const oneIn = x => Math.round(1 / x)
      const verdict = (x, expr) => rare(x)
        ? R`Yes. \(P[X \ge ${k}] = ${expr} = ${d4(x)}\), about 1 time in ${oneIn(x)}. That is rare.`
        : R`No. \(P[X \ge ${k}] = ${expr} = ${d4(x)}\), about 1 time in ${oneIn(x)}. That is not rare.`
      return {
        text: S.story(P, n),
        parts: [
          {
            label: 'a',
            ask: R`Let \(X\) be the number of the ${n} ${S.many} that ${S.failV}. What distribution does \(X\) have, and with which numbers?`,
            skill: 'label',
            hint: 'Is the number of tries fixed, or does X count tries until something happens? Then: which outcome is X counting?',
            check: {
              type: 'choice',
              options: [
                { tex: R`\text{binomial},\ n = ${n},\ p = ${P}` },
                { tex: R`\text{binomial},\ n = ${n},\ p = ${Q}` },
                { tex: R`\text{geometric},\ p = ${P}` },
                { tex: R`\text{binomial},\ n = ${m},\ p = ${P}` },
              ],
              correct: 0,
            },
            answer: R`X \sim \text{binomial}(n = ${n},\ p = ${P})`,
            steps: [
              {
                say: `Each ${S.one} is one try. X counts the ${S.many} that ${S.failV}, so a “success” here is ${S.succ}.`,
                why: '“Success” only means the outcome X counts. It does not have to be good news.',
              },
              {
                say: 'Check the four things a binomial needs.',
                tex: binomFourChecks(n),
                why: `The story gives all four: there are ${n} ${S.many}, ${S.either}, ${S.indep}, and the chance is always ${P}.`,
              },
              {
                say: 'Read off the numbers.',
                tex: R`n = ${n}, \qquad p = ${P}, \qquad q = 1 - p = ${Q}`,
                why: `p goes with the outcome X counts (${S.many} that ${S.failV}). ${Q} is the chance of the other outcome.`,
              },
            ],
            trap: `p = ${Q} would only be right if X counted the ${S.many} that ${S.okV}. Decide what X counts first; p is the chance of that.`,
          },
          {
            label: 'b',
            ask: S.askB,
            skill: 'formulas',
            hint: 'Once you know the distribution, its mean has a formula.',
            check: { type: 'number', value: mean, tol: 0.01, wrong: wrongs(mean, 0.01, [n * q, n * p * q, Math.sqrt(n * p * q)]) },
            answer: R`E[X] = np = ${num(mean, 4)}`,
            steps: [
              {
                say: 'The binomial mean is np.',
                tex: R`E[X] = np`,
              },
              {
                say: 'Put in n and p from part (a).',
                tex: R`E[X] = ${n}(${P}) = ${num(mean, 4)}`,
                why: `Each ${S.one} has chance ${P}, so on average that fraction of the ${n} ${S.many} ${S.failV}.${Number.isInteger(mean) ? '' : ' An expected value does not have to be a whole number.'}`,
              },
            ],
            trap: `nq = ${num(n * q, 4)} is the expected number that ${S.okV}, not the number that ${S.failV}.`,
          },
          {
            label: 'c',
            ask: S.askC(m),
            skill: 'binom-table',
            hint: `Write the number that ${S.okV} in terms of X. Then turn “at least ${m}” into a statement about X.`,
            check: {
              type: 'number', value: Fd, tol: 0.0005,
              wrong: wrongs(Fd, 0.0005, [t4(1 - Fd), tbl(n, p, d - 1), t4(1 - tbl(n, p, m - 1)), t4(Fd - tbl(n, p, d - 1)), t4(1 - tbl(n, p, d - 1))]),
            },
            answer: R`P[X \le ${d}] = F(${d}) = ${d4(Fd)}`,
            steps: [
              {
                say: `If X ${S.many} ${S.failV}, the other ${n} − X ${S.okV}.`,
                tex: R`\text{number that ${S.okV}} = ${n} - X`,
              },
              {
                say: `Turn “at least ${m} ${S.okV}” into a statement about X.`,
                tex: [R`${n} - X \ge ${m} \iff ${n} - ${m} \ge X \iff X \le ${d}`, R`\text{${S.okV}: } ${range(m, n).reverse().join(', ')} \;\longleftrightarrow\; \text{${S.failV}: } ${range(0, d).join(', ')}`],
                why: `Part (a) gave the distribution of X (p = ${P}), so ask the question about X. The list shows it: ${m} or more that ${S.okV} is the same as ${d} or fewer that ${S.failV}.`,
              },
              {
                say: `The table gives P[X ≤ x] directly. Use the n = ${n} table, column ${P}, row ${d}.`,
                tex: R`P[X \le ${d}] = F(${d}) = ${d4(Fd)}`,
                look: HW.binomLook(n, p, d),
                graph: binomBars(n, p, range(0, d), `lit: X = 0 to ${d}, total ${d4(Fd)}`),
              },
              {
                say: `Without the table you would add the pdf for x = 0 to ${d}. Same answer.`,
                tex: R`${pdfSum(n, p, 0, d)} = ${termsC.tex} \approx ${d4(Fd)}`,
                why: termsC.shownSum != null && d4(termsC.shownSum) !== d4(Fd)
                  ? 'This is the sum the table does for you. The shown terms are rounded, so they can be 1 off in the last digit.'
                  : 'This is the sum the table does for you.',
              },
              {
                say: `Another way: let Y = ${n} − X count the ${S.many} that ${S.okV}. Y is binomial with p = ${Q} (the chance of the other outcome), and the table has that column too.`,
                tex: R`P[Y \ge ${m}] = 1 - P[Y \le ${m - 1}] = 1 - ${d4(Fy)} = ${d4(1 - Fy)}`,
                look: HW.binomLook(n, q, m - 1),
                why: d4(1 - Fy) === d4(Fd) ? 'Both ways give the same number. Use whichever needs no complement.' : 'Both ways give the same number, up to rounding in the last digit.',
              },
            ],
            trap: `Not 1 − F(${m - 1}) = ${d4(1 - tbl(n, p, m - 1))}: that is the chance that at least ${m} ${S.failV}. Here ${m} counts ${S.many} that ${S.okV}, so it becomes X ≤ ${d}.`,
          },
          {
            label: 'd',
            ask: S.askD(k),
            skill: 'binom-table',
            hint: `Write “at least ${k}” with X, then use the complement to get an “at most” that the table gives.`,
            check: {
              type: 'choice',
              options: [
                { text: verdict(tail, `1 - F(${k - 1})`) },
                {
                  text: rare(tail)
                    ? R`No. \(P[X \ge ${k}] = ${d4(tail)}\) is bigger than 0, so it can happen, and there is nothing to be surprised about.`
                    : R`Yes. \(P[X \ge ${k}] = ${d4(tail)}\) is less than \(.5\), so it is unlikely, and that would be a surprise.`,
                },
                { text: verdict(off, `1 - F(${k})`) },
                { text: R`No. \(P[X \ge ${k}] = F(${k - 1}) = ${d4(Fk1)}\), so it is likely.` },
              ],
              correct: 0,
            },
            answer: rare(tail)
              ? R`\text{Yes: } P[X \ge ${k}] = 1 - F(${k - 1}) = ${d4(tail)} \text{ is rare}`
              : R`\text{No: } P[X \ge ${k}] = 1 - F(${k - 1}) = ${d4(tail)} \text{ is not rare}`,
            steps: [
              {
                say: `“At least ${k} ${S.failedV}” is X ≥ ${k}.`,
                tex: R`P[X \ge ${k}]`,
              },
              {
                say: 'The table only gives “at most”, so use the complement.',
                tex: R`P[X \ge ${k}] = 1 - P[X \le ${k - 1}] = 1 - F(${k - 1})`,
                why: `X ≥ ${k} and X ≤ ${k - 1} cover every case with no overlap. Row ${k - 1}, not row ${k}: X = ${k} belongs to what we want, so it must not be subtracted.`,
              },
              {
                say: `Read F(${k - 1}) from the n = ${n} table, column ${P}, row ${k - 1}.`,
                tex: R`F(${k - 1}) = ${d4(Fk1)}`,
                look: HW.binomLook(n, p, k - 1),
              },
              {
                say: 'Subtract.',
                tex: R`P[X \ge ${k}] = 1 - ${d4(Fk1)} = ${d4(tail)}`,
                graph: binomBars(n, p, range(k, n), `lit: X = ${k} to ${n}, total ${d4(tail)}`),
              },
              rare(tail)
                ? {
                    say: `Judge it. ${d4(tail)} is about 1 time in ${oneIn(tail)}. A common rule: a chance below about .05 is rare enough to be surprising.`,
                    tex: R`${d4(tail)} < .05 \;\Rightarrow\; \text{yes, surprised}`,
                    why: `So yes. If ${k} or more ${S.failedV}, you would start to doubt that the chance is really ${P}: it looks higher.`,
                  }
                : {
                    say: `Judge it. ${d4(tail)} is about 1 time in ${oneIn(tail)}. That is well above the usual “rare” line of about .05.`,
                    tex: R`${d4(tail)} > .05 \;\Rightarrow\; \text{no, not surprised}`,
                    why: `So no. With an average of ${num(mean, 4)}, seeing ${k} or more is an ordinary result.`,
                  },
            ],
            trap: `Using row ${k} gives 1 − F(${k}) = P[X ≥ ${k + 1}]: one step too far. For “at least ${k}”, subtract row ${k - 1}.`,
          },
        ],
      }
    },
  })

  // ---------- 3.5 #42: silent paging errors (binomial pdf at 0, and "at least one") ----------
  const SILENT_STORIES = [
    {
      story: (P, n) => R`It is possible for a computer to pick up an erroneous signal that does not show up as an error on the screen. The error is called a silent paging error. A particular terminal is defective, and when using the system word processor, it introduces a silent paging error with probability \(${P}\). The word processor is used ${n} times during a given week.`,
      askA: 'Find the probability that no silent paging errors occur.',
      askB: 'Find the probability that at least one such error occurs.',
      X: n => `the number of the ${n} uses that have a silent paging error`,
      tries: 'uses', succ: 'has an error', none: 'every use is clean',
      indep: 'we take the uses to be independent (each use is a fresh chance at an error)',
    },
    {
      story: (P, n) => R`A spam filter is not perfect: each junk email that reaches it slips through into the inbox with probability \(${P}\), independently of the others. During a given day ${n} junk emails arrive.`,
      askA: 'Find the probability that none of the junk emails get through.',
      askB: 'Find the probability that at least one of them gets through.',
      X: n => `the number of the ${n} junk emails that get through`,
      tries: 'junk emails', succ: 'gets through', none: 'every junk email is caught',
      indep: 'each email is filtered on its own',
    },
    {
      story: (P, n) => R`A self-checkout scanner misreads a barcode with probability \(${P}\), independently from item to item. A customer scans ${n} items.`,
      askA: 'Find the probability that the scanner misreads none of the items.',
      askB: 'Find the probability that it misreads at least one item.',
      X: n => `the number of the ${n} items that are misread`,
      tries: 'items', succ: 'is misread', none: 'every item scans correctly',
      indep: 'each scan is independent',
    },
    {
      story: (P, n) => R`An old office printer jams on any given page with probability \(${P}\), independently of the other pages. A report of ${n} pages is printed.`,
      askA: 'Find the probability that the printer never jams.',
      askB: 'Find the probability that it jams at least once.',
      X: n => `the number of the ${n} pages that jam`,
      tries: 'pages', succ: 'jams', none: 'every page prints without a jam',
      indep: 'one page jamming has no effect on the next',
    },
  ]
  // (n, p) on the printed tables with P[X = 0] = qⁿ not too small to type
  const SILENT_NP = HW.BINOM_NS.flatMap(n => [0.1, 0.2, 0.25, 0.3].map(p => [n, p])).filter(([n, p]) => (1 - p) ** n >= 0.01)

  HW.add({
    id: '3.5-42',
    section: '3.5',
    num: '42',
    group: 2,
    title: 'Silent paging errors',
    hw: { n: 20, p: 0.1, s: 0 },
    twin: () => {
      const [n, p] = pick(SILENT_NP)
      return { n, p, s: int(1, SILENT_STORIES.length - 1) }
    },
    make: v => {
      const { n, p } = v
      const S = SILENT_STORIES[v.s]
      const q = 1 - p, P = dp(p), Q = dp(q)
      const zero = q ** n, one = n * p * q ** (n - 1) // P[X = 0], P[X = 1]
      return {
        text: S.story(P, n),
        parts: [
          {
            label: 'a',
            ask: S.askA,
            skill: 'disc-prob',
            hint: 'Name the distribution first: what is being counted, out of how many tries? Then ask which value of X “none” is.',
            check: { type: 'number', value: zero, tol: Math.min(0.0005, zero * 0.05), wrong: wrongs(zero, Math.min(0.0005, zero * 0.05), [1 - zero, tbl(n, p, 1), one]) },
            answer: R`P[X = 0] = (${Q})^{${n}} \approx ${d4(zero)}`,
            steps: [
              {
                say: `Name the distribution. Let X be ${S.X(n)}.`,
                tex: R`X \sim \text{binomial}(n = ${n},\ p = ${P}), \qquad q = 1 - p = ${Q}`,
                why: `A fixed ${n} ${S.tries}; each one either ${S.succ} or not; ${S.indep}; and the chance is ${P} every time. Those are the four things a binomial needs.`,
              },
              {
                say: 'The binomial pdf gives the chance of exactly x.',
                tex: R`f(x) = \binom{n}{x} p^x q^{n-x}, \quad x = 0, 1, \ldots, ${n}`,
              },
              {
                say: '“None” is X = 0. Put x = 0 into the pdf.',
                tex: R`P[X = 0] = \binom{${n}}{0}(${P})^0(${Q})^{${n}} = (${Q})^{${n}}`,
                why: `\\(\\binom{${n}}{0} = 1\\) (one way to pick none) and anything to the power 0 is 1. In words: ${S.none}, each with chance ${Q}, so multiply ${Q} by itself ${n} times.`,
              },
              {
                say: `Work it out. The n = ${n} table agrees: row 0 is P[X ≤ 0], which is just P[X = 0].`,
                tex: R`(${Q})^{${n}} \approx ${d4(zero)}`,
                look: HW.binomLook(n, p, 0),
              },
            ],
            trap: `Not (${P})^${n}: that is the chance that every one of the ${n} ${S.tries} ${S.succ}. “None” means all ${n} go the other way, chance ${Q} each.`,
          },
          {
            label: 'b',
            ask: S.askB,
            skill: 'disc-prob',
            hint: '“At least one” is every outcome except one. Which one?',
            check: { type: 'number', value: 1 - zero, tol: 0.0005, wrong: wrongs(1 - zero, 0.0005, [zero, 1 - one, t4(1 - tbl(n, p, 1)), one]) },
            answer: R`P[X \ge 1] = 1 - (${Q})^{${n}} \approx ${d4(1 - +d4(zero))}`,
            steps: [
              {
                say: '“At least one” is everything except “none”. Use the complement.',
                tex: R`P[X \ge 1] = 1 - P[X = 0]`,
                why: `X ≥ 1 is ${n} values to add (X = 1, 2, …, ${n}). The complement is one value, and part (a) already found it.`,
              },
              {
                say: 'Subtract the answer to (a).',
                tex: R`P[X \ge 1] = 1 - (${Q})^{${n}} \approx 1 - ${d4(zero)} = ${d4(1 - +d4(zero))}`,
              },
            ],
            trap: `The opposite of “at least one” is “none” (X = 0), not “exactly one”. And n·p = ${num(n * p, 4)} is the expected number, not a probability.`,
          },
        ],
      }
    },
  })

  // ---------- 3.5 #44 (a): metal detector (binomial table, "at least") ----------
  const CAUSE_STORIES = [
    {
      story: (pc, n) => R`Assume that each time a metal detector at an airport signals, there is a ${pc}% chance that the cause is change in the passenger's pocket. During a given hour, ${n} passengers are stopped because of a signal from the metal detector.`,
      ask: c => `Find the probability that at least ${c} persons will have been stopped due to change in their pockets.`,
      X: n => `the number of the ${n} stopped passengers whose signal was caused by change`,
      tries: 'stopped passengers', succ: 'the cause is change', many: 'passengers',
      indep: 'what one passenger carries has nothing to do with the next',
    },
    {
      story: (pc, n) => R`Each time the smoke alarm in a college dormitory goes off, there is a ${pc}% chance that the cause is burnt microwave popcorn. During one semester the alarm goes off ${n} times.`,
      ask: c => `Find the probability that at least ${c} of the alarms were caused by burnt popcorn.`,
      X: n => `the number of the ${n} alarms caused by burnt popcorn`,
      tries: 'alarms', succ: 'the cause is popcorn', many: 'alarms',
      indep: 'one alarm’s cause has nothing to do with the next',
    },
    {
      story: (pc, n) => R`Each time a car comes into a repair shop with its check-engine light on, there is a ${pc}% chance that the cause is just a loose gas cap. During one week ${n} such cars come in.`,
      ask: c => `Find the probability that at least ${c} of these cars just had a loose gas cap.`,
      X: n => `the number of the ${n} cars whose light was caused by a loose gas cap`,
      tries: 'cars', succ: 'the cause is a loose gas cap', many: 'cars',
      indep: 'one car’s problem has nothing to do with the next',
    },
    {
      story: (pc, n) => R`Each call to a campus computer help desk has a ${pc}% chance of being about a forgotten password. During one morning the help desk takes ${n} calls.`,
      ask: c => `Find the probability that at least ${c} of the calls are about forgotten passwords.`,
      X: n => `the number of the ${n} calls about forgotten passwords`,
      tries: 'calls', succ: 'the call is about a password', many: 'calls',
      indep: 'one caller’s problem has nothing to do with the next',
    },
  ]

  HW.add({
    id: '3.5-44',
    section: '3.5',
    num: '44',
    group: 2,
    title: 'Metal detector',
    hw: { n: 15, p: 0.25, c: 3, s: 0 },
    twin: () => {
      for (;;) {
        const n = pick(HW.BINOM_NS), p = pick([0.1, 0.2, 0.25, 0.3, 0.4])
        const c = int(2, Math.ceil(n * p) + 1)
        const val = 1 - tbl(n, p, c - 1)
        if (val >= 0.08 && val <= 0.97) return { n, p, c, s: int(1, CAUSE_STORIES.length - 1) }
      }
    },
    make: v => {
      const { n, p, c } = v
      const S = CAUSE_STORIES[v.s]
      const q = 1 - p, P = dp(p), Q = dp(q)
      const F = tbl(n, p, c - 1), ans = +(1 - F).toFixed(4)
      const terms = binomTerms(n, p, 0, c - 1)
      return {
        text: S.story(pctOf(p), n),
        parts: [
          {
            label: 'a',
            ask: S.ask(c),
            skill: 'binom-table',
            hint: `Name the distribution and its numbers first. Then write “at least ${c}” with a complement, because the table gives “at most”.`,
            check: { type: 'number', value: ans, tol: 0.0005, wrong: wrongs(ans, 0.0005, [t4(1 - tbl(n, p, c)), F, tbl(n, p, c), t4(tbl(n, p, c) - F)]) },
            answer: R`P[X \ge ${c}] = 1 - F(${c - 1}) = 1 - ${d4(F)} = ${d4(ans)}`,
            steps: [
              {
                say: `Name the distribution. Let X be ${S.X(n)}.`,
                tex: R`X \sim \text{binomial}(n = ${n},\ p = ${P})`,
                why: `A fixed ${n} ${S.tries}; for each one, either ${S.succ} or not; ${S.indep}; and the chance is ${pctOf(p)}% = ${P} every time. Those are the four things a binomial needs.`,
              },
              {
                say: 'The table only gives “at most”, so use the complement.',
                tex: R`P[X \ge ${c}] = 1 - P[X \le ${c - 1}] = 1 - F(${c - 1})`,
                why: `X ≥ ${c} is everything except X = ${range(0, c - 1).join(', ')}. Row ${c - 1}, not row ${c}: X = ${c} belongs to what we want.`,
              },
              {
                say: `Read F(${c - 1}) from the n = ${n} table, column ${P}, row ${c - 1}.`,
                tex: R`F(${c - 1}) = ${d4(F)}`,
                look: HW.binomLook(n, p, c - 1),
              },
              {
                say: 'Subtract.',
                tex: R`P[X \ge ${c}] = 1 - ${d4(F)} = ${d4(ans)}`,
                graph: binomBars(n, p, range(c, n), `lit: X = ${c} to ${n}, total ${d4(ans)}`),
              },
              {
                say: `Without the table: add the pdf for x = 0 to ${c - 1} and subtract from 1. Same answer.`,
                tex: R`1 - ${pdfSum(n, p, 0, c - 1)} = 1 - (${terms.tex}) \approx ${d4(ans)}`,
                why: terms.shownSum != null && d4(terms.shownSum) !== d4(F)
                  ? 'This is the sum the table does for you. The shown terms are rounded, so they can be 1 off in the last digit.'
                  : 'This is the sum the table does for you.',
              },
            ],
            trap: `1 − F(${c}) (row ${c}) is P[X ≥ ${c + 1}]: one step too far. For “at least ${c}”, subtract row ${c - 1}.`,
          },
        ],
      }
    },
  })

  // ---------- 3.6 #47: highway flares (negative binomial, success = OUTSIDE the bounds) ----------
  const FLARE_STORIES = [
    {
      story: (pc, r, m) => R`A company is manufacturing highway emergency flares. Such flares are supposed to burn for an average of 20 minutes. Every hour a sample of flares is collected, and their average burn time is determined. If the manufacturing process is working correctly, there is a ${pc}% chance that the average burn time of the sample will be between 14 minutes and 26 minutes. The quality engineer in charge of the process believes that if ${r} of ${m} samples fall outside these bounds then this is a signal that the process might not be performing as expected. Each morning the sampling begins anew. Let \(X\) denote the number of samples drawn in order to obtain the ${ORD[r]} sample whose average value is outside of the above bounds.`,
      ask: m => R`Find the probability that for a given morning \(X = ${m}\) and hence there seems to be a problem right away.`,
      bounds: '14 to 26 minutes',
    },
    {
      story: (pc, r, m) => R`A cereal company fills boxes that are supposed to hold an average of 16 ounces. Every hour a sample of boxes is pulled from the line, and their average weight is determined. If the filling machine is working correctly, there is a ${pc}% chance that the average weight of the sample will be between 15.8 and 16.2 ounces. The plant manager believes that if ${r} of ${m} samples fall outside these bounds then the machine needs adjusting. Each shift the sampling begins anew. Let \(X\) denote the number of samples drawn in order to obtain the ${ORD[r]} sample whose average is outside of these bounds.`,
      ask: m => R`Find the probability that for a given shift \(X = ${m}\), so the machine seems to need adjusting right away.`,
      bounds: '15.8 to 16.2 ounces',
    },
    {
      story: (pc, r, m) => R`A machine shop makes bolts that are supposed to have an average diameter of 10 millimeters. Every hour a sample of bolts is measured, and their average diameter is determined. If the lathe is working correctly, there is a ${pc}% chance that the average diameter of the sample will be between 9.9 and 10.1 millimeters. The shop foreman believes that if ${r} of ${m} samples fall outside these bounds then the lathe should be checked. Each day the sampling begins anew. Let \(X\) denote the number of samples drawn in order to obtain the ${ORD[r]} sample whose average is outside of these bounds.`,
      ask: m => R`Find the probability that on a given day \(X = ${m}\), so the lathe seems to need checking right away.`,
      bounds: '9.9 to 10.1 millimeters',
    },
    {
      story: (pc, r, m) => R`A chain of cafés sets its coffee machines to pour an average of 12 ounces per cup. Every hour a sample of cups is measured, and their average volume is determined. If a machine is working correctly, there is a ${pc}% chance that the average volume of the sample will be between 11.5 and 12.5 ounces. The manager believes that if ${r} of ${m} samples fall outside these bounds then the machine needs servicing. Each morning the sampling begins anew. Let \(X\) denote the number of samples drawn in order to obtain the ${ORD[r]} sample whose average is outside of these bounds.`,
      ask: m => R`Find the probability that on a given morning \(X = ${m}\), so the machine seems to need servicing right away.`,
      bounds: '11.5 to 12.5 ounces',
    },
  ]
  const FLARE_WORDS = { tries: 'samples', oneTry: 'sample', sW: ['outside sample', 'outside samples'], fW: ['inside sample', 'inside samples'], sIs: 'is outside the bounds', nth: r => `${ORD[r]} sample outside the bounds`, succ: 'a sample outside the bounds' }

  HW.add({
    id: '3.6-47',
    section: '3.6',
    num: '47',
    group: 2,
    title: 'Highway flares',
    hw: { inside: 0.68, r: 4, m: 5, s: 0 },
    twin: () => {
      const r = pick([2, 3, 4])
      // not m = 2r: then p and q have the same power, and swapping them would still pass
      const m = r === 2 ? 3 : r + int(1, 2)
      return { inside: pick([0.68, 0.7, 0.75, 0.8]), r, m, s: int(1, FLARE_STORIES.length - 1) }
    },
    make: v => {
      const { inside, r, m } = v
      const S = FLARE_STORIES[v.s]
      const p = +(1 - inside).toFixed(4), q = inside
      const P = dp(p), Q = dp(q)
      const nb = negbinSteps(FLARE_WORDS, r, p, m)
      return {
        text: S.story(pctOf(inside), r, m),
        parts: [
          {
            label: 'a',
            ask: R`What kind of random variable is \(X\)? Identify its parameters \(r\) and \(p\).`,
            skill: 'label',
            hint: 'Is the number of samples fixed, or does X count samples until something happens? Which kind of sample is X waiting for?',
            check: {
              type: 'choice',
              options: [
                { tex: R`\text{negative binomial},\ r = ${r},\ p = ${P}` },
                { tex: R`\text{negative binomial},\ r = ${r},\ p = ${Q}` },
                { tex: R`\text{binomial},\ n = ${m},\ p = ${P}` },
                { tex: R`\text{geometric},\ p = ${P}` },
              ],
              correct: 0,
            },
            answer: R`X \sim \text{negative binomial}(r = ${r},\ p = ${P})`,
            steps: [
              {
                say: `Ask what X counts: samples drawn until the ${ORD[r]} one outside the bounds. The number of samples is not fixed.`,
                why: 'Counting tries until the r-th success is exactly what a negative binomial does. (Until the FIRST success would be geometric.)',
              },
              {
                say: `So a “success” is a sample whose average is OUTSIDE ${S.bounds}.`,
                why: '“Success” means the outcome X is waiting for, even when it is bad news for the people running the process.',
              },
              {
                say: `The story gives ${pctOf(inside)}% for INSIDE the bounds. Outside is the other outcome.`,
                tex: R`p = 1 - ${Q} = ${P}, \qquad q = ${Q}`,
                why: 'Every sample is either inside or outside, so the two chances add to 1.',
              },
              {
                say: `r is how many successes X waits for: the ${ORD[r]} outside sample.`,
                tex: R`r = ${r}`,
                why: `The samples are independent (a new sample each hour) and each has the same chance ${P} of landing outside while the process works correctly.`,
              },
            ],
            trap: `p = ${Q} is the chance of landing INSIDE, which is a failure here. And the “${r} of ${m}” in the story does not make it binomial: X is the number of samples, not a count out of a fixed ${m}.`,
          },
          {
            label: 'b',
            ask: S.ask(m),
            skill: 'disc-prob',
            hint: `X = ${m} means sample ${m} is the ${ORD[r]} one outside the bounds. What must the first ${m - 1} samples hold?`,
            check: { type: 'number', value: nb.v, tol: negbinTol(nb.v), wrong: nb.wrong },
            answer: R`P[X = ${m}] = \binom{${m - 1}}{${r - 1}}${pw(P, r)}${pw(Q, m - r)} \approx ${sig(nb.v)}`,
            steps: nb.steps,
            trap: negbinTrap(r, m),
          },
        ],
      }
    },
  })

  // ---------- 3.6 #48: pitching machine (negative binomial: label, mean, P[X = x]) ----------
  // given: 'q' when the story gives the chance of the OTHER outcome (the trap), 'p' when it gives p
  const WALK_STORIES = [
    {
      story: g => R`A particular pitching machine is manufactured so that it will throw the ball into the strike zone of a 6-foot batter ${g}% of the time.`,
      given: 'q', fixedR: 4,
      labX: () => R`Let \(X\) be the number of pitches the machine throws in order to walk a batter (that is, throw 4 pitches outside of the strike zone).`,
      askB: () => 'What is the average number of pitches that it will throw in order to walk a batter (that is, throw 4 pitches outside of the strike zone)?',
      askC: (r, x) => `What is the probability that the fourth ball will be thrown on the ${ORD[x]} pitch?`,
      tries: 'pitches', oneTry: 'pitch', sW: ['ball', 'balls'], fW: ['strike', 'strikes'], sIs: 'is a ball', nth: r => `${ORD[r]} ball`,
      succ: 'a ball (a pitch outside the strike zone)', gWhat: 'a strike (a pitch in the zone)',
      counts: 'pitches until the fourth ball, since a walk is 4 balls',
      indep: 'a machine has no memory of its last pitch',
    },
    {
      story: (g, r) => R`A stamping machine makes a good part ${g}% of the time, and each part is good or defective independently of the others. The machine is stopped for recalibration as soon as it has made ${WORDS[r]} defective parts.`,
      given: 'q',
      labX: r => R`Let \(X\) be the number of parts the machine makes in order to produce ${WORDS[r]} defective parts.`,
      askB: r => `What is the average number of parts it will make in order to produce ${WORDS[r]} defective parts?`,
      askC: (r, x) => `What is the probability that the ${ORD[r]} defective part is the ${ORD[x]} part made?`,
      tries: 'parts', oneTry: 'part', sW: ['defective part', 'defective parts'], fW: ['good part', 'good parts'], sIs: 'is defective', nth: r => `${ORD[r]} defective part`,
      succ: 'a defective part', gWhat: 'a good part',
      counts: r => `parts until the ${ORD[r]} defective one`,
      indep: 'one defective part has no effect on the next',
    },
    {
      story: (pv, r) => R`Each call a telemarketer makes ends in a sale with probability \(${pv}\), independently of her other calls. She stops for the day as soon as she has made ${WORDS[r]} sales.`,
      given: 'p',
      labX: r => R`Let \(X\) be the number of calls she makes in order to get ${WORDS[r]} sales.`,
      askB: r => `What is the average number of calls she will make in order to get ${WORDS[r]} sales?`,
      askC: (r, x) => `What is the probability that her ${ORD[r]} sale comes on the ${ORD[x]} call?`,
      tries: 'calls', oneTry: 'call', sW: ['sale', 'sales'], fW: ['call with no sale', 'calls with no sale'], sIs: 'ends in a sale', nth: r => `${ORD[r]} sale`,
      succ: 'a call that ends in a sale', gWhat: 'a sale',
      counts: r => `calls until the ${ORD[r]} sale`,
      indep: 'one call has no effect on the next',
    },
    {
      story: (g, r) => R`A tennis player gets her first serve in ${g}% of the time, and one serve has no effect on the next. In a practice drill she keeps serving until she has missed ${WORDS[r]} serves.`,
      given: 'q',
      labX: r => R`Let \(X\) be the number of serves she hits in order to miss ${WORDS[r]}.`,
      askB: r => `What is the average number of serves she will hit in order to miss ${WORDS[r]}?`,
      askC: (r, x) => `What is the probability that her ${ORD[r]} miss comes on the ${ORD[x]} serve?`,
      tries: 'serves', oneTry: 'serve', sW: ['miss', 'misses'], fW: ['serve in', 'serves in'], sIs: 'is a miss', nth: r => `${ORD[r]} miss`,
      succ: 'a missed serve', gWhat: 'a serve that goes in',
      counts: r => `serves until the ${ORD[r]} miss`,
      indep: 'one serve has no effect on the next',
    },
  ]

  HW.add({
    id: '3.6-48',
    section: '3.6',
    num: '48',
    group: 2,
    title: 'Pitching machine',
    hw: { p: 0.1, r: 4, x: 7, s: 0 },
    twin: () => {
      for (;;) {
        const s = int(0, WALK_STORIES.length - 1), S = WALK_STORIES[s]
        const p = pick([0.1, 0.2, 0.25, 0.3])
        const r = S.fixedR ?? pick([2, 3, 4])
        const x = r + int(1, 4)
        if (x === 2 * r) continue // p and q would have the same power: swapping them would still pass
        const val = HW.choose(x - 1, r - 1) * p ** r * (1 - p) ** (x - r)
        if (val < 0.001) continue
        if (s === 0 && p === 0.1 && x === 7) continue // that is the homework itself
        return { p, r, x, s }
      }
    },
    make: v => {
      const { p, r, x } = v
      const S = WALK_STORIES[v.s]
      const q = +(1 - p).toFixed(4), P = dp(p), Q = dp(q)
      const mean = +(r / p).toFixed(10)
      const nb = negbinSteps(S, r, p, x)
      const counts = typeof S.counts === 'function' ? S.counts(r) : S.counts
      const meanT = Number.isInteger(mean) ? R`= ${mean}` : R`\approx ${num(mean, 2)}`
      const per = +(1 / p).toFixed(10)
      return {
        text: S.given === 'q' ? S.story(pctOf(q), r) : S.story(P, r),
        parts: [
          {
            label: 'a',
            ask: R`${S.labX(r)} What distribution does \(X\) have, and with which numbers?`,
            skill: 'label',
            hint: `What is X waiting for? That outcome is the “success”, even if it is bad news. Then find its chance${S.given === 'q' ? ' (careful: is that the chance the story gives?)' : ''}.`,
            check: {
              type: 'choice',
              options: [
                { tex: R`\text{negative binomial},\ r = ${r},\ p = ${P}` },
                { tex: R`\text{negative binomial},\ r = ${r},\ p = ${Q}` },
                { tex: R`\text{geometric},\ p = ${P}` },
                { tex: R`\text{binomial},\ n = ${x},\ p = ${P}` },
              ],
              correct: 0,
            },
            answer: R`X \sim \text{negative binomial}(r = ${r},\ p = ${P})`,
            steps: [
              {
                say: `Ask what X counts: ${counts}. The number of ${S.tries} is not fixed.`,
                why: 'Counting tries until the r-th success is exactly what a negative binomial does. (Until the FIRST success would be geometric.)',
              },
              {
                say: `So a “success” is ${S.succ}.`,
                why: '“Success” means the outcome X is waiting for, whether or not it is good news.',
              },
              S.given === 'q'
                ? {
                    say: `The story gives ${pctOf(q)}% for ${S.gWhat}. That is a failure here, so p is the other outcome.`,
                    tex: R`p = 1 - ${Q} = ${P}, \qquad q = ${Q}`,
                    why: `Every ${S.oneTry} is one or the other, so the two chances add to 1.`,
                  }
                : {
                    say: `The story gives the chance of ${S.gWhat} directly. That is p.`,
                    tex: R`p = ${P}, \qquad q = 1 - p = ${Q}`,
                  },
              {
                say: `r is how many successes X waits for.`,
                tex: R`r = ${r}`,
                why: `The ${S.tries} are independent (${S.indep}) and each has the same chance ${P}, so the negative binomial fits.`,
              },
            ],
            trap: S.given === 'q'
              ? `p = ${Q} is the chance of ${S.gWhat}, which is a failure here. p must be the chance of what X is waiting for.`
              : `Not binomial: there is no fixed number of ${S.tries}. X itself is the number of ${S.tries}.`,
          },
          {
            label: 'b',
            ask: S.askB(r),
            skill: 'formulas',
            hint: 'Once you know the distribution and its numbers, its mean has a formula.',
            check: { type: 'number', value: mean, tol: 0.05, wrong: wrongs(mean, 0.05, [r / q, (r * q) / p ** 2, 1 / p, Math.sqrt(r * q) / p]) },
            answer: R`E[X] = \frac{r}{p} ${meanT}`,
            steps: [
              {
                say: 'The negative binomial mean is r/p.',
                tex: R`E[X] = \frac{r}{p}`,
                why: `Each success takes 1/p tries on average, and X waits for r of them.`,
              },
              {
                say: 'Put in r and p from part (a).',
                tex: R`E[X] = \frac{${r}}{${P}} ${meanT}`,
                ...(Number.isInteger(per) ? { why: `1 ${S.oneTry} in ${per} ${S.sIs}, so on average it takes ${per} ${S.tries} to get each one, and ${r} of them take ${r} × ${per} = ${num(mean, 4)}.` } : {}),
              },
            ],
            trap: `r/q = ${num(r / q, 2)} uses the wrong chance, and rq/p² = ${num((r * q) / p ** 2, 2)} is the variance, not the mean.`,
          },
          {
            label: 'c',
            ask: S.askC(r, x),
            skill: 'disc-prob',
            hint: `If ${S.oneTry} ${x} is the ${S.nth(r)}, what must have happened in the first ${x - 1} ${S.tries}?`,
            check: { type: 'number', value: nb.v, tol: negbinTol(nb.v), wrong: nb.wrong },
            answer: R`P[X = ${x}] = \binom{${x - 1}}{${r - 1}}${pw(P, r)}${pw(Q, x - r)} \approx ${sig(nb.v)}`,
            steps: nb.steps,
            trap: negbinTrap(r, x),
          },
        ],
      }
    },
  })
})()
