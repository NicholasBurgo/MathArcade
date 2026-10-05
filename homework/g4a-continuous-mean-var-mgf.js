// Group 4 (first half): continuous mean, variance and MGF (4.2 #15, 16, 17, 23, 24)
;(() => {
  const R = String.raw
  const { num, frac } = HW

  // ---------- exact fractions: these integrals all land on fractions ----------
  const Q = (n, d = 1) => {
    if (d < 0) { n = -n; d = -d }
    const g = HW.gcd(n, d) || 1
    return { n: n / g, d: d / g }
  }
  const qsub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d)
  const qmul = (a, b) => Q(a.n * b.n, a.d * b.d)
  const qv = a => a.n / a.d
  const qt = a => frac(a.n, a.d)
  const qtxt = a => HW.fracText(a.n, a.d)
  const lcm = (x, y) => (x / HW.gcd(x, y)) * y
  // '= 3.2' when 4 decimals say it exactly, '\approx 3.1111' when they don't
  const dec = (x, d = 4) => (Math.abs(+HW.fix(x, d) - x) < 1e-12 ? '= ' : R`\approx `) + num(x, d)
  // n/d as the arithmetic gives it, then reduced, then the decimal: \frac{56}{18} = \frac{28}{9} \approx 3.1111
  const settle = (n, d) => {
    const r = Q(n, d)
    const out = [d === 1 ? String(n) : R`\frac{${n}}{${d}}`]
    if (r.n !== n || r.d !== d) out.push(qt(r))
    return out.join(' = ') + (r.d !== 1 ? ' ' + dec(qv(r)) : '')
  }
  // A − B over a common denominator: 10 - \frac{784}{81} = \frac{810 - 784}{81} = \frac{26}{81} \approx 0.3210
  const diffTex = (A, B) => {
    const L = lcm(A.d, B.d)
    const x = A.n * (L / A.d), y = B.n * (L / B.d)
    return R`${qt(A)} - ${qt(B)} = ${L === 1 ? '' : R`\frac{${x} - ${y}}{${L}} = `}${settle(x - y, L)}`
  }
  // (28/9)² written for squaring
  const sqT = a => (a.d === 1 ? `${a.n}^2` : R`\left(${qt(a)}\right)^2`)
  // x, x^{2}, x^{-3}
  const xp = k => (k === 1 ? 'x' : `x^{${k}}`)
  // 1/a, or 1 when a = 1
  const over = a => (a === 1 ? '1' : R`\frac{1}{${a}}`)
  // plain-text powers for graph titles: x³, x⁻³
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  const supTxt = k => [...String(k)].map(ch => SUP[ch]).join('')
  const xpTxt = k => (k === 1 ? 'x' : 'x' + supTxt(k))
  // the same as dec, in plain text for graph notes: '= 0.125', '≈ 0.7813'
  const decTxt = (x, d = 4) => (Math.abs(+HW.fix(x, d) - x) < 1e-12 ? '= ' : '≈ ') + num(x, d)
  // a probability is checked to 3 decimals (less when it is small)
  const probTol = p => Math.min(0.001, 0.05 * p)
  // A variance is a difference of two close numbers, so rounding E[X] early moves it a lot.
  // These pass the right answer to 2 decimals or 3 significant figures (and ln to 3 decimals),
  // and fail E[X] rounded early (3.11² in 4.2 #15, 36.1² in #16, 3.33² in #23).
  const varTol = v => Math.max(0.005, 0.006 * v)
  const sdTol = s => Math.max(0.005, 0.004 * s)
  // the arcade's wrong choices: a twin can make a mistake land on the answer, so drop
  // those (and repeats, and the impossible ones `ok` rules out), keep up to 5
  const wrongs = (value, tol, xs, ok = () => true) => {
    const out = []
    for (const x of xs) {
      if (!Number.isFinite(x) || !ok(x) || Math.abs(x - value) <= 1.55 * tol) continue
      if (out.some(y => +y.toPrecision(4) === +x.toPrecision(4))) continue
      out.push(x)
    }
    return out.slice(0, 5)
  }
  const isProb = x => x > 0 && x < 1
  const isPos = x => x > 0
  const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d

  // ---------- 4.2 #15: E[X], E[X²], σ² for f(x) = c·x^m on [a, b] ----------
  const POW_STORIES = [
    { lead: R`Consider the random variable \(X\) with density` },
    { lead: R`Let \(X\) denote the time in minutes it takes a technician to clear a paper jam in an office printer. The density for \(X\) is` },
    { lead: R`Let \(X\) denote the amount of rain in inches that falls during a spring storm in a certain town. The density for \(X\) is` },
    { lead: R`Let \(X\) denote the distance in kilometres a food-delivery rider travels on one order. The density for \(X\) is` },
  ]
  // [m, a, b]: c = (m + 1)/(b^(m+1) − a^(m+1)) is a tidy fraction, and the variance is not
  // swamped by the mean (so a hand calculation doesn't lose it to rounding)
  const POW_SHAPES = [[1, 2, 4], [1, 1, 3], [1, 0, 4], [1, 1, 5], [1, 2, 6], [1, 0, 6], [1, 0, 2], [1, 3, 5], [1, 1, 2], [2, 0, 2], [2, 0, 3], [2, 0, 4], [2, 0, 5], [2, 0, 6]]

  HW.add({
    id: '4.2-15',
    section: '4.2',
    num: '15',
    group: 4,
    title: 'Mean and variance from a pdf',
    hw: { m: 1, a: 2, b: 4, s: 0 },
    twin: () => {
      const [m, a, b] = HW.rand.pick(POW_SHAPES)
      return { m, a, b, s: HW.rand.int(0, POW_STORIES.length - 1) }
    },
    make: v => {
      const { m, a, b } = v
      const S = POW_STORIES[v.s]
      const c = Q(m + 1, b ** (m + 1) - a ** (m + 1))
      const cT = qt(c)
      const p1 = m + 2, p2 = m + 3 // the powers after integrating x·x^m and x²·x^m
      const mu = Q(c.n * (b ** p1 - a ** p1), c.d * p1)
      const e2 = Q(c.n * (b ** p2 - a ** p2), c.d * p2)
      const mu2 = qmul(mu, mu)
      const varQ = qsub(e2, mu2)
      const varX = qv(varQ), sd = Math.sqrt(varX)
      const pdf = x => (x >= a && x <= b ? qv(c) * x ** m : 0)
      const w = b - a
      const fTxt = `f(x) = (${qtxt(c)})${xpTxt(m)} on [${a}, ${b}]`
      // mistakes: E[X] rounded to 2 decimals before squaring, E[X²] − E[X], no subtraction
      const muR = round(qv(mu), 2), varEarly = qv(e2) - muR * muR
      const vT = varTol(varX), sT = sdTol(sd)
      const earlyHurts = Math.abs(varEarly - varX) > vT
      return {
        text: R`${S.lead} \[f(x) = ${cT}${xp(m)} \qquad ${a} \le x \le ${b}\]`,
        parts: [
          {
            label: 'a',
            ask: R`Find \(E[X]\).`,
            skill: 'mean-var',
            hint: 'E[X] is the integral of x times f(x), over the values X can take.',
            check: {
              type: 'number',
              value: qv(mu),
              tol: 0.005,
              wrong: wrongs(qv(mu), 0.005, [
                (a + b) / 2, // the middle of the range, as if f were flat
                (b ** p1 - a ** p1) / p1, // left the constant out
                qv(c) * (b ** p1 - a ** p1), // didn't divide by the new power
                (qv(c) * b ** p1) / p1, // dropped the lower limit
              ]),
            },
            answer: R`E[X] = ${qt(mu)}${mu.d === 1 ? '' : R` ${dec(qv(mu))}`}`,
            steps: [
              {
                say: 'The mean of a continuous random variable is the integral of x times f(x) over every value X can take.',
                tex: R`E[X] = \int_{${a}}^{${b}} x\,f(x)\,dx`,
                why: 'It is the continuous version of Σ x·f(x): every value, weighted by how likely it is.',
              },
              {
                say: R`Put in \(f(x)\) and pull the constant out front. \(x \cdot ${xp(m)} = ${xp(m + 1)}\).`,
                tex: R`E[X] = \int_{${a}}^{${b}} x \cdot ${cT}${xp(m)}\,dx = ${cT}\int_{${a}}^{${b}} ${xp(m + 1)}\,dx`,
              },
              {
                say: 'Integrate with the power rule: add 1 to the power, then divide by the new power. Then put in the limits, top minus bottom.',
                tex: R`= ${cT}\left[\frac{x^{${p1}}}{${p1}}\right]_{${a}}^{${b}} = ${cT}\cdot\frac{${b}^{${p1}} - ${a}^{${p1}}}{${p1}} = ${cT}\cdot\frac{${b ** p1} - ${a ** p1}}{${p1}}`,
              },
              {
                say: 'Multiply out. Keep the exact fraction: you need it again in (c).',
                tex: R`E[X] = ${settle(c.n * (b ** p1 - a ** p1), c.d * p1)}`,
                why: `Check: the mean is between ${a} and ${b}, and right of the middle (${num((a + b) / 2, 2)}), because f(x) grows with x, so the bigger values are more likely.`,
                graph: {
                  kind: 'curve',
                  title: fTxt,
                  lo: a - 0.2 * w,
                  hi: b + 0.2 * w,
                  pdf,
                  ticks: [a, (a + b) / 2, b],
                  marks: [qv(mu)],
                  note: `dashed: the mean ${qtxt(mu)}${mu.d === 1 ? '' : ' ' + decTxt(qv(mu), 2)}, right of the middle ${num((a + b) / 2, 2)}`,
                },
              },
            ],
            trap: 'Don’t integrate f(x) by itself: that gives 1, the total area. The mean needs the extra x.',
          },
          {
            label: 'b',
            ask: R`Find \(E[X^2]\).`,
            skill: 'mean-var',
            hint: 'Same integral as E[X], with x² in place of x.',
            check: {
              type: 'number',
              value: qv(e2),
              tol: Math.max(0.005, 0.004 * qv(e2)),
              wrong: wrongs(qv(e2), Math.max(0.005, 0.004 * qv(e2)), [
                qv(mu2), // squared the mean instead of integrating
                (b ** p2 - a ** p2) / p2, // left the constant out
                qv(c) * (b ** p2 - a ** p2), // didn't divide by the new power
                (qv(c) * b ** p2) / p2, // dropped the lower limit
              ]),
            },
            answer: R`E[X^2] = ${qt(e2)}${e2.d === 1 ? '' : R` ${dec(qv(e2))}`}`,
            steps: [
              {
                say: R`\(E[X^2]\) is the integral of \(x^2 f(x)\). Here \(x^2 \cdot ${xp(m)} = ${xp(m + 2)}\).`,
                tex: R`E[X^2] = \int_{${a}}^{${b}} x^2 f(x)\,dx = ${cT}\int_{${a}}^{${b}} ${xp(m + 2)}\,dx`,
                why: R`Any \(E[g(X)]\) is the integral of \(g(x)\,f(x)\). Here \(g(x) = x^2\).`,
              },
              {
                say: 'Power rule again, then the limits, top minus bottom.',
                tex: R`= ${cT}\left[\frac{x^{${p2}}}{${p2}}\right]_{${a}}^{${b}} = ${cT}\cdot\frac{${b}^{${p2}} - ${a}^{${p2}}}{${p2}} = ${cT}\cdot\frac{${b ** p2} - ${a ** p2}}{${p2}}`,
              },
              {
                say: 'Multiply out.',
                tex: R`E[X^2] = ${settle(c.n * (b ** p2 - a ** p2), c.d * p2)}`,
              },
            ],
            trap: `E[X²] is not (E[X])². Squaring the mean gives about ${num(qv(mu2), 2)}, not ${num(qv(e2), 2)}: you have to integrate.`,
          },
          {
            label: 'c',
            ask: R`Find \(\sigma^2\) and \(\sigma\).`,
            skill: 'mean-var',
            hint: 'Var X = E[X²] − (E[X])², using your answers to (a) and (b). σ is its square root.',
            check: {
              type: 'numbers',
              items: [
                {
                  label: R`\sigma^2`,
                  value: varX,
                  tol: vT,
                  wrong: wrongs(varX, vT, [
                    qv(e2) - qv(mu), // E[X²] − E[X]: forgot to square the mean
                    qv(e2), // forgot to subtract (E[X])²
                    sd, // gave σ for σ²
                    varEarly, // rounded E[X] to 2 decimals before squaring
                  ], isPos),
                },
                {
                  label: R`\sigma`,
                  value: sd,
                  tol: sT,
                  wrong: wrongs(sd, sT, [
                    varX, // forgot the square root
                    Math.sqrt(qv(e2)), // forgot to subtract (E[X])²
                    Math.sqrt(qv(e2) - qv(mu)), // E[X²] − E[X]
                    Math.sqrt(varEarly), // rounded E[X] early
                  ]),
                },
              ],
            },
            answer: R`\sigma^2 = ${qt(varQ)} ${dec(varX)}, \quad \sigma ${dec(sd)}`,
            steps: [
              {
                say: 'Use the shortcut formula: the variance is E[X²] minus the square of the mean.',
                tex: R`\sigma^2 = E[X^2] - (E[X])^2`,
                why: 'Both pieces are done already: E[X] in (a) and E[X²] in (b).',
              },
              {
                say: 'Put them in as exact fractions, and keep them exact until the subtraction is done.',
                tex: R`\sigma^2 = ${qt(e2)} - ${sqT(mu)} = ${diffTex(e2, mu2)}`,
                why: earlyHurts
                  ? `The two numbers are close, so an early rounding shows up in the difference: E[X] ≈ ${num(muR, 2)} gives ${num(muR, 2)}² = ${num(muR * muR, 4)} and σ² ≈ ${num(varEarly, 4)}, which is wrong.`
                  : 'The two numbers are close, so rounding either one early shows up in the difference.',
              },
              {
                say: 'σ is the square root of the variance.',
                tex: R`\sigma = \sqrt{${qt(varQ)}} ${dec(sd)}`,
                why: `Check: a variance is never negative, and σ can’t be more than half the width of the range, here (${b} − ${a})/2 = ${num(w / 2, 2)}.`,
              },
            ],
            trap: `Var X is E[X²] − (E[X])², not E[X²] − E[X] (that gives ${num(qv(e2) - qv(mu), 4)}). Square the mean before subtracting.`,
          },
        ],
      }
    },
  })

  // ---------- 4.2 #16: f(x) = 1/(x ln k) on [a, ka] ----------
  const LOG_STORIES = [
    { lead: R`Let \(X\) denote the amount in pounds of polyurethane cushioning found in a car.`, unit: 'pounds', as: [10, 20, 25, 30, 40] },
    { lead: R`Let \(X\) denote the size in megabytes of a photo uploaded to a social media site.`, unit: 'megabytes', as: [2, 3, 4, 5] },
    { lead: R`Let \(X\) denote the weight in grams of a pebble picked at random from a beach.`, unit: 'grams', as: [10, 20, 50, 100] },
    { lead: R`Let \(X\) denote the length in centimetres of a fish caught in a certain lake.`, unit: 'centimetres', as: [10, 15, 20, 25] },
  ]

  HW.add({
    id: '4.2-16',
    section: '4.2',
    num: '16',
    group: 4,
    title: 'Polyurethane cushioning',
    hw: { a: 25, k: 2, s: 0 },
    twin: () => {
      const s = HW.rand.int(0, LOG_STORIES.length - 1)
      return { a: HW.rand.pick(LOG_STORIES[s].as), k: HW.rand.pick([2, 3, 4]), s }
    },
    make: v => {
      const { a, k } = v
      const S = LOG_STORIES[v.s]
      const b = a * k
      const L = Math.log(k)
      const lnT = R`\ln ${k}`
      const mean = (b - a) / L
      const sq = b * b - a * a
      const e2 = sq / (2 * L)
      const varX = e2 - mean * mean
      const sd = Math.sqrt(varX)
      const e2T = sq % 2 === 0 ? R`\frac{${sq / 2}}{${lnT}}` : R`\frac{${sq}}{2${lnT}}`
      const fT = R`\frac{1}{${lnT}}\cdot\frac{1}{x}`
      const w = b - a
      const pdf = x => (x >= a && x <= b ? 1 / (x * L) : 0)
      const mT = Math.max(0.005, 0.001 * mean), vT = varTol(varX), sT = sdTol(sd)
      // mistakes: E[X] rounded to 1 decimal before squaring; (b − a)²/ln k (forgot to square the ln)
      const muR = round(mean, 1), varEarly = e2 - muR * muR
      const varNoSqLn = e2 - (b - a) ** 2 / L
      return {
        text: R`${S.lead} The density for \(X\) is given by \[f(x) = \frac{1}{${lnT}}\,\frac{1}{x} \qquad ${a} \le x \le ${b}\] Find the mean, variance, and standard deviation for \(X\).`,
        parts: [
          {
            label: 'a',
            ask: R`Find the mean of \(X\).`,
            skill: 'mean-var',
            hint: 'Integrate x times f(x) from the left end to the right end. Look for something that cancels.',
            check: {
              type: 'number',
              value: mean,
              tol: mT,
              wrong: wrongs(mean, mT, [
                (a + b) / 2, // the middle of the range, as if f were flat
                b - a, // left the 1/ln k out
                (b - a) * L, // multiplied by ln k instead of dividing
                (b - a) / Math.log10(k), // the calculator's log key (base 10) for ln
              ]),
            },
            answer: R`E[X] = \frac{${b - a}}{${lnT}} \approx ${num(mean, 4)}`,
            steps: [
              {
                say: 'The mean of a continuous random variable is the integral of x times f(x) over every value X can take.',
                tex: R`E[X] = \int_{${a}}^{${b}} x\,f(x)\,dx`,
              },
              {
                say: R`Put in \(f(x)\). The \(x\) cancels the \(1/x\), and \(1/${lnT}\) is a constant, so it comes out front.`,
                tex: R`E[X] = \int_{${a}}^{${b}} x \cdot ${fT}\,dx = \frac{1}{${lnT}}\int_{${a}}^{${b}} 1\,dx`,
                why: `ln ${k} is a number (about ${num(L, 4)}), not a function of x.`,
              },
              {
                say: R`The antiderivative of 1 is \(x\). Put in the limits, top minus bottom.`,
                tex: R`E[X] = \frac{1}{${lnT}}\Big[x\Big]_{${a}}^{${b}} = \frac{1}{${lnT}}\,(${b} - ${a}) = \frac{${b - a}}{${lnT}}`,
              },
              {
                say: R`Now the decimal: \(${lnT} \approx ${num(L, 6)}\).`,
                tex: R`E[X] = \frac{${b - a}}{${num(L, 6)}} \approx ${num(mean, 4)}`,
                why: `Check: it is between ${a} and ${b}, and left of the middle (${num((a + b) / 2, 2)}), because the density 1/x is biggest at the small values.`,
                graph: {
                  kind: 'curve',
                  title: `f(x) = 1/(x ln ${k}) on [${a}, ${b}]`,
                  lo: a - 0.2 * w,
                  hi: b + 0.2 * w,
                  pdf,
                  ticks: [a, (a + b) / 2, b],
                  marks: [mean],
                  note: `dashed: the mean ≈ ${num(mean, 2)}, left of the middle ${num((a + b) / 2, 2)}`,
                },
              },
            ],
            trap: R`Don't integrate \(1/x\) into \(\ln x\) here: multiply by \(x\) first and it cancels. (\(\ln x\) is what you'd get checking that \(f\) integrates to 1.)`,
          },
          {
            label: 'b',
            ask: R`Find the variance of \(X\).`,
            skill: 'mean-var',
            hint: 'First E[X²] = ∫ x²·f(x) dx. Then Var X = E[X²] − (E[X])².',
            check: {
              type: 'number',
              value: varX,
              tol: vT,
              wrong: wrongs(varX, vT, [
                e2 - mean, // E[X²] − E[X]: forgot to square the mean
                e2, // forgot to subtract (E[X])²
                sd, // gave σ for σ²
                varNoSqLn, // squared the top of E[X] but not the ln
                varEarly, // rounded E[X] to 1 decimal before squaring
              ], isPos),
            },
            answer: R`\sigma^2 = ${e2T} - \frac{${(b - a) ** 2}}{(${lnT})^2} \approx ${num(varX, 4)}`,
            steps: [
              {
                say: R`Start with \(E[X^2]\), the integral of \(x^2 f(x)\). One \(x\) cancels the \(1/x\), and one is left.`,
                tex: R`E[X^2] = \int_{${a}}^{${b}} x^2 \cdot ${fT}\,dx = \frac{1}{${lnT}}\int_{${a}}^{${b}} x\,dx`,
              },
              {
                say: R`Power rule: the antiderivative of \(x\) is \(x^2/2\). Then the limits, top minus bottom.`,
                tex: R`E[X^2] = \frac{1}{${lnT}}\left[\frac{x^2}{2}\right]_{${a}}^{${b}} = \frac{1}{${lnT}}\cdot\frac{${b}^2 - ${a}^2}{2} = \frac{1}{${lnT}}\cdot\frac{${b * b} - ${a * a}}{2} = ${e2T} \approx ${num(e2, 4)}`,
              },
              {
                say: 'Use the shortcut formula for the variance, with E[X] from (a). Square all of E[X], the ln too.',
                tex: R`\sigma^2 = E[X^2] - (E[X])^2 = ${e2T} - \left(\frac{${b - a}}{${lnT}}\right)^2 = ${e2T} - \frac{${(b - a) ** 2}}{(${lnT})^2}`,
              },
              {
                say: 'Turn each piece into a decimal and subtract. Best: type the whole line into the calculator in one go.',
                tex: R`\sigma^2 \approx ${num(e2, 4)} - ${num(mean * mean, 4)} \approx ${num(varX, 4)}`,
                why: Math.abs(varEarly - varX) > vT
                  ? `The two numbers are close together, so rounding early shows up in the difference: E[X] ≈ ${num(muR, 1)} gives ${num(muR, 1)}² = ${num(muR * muR, 2)} and σ² ≈ ${num(varEarly, 2)}, which is wrong. Keep at least 4 decimals in each piece.`
                  : 'The two numbers are close together, so rounding early shows up in the difference. Keep at least 4 decimals in each piece.',
              },
            ],
            trap: `Square all of E[X], the ln too: (${b - a}/ln ${k})² = ${(b - a) ** 2}/(ln ${k})², not ${(b - a) ** 2}/ln ${k}.`,
          },
          {
            label: 'c',
            ask: R`Find the standard deviation of \(X\).`,
            skill: 'mean-var',
            hint: 'σ is the square root of the variance.',
            check: {
              type: 'number',
              value: sd,
              tol: sT,
              wrong: wrongs(sd, sT, [
                varX, // stopped at the variance
                Math.sqrt(e2), // forgot to subtract (E[X])²
                Math.sqrt(e2 - mean), // E[X²] − E[X]
                Math.sqrt(varEarly), // rounded E[X] to 1 decimal before squaring
              ], isPos),
            },
            answer: R`\sigma \approx ${num(sd, 4)}`,
            steps: [
              {
                say: 'The standard deviation is the square root of the variance from (b).',
                tex: R`\sigma = \sqrt{\sigma^2}`,
              },
              {
                say: 'Take the root.',
                tex: R`\sigma \approx \sqrt{${num(varX, 4)}} \approx ${num(sd, 4)}`,
                why: `σ is in ${S.unit}, the same units as X (the variance is in ${S.unit} squared). A typical value is within about ${num(sd, 1)} ${S.unit} of the mean, ${num(mean, 1)}.`,
              },
            ],
          },
        ],
      }
    },
  })

  // ---------- 4.2 #17: exponential, MGF and moments ----------
  const EXP_STORIES = [
    { lead: R`Let \(X\) denote the length in minutes of a long-distance telephone conversation.`, avg: 'the average length of such a call', unit: 'minutes', betas: [4, 5, 6, 8, 12, 15] },
    { lead: R`Let \(X\) denote the time in minutes between one customer and the next walking into a coffee shop.`, avg: 'the average time between customers', unit: 'minutes', betas: [2, 3, 4, 5] },
    { lead: R`Let \(X\) denote the time in years until a newly installed water-heater element burns out.`, avg: 'the average lifetime of such an element', unit: 'years', betas: [2, 3, 4, 5, 6, 8] },
    { lead: R`Let \(X\) denote the time in minutes a caller spends on hold before reaching an agent at a help line.`, avg: 'the average time on hold', unit: 'minutes', betas: [3, 4, 5, 6, 8] },
  ]

  HW.add({
    id: '4.2-17',
    section: '4.2',
    num: '17',
    group: 4,
    title: 'Telephone call lengths',
    hw: { beta: 10, s: 0 },
    twin: () => {
      const s = HW.rand.int(0, EXP_STORIES.length - 1)
      return { beta: HW.rand.pick(EXP_STORIES[s].betas), s }
    },
    make: v => {
      const B = v.beta
      const S = EXP_STORIES[v.s]
      const inv = frac(1, B) // 1/β
      const mT = R`\frac{1}{1 - ${B}t}`
      const ex2 = 2 * B * B, varX = B * B
      return {
        text: R`${S.lead} The density for \(X\) is given by \[f(x) = \frac{1}{${B}}e^{-x/${B}} \qquad x > 0\]`,
        parts: [
          {
            label: 'a',
            ask: R`Find the moment generating function, \(m_X(t)\).`,
            skill: 'cont-mgf',
            hint: 'm(t) = E[e^(tX)] = ∫ e^(tx)·f(x) dx from 0 to ∞. Combine the two exponentials into one.',
            check: {
              type: 'choice',
              options: [
                { tex: R`m_X(t) = \dfrac{1}{1 - ${B}t}, \quad t < ${inv}` },
                { tex: R`m_X(t) = \dfrac{1}{1 - t/${B}}, \quad t < ${B}` },
                { tex: R`m_X(t) = \dfrac{${B}}{1 - ${B}t}, \quad t < ${inv}` },
                { tex: R`m_X(t) = \dfrac{1}{1 - ${B}t}, \quad t > ${inv}` },
                { tex: R`m_X(t) = \dfrac{1}{1 + ${B}t}, \quad t > -${inv}` },
              ],
              correct: 0,
            },
            answer: R`m_X(t) = ${mT}, \quad t < ${inv}`,
            steps: [
              {
                say: 'Start from the definition: the MGF is the expected value of e^(tX). For a continuous X that is an integral over the range, here x > 0.',
                tex: R`m_X(t) = E\left[e^{tX}\right] = \int_0^\infty e^{tx}\cdot\frac{1}{${B}}e^{-x/${B}}\,dx`,
              },
              {
                say: 'Pull out the constant and combine the two exponentials by adding their exponents. Then factor −x out of the exponent.',
                tex: R`= \frac{1}{${B}}\int_0^\infty e^{tx - x/${B}}\,dx = \frac{1}{${B}}\int_0^\infty e^{-\left(${inv} - t\right)x}\,dx`,
                why: R`\(e^a e^b = e^{a+b}\). Writing it as \(e^{-cx}\) with \(c = ${inv} - t\) makes it a standard integral.`,
              },
              {
                say: R`Integrate: the antiderivative of \(e^{-cx}\) is \(-e^{-cx}/c\). Top limit: as \(x \to \infty\), \(e^{-cx}\) goes to 0, but only when \(c > 0\). Bottom limit: \(e^{0} = 1\).`,
                tex: [
                  R`\int_0^\infty e^{-cx}\,dx = \left[-\frac{e^{-cx}}{c}\right]_0^\infty`,
                  R`= \lim_{x\to\infty}\left(-\frac{e^{-cx}}{c}\right) - \left(-\frac{e^{0}}{c}\right) = 0 + \frac{1}{c} = \frac{1}{c} \quad (c > 0)`,
                ],
                why: 'If c ≤ 0, e^(−cx) stays at 1 or grows forever, and the area under it is infinite.',
              },
              {
                say: R`Here \(c = ${inv} - t\), and it has to be positive. That says which \(t\) the MGF exists for.`,
                tex: R`${inv} - t > 0 \iff t < ${inv}`,
              },
              {
                say: `Put it together. The ${B} in front multiplies into the bracket: ${B}·(1/${B} − t) = 1 − ${B}t.`,
                tex: R`m_X(t) = \frac{1}{${B}}\cdot\frac{1}{${inv} - t} = \frac{1}{${B}\left(${inv} - t\right)} = ${mT}, \quad t < ${inv}`,
                why: `This is the exponential MGF 1/(1 − βt) with β = ${B}. Good for checking, but the question wants the integral worked out, so show it.`,
              },
            ],
            trap: `Don’t drop the range: the MGF only exists for t < ${HW.fracText(1, B)}. And keep the 1/${B} out front: forgetting it gives ${B}/(1 − ${B}t).`,
          },
          {
            label: 'b',
            ask: R`Use \(m_X(t)\) to find ${S.avg}.`,
            skill: 'mgf-moments',
            hint: 'E[X] = m′(0). Write m(t) as (1 − βt)^(−1) and use the chain rule.',
            check: {
              type: 'number',
              value: B,
              tol: 0.01,
              wrong: wrongs(B, 0.01, [
                1 / B, // mixed up β and the rate 1/β
                1, // put t = 0 in before differentiating: m(0) = 1
                -B, // lost the minus sign from the inside, −β
                B * B, // the variance, not the mean
              ]),
            },
            answer: R`E[X] = m_X'(0) = ${B} \text{ ${S.unit}}`,
            steps: [
              {
                say: 'The first derivative of the MGF at t = 0 is the mean.',
                tex: R`E[X] = m_X'(0)`,
                why: 'Each derivative of e^(tx) brings down a factor of x. At t = 0, e^0 = 1, so what is left is the average of x.',
              },
              {
                say: 'Write m as a power so the chain rule is easy.',
                tex: R`m_X(t) = (1 - ${B}t)^{-1}`,
              },
              {
                say: `Differentiate: bring down the −1, lower the power by 1, then multiply by the derivative of the inside, which is −${B}.`,
                tex: R`m_X'(t) = -1\cdot(1 - ${B}t)^{-2}\cdot(-${B}) = ${B}(1 - ${B}t)^{-2}`,
              },
              {
                say: 'Put in t = 0.',
                tex: R`E[X] = m_X'(0) = ${B}(1 - 0)^{-2} = ${B}`,
                why: `The average is ${B} ${S.unit}: the β in e^(−x/${B}), as it should be for an exponential.`,
                graph: {
                  kind: 'curve',
                  title: `f(x) = (1/${B})e^(−x/${B})`,
                  lo: 0,
                  hi: 5 * B,
                  pdf: x => (x < 0 ? 0 : Math.exp(-x / B) / B),
                  ticks: [0, B, 2 * B, 3 * B, 4 * B],
                  marks: [B],
                  note: `dashed: the mean β = ${B}`,
                },
              },
            ],
            trap: 'Put t = 0 in after differentiating, not before: m(0) is always 1.',
          },
          {
            label: 'c',
            ask: R`Find the variance and standard deviation for \(X\).`,
            skill: 'mgf-moments',
            hint: 'E[X²] = m″(0): differentiate m′(t) once more. Then Var X = E[X²] − (E[X])².',
            check: {
              type: 'numbers',
              items: [
                {
                  label: R`\sigma^2`,
                  value: varX,
                  tol: 0.01 * varX,
                  wrong: wrongs(varX, 0.01 * varX, [
                    ex2, // stopped at m″(0) = E[X²]
                    B, // gave σ for σ²
                    ex2 - B, // E[X²] − E[X]: forgot to square the mean
                    1 / (B * B), // mixed up β and the rate 1/β
                  ]),
                },
                {
                  label: R`\sigma`,
                  value: B,
                  tol: 0.01,
                  wrong: wrongs(B, 0.01, [
                    varX, // stopped at the variance
                    Math.sqrt(ex2), // √E[X²]: forgot to subtract (E[X])²
                    Math.sqrt(ex2 - B), // E[X²] − E[X]
                    1 / B, // mixed up β and the rate 1/β
                  ]),
                },
              ],
            },
            answer: R`\sigma^2 = ${varX}, \quad \sigma = ${B} \text{ ${S.unit}}`,
            steps: [
              {
                say: 'The second derivative at t = 0 is E[X²]. Differentiate m′(t) the same way: bring down the −2, lower the power, times −' + B + '.',
                tex: R`m_X''(t) = ${B}\cdot(-2)(1 - ${B}t)^{-3}\cdot(-${B}) = ${ex2}(1 - ${B}t)^{-3}`,
              },
              {
                say: 'Put in t = 0.',
                tex: R`E[X^2] = m_X''(0) = ${ex2}`,
              },
              {
                say: 'Variance: E[X²] minus the square of the mean from (b).',
                tex: R`\sigma^2 = E[X^2] - (E[X])^2 = ${ex2} - ${B}^2 = ${ex2} - ${B * B} = ${varX}`,
              },
              {
                say: 'σ is the square root of the variance.',
                tex: R`\sigma = \sqrt{${varX}} = ${B} \text{ ${S.unit}}`,
                why: 'For an exponential the mean and the standard deviation are both β.',
              },
            ],
            trap: `m″(0) = ${ex2} is E[X²], not the variance. You still subtract (E[X])².`,
          },
        ],
      }
    },
  })

  // ---------- 4.2 #23: f(x) = c·x⁻³ on (a, b) ----------
  const PARETO_STORIES = [
    {
      lead: R`Let \(X\) denote the amount of time in hours that a battery on a solar calculator will operate adequately between exposures to light sufficient to recharge the battery. Assume that the density for \(X\) is given by`,
      atMost: x => `the probability that a randomly selected solar battery will last at most ${x} hours before needing to be recharged`,
      avg: 'the average time that a battery will last before needing to be recharged',
      unit: 'hours',
      pairs: [[2, 10], [1, 3], [2, 4], [2, 6], [3, 6], [2, 8], [1, 5]],
    },
    {
      lead: R`Let \(X\) denote the size, in thousands of dollars, of a claim filed with a small insurance company. Assume that the density for \(X\) is given by`,
      atMost: x => `the probability that a randomly selected claim is for at most ${x} thousand dollars`,
      avg: 'the average size of a claim',
      unit: 'thousand dollars',
      pairs: [[1, 3], [1, 4], [1, 5], [2, 6], [2, 8], [2, 10], [5, 10]],
    },
    {
      lead: R`Let \(X\) denote the time in minutes that a visitor who opens an article on a news website stays on the page. Assume that the density for \(X\) is given by`,
      atMost: x => `the probability that a randomly selected visitor stays on the page at most ${x} minutes`,
      avg: 'the average time a visitor stays on the page',
      unit: 'minutes',
      pairs: [[1, 3], [1, 4], [1, 5], [2, 6], [3, 9], [4, 8], [2, 10]],
    },
  ]

  HW.add({
    id: '4.2-23',
    section: '4.2',
    num: '23',
    group: 4,
    title: 'Solar calculator batteries',
    hw: { a: 2, b: 10, x0: 4, s: 0, cShow: [50, 6] },
    twin: () => {
      const s = HW.rand.int(0, PARETO_STORIES.length - 1)
      const [a, b] = HW.rand.pick(PARETO_STORIES[s].pairs)
      return { a, b, x0: HW.rand.int(a + 1, b - 1), s }
    },
    make: v => {
      const { a, b, x0 } = v
      const S = PARETO_STORIES[v.s]
      // c makes the area 1: c·(1/(2a²) − 1/(2b²)) = 1
      const c = Q(2 * a * a * b * b, b * b - a * a)
      // the homework writes c as 50/6; show it the way it's given
      const cS = v.cShow ? { n: v.cShow[0], d: v.cShow[1] } : c
      if (cS.n * c.d !== c.n * cS.d) throw new Error('cShow is not the constant')
      const cT = cS.d === 1 ? String(cS.n) : R`\frac{${cS.n}}{${cS.d}}`
      const cTxt = cS.d === 1 ? String(cS.n) : `${cS.n}/${cS.d}`
      const pdf = x => (x > a && x < b ? qv(c) / x ** 3 : 0)
      const w = b - a
      const graphBase = { kind: 'curve', title: `f(x) = (${cTxt})x⁻³ on (${a}, ${b})`, lo: Math.max(0, a - 0.15 * w), hi: b + 0.1 * w, pdf }

      // (a) the area: 1/(2a²) − 1/(2b²) over a common denominator
      const La = lcm(2 * a * a, 2 * b * b)
      const topA = La / (2 * a * a) - La / (2 * b * b)
      // (b) F(x) = c/(2a²) − c/(2x²)
      const k1 = Q(c.n, c.d * 2 * a * a)
      const k2 = Q(c.n, c.d * 2)
      const k2x = k2.d === 1 ? R`\frac{${k2.n}}{x^2}` : R`\frac{${k2.n}}{${k2.d}x^2}`
      const k2at = k2.d === 1 ? R`\frac{${k2.n}}{${x0}^2}` : R`\frac{${k2.n}}{${k2.d}\cdot ${x0 * x0}}`
      const Fmid = R`${qt(k1)} - ${k2x}`
      const Fx0Q = qsub(k1, Q(k2.n, k2.d * x0 * x0))
      const Fx0 = qv(Fx0Q)
      // (c) E[X] = c(1/a − 1/b)
      const Lm = lcm(a, b)
      const topM = Lm / a - Lm / b
      const mu = Q(2 * a * b, a + b)
      // (d) E[X²] = c ln(b/a)
      const ratio = Q(b, a)
      const lnR = ratio.d === 1 ? R`\ln ${ratio.n}` : R`\ln\left(${qt(ratio)}\right)`
      const e2 = qv(c) * Math.log(b / a)
      const mu2 = qmul(mu, mu)
      const varX = e2 - qv(mu2)
      const sd = Math.sqrt(varX)
      // the arcade's wrong choices
      const cv = qv(c)
      const fTol = probTol(Fx0), e2T = Math.max(0.01, 0.003 * e2), vT = varTol(varX)
      const muR = round(qv(mu), 2), varEarly = e2 - muR * muR // E[X] rounded to 2 decimals before squaring

      return {
        text: R`${S.lead} \[f(x) = ${cT}x^{-3} \qquad ${a} < x < ${b}\]`,
        parts: [
          {
            label: 'a',
            ask: R`Verify that this is a valid continuous density.`,
            skill: 'show-pdf',
            hint: 'Two checks: f(x) is never negative, and the integral of f over its range is 1.',
            check: { type: 'self' },
            answer: R`f(x) > 0 \text{ on } (${a}, ${b}) \text{ and } \int_{${a}}^{${b}} ${cT}x^{-3}\,dx = 1`,
            steps: [
              {
                say: 'A continuous density has to pass two checks: it is never negative, and the total area under it is 1.',
                tex: R`f(x) \ge 0 \text{ for all } x \qquad \text{and} \qquad \int_{${a}}^{${b}} f(x)\,dx = 1`,
              },
              {
                say: R`First check. For \(${a} < x < ${b}\), \(x\) is positive, so \(x^{-3} = 1/x^3\) is positive, and \(${cT}\) is positive.`,
                tex: R`f(x) = ${cT}\cdot\frac{1}{x^3} > 0 \quad \text{for } ${a} < x < ${b}`,
                why: `Outside (${a}, ${b}) the density is 0, which is not negative either.`,
              },
              {
                say: R`Second check: integrate. Power rule: \(x^{-3}\) becomes \(\frac{x^{-2}}{-2} = -\frac{1}{2x^2}\).`,
                tex: R`\int_{${a}}^{${b}} ${cT}x^{-3}\,dx = ${cT}\left[-\frac{1}{2x^2}\right]_{${a}}^{${b}}`,
                why: 'Add 1 to the power (−3 + 1 = −2) and divide by the new power (−2).',
              },
              {
                say: 'Put in the limits, top minus bottom. Minus a minus is a plus, so the bottom term comes out positive. Then use a common denominator.',
                tex: [
                  R`= ${cT}\left[\left(-\frac{1}{2\cdot ${b}^2}\right) - \left(-\frac{1}{2\cdot ${a}^2}\right)\right] = ${cT}\left(\frac{1}{${2 * a * a}} - \frac{1}{${2 * b * b}}\right)`,
                  R`= ${cT}\cdot\frac{${La / (2 * a * a)} - ${La / (2 * b * b)}}{${La}} = ${cT}\cdot\frac{${topA}}{${La}}`,
                ],
              },
              {
                say: 'Multiply out. The area is exactly 1, and f is never negative, so f is a valid density.',
                tex: R`\int_{${a}}^{${b}} f(x)\,dx = ${settle(cS.n * topA, cS.d * La)}`,
              },
            ],
            trap: 'x⁻³ integrates to x⁻²/(−2): add 1 to the power. Going to x⁻⁴ is taking the derivative, not the integral.',
          },
          {
            label: 'b',
            ask: R`Find the expression for the cumulative distribution function for \(X\), and use it to find ${S.atMost(x0)}.`,
            skill: 'cont-cdf',
            hint: 'F(x) = P[X ≤ x] = the integral of f(t) dt from the left end of the range up to x. Then "at most" means F at that number.',
            check: {
              type: 'number',
              value: Fx0,
              tol: fTol,
              wrong: wrongs(Fx0, fTol, [
                1 - Fx0, // the wrong tail, P[X > x0]
                cv / x0 ** 3, // put x0 into f instead of F
                cv * (1 / (4 * a ** 4) - 1 / (4 * x0 ** 4)), // x⁻³ "integrated" to x⁻⁴/(−4)
                (x0 - a) / (b - a), // as if X were uniform
              ], isProb),
            },
            answer: R`F(x) = ${Fmid} \ \ (${a} < x < ${b}), \quad P[X \le ${x0}] = F(${x0}) = ${qt(Fx0Q)} ${dec(Fx0)}`,
            steps: [
              {
                say: R`The cdf is the area to the left of \(x\): \(F(x) = P[X \le x]\). For \(x\) inside the range, integrate \(f\) from the left end, ${a}, up to \(x\). Call the variable inside \(t\) so it doesn't clash with \(x\).`,
                tex: R`F(x) = \int_{${a}}^{x} ${cT}t^{-3}\,dt \qquad ${a} < x < ${b}`,
              },
              {
                say: R`Integrate exactly as in (a), but stop at \(x\) instead of ${b}: top limit \(x\) minus bottom limit ${a}. Then multiply the constant into each term.`,
                tex: [
                  R`F(x) = ${cT}\left[-\frac{1}{2t^2}\right]_{${a}}^{x} = ${cT}\left[\left(-\frac{1}{2x^2}\right) - \left(-\frac{1}{2\cdot ${a}^2}\right)\right]`,
                  R`= ${cT}\cdot\frac{1}{${2 * a * a}} - ${cT}\cdot\frac{1}{2x^2} = ${Fmid}`,
                ],
                why: `Check the ends: F(${a}) = ${qtxt(k1)} − ${qtxt(k1)} = 0, and F(${b}) = 1. A cdf has to run from 0 up to 1.`,
              },
              {
                say: `Write the whole cdf in three pieces: 0 before the range starts, 1 after it ends.`,
                tex: R`F(x) = \begin{cases} 0, & x \le ${a} \\ ${Fmid}, & ${a} < x < ${b} \\ 1, & x \ge ${b} \end{cases}`,
                why: `X is never below ${a}, so no area has piled up yet there; by ${b} all of it has.`,
              },
              {
                say: R`"At most ${x0}" means \(X \le ${x0}\), and that is exactly what \(F(${x0})\) measures.`,
                tex: R`P[X \le ${x0}] = F(${x0}) = ${qt(k1)} - ${k2at} = ${diffTex(k1, Q(k2.n, k2.d * x0 * x0))}`,
                graph: { ...graphBase, shade: [a, x0], ticks: [a, x0, b], note: `shaded: P[X ≤ ${x0}] = F(${x0}) ${decTxt(Fx0)}` },
              },
            ],
            trap: `Don’t drop the lower limit. The integral from ${a} to x is what puts the ${qtxt(k1)} in F(x); without it F(${a}) isn’t 0 and every probability comes out wrong.`,
          },
          {
            label: 'c',
            ask: R`Find ${S.avg}.`,
            skill: 'mean-var',
            hint: 'E[X] = ∫ x·f(x) dx over the range. Simplify x·x⁻³ first.',
            check: {
              type: 'number',
              value: qv(mu),
              tol: 0.005,
              wrong: wrongs(qv(mu), 0.005, [
                (a + b) / 2, // the middle of the range, as if f were flat
                1 / a - 1 / b, // left the constant out
                cv * (1 / (3 * a ** 3) - 1 / (3 * b ** 3)), // x⁻² "integrated" to x⁻³/(−3)
                cv / a, // dropped the top limit
              ]),
            },
            answer: R`E[X] = ${qt(mu)}${mu.d === 1 ? '' : R` ${dec(qv(mu))}`} \text{ ${S.unit}}`,
            steps: [
              {
                say: 'The average is the mean: the integral of x times f(x) over the range.',
                tex: R`E[X] = \int_{${a}}^{${b}} x\,f(x)\,dx`,
              },
              {
                say: R`Put in \(f(x)\): \(x \cdot x^{-3} = x^{-2}\).`,
                tex: R`E[X] = ${cT}\int_{${a}}^{${b}} x^{-2}\,dx`,
              },
              {
                say: R`Power rule: \(x^{-2}\) becomes \(\frac{x^{-1}}{-1} = -\frac{1}{x}\). Then the limits, top minus bottom, and a common denominator.`,
                tex: [
                  R`= ${cT}\left[-\frac{1}{x}\right]_{${a}}^{${b}} = ${cT}\left[\left(-\frac{1}{${b}}\right) - \left(-${over(a)}\right)\right]`,
                  R`= ${cT}\left(${over(a)} - \frac{1}{${b}}\right) = ${cT}\cdot\frac{${Lm / a} - ${Lm / b}}{${Lm}} = ${cT}\cdot\frac{${topM}}{${Lm}}`,
                ],
              },
              {
                say: 'Multiply out.',
                tex: R`E[X] = ${settle(cS.n * topM, cS.d * Lm)}`,
                why: `Check: it is between ${a} and ${b}, and close to ${a}, because the density x⁻³ is piled up near ${a}.`,
                graph: { ...graphBase, ticks: [a, b], marks: [qv(mu)], note: `dashed: the mean ${decTxt(qv(mu), 2)} ${S.unit}` },
              },
            ],
          },
          {
            label: 'd',
            ask: R`Find \(E[X^2]\), and use this to find the variance of \(X\).`,
            skill: 'mean-var',
            hint: 'E[X²] = ∫ x²·f(x) dx. Simplify x²·x⁻³ first: the power rule won’t work on what’s left.',
            check: {
              type: 'numbers',
              items: [
                {
                  label: R`E[X^2]`,
                  value: e2,
                  tol: e2T,
                  wrong: wrongs(e2, e2T, [
                    qv(mu2), // squared the mean instead of integrating
                    cv * Math.log10(b / a), // the calculator's log key (base 10) for ln
                    Math.log(b / a), // left the constant out
                    qv(mu), // integrated x·f(x) again
                  ]),
                },
                {
                  label: R`\sigma^2`,
                  value: varX,
                  tol: vT,
                  wrong: wrongs(varX, vT, [
                    e2 - qv(mu), // E[X²] − E[X]: forgot to square the mean
                    e2, // forgot to subtract (E[X])²
                    sd, // gave σ for σ²
                    varEarly, // rounded E[X] to 2 decimals before squaring
                  ], isPos),
                },
              ],
            },
            answer: R`E[X^2] = ${cT}${lnR} \approx ${num(e2, 4)}, \quad \sigma^2 \approx ${num(varX, 4)}`,
            steps: [
              {
                say: R`\(E[X^2]\) is the integral of \(x^2 f(x)\). Now \(x^2 \cdot x^{-3} = x^{-1} = \frac{1}{x}\).`,
                tex: R`E[X^2] = \int_{${a}}^{${b}} x^2\,f(x)\,dx = ${cT}\int_{${a}}^{${b}} \frac{1}{x}\,dx`,
              },
              {
                say: R`The power rule fails for \(1/x\) (it would divide by 0). The antiderivative of \(1/x\) is \(\ln x\).`,
                tex: R`E[X^2] = ${cT}\Big[\ln x\Big]_{${a}}^{${b}} = ${cT}\left(\ln ${b} - \ln ${a}\right) = ${cT}${lnR}`,
                why: a === 1 ? 'ln 1 = 0.' : `A difference of logs is the log of the quotient: ln ${b} − ln ${a} = ln(${b}/${a}).`,
              },
              {
                say: 'Turn it into a decimal.',
                tex: R`E[X^2] \approx ${num(qv(c), 4)} \times ${num(Math.log(b / a), 6)} \approx ${num(e2, 4)}`,
              },
              {
                say: R`Use the shortcut formula for the variance, with the exact \(E[X]\) from (c). Square it as a fraction, and only then turn each piece into a decimal.`,
                tex: [
                  R`\sigma^2 = E[X^2] - (E[X])^2 = ${cT}${lnR} - ${sqT(mu)} = ${cT}${lnR} - ${qt(mu2)}`,
                  R`\approx ${num(e2, 4)} - ${num(qv(mu2), 4)} \approx ${num(varX, 4)}`,
                ],
                why: Math.abs(varEarly - varX) > vT
                  ? `The two pieces are close together, so an early rounding shows up in the difference: E[X] ≈ ${num(muR, 2)} gives ${num(muR, 2)}² = ${num(muR * muR, 4)} and σ² ≈ ${num(varEarly, 4)}, which is wrong.`
                  : 'The two pieces are close together, so rounding either one early shows up in the difference. Keep 4 decimals in each.',
              },
            ],
            trap: 'x²·x⁻³ is x⁻¹, and the power rule gives x⁰/0 there, which is nonsense. That is the sign to use ln x.',
          },
        ],
      }
    },
  })

  // ---------- 4.2 #24: f(x) = c·x^m on (0, b), demand against supply ----------
  const DEMAND_STORIES = [
    {
      lead: R`Assume that the increase in demand for electric power in millions of kilowatt hours over the next 2 years in a particular area is a random variable whose density is given by`,
      atMost: x => `the probability that the demand will be at most ${x} million kilowatt hours`,
      cap: x => `If the area only has the capacity to generate an additional ${x} million kilowatt hours, what is the probability that demand will exceed supply?`,
      avg: 'the average increase in demand',
      unit: 'million kilowatt hours',
    },
    {
      lead: R`Assume that the weekly demand for gasoline, in thousands of gallons, at a small filling station is a random variable whose density is given by`,
      atMost: x => `the probability that the weekly demand will be at most ${x} thousand gallons`,
      cap: x => `The station’s tank holds ${x} thousand gallons and is filled once a week. What is the probability that demand will exceed supply this week?`,
      avg: 'the average weekly demand',
      unit: 'thousand gallons',
    },
    {
      lead: R`Assume that the increase in daily water demand, in millions of gallons, in a growing city over the next 5 years is a random variable whose density is given by`,
      atMost: x => `the probability that the increase will be at most ${x} million gallons a day`,
      cap: x => `If the city’s treatment plant can supply only ${x} million more gallons a day, what is the probability that demand will exceed supply?`,
      avg: 'the average increase in demand',
      unit: 'million gallons a day',
    },
  ]
  const demandF = (m, b, x) => (x / b) ** (m + 1)

  HW.add({
    id: '4.2-24',
    section: '4.2',
    num: '24',
    group: 4,
    title: 'Demand for electric power',
    hw: { m: 3, b: 4, x1: 2, x2: 3, s: 0 },
    twin: () => {
      for (;;) {
        const m = HW.rand.pick([1, 2, 3])
        const b = HW.rand.pick([3, 4, 5, 6, 8, 10])
        const x1 = HW.rand.int(1, b - 2)
        const x2 = HW.rand.int(x1 + 1, b - 1)
        // keep both answers big enough to read off sensibly
        const big = demandF(m, b, x1) >= 0.02 && 1 - demandF(m, b, x2) >= 0.02
        // f(x) = F(x) exactly at x = m + 1, so there putting x into f (the mistake) gives the right answer
        const telling = x1 !== m + 1 && x2 !== m + 1
        if (big && telling) return { m, b, x1, x2, s: HW.rand.int(0, DEMAND_STORIES.length - 1) }
      }
    },
    make: v => {
      const { m, b, x1, x2 } = v
      const S = DEMAND_STORIES[v.s]
      const p = m + 1 // F(x) = x^p / b^p
      const bp = b ** p
      const c = Q(p, bp)
      const cT = qt(c)
      const F1 = Q(x1 ** p, bp), F2 = Q(x2 ** p, bp)
      const over2 = qsub(Q(1), F2)
      const mu = Q(p * b, m + 2)
      const pdf = x => (x > 0 && x < b ? qv(c) * x ** m : 0)
      const graphBase = { kind: 'curve', title: `f(x) = (${qtxt(c)})${xpTxt(m)} on (0, ${b})`, lo: 0, hi: b * 1.12, pdf }
      const Fx = R`\frac{${xp(p)}}{${bp}}`
      return {
        text: R`${S.lead} \[f(x) = ${cT}${xp(m)} \qquad 0 < x < ${b}\]`,
        parts: [
          {
            label: 'a',
            ask: R`Verify that this is a valid density.`,
            skill: 'show-pdf',
            hint: 'Two checks: f(x) is never negative, and the integral of f from 0 to ' + b + ' is 1.',
            check: { type: 'self' },
            answer: R`f(x) \ge 0 \text{ on } (0, ${b}) \text{ and } \int_0^{${b}} ${cT}${xp(m)}\,dx = 1`,
            steps: [
              {
                say: 'A continuous density has to pass two checks: it is never negative, and the total area under it is 1.',
                tex: R`f(x) \ge 0 \text{ for all } x \qquad \text{and} \qquad \int_0^{${b}} f(x)\,dx = 1`,
              },
              {
                say: R`First check. For \(0 < x < ${b}\), \(${xp(m)}\) is positive, and \(${cT}\) is positive, so \(f(x) > 0\).`,
                tex: R`f(x) = ${cT}${xp(m)} > 0 \quad \text{for } 0 < x < ${b}`,
                why: `Outside (0, ${b}) the density is 0, which is not negative either.`,
              },
              {
                say: 'Second check: integrate with the power rule (add 1 to the power, divide by the new power). Then the limits, top minus bottom.',
                tex: R`\int_0^{${b}} ${cT}${xp(m)}\,dx = ${cT}\left[\frac{${xp(p)}}{${p}}\right]_0^{${b}} = ${cT}\cdot\frac{${b}^{${p}} - 0^{${p}}}{${p}} = ${cT}\cdot\frac{${bp}}{${p}}`,
              },
              {
                say: 'Multiply out. The area is exactly 1, and f is never negative, so f is a valid density.',
                tex: R`\int_0^{${b}} f(x)\,dx = ${settle(c.n * bp, c.d * p)}`,
              },
            ],
          },
          {
            label: 'b',
            ask: R`Find the expression for the cumulative distribution for \(X\), and use it to find ${S.atMost(x1)}.`,
            skill: 'cont-cdf',
            hint: 'F(x) = the integral of f(t) dt from 0 up to x. Then "at most" means F at that number.',
            check: {
              type: 'number',
              value: qv(F1),
              tol: probTol(qv(F1)),
              wrong: wrongs(qv(F1), probTol(qv(F1)), [
                1 - qv(F1), // the wrong tail, P[X > x1]
                qv(c) * x1 ** m, // put x1 into f instead of F
                qv(c) * x1 ** p, // didn't divide by the new power
                x1 / b, // as if X were uniform
              ], isProb),
            },
            answer: R`F(x) = ${Fx} \ \ (0 < x < ${b}), \quad P[X \le ${x1}] = F(${x1}) = ${qt(F1)} ${dec(qv(F1))}`,
            steps: [
              {
                say: R`The cdf is the area to the left of \(x\): \(F(x) = P[X \le x]\). For \(x\) inside the range, integrate \(f\) from 0 up to \(x\). Call the variable inside \(t\) so it doesn't clash with \(x\).`,
                tex: R`F(x) = \int_0^{x} ${cT}${m === 1 ? 't' : `t^{${m}}`}\,dt \qquad 0 < x < ${b}`,
              },
              {
                say: R`Integrate as in (a), but stop at \(x\) instead of ${b}: top limit \(x\) minus bottom limit 0.`,
                tex: R`F(x) = ${cT}\left[\frac{t^{${p}}}{${p}}\right]_0^{x} = ${cT}\left(\frac{${xp(p)}}{${p}} - \frac{0^{${p}}}{${p}}\right) = ${cT}\cdot\frac{${xp(p)}}{${p}} = ${Fx}`,
                why: `Check the ends: F(0) = 0 and F(${b}) = ${b}${supTxt(p)}/${bp} = 1. A cdf has to run from 0 up to 1.`,
              },
              {
                say: 'Write the whole cdf in three pieces: 0 before the range starts, 1 after it ends.',
                tex: R`F(x) = \begin{cases} 0, & x \le 0 \\ ${Fx}, & 0 < x < ${b} \\ 1, & x \ge ${b} \end{cases}`,
              },
              {
                say: R`"At most ${x1}" means \(X \le ${x1}\), and that is exactly what \(F(${x1})\) measures.`,
                tex: R`P[X \le ${x1}] = F(${x1}) = \frac{${x1}^{${p}}}{${bp}} = ${settle(x1 ** p, bp)}`,
                graph: { ...graphBase, shade: [0, x1], ticks: [0, x1, b], note: `shaded: P[X ≤ ${x1}] = F(${x1}) ${decTxt(qv(F1))}` },
              },
            ],
            trap: `F(x) is ${xpTxt(p)}/${bp}, not f(x) = (${qtxt(c)})${xpTxt(m)}. P[X ≤ ${x1}] is an area, so it comes from F, never from putting ${x1} into f.`,
          },
          {
            label: 'c',
            ask: S.cap(x2),
            skill: 'cont-prob',
            hint: `Demand exceeds supply when X > ${x2}. That is the opposite of X ≤ ${x2}, which the cdf gives you.`,
            check: {
              type: 'number',
              value: qv(over2),
              tol: probTol(qv(over2)),
              wrong: wrongs(qv(over2), probTol(qv(over2)), [
                qv(F2), // F(x2): the chance demand stays within supply
                qv(c) * x2 ** m, // f(x2)
                1 - qv(c) * x2 ** m, // 1 − f(x2): the pdf where the cdf belongs
                (b - x2) / b, // as if X were uniform
              ], isProb),
            },
            answer: R`P[X > ${x2}] = 1 - F(${x2}) = ${qt(over2)} ${dec(qv(over2))}`,
            steps: [
              {
                say: R`Demand exceeds supply when it is more than ${x2}, that is \(X > ${x2}\). That is the opposite of \(X \le ${x2}\), so use the cdf.`,
                tex: R`P[X > ${x2}] = 1 - P[X \le ${x2}] = 1 - F(${x2})`,
                why: `For a continuous X, P[X = ${x2}] = 0, so > and ≥ give the same answer.`,
              },
              {
                say: R`Find \(F(${x2})\) from the cdf in (b).`,
                tex: R`F(${x2}) = \frac{${x2}^{${p}}}{${bp}} = ${settle(x2 ** p, bp)}`,
              },
              {
                say: 'Subtract from 1.',
                tex: R`P[X > ${x2}] = ${diffTex(Q(1), F2)}`,
                graph: { ...graphBase, shade: [x2, b], ticks: [0, x2, b], note: `shaded: P[X > ${x2}] = 1 − F(${x2}) ${decTxt(qv(over2))}` },
              },
            ],
            trap: `F(${x2}) is the chance demand stays within supply. The question asks for the opposite, so subtract it from 1.`,
          },
          {
            label: 'd',
            ask: R`Find ${S.avg}.`,
            skill: 'mean-var',
            hint: 'The average is E[X] = ∫ x·f(x) dx over the range.',
            check: {
              type: 'number',
              value: qv(mu),
              tol: 0.005,
              wrong: wrongs(qv(mu), 0.005, [
                b / 2, // the middle of the range, as if f were flat
                qv(c) * b ** (m + 2), // didn't divide by the new power
                b ** (m + 2) / (m + 2), // left the constant out
                1, // integrated f(x) alone: that is the total area
              ]),
            },
            answer: R`E[X] = ${qt(mu)}${mu.d === 1 ? '' : R` ${dec(qv(mu))}`} \text{ ${S.unit}}`,
            steps: [
              {
                say: 'The average is the mean: the integral of x times f(x) over the range.',
                tex: R`E[X] = \int_0^{${b}} x\,f(x)\,dx`,
              },
              {
                say: R`Put in \(f(x)\): \(x \cdot ${xp(m)} = ${xp(m + 1)}\).`,
                tex: R`E[X] = ${cT}\int_0^{${b}} ${xp(m + 1)}\,dx`,
              },
              {
                say: 'Power rule, then the limits, top minus bottom.',
                tex: R`= ${cT}\left[\frac{x^{${m + 2}}}{${m + 2}}\right]_0^{${b}} = ${cT}\cdot\frac{${b}^{${m + 2}} - 0^{${m + 2}}}{${m + 2}} = ${cT}\cdot\frac{${b ** (m + 2)}}{${m + 2}}`,
              },
              {
                say: 'Multiply out.',
                tex: R`E[X] = ${settle(c.n * b ** (m + 2), c.d * (m + 2))}`,
                why: `Check: it is between 0 and ${b}, and closer to ${b}, because f(x) grows with x.`,
                graph: { ...graphBase, ticks: [0, b], marks: [qv(mu)], note: `dashed: the mean ${num(qv(mu), 2)} ${S.unit}` },
              },
            ],
          },
        ],
      }
    },
  })
})()
