// Group 5: time until the first event in a Poisson process (4.3 #35, 37)
;(() => {
  const R = String.raw
  const { num, fix, frac, fracText } = HW

  // unit names: all plurals are regular
  const unit = (u, n) => (n === 1 ? u : u + 's')
  const WORD = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' }
  const times = r => (r === 1 ? 'once' : r === 2 ? 'twice' : `${r} times`)
  const commas = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const article = u => (u === 'hour' ? 'an' : 'a')
  // the arcade's wrong choices, rounded to 4 decimals: drop any that land on the answer
  // (within 1.5 tol) or that read the same as one already in
  const wrongs = (value, tol, xs) => {
    const seen = new Set(), out = []
    for (let x of xs) {
      if (!Number.isFinite(x)) continue
      x = +x.toFixed(4)
      if (Math.abs(x - value) <= tol * 1.5 || seen.has(x)) continue
      seen.add(x), out.push(x)
    }
    return out.slice(0, 5)
  }

  // Each story: the rate's unit ru, the question's time unit tu, per = how many tu in one ru.
  // q.le / q.ge give [the question, the words that set the direction, the TeX relation].
  // first: the event W waits for. events: what the rate counts.
  // rateWhy: why λ is this number and which numbers in the story to ignore (default: λ's unit).
  const STORIES = [
    // 0: 4.3 #35 (homework only)
    {
      ru: 'week', tu: 'week', per: 1,
      first: 'the first transformer strike',
      events: 'transformer strikes',
      text: v => `The average number of lightning strikes on transformers during the severe thunderstorm season in a given area is ${WORD[v.r] ?? v.r} per week. Assume that a Poisson process is in operation.`,
      q: {
        le: v => [`Find the probability that during the next storm season one must wait at most ${v.t} ${unit('week', v.t)} in order to see the first transformer strike.`, `at most ${v.t} ${unit('week', v.t)}`, R`\le`],
        ge: v => [`Find the probability that during the next storm season one must wait more than ${v.t} ${unit('week', v.t)} in order to see the first transformer strike.`, `more than ${v.t} ${unit('week', v.t)}`, '>'],
      },
    },
    // 1: 4.3 #37 (homework only)
    {
      ru: 'year', tu: 'month', per: 12,
      first: 'the first destructive earthquake',
      events: 'destructive earthquakes',
      text: v => `California is hit every year by approximately ${commas(v.big)} earthquakes that are large enough to be felt. However, those of destructive magnitude occur, on the average, ${times(v.r)} a year.`,
      q: {
        le: v => [`Find the probability that at most ${v.t} months elapse before the first earthquake of destructive magnitude occurs.`, `at most ${v.t} months`, R`\le`],
        ge: v => [`Find the probability that at least ${v.t} months elapse before the first earthquake of destructive magnitude occurs.`, `at least ${v.t} months`, R`\ge`],
      },
      rateWhy: v => `The ${commas(v.big)} felt earthquakes are a distraction: the question only asks about destructive ones, and those average ${times(v.r)} a year. (The problem doesn’t say “Poisson process”, but that is this section’s model for events that happen one at a time at a steady average rate.)`,
    },
    // ---- twin stories ----
    {
      ru: 'hour', tu: 'minute', per: 60, rates: [2, 3, 4, 6], times: [5, 10, 15, 20, 30, 45],
      first: 'the first patient',
      until: 'the first patient arrives',
      events: 'patient arrivals',
      text: v => `Patients arrive at a walk-in clinic at an average rate of ${v.r} per hour. Assume that a Poisson process is in operation.`,
      q: {
        le: v => [`Find the probability that the first patient arrives within ${v.t} minutes after the clinic opens.`, `within ${v.t} minutes`, R`\le`],
        ge: v => [`Find the probability that the staff wait more than ${v.t} minutes after opening for the first patient.`, `more than ${v.t} minutes`, '>'],
      },
    },
    {
      ru: 'hour', tu: 'minute', per: 60, rates: [6, 12, 18, 24, 30], times: [2, 3, 4, 5, 10, 15],
      first: 'her first meteor',
      events: 'meteors',
      text: v => `During a meteor shower, an observer sees meteors at an average rate of ${v.r} per hour. Assume that a Poisson process is in operation.`,
      q: {
        le: v => [`Find the probability that she sees her first meteor within ${v.t} minutes of starting to watch.`, `within ${v.t} minutes`, R`\le`],
        ge: v => [`Find the probability that she must watch for more than ${v.t} minutes to see her first meteor.`, `more than ${v.t} minutes`, '>'],
      },
    },
    {
      ru: 'minute', tu: 'second', per: 60, rates: [3, 4, 6, 10, 12], times: [5, 10, 15, 20, 30],
      first: 'the first click',
      events: 'clicks',
      text: v => `A Geiger counter near a weak radioactive sample clicks at an average rate of ${v.r} per minute. Assume that a Poisson process is in operation.`,
      q: {
        le: v => [`Find the probability that the first click comes at most ${v.t} seconds after the counter is switched on.`, `at most ${v.t} seconds`, R`\le`],
        ge: v => [`Find the probability that at least ${v.t} seconds pass after the counter is switched on before the first click.`, `at least ${v.t} seconds`, R`\ge`],
      },
    },
    {
      ru: 'day', tu: 'hour', per: 24, rates: [2, 3, 4, 6], times: [2, 3, 4, 6, 8, 12],
      first: 'the first call',
      events: 'calls',
      text: v => `A small fire department gets emergency calls at an average rate of ${v.r} per day. Assume that a Poisson process is in operation.`,
      q: {
        le: v => [`Find the probability that the first call after a new shift starts comes within ${v.t} hours.`, `within ${v.t} hours`, R`\le`],
        ge: v => [`Find the probability that more than ${v.t} hours pass after a new shift starts before the first call.`, `more than ${v.t} hours`, '>'],
      },
    },
    {
      ru: 'year', tu: 'month', per: 12, rates: [2, 3, 4, 6], times: [1, 2, 3, 4, 6],
      first: 'the first outage',
      events: 'power outages',
      text: v => `A rural town has power outages at an average rate of ${v.r} per year. Assume that a Poisson process is in operation.`,
      q: {
        le: v => [`Find the probability that the first outage of the new year comes within ${v.t} ${unit('month', v.t)}.`, `within ${v.t} ${unit('month', v.t)}`, R`\le`],
        ge: v => [`Find the probability that at least ${v.t} ${unit('month', v.t)} of the new year ${v.t === 1 ? 'passes' : 'pass'} before the first outage.`, `at least ${v.t} ${unit('month', v.t)}`, R`\ge`],
      },
    },
    {
      ru: 'week', tu: 'day', per: 7, rates: [7, 14, 21], times: [1, 2, 3],
      first: 'the first order',
      events: 'orders',
      text: v => `A small online shop receives orders, day and night, at an average rate of ${v.r} per week. Assume that a Poisson process is in operation.`,
      q: {
        le: v => [`The shop reopens after a holiday. Find the probability that the first order arrives within ${v.t} ${unit('day', v.t)}.`, `within ${v.t} ${unit('day', v.t)}`, R`\le`],
        ge: v => [`The shop reopens after a holiday. Find the probability that at least ${v.t} ${unit('day', v.t)} ${v.t === 1 ? 'passes' : 'pass'} before the first order.`, `at least ${v.t} ${unit('day', v.t)}`, R`\ge`],
      },
    },
    // twin stories with a number to ignore (like the 500 felt earthquakes)
    {
      ru: 'year', tu: 'month', per: 12, rates: [1, 2, 3, 4], times: [3, 4, 6, 9], bigs: [800, 1200, 2000],
      first: 'the next eruption',
      events: 'eruptions',
      text: v => `Seismographs on a very active volcano record about ${commas(v.big)} small tremors every year. However, eruptions occur, on the average, ${times(v.r)} a year.`,
      q: {
        le: v => [`Find the probability that the next eruption comes within ${v.t} months.`, `within ${v.t} months`, R`\le`],
        ge: v => [`Find the probability that at least ${v.t} months pass before the next eruption.`, `at least ${v.t} months`, R`\ge`],
      },
      rateWhy: v => `The ${commas(v.big)} tremors a year are a distraction: the question only asks about eruptions, and those average ${times(v.r)} a year. (Treat the eruptions as a Poisson process: one at a time, at a steady average rate.)`,
    },
    {
      ru: 'day', tu: 'hour', per: 24, rates: [2, 3, 4, 6], times: [2, 3, 4, 6, 8], bigs: [800, 1200, 1500],
      first: 'the first house-fire call',
      events: 'house-fire calls',
      text: v => `A city’s 911 center answers about ${commas(v.big)} calls a day. Calls that report a house fire come in, on the average, ${v.r} times a day. Assume that the house-fire calls form a Poisson process.`,
      q: {
        le: v => [`Find the probability that the first house-fire call after a new shift starts comes within ${v.t} hours.`, `within ${v.t} hours`, R`\le`],
        ge: v => [`Find the probability that more than ${v.t} hours pass after a new shift starts before the first house-fire call.`, `more than ${v.t} hours`, '>'],
      },
      rateWhy: v => `The ${commas(v.big)} calls a day are a distraction: the question only asks about house-fire calls, and those average ${v.r} a day.`,
    },
    {
      ru: 'hour', tu: 'minute', per: 60, rates: [6, 12, 15, 20, 30], times: [2, 3, 4, 5, 6, 10], bigs: [1500, 2000, 2400],
      first: 'the first cash payer',
      events: 'cash payers',
      text: v => `About ${commas(v.big)} cars an hour pass through a highway toll plaza, but cars that pay with cash arrive at its cash lane at an average rate of ${v.r} per hour. Assume that the cash payers form a Poisson process.`,
      q: {
        le: v => [`Find the probability that the first cash payer after the lane opens arrives within ${v.t} minutes.`, `within ${v.t} minutes`, R`\le`],
        ge: v => [`Find the probability that the cash lane waits more than ${v.t} minutes after opening for its first cash payer.`, `more than ${v.t} minutes`, '>'],
      },
      rateWhy: v => `The ${commas(v.big)} cars an hour are a distraction: the question only asks about cash payers, and those average ${v.r} per hour.`,
    },
  ]
  const TWIN_FROM = 2
  const PLAIN = STORIES.map((S, i) => i).filter(i => i >= TWIN_FROM && !STORIES[i].bigs)
  const DISTRACT = STORIES.map((S, i) => i).filter(i => i >= TWIN_FROM && STORIES[i].bigs)

  // a twin: a story, a rate and a time whose k = λt has at most 2 decimals and runs from 0.1 to 3
  // (so rounding k before e^(−k) can't cost the answer),
  // and not so close to ln 2 that e^(−k) and 1 − e^(−k) look alike
  const makeTwin = (dir, pool) => {
    for (;;) {
      const s = HW.rand.pick(pool)
      const S = STORIES[s]
      const r = HW.rand.pick(S.rates), t = HW.rand.pick(S.times)
      const k = (r * t) / S.per
      if (Math.abs(Math.round(k * 100) - k * 100) > 1e-9 || k < 0.1 || k > 3) continue
      if (Math.abs(Math.exp(-k) - 0.5) < 0.03) continue
      const v = { s, r, t, dir }
      if (S.bigs) v.big = HW.rand.pick(S.bigs)
      return v
    }
  }

  // builds both problems from v = { s, r, t, dir, big? }
  const make = v => {
    const S = STORIES[v.s]
    const { r, t, dir } = v
    const { ru, tu, per } = S
    const tus = unit(tu, t)
    const tr = t / per // the time in the rate's unit
    const k = (r * t) / per
    const side = k => (dir === 'le' ? 1 - Math.exp(-k) : Math.exp(-k)) // the asked side for a given k
    const P = side(k)
    const eK = Math.exp(-k)
    const kT = frac(r * t, per) // k as TeX
    const kInt = Number.isInteger(k)
    const kShow = kInt ? kT : R`${kT} = ${num(k, 4)}`
    const trT = frac(t, per) // t in rate units, as TeX
    const trUnit = unit(ru, tr <= 1 ? 1 : 2)
    // e^{-k} (or 1 − e^{-k}), written with the fraction and then the decimal
    const kFr = fracText(r * t, per)
    const lead = dir === 'le' ? '1 - ' : ''
    const eKT = kInt ? R`${lead}e^{-${k}}` : R`${lead}e^{-${kFr}} = ${lead}e^{-${num(k, 4)}}`
    const [ask, key, rel] = S.q[dir](v)
    const until = S.until ?? S.first
    const rateWhy = S.rateWhy ? S.rateWhy(v) : `The story gives the rate per ${ru}, so the ${ru} is λ’s unit. The time has to be in ${ru}s too.`
    // the time step: convert, or note that the units already match
    const timeStep =
      per === 1
        ? {
            say: `The question’s time is ${t} ${tus}. That is already in ${ru}s, the same unit as λ.`,
            tex: R`t = ${t} \text{ ${tus}}`,
            why: 'λ·t only makes sense when the rate and the time use the same unit. Here they already do, so there is nothing to convert.',
          }
        : {
            say: `The question’s time is ${t} ${tus}, but λ is per ${ru}. Write the time in ${ru}s: there are ${per} ${tu}s in ${article(ru)} ${ru}, so divide by ${per}.`,
            tex: R`t = ${t} \text{ ${tus}} = \frac{${t}}{${per}} \text{ ${ru}}${HW.gcd(t, per) === 1 ? '' : R` = ${trT} \text{ ${trUnit}}`}`,
            why: `λ·t only makes sense when the rate and the time use the same unit. You can convert the rate instead: ${r} per ${ru} is ${fracText(r, per)} per ${tu}, and ${fracText(r, per)} · ${t} = ${fracText(r * t, per)}, the same k.`,
          }
    // graphs: the Poisson count in [0, t] with x = 0 lit, and the wait W in the question's unit
    const xmax = Math.max(4, Math.ceil(k + 3 * Math.sqrt(k)))
    const xs = Array.from({ length: xmax + 1 }, (_, i) => i)
    const lamT = r / per // rate per question unit
    const hi = Math.max(1.8 * t, 3 / lamT)
    const expPdf = w => (w < 0 ? 0 : lamT * Math.exp(-lamT * w))
    const relText = rel === R`\le` ? '≤' : rel === R`\ge` ? '≥' : '>'
    return {
      text: S.text(v),
      parts: [
        {
          label: 'a',
          ask: R`Let \(W\) be the time until ${until}. Put the rate \(\lambda\) and the time \(t\) in the same units, and find \(k = \lambda t\), the average number of ${S.events} in ${t} ${tus}. Then explain why \(P[W > t] = e^{-\lambda t}\).`,
          skill: 'first-event',
          hint: per === 1 ? 'Find the rate in the story and its unit, then the time in the question and its unit. k is rate × time once the units match.' : `Which events does the question wait for? Use their rate, then write ${t} ${tus} in ${ru}s.`,
          // wrong: no conversion, converted the wrong way, both converted, β·t (the mean wait 1/λ
          // used as the rate), the other number in the story as λ, e^(−k) given for k
          check: { type: 'number', value: k, tol: 0.006, wrong: wrongs(k, 0.006, [r * t, r * t * per, (r * t) / per ** 2, t / (per * r), v.big ? (v.big * t) / per : NaN, Math.exp(-k)]) },
          answer: R`\lambda = ${r} \text{ per ${ru}},\quad t = ${trT} \text{ ${trUnit}},\quad k = \lambda t = ${kT}`,
          steps: [
            {
              say: `Find the rate: λ is the average number of ${S.events} per ${ru}.`,
              tex: R`\lambda = ${r} \text{ per ${ru}}`,
              why: rateWhy,
            },
            timeStep,
            {
              say: `Multiply: k = λt is the average number of ${S.events} in ${t} ${tus}.`,
              tex: R`k = \lambda t = ${r} \cdot ${trT} = ${kShow}`,
              why: `This is the Poisson k = λs from §3.8: the count of ${S.events} in a stretch of length t is Poisson with k = λt.`,
            },
            {
              say: `Now the why. “W > t” says the wait is still going on at time t: ${S.first} hasn’t come yet. That is the same as: no ${S.events} at all in [0, t].`,
              tex: R`P[W > t] = P[X = 0], \qquad X = \text{number of ${S.events} in } [0, t]`,
              why: 'If even one had happened in [0, t], the wait would already be over by time t.',
            },
            {
              say: 'X is Poisson with k = λt. Put x = 0 into the Poisson pdf.',
              tex: R`P[X = 0] = \frac{e^{-k}k^0}{0!} = e^{-k} \quad\Rightarrow\quad P[W > t] = e^{-\lambda t}`,
              why: 'k⁰ = 1 and 0! = 1, so only e^(−k) is left. Every first-event question comes down to this one line.',
              graph: { kind: 'bars', title: `Poisson · k = ${num(k, 4)}`, xs, ys: xs.map(x => HW.pois.pmf(k, x)), hits: new Set([0]), note: `the lit bar: P[X = 0] = e^(−${num(k, 4)}) ≈ ${fix(eK, 4)}` },
            },
          ],
          trap: per === 1 ? 'k is the expected number of events in the time you are asked about, not the rate itself. They match here only because t = 1.' : `Multiplying ${r} × ${t} without converting gives k = ${r * t}, mixing ${ru}s and ${tu}s.${v.big ? ` And λ is not ${commas(v.big)}: that number counts something the question doesn’t ask about.` : ''}`,
        },
        {
          label: 'b',
          ask,
          skill: 'first-event',
          hint: dir === 'le' ? `Write the event with W. “${key}” is the opposite of waiting longer than that.` : `Write the event with W, then use part (a).`,
          // wrong: the other side, units not converted, converted the wrong way, β·t for k,
          // and for “within”: P[X = 1] (“the first one” read as exactly one)
          check: { type: 'number', value: P, tol: 0.001, wrong: wrongs(P, 0.001, [1 - P, side(r * t), side(r * t * per), side(t / (per * r)), dir === 'le' ? k * Math.exp(-k) : NaN]) },
          answer: R`P\left[W ${rel} ${trT} \text{ ${trUnit}}\right] = ${dir === 'le' ? R`1 - e^{-\lambda t} = 1 - ` : ''}e^{-${kInt ? k : fracText(r * t, per)}} \approx ${num(P, 4)}`,
          steps: [
            {
              say: `Write the question with W. “${key}” means W ${relText} ${t} ${tus}${per === 1 ? '' : `, that is ${tr === 1 ? 1 : fracText(t, per)} ${trUnit}`}.`,
              tex: per === 1 ? R`P[W ${rel} ${t} \text{ ${tus}}]` : R`P[W ${rel} ${t} \text{ ${tus}}] = P\left[W ${rel} ${trT} \text{ ${trUnit}}\right]`,
              why: dir === 'le'
                ? '“Within”, “at most” and “no more than” all mean the first one has come by time t: W ≤ t. W is continuous, so P[W = t] = 0 and ≤ or < give the same answer.'
                : '“At least”, “more than” and “longer than” all mean still waiting at time t: W > t. W is continuous, so P[W = t] = 0 and ≥ or > give the same answer.',
            },
            dir === 'le'
              ? {
                  say: 'Use the complement: waiting at most t is the opposite of waiting more than t.',
                  tex: R`P[W \le t] = 1 - P[W > t] = 1 - e^{-\lambda t}`,
                  why: 'The same thing with the count: the wait is over by time t exactly when X ≥ 1, and P[X ≥ 1] = 1 − P[X = 0].',
                }
              : {
                  say: `Use part (a): waiting ${key} means no ${S.events} in [0, t].`,
                  tex: R`P[W ${rel} t] = P[X = 0] = e^{-\lambda t}`,
                },
            {
              say: 'Put in k = λt from part (a) and work it out.',
              tex: dir === 'le' ? R`${eKT} \approx 1 - ${fix(eK, 4)} = ${fix(P, 4)}` : R`${eKT} \approx ${fix(P, 4)}`,
              graph: {
                kind: 'curve',
                title: `exponential · the wait W in ${tu}s`,
                lo: 0,
                hi,
                pdf: expPdf,
                shade: dir === 'le' ? [0, t] : [t, hi],
                ticks: [0, t],
                note: `shaded: P[W ${relText} ${t} ${tus}] ≈ ${fix(P, 4)}`,
              },
            },
          ],
          trap: dir === 'le'
            ? `e^(−${num(k, 4)}) ≈ ${fix(eK, 4)} is the chance of waiting MORE than ${t} ${tus}: the opposite event.`
            : `1 − e^(−${num(k, 4)}) ≈ ${fix(1 - eK, 4)} is the chance the first event comes BEFORE ${t} ${tus}: the opposite event.`,
        },
      ],
    }
  }

  // ---------- 4.3 #35: lightning strikes on transformers ----------
  HW.add({
    id: '4.3-35',
    section: '4.3',
    num: '35',
    group: 5,
    title: 'Transformer strikes',
    hw: { s: 0, r: 2, t: 1, dir: 'le' },
    twin: () => makeTwin(HW.rand.chance(0.6) ? 'le' : 'ge', PLAIN.concat(DISTRACT)),
    make,
  })

  // ---------- 4.3 #37: destructive earthquakes ----------
  HW.add({
    id: '4.3-37',
    section: '4.3',
    num: '37',
    group: 5,
    title: 'Destructive earthquakes',
    hw: { s: 1, r: 1, t: 3, dir: 'ge', big: 500 },
    twin: () => makeTwin(HW.rand.chance(0.6) ? 'ge' : 'le', HW.rand.chance(0.5) ? DISTRACT : PLAIN),
    make,
  })
})()
