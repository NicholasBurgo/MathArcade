// Group 7: the gaps. Skills the study guide lists that the assigned homework doesn't
// practise (extraction/test-homework/7-gaps.md, what-to-learn.md §4).
// The book's text for the "extra practice" problems isn't available, so these problems
// are written here in the book's style. They are NOT the book's exercises (num: 'extra').
// A derivation keeps its general (letters) form as the homework version, hw: { gen: true };
// its twins are the same derivation inside a story with numbers. Both builds have the
// same parts, so a part's progress means the same thing on either.
;(() => {
  const R = String.raw
  const { num, frac, rand, choose } = HW

  // ---------- helpers ----------
  const d = x => num(x, 4) // a decimal as written in a formula: 0.4, 0.25
  const eq = (x, k = 4) => (Math.abs(+num(x, k) - x) < 1e-12 ? '=' : R`\approx`)
  // '= 0.125' when the decimal is exact (up to 6 places), else '\approx 0.0714'
  const val = x => {
    for (const k of [4, 5, 6]) if (eq(x, k) === '=') return `= ${num(x, k)}`
    return R`\approx ${num(x, 4)}`
  }
  const tolP = x => (Math.abs(x) >= 0.01 ? 0.0005 : 0.00006)
  const ord = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] ?? 'th')
  const pw = (base, e) => (e === 1 ? `(${base})` : `(${base})^{${e}}`) // (0.6)^{3}, or (0.6) when e = 1
  const s_ = (k, one, many) => (k === 1 ? one : many)
  const over = (top, c) => (c === 1 ? top : R`\frac{${top}}{${c}}`)
  const list = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).join(', ')
  const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
  // the arcade's wrong choices: from a list of real mistakes, keep the ones that are
  // finite, well away from the answer, not repeated, and (for a probability) inside (0, 1)
  const wrongs = (value, tol, xs, prob = false) => {
    const out = []
    for (const x of xs) {
      if (!Number.isFinite(x) || Math.abs(x - value) <= 2 * tol) continue
      if (prob && !(x > 0 && x < 1)) continue
      if (out.some(y => +y.toPrecision(4) === +x.toPrecision(4))) continue
      out.push(x)
    }
    return out.slice(0, 5)
  }
  const numCheck = (value, tol, xs, prob = false) => ({ type: 'number', value, tol, wrong: wrongs(value, tol, xs, prob) })

  // =====================================================================================
  // Geometric: the pdf, the cdf and the MGF (3.4)
  // =====================================================================================
  const GEO = [
    {
      story: p => R`A quality inspector tests computer chips one at a time. Each chip is defective with probability \(${p}\), independently of the others. Let \(X\) denote the number of chips tested to find the first defective one.`,
      S: 'a defective chip', F: 'a good chip', T: 'chip', Ts: 'chips', ps: [0.1, 0.2, 0.25],
      first: m => `the first defective chip is the ${ord(m)} one tested`,
    },
    {
      story: p => R`A sales representative makes calls one after another. Each call ends in a sale with probability \(${p}\), independently of the other calls. Let \(X\) denote the number of calls made to get the first sale.`,
      S: 'a sale', F: 'no sale', T: 'call', Ts: 'calls',
      first: m => `the first sale comes on the ${ord(m)} call`,
    },
    {
      story: p => R`An archer shoots arrows at a target. Each arrow hits the bullseye with probability \(${p}\), and one arrow has no effect on the next. Let \(X\) denote the number of arrows shot to get the first bullseye.`,
      S: 'a bullseye', F: 'a miss', T: 'arrow', Ts: 'arrows',
      first: m => `the first bullseye comes on the ${ord(m)} arrow`,
    },
    {
      story: p => R`A biologist traps birds one at a time. Each bird trapped already wears a leg band with probability \(${p}\), independently of the others. Let \(X\) denote the number of birds trapped to find the first banded one.`,
      S: 'a banded bird', F: 'an unbanded bird', T: 'bird', Ts: 'birds',
      first: m => `the first banded bird is the ${ord(m)} one trapped`,
    },
  ]
  const GEO_PS = [0.1, 0.2, 0.25, 0.3, 0.4] // not 0.5: with p = q the steps can't show which is which
  // a story and a p that suits it (a chip is rarely defective)
  const geoTwin = () => {
    const s = rand.int(0, GEO.length - 1)
    return { s, p: rand.pick(GEO[s].ps ?? GEO_PS) }
  }
  const GEO_TEXT = R`An experiment consists of a series of independent trials. Each trial ends in a success, with probability \(p\), or a failure, with probability \(q = 1 - p\). Let \(X\) denote the number of trials needed to obtain the first success.`
  // p, q and the density as TeX: letters for the general derivation, decimals for a twin
  const geoSyms = v => {
    if (v.gen) return { G: true, S: { S: 'a success', F: 'a failure', T: 'trial', Ts: 'trials' }, p: 'p', q: 'q', P: 'p', Q: 'q', f: 'q^{x-1}p', fk: 'q^{k-1}p' }
    const p = d(v.p), q = d(1 - v.p)
    return { G: false, S: GEO[v.s], p, q, P: `(${p})`, Q: `(${q})`, f: `(${q})^{x-1}(${p})`, fk: `(${q})^{k-1}(${p})` }
  }
  const geoBars = (p, m) => {
    const xs = range(1, 10)
    return { kind: 'bars', title: `geometric · p = ${d(p)}`, xs, ys: xs.map(x => (1 - p) ** (x - 1) * p), hits: new Set([m]), note: `the lit bar: P[X = ${m}] ≈ ${num((1 - p) ** (m - 1) * p, 4)}` }
  }

  // ---------- derive the geometric pdf, and show it sums to 1 ----------
  HW.add({
    id: 'gap-geometric-pdf',
    section: '3.4',
    num: 'extra',
    group: 7,
    title: 'Derive the geometric pdf',
    hw: { gen: true, p: 0.2, m: 3 },
    twin: () => ({ ...geoTwin(), m: rand.int(3, 5) }), // not x = 2: there q·p and p·q are the same, so a p/q swap would pass
    make: v => {
      const { G, S, p, q, P, Q, f } = geoSyms(v)
      const m = v.m, pn = d(v.p), qn = d(1 - v.p)
      const qm = (1 - v.p) ** (m - 1), pm = qm * v.p
      return {
        text: G ? GEO_TEXT : S.story(p),
        parts: [
          {
            label: 'a',
            ask: R`Derive the density \(f\) for \(X\), and say which values \(X\) can take.`,
            skill: 'derive-pdf',
            hint: `Write X = x as a string of successes (S) and failures (F). Which ${S.Ts} fail, and which one succeeds?`,
            check: { type: 'self' },
            answer: R`f(x) = ${f}, \quad x = 1, 2, 3, \ldots`,
            steps: [
              {
                say: `X = x means the first success comes on ${S.T} number x. So the x − 1 ${S.Ts} before it all failed.`,
                tex: R`X = x \iff \underbrace{F\,F \cdots F}_{x-1 \text{ failures}}\;S`,
                why: G ? 'X counts the trials up to and including the first success.' : `Here a success (S) is ${S.S}, and a failure (F) is ${S.F}.`,
              },
              ...(G ? [] : [{ say: 'Write down p, the chance of a success, and q = 1 − p, the chance of a failure.', tex: R`p = ${p}, \qquad q = 1 - ${p} = ${q}` }]),
              {
                say: `The ${S.Ts} are independent, so multiply their chances: ${q} for each failure, then ${p} for the success.`,
                tex: R`P[X = x] = \underbrace{${Q}\,${Q} \cdots ${Q}}_{x-1}\;${P} = ${f}`,
                why: `Independent means one ${S.T}’s result doesn’t change another’s chance. That is exactly when chances multiply.`,
              },
              {
                say: 'Say which x are possible.',
                tex: R`f(x) = ${f}, \quad x = 1, 2, 3, \ldots`,
                why: `The first success can come on the first ${S.T} at the earliest, and there is no last ${S.T}: the failures could go on and on.`,
              },
            ],
            trap: 'The power is x − 1, not x: only the trials before the success are failures.',
          },
          {
            label: 'b',
            ask: R`Show that \(f\) is a density.`,
            skill: 'show-pdf',
            hint: 'Two checks: f(x) ≥ 0 for every x, and the f(x) add up to 1. Adding them up gives an infinite geometric series.',
            check: { type: 'self' },
            answer: R`f(x) \ge 0 \ \text{ and } \ \sum_{x=1}^{\infty} ${f} = \frac{${p}}{1 - ${q}} = 1`,
            steps: [
              { say: 'A discrete density needs two things.', tex: [R`\text{1. } f(x) \ge 0 \text{ for every } x`, R`\text{2. } \sum_{\text{all } x} f(x) = 1`] },
              {
                say: G ? 'First check: p and q are probabilities, so both are ≥ 0, and so is any product of them.' : `First check: ${p} and ${q} are positive, so every product of them is too.`,
                tex: R`f(x) = ${f} \ge 0`,
              },
              {
                say: `Second check: write the total as a series. Each term is the one before times ${q}, so it is a geometric series.`,
                tex: R`\sum_{x=1}^{\infty} ${f} = ${P} + ${Q}${P} + ${Q}^2${P} + \cdots`,
              },
              {
                say: `Use the infinite geometric series from the formula sheet, with first term a = ${p} and ratio r = ${q}.`,
                tex: [R`\sum_{k=1}^{\infty} ar^{k-1} = \frac{a}{1-r}`, R`\sum_{x=1}^{\infty} ${f} = \frac{${p}}{1 - ${q}}`],
                why: G ? 'The formula needs the ratio between −1 and 1. Here r = q, and 0 ≤ q < 1 because p > 0.' : `The formula needs the ratio between −1 and 1, and r = ${q} is.`,
              },
              {
                say: G ? 'Simplify: 1 − q = p.' : `Simplify: 1 − ${q} = ${p}.`,
                tex: R`\frac{${p}}{1 - ${q}} = \frac{${p}}{${p}} = 1`,
                why: 'Both checks pass, so f is a density.',
              },
            ],
            trap: 'Don’t skip the first check. A density also needs f(x) ≥ 0, and graders look for both.',
          },
          {
            label: 'c',
            ask: G
              ? R`Take \(p = ${pn}\). Find the probability that the first success comes on the ${ord(m)} trial.`
              : R`Find the probability that ${S.first(m)}.`,
            skill: 'disc-prob',
            hint: 'Which value of X is that? Put it into the density from part (a).',
            // wrong: power x instead of x − 1, p and q swapped, the last p forgotten, the cdf P[X ≤ m]
            check: numCheck(pm, tolP(pm), [qm * (1 - v.p) * v.p, v.p ** (m - 1) * (1 - v.p), qm, 1 - (1 - v.p) ** m], true),
            answer: R`P[X = ${m}] = ${pw(qn, m - 1)}(${pn}) ${val(pm)}`,
            steps: [
              {
                say: `That is X = ${m}: ${m - 1} ${s_(m - 1, 'failure', 'failures')}, then a success.${G ? ` With p = ${pn}, q = 1 − ${pn} = ${qn}.` : ''} Put x = ${m} into the density.`,
                tex: R`P[X = ${m}] = f(${m}) = ${pw(qn, m - 1)}(${pn})`,
              },
              {
                say: 'Work it out.',
                tex: R`${pw(qn, m - 1)}(${pn}) = ${num(qm, 6)} \times ${pn} ${val(pm)}`,
                graph: geoBars(v.p, m),
              },
            ],
          },
        ],
      }
    },
  })

  // ---------- prove the geometric cdf F(x) = 1 − q^x ----------
  HW.add({
    id: 'gap-geometric-cdf',
    section: '3.4',
    num: 'extra',
    group: 7,
    title: 'Prove the geometric cdf',
    hw: { gen: true },
    twin: () => ({ ...geoTwin(), x0: +(rand.int(2, 4) + rand.pick([0.25, 0.5, 0.7, 0.8])).toFixed(2) }),
    make: v => {
      const { G, S, p, q, P, Q, fk } = geoSyms(v)
      const partA = {
        label: 'a',
        ask: G
          ? R`Show that the cumulative distribution function for \(X\) is \(F(x) = 1 - q^x\) for \(x = 1, 2, 3, \ldots\)`
          : R`Derive the cumulative distribution function \(F(x)\) for \(X\), for \(x = 1, 2, 3, \ldots\)`,
        skill: 'geo-cdf',
        hint: 'F(x) = P[X ≤ x]: add f(1) + f(2) + … + f(x). Which formula on the sheet adds a finite geometric series?',
        check: { type: 'self' },
        answer: R`F(x) = 1 - ${Q}^x, \quad x = 1, 2, 3, \ldots`,
        steps: [
          ...(G ? [] : [{
            say: `X counts ${S.Ts} until the first success (${S.S}), so X is geometric. Write down p, q and the density.`,
            tex: R`p = ${p}, \quad q = 1 - ${p} = ${q}, \qquad f(x) = (${q})^{x-1}(${p}), \quad x = 1, 2, 3, \ldots`,
          }]),
          {
            say: 'Start from the definition: F(x) = P[X ≤ x] adds the density over every value from 1 up to x.',
            tex: R`F(x) = P[X \le x] = \sum_{k=1}^{x} ${fk} = ${P} + ${Q}${P} + \cdots + ${Q}^{x-1}${P}`,
            why: 'Use k as the counting letter, because x is already the stopping point.',
          },
          {
            say: `This is a finite geometric series: x terms, each one the one before times ${q}. Use the formula sheet with first term a = ${p}, ratio r = ${q}, and n = x terms.`,
            tex: [R`\sum_{k=1}^{n} ar^{k-1} = \frac{a(1-r^n)}{1-r}`, R`F(x) = \frac{${p}\left(1 - ${Q}^x\right)}{1 - ${q}}`],
            why: G ? 'The formula needs r ≠ 1 (or it divides by 0). Here r = q, and q < 1 because p > 0.' : `The formula needs r ≠ 1 (or it divides by 0), and r = ${q} isn’t 1.`,
          },
          {
            say: G ? 'Simplify: 1 − q = p, so the p’s cancel.' : `Simplify: 1 − ${q} = ${p}, so the ${p}’s cancel.`,
            tex: R`F(x) = \frac{${p}\left(1 - ${Q}^x\right)}{${p}} = 1 - ${Q}^x`,
          },
          {
            say: `Check it another way: X > x means the first x ${S.Ts} all failed.`,
            tex: R`P[X > x] = ${Q}^x \;\Rightarrow\; F(x) = 1 - P[X > x] = 1 - ${Q}^x`,
            why: 'This is a quick way to rebuild the formula on a test if you forget it.',
          },
        ],
        trap: 'The finite series has x terms (k = 1 up to x), so the power in the answer is x, not x − 1.',
      }
      if (G) {
        return {
          text: R`Let \(X\) be geometric with parameter \(p\), so that its density is \(f(x) = q^{x-1}p\) for \(x = 1, 2, 3, \ldots\), where \(q = 1 - p\).`,
          parts: [
            partA,
            {
              label: 'b',
              ask: R`What is \(F(2.5)\)? More generally, what is \(F(x)\) when \(x\) is not a whole number, and when \(x < 1\)?`,
              skill: 'geo-cdf',
              hint: 'F(x) = P[X ≤ x] makes sense for any x. Which values can X actually take that are ≤ 2.5?',
              check: {
                type: 'choice',
                options: [{ tex: R`F(2.5) = 1 - q^2` }, { tex: R`F(2.5) = 1 - q^{2.5}` }, { tex: R`F(2.5) = 1 - q^3` }, { tex: R`F(2.5) = q^2` }],
                correct: 0,
              },
              answer: R`F(2.5) = 1 - q^2; \qquad F(x) = \begin{cases} 0 & x < 1 \\ 1 - q^{\lfloor x \rfloor} & x \ge 1 \end{cases}`,
              steps: [
                { say: 'F(x) = P[X ≤ x] is defined for every real number x, not only for whole numbers.' },
                {
                  say: 'X only takes whole-number values, so X ≤ 2.5 happens exactly when X ≤ 2.',
                  tex: R`F(2.5) = P[X \le 2.5] = P[X \le 2] = F(2) = 1 - q^2`,
                },
                {
                  say: R`In general, round \(x\) down to a whole number, written \(\lfloor x \rfloor\). Below 1, F is 0, because X is always at least 1.`,
                  tex: R`F(x) = \begin{cases} 0 & x < 1 \\ 1 - q^{\lfloor x \rfloor} & x \ge 1 \end{cases}`,
                  why: 'So F is a staircase: flat between whole numbers, stepping up by f(x) at each x = 1, 2, 3, … Every discrete cdf looks like that.',
                },
              ],
              trap: R`Don’t put 2.5 into \(1 - q^x\). X can’t be 2.5, so F doesn’t change between 2 and 3.`,
            },
          ],
        }
      }
      const x0 = v.x0, fl = Math.floor(x0)
      const qf = (1 - v.p) ** fl, Fx = 1 - qf
      const stair = {
        kind: 'curve',
        title: `the cdf F(x) for p = ${p}: a staircase`,
        lo: 0,
        hi: fl + 3,
        pdf: x => (x < 1 ? 0 : 1 - (1 - v.p) ** Math.floor(x)),
        ticks: range(0, fl + 3),
        marks: [x0],
        note: `F is flat from ${fl} to ${fl + 1}, so F(${x0}) = F(${fl}) ≈ ${num(Fx, 4)}`,
      }
      return {
        text: S.story(p),
        parts: [
          partA,
          {
            label: 'b',
            ask: R`Find \(F(${x0})\).`,
            skill: 'geo-cdf',
            hint: `X only takes whole-number values. Which of them are ≤ ${x0}?`,
            // wrong: x0 itself in the power, rounded up, the complement P[X > ⌊x0⌋], p and q swapped
            check: numCheck(Fx, tolP(Fx), [1 - (1 - v.p) ** x0, 1 - (1 - v.p) ** (fl + 1), qf, 1 - v.p ** fl], true),
            answer: R`F(${x0}) = F(${fl}) = 1 - (${q})^{${fl}} ${val(Fx)}`,
            steps: [
              {
                say: `F(${x0}) = P[X ≤ ${x0}]. X only takes whole-number values, so X ≤ ${x0} happens exactly when X ≤ ${fl}.`,
                tex: R`F(${x0}) = P[X \le ${x0}] = P[X \le ${fl}] = F(${fl})`,
              },
              {
                say: `Use F(x) = 1 − q^x from part (a), with x = ${fl}.`,
                tex: R`F(${fl}) = 1 - (${q})^{${fl}} = 1 - ${num(qf, 6)} ${val(Fx)}`,
              },
              {
                say: 'The same idea works for any x: round x down to a whole number. Below 1, F is 0, since X is at least 1.',
                tex: R`F(x) = \begin{cases} 0 & x < 1 \\ 1 - (${q})^{\lfloor x \rfloor} & x \ge 1 \end{cases}`,
                graph: stair,
              },
            ],
            trap: R`Don’t put \(${x0}\) into \(1 - q^x\): that gives \(1 - (${q})^{${x0}}\), but X can’t be ${x0}, so F stays flat from ${fl} up to ${fl + 1}.`,
          },
        ],
      }
    },
  })

  // ---------- derive the geometric MGF, where it exists, and E[X] from it ----------
  HW.add({
    id: 'gap-geometric-mgf',
    section: '3.4',
    num: 'extra',
    group: 7,
    title: 'Derive the geometric MGF',
    hw: { gen: true, p: 0.2 }, // p is only used at the end of (c), to check a number
    twin: geoTwin,
    make: v => {
      const { G, S, p, q, P, Q, f } = geoSyms(v)
      const pe = G ? 'pe^t' : `${p}e^t`, qe = G ? 'qe^t' : `${q}e^t`
      const pq = G ? 'pq' : d(v.p * (1 - v.p))
      const t0 = G ? null : -Math.log(1 - v.p)
      const stepsB = [
        {
          say: R`The geometric series only adds up when its ratio is between −1 and 1. Here the ratio is \(${qe}\), which is positive, so it must be less than 1.`,
          tex: R`${qe} < 1`,
        },
        {
          say: `Solve for t: divide by ${q}, then take ln of both sides. ln keeps the < because it is an increasing function.`,
          tex: G
            ? R`e^t < \frac{1}{q} \;\Rightarrow\; t < \ln\frac{1}{q} = -\ln q`
            : R`e^t < \frac{1}{${q}} \;\Rightarrow\; t < \ln\frac{1}{${q}} = -\ln(${q}) \approx ${num(t0)}`,
        },
        {
          say: G
            ? R`Since \(q < 1\), \(-\ln q\) is positive. So the MGF exists for every t near 0, and that is all you need: moments come from t = 0.`
            : R`Since \(${q} < 1\), \(-\ln(${q})\) is positive. So the MGF exists for every t near 0, and that is all you need: moments come from t = 0.`,
        },
      ]
      return {
        text: G ? R`Let \(X\) be geometric with parameter \(p\), so that \(f(x) = q^{x-1}p\) for \(x = 1, 2, 3, \ldots\), where \(q = 1 - p\).` : S.story(p),
        parts: [
          {
            label: 'a',
            ask: R`Derive the moment generating function \(m_X(t)\) for \(X\).`,
            skill: 'geo-mgf',
            hint: 'Write m_X(t) = E[e^(tX)] as a sum over x = 1, 2, 3, …, then make every term the same thing to the power x − 1.',
            check: { type: 'self' },
            answer: R`m_X(t) = \frac{${pe}}{1 - ${qe}}, \quad ${qe} < 1`,
            steps: [
              ...(G ? [] : [{ say: `X counts ${S.Ts} until the first success (${S.S}), so X is geometric. Write down p, q and the density.`, tex: R`p = ${p}, \quad q = 1 - ${p} = ${q}, \qquad f(x) = ${f}, \quad x = 1, 2, 3, \ldots` }]),
              {
                say: R`Start from the definition. The MGF is the expected value of \(e^{tX}\). For a discrete X that is the sum of \(e^{tx}f(x)\) over every x.`,
                tex: R`m_X(t) = E\left[e^{tX}\right] = \sum_{x=1}^{\infty} e^{tx}\,${f}`,
              },
              {
                say: R`Split \(e^{tx}\) into \(e^t \cdot e^{t(x-1)}\), so its power matches the power on ${G ? 'q' : q}. Then pull out what doesn’t change with x.`,
                tex: R`= \sum_{x=1}^{\infty} e^{t}\,e^{t(x-1)}\,${Q}^{x-1}${P} = ${pe}\sum_{x=1}^{\infty}\left(${qe}\right)^{x-1}`,
                why: R`Two things to the same power multiply into one: \(e^{t(x-1)}\,${Q}^{x-1} = \left(${qe}\right)^{x-1}\).`,
              },
              {
                say: R`That is an infinite geometric series. Use the formula sheet with first term a = 1 and ratio \(r = ${qe}\).`,
                tex: [R`\sum_{k=1}^{\infty} ar^{k-1} = \frac{a}{1-r}`, R`m_X(t) = ${pe}\cdot\frac{1}{1 - ${qe}} = \frac{${pe}}{1 - ${qe}}, \qquad ${qe} < 1`],
                why: R`The formula only works when the ratio is between −1 and 1. \(${qe}\) is positive, so that means \(${qe} < 1\): part (b) turns this into a range of t.`,
              },
            ],
            trap: R`Don’t forget the \(e^t\) on top. It comes from splitting \(e^{tx}\) so the power matches \(x - 1\).`,
          },
          G
            ? {
                label: 'b',
                ask: R`For which values of \(t\) does \(m_X(t)\) exist?`,
                skill: 'geo-mgf',
                hint: 'The geometric series formula only works for some ratios. What is the ratio here?',
                check: {
                  type: 'choice',
                  options: [{ tex: R`t < -\ln q` }, { tex: R`t > -\ln q` }, { tex: R`t < \ln q` }, { tex: R`\text{every real number } t` }],
                  correct: 0,
                },
                answer: R`t < -\ln q = \ln\frac{1}{q}`,
                steps: stepsB,
              }
            : {
                label: 'b',
                ask: R`The moment generating function exists only for \(t < t_0\). Find \(t_0\).`,
                skill: 'geo-mgf',
                hint: R`The geometric series formula only works when its ratio is less than 1. The ratio here is \(${qe}\).`,
                // wrong: the sign of ln lost, p for q, no ln at all (1/q), the log key (base 10)
                check: numCheck(t0, 0.0005, [Math.log(1 - v.p), -Math.log(v.p), 1 / (1 - v.p), -Math.log10(1 - v.p)]),
                answer: R`t_0 = -\ln(${q}) \approx ${num(t0)}`,
                steps: stepsB,
              },
          {
            label: 'c',
            ask: G ? R`Use \(m_X(t)\) to show that \(E[X] = 1/p\). Then find \(E[X]\) when \(p = ${d(v.p)}\).` : R`Use \(m_X(t)\) to find \(E[X]\).`,
            skill: 'mgf-moments',
            hint: 'E[X] = m′(0). Use the quotient rule, simplify the top, then put in t = 0.',
            // wrong: p and q swapped, the variance q/p², q/p, p itself
            check: numCheck(1 / v.p, 0.01, [1 / (1 - v.p), (1 - v.p) / v.p ** 2, (1 - v.p) / v.p, v.p]),
            answer: G ? R`E[X] = m_X'(0) = \frac{1}{p};\qquad p = ${d(v.p)}: \ E[X] = \frac{1}{${d(v.p)}} ${val(1 / v.p)}` : R`E[X] = m_X'(0) = \frac{1}{${p}} ${val(1 / v.p)}`,
            steps: [
              {
                say: 'E[X] = m′(0). Differentiate with the quotient rule: (top′ · bottom − top · bottom′) ÷ bottom².',
                tex: R`m_X'(t) = \frac{${pe}\left(1 - ${qe}\right) - ${pe}\left(-${qe}\right)}{\left(1 - ${qe}\right)^2}`,
                why: R`The derivative of \(${pe}\) is itself, and the derivative of \(1 - ${qe}\) is \(-${qe}\).`,
              },
              {
                say: R`Multiply out the top: the two \(${pq}e^{2t}\) terms cancel.`,
                tex: R`m_X'(t) = \frac{${pe} - ${pq}e^{2t} + ${pq}e^{2t}}{\left(1 - ${qe}\right)^2} = \frac{${pe}}{\left(1 - ${qe}\right)^2}`,
              },
              {
                say: G ? R`Put in t = 0: \(e^0 = 1\), and 1 − q = p.` : R`Put in t = 0: \(e^0 = 1\), and 1 − ${q} = ${p}.`,
                tex: G
                  ? R`E[X] = m_X'(0) = \frac{p}{(1-q)^2} = \frac{p}{p^2} = \frac{1}{p}`
                  : R`E[X] = m_X'(0) = \frac{${p}}{(1 - ${q})^2} = \frac{${p}}{${d(v.p * v.p)}} ${val(1 / v.p)}`,
                why: 'That matches the geometric mean, 1/p.',
              },
              ...(G ? [{ say: `Now put in p = ${d(v.p)}.`, tex: R`E[X] = \frac{1}{${d(v.p)}} ${val(1 / v.p)}` }] : []),
            ],
          },
        ],
      }
    },
  })

  // ---------- find the constant in a discrete pdf (3.4 #35(a) is the book's version) ----------
  const cfam = (kind, hi) =>
    ({
      x2: { g: x => x * x, tex: 'x^2', bare: 'x^2', term: x => `(${x})^2` },
      x: { g: x => x, tex: 'x', bare: 'x', term: x => `(${x})` },
      xp1: { g: x => x + 1, tex: '(x + 1)', bare: 'x + 1', term: x => `(${x} + 1)` },
      pow2: { g: x => 2 ** x, tex: '2^x', bare: '2^x', term: x => `2^{${x}}` },
      rev: { g: x => hi + 1 - x, tex: `(${hi + 1} - x)`, bare: `${hi + 1} - x`, term: x => `(${hi + 1} - ${x})` },
    })[kind]
  const CF_RANGE = { x2: [1, [3, 4]], x: [1, [4, 5]], xp1: [0, [3, 4]], pow2: [0, [2, 3]], rev: [1, [3, 4, 5]] }
  // stories by the smallest value of X (1 or 0); null is the bare "Consider the function"
  const CF_STORIES = {
    1: [null, R`Let \(X\) denote the number of defects found on a circuit board that fails inspection. Assume that the density for \(X\) is given by`, R`Let \(X\) denote the number of rooms booked on a hotel reservation. Assume that the density for \(X\) is given by`],
    0: [null, R`Let \(X\) denote the number of customers waiting in line when a bank opens. Assume that the density for \(X\) is given by`, R`Let \(X\) denote the number of calls a help desk receives in a randomly chosen minute. Assume that the density for \(X\) is given by`],
  }
  const OPS = { ge: R`\ge`, le: R`\le`, lt: '<', gt: '>' }
  const OPW = { ge: 'at least', le: 'at most', lt: 'less than', gt: 'more than' }
  const inEvent = (op, x, m) => (op === 'ge' ? x >= m : op === 'le' ? x <= m : op === 'lt' ? x < m : x > m)

  HW.add({
    id: 'gap-discrete-constant',
    section: '3.4',
    num: 'extra',
    group: 7,
    title: 'Find the constant in a discrete pdf',
    hw: { kind: 'x2', hi: 3, op: 'ge', m: 2, st: 0 },
    twin: () => {
      const kind = rand.pick(Object.keys(CF_RANGE))
      const lo = CF_RANGE[kind][0], hi = rand.pick(CF_RANGE[kind][1])
      const op = rand.pick(Object.keys(OPS))
      const m = op === 'ge' || op === 'lt' ? rand.int(lo + 1, hi) : rand.int(lo, hi - 1)
      return { kind, hi, op, m, st: rand.int(0, CF_STORIES[lo].length - 1) }
    },
    make: v => {
      const { kind, hi, op, m } = v
      const lo = CF_RANGE[kind][0]
      const F = cfam(kind, hi)
      const xs = range(lo, hi)
      const gs = xs.map(F.g)
      const S = gs.reduce((a, b) => a + b, 0)
      const inc = xs.filter(x => inEvent(op, x, m))
      const sumInc = inc.reduce((a, x) => a + F.g(x), 0)
      const prob = sumInc / S
      const sxg = xs.reduce((a, x) => a + x * F.g(x), 0)
      const mean = sxg / S
      // for the wrong choices: P[X op k] for any op and k, and the integral of g (Simpson; exact for these)
      const P = (o, k) => xs.filter(x => inEvent(o, x, k)).reduce((a, x) => a + F.g(x), 0) / S
      const flip = { ge: 'gt', gt: 'ge', le: 'lt', lt: 'le' }[op]
      const integ = (() => {
        const N = 200, h = (hi - lo) / N
        let s = F.g(lo) + F.g(hi)
        for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * F.g(lo + i * h)
        return (s * h) / 3
      })()
      const sx2g = xs.reduce((a, x) => a + x * x * F.g(x), 0)
      const story = CF_STORIES[lo][v.st]
      const ftex = R`f(x) = c\,${F.tex} \qquad x = ${xs.join(', ')}`
      const red = frac(sxg, S), raw = R`\frac{${sxg}}{${S}}`
      return {
        text: story ? R`${story} \[${ftex}\]` : R`Consider the function \[${ftex}\]`,
        parts: [
          {
            label: 'a',
            ask: R`Find the value of \(c\) that makes this a density for a discrete random variable.`,
            skill: 'find-c',
            hint: 'The values of a discrete density add up to 1. Write out f(x) for every x, add them, and set the total equal to 1.',
            // wrong: c = the sum (not 1 over it), one over the number of values, integrated instead of added, the x = 0 term left out
            check: numCheck(1 / S, 0.0005, [S, 1 / xs.length, 1 / integ, lo === 0 ? 1 / (S - F.g(0)) : NaN]),
            answer: R`c = ${frac(1, S)} ${val(1 / S)}`,
            steps: [
              {
                say: 'A discrete density’s values must add up to 1. Write f(x) for every possible x.',
                tex: R`${xs.map(x => `f(${x})`).join(' + ')} = ${xs.map(x => R`c\,${F.term(x)}`).join(' + ')} = 1`,
              },
              {
                say: 'Pull out c and add up what is left.',
                tex: R`c\,(${gs.join(' + ')}) = ${S}c = 1`,
              },
              {
                say: 'Solve for c.',
                tex: R`c = ${frac(1, S)} ${val(1 / S)}`,
                why: 'c is positive, so every f(x) is ≥ 0 as well. That is the other thing a density needs.',
              },
            ],
            trap: 'Don’t integrate: X is discrete, so add the values of f at each x.',
          },
          {
            label: 'b',
            ask: R`Find \(P[X ${OPS[op]} ${m}]\).`,
            skill: 'disc-prob',
            hint: `List the values of x that are ${OPW[op]} ${m}, then add f(x) for those x.`,
            // wrong: the complement, m itself in or out by mistake, off by one in the cut-off,
            // and every value treated as equally likely
            check: numCheck(prob, tolP(prob), [1 - prob, P(flip, m), 1 - P(flip, m), P(op, m - 1), P(op, m + 1), inc.length / xs.length], true),
            answer: R`P[X ${OPS[op]} ${m}] = ${frac(sumInc, S)} ${val(prob)}`,
            steps: [
              {
                say: `List the values of x that are ${OPW[op]} ${m}.`,
                tex: R`P[X ${OPS[op]} ${m}] = ${inc.map(x => `f(${x})`).join(' + ')}`,
                why: op === 'lt' || op === 'gt' ? `“${OPW[op][0].toUpperCase() + OPW[op].slice(1)}” leaves ${m} itself out.` : `“${OPW[op][0].toUpperCase() + OPW[op].slice(1)}” includes ${m} itself.`,
              },
              {
                say: inc.length > 1 ? R`Put in \(f(x) = ${over(F.bare, S)}\) and add.` : R`Put in \(f(x) = ${over(F.bare, S)}\).`,
                tex: inc.length > 1
                  ? R`= ${inc.map(x => R`\frac{${F.g(x)}}{${S}}`).join(' + ')} = \frac{${sumInc}}{${S}} ${val(prob)}`
                  : R`= \frac{${sumInc}}{${S}} ${val(prob)}`,
                graph: { kind: 'bars', title: `f(x) = ${F.tex.replace(/[{}]/g, '').replace('^2', '²')}/${S}`, xs, ys: gs.map(g => g / S), hits: new Set(inc), note: `lit: P[X ${{ ge: '≥', le: '≤', lt: '<', gt: '>' }[op]} ${m}] ≈ ${num(prob, 4)}` },
              },
            ],
          },
          {
            label: 'c',
            ask: R`Find \(E[X]\).`,
            skill: 'mean-var',
            hint: 'E[X] adds x · f(x) over every possible x.',
            // wrong: the plain average of the values, E[X²], c left out
            check: numCheck(mean, 0.005, [(lo + hi) / 2, sx2g / S, sxg]),
            answer: R`E[X] = ${red} ${val(mean)}`,
            steps: [
              { say: 'The mean of a discrete X: multiply each x by its f(x), then add.', tex: R`E[X] = \sum_{\text{all } x} x\,f(x)` },
              { say: 'Put in each x and its f(x).', tex: R`E[X] = ${xs.map(x => R`${x}\cdot\frac{${F.g(x)}}{${S}}`).join(' + ')}` },
              {
                say: 'Add the tops over the common bottom.',
                tex: R`E[X] = \frac{${xs.map(x => x * F.g(x)).join(' + ')}}{${S}} = ${raw}${red !== raw ? ` = ${red}` : ''} ${val(mean)}`,
              },
            ],
          },
        ],
      }
    },
  })

  // =====================================================================================
  // Binomial (3.5)
  // =====================================================================================
  const BIN = [
    {
      story: (n, p) => R`A student guesses on every question of a ${n}-question multiple-choice quiz. Each question has ${Math.round(1 / p)} choices, so each guess is right with probability \(${d(p)}\), independently of the others. Let \(X\) denote the number of questions the student gets right.`,
      S: 'a right answer', F: 'a wrong answer', Ts: 'questions', ps: [0.2, 0.25],
    },
    {
      story: (n, p) => R`A gardener plants ${n} seeds. Each seed sprouts with probability \(${d(p)}\), independently of the others. Let \(X\) denote the number of seeds that sprout.`,
      S: 'a seed that sprouts', F: 'one that doesn’t', Ts: 'seeds', ps: [0.6, 0.7, 0.75, 0.8],
    },
    {
      story: (n, p) => R`A basketball player takes ${n} free throws. She makes each one with probability \(${d(p)}\), and one shot has no effect on the next. Let \(X\) denote the number of free throws she makes.`,
      S: 'a made free throw', F: 'a miss', Ts: 'free throws', ps: [0.6, 0.7, 0.75, 0.8],
    },
    {
      story: (n, p) => R`On a certain route, each flight is late with probability \(${d(p)}\), independently of the other flights. Let \(X\) denote the number of late flights among the next ${n}.`,
      S: 'a late flight', F: 'an on-time flight', Ts: 'flights', ps: [0.1, 0.2, 0.25, 0.3],
    },
  ]
  // every order of n trials with k successes, successes first: SSF, SFS, FSS
  const orders = (n, k) => {
    const out = []
    const go = (s, ks) => {
      if (s.length === n) return void (ks === k && out.push(s))
      if (ks < k) go(s + 'S', ks + 1)
      if (s.length - ks < n - k) go(s + 'F', ks)
    }
    go('', 0)
    return out
  }

  HW.add({
    id: 'gap-binomial-pdf',
    section: '3.5',
    num: 'extra',
    group: 7,
    title: 'Derive the binomial pdf',
    hw: { gen: true, n: 5, p: 0.3, k: 2 }, // not k = n − k: there p and q swapped gives the same number
    twin: () => {
      const s = rand.int(0, BIN.length - 1)
      const n = rand.int(4, 6), p = rand.pick(BIN[s].ps)
      const ks = range(1, n - 1).filter(k => 2 * k !== n && HW.binom.pmf(n, p, k) >= 0.05) // k = n − k would hide a p/q swap
      return { s, n, p, k: rand.pick(ks.length ? ks : [Math.min(n - 1, Math.max(1, Math.round(n * p)))]) }
    },
    make: v => {
      const G = !!v.gen
      const S = G ? { S: 'a success', F: 'a failure', Ts: 'trials' } : BIN[v.s]
      const { n, k } = v
      const pn = d(v.p), qn = d(1 - v.p)
      // the general derivation uses n, p, q; a twin uses its numbers
      const N = G ? 'n' : String(n), p = G ? 'p' : pn, q = G ? 'q' : qn
      const px = G ? 'p^x' : `(${pn})^x`, qnx = G ? 'q^{n-x}' : `(${qn})^{${n}-x}`
      const C = choose(n, k), pk = v.p ** k, qk = (1 - v.p) ** (n - k), prob = C * pk * qk
      const ord_ = orders(n, k)
      const orderTex = ord_.length <= 10
        ? [ord_.slice(0, Math.ceil(ord_.length / 2)), ord_.slice(Math.ceil(ord_.length / 2))].filter(a => a.length).map(a => a.map(o => R`\text{${o}}`).join(R`,\ `))
        : null
      return {
        text: G
          ? R`An experiment consists of a fixed number \(n\) of independent trials. Each trial ends in a success, with probability \(p\), or a failure, with probability \(q = 1 - p\). Let \(X\) denote the number of successes in the \(n\) trials.`
          : BIN[v.s].story(n, v.p),
        parts: [
          {
            label: 'a',
            ask: R`Derive the density \(f\) for \(X\), and say which values \(X\) can take.`,
            skill: 'derive-pdf',
            hint: 'Find the chance of ONE order with x successes, say all the successes first. Then count how many orders there are.',
            check: { type: 'self' },
            answer: R`f(x) = \binom{${N}}{x}${px}${qnx}, \quad x = 0, 1, \ldots, ${N}`,
            steps: [
              {
                say: `Look at one order with x successes and ${N} − x failures. Say the x successes come first.`,
                tex: R`\underbrace{S\,S \cdots S}_{x}\;\underbrace{F\,F \cdots F}_{${N}-x}`,
                why: G ? 'S is a success, F is a failure.' : `Here a success (S) is ${S.S}, and a failure (F) is ${S.F}. p = ${pn}, so q = 1 − ${pn} = ${qn}.`,
              },
              {
                say: `The ${S.Ts} are independent, so multiply: x factors of ${p} and ${N} − x factors of ${q}.`,
                tex: R`P[\text{this order}] = ${px}${qnx}`,
              },
              {
                say: 'Any other order with x successes has the same chance: the same factors, multiplied in a different order.',
                tex: R`P[S\,F\,S\,F \cdots] = ${G ? R`p\,q\,p\,q` : R`(${pn})(${qn})(${pn})(${qn})`} \cdots = ${px}${qnx}`,
                why: 'Multiplying doesn’t care about order.',
              },
              {
                say: `Count the orders: an order is fixed once you choose which x of the ${N} ${S.Ts} are the successes.`,
                tex: R`\binom{${N}}{x} = \frac{${N}!}{x!\,(${N}-x)!} \text{ orders}`,
              },
              {
                say: R`Different orders can’t happen at the same time, so add their chances: \(\binom{${N}}{x}\) copies of the same number.`,
                tex: R`f(x) = \binom{${N}}{x}${px}${qnx}, \quad x = 0, 1, \ldots, ${N}`,
                why: `X can be anything from 0 (no successes) up to ${N} (${G ? 'every trial a success' : `every one of the ${n} ${S.Ts} a success`}).`,
              },
            ],
            trap: R`Don’t forget \(\binom{${N}}{x}\). The power part is the chance of one order; there are many orders.`,
          },
          {
            label: 'b',
            ask: G
              ? R`Take \(n = ${n}\) and \(p = ${pn}\). List the orders of the ${n} trials that have exactly ${k} successes, and use them to find \(P[X = ${k}]\).`
              : R`Find \(P[X = ${k}]\).`,
            skill: 'disc-prob',
            hint: `Each order with ${k} ${s_(k, 'success', 'successes')} has the same chance. How many orders are there?`,
            // wrong: no C(n, k), p and q swapped, the q's forgotten, the cdf P[X ≤ k]
            check: numCheck(prob, tolP(prob), [pk * qk, C * (1 - v.p) ** k * v.p ** (n - k), C * pk, HW.binom.cdf(n, v.p, k)], true),
            answer: R`P[X = ${k}] = \binom{${n}}{${k}}${pw(pn, k)}${pw(qn, n - k)} ${val(prob)}`,
            steps: [
              ...(orderTex
                ? [{
                    say: `List the orders of the ${n} ${S.Ts} with exactly ${k} ${s_(k, 'S', 'S’s')}${G ? '' : ` (S = ${S.S})`}.`,
                    tex: orderTex,
                    why: `Choosing the ${s_(k, 'spot', `${k} spots`)} for the ${s_(k, 'S', 'S’s')} out of ${n} is exactly what \\(\\binom{${n}}{${k}}\\) counts.`,
                  }]
                : []),
              {
                say: 'Count them with the combination formula.',
                tex: R`\binom{${n}}{${k}} = \frac{${n}!}{${k}!\,${n - k}!} = ${C}`,
              },
              {
                say: `Each order has ${k} ${s_(k, 'factor', 'factors')} of ${pn} and ${n - k} of ${qn}${G ? ` (q = 1 − ${pn})` : ''}. Multiply by the number of orders.`,
                tex: R`P[X = ${k}] = \binom{${n}}{${k}}${pw(pn, k)}${pw(qn, n - k)} = ${C} \times ${num(pk, 6)} \times ${num(qk, 6)} ${val(prob)}`,
              },
            ],
          },
        ],
      }
    },
  })

  // =====================================================================================
  // Negative binomial: the pdf, and the mean and variance from the MGF (3.6)
  // =====================================================================================
  const NB = [
    {
      story: (r, p) => R`A basketball player makes each free throw with probability \(${p}\), and one shot has no effect on the next. She keeps shooting until she has made ${r}. Let \(X\) denote the number of free throws she takes.`,
      S1: 'make', Sp: 'makes', T1: 'free throw', Tp: 'free throws', ps: [0.6, 0.7, 0.75, 0.8],
      at: (r, m) => `her ${ord(r)} make comes on her ${ord(m)} free throw`,
    },
    {
      story: (r, p) => R`A company drills wildcat wells until it has ${r} strikes. Each well strikes oil with probability \(${p}\), independently of the others. Let \(X\) denote the number of wells drilled.`,
      S1: 'strike', Sp: 'strikes', T1: 'well', Tp: 'wells', ps: [0.2, 0.25, 0.3, 0.4],
      at: (r, m) => `the ${ord(r)} strike comes on the ${ord(m)} well drilled`,
    },
    {
      story: (r, p) => R`A telemarketer keeps calling until she has made ${r} sales. Each call ends in a sale with probability \(${p}\), independently of the other calls. Let \(X\) denote the number of calls she makes.`,
      S1: 'sale', Sp: 'sales', T1: 'call', Tp: 'calls', ps: [0.2, 0.25, 0.3, 0.4],
      at: (r, m) => `her ${ord(r)} sale comes on her ${ord(m)} call`,
    },
    {
      story: (r, p) => R`A biologist nets fish from a lake until she has caught ${r} tagged ones. Each fish caught is tagged with probability \(${p}\), independently of the others. Let \(X\) denote the number of fish caught.`,
      S1: 'tagged fish', Sp: 'tagged fish', T1: 'fish', Tp: 'fish', ps: [0.2, 0.25, 0.3, 0.4],
      at: (r, m) => `the ${ord(r)} tagged fish is the ${ord(m)} fish caught`,
    },
  ]
  const nbPmf = (r, p, x) => choose(x - 1, r - 1) * (1 - p) ** (x - r) * p ** r
  const NB_TEXT = R`An experiment consists of a series of independent trials. Each trial ends in a success, with probability \(p\), or a failure, with probability \(q = 1 - p\). The trials go on until the \(r\)th success occurs, where \(r\) is a fixed positive whole number. Let \(X\) denote the number of trials needed to obtain the \(r\)th success.`

  HW.add({
    id: 'gap-negbin-pdf',
    section: '3.6',
    num: 'extra',
    group: 7,
    title: 'Derive the negative binomial pdf',
    hw: { gen: true, r: 3, p: 0.4, m: 5 }, // not x − r = r: there p and q swapped gives the same number
    twin: () => {
      const s = rand.int(0, NB.length - 1), r = rand.int(2, 4), p = rand.pick(NB[s].ps)
      const ms = range(r + 1, r + 6).filter(m => m !== 2 * r && nbPmf(r, p, m) >= 0.01) // x − r = r would hide a p/q swap
      return { s, r, p, m: rand.pick(ms.length ? ms : [r + 1]) }
    },
    make: v => {
      const G = !!v.gen
      const { r, m } = v
      const pn = d(v.p), qn = d(1 - v.p)
      const S = G ? null : NB[v.s]
      const C = choose(m - 1, r - 1), qm = (1 - v.p) ** (m - r), pr = v.p ** r, prob = C * qm * pr
      const startOpts = G
        ? [{ tex: R`x = r, r+1, r+2, \ldots` }, { tex: R`x = 0, 1, 2, \ldots` }, { tex: R`x = 1, 2, 3, \ldots` }, { tex: R`x = 0, 1, \ldots, r` }]
        : [{ tex: R`x = ${r}, ${r + 1}, ${r + 2}, \ldots` }, { tex: R`x = 0, 1, 2, \ldots` }, { tex: R`x = 1, 2, 3, \ldots` }, { tex: R`x = ${list(0, r)}` }]
      const rS = Array(G ? 3 : r).fill('S').join(R`\,`)
      return {
        text: G ? NB_TEXT : S.story(r, pn),
        parts: [
          {
            label: 'a',
            ask: R`Derive the density \(f\) for \(X\).`,
            skill: 'derive-pdf',
            hint: G
              ? 'If trial x is the rth success, what must have happened in the first x − 1 trials?'
              : `If ${S.T1} number x brings the ${ord(r)} ${S.S1}, what must have happened in the first x − 1 ${S.Tp}?`,
            check: { type: 'self' },
            answer: G
              ? R`f(x) = \binom{x-1}{r-1}q^{x-r}p^r, \quad x = r, r+1, r+2, \ldots`
              : R`f(x) = \binom{x-1}{${r - 1}}(${qn})^{x-${r}}(${pn})^{${r}}, \quad x = ${r}, ${r + 1}, ${r + 2}, \ldots`,
            steps: G
              ? [
                  {
                    say: 'X = x means trial x is the rth success. Split that into two pieces that must both happen.',
                    tex: [R`X = x \iff \text{(1) exactly } r - 1 \text{ successes in the first } x - 1 \text{ trials,}`, R`\text{and (2) trial } x \text{ is a success}`],
                    why: 'If trial x is the rth success, the other r − 1 successes all came earlier, somewhere in the first x − 1 trials.',
                  },
                  {
                    say: 'Piece (1) is a binomial question: r − 1 successes in x − 1 independent trials. The other (x − 1) − (r − 1) = x − r trials are failures.',
                    tex: R`P[(1)] = \binom{x-1}{r-1}p^{r-1}q^{x-r}`,
                    why: 'This is the binomial pdf with n = x − 1 trials and r − 1 successes.',
                  },
                  {
                    say: 'Piece (2): trial x is a success, with chance p. It doesn’t depend on the earlier trials, so multiply.',
                    tex: R`f(x) = \binom{x-1}{r-1}p^{r-1}q^{x-r}\cdot p`,
                  },
                  {
                    say: 'Combine the powers of p.',
                    tex: R`f(x) = \binom{x-1}{r-1}q^{x-r}p^r`,
                    why: 'Every way of getting X = x has r successes and x − r failures; the binomial coefficient counts where the first r − 1 successes go.',
                  },
                ]
              : [
                  {
                    say: `Success is a ${S.S1}, and X counts ${S.Tp} until the ${ord(r)} one, so X is negative binomial.`,
                    tex: R`r = ${r}, \quad p = ${pn}, \quad q = 1 - ${pn} = ${qn}`,
                  },
                  {
                    say: `X = x means ${S.T1} number x brings the ${ord(r)} ${S.S1}. Split that into two pieces that must both happen.`,
                    tex: [R`X = x \iff \text{(1) exactly } ${r - 1} \text{ ${s_(r - 1, S.S1, S.Sp)} in the first } x - 1 \text{ ${S.Tp},}`, R`\text{and (2) ${S.T1} } x \text{ is a ${S.S1}}`],
                    why: `If ${S.T1} number x brings the ${ord(r)} ${S.S1}, the other ${r - 1} ${s_(r - 1, S.S1, S.Sp)} all came earlier, somewhere in the first x − 1 ${S.Tp}.`,
                  },
                  {
                    say: `Piece (1) is a binomial question. Each ${S.T1} is a trial, and we want exactly ${r - 1} ${s_(r - 1, 'success', 'successes')} in x − 1 trials. The other (x − 1) − ${r - 1} = x − ${r} are failures.`,
                    tex: R`P[(1)] = \binom{x-1}{${r - 1}}${pw(pn, r - 1)}(${qn})^{x-${r}}`,
                    why: `This is the binomial pdf with n = x − 1 trials and ${r - 1} ${s_(r - 1, 'success', 'successes')}.`,
                  },
                  {
                    say: `Piece (2): ${S.T1} number x is a ${S.S1}, with chance ${pn}. It doesn’t depend on the earlier ${S.Tp}, so multiply.`,
                    tex: R`f(x) = \binom{x-1}{${r - 1}}${pw(pn, r - 1)}(${qn})^{x-${r}}\cdot(${pn})`,
                  },
                  {
                    say: `Combine the powers of ${pn}.`,
                    tex: R`f(x) = \binom{x-1}{${r - 1}}(${qn})^{x-${r}}(${pn})^{${r}}`,
                  },
                ],
            trap: G
              ? R`It is \(\binom{x-1}{r-1}\), not \(\binom{x}{r}\): the last trial is fixed as a success, so only the first x − 1 trials get arranged.`
              : R`It is \(\binom{x-1}{${r - 1}}\), not \(\binom{x}{${r}}\): the last ${S.T1} is fixed as a ${S.S1}, so only the first x − 1 get arranged.`,
          },
          {
            label: 'b',
            ask: R`What values can \(X\) take?`,
            skill: 'derive-pdf',
            hint: G ? 'What is the fewest number of trials that can hold r successes? Is there a most?' : `What is the fewest number of ${S.Tp} that can hold ${r} ${S.Sp}? Is there a most?`,
            check: { type: 'choice', options: startOpts, correct: 0 },
            answer: G ? R`x = r, r+1, r+2, \ldots` : R`x = ${r}, ${r + 1}, ${r + 2}, \ldots`,
            steps: [
              {
                say: G
                  ? 'To get r successes you need at least r trials. The smallest X is r: the first r trials are all successes.'
                  : `To get ${r} ${S.Sp} you need at least ${r} ${S.Tp}. The smallest X is ${r}: the first ${r} are all ${S.Sp}.`,
                tex: G ? R`X = r \iff \underbrace{S\,S \cdots S}_{r}` : R`X = ${r} \iff ${rS}`,
                why: G
                  ? R`The density agrees: \(\binom{x-1}{r-1}\) is 0 when x − 1 < r − 1, that is when x < r.`
                  : R`The density agrees: \(\binom{x-1}{${r - 1}}\) is 0 when x − 1 < ${r - 1}, that is when x < ${r}.`,
              },
              {
                say: G ? 'There is no largest value: any number of failures can come before the rth success.' : `There is no largest value: any number of failures can come before the ${ord(r)} ${S.S1}.`,
                tex: G ? R`x = r, r+1, r+2, \ldots` : R`x = ${r}, ${r + 1}, ${r + 2}, \ldots`,
              },
            ],
            trap: `Not 0, 1, 2, …: that is the binomial, which counts successes. Here X counts ${G ? 'trials' : S.Tp}, and it takes at least ${G ? 'r' : r} of them.`,
          },
          {
            label: 'c',
            ask: G
              ? R`Take \(r = ${r}\) and \(p = ${pn}\). Find \(P[X = ${m}]\).`
              : R`Find the probability that ${S.at(r, m)}.`,
            skill: 'disc-prob',
            hint: G ? `Put x = ${m}, r = ${r} and p = ${pn} into the density from part (a).` : 'Which value of X is that? Put it into the density from part (a).',
            // wrong: C(x, r) for C(x − 1, r − 1), the last p forgotten, p and q swapped, no C at all
            check: numCheck(prob, tolP(prob), [choose(m, r) * qm * pr, prob / v.p, C * v.p ** (m - r) * (1 - v.p) ** r, qm * pr], true),
            answer: R`P[X = ${m}] = \binom{${m - 1}}{${r - 1}}${pw(qn, m - r)}(${pn})^{${r}} ${val(prob)}`,
            steps: [
              {
                say: G ? `Put x = ${m}, r = ${r}, p = ${pn} and q = 1 − ${pn} = ${qn} into the density.` : `That is X = ${m}. Put x = ${m} into the density.`,
                tex: R`P[X = ${m}] = \binom{${m - 1}}{${r - 1}}${pw(qn, m - r)}(${pn})^{${r}}`,
              },
              {
                say: 'Work out each piece.',
                tex: R`\binom{${m - 1}}{${r - 1}} = ${C}, \qquad ${pw(qn, m - r)} = ${num(qm, 6)}, \qquad (${pn})^{${r}} = ${num(pr, 6)}`,
              },
              {
                say: 'Multiply.',
                tex: R`P[X = ${m}] = ${C} \times ${num(qm, 6)} \times ${num(pr, 6)} ${val(prob)}`,
                why: G
                  ? `In words: the first ${m - 1} trials hold exactly ${r - 1} successes (in any of ${C} orders), then trial ${m} is a success.`
                  : `In words: the first ${m - 1} ${S.Tp} hold exactly ${r - 1} ${s_(r - 1, S.S1, S.Sp)} (in any of ${C} orders), then ${S.T1} number ${m} is a ${S.S1}.`,
              },
            ],
          },
        ],
      }
    },
  })

  // ---------- negative binomial mean and variance from its MGF ----------
  HW.add({
    id: 'gap-negbin-mgf',
    section: '3.6',
    num: 'extra',
    group: 7,
    title: 'Negative binomial mean and variance from the MGF',
    hw: { gen: true, r: 3, p: 0.4 }, // r and p are only used at the end of each part, to check numbers
    twin: () => {
      const s = rand.int(0, NB.length - 1)
      return { s, r: rand.int(2, 5), p: rand.pick(NB[s].ps) }
    },
    make: v => {
      const G = !!v.gen
      const r = v.r, p = G ? 'p' : d(v.p), q = G ? 'q' : d(1 - v.p)
      const S = G ? null : NB[v.s]
      const rr = G ? 'r' : String(r)
      const pr = G ? 'p^r' : `(${p})^{${r}}`
      const ert = G ? 'e^{rt}' : `e^{${r}t}`
      const qe = G ? 'qe^t' : `${q}e^t`
      const base = `(1 - ${qe})`
      const nr = G ? '-r' : `-${r}`
      const nr1 = G ? '-r-1' : `-${r + 1}`
      const nrr1 = G ? '-(r+1)' : `-${r + 1}`
      const nr2 = G ? '-(r+2)' : `-${r + 2}`
      const r1qe = G ? '(r+1)qe^t' : `${r + 1}(${q}e^t)`
      const rqe = G ? 'rqe^t' : `${r}(${q}e^t)`
      const mean = r / v.p
      const ex2 = (r * r) / v.p + (r * (r + 1) * (1 - v.p)) / v.p ** 2
      const varX = ex2 - mean * mean
      // tolerances that grow with the size (at least 0.05): E[X] rounded to 2 decimals before
      // squaring moves Var X by about 0.01·E[X], and that should still pass
      const sig2 = x => +x.toPrecision(2)
      const tolEx2 = Math.max(0.05, sig2(0.005 * ex2)), tolVar = Math.max(0.05, sig2(0.005 * varX), sig2(0.012 * mean))
      const pn = d(v.p), qn = d(1 - v.p) // the numbers, also in the letters version's last step
      const mgfTex = G ? R`m_X(t) = \frac{(pe^t)^r}{(1 - qe^t)^r}, \qquad t < -\ln q.` : R`m_X(t) = \frac{(${p}e^t)^{${r}}}{(1 - ${q}e^t)^{${r}}}.`
      return {
        text: G
          ? R`Let \(X\) be negative binomial with parameters \(r\) and \(p\), where \(q = 1 - p\). Its moment generating function is \[${mgfTex}\]`
          : R`${S.story(r, p)} Then \(X\) is negative binomial with \(r = ${r}\) and \(p = ${p}\), and its moment generating function is \[${mgfTex}\]`,
        parts: [
          {
            label: 'a',
            ask: G ? R`Use \(m_X(t)\) to show that \(E[X] = r/p\). Then find \(E[X]\) when \(r = ${r}\) and \(p = ${pn}\).` : R`Use \(m_X(t)\) to find \(E[X]\).`,
            skill: 'mgf-moments',
            hint: R`E[X] = m′(0). Rewrite m as \(p^r e^{rt}(1 - qe^t)^{-r}\) first, then use the product rule and the chain rule.`,
            // wrong: r/q, the variance rq/p², the geometric 1/p, the binomial-style rp
            check: numCheck(mean, 0.01, [r / (1 - v.p), varX, 1 / v.p, r * v.p]),
            answer: G ? R`E[X] = m_X'(0) = \frac{r}{p};\qquad r = ${r},\ p = ${pn}: \ E[X] = \frac{${r}}{${pn}} ${val(mean)}` : R`E[X] = m_X'(0) = \frac{${r}}{${p}} ${val(mean)}`,
            steps: [
              {
                say: 'E[X] = m′(0). First rewrite m_X(t) as a product: it is easier to differentiate than a fraction.',
                tex: R`m_X(t) = ${pr}\,${ert}\,${base}^{${nr}}`,
                why: G
                  ? R`\((pe^t)^r = p^r e^{rt}\), and dividing by something to the power r is the same as multiplying by it to the power −r.`
                  : R`\((${p}e^t)^{${r}} = (${p})^{${r}}e^{${r}t}\), and dividing by something to the power ${r} is the same as multiplying by it to the power −${r}.`,
              },
              {
                say: R`Differentiate with the product rule (\(${pr}\) is a constant). The second factor needs the chain rule: its inside, \(1 - ${qe}\), has derivative \(-${qe}\).`,
                tex: [R`m_X'(t) = ${pr}\cdot ${rr}${ert}\,${base}^{${nr}}`, R`\qquad + ${pr}\,${ert}\cdot(${nr})${base}^{${nr1}}\cdot(-${qe})`],
              },
              {
                say: R`Both terms share \(${rr}${pr}${ert}${base}^{${nr1}}\). Pull it out. What is left is \((1 - ${qe}) + ${qe} = 1\).`,
                tex: R`m_X'(t) = ${rr}${pr}\,${ert}\,${base}^{${nr1}}\left[(1 - ${qe}) + ${qe}\right] = ${rr}${pr}\,${ert}\,${base}^{${nrr1}}`,
                why: R`\(${base}^{${nr}}\) is \(${base}^{${nr1}}\) times one more \(${base}\), and \((${nr})(-${qe}) = +${rqe}\).`,
              },
              {
                say: G ? R`Put in t = 0: \(e^0 = 1\), and 1 − q = p.` : R`Put in t = 0: \(e^0 = 1\), and 1 − ${q} = ${p}.`,
                tex: G
                  ? R`E[X] = m_X'(0) = rp^r(1-q)^{-(r+1)} = \frac{rp^r}{p^{r+1}} = \frac{r}{p}`
                  : R`E[X] = m_X'(0) = ${r}(${p})^{${r}}(1 - ${q})^{-${r + 1}} = \frac{${r}(${p})^{${r}}}{(${p})^{${r + 1}}} = \frac{${r}}{${p}} ${val(mean)}`,
                why: G ? undefined : 'That is r/p, the negative binomial mean.',
              },
              ...(G ? [{ say: `Now put in r = ${r} and p = ${pn}.`, tex: R`E[X] = \frac{${r}}{${pn}} ${val(mean)}` }] : []),
            ],
            trap: 'Don’t forget the chain rule on (1 − qe^t): its inside has derivative −qe^t, and that factor is what makes the brackets add up to 1.',
          },
          {
            label: 'b',
            ask: G
              ? R`Use \(m_X(t)\) to show that \(\operatorname{Var} X = rq/p^2\). Then find \(E[X^2]\) and \(\operatorname{Var} X\) when \(r = ${r}\) and \(p = ${pn}\).`
              : R`Use \(m_X(t)\) to find \(E[X^2]\) and \(\operatorname{Var} X\).`,
            skill: 'mgf-moments',
            hint: R`E[X²] = m″(0): differentiate your m′(t) from part (a) once more. Then Var X = E[X²] − (E[X])².`,
            // wrong E[X²]: (E[X])², Var X, Var X + E[X], the first term r²/p only
            // wrong Var X: E[X²] (nothing subtracted), r/p² (no q), rq/p (no square), rp/q² (p and q swapped)
            check: {
              type: 'numbers',
              items: [
                { label: R`E[X^2]`, value: ex2, tol: tolEx2, wrong: wrongs(ex2, tolEx2, [mean * mean, varX, varX + mean, (r * r) / v.p]) },
                { label: R`\operatorname{Var} X`, value: varX, tol: tolVar, wrong: wrongs(varX, tolVar, [ex2, r / v.p ** 2, (r * (1 - v.p)) / v.p, (r * v.p) / (1 - v.p) ** 2]) },
              ],
            },
            answer: G
              ? R`E[X^2] = \frac{r^2}{p} + \frac{r(r+1)q}{p^2}, \ \operatorname{Var} X = \frac{rq}{p^2}; \qquad r = ${r},\ p = ${pn}: \ E[X^2] ${val(ex2)}, \ \operatorname{Var} X ${val(varX)}`
              : R`E[X^2] ${val(ex2)}, \quad \operatorname{Var} X ${val(varX)}`,
            steps: [
              {
                say: R`E[X²] = m″(0). Differentiate \(m_X'(t) = ${rr}${pr}${ert}${base}^{${nrr1}}\) with the product rule again.`,
                tex: R`m_X''(t) = ${rr}${pr}\left[${rr}${ert}${base}^{${nrr1}} + ${ert}\cdot ${r1qe}\,${base}^{${nr2}}\right]`,
                why: R`Chain rule on the second factor: \(${nrr1}\) times the inside’s derivative \(-${qe}\) gives \(+${r1qe}\).`,
              },
              {
                say: G ? R`Put in t = 0 (\(e^0 = 1\), 1 − q = p) and simplify.` : R`Put in t = 0 (\(e^0 = 1\), 1 − ${q} = ${p}) and simplify.`,
                tex: G
                  ? R`E[X^2] = rp^r\left[\frac{r}{p^{r+1}} + \frac{(r+1)q}{p^{r+2}}\right] = \frac{r^2}{p} + \frac{r(r+1)q}{p^2}`
                  : [
                      R`E[X^2] = ${r}(${p})^{${r}}\left[\frac{${r}}{(${p})^{${r + 1}}} + \frac{${r + 1}(${q})}{(${p})^{${r + 2}}}\right] = \frac{${r * r}}{${p}} + \frac{${r * (r + 1)}(${q})}{(${p})^2}`,
                      R`= ${num((r * r) / v.p)} + ${num((r * (r + 1) * (1 - v.p)) / v.p ** 2)} ${val(ex2)}`,
                    ],
              },
              {
                say: 'Variance = E[X²] − (E[X])².',
                tex: G
                  ? R`\operatorname{Var} X = \frac{r^2}{p} + \frac{r(r+1)q}{p^2} - \frac{r^2}{p^2}`
                  : R`\operatorname{Var} X = ${num(ex2)} - (${num(mean)})^2 = ${num(ex2)} - ${num(mean * mean)} ${val(varX)}`,
              },
              G
                ? {
                    say: 'Put everything over p², then use p − 1 = −q.',
                    tex: [R`= \frac{r^2p + r(r+1)q - r^2}{p^2} = \frac{r^2(p - 1) + r^2q + rq}{p^2}`, R`= \frac{-r^2q + r^2q + rq}{p^2} = \frac{rq}{p^2}`],
                    why: 'r(r + 1)q = r²q + rq. The two r²q terms cancel.',
                  }
                : {
                    say: 'Check with the negative binomial variance, rq/p².',
                    tex: R`\frac{rq}{p^2} = \frac{${r}(${q})}{(${p})^2} = \frac{${d(r * (1 - v.p))}}{${d(v.p * v.p)}} ${val((r * (1 - v.p)) / v.p ** 2)}`,
                  },
              ...(G
                ? [{
                    say: `Now put in r = ${r}, p = ${pn} and q = 1 − ${pn} = ${qn}.`,
                    tex: [
                      R`E[X^2] = \frac{${r}^2}{${pn}} + \frac{${r}(${r + 1})(${qn})}{(${pn})^2} = ${num((r * r) / v.p)} + ${num((r * (r + 1) * (1 - v.p)) / v.p ** 2)} ${val(ex2)}`,
                      R`\operatorname{Var} X = \frac{${r}(${qn})}{(${pn})^2} = \frac{${d(r * (1 - v.p))}}{${d(v.p * v.p)}} ${val(varX)}`,
                    ],
                  }]
                : []),
            ],
            trap: 'E[X²] is not (E[X])². Find m″(0) first, then subtract the square of the mean.',
          },
        ],
      }
    },
  })

  // =====================================================================================
  // Hypergeometric (3.7)
  // =====================================================================================
  const HYP = [
    {
      story: (N, r, n) => R`A shipment of ${N} laptops contains ${r} with a cracked screen. An inspector picks ${n} of the laptops at random, without replacement. Let \(X\) denote the number of laptops in the sample with a cracked screen.`,
      objs: 'laptops', succ: 'cracked laptops', fail: 'good laptops',
    },
    {
      story: (N, r, n) => R`A club has ${N} members, ${r} of whom are seniors. A committee of ${n} is chosen at random from the members. Let \(X\) denote the number of seniors on the committee.`,
      objs: 'members', succ: 'seniors', fail: 'other members',
    },
    {
      story: (N, r, n) => R`A bag holds ${N} marbles: ${r} red and ${N - r} blue. You draw ${n} marbles at random, without replacement. Let \(X\) denote the number of red marbles drawn.`,
      objs: 'marbles', succ: 'red marbles', fail: 'blue marbles',
    },
    {
      story: (N, r, n) => R`A jury pool has ${N} people, ${r} of whom have served on a jury before. The court picks ${n} of them at random. Let \(X\) denote the number picked who have served before.`,
      objs: 'people', succ: 'people who have served', fail: 'first-timers',
    },
  ]

  HW.add({
    id: 'gap-hyper-pdf',
    section: '3.7',
    num: 'extra',
    group: 7,
    title: 'Derive the hypergeometric pdf',
    hw: { gen: true, N: 12, r: 9, n: 5, m: 3 },
    twin: () => {
      for (;;) {
        const N = rand.int(8, 15), n = rand.int(3, 6)
        // make one of the bounds bite: few successes (r < n) or few failures (N − r < n)
        const r = rand.chance(0.5) ? rand.int(N - n + 1, N - 2) : rand.int(2, n - 1)
        if (r < 2 || r > N - 2) continue
        const lo = HW.hyper.lo(N, r, n), hi = HW.hyper.hi(N, r, n)
        if (lo === 0 && hi === n) continue
        // not r = N − r with x = n − x: swapping successes and failures would give the same number
        const ms = range(lo, hi).filter(m => !(2 * r === N && 2 * m === n) && HW.hyper.pmf(N, r, n, m) >= 0.02)
        if (!ms.length) continue
        return { s: rand.int(0, HYP.length - 1), N, r, n, m: rand.pick(ms) }
      }
    },
    make: v => {
      const G = !!v.gen
      const { N, r, n, m } = v
      const S = G ? null : HYP[v.s]
      const lo = HW.hyper.lo(N, r, n), hi = HW.hyper.hi(N, r, n)
      const a = choose(r, m), b = choose(N - r, n - m), tot = choose(N, n), prob = (a * b) / tot
      // the possible values: right, and the real mistakes (no bounds, one bound, swapped)
      const rng = ([L, H]) => R`x = ${list(L, H)}`
      const cands = [[0, n], [lo + 1, hi], [1, n], [0, n - 1], [Math.max(0, n - r), Math.min(n, N - r)], [lo, n], [0, hi]]
      const wrong = []
      for (const c of cands) if (c[0] <= c[1] && !(c[0] === lo && c[1] === hi) && !wrong.some(w => w[0] === c[0] && w[1] === c[1])) wrong.push(c)
      const optsB = G
        ? [{ tex: R`\max(0,\ n - (N - r)) \le x \le \min(n,\ r)` }, { tex: R`0 \le x \le n` }, { tex: R`0 \le x \le r` }, { tex: R`\max(0,\ n - r) \le x \le \min(n,\ N - r)` }]
        : [{ tex: rng([lo, hi]) }, ...wrong.slice(0, 3).map(w => ({ tex: rng(w) }))]
      const W = G ? { objs: 'objects', succ: 'successes', fail: 'failures' } : S
      const Nt = G ? 'N' : String(N), rt = G ? 'r' : String(r), nt = G ? 'n' : String(n), Nr = G ? 'N - r' : String(N - r)
      const NrSay = G ? 'N − r' : String(N - r) // the same in words (a real minus sign)
      const fTex = R`f(x) = \frac{\binom{${rt}}{x}\binom{${Nr}}{${nt} - x}}{\binom{${Nt}}{${nt}}}`
      return {
        text: G
          ? R`A collection has \(N\) objects. Of these, \(r\) have a trait we call success, and the other \(N - r\) are failures. A sample of \(n\) objects is drawn without replacement, so that every set of \(n\) objects is equally likely to be the sample. Let \(X\) denote the number of successes in the sample.`
          : S.story(N, r, n),
        parts: [
          {
            label: 'a',
            ask: R`Derive the density \(f\) for \(X\).`,
            skill: 'derive-pdf',
            hint: 'Every sample is equally likely, so P = (number of samples with x successes) ÷ (number of samples). Count both with combinations.',
            check: { type: 'self' },
            answer: fTex,
            steps: [
              {
                say: `Count all possible samples: choose ${nt} of the ${Nt} ${W.objs}. Order doesn’t matter, so it is a combination.`,
                tex: G ? R`\binom{N}{n} \text{ samples, all equally likely}` : R`\binom{${N}}{${n}} = ${tot} \text{ samples, all equally likely}`,
                why: 'Drawing at random without replacement makes every set of the same size equally likely.',
              },
              {
                say: 'When the outcomes are equally likely, a probability is (the number of ways the event can happen) ÷ (the total number of outcomes).',
                tex: R`P[X = x] = \frac{\text{number of samples with exactly } x \text{ ${W.succ}}}{\binom{${Nt}}{${nt}}}`,
              },
              {
                say: `Build a sample with exactly x ${W.succ} in two steps: choose x of the ${rt} ${W.succ}, then choose the other ${nt} − x from the ${NrSay} ${W.fail}.`,
                tex: R`\binom{${rt}}{x}\binom{${Nr}}{${nt} - x} \text{ samples}`,
                why: 'Each choice in the first step can go with each choice in the second, so the counts multiply.',
              },
              { say: 'Put it together.', tex: fTex },
            ],
            trap: 'Don’t use p^x q^(n−x). The draws are without replacement, so they are not independent: count samples instead.',
          },
          {
            label: 'b',
            ask: R`What values can \(X\) take?`,
            skill: 'derive-pdf',
            hint: `X can’t be more than the sample, or more than the ${W.succ} there are. And the ${W.fail} in the sample can’t be more than the ${W.fail} there are.`,
            check: { type: 'choice', options: optsB, correct: 0 },
            answer: G ? R`\max(0,\ n - (N - r)) \le x \le \min(n,\ r)` : R`x = ${list(lo, hi)}`,
            steps: [
              {
                say: `X can’t be negative, can’t be more than the ${nt} in the sample, and can’t be more than the ${rt} ${W.succ} there are.`,
                tex: R`x \ge 0, \qquad x \le ${nt}, \qquad x \le ${rt}`,
              },
              {
                say: `The rest of the sample, ${nt} − x, are ${W.fail}, and there are only ${NrSay} of those.`,
                tex: G ? R`n - x \le N - r \;\Rightarrow\; x \ge n - (N - r)` : R`${n} - x \le ${N - r} \;\Rightarrow\; x \ge ${n} - ${N - r} = ${n - (N - r)}`,
                why: G
                  ? 'If the sample is bigger than the number of failures, some of it has to be successes.'
                  : n - (N - r) > 0
                    ? `The sample (${n}) is bigger than the number of ${S.fail} (${N - r}), so at least ${n - (N - r)} of it must be ${S.succ}.`
                    : `Here that bound is ${String(n - (N - r)).replace('-', '−')}, which is not above 0, so it adds nothing new.`,
              },
              {
                say: 'Keep the biggest lower bound and the smallest upper bound.',
                tex: G
                  ? R`\max(0,\ n - (N - r)) \le x \le \min(n,\ r)`
                  : R`\max(0,\ ${n - (N - r)}) = ${lo} \le x \le \min(${n},\ ${r}) = ${hi} \;\Rightarrow\; x = ${list(lo, hi)}`,
              },
            ],
            trap: 'Not always 0 to n. When there are few successes, X stops at r; when there are few failures, X can’t be small.',
          },
          {
            label: 'c',
            ask: G ? R`Take \(N = ${N}\), \(r = ${r}\) and \(n = ${n}\). Find \(P[X = ${m}]\).` : R`Find \(P[X = ${m}]\).`,
            skill: 'disc-prob',
            hint: `Put x = ${m} into the density: three combinations to work out.`,
            // wrong: the binomial with p = r/N (as if drawn with replacement), successes and failures swapped,
            // the complement, the failures' factor left out, the cdf P[X ≤ m], off by one in x
            check: numCheck(prob, tolP(prob), [
              HW.binom.pmf(n, r / N, m), (choose(N - r, m) * choose(r, n - m)) / tot, 1 - prob, a / tot,
              range(lo, m).reduce((s, x) => s + HW.hyper.pmf(N, r, n, x), 0), HW.hyper.pmf(N, r, n, m + 1), HW.hyper.pmf(N, r, n, m - 1),
            ], true),
            answer: R`P[X = ${m}] = \frac{\binom{${r}}{${m}}\binom{${N - r}}{${n - m}}}{\binom{${N}}{${n}}} = ${frac(a * b, tot)} ${val(prob)}`,
            steps: [
              {
                say: `Put x = ${m} into the density.${G ? ` Here N − r = ${N - r}.` : ''}`,
                tex: R`P[X = ${m}] = \frac{\binom{${r}}{${m}}\binom{${N - r}}{${n - m}}}{\binom{${N}}{${n}}}`,
              },
              {
                say: 'Work out each combination.',
                tex: R`\binom{${r}}{${m}} = ${a}, \qquad \binom{${N - r}}{${n - m}} = ${b}, \qquad \binom{${N}}{${n}} = ${tot}`,
              },
              {
                say: 'Multiply the top, then divide.',
                tex: R`P[X = ${m}] = \frac{${a} \cdot ${b}}{${tot}} = \frac{${a * b}}{${tot}}${frac(a * b, tot) !== R`\frac{${a * b}}{${tot}}` ? ` = ${frac(a * b, tot)}` : ''} ${val(prob)}`,
              },
            ],
          },
        ],
      }
    },
  })

  // =====================================================================================
  // Uniform: derive the pdf and the cdf (4.1)
  // =====================================================================================
  const UNI = [
    { story: (a, b) => R`A commuter train is equally likely to arrive at any moment between ${a} and ${b} minutes after the hour. Let \(X\) denote its arrival time, in minutes after the hour.`, a: [1, 10], w: [6, 8, 10, 12, 15] },
    { story: (a, b) => R`A machine cuts rods whose lengths are uniformly distributed between ${a} and ${b} centimeters. Let \(X\) denote the length of a randomly selected rod.`, a: [45, 98], w: [4, 5, 6, 8] },
    { story: (a, b) => R`A thermostat lets the temperature of a room drift uniformly between ${a} and ${b} degrees. Let \(X\) denote the temperature at a randomly chosen moment.`, a: [62, 70], w: [4, 5, 6, 8] },
    { story: (a, b) => R`A pizza delivery is equally likely to arrive any time between ${a} and ${b} minutes after it is ordered. Let \(X\) denote the delivery time, in minutes.`, a: [15, 30], w: [10, 12, 15, 20, 25] },
  ]
  const cdfCases = (mid, a, b, last = '1') => R`F(x) = \begin{cases} 0 & x \le ${a} \\ ${mid} & ${a} < x < ${b} \\ ${last} & x \ge ${b} \end{cases}`

  HW.add({
    id: 'gap-uniform-pdf',
    section: '4.1',
    num: 'extra',
    group: 7,
    title: 'Derive the uniform pdf',
    hw: { gen: true, a: 3, b: 11, c: 5, d: 9 }, // the numbers are only used at the end of each part, to check them
    twin: () => {
      const s = rand.int(0, UNI.length - 1)
      const a = rand.int(UNI[s].a[0], UNI[s].a[1]), w = rand.pick(UNI[s].w), b = a + w
      const c = rand.int(a + 1, b - 2), dd = rand.int(c + 1, b - 1)
      return { s, a, b, c, d: dd, pk: rand.pick(['btw', 'lt', 'gt']) }
    },
    make: v => {
      const G = !!v.gen
      if (G) {
        const { a, b } = v, s0 = v.c, t0 = v.d, w = b - a
        const mid = R`\frac{x - a}{b - a}`
        return {
          text: R`A random variable \(X\) is uniformly distributed over the interval \((a, b)\) when every stretch of \((a, b)\) with the same length is equally likely to hold \(X\). So its density is constant on \((a, b)\), and 0 outside it.`,
          parts: [
            {
              label: 'a',
              ask: R`Derive the density \(f\) for \(X\). Then find its height when \(X\) is uniform on \((${a}, ${b})\).`,
              skill: 'uniform-pdf',
              hint: 'Call the constant height c. What must the total area under a density be?',
              // wrong: b − a itself, 1/b, 1/(a + b), 1/(b − a + 1) (counting whole numbers)
              check: numCheck(1 / w, 0.0005, [w, 1 / b, 1 / (a + b), 1 / (w + 1)]),
              answer: R`f(x) = \frac{1}{b - a}, \quad a < x < b;\qquad (${a}, ${b}): \ f(x) = ${frac(1, w)} ${val(1 / w)}`,
              steps: [
                {
                  say: 'Uniform means flat: the density is one constant height c on (a, b), and 0 outside.',
                  tex: R`f(x) = c, \quad a < x < b`,
                  why: 'Probability is area under f. Stretches of the same length get the same area only if the height is the same everywhere.',
                },
                { say: 'A density must have total area 1. Set the integral over (a, b) equal to 1.', tex: R`\int_a^b c\,dx = 1` },
                { say: 'Integrate. c is a constant, so its antiderivative is cx.', tex: R`\int_a^b c\,dx = cx\Big|_a^b = cb - ca = c(b - a)` },
                {
                  say: 'Solve for c.',
                  tex: R`c(b - a) = 1 \;\Rightarrow\; c = \frac{1}{b - a}`,
                  why: 'b > a, so c is positive: f(x) ≥ 0, the other thing a density needs.',
                },
                { say: 'Write the density.', tex: R`f(x) = \frac{1}{b - a}, \quad a < x < b` },
                { say: `On (${a}, ${b}), b − a = ${b} − ${a} = ${w}.`, tex: R`f(x) = \frac{1}{${b} - ${a}} = ${frac(1, w)} ${val(1 / w)}, \quad ${a} < x < ${b}` },
              ],
              trap: 'The height is 1/(b − a), not b − a: a long interval means a LOW flat density, so the area stays 1.',
            },
            {
              label: 'b',
              ask: R`Derive the cumulative distribution function \(F\) for \(X\).`,
              skill: 'cont-cdf',
              hint: 'F(x) is the area under f to the left of x. Do it in three pieces: left of a, inside (a, b), right of b.',
              check: {
                type: 'choice',
                options: [
                  { tex: cdfCases(mid, 'a', 'b') },
                  { tex: cdfCases(R`\frac{x}{b - a}`, 'a', 'b') },
                  { tex: cdfCases(R`\frac{1}{b - a}`, 'a', 'b') },
                  { tex: cdfCases(mid, 'a', 'b', '0') },
                ],
                correct: 0,
              },
              answer: cdfCases(R`\frac{x - a}{b - a}`, 'a', 'b'),
              steps: [
                { say: 'The cdf is the area under f to the left of x.', tex: R`F(x) = P[X \le x] = \int_{-\infty}^{x} f(t)\,dt`, why: 'Use t inside the integral, because x is already the upper limit.' },
                { say: 'Left of the interval (x ≤ a): there is no area yet.', tex: R`F(x) = 0, \quad x \le a` },
                { say: 'Inside (a < x < b): integrate the flat height from a up to x.', tex: R`F(x) = \int_a^x \frac{1}{b - a}\,dt = \frac{t}{b - a}\Big|_a^x = \frac{x - a}{b - a}` },
                { say: 'Right of the interval (x ≥ b): all the area is used up.', tex: R`F(x) = 1, \quad x \ge b`, why: 'Check: the middle piece gives (b − a)/(b − a) = 1 at x = b, so F has no jump there.' },
                { say: 'Put the three pieces together.', tex: cdfCases(R`\frac{x - a}{b - a}`, 'a', 'b') },
              ],
              trap: 'After b the cdf is 1, not 0. The density drops to 0 there, but the area to the left stays at 1.',
            },
            {
              label: 'c',
              ask: R`Show that if \(a \le s < t \le b\), then \(P[s < X < t] = \dfrac{t - s}{b - a}\). Use it to find \(P[${s0} < X < ${t0}]\) when \(X\) is uniform on \((${a}, ${b})\).`,
              skill: 'cont-prob',
              hint: 'Use the cdf from part (b): a probability between two values is F(right) − F(left).',
              // wrong: F(t) only, over b instead of b − a, the complement, F(s) only
              check: numCheck((t0 - s0) / w, tolP((t0 - s0) / w), [(t0 - a) / w, (t0 - s0) / b, 1 - (t0 - s0) / w, (s0 - a) / w], true),
              answer: R`P[s < X < t] = F(t) - F(s) = \frac{t - s}{b - a}; \qquad P[${s0} < X < ${t0}] = \frac{${t0 - s0}}{${w}} ${val((t0 - s0) / w)}`,
              steps: [
                { say: 'The area between s and t is the area left of t minus the area left of s.', tex: R`P[s < X < t] = F(t) - F(s)` },
                { say: 'Both s and t are inside the interval, so use the middle piece of F for both.', tex: R`= \frac{t - a}{b - a} - \frac{s - a}{b - a} = \frac{t - s}{b - a}` },
                { say: 'In words: the chance is the length of (s, t) over the length of (a, b).', why: 'That is what "uniform" means: every stretch of the same length has the same chance.' },
                {
                  say: `For (${s0}, ${t0}) inside (${a}, ${b}): length ${t0 - s0} out of ${w}.`,
                  tex: R`P[${s0} < X < ${t0}] = \frac{${t0} - ${s0}}{${b} - ${a}} = \frac{${t0 - s0}}{${w}} ${val((t0 - s0) / w)}`,
                  graph: { kind: 'curve', title: `uniform on (${a}, ${b})`, lo: a - 0.2 * w, hi: b + 0.2 * w, pdf: x => (x >= a && x <= b ? 1 / w : 0), flat: [a, b], shade: [s0, t0], ticks: [a, s0, t0, b], note: `shaded: width ${t0 - s0} out of ${w}` },
                },
              ],
            },
          ],
        }
      }
      const { a, b, c, pk } = v, dd = v.d, w = b - a
      const mid = R`\frac{x - ${a}}{${w}}`
      const lo = pk === 'gt' ? c : pk === 'lt' ? a : c, hi = pk === 'gt' ? b : pk === 'lt' ? dd : dd
      const prob = (hi - lo) / w
      const pTex = pk === 'btw' ? R`P[${c} < X < ${dd}]` : pk === 'lt' ? R`P[X < ${dd}]` : R`P[X > ${c}]`
      const pSteps = pk === 'btw'
        ? [
            { say: 'The area between two values is F(right) − F(left).', tex: R`${pTex} = F(${dd}) - F(${c})` },
            { say: `Both ${c} and ${dd} are inside (${a}, ${b}), so use the middle piece of F.`, tex: R`= \frac{${dd} - ${a}}{${w}} - \frac{${c} - ${a}}{${w}} = \frac{${dd - a}}{${w}} - \frac{${c - a}}{${w}} = \frac{${dd - c}}{${w}} ${val(prob)}` },
          ]
        : pk === 'lt'
          ? [
              { say: 'The area to the left of a value is F at that value.', tex: R`${pTex} = F(${dd})`, why: 'For a continuous X, P[X = ' + dd + '] = 0, so < and ≤ give the same answer.' },
              { say: `${dd} is inside (${a}, ${b}), so use the middle piece of F.`, tex: R`F(${dd}) = \frac{${dd} - ${a}}{${w}} = \frac{${dd - a}}{${w}} ${val(prob)}` },
            ]
          : [
              { say: 'The area to the right of a value is 1 minus the area to its left.', tex: R`${pTex} = 1 - F(${c})` },
              { say: `${c} is inside (${a}, ${b}), so use the middle piece of F.`, tex: R`1 - \frac{${c} - ${a}}{${w}} = \frac{${w} - ${c - a}}{${w}} = \frac{${b - c}}{${w}} ${val(prob)}` },
            ]
      pSteps[pSteps.length - 1].graph = {
        kind: 'curve', title: `uniform on (${a}, ${b})`, lo: a - 0.2 * w, hi: b + 0.2 * w,
        pdf: x => (x >= a && x <= b ? 1 / w : 0), flat: [a, b], shade: [lo, hi], ticks: [...new Set([a, lo, hi, b])],
        note: `shaded: width ${hi - lo} out of ${w}, so the area is ${hi - lo}/${w} ≈ ${num(prob, 4)}`,
      }
      return {
        text: UNI[v.s].story(a, b),
        parts: [
          {
            label: 'a',
            ask: R`Derive the density for \(X\): find the constant \(c\) so that \(f(x) = c\) for \(${a} < x < ${b}\) is a density.`,
            skill: 'uniform-pdf',
            hint: 'The total area under a density is 1. Here the area is a rectangle: c times the width.',
            check: numCheck(1 / w, 0.0005, [w, 1 / b, 1 / (a + b), 1 / (w + 1)]),
            answer: R`c = ${frac(1, w)} ${val(1 / w)}, \qquad f(x) = ${frac(1, w)}, \quad ${a} < x < ${b}`,
            steps: [
              { say: `Uniform means flat: the density is one constant height c on (${a}, ${b}), and 0 outside.`, tex: R`f(x) = c, \quad ${a} < x < ${b}` },
              { say: 'A density must have total area 1. Set the integral equal to 1.', tex: R`\int_{${a}}^{${b}} c\,dx = 1` },
              { say: 'Integrate. c is a constant, so its antiderivative is cx.', tex: R`cx\Big|_{${a}}^{${b}} = ${b}c - ${a}c = ${w}c` },
              { say: 'Solve for c.', tex: R`${w}c = 1 \;\Rightarrow\; c = ${frac(1, w)} ${val(1 / w)}`, why: `That is 1/(b − a) with b − a = ${b} − ${a} = ${w}.` },
            ],
            trap: `The height is 1/${w}, not ${w}: the rectangle is ${w} wide, so it must be 1/${w} tall to have area 1.`,
          },
          {
            label: 'b',
            ask: R`Find the cumulative distribution function \(F\) for \(X\).`,
            skill: 'cont-cdf',
            hint: `F(x) is the area under f to the left of x. Do it in three pieces: left of ${a}, inside (${a}, ${b}), right of ${b}.`,
            check: {
              type: 'choice',
              options: [
                { tex: cdfCases(mid, a, b) },
                { tex: cdfCases(R`\frac{x}{${w}}`, a, b) },
                { tex: cdfCases(R`\frac{1}{${w}}`, a, b) },
                { tex: cdfCases(mid, a, b, '0') },
              ],
              correct: 0,
            },
            answer: cdfCases(mid, a, b),
            steps: [
              { say: 'The cdf is the area under f to the left of x.', tex: R`F(x) = P[X \le x] = \int_{-\infty}^{x} f(t)\,dt` },
              { say: `Left of the interval (x ≤ ${a}): there is no area yet, so F(x) = 0.` },
              { say: `Inside (${a} < x < ${b}): integrate the flat height from ${a} up to x.`, tex: R`F(x) = \int_{${a}}^{x} \frac{1}{${w}}\,dt = \frac{t}{${w}}\Big|_{${a}}^{x} = \frac{x - ${a}}{${w}}`, why: `Don’t drop the − ${a}: the area starts at ${a}, not at 0.` },
              { say: `Right of the interval (x ≥ ${b}): all the area is used up, so F(x) = 1.`, why: `Check: the middle piece gives (${b} − ${a})/${w} = 1 at x = ${b}, so F has no jump.` },
              { say: 'Put the three pieces together.', tex: cdfCases(mid, a, b) },
            ],
            trap: `After ${b} the cdf is 1, not 0. The density drops to 0 there, but the area to the left stays at 1.`,
          },
          {
            label: 'c',
            ask: R`Use \(F\) to find \(${pTex}\).`,
            skill: 'cont-prob',
            hint: pk === 'gt' ? 'The area to the right of a value is 1 minus F at that value.' : pk === 'lt' ? 'The area to the left of a value is F at that value.' : 'The area between two values is F(right) − F(left).',
            // wrong: the complement, the height 1/(b − a), and per kind: forgetting the − a, over b, one end only
            check: numCheck(prob, tolP(prob), [
              1 - prob,
              ...(pk === 'btw' ? [(dd - a) / w, (dd - c) / b, (c - a) / w] : pk === 'lt' ? [dd / w, dd / b] : [1 - c / w, (b - c) / b]),
              1 / w,
              (hi - lo + 1) / (w + 1), // counted whole numbers, as if X were discrete
            ], true),
            answer: R`${pTex} = ${frac(hi - lo, w)} ${val(prob)}`,
            steps: pSteps,
          },
        ],
      }
    },
  })

  // =====================================================================================
  // pdf from a cdf, and is it valid? (4.1, like 4.1 #14)
  // =====================================================================================
  const G_DEC = [[3, 4], [2, 3], [4, 5], [4, 6], [5, 6], [5, 8], [6, 10]] // [m, k], m < k < 2m: G goes down
  const G_OK2 = [[2, 4], [2, 5], [3, 6], [3, 8], [4, 8], [1, 3]] // [m, k], k ≥ 2m: valid
  const G_JUMP = [[1, 2], [2, 5], [2, 8], [3, 10], [3, 12], [4, 20]] // [m, c], c > m²: jumps at m

  HW.add({
    id: 'gap-pdf-from-cdf',
    section: '4.1',
    num: 'extra',
    group: 7,
    title: 'Find the pdf from a cdf',
    hw: { beta: 3, pk: 'gt', s1: 6, s2: 0, gk: 'dec', m: 3, k: 4 },
    twin: () => {
      const beta = rand.pick([2, 3, 4, 5, 10]), pk = rand.pick(['gt', 'le', 'btw'])
      const s1 = rand.int(1, 2 * beta), s2 = rand.int(s1 + 1, 3 * beta)
      const gk = rand.pick(['dec', 'dec', 'ok2', 'oksq', 'jump'])
      if (gk === 'dec' || gk === 'ok2') {
        const [m, k] = rand.pick(gk === 'dec' ? G_DEC : G_OK2)
        return { beta, pk, s1, s2, gk, m, k }
      }
      if (gk === 'oksq') {
        const m = rand.int(1, 4)
        return { beta, pk, s1, s2, gk, m, c: m * m }
      }
      const [m, c] = rand.pick(G_JUMP)
      return { beta, pk, s1, s2, gk, m, c }
    },
    make: v => {
      const { beta: B, pk, s1, s2, gk, m } = v
      // ---- the first cdf: F(x) = 1 − e^(−x/β), x > 0 ----
      const fCases = top => R`f(x) = \begin{cases} ${top} & x > 0 \\ 0 & x \le 0 \end{cases}`
      const fx = R`\frac{1}{${B}}e^{-x/${B}}`
      // e^(−s/β), with the exponent as a short decimal when it is one (e^{-1.8}), else a fraction
      const ex = s => R`e^{-${Number.isInteger((s * 100) / B) ? num(s / B, 2) : frac(s, B)}}`
      const prob = pk === 'gt' ? Math.exp(-s1 / B) : pk === 'le' ? 1 - Math.exp(-s1 / B) : Math.exp(-s1 / B) - Math.exp(-s2 / B)
      const pTex = pk === 'gt' ? R`P[X > ${s1}]` : pk === 'le' ? R`P[X \le ${s1}]` : R`P[${s1} < X \le ${s2}]`
      const pSteps = pk === 'gt'
        ? [
            { say: 'The area to the right of a value is 1 minus the area to its left, and F gives the area to the left.', tex: R`${pTex} = 1 - F(${s1})` },
            { say: `Put in F(${s1}) = 1 − e^(−${s1}/${B}).`, tex: R`= 1 - \left(1 - ${ex(s1)}\right) = ${ex(s1)} ${val(prob)}` },
          ]
        : pk === 'le'
          ? [
              { say: 'F gives the area to the left of a value.', tex: R`${pTex} = F(${s1})` },
              { say: `Put in x = ${s1}.`, tex: R`F(${s1}) = 1 - ${ex(s1)} = 1 - ${num(Math.exp(-s1 / B), 6)} ${val(prob)}` },
            ]
          : [
              { say: 'The area between two values is F(right) − F(left).', tex: R`${pTex} = F(${s2}) - F(${s1})` },
              { say: 'Put in both values. The 1’s cancel.', tex: R`= \left(1 - ${ex(s2)}\right) - \left(1 - ${ex(s1)}\right) = ${ex(s1)} - ${ex(s2)} = ${num(Math.exp(-s1 / B), 6)} - ${num(Math.exp(-s2 / B), 6)} ${val(prob)}` },
            ]
      const shade = pk === 'gt' ? [s1, Infinity] : pk === 'le' ? [0, s1] : [s1, s2]
      const top = Math.max(5 * B, (pk === 'btw' ? s2 : s1) * 1.25)
      pSteps[pSteps.length - 1].graph = {
        kind: 'curve', title: `f(x) = (1/${B})e^(−x/${B})`, lo: 0, hi: top, pdf: x => (x < 0 ? 0 : Math.exp(-x / B) / B),
        shade: [shade[0], Math.min(shade[1], top)], ticks: pk === 'btw' ? [0, s1, s2] : [0, s1], note: `shaded: ${pTex.replace(/\\le/g, '≤')} ≈ ${num(prob, 4)}`,
      }
      // ---- the second cdf G on [0, m]: (kx − x²)/c or x²/c ----
      const poly = gk === 'dec' || gk === 'ok2'
      const k = v.k
      const c = poly ? k * m - m * m : v.c
      const Gmid = poly ? over(`${k}x - x^2`, c) : over('x^2', c)
      // x²/c differentiates to 2x/c; write it reduced (2x/16 = x/8)
      const g2 = HW.gcd(2, poly ? 1 : c)
      const gmid = poly ? over(`${k} - 2x`, c) : over(2 / g2 === 1 ? 'x' : '2x', c / g2)
      const gRaw = poly ? gmid : over('2x', c)
      const Gend = poly ? 1 : (m * m) / c
      const Gcases = R`G(x) = \begin{cases} 0 & x < 0 \\ ${Gmid} & 0 \le x \le ${m} \\ 1 & x > ${m} \end{cases}`
      const gCases = mid => R`g(x) = \begin{cases} ${mid} & 0 \le x \le ${m} \\ 0 & \text{otherwise} \end{cases}`
      const integ = poly ? R`\frac{1}{${c}}\left(${frac(k, 2)}x^2 - \frac{x^3}{3}\right)` : R`\frac{x^3}{${3 * c}}`
      const optsD = [
        { tex: gCases(gmid) },
        { tex: gCases(Gmid) },
        { tex: gCases(integ) },
        { tex: R`g(x) = \begin{cases} 0 & x < 0 \\ ${gmid} & 0 \le x \le ${m} \\ 1 & x > ${m} \end{cases}` },
      ]
      const kh = poly ? k / 2 : null
      const YES = { text: 'Yes. G starts at 0, ends at 1, never goes down, and has no jumps.' }
      const DEC_W = { text: R`No. \(g(x) < 0\) for some \(x\) between 0 and ${m}, so G goes down there.` }
      const DEC_R = { text: R`No. \(g(x) < 0\) for \(${num(kh)} < x \le ${m}\), so G goes down there.` }
      const JUMP_W = { text: R`No. G jumps at \(x = ${m}\), so the area under g is not 1.` }
      const JUMP_R = { text: R`No. G jumps from \(${frac(m * m, c)}\) up to 1 at \(x = ${m}\), so the area under g is only \(${frac(m * m, c)}\).` }
      const DENS = poly
        ? { text: R`No. \(g(0) = ${frac(k, c)}\) is not 0, so g jumps at \(x = 0\), and a density can’t jump.` }
        : { text: R`No. \(g(${m}) = ${frac(2 * m, c)}\) is not 0, so g jumps at \(x = ${m}\), and a density can’t jump.` }
      const optsE = gk === 'dec' ? [DEC_R, YES, JUMP_W, DENS] : gk === 'jump' ? [JUMP_R, YES, DEC_W, DENS] : [YES, DEC_W, JUMP_W, DENS]
      const ends = poly
        ? R`G(0) = 0, \qquad G(${m}) = ${over(`${k}(${m}) - ${m}^2`, c)} = 1`
        : R`G(0) = 0, \qquad G(${m}) = ${over(`${m}^2`, c)} = ${frac(m * m, c)}`
      const stepsE = [
        { say: 'A valid continuous cdf starts at 0, ends at 1, never goes down, and has no jumps. Check each one.' },
        ...(gk === 'dec'
          ? [
              { say: `The ends are fine: G(0) = 0 and G(${m}) = 1, so G meets 0 on the left and 1 on the right without a jump.`, tex: ends },
              { say: R`But \(g(x) = ${gmid}\) is negative once \(x > ${num(kh)}\).`, tex: R`${k} - 2x < 0 \iff x > ${num(kh)}` },
              {
                say: `So G goes down between ${num(kh)} and ${m}: it climbs above 1, then falls back to 1.`,
                tex: R`G(${num(kh)}) = ${frac(k * k, 4 * c)} > 1`,
                why: 'A cdf is a running total of probability, so it can never go down (or go above 1).',
              },
              { say: 'Not valid. The property that fails: G must never go down, that is, g(x) ≥ 0.' },
            ]
          : gk === 'jump'
            ? [
                { say: `G(0) = 0 is fine. But at x = ${m} the middle piece only reaches ${num(Gend, 4)}, and just past ${m}, G = 1.`, tex: ends },
                { say: `So G jumps up by 1 − ${num(Gend, 4)} = ${num(1 - Gend, 4)} at x = ${m}. A continuous cdf can’t jump.`, tex: R`\int_0^{${m}} ${gmid}\,dx = ${frac(m * m, c)} \ne 1`, why: 'A jump in G is the same as g’s area falling short of 1.' },
                { say: 'Not valid. The property that fails: G must have no jumps (the area under g must be 1). g(x) ≥ 0 is fine.' },
              ]
            : [
                { say: `The ends: G(0) = 0 and G(${m}) = 1, so there are no jumps.`, tex: ends },
                poly
                  ? { say: R`\(g(x) = ${gmid}\) is never negative on [0, ${m}]: ${k} − 2x is smallest at x = ${m}, where it is ${k} − ${2 * m} = ${k - 2 * m}.`, tex: R`${k} - 2x \ge ${k - 2 * m} \ge 0 \text{ for } 0 \le x \le ${m}` }
                  : { say: R`\(g(x) = ${gmid}\) is never negative for x ≥ 0, so G never goes down.`, tex: R`${gmid} \ge 0, \quad 0 \le x \le ${m}` },
                { say: 'Valid. All four properties hold.', tex: R`\int_0^{${m}} ${gmid}\,dx = G(${m}) - G(0) = 1`, why: 'g jumps at an end of [0, ' + m + '], and that is fine: a density can jump, only a cdf can’t.' },
              ]),
      ]
      return {
        text: R`In each case a proposed cumulative distribution function is given. Find the density that goes with it, and decide whether it really defines a valid continuous density. If it does not, say which property fails. \[F(x) = \begin{cases} 0 & x \le 0 \\ 1 - e^{-x/${B}} & x > 0 \end{cases} \qquad\qquad ${Gcases}\]`,
        parts: [
          {
            label: 'a',
            ask: R`Find the density \(f\) that goes with \(F\).`,
            skill: 'pdf-from-cdf',
            hint: 'f = F′. Differentiate each piece. The chain rule matters in the exponent.',
            check: {
              type: 'choice',
              options: [{ tex: fCases(fx) }, { tex: fCases(R`e^{-x/${B}}`) }, { tex: fCases(R`-\frac{1}{${B}}e^{-x/${B}}`) }, { tex: fCases(R`x + ${B}e^{-x/${B}}`) }],
              correct: 0,
            },
            answer: fCases(fx),
            steps: [
              { say: 'The density is the derivative of the cdf. Differentiate each piece.', tex: R`f(x) = F'(x)` },
              { say: 'For x ≤ 0, F(x) = 0 is a constant, so f(x) = 0.' },
              {
                say: R`For x > 0, the 1 gives 0. For \(e^{-x/${B}}\), the chain rule brings down the derivative of the exponent, \(-1/${B}\).`,
                tex: R`f(x) = \frac{d}{dx}\left[1 - e^{-x/${B}}\right] = 0 - e^{-x/${B}}\cdot\left(-\frac{1}{${B}}\right) = \frac{1}{${B}}e^{-x/${B}}`,
              },
              { say: 'Write it in pieces.', tex: fCases(fx), why: `This is the exponential density with β = ${B}, from the formula sheet.` },
            ],
            trap: 'Two minus signs meet here: the one in front of e and the one in the exponent. They make f positive.',
          },
          {
            label: 'b',
            ask: R`Does \(F\) define a valid continuous density?`,
            skill: 'pdf-from-cdf',
            hint: 'Check the four things a continuous cdf needs: starts at 0, ends at 1, never goes down, no jumps.',
            check: {
              type: 'choice',
              options: [
                { text: 'Yes. f(x) ≥ 0, and F starts at 0, rises toward 1, never goes down, and has no jumps.' },
                { text: 'No. F(x) never actually equals 1; it only gets closer and closer.' },
                { text: R`No. F jumps at \(x = 0\).` },
                { text: R`No. f jumps from 0 up to \(${frac(1, B)}\) at \(x = 0\), and a density can’t jump.` },
              ],
              correct: 0,
            },
            answer: R`\text{Yes: } f(x) = \tfrac{1}{${B}}e^{-x/${B}} \ge 0 \text{ and } \int_0^\infty f(x)\,dx = 1`,
            steps: [
              { say: 'A valid continuous cdf starts at 0, ends at 1, never goes down, and has no jumps. Check each one.' },
              {
                say: 'No jump at 0: coming down to 0 from the right, F goes to 1 − e⁰ = 0, which matches F = 0 on the left.',
                tex: R`\lim_{x \to 0^+}\left(1 - e^{-x/${B}}\right) = 1 - 1 = 0`,
              },
              { say: R`Never goes down: \(f(x) = ${fx} > 0\) for x > 0.` },
              {
                say: R`Ends at 1: as x grows, \(e^{-x/${B}}\) shrinks to 0, so F(x) climbs to 1. Getting there in the limit is all a cdf needs.`,
                tex: R`\lim_{x \to \infty} F(x) = 1 - 0 = 1 \quad\Longleftrightarrow\quad \int_0^\infty ${fx}\,dx = 1`,
              },
            ],
            trap: 'F doesn’t have to equal 1 at some point. Getting closer and closer to 1 as x grows is enough.',
          },
          {
            label: 'c',
            ask: R`Use \(F\) to find \(${pTex}\).`,
            skill: 'cont-prob',
            hint: pk === 'gt' ? 'F gives the area to the LEFT. The area to the right is 1 minus that.' : pk === 'le' ? 'F gives the area to the left of a value.' : 'The area between two values is F(right) − F(left).',
            // wrong: the complement, the density's height instead of an area, the exponent upside down;
            // between: F(right) only, P[X > left] only
            check: numCheck(prob, tolP(prob), pk === 'btw'
              ? [1 - Math.exp(-s2 / B), Math.exp(-s1 / B), 1 - prob, prob / B]
              : [1 - prob, Math.exp(-s1 / B) / B, pk === 'gt' ? Math.exp(-B / s1) : 1 - Math.exp(-B / s1)], true),
            answer: R`${pTex} = ${pk === 'gt' ? ex(s1) : pk === 'le' ? R`1 - ${ex(s1)}` : R`${ex(s1)} - ${ex(s2)}`} ${val(prob)}`,
            steps: pSteps,
          },
          {
            label: 'd',
            ask: R`Find the density \(g\) that goes with \(G\).`,
            skill: 'pdf-from-cdf',
            hint: 'g = G′. Differentiate each piece, including the constant ones.',
            check: { type: 'choice', options: optsD, correct: 0 },
            answer: gCases(gmid),
            steps: [
              { say: 'The density is the derivative of the cdf, piece by piece.', tex: R`g(x) = G'(x)` },
              { say: `Outside [0, ${m}], G is a constant (0 on the left, 1 on the right), and the derivative of a constant is 0.`, tex: R`g(x) = 0, \quad x < 0 \text{ or } x > ${m}` },
              { say: 'Inside, differentiate the middle piece.', tex: R`g(x) = \frac{d}{dx}\left[${Gmid}\right] = ${gRaw}${gRaw !== gmid ? ` = ${gmid}` : ''}, \quad 0 \le x \le ${m}` },
            ],
            trap: `The piece G = 1 has derivative 0, not 1. A cdf that has reached 1 adds no more probability.`,
          },
          {
            label: 'e',
            ask: R`Does \(G\) define a valid continuous density? If not, which property fails?`,
            skill: 'pdf-from-cdf',
            hint: `Check G at 0 and at ${m}, then check the sign of g(x) on [0, ${m}].`,
            check: { type: 'choice', options: optsE, correct: 0 },
            answer: gk === 'dec'
              ? R`\text{No: } g(x) < 0 \text{ for } ${num(kh)} < x \le ${m}\text{, so } G \text{ goes down}`
              : gk === 'jump'
                ? R`\text{No: } G \text{ jumps from } ${frac(m * m, c)} \text{ to } 1 \text{ at } x = ${m}`
                : R`\text{Yes: } g(x) \ge 0 \text{ and } \int_0^{${m}} g(x)\,dx = 1`,
            steps: stepsE,
            trap: gk === 'dec' ? 'Checking only G(0) = 0 and G(end) = 1 is not enough. G must also never go down in between.' : gk === 'jump' ? 'g(x) ≥ 0 is not enough. The total area must also be 1, or G jumps.' : 'A density may jump at the ends of its interval. Only the cdf has to be free of jumps.',
          },
        ],
      }
    },
  })

  // =====================================================================================
  // A continuous MGF: the uniform, and the gamma by the gamma integral (4.2, 4.3)
  // =====================================================================================
  const UMGF = [
    (a, b) => R`A bus arrives at a stop at a time that is uniformly distributed between ${a} and ${b} minutes after the hour. Let \(X\) denote the arrival time.`,
    (a, b) => R`The length of a bolt, in millimeters, is uniformly distributed over the interval \((${a}, ${b})\). Let \(X\) denote the length of a randomly chosen bolt.`,
    (a, b) => R`A random number generator produces a number \(X\) that is uniformly distributed over the interval \((${a}, ${b})\).`,
  ]
  const GMGF = [
    R`Let \(Y\) denote the time, in hours, needed to repair a machine, and assume that its density is`,
    R`Let \(Y\) denote the lifetime, in years, of a battery, and assume that its density is`,
    R`Let \(Y\) denote the amount of rain, in centimeters, that falls in a storm, and assume that its density is`,
  ]
  const GAMMA_AB = [[2, 3], [2, 4], [2, 5], [3, 2], [3, 4], [3, 5], [4, 2]] // α ≠ β, so the chain-rule factors can't be mixed up

  HW.add({
    id: 'gap-continuous-mgf',
    section: '4.2',
    num: 'extra',
    group: 7,
    title: 'Derive a continuous MGF',
    hw: { gen: true, al: 3, be: 2 }, // α and β are only used at the end of (c), to check numbers
    twin: () => {
      const a = rand.int(1, 6), [al, be] = rand.pick(GAMMA_AB)
      return { a, b: a + rand.int(2, 8), al, be, sx: rand.int(0, UMGF.length - 1), sy: rand.int(0, GMGF.length - 1) }
    },
    make: v => {
      const G = !!v.gen
      const { a, b, al, be } = v
      const w = G ? null : b - a
      const A = G ? 'a' : String(a), Bt = G ? 'b' : String(b), W = G ? 'b - a' : String(w)
      const al_ = G ? R`\alpha` : String(al), be_ = G ? R`\beta` : String(be)
      const den = G ? null : HW.fact(al - 1) * be ** al
      const ypow = G ? R`y^{\alpha-1}` : al === 2 ? 'y' : `y^{${al - 1}}`
      const fy = G ? R`\frac{1}{\Gamma(\alpha)\beta^\alpha}\,y^{\alpha-1}e^{-y/\beta}` : R`\frac{1}{${den}}\,${ypow}\,e^{-y/${be}}`
      const oneMinus = G ? R`1 - \beta t` : `1 - ${be}t`
      const ey = G ? R`e^{bt} - e^{at}` : `e^{${b}t} - e^{${a === 1 ? '' : a}t}`
      const mx = R`\frac{${ey}}{${G ? 't(b - a)' : `${w}t`}}`
      const my = R`(${oneMinus})^{-${G ? R`\alpha` : al}}`
      const mean = al * be, ey2 = al * (al + 1) * be * be, varY = al * be * be
      return {
        text: G
          ? R`Let \(X\) be uniformly distributed over the interval \((a, b)\), so that \(f(x) = \frac{1}{b - a}\) for \(a < x < b\). Let \(Y\) have a gamma distribution with parameters \(\alpha\) and \(\beta\), so that \[f(y) = ${fy}, \qquad y > 0.\]`
          : R`${UMGF[v.sx](a, b)} Its density is \(f(x) = \frac{1}{${w}}\) for \(${a} < x < ${b}\). ${GMGF[v.sy]} \[f(y) = ${fy}, \qquad y > 0.\]`,
        parts: [
          {
            label: 'a',
            ask: R`Derive the moment generating function \(m_X(t)\). What is \(m_X(0)\)?`,
            skill: 'cont-mgf',
            hint: R`\(m_X(t) = E[e^{tX}]\): integrate \(e^{tx}\) times the density over the interval.`,
            check: { type: 'self' },
            answer: R`m_X(t) = ${mx} \ \ (t \ne 0), \qquad m_X(0) = 1`,
            steps: [
              {
                say: R`Start from the definition: for a continuous X, the MGF is the integral of \(e^{tx}\) times the density over the range.`,
                tex: R`m_X(t) = E\left[e^{tX}\right] = \int_{${A}}^{${Bt}} e^{tx}\,\frac{1}{${W}}\,dx`,
              },
              {
                say: R`Pull out the constant. For t ≠ 0, an antiderivative of \(e^{tx}\) is \(e^{tx}/t\).`,
                tex: R`= \frac{1}{${W}}\left[\frac{e^{tx}}{t}\right]_{${A}}^{${Bt}}`,
                why: R`Check by differentiating: the chain rule gives \(t \cdot e^{tx}/t = e^{tx}\).`,
              },
              { say: 'Put in the limits.', tex: R`m_X(t) = ${mx}, \quad t \ne 0` },
              {
                say: R`At t = 0 that formula is 0/0, so go back to the definition: \(e^{0 \cdot X} = 1\).`,
                tex: R`m_X(0) = E\left[e^{0}\right] = E[1] = 1`,
                why: 'Every MGF equals 1 at t = 0. This one exists for every t, because the integral is over a finite interval.',
              },
            ],
            trap: R`Don’t forget the 1/t from integrating \(e^{tx}\). Without it, the answer isn’t 1 at t near 0.`,
          },
          {
            label: 'b',
            ask: R`Derive the moment generating function \(m_Y(t)\), and say for which \(t\) it exists.`,
            skill: 'cont-mgf',
            hint: R`Combine \(e^{ty}\) with \(e^{-y/${be_}}\) into one exponential, then match it to the gamma integral \(\int_0^\infty y^{\alpha-1}e^{-y/\beta}dy = \Gamma(\alpha)\beta^\alpha\).`,
            check: { type: 'self' },
            answer: R`m_Y(t) = ${my}, \quad t < \frac{1}{${be_}}`,
            steps: [
              ...(G ? [] : [{
                say: R`Read off the gamma parameters: the power on y is α − 1 = ${al - 1} and the exponent is −y/β with β = ${be}. Check the constant: \(\Gamma(${al})\cdot ${be}^{${al}} = ${HW.fact(al - 1)} \cdot ${be ** al} = ${den}\).`,
                tex: R`f(y) = \frac{1}{\Gamma(${al})\,${be}^{${al}}}\,y^{${al}-1}e^{-y/${be}} \;\Rightarrow\; \alpha = ${al}, \ \beta = ${be}`,
                why: 'Matching to the gamma density on the formula sheet tells you α and β, which the gamma integral needs.',
              }]),
              {
                say: R`Start from the definition: integrate \(e^{ty}\) times the density over y > 0.`,
                tex: R`m_Y(t) = \int_0^\infty e^{ty}\,${fy}\,dy`,
              },
              {
                say: 'Combine the two exponentials into one.',
                tex: G
                  ? R`ty - \frac{y}{\beta} = -\frac{y(1 - \beta t)}{\beta} \;\Rightarrow\; m_Y(t) = \frac{1}{\Gamma(\alpha)\beta^\alpha}\int_0^\infty y^{\alpha-1}e^{-y(1-\beta t)/\beta}\,dy`
                  : R`ty - \frac{y}{${be}} = -\frac{y(1 - ${be}t)}{${be}} \;\Rightarrow\; m_Y(t) = \frac{1}{${den}}\int_0^\infty ${ypow}\,e^{-y(1-${be}t)/${be}}\,dy`,
              },
              {
                say: R`That is a gamma integral with a new β. Call it \(\beta^*\). It must be positive, so \(t < 1/${be_}\).`,
                tex: R`e^{-y(${oneMinus})/${be_}} = e^{-y/\beta^*}, \qquad \beta^* = \frac{${be_}}{${oneMinus}}, \qquad t < \frac{1}{${be_}}`,
                why: R`If \(t \ge 1/${be_}\), the exponent is not negative, so the integrand doesn’t die off and the integral is infinite.`,
              },
              {
                say: R`Use the gamma integral \(\int_0^\infty y^{\alpha-1}e^{-y/\beta^*}dy = \Gamma(\alpha)(\beta^*)^\alpha\). It comes from the gamma density integrating to 1.`,
                tex: G
                  ? R`\int_0^\infty y^{\alpha-1}e^{-y/\beta^*}dy = \Gamma(\alpha)\left(\frac{\beta}{1-\beta t}\right)^\alpha = \frac{\Gamma(\alpha)\beta^\alpha}{(1-\beta t)^\alpha}`
                  : R`\int_0^\infty ${ypow}\,e^{-y/\beta^*}dy = \Gamma(${al})\left(\frac{${be}}{1-${be}t}\right)^{${al}} = \frac{${den}}{(1-${be}t)^{${al}}}`,
              },
              {
                say: `Multiply by the constant in front. Everything except (1 − ${G ? 'β' : be}t) cancels.`,
                tex: G
                  ? R`m_Y(t) = \frac{1}{\Gamma(\alpha)\beta^\alpha}\cdot\frac{\Gamma(\alpha)\beta^\alpha}{(1-\beta t)^\alpha} = (1 - \beta t)^{-\alpha}, \quad t < \frac{1}{\beta}`
                  : R`m_Y(t) = \frac{1}{${den}}\cdot\frac{${den}}{(1-${be}t)^{${al}}} = (1 - ${be}t)^{-${al}}, \quad t < \frac{1}{${be}}`,
              },
            ],
            trap: 'Don’t try integration by parts here. Match the integral to the gamma integral instead: it is one line.',
          },
          {
            label: 'c',
            ask: G
              ? R`Use \(m_Y(t)\) to show that \(E[Y] = \alpha\beta\) and \(\operatorname{Var} Y = \alpha\beta^2\). Then find both when \(\alpha = ${al}\) and \(\beta = ${be}\).`
              : R`Use \(m_Y(t)\) to find \(E[Y]\) and \(\operatorname{Var} Y\).`,
            skill: 'mgf-moments',
            hint: R`E[Y] = m′(0) and E[Y²] = m″(0). The chain rule brings down the power and multiplies by \(-${be_}\), the derivative of the inside.`,
            // wrong E[Y]: α/β (β read as a rate), the variance αβ², E[Y²], α (the −β from the chain rule lost)
            // wrong Var Y: E[Y²] (nothing subtracted), the mean αβ, (E[Y])², α/β²
            check: {
              type: 'numbers',
              items: [
                { label: R`E[Y]`, value: mean, tol: 0.01, wrong: wrongs(mean, 0.01, [al / be, varY, ey2, al]) },
                { label: R`\operatorname{Var} Y`, value: varY, tol: 0.05, wrong: wrongs(varY, 0.05, [ey2, mean, mean * mean, al / be ** 2]) },
              ],
            },
            answer: G
              ? R`E[Y] = \alpha\beta, \ \operatorname{Var} Y = \alpha\beta^2; \qquad \alpha = ${al},\ \beta = ${be}: \ E[Y] = ${mean}, \ \operatorname{Var} Y = ${varY}`
              : R`E[Y] = ${mean}, \quad \operatorname{Var} Y = ${varY}`,
            steps: G
              ? [
                  { say: 'E[Y] = m′(0). Chain rule: bring down the power −α, then multiply by the derivative of the inside, −β.', tex: R`m_Y'(t) = -\alpha(1-\beta t)^{-\alpha-1}\cdot(-\beta) = \alpha\beta(1-\beta t)^{-\alpha-1} \;\Rightarrow\; E[Y] = m_Y'(0) = \alpha\beta` },
                  { say: 'E[Y²] = m″(0). Differentiate again the same way.', tex: R`m_Y''(t) = \alpha\beta(-\alpha-1)(1-\beta t)^{-\alpha-2}(-\beta) = \alpha(\alpha+1)\beta^2(1-\beta t)^{-\alpha-2} \;\Rightarrow\; E[Y^2] = \alpha(\alpha+1)\beta^2` },
                  { say: 'Var Y = E[Y²] − (E[Y])².', tex: R`\operatorname{Var} Y = \alpha(\alpha+1)\beta^2 - \alpha^2\beta^2 = \alpha^2\beta^2 + \alpha\beta^2 - \alpha^2\beta^2 = \alpha\beta^2` },
                  { say: `Now put in α = ${al} and β = ${be}.`, tex: R`E[Y] = ${al}\cdot ${be} = ${mean}, \qquad \operatorname{Var} Y = ${al}\cdot ${be}^2 = ${varY}` },
                ]
              : [
                  { say: `E[Y] = m′(0). Chain rule: bring down the power −${al}, then multiply by the derivative of the inside, −${be}.`, tex: R`m_Y'(t) = -${al}(1-${be}t)^{-${al + 1}}\cdot(-${be}) = ${al * be}(1-${be}t)^{-${al + 1}} \;\Rightarrow\; E[Y] = m_Y'(0) = ${mean}` },
                  { say: 'E[Y²] = m″(0). Differentiate again the same way.', tex: R`m_Y''(t) = ${al * be}\cdot(-${al + 1})(1-${be}t)^{-${al + 2}}\cdot(-${be}) = ${ey2}(1-${be}t)^{-${al + 2}} \;\Rightarrow\; E[Y^2] = ${ey2}` },
                  { say: 'Var Y = E[Y²] − (E[Y])².', tex: R`\operatorname{Var} Y = ${ey2} - ${mean}^2 = ${ey2} - ${mean * mean} = ${varY}`, why: `It matches the gamma formulas: αβ = ${al}·${be} = ${mean} and αβ² = ${al}·${be * be} = ${varY}.` },
                ],
          },
        ],
      }
    },
  })
})()
