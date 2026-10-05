// Group 3: continuous pdfs and cdfs (4.1 #1, 4, 10, 13, 14)
;(() => {
  const R = String.raw
  const { num, fix, frac, fracText, rand } = HW
  const dedupe = xs => [...new Set(xs)]
  // '=' when the 4-decimal value is exact, '\approx' when it is rounded
  const eqOr = x => (Math.abs(x - +num(x, 4)) < 1e-12 ? '=' : R`\approx`)
  // '= 0.5' when exact, '\approx 0.4150' (always 4 places) when rounded
  const ap = x => (Math.abs(x - +num(x, 4)) < 1e-12 ? `= ${num(x, 4)}` : R`\approx ${fix(x, 4)}`)
  // the arcade's wrong choices, most common mistake first: drop any that land on the
  // answer (within 2 tol) or repeat, keep at most 5
  const wrongs = (value, tol, xs) => {
    const seen = new Set(), out = []
    for (const x of xs) {
      if (!Number.isFinite(x) || Math.abs(x - value) <= tol * 2) continue
      const k = +x.toPrecision(4)
      if (!seen.has(k)) seen.add(k), out.push(x)
    }
    return out.slice(0, 5)
  }

  // ======================= 4.1 #1: f(x) = kx on [2, 4] =======================
  // f(x) = k·x^m on [lo, hi]. The area is k·(hi^(m+1) − lo^(m+1))/(m+1), so k = (m+1)/D with
  // D = hi^(m+1) − lo^(m+1). Every twin keeps D a whole number so k is a clean fraction.
  const POWER_FNS = [
    [1, 0, 2], [1, 1, 3], [1, 0, 4], [1, 3, 5], [1, 1, 5], [1, 0, 3], [1, 2, 6], [1, 1, 4], [1, 4, 6], [1, 0, 1],
    [2, 0, 3], [2, 0, 2], [2, 1, 2], [2, 0, 1], [2, 1, 3],
    [3, 0, 2], [3, 0, 1], [3, 1, 2],
  ]
  const xPow = m => (m === 1 ? 'x' : `x^${m}`)
  const xPowText = m => ['', 'x', 'x²', 'x³'][m]

  HW.add({
    id: '4.1-1',
    section: '4.1',
    num: '1',
    group: 3,
    title: 'Find k, then areas',
    hw: { m: 1, lo: 2, hi: 4, a: 2.5, b: 3, open: false },
    twin: () => {
      for (;;) {
        const [m, lo, hi] = rand.pick(POWER_FNS)
        // quarter steps only for a straight-line f on a short range, so the powers stay easy
        const step = m === 1 && hi - lo < 2 ? 0.25 : 0.5
        const n = Math.round((hi - lo) / step)
        const i = rand.int(0, n - 1), j = rand.int(i + 1, n)
        if (i === 0 && j === n) continue
        const a = +(lo + i * step).toFixed(4), b = +(lo + j * step).toFixed(4)
        const P = (b ** (m + 1) - a ** (m + 1)) / (hi ** (m + 1) - lo ** (m + 1))
        if (P < 0.05 || P > 0.95) continue
        return { m, lo, hi, a, b, open: rand.chance(0.5) }
      }
    },
    make: v => {
      const { m, lo, hi, a, b, open } = v
      const p1 = m + 1
      const D = hi ** p1 - lo ** p1
      const k = p1 / D, kT = frac(p1, D), areaT = frac(D, p1)
      const fT = `${kT}${xPow(m)}`
      // P = (b^(m+1) − a^(m+1))/D, kept exact by scaling a and b to whole numbers
      const sc = [1, 2, 4].find(s => Number.isInteger(s * a) && Number.isInteger(s * b))
      const top = Math.round((sc * b) ** p1) - Math.round((sc * a) ** p1), bottom = sc ** p1 * D
      const P = top / bottom, PT = frac(top, bottom)
      const A = num(a), B = num(b)
      const dn = x => num(x, 8)
      const kTxt = fracText(p1, D)
      const fTitle = `f(x) = ${kTxt.includes('/') ? `(${kTxt})` : kTxt}${xPowText(m)}`
      const w = hi - lo
      const fGraph = (shade, ticks, note) => ({ kind: 'curve', title: fTitle, lo: lo - 0.2 * w, hi: hi + 0.2 * w, pdf: x => (x >= lo && x <= hi ? k * x ** m : 0), shade, ticks, note })
      const dP = `${eqOr(P)} ${num(P, 4)}`
      const fa = k * a ** m, fb = k * b ** m
      // the cdf inside the range, for the wrong choices
      const Fx = x => (x ** p1 - lo ** p1) / D
      // (b − a powers)/D: what k·(…)/(m+1) multiplies out to, shown when it isn't already PT
      const diff = b ** p1 - a ** p1
      const midT = R`\frac{${dn(diff)}}{${D}}`
      // the usual slips on an area: F(b) alone, the complement, the wrong k (1/D from
      // forgetting the 1/(m+1)), the 1/(m+1) left out, k left out, heights instead of area
      const areaWrong = [Fx(b), 1 - P, P / p1, P * p1, diff / p1, fb - fa]
      return {
        text: R`Consider the function \[f(x) = k${xPow(m)} \qquad ${lo} \le x \le ${hi}\]`,
        parts: [
          {
            label: 'a',
            ask: R`Find the value of \(k\) that makes this a density for a continuous random variable.`,
            skill: 'find-c',
            hint: R`Integrate \(k${xPow(m)}\) from ${lo} to ${hi} with \(k\) left in, and set the area equal to 1.`,
            // wrong k: 1/D (the 1/(m+1) forgotten), the bottom limit dropped, the height
            // f(hi) set to 1 instead of the area, the area's number itself, f taken as flat,
            // the bottom limit added instead of subtracted
            check: { type: 'number', value: k, tol: 0.0005, wrong: wrongs(k, 0.0005, [1 / D, p1 / hi ** p1, 1 / hi ** m, D / p1, 1 / (hi - lo), p1 / (hi ** p1 + lo ** p1)]) },
            answer: R`k = ${kT}`,
            steps: [
              {
                say: 'A density has two jobs: it is never negative, and the total area under it is 1. The area is what pins down k.',
                tex: R`\int_{${lo}}^{${hi}} k${xPow(m)}\,dx = 1`,
                why: R`\(${xPow(m)}\) is never negative for \(${lo} \le x \le ${hi}\), so \(f \ge 0\) as long as \(k\) is positive. The first job takes care of itself.`,
              },
              {
                say: R`Pull \(k\) out front and integrate. The antiderivative of \(${xPow(m)}\) is \(\frac{x^${p1}}{${p1}}\).`,
                tex: R`k\left[\frac{x^${p1}}{${p1}}\right]_{${lo}}^{${hi}} = k\left(\frac{${hi}^${p1}}{${p1}} - \frac{${lo}^${p1}}{${p1}}\right) = k\cdot\frac{${hi ** p1} - ${lo ** p1}}{${p1}} = ${areaT === '1' ? '' : areaT}k`,
                why: lo === 0 ? 'Put in the top limit, then subtract the value at the bottom limit (here it is 0).' : 'Put in the top limit, then subtract the value at the bottom limit.',
              },
              {
                say: 'Set the area equal to 1 and solve for k.',
                tex: R`${areaT === '1' ? '' : areaT}k = 1 \quad\Rightarrow\quad k = ${kT}${Number.isInteger(k) ? '' : R` ${eqOr(k)} ${num(k, 4)}`}`,
                graph: fGraph([lo, hi], [lo, hi], `the whole shaded area is 1 when k = ${kTxt}`),
              },
            ],
            trap: lo > 0
              ? R`Don't drop the bottom limit: the area is \(k\left(\frac{${hi}^${p1}}{${p1}} - \frac{${lo}^${p1}}{${p1}}\right)\), not just \(k\cdot\frac{${hi}^${p1}}{${p1}}\).`
              : R`It is the area that must be 1, not the height: setting \(f(${hi}) = k\cdot ${hi}${m === 1 ? '' : `^${m}`} = 1\) gives the wrong \(k\).`,
          },
          {
            label: 'b',
            ask: R`Find \(P[${A} \le X \le ${B}]\).`,
            skill: 'cont-prob',
            hint: R`Probability is area: integrate \(f(x)\) from ${A} to ${B}, using the \(k\) from (a).`,
            check: { type: 'number', value: P, tol: 0.0005, wrong: wrongs(P, 0.0005, areaWrong) },
            answer: R`P[${A} \le X \le ${B}] = ${PT} ${dP}`,
            steps: [
              {
                say: R`For a continuous random variable, a probability is an area under the density. Integrate \(f\) from ${A} to ${B}.`,
                tex: R`P[${A} \le X \le ${B}] = \int_{${A}}^{${B}} ${fT}\,dx`,
                why: 'f(x) itself is a height, not a probability. Only the area under it is a probability.',
                graph: fGraph([a, b], dedupe([lo, a, b, hi]), `shaded: P[${A} ≤ X ≤ ${B}] ≈ ${num(P, 4)}`),
              },
              {
                say: 'Pull the constant out and use the same antiderivative as in (a).',
                tex: R`= ${kT}\left[\frac{x^${p1}}{${p1}}\right]_{${A}}^{${B}} = ${kT}\cdot\frac{${B}^${p1} - ${A}^${p1}}{${p1}}`,
              },
              {
                say: 'Work out the powers, then multiply.',
                tex: R`= ${kT}\cdot\frac{${dn(b ** p1)} - ${dn(a ** p1)}}{${p1}} = ${kT}\cdot\frac{${dn(diff)}}{${p1}}${D === 1 || midT === PT ? '' : ` = ${midT}`} = ${PT} ${dP}`,
              },
            ],
            trap: R`Don't use \(f(${B}) - f(${A})\): that is a difference of heights, not an area. Integrate.`,
          },
          {
            label: 'c',
            ask: R`Find \(P[X = ${A}]\).`,
            skill: 'cont-prob',
            hint: R`Write \(P[X = ${A}]\) as an integral of \(f\). What are its two limits?`,
            // f(a) (a height read as a probability), F(a) = P[X ≤ a], the (b) answer, P[X ≥ a]
            check: { type: 'number', value: 0, tol: 0.0001, wrong: wrongs(0, 0.0001, [fa, Fx(a), P, 1 - Fx(a)]) },
            answer: R`P[X = ${A}] = 0`,
            steps: [
              {
                say: R`The event \(X = ${A}\) is the interval from ${A} to ${A}, so its probability is an integral from ${A} to ${A}.`,
                tex: R`P[X = ${A}] = P[${A} \le X \le ${A}] = \int_{${A}}^{${A}} ${fT}\,dx`,
              },
              {
                say: 'Both limits are the same, so the integral is 0: a single point has no width, so no area.',
                tex: R`= ${kT}\cdot\frac{${A}^${p1} - ${A}^${p1}}{${p1}} = 0`,
                why: 'This holds for every continuous random variable: P[X = c] = 0 for any single value c.',
              },
            ],
            ...(fa > 0 ? { trap: R`\(f(${A}) ${eqOr(fa)} ${num(fa, 4)}\) is the height of the density at ${A}, not a probability. For a continuous \(X\), \(P[X = ${A}] = 0\).` } : {}),
          },
          {
            label: 'd',
            ask: open ? R`Find \(P[${A} < X < ${B}]\).` : R`Find \(P[${A} < X \le ${B}]\).`,
            skill: 'cont-prob',
            hint: open ? R`Compare with (b). How much probability sits on the single points ${A} and ${B}?` : R`Compare with (b). How much probability sits on the single point ${A}?`,
            // as in (b), plus subtracting the height f(a) at the left end (when that stays positive)
            check: { type: 'number', value: P, tol: 0.0005, wrong: wrongs(P, 0.0005, [Fx(b), 1 - P, ...(P - fa > 0 ? [P - fa] : []), P / p1, P * p1, diff / p1]) },
            answer: open ? R`P[${A} < X < ${B}] = ${PT} ${dP}` : R`P[${A} < X \le ${B}] = ${PT} ${dP}`,
            steps: open
              ? [
                  {
                    say: R`The interval in (b) is the interval here plus the two end points.`,
                    tex: R`P[${A} \le X \le ${B}] = P[X = ${A}] + P[${A} < X < ${B}] + P[X = ${B}]`,
                  },
                  {
                    say: R`Each single point has probability 0, as in (c), so removing them changes nothing.`,
                    tex: R`P[${A} < X < ${B}] = ${PT} - 0 - 0 = ${PT} ${dP}`,
                    why: 'For a continuous X, < and ≤ give the same probability. For a discrete X they usually don’t.',
                  },
                ]
              : [
                  {
                    say: R`The interval in (b) is the single point ${A} plus the interval here.`,
                    tex: R`P[${A} \le X \le ${B}] = P[X = ${A}] + P[${A} < X \le ${B}]`,
                  },
                  {
                    say: R`\(P[X = ${A}] = 0\) from (c), so removing it changes nothing.`,
                    tex: R`P[${A} < X \le ${B}] = ${PT} - 0 = ${PT} ${dP}`,
                    why: 'For a continuous X, < and ≤ give the same probability. For a discrete X they usually don’t.',
                  },
                ],
            trap: 'Don’t subtract f at the endpoint. An endpoint carries probability 0, not f(endpoint).',
          },
        ],
      }
    },
  })

  // ======================= 4.1 #4 and #13: f(x) = 1/(x ln c) on [a, ca] =======================
  // The area from lo to hi is (ln hi − ln lo)/ln c = ln(hi/lo)/ln c, and the cdf is (ln x − ln a)/ln c.
  const LOG_STORIES = [
    {
      intro: R`Some plastics in scrapped cars can be stripped out and broken down to recover the chemical components. The greatest success has been in processing the flexible polyurethane cushioning found in these cars. Let \(X\) denote the amount of this material, in pounds, found per car.`,
      between: (lo, hi) => `a randomly selected auto will contain between ${lo} and ${hi} pounds of polyurethane cushioning`,
      ac: [[25, 2], [20, 2], [30, 2], [20, 3]],
    },
    {
      intro: R`Recyclers strip the copper tubing and wiring out of scrapped window air conditioners. Let \(X\) denote the amount of copper, in pounds, recovered from one unit.`,
      between: (lo, hi) => `a randomly selected air conditioner yields between ${lo} and ${hi} pounds of copper`,
      ac: [[2, 3], [3, 2], [4, 2], [2, 4], [3, 3]],
    },
    {
      intro: R`A repair shop times how long its technicians take to replace a cracked phone screen. Let \(X\) denote the time, in minutes, that one repair takes.`,
      between: (lo, hi) => `a repair takes between ${lo} and ${hi} minutes`,
      ac: [[10, 3], [15, 2], [20, 2], [20, 3], [10, 4]],
    },
    {
      intro: R`A state hatchery stocks a pond with trout. Let \(X\) denote the length, in centimeters, of a trout caught in the pond.`,
      between: (lo, hi) => `a randomly caught trout is between ${lo} and ${hi} centimeters long`,
      ac: [[20, 2], [25, 2], [30, 2]],
    },
    {
      intro: R`A photo-sharing site records the size of every uploaded photo. Let \(X\) denote the size, in megabytes, of a randomly chosen upload.`,
      between: (lo, hi) => `a randomly chosen photo is between ${lo} and ${hi} megabytes`,
      // a > 1 always: with a = 1, ln a = 0 and the wrong choice ln x/ln c would be right
      ac: [[2, 4], [2, 5], [3, 4]],
    },
  ]
  const logTwin = () => {
    const s = rand.int(0, LOG_STORIES.length - 1)
    const [a, c] = rand.pick(LOG_STORIES[s].ac)
    const step = a >= 10 ? 5 : 1
    const grid = []
    for (let x = a; x <= c * a; x += step) grid.push(x)
    let i, j
    do {
      i = rand.int(0, grid.length - 2)
      j = rand.int(i + 1, grid.length - 1)
    } while (i === 0 && j === grid.length - 1)
    return { s, a, c, lo: grid[i], hi: grid[j] }
  }
  const logBits = v => {
    const { a, c, lo, hi } = v
    const ca = c * a, lnc = Math.log(c), w = ca - a
    const fx = x => (x >= a && x <= ca ? 1 / (x * lnc) : 0)
    const Fx = x => (x < a ? 0 : x > ca ? 1 : Math.log(x / a) / lnc)
    return {
      ca, lnc, fx, Fx,
      P: Math.log(hi / lo) / lnc,
      lnRatio: Number.isInteger(hi / lo) ? R`\ln ${hi / lo}` : R`\ln\left(${frac(hi, lo)}\right)`,
      fTex: R`\frac{1}{\ln ${c}}\,\frac{1}{x}`,
      density: R`\[f(x) = \frac{1}{\ln ${c}}\,\frac{1}{x} \qquad ${a} \le x \le ${ca}\]`,
      gLo: a - 0.12 * w,
      gHi: ca + 0.12 * w,
    }
  }
  // the usual slips on P[lo ≤ X ≤ hi]: F(hi) alone, the complement, the 1/ln c left out,
  // ln lo − ln hi (limits reversed), P[X ≥ lo], heights f(lo) − f(hi) instead of area
  const logWrong = (v, { P, Fx, fx }) => {
    const { lo, hi } = v
    return { b4: wrongs(P, 0.0005, [Fx(hi), 1 - P, Math.log(hi / lo), -P, fx(lo) - fx(hi)]), b13: wrongs(P, 0.0005, [Fx(hi), 1 - P, -P, 1 - Fx(lo), Math.log(hi / lo)]) }
  }

  HW.add({
    id: '4.1-4',
    section: '4.1',
    num: '4',
    group: 3,
    title: 'Polyurethane per car',
    hw: { s: 0, a: 25, c: 2, lo: 30, hi: 40 },
    twin: logTwin,
    make: v => {
      const { a, c, lo, hi } = v
      const S = LOG_STORIES[v.s]
      const bits = logBits(v)
      const { ca, lnc, fx, P, lnRatio, fTex, density, gLo, gHi } = bits
      const fGraph = (shade, ticks, note) => ({ kind: 'curve', title: `f(x) = 1/(x ln ${c}), ${a} ≤ x ≤ ${ca}`, lo: gLo, hi: gHi, pdf: fx, shade, ticks, note })
      const smaller = c === 2 ? 'half as tall as' : R`\(\frac{1}{${c}}\) as tall as`
      return {
        text: R`${S.intro} Assume that the density for \(X\) is given by ${density}`,
        parts: [
          {
            label: 'a',
            ask: R`Verify that \(f\) is a density for a continuous random variable.`,
            skill: 'show-pdf',
            hint: R`Two checks: is \(f\) ever negative? And does its integral from ${a} to ${ca} come out to 1?`,
            check: { type: 'self' },
            answer: R`\begin{gathered} f(x) > 0 \text{ on } ${a} \le x \le ${ca} \\ \int_{${a}}^{${ca}} f(x)\,dx = \frac{\ln ${c}}{\ln ${c}} = 1 \end{gathered}`,
            steps: [
              {
                say: 'A density has to pass two checks: f(x) ≥ 0 everywhere, and the total area under it is 1.',
                tex: R`f(x) \ge 0 \quad\text{and}\quad \int_{${a}}^{${ca}} f(x)\,dx = 1`,
              },
              {
                say: R`\(f\) is never negative: on \(${a} \le x \le ${ca}\), \(x\) is positive and \(\ln ${c} \approx ${num(lnc, 4)}\) is positive. Outside that range \(f\) is 0.`,
                tex: R`x > 0,\ \ln ${c} > 0 \quad\Rightarrow\quad f(x) = \frac{1}{x \ln ${c}} > 0`,
                why: R`\(\ln ${c}\) is positive because ${c} is bigger than 1 (\(\ln 1 = 0\), and \(\ln\) grows).`,
              },
              {
                say: R`Set up the area. \(\frac{1}{\ln ${c}}\) is just a number, so pull it out of the integral.`,
                tex: R`\int_{${a}}^{${ca}} \frac{1}{\ln ${c}}\,\frac{1}{x}\,dx = \frac{1}{\ln ${c}}\int_{${a}}^{${ca}} \frac{1}{x}\,dx`,
              },
              {
                say: R`The antiderivative of \(\frac{1}{x}\) is \(\ln x\).`,
                tex: R`= \frac{1}{\ln ${c}}\Big[\ln x\Big]_{${a}}^{${ca}} = \frac{\ln ${ca} - \ln ${a}}{\ln ${c}}`,
              },
              {
                say: R`Use the log rule \(\ln A - \ln B = \ln(A/B)\): \(\ln ${ca} - \ln ${a} = \ln(${ca}/${a}) = \ln ${c}\).`,
                tex: R`= \frac{\ln(${ca}/${a})}{\ln ${c}} = \frac{\ln ${c}}{\ln ${c}} = 1`,
                why: 'Both checks pass, so f is a density.',
                graph: fGraph([a, ca], [a, ca], 'the whole shaded area is 1'),
              },
            ],
          },
          {
            label: 'b',
            ask: R`Use \(f\) to find the probability that ${S.between(lo, hi)}.`,
            skill: 'cont-prob',
            hint: R`Integrate \(f\) from ${lo} to ${hi}. The antiderivative of \(\frac{1}{x}\) is \(\ln x\).`,
            check: { type: 'number', value: P, tol: 0.0005, wrong: logWrong(v, bits).b4 },
            answer: R`P[${lo} \le X \le ${hi}] = \frac{${lnRatio}}{\ln ${c}} ${ap(P)}`,
            steps: [
              {
                say: R`Probability is area under \(f\): integrate from ${lo} to ${hi}.`,
                tex: R`P[${lo} \le X \le ${hi}] = \int_{${lo}}^{${hi}} ${fTex}\,dx`,
              },
              {
                say: 'Same antiderivative as in (a).',
                tex: R`= \frac{1}{\ln ${c}}\Big[\ln x\Big]_{${lo}}^{${hi}} = \frac{\ln ${hi} - \ln ${lo}}{\ln ${c}}`,
              },
              {
                say: R`Combine the logs with \(\ln A - \ln B = \ln(A/B)\), then work it out.`,
                tex: R`= \frac{${lnRatio}}{\ln ${c}} \approx \frac{${fix(Math.log(hi / lo), 4)}}{${num(lnc, 4)}} ${ap(P)}`,
              },
            ],
            trap: R`Don't plug into \(f\): \(f(${hi}) - f(${lo})\) is a difference of heights, not an area.`,
          },
          {
            label: 'c',
            ask: R`Sketch the graph of \(f\), and indicate in the sketch the area corresponding to the probability found in part (b).`,
            skill: 'cont-prob',
            hint: R`Find \(f\) at the two ends, ${a} and ${ca}, and decide whether \(f\) goes up or down in between.`,
            check: { type: 'self' },
            answer: R`\begin{gathered} \text{a falling curve from } f(${a}) \approx ${fix(fx(a), 4)} \text{ to } f(${ca}) \approx ${fix(fx(ca), 4)} \\ \text{shaded from ${lo} to ${hi}: area } ${ap(P)} \end{gathered}`,
            steps: [
              {
                say: 'Find the height of f at the two ends of its range.',
                tex: R`f(${a}) = \frac{1}{${a}\ln ${c}} \approx ${fix(fx(a), 4)}, \qquad f(${ca}) = \frac{1}{${ca}\ln ${c}} \approx ${fix(fx(ca), 4)}`,
                why: R`${ca} is ${c} times ${a}, so the right end is ${smaller} the left end.`,
              },
              {
                say: R`Get the shape: \(\frac{1}{x}\) falls as \(x\) grows and flattens out, so \(f\) is a gently falling curve from ${a} to ${ca}. It is 0 outside that range.`,
                why: 'There are no bumps: 1/x only goes down, a little less steeply each step.',
              },
              {
                say: R`Shade the region under the curve between \(x = ${lo}\) and \(x = ${hi}\). Its area is the probability from (b).`,
                tex: R`\text{shaded area} = P[${lo} \le X \le ${hi}] ${ap(P)}`,
                graph: fGraph([lo, hi], dedupe([a, lo, hi, ca]), `shaded: P[${lo} ≤ X ≤ ${hi}] ≈ ${fix(P, 4)}`),
              },
            ],
          },
        ],
      }
    },
  })

  // ======================= 4.1 #10: the uniform cdf =======================
  // The homework is letters only (a, b). A twin puts in numbers and adds a probability from F.
  const UNI_STORIES = [
    {
      intro: (A, B) => R`A commuter train is due at 8:00 but always runs late: it arrives at a random time between ${A} and ${B} minutes after 8:00, with every moment in that window equally likely. Let \(X\) be how many minutes after 8:00 the train arrives.`,
      between: (c, d) => `the train arrives between ${c} and ${d} minutes after 8:00`,
      more: c => `the train arrives more than ${c} minutes after 8:00`,
      less: c => `the train arrives less than ${c} minutes after 8:00`,
      A: [1, 2, 3, 4, 5], W: [4, 5, 6, 8, 10], step: () => 1,
    },
    {
      intro: (A, B) => R`An inspection finds that a pipeline has a leak somewhere between mile marker ${A} and mile marker ${B}, equally likely to be anywhere in that stretch. Let \(X\) be the mile marker where the leak is.`,
      between: (c, d) => `a crew searching from mile marker ${c} to mile marker ${d} will find the leak`,
      more: c => `the leak is past mile marker ${c}`,
      less: c => `the leak is before mile marker ${c}`,
      A: [10, 20, 30, 40], W: [10, 20, 40], step: w => w / 10,
    },
    {
      intro: (A, B) => R`A pizza shop's delivery time is equally likely to be anything between ${A} and ${B} minutes. Let \(X\) be the delivery time, in minutes, of the next order.`,
      between: (c, d) => `the delivery takes between ${c} and ${d} minutes`,
      more: c => `the delivery takes more than ${c} minutes`,
      less: c => `the delivery takes less than ${c} minutes`,
      A: [20, 25, 30], W: [10, 15, 20], step: () => 1,
    },
  ]
  // the derivation, with a, b, b − a either letters or numbers
  const uniformSteps = (aT, bT, wT, graph) => {
    const cases = R`F(x) = \begin{cases} 0 & x \le ${aT} \\ \dfrac{x - ${aT}}{${wT}} & ${aT} < x < ${bT} \\ 1 & x \ge ${bT} \end{cases}`
    return {
      cases,
      steps: [
        {
          say: R`The cdf is all the area under \(f\) to the left of \(x\).`,
          tex: R`F(x) = P[X \le x] = \int_{-\infty}^{x} f(t)\,dt`,
          why: 'The letter inside the integral is t, because x is already being used as the top limit.',
        },
        {
          say: R`For \(x \le ${aT}\): \(f\) is 0 there, so no probability has built up yet.`,
          tex: R`F(x) = \int_{-\infty}^{x} 0\,dt = 0`,
        },
        {
          say: R`For \(${aT} < x < ${bT}\): left of \(${aT}\) the density is 0 and adds nothing, so integrate the flat density from \(${aT}\) up to \(x\). The antiderivative of the constant \(\frac{1}{${wT}}\) is \(\frac{t}{${wT}}\).`,
          tex: R`F(x) = \int_{${aT}}^{x} \frac{1}{${wT}}\,dt = \frac{t}{${wT}}\Big|_{${aT}}^{x} = \frac{x}{${wT}} - \frac{${aT}}{${wT}} = \frac{x - ${aT}}{${wT}}`,
          why: R`The area is a rectangle: width \(x - ${aT}\) times height \(\frac{1}{${wT}}\).`,
        },
        {
          say: R`For \(x \ge ${bT}\): all the probability has built up, so \(F(x) = 1\).`,
          tex: R`F(x) = \int_{${aT}}^{${bT}} \frac{1}{${wT}}\,dt = \frac{t}{${wT}}\Big|_{${aT}}^{${bT}} = \frac{${bT} - ${aT}}{${wT}} = 1`,
          why: R`Past \(${bT}\), \(f\) is 0, so there is no more area to add: the whole area, 1, is already to the left.`,
        },
        {
          say: 'Put the three pieces together.',
          tex: cases,
          why: R`Check the seams: the middle piece is 0 at \(x = ${aT}\) and 1 at \(x = ${bT}\), so \(F\) has no jumps.`,
          graph,
        },
      ],
    }
  }
  const uniF = (A, B) => x => (x <= A ? 0 : x >= B ? 1 : (x - A) / (B - A))

  HW.add({
    id: '4.1-10',
    section: '4.1',
    num: '10',
    group: 3,
    title: 'The uniform cdf',
    hw: { letters: true },
    twin: () => {
      const s = rand.int(0, UNI_STORIES.length - 1)
      const S = UNI_STORIES[s]
      const A = rand.pick(S.A), w = rand.pick(S.W), st = S.step(w)
      const B = A + w, n = w / st
      const kind = rand.pick(['between', 'between', 'beyond', 'more', 'less'])
      const i = rand.int(1, n - 1)
      const c = A + i * st
      if (kind === 'between') {
        // d stays strictly inside (A, B); past B is the 'beyond' kind
        if (i >= n - 1) return { s, A, w, kind: 'more', c }
        return { s, A, w, kind, c, d: A + rand.int(i + 1, n - 1) * st }
      }
      if (kind === 'beyond') return { s, A, w, kind, c, d: B + rand.int(1, Math.max(1, Math.floor(n / 3))) * st }
      return { s, A, w, kind, c }
    },
    make: v => {
      if (v.letters) {
        const ex = { A: 2, B: 6 }
        const { cases, steps } = uniformSteps('a', 'b', 'b - a', {
          kind: 'curve', title: 'F(x) for one example: a = 2, b = 6', lo: 1, hi: 7, pdf: uniF(ex.A, ex.B), ticks: [ex.A, ex.B],
          note: 'F is 0 up to a, climbs in a straight line from a to b, then stays at 1',
        })
        return {
          text: R`**Uniform distribution.** Find the general expression for the cumulative distribution function for a random variable \(X\) that is uniformly distributed over the interval \((a, b)\). See Exercise 5, which says: a random variable \(X\) is uniformly distributed over an interval \((a, b)\) if its density is given by \[f(x) = \frac{1}{b - a} \qquad a < x < b\]`,
          // labelled (a) so a twin's (a), the same cdf with numbers, counts toward it in the app
          parts: [
            {
              label: 'a',
              ask: R`Find the cumulative distribution function \(F(x)\) for every \(x\).`,
              skill: 'cont-cdf',
              hint: R`\(F(x) = P[X \le x]\) is the area under \(f\) to the left of \(x\). Do three cases: \(x\) left of \(a\), between \(a\) and \(b\), right of \(b\).`,
              check: { type: 'self' },
              answer: cases,
              steps,
              trap: R`The middle piece is \(\frac{x - a}{b - a}\), not \(\frac{x}{b - a}\): the area starts at \(a\), not at 0.`,
            },
          ],
        }
      }
      const { A, w, kind, c, d } = v
      const B = A + w
      const S = UNI_STORIES[v.s]
      const F = uniF(A, B)
      const piece = x => (x >= B ? R`1` : R`\frac{${x} - ${A}}{${w}} = ${frac(x - A, w)}`)
      const FG = (marks, extra) => ({
        kind: 'curve', title: `F(x), uniform on (${A}, ${B})`, lo: A - 0.3 * w, hi: Math.max(B + 0.3 * w, (d ?? 0) + 0.1 * w), pdf: F, marks, ticks: dedupe([A, B, ...extra]),
        note: !marks.length ? `F climbs in a straight line from 0 at ${A} to 1 at ${B}`
          : kind === 'more' ? `the probability is 1 − F(${c}): the rise of F after ${c}`
          : kind === 'less' ? `the probability is the height F(${c})`
          : `the probability is the rise of F from ${c} to ${d}`,
      })
      const { cases, steps } = uniformSteps(String(A), String(B), String(w), FG([], []))
      const wrong = mid => R`F(x) = \begin{cases} 0 & x \le ${A} \\ ${mid} & ${A} < x < ${B} \\ 1 & x \ge ${B} \end{cases}`
      let P, ask, Pexpr, bSteps, hint, trap, slips
      if (kind === 'between' || kind === 'beyond') {
        P = F(d) - F(c)
        // between: F(d) alone, the complement, F(c), the height 1/w, no ÷ w.
        // beyond: d put into the middle piece, F(c) (= 1 − P), the height, no ÷ w
        slips = kind === 'between' ? [F(d), 1 - P, F(c), 1 / w, d - c] : [(d - c) / w, F(c), 1 / w, B - c, d - c]
        Pexpr = R`P[${c} \le X \le ${d}]`
        ask = S.between(c, d)
        hint = R`Write it as \(F(${d}) - F(${c})\), and check which piece of \(F\) each value falls in.`
        const Pt = frac(Math.round((F(d) - F(c)) * w), w)
        bSteps = [
          {
            say: R`With the cdf, the probability between two values is the rise of \(F\) between them.`,
            tex: R`${Pexpr} = F(${d}) - F(${c})`,
            why: R`\(F(${d})\) is all the probability up to ${d}. Take away the part up to ${c} and what is left is between them.`,
            graph: FG([c, d], [c, d]),
          },
          kind === 'beyond'
            ? { say: R`${d} is past ${B}, so use the top piece: all the probability is already to its left.`, tex: R`F(${d}) = 1` }
            : { say: R`${d} is between ${A} and ${B}, so use the middle piece.`, tex: R`F(${d}) = ${piece(d)}` },
          { say: kind === 'beyond' ? R`${c} is between ${A} and ${B}, so use the middle piece.` : R`${c} is between ${A} and ${B} too: middle piece.`, tex: R`F(${c}) = ${piece(c)}` },
          {
            say: 'Subtract.',
            tex: R`${Pexpr} = ${kind === 'beyond' ? '1' : frac(d - A, w)} - ${frac(c - A, w)} = ${Pt} ${ap(P)}`,
          },
        ]
        trap = kind === 'beyond'
          ? R`Don't put ${d} into the middle piece: \(\frac{${d} - ${A}}{${w}}\) is bigger than 1. Past ${B}, \(F = 1\).`
          : R`Don't stop at \(F(${d})\): that is the chance of at most ${d}. Subtract \(F(${c})\) to keep only the part above ${c}.`
      } else if (kind === 'more') {
        P = 1 - F(c)
        // F(c) not taken from 1, x/w for F (no − A), 'more than c' as 'at least c + 1', the height, no ÷ w
        slips = [F(c), ...(c <= w ? [1 - c / w] : []), 1 - F(c + 1), 1 / w, B - c]
        Pexpr = R`P[X > ${c}]`
        ask = S.more(c)
        hint = R`"More than" is the opposite of "at most", and \(F(${c})\) is "at most ${c}".`
        bSteps = [
          {
            say: R`"More than ${c}" is everything except "at most ${c}", and \(F(${c})\) is the chance of at most ${c}.`,
            tex: R`P[X > ${c}] = 1 - P[X \le ${c}] = 1 - F(${c})`,
            graph: FG([c], [c]),
          },
          { say: R`${c} is between ${A} and ${B}: middle piece.`, tex: R`F(${c}) = ${piece(c)}` },
          { say: 'Subtract from 1.', tex: R`P[X > ${c}] = 1 - ${frac(c - A, w)} = ${frac(B - c, w)} ${ap(P)}` },
        ]
        trap = R`\(F(${c})\) is the chance of at most ${c}. The question wants the other side, so subtract it from 1.`
      } else {
        P = F(c)
        // the wrong tail, x/w for F (no − A), 'less than c' as 'at most c − 1', the height, no ÷ w
        slips = [1 - P, c / w, F(c - 1), 1 / w, c - A]
        Pexpr = R`P[X < ${c}]`
        ask = S.less(c)
        hint = R`For a continuous \(X\), "less than" and "at most" are the same. Which value of \(F\) is that?`
        bSteps = [
          {
            say: R`\(P[X = ${c}] = 0\), so "less than ${c}" is the same as "at most ${c}", and that is \(F(${c})\).`,
            tex: R`P[X < ${c}] = P[X \le ${c}] = F(${c})`,
            graph: FG([c], [c]),
          },
          { say: R`${c} is between ${A} and ${B}: middle piece.`, tex: R`F(${c}) = ${piece(c)} ${ap(P)}` },
        ]
        trap = R`Don't use \(\frac{${c}}{${w}}\): the area starts at ${A}, so it is \(\frac{${c} - ${A}}{${w}}\).`
      }
      return {
        text: R`${S.intro(A, B)} So \(X\) is uniformly distributed over \((${A}, ${B})\), with density \(f(x) = \frac{1}{${B} - ${A}} = \frac{1}{${w}}\) for \(${A} < x < ${B}\).`,
        parts: [
          {
            label: 'a',
            ask: R`Find the cumulative distribution function \(F(x)\) of \(X\).`,
            skill: 'cont-cdf',
            hint: R`\(F(x)\) is the area under \(f\) to the left of \(x\). Do three cases: \(x\) left of ${A}, between ${A} and ${B}, right of ${B}.`,
            check: {
              type: 'choice',
              options: [
                { tex: cases },
                { tex: wrong(R`\dfrac{x}{${w}}`) },
                { tex: wrong(R`\dfrac{1}{${w}}`) },
                { tex: wrong(R`\dfrac{${B} - x}{${w}}`) },
              ],
              correct: 0,
            },
            answer: cases,
            steps,
            trap: R`The middle piece is \(\frac{x - ${A}}{${w}}\), not \(\frac{x}{${w}}\): the area starts at ${A}, not at 0.`,
          },
          {
            label: 'b',
            ask: R`Use \(F\) to find the probability that ${ask}.`,
            skill: 'cont-prob',
            hint,
            check: { type: 'number', value: P, tol: 0.0005, wrong: wrongs(P, 0.0005, slips) },
            answer: R`${Pexpr} = ${frac(Math.round(P * w), w)} ${ap(P)}`,
            steps: bSteps,
            trap,
          },
        ],
      }
    },
  })

  HW.add({
    id: '4.1-13',
    section: '4.1',
    num: '13',
    group: 3,
    title: 'The cdf, then a probability',
    hw: { s: 0, a: 25, c: 2, lo: 30, hi: 40, ref: true },
    twin: () => ({ ...logTwin(), ref: false }),
    make: v => {
      const { a, c, lo, hi, ref } = v
      const S = LOG_STORIES[v.s]
      const bits = logBits(v)
      const { ca, Fx, P, lnRatio, density, gLo, gHi } = bits
      const mid = R`\frac{\ln x - \ln ${a}}{\ln ${c}}`
      const cases = body => R`F(x) = \begin{cases} 0 & x < ${a} \\ ${body} & ${a} \le x \le ${ca} \\ 1 & x > ${ca} \end{cases}`
      const Flo = Fx(lo), Fhi = Fx(hi)
      const Fval = x => (x === a ? R`\frac{\ln ${a} - \ln ${a}}{\ln ${c}} = 0` : x === ca ? R`\frac{\ln ${ca} - \ln ${a}}{\ln ${c}} = 1` : R`\frac{\ln ${x} - \ln ${a}}{\ln ${c}} \approx ${fix(Fx(x), 4)}`)
      const roundDiff = +fix(Fhi, 4) - +fix(Flo, 4)
      const FGraph = (marks, ticks, note) => ({ kind: 'curve', title: `F(x), the cdf of X`, lo: gLo, hi: gHi, pdf: Fx, marks, ticks, note })
      const fromWhere = ref ? 'what Exercise 4(b) found' : `the integral of f from ${lo} to ${hi}`
      return {
        text: ref
          ? R`In Exercise 4, \(X\) is the amount of flexible polyurethane cushioning, in pounds, found per scrapped car, with density ${density} Find the cumulative distribution function for the random variable of Exercise 4. Use \(F\) to find \(P[${lo} \le X \le ${hi}]\), and compare your answer to that obtained previously.`
          : R`${S.intro} Assume that the density for \(X\) is ${density} Find the cumulative distribution function \(F\) for \(X\). Use \(F\) to find \(P[${lo} \le X \le ${hi}]\), and compare your answer with what you get by integrating \(f\) from ${lo} to ${hi}.`,
        parts: [
          {
            label: 'a',
            ask: R`Find the cumulative distribution function \(F(x)\).`,
            skill: 'cont-cdf',
            hint: R`\(F(x)\) is the area under \(f\) from ${a} up to \(x\). Do three cases: \(x\) below ${a}, between ${a} and ${ca}, and above ${ca}.`,
            check: {
              type: 'choice',
              options: [
                { tex: cases(mid) },
                { tex: cases(R`\frac{\ln x}{\ln ${c}}`) },
                { tex: cases(R`\frac{\ln ${ca} - \ln x}{\ln ${c}}`) },
                { tex: cases(R`\frac{1}{x \ln ${c}}`) },
              ],
              correct: 0,
            },
            answer: cases(mid),
            steps: [
              {
                say: R`The cdf is all the area under \(f\) to the left of \(x\). Use \(t\) as the letter inside the integral, since \(x\) is the top limit.`,
                tex: R`F(x) = P[X \le x] = \int_{-\infty}^{x} f(t)\,dt`,
              },
              {
                say: R`Below ${a}: \(f\) is 0 there, so no probability has built up yet.`,
                tex: R`F(x) = \int_{-\infty}^{x} 0\,dt = 0 \quad \text{for } x < ${a}`,
              },
              {
                say: R`Between ${a} and ${ca}, integrate from ${a} up to \(x\). The antiderivative of \(\frac{1}{t}\) is \(\ln t\).`,
                tex: R`F(x) = \int_{${a}}^{x} \frac{1}{\ln ${c}}\,\frac{1}{t}\,dt = \frac{1}{\ln ${c}}\Big[\ln t\Big]_{${a}}^{x} = \frac{\ln x - \ln ${a}}{\ln ${c}}`,
                why: R`You can also write it as \(\ln(x/${a})/\ln ${c}\). It is the same thing.`,
              },
              {
                say: R`Above ${ca}: all the probability has built up, so \(F(x) = 1\).`,
                tex: R`F(x) = \int_{${a}}^{${ca}} f(t)\,dt = \frac{1}{\ln ${c}}\Big[\ln t\Big]_{${a}}^{${ca}} = \frac{\ln ${ca} - \ln ${a}}{\ln ${c}} = \frac{\ln ${c}}{\ln ${c}} = 1 \quad \text{for } x > ${ca}`,
                why: R`Past ${ca}, \(f\) is 0, so there is no more area to add. The middle piece also gives 1 at \(x = ${ca}\), so \(F\) has no jump there.`,
              },
              {
                say: 'Put the three pieces together.',
                tex: cases(mid),
                graph: FGraph([], [a, ca], `F climbs from 0 at ${a} to 1 at ${ca}, then stays at 1`),
              },
            ],
            trap: R`Don't forget the lower limit: \(\ln x/\ln ${c}\) on its own is not 0 at \(x = ${a}\), so it can't be the cdf.`,
          },
          {
            label: 'b',
            ask: R`Use \(F\) to find \(P[${lo} \le X \le ${hi}]\).`,
            skill: 'cont-prob',
            hint: R`The probability between two values is the rise of \(F\) between them.`,
            check: { type: 'number', value: P, tol: 0.0005, wrong: logWrong(v, bits).b13 },
            answer: R`P[${lo} \le X \le ${hi}] = F(${hi}) - F(${lo}) ${ap(P)}`,
            steps: [
              {
                say: R`The probability between two values is the rise of \(F\) between them.`,
                tex: R`P[${lo} \le X \le ${hi}] = F(${hi}) - F(${lo})`,
                why: R`\(F(${hi})\) is all the area left of ${hi}. Taking away the area left of ${lo} leaves the area between them. (\(P[X = ${lo}] = 0\), so it doesn't matter that ${lo} itself is included.)`,
                graph: FGraph([lo, hi], dedupe([a, lo, hi, ca]), `the rise of F from ${lo} to ${hi} is the probability`),
              },
              {
                say: R`Put ${hi} and ${lo} into the cdf.`,
                tex: [R`F(${hi}) = ${Fval(hi)}`, R`F(${lo}) = ${Fval(lo)}`],
              },
              {
                say: R`Subtract. The \(\ln ${a}\) parts cancel.`,
                tex: [
                  R`F(${hi}) - F(${lo}) = \frac{\ln ${hi} - \ln ${lo}}{\ln ${c}} = \frac{${lnRatio}}{\ln ${c}} ${ap(P)}`,
                ],
                ...(Math.abs(roundDiff - +fix(P, 4)) > 1e-9 ? { why: `Subtracting the rounded values gives ${fix(Fhi, 4)} − ${fix(Flo, 4)} = ${fix(roundDiff, 4)}, the same up to rounding.` } : {}),
              },
            ],
          },
          {
            label: 'c',
            ask: ref ? R`Compare your answer to the one obtained previously, in Exercise 4(b).` : R`Compare your answer with what you get by integrating \(f\) from ${lo} to ${hi}.`,
            skill: 'cont-cdf',
            hint: R`Write \(F(${hi}) - F(${lo})\) with logs and simplify. What does integrating \(f\) from ${lo} to ${hi} give?`,
            check: {
              type: 'choice',
              options: [
                { text: R`The same, about ${fix(P, 4)}: \(F(${hi}) - F(${lo}) = (\ln ${hi} - \ln ${lo})/\ln ${c}\), exactly the integral of \(f\) from ${lo} to ${hi} ${ref ? 'from Exercise 4(b)' : 'done directly'}.` },
                { text: R`Different: the cdf answer is \(F(${hi}) ${ap(Fhi)}\), because \(F(${hi})\) is the probability of being at most ${hi}.` },
                lo > a
                  ? { text: R`Different: \(F(${hi}) - F(${lo})\) also counts the area from ${a} to ${lo}, so it is bigger.` }
                  : { text: R`Different: \(F\) is the area to the right, so \(F(${hi}) - F(${lo})\) is the area beyond ${hi}.` },
                { text: R`Different: the cdf leaves out the endpoints ${lo} and ${hi}, so its answer is a little smaller.` },
              ],
              correct: 0,
            },
            answer: R`\text{The same: } F(${hi}) - F(${lo}) = \int_{${lo}}^{${hi}} f(x)\,dx ${ap(P)}`,
            steps: [
              {
                say: R`Look at what \(F(${hi}) - F(${lo})\) became once the \(\ln ${a}\) parts cancelled.`,
                tex: R`F(${hi}) - F(${lo}) = \frac{\ln ${hi} - \ln ${lo}}{\ln ${c}}`,
              },
              {
                say: ref ? R`In Exercise 4(b) we integrated \(f\) from ${lo} to ${hi} and got exactly this.` : R`Integrating \(f\) from ${lo} to ${hi} directly gives exactly this.`,
                tex: R`\int_{${lo}}^{${hi}} \frac{1}{\ln ${c}}\,\frac{1}{x}\,dx = \frac{\ln ${hi} - \ln ${lo}}{\ln ${c}} ${ap(P)}`,
                why: R`This always happens: \(F(b) - F(a) = \int_a^b f(x)\,dx\). The cdf does the integral once, for every \(x\), so each probability after that is a subtraction.`,
              },
            ],
            trap: `F(${hi}) alone is P[X ≤ ${hi}], the area all the way from ${a}. The question wants only the part from ${lo} to ${hi}, and that is exactly ${fromWhere}.`,
          },
        ],
      }
    },
  })

  // ======================= 4.1 #14: is this F really a cdf? =======================
  // A proposed F is 0 left of breaks[0], polys[i] from breaks[i] to breaks[i+1], and tail
  // right of the last break. Fractions are [n, d]; a poly is its coefficients [c0, c1, c2, …].
  const Q = (n, d = 1) => {
    if (d < 0) { n = -n; d = -d }
    const g = HW.gcd(n, d) || 1
    return [n / g, d / g]
  }
  const qa = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1])
  const qs = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1])
  const qm = (x, y) => Q(x[0] * y[0], x[1] * y[1])
  const qd = (x, y) => Q(x[0] * y[1], x[1] * y[0])
  const qv = x => x[0] / x[1]
  const qt = x => frac(x[0], x[1])
  const qtx = x => fracText(x[0], x[1])
  const qeq = (x, y) => x[0] * y[1] === y[0] * x[1]
  const qabs = x => [Math.abs(x[0]), x[1]]
  const peval = (p, x) => p.reduce((s, c, k) => qa(s, qm(c, Q(x[0] ** k, x[1] ** k))), Q(0))
  const pnum = (p, x) => p.reduce((s, c, k) => s + qv(c) * x ** k, 0)
  const pder = p => (p.length > 1 ? p.slice(1).map((c, k) => qm(c, Q(k + 1))) : [Q(0)])
  const ptex = p => {
    const terms = []
    for (let k = p.length - 1; k >= 0; k--) {
      const c = p[k]
      if (c[0] === 0) continue
      const ab = qabs(c)
      const coef = k > 0 && ab[0] === 1 && ab[1] === 1 ? '' : qt(ab)
      terms.push({ neg: c[0] < 0, body: coef + (k === 0 ? '' : k === 1 ? 'x' : `x^${k}`) })
    }
    if (!terms.length) return '0'
    return terms.map((t, i) => (i === 0 ? (t.neg ? '-' : '') : t.neg ? ' - ' : ' + ') + t.body).join('')
  }
  // the line through (x1, y1) and (x2, y2), as a poly
  const line = (x1, y1, x2, y2) => {
    const s = qd(qs(y2, y1), qs(x2, x1))
    return [qs(y1, qm(s, x1)), s]
  }
  const mono = (c, m) => [...Array(m).fill(Q(0)), c]
  const one = (style, lo, hi, poly, tail = Q(1)) => ({ style, breaks: [lo, hi], polys: [poly], tail })
  const two = (lo, h, hi, p1, p2, tail = Q(1)) => ({ style: 'b', breaks: [lo, h, hi], polys: [p1, p2], tail })

  // conditions, written the way the book writes them
  const conds = spec => {
    const b = spec.breaks.map(qt), n = b.length - 1
    if (spec.style === 'a') return { first: R`x < ${b[0]}`, mid: [R`${b[0]} \le x \le ${b[1]}`], last: R`x > ${b[1]}` }
    return { first: R`x \le ${b[0]}`, mid: b.slice(0, n).map((x, i) => R`${x} < x \le ${b[i + 1]}`), last: R`x > ${b[n]}` }
  }
  const Fcases = spec => {
    const c = conds(spec)
    const rows = [R`0 & ${c.first}`, ...spec.polys.map((p, i) => R`${ptex(p)} & ${c.mid[i]}`), R`${qt(spec.tail)} & ${c.last}`]
    return R`\begin{cases} ${rows.join(R` \\ `)} \end{cases}`
  }
  const fcases = spec => {
    const c = conds(spec)
    const rows = [...spec.polys.map((p, i) => R`${ptex(pder(p))} & ${c.mid[i]}`), R`0 & \text{otherwise}`]
    return R`\begin{cases} ${rows.join(R` \\ `)} \end{cases}`
  }
  const Fnum = spec => x => {
    const b = spec.breaks.map(qv)
    if (x < b[0]) return 0
    for (let i = 0; i < spec.polys.length; i++) if (x <= b[i + 1]) return pnum(spec.polys[i], x)
    return qv(spec.tail)
  }
  // where a piece's derivative is negative: [from, to] or null
  const negPart = (d, lo, hi) => {
    if (d.length === 1) return qv(d[0]) < 0 ? [lo, hi] : null
    if (d.length === 2) {
      const fl = qv(peval(d, lo)), fh = qv(peval(d, hi))
      if (fl >= 0 && fh >= 0) return null
      const r = qd(Q(-d[0][0], d[0][1]), d[1])
      return qv(d[1]) < 0 ? [qv(r) > qv(lo) ? r : lo, hi] : [lo, qv(r) < qv(hi) ? r : hi]
    }
    for (let i = 0; i <= 50; i++) if (pnum(d, qv(lo) + ((qv(hi) - qv(lo)) * i) / 50) < -1e-12) throw new Error('negative higher-degree density is not supported')
    return null
  }
  const analyze = spec => {
    const br = spec.breaks, P = spec.polys, n = br.length - 1
    const seams = [{ x: br[0], left: Q(0), right: peval(P[0], br[0]), lexpr: '0', rexpr: ptex(P[0]), inner: false }]
    for (let i = 1; i < n; i++) seams.push({ x: br[i], left: peval(P[i - 1], br[i]), right: peval(P[i], br[i]), lexpr: ptex(P[i - 1]), rexpr: ptex(P[i]), inner: true })
    seams.push({ x: br[n], left: peval(P[n - 1], br[n]), right: spec.tail, lexpr: ptex(P[n - 1]), rexpr: qt(spec.tail), inner: false })
    const jumps = seams.filter(s => !qeq(s.left, s.right))
    const pieces = P.map((p, i) => {
      const d = pder(p)
      return { p, d, lo: br[i], hi: br[i + 1], neg: negPart(d, br[i], br[i + 1]), area: qs(peval(p, br[i + 1]), peval(p, br[i])) }
    })
    const area = pieces.reduce((s, q) => qa(s, q.area), Q(0))
    const kinds = []
    if (jumps.length) kinds.push('jump')
    if (pieces.some(q => q.neg)) kinds.push('down')
    if (qv(spec.tail) < 1 && !jumps.some(j => qeq(j.x, br[n]))) kinds.push('short')
    if (qv(spec.tail) > 1 || jumps.length > 1 || jumps.some(j => qv(j.right) < qv(j.left)) || kinds.length > 1) throw new Error('this proposed cdf fails in more than one way')
    const kind = kinds[0] ?? 'valid'
    const uniform = kind === 'valid' && P.length === 1 && pieces[0].d.length === 1
    return { seams, jumps, pieces, area, kind, uniform, negPiece: pieces.find(q => q.neg) }
  }

  // the twins' proposed cdfs, grouped by what (if anything) fails
  const S2 = () => rand.pick(['a', 'b'])
  const CDF_MAKERS = {
    valid: [
      () => { const L = rand.pick([-2, -1, 0, 1, 2]), w = rand.pick([1, 2, 3, 4]); return one(S2(), Q(L), Q(L + w), line(Q(L), Q(0), Q(L + w), Q(1))) },
      () => { const [m, U] = rand.pick([[2, 1], [3, 1], [2, 2], [3, 2]]); return one(S2(), Q(0), Q(U), mono(Q(1, U ** m), m)) },
      () => { const k = rand.pick([Q(3, 2), Q(2)]), U = rand.pick([1, 2]); return one(S2(), Q(0), Q(U), [Q(0), qd(k, Q(U)), qd(qs(Q(1), k), Q(U * U))]) },
      () => {
        const [c1, h, U] = rand.pick([[Q(1), Q(1, 2), Q(1)], [Q(2), Q(1, 2), Q(1)], [Q(1, 4), Q(1), Q(2)], [Q(1, 2), Q(1), Q(2)], [Q(1), Q(1, 2), Q(2)]])
        return two(Q(0), h, U, mono(c1, 2), line(h, qm(c1, qm(h, h)), U, Q(1)))
      },
    ],
    jump: [
      () => {
        const [c1, h, U, s] = rand.pick([[Q(1), Q(1, 2), Q(1), Q(1, 2)], [Q(1, 4), Q(1), Q(2), Q(1, 4)], [Q(1), Q(1, 2), Q(1), Q(1)], [Q(2), Q(1, 2), Q(1), Q(1, 2)], [Q(1, 2), Q(1), Q(2), Q(1, 4)]])
        const y = qm(c1, qm(h, h))
        return two(Q(0), h, U, mono(c1, 2), [qs(y, qm(s, h)), s])
      },
      () => { const [L, w, m] = rand.pick([[0, 1, 2], [0, 2, 4], [0, 2, 3], [-1, 1, 2], [1, 2, 4]]); return one(S2(), Q(L), Q(L + w), [Q(-L, m), Q(1, m)]) },
      () => { const [c, U] = rand.pick([[Q(1, 2), 1], [Q(1, 8), 2], [Q(1, 4), 1]]); return one(S2(), Q(0), Q(U), mono(c, 2)) },
      () => { const [L, w] = rand.pick([[0, 1], [0, 2], [1, 2]]), j = rand.pick([Q(1, 4), Q(1, 2)]); return one(S2(), Q(L), Q(L + w), line(Q(L), j, Q(L + w), Q(1))) },
      () => {
        const [c1, h, U, J] = rand.pick([[Q(1), Q(1, 2), Q(1), Q(1, 2)], [Q(1, 4), Q(1), Q(2), Q(1, 2)], [Q(1), Q(1, 2), Q(1), Q(3, 4)]])
        return two(Q(0), h, U, mono(c1, 2), line(h, J, U, Q(1)))
      },
    ],
    down: [
      () => { const k = rand.pick([3, 4]), U = rand.pick([1, 2]); return one(S2(), Q(0), Q(U), [Q(0), Q(k, U), Q(1 - k, U * U)]) },
      () => {
        const [s1, h, U] = rand.pick([[Q(2), Q(3, 4), Q(1)], [Q(1), Q(3, 2), Q(2)], [Q(3, 2), Q(1), Q(2)]])
        return two(Q(0), h, U, [Q(0), s1], line(h, qm(s1, h), U, Q(1)))
      },
    ],
    short: [
      () => { const [m, U] = rand.pick([[2, 1], [4, 2], [3, 2], [3, 1]]); return one('b', Q(0), Q(U), [Q(0), Q(1, m)], Q(U, m)) },
      () => { const [c, U] = rand.pick([[Q(1, 2), 1], [Q(1, 8), 2], [Q(1, 4), 1]]); return one('b', Q(0), Q(U), mono(c, 2), qm(c, Q(U * U))) },
    ],
  }
  const cdfTwin = () => {
    const r = Math.random()
    const kind = r < 0.4 ? 'valid' : r < 0.7 ? 'jump' : r < 0.85 ? 'down' : 'short'
    const spec = rand.pick(CDF_MAKERS[kind])()
    if (analyze(spec).kind !== kind) throw new Error(`a ${kind} template came out ${analyze(spec).kind}`)
    return spec
  }
  const CDF_INTROS = [
    '',
    'A classmate wrote two functions on the board and called them cdfs.',
    'Two students each propose a cdf for a continuous random variable X.',
    'A simulation program needs a cdf, and two candidates are suggested.',
    'A practice quiz offers two functions as cumulative distribution functions.',
  ]

  const cdfPart = (label, spec) => {
    const an = analyze(spec)
    const { kind, jumps, pieces, area, seams } = an
    const c = conds(spec)
    const br = spec.breaks, n = br.length - 1
    const J = jumps[0]
    const inner = seams.find(s => s.inner)
    const neg = an.negPiece
    const tail = qt(spec.tail)
    // the derivative of each piece, then f
    const derivLine = pieces.map(q => R`\frac{d}{dx}\left(${ptex(q.p)}\right) = ${ptex(q.d)}`).join(R`, \qquad `)
    // the sign of f on each piece
    const signLines = pieces.flatMap((q, i) => {
      const ft = ptex(q.d)
      if (q.d.length === 1) return [qv(q.d[0]) >= 0 ? R`${ft} \ge 0 \text{ on } ${c.mid[i]} \;\checkmark` : R`${ft} < 0 \text{ on } ${c.mid[i]} \quad\leftarrow \text{fails}`]
      if (q.d.length === 2) {
        const runs = R`${ft} \text{ runs from } ${qt(peval(q.d, q.lo))} \text{ to } ${qt(peval(q.d, q.hi))} \text{ on } ${c.mid[i]}`
        return q.neg ? [runs, R`\text{so } ${ft} < 0 \text{ for } ${qt(q.neg[0])} < x \le ${qt(q.neg[1])} \quad\leftarrow \text{fails}`] : [R`${runs} \;\checkmark`]
      }
      return [R`${ft} \ge 0 \text{ on } ${c.mid[i]} \;\checkmark`]
    })
    // each seam: the pieces on both sides
    const side = (expr, val) => (expr === qt(val) ? expr : R`${expr} = ${qt(val)}`)
    const seamLines = seams.map(s => R`x = ${qt(s.x)}:\quad ${side(s.lexpr, s.left)} \text{ and } ${side(s.rexpr, s.right)}` + (qeq(s.left, s.right) ? R` \;\checkmark` : R` \quad\leftarrow \text{jump of } ${qt(qs(s.right, s.left))}`))
    // the area of each piece
    const paren = t => (/ [+-] /.test(t) || t.startsWith("-") ? R`\left(${t}\right)` : t)
    const val = x => (x[0] < 0 ? R`\left(${qt(x)}\right)` : qt(x))
    const areaLines = pieces.map(q => R`\int_{${qt(q.lo)}}^{${qt(q.hi)}} ${paren(ptex(q.d))}\,dx = \Big[${ptex(q.p)}\Big]_{${qt(q.lo)}}^{${qt(q.hi)}} = ${qt(peval(q.p, q.hi))} - ${val(peval(q.p, q.lo))} = ${qt(q.area)}`)
    const isOne = qeq(area, Q(1))
    if (pieces.length > 1) {
      const sum = pieces.map((q, i) => (i === 0 ? qt(q.area) : qv(q.area) < 0 ? R` - ${qt(qabs(q.area))}` : R` + ${qt(q.area)}`)).join('')
      areaLines.push(R`\text{total area} = ${sum} = ${qt(area)}` + (isOne ? '' : R` \ne 1`))
    } else if (!isOne) areaLines[0] += R` \ne 1`
    const negFrom = neg && neg.neg[0], negTo = neg && neg.neg[1]
    const graphNote = kind === 'jump' ? `F leaps from ${qtx(J.left)} to ${qtx(J.right)} at x = ${qtx(J.x)}`
      : kind === 'down' ? `F climbs past 1, then comes back down to 1 after x = ${qtx(negFrom)}`
      : kind === 'short' ? `F stops climbing at ${qtx(spec.tail)} and never reaches 1`
      : 'F climbs from 0 to 1 with no jumps and never goes down'
    const lo = qv(br[0]), hi = qv(br[n]), span = hi - lo
    const graph = {
      kind: 'curve', title: 'proposed F(x)', lo: lo - 0.3 * span, hi: hi + 0.3 * span, pdf: Fnum(spec),
      ticks: br.map(qv), marks: kind === 'jump' ? [qv(J.x)] : kind === 'down' ? [qv(negFrom)] : [], note: graphNote,
    }

    const fnum = x => {
      const b = br.map(qv)
      if (x <= b[0] || x > b[n]) return 0
      for (let i = 0; i < pieces.length; i++) if (x <= b[i + 1]) return pnum(pieces[i].d, x)
      return 0
    }
    const fGraph = kind === 'down' ? null : {
      kind: 'curve', title: 'the "density" f(x) = F′(x)', lo: lo - 0.3 * span, hi: hi + 0.3 * span, pdf: fnum, shade: [lo, hi],
      ticks: br.map(qv), note: `shaded: the area under f is ${qtx(area)}` + (isOne ? '' : ', not 1'),
    }
    const tailOk = qeq(spec.tail, Q(1))

    const verdict = {
      valid: {
        say: an.uniform ? 'Every check passes, so F is a valid cdf. Its density is flat: a uniform density.' : 'Every check passes, so F is a valid cdf and f is a valid density.',
        tex: an.uniform ? R`f(x) = ${ptex(pieces[0].d)} \text{ on } (${qt(br[0])}, ${qt(br[n])}) \text{: the uniform density on } (${qt(br[0])}, ${qt(br[n])})` : R`\text{starts at 0, ends at 1, never goes down, no jumps} \;\Rightarrow\; \text{valid}`,
        why: 'Passing all four tests makes F a valid continuous cdf, and then f = F′ is a valid density: never negative, with area 1.',
      },
      jump: {
        say: R`Not valid: \(F\) jumps from \(${qt(J?.left ?? Q(0))}\) to \(${qt(J?.right ?? Q(0))}\) at \(x = ${qt(J?.x ?? Q(0))}\).`,
        tex: R`P[X = ${qt(J?.x ?? Q(0))}] \text{ would be } ${qt(qs(J?.right ?? Q(0), J?.left ?? Q(0)))} \ne 0`,
        why: 'A jump puts probability on a single point, and a continuous X can’t do that. The "density" misses that chunk, which is why its area came out short of 1.',
      },
      down: {
        say: R`Not valid: \(F\) goes down for \(${qt(negFrom ?? Q(0))} < x \le ${qt(negTo ?? Q(0))}\), where \(f\) is negative.`,
        tex: neg ? R`P[${qt(negFrom)} < X \le ${qt(negTo)}] = F(${qt(negTo)}) - F(${qt(negFrom)}) = ${qt(peval(neg.p, negTo))} - ${qt(peval(neg.p, negFrom))} = ${qt(qs(peval(neg.p, negTo), peval(neg.p, negFrom)))} < 0` : '0',
        why: 'That would be a negative probability, which is impossible.',
      },
      short: {
        say: R`Not valid: \(F\) levels off at \(${tail}\) and never reaches 1.`,
        tex: R`P[X \text{ takes some value}] = ${tail} \ne 1`,
        why: 'X has to take some value, so the total probability must be 1.',
      },
    }[kind]
    const areaWhy = {
      valid: 'That matches F climbing from 0 all the way to 1.',
      jump: `The area is short by ${qtx(qs(Q(1), area))}, exactly the size of the jump: F got that part by jumping, not by area.`,
      down: 'The area does come out to 1, but only because the negative part cancels some of the positive part. That doesn’t rescue it.',
      short: `F only climbs from 0 to ${qtx(spec.tail)}, so that is all the area there is.`,
    }[kind]

    // a wrong option names a break point where nothing fails
    const jumpAt = kind === 'jump' ? J.x : (inner ?? seams[seams.length - 1]).x
    const downAt = kind === 'down' ? negFrom : inner ? inner.x : br[n]
    const options = [
      { text: R`Valid: \(F\) starts at 0, ends at 1, never goes down and has no jumps.` },
      { text: R`Not valid: \(F\) jumps at \(x = ${qt(jumpAt)}\), so \(P[X = ${qt(jumpAt)}]\) would not be 0.` },
      { text: R`Not valid: \(F\) goes down after \(x = ${qt(downAt)}\), so \(f\) is negative there.` },
      { text: R`Not valid: \(F\) never reaches 1, so the total probability is less than 1.` },
    ]
    const correct = { valid: 0, jump: 1, down: 2, short: 3 }[kind]
    const verdictTex = {
      valid: an.uniform ? R`\text{valid (uniform on } (${qt(br[0])}, ${qt(br[n])})\text{)}` : R`\text{valid}`,
      jump: R`\text{not valid: } F \text{ jumps at } x = ${qt(J?.x ?? Q(0))}`,
      down: R`\text{not valid: } f < 0 \text{ for } ${qt(negFrom ?? Q(0))} < x \le ${qt(negTo ?? Q(0))}`,
      short: R`\text{not valid: } F \text{ never reaches } 1`,
    }[kind]
    const noJumpInner = seams.find(s => s.inner && qeq(s.left, s.right))
    // where f itself steps from one height to another (allowed: only F must not jump)
    const fStep = pieces.length > 1 && !qeq(peval(pieces[0].d, br[1]), peval(pieces[1].d, br[1]))
    const trap = {
      valid: pieces.length === 1 && pieces[0].d.length === 2 && qv(pieces[0].d[1]) < 0
        ? 'f shrinks as x grows, so F flattens out near the right end. Flattening is fine; going down is not, and f never drops below 0 here.'
        : fStep
        ? `f itself jumps at x = ${qtx(br[1])}, from ${qtx(peval(pieces[0].d, br[1]))} to ${qtx(peval(pieces[1].d, br[1]))}. That is allowed: a density may jump. Only F has to be free of jumps.`
        : 'A density’s height is not a probability, so f(x) can equal 1 (or more) and still be fine. What has to be 1 is the area.',
      jump: 'Checking only that F starts at 0 and ends at 1 misses this. Put each break point into the pieces on both sides.' + (noJumpInner ? ` At x = ${qtx(noJumpInner.x)} the two pieces agree (both ${qtx(noJumpInner.left)}), so there is no jump there.` : ''),
      down: 'Ending at 1 isn’t enough: F has to climb the whole way. A piece where F slopes down gives a negative "density".',
      short: 'No jumps and never going down is not enough: F also has to reach 1, because the total probability is 1.',
    }[kind]

    return {
      label,
      ask: R`Consider the function \(F\) defined by \[F(x) = ${Fcases(spec)}\] Find the "density" that goes with it, and decide whether it is a valid continuous density. If it is not, what property fails?`,
      skill: 'pdf-from-cdf',
      hint: 'Take the derivative of each piece to get f. Then check that F starts at 0, ends at 1, never goes down, and has no jumps at the break points.',
      check: { type: 'choice', options, correct },
      answer: R`\begin{gathered} f(x) = ${fcases(spec)} \\ ${verdictTex} \end{gathered}`,
      steps: [
        {
          say: 'The density is the derivative of the cdf. Take the derivative of each piece; the constant pieces give 0.',
          tex: [derivLine, R`f(x) = F'(x) = ${fcases(spec)}`],
          why: 'F(x) is the area under f up to x, so how fast F grows is the height of f.',
        },
        {
          say: 'A valid continuous cdf passes four tests: it starts at 0, ends at 1, never goes down, and has no jumps. First the two ends: read the first and last pieces.' + (tailOk ? '' : ' The right end fails.'),
          tex: [R`F(x) = 0 \text{ for } ${c.first} \;\checkmark`, R`F(x) = ${tail} \text{ for } ${c.last}` + (tailOk ? R` \;\checkmark` : R` \quad\leftarrow \text{never reaches } 1`)],
          why: 'F(x) = P[X ≤ x]. Far to the left no probability has built up yet, so F must start at 0. Far to the right all of it has, so F must end at 1.',
        },
        {
          say: 'Never goes down: F only goes down where its slope f is negative, so check the sign of f on each piece.' + (kind === 'down' ? ' Here it fails.' : ''),
          tex: signLines,
          why: 'P[X ≤ x] can never shrink as x grows: moving x right only adds probability. So f = F′ can never be negative.',
        },
        {
          say: 'No jumps: at each break point, the pieces on the two sides must give the same value.' + (kind === 'jump' ? ' One of them doesn’t.' : ''),
          tex: seamLines,
          why: 'A jump at x = c would put that much probability on the single value c. For a continuous X, P[X = c] = 0: a single point has no width, so no area.',
          graph,
        },
        {
          say: 'The area under f must be 1. Integrate f over each piece and add.',
          tex: areaLines,
          why: areaWhy,
          ...(fGraph ? { graph: fGraph } : {}),
        },
        verdict,
      ],
      trap,
    }
  }

  HW.add({
    id: '4.1-14',
    section: '4.1',
    num: '14',
    group: 3,
    title: 'Is this F really a cdf?',
    hw: {
      s: 0,
      a: { style: 'a', breaks: [[-1, 1], [0, 1]], polys: [[[1, 1], [1, 1]]], tail: [1, 1] },
      b: { style: 'b', breaks: [[0, 1], [1, 2], [1, 1]], polys: [[[0, 1], [0, 1], [1, 1]], [[0, 1], [1, 2]]], tail: [1, 1] },
    },
    twin: () => {
      const a = cdfTwin()
      let b = cdfTwin()
      while (JSON.stringify(b) === JSON.stringify(a)) b = cdfTwin()
      return { s: rand.int(1, CDF_INTROS.length - 1), a, b }
    },
    make: v => ({
      text: (v.s ? CDF_INTROS[v.s] + ' ' : '') + R`In parts (a) and (b) proposed cumulative distributions are given. In each case, find the "density" that would be associated with each, and decide whether it really does define a valid continuous density. If it does not, explain what property fails.`,
      parts: [cdfPart('a', v.a), cdfPart('b', v.b)],
    }),
  })
})()
