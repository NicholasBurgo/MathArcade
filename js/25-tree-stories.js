// js/25-tree-stories.js · the tree's test-mode stories, and the leaf cards
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the tree's test-mode stories, and the leaf cards ----------
// test mode: longer stories with a trap in each (the trap says what it is)
const HARD = {
  binomial: [
    () => { const pct = pickOne([10, 15, 20, 25]), n = ri(10, 16); return { text: `On average, ${pct}% of an airline's flights arrive late, and flights are late independently of each other. Of the next ${n} flights, X is the number that arrive late.`, clue: `Of the next ${n} flights`,
      trap: '“On average” sounds like Poisson, but there is a fixed number of flights, each late with the same chance: binomial.',
      vars: { n: V(n, `next ${n} flights`), p: worked(V(pct / 100, `${pct}%`), { order: [], tex: S => `${S('p')} = ${pct}\\% = \\frac{${pct}}{100}`, steps: () => [`= ${fmt(pct / 100)}`] }), q: q1(pct / 100), x: sayX(near((n * pct) / 100, 0, n)) } } },
    () => { const [R, B] = pickOne([[4, 6], [3, 7], [2, 8], [6, 4], [3, 5], [1, 3]]), n = ri(5, 10), pp = R / (R + B); return { text: `A bag holds ${R} red and ${B} blue marbles. A marble is drawn at random, its color is written down, and it is put back in the bag. This is done ${n} times. X is the number of red marbles written down.`, clue: 'it is put back in the bag',
      trap: 'Drawing from a small bag looks hypergeometric, but each marble goes back, so every draw has the same chance: binomial.',
      vars: { n: V(n, `done ${n} times`), p: worked(V(pp, `${R} red and ${B} blue`), { order: [], tex: S => `${S('p')} = \\frac{${R}}{${R} + ${B}}`, steps: () => [`= \\frac{${R}}{${R + B}}`, `= ${fmt(pp)}`] }), q: q1(pp), x: sayX(near(n * pp, 0, n)) } } },
    () => { const per = pickOne([20, 30, 40]), n = ri(12, 20), p = pickOne(['0.05', '0.1']); return { text: `A machine makes ${per} bolts an hour. Each bolt is defective with probability ${p}, independently of the others. X is the number of defective bolts among the next ${n} bolts.`, clue: `among the next ${n} bolts`,
      trap: '“An hour” sounds like a Poisson rate, but X counts defects among a fixed number of bolts, each with the same chance: binomial.',
      vars: { n: V(n, `next ${n} bolts`), p: V(+p, `probability ${p}`), q: q1(+p), x: sayX(near(n * p, 1, n)) } } },
  ],
  geometric: [
    () => { const make = pickOne([60, 70, 75, 80, 90]), miss = (100 - make) / 100; return { text: `A basketball player makes ${make}% of her free throws, independently. She keeps shooting until she misses one. X is the number of shots she takes.`, clue: 'until she misses one',
      trap: `The thing she waits for is a miss, so p = 1 − ${fmt(make / 100)} = ${fmt(miss)}, not ${fmt(make / 100)}. Waiting for the first one: geometric.`,
      vars: { p: worked(V(miss, `${make}%`, 'a miss is the “success”'), { order: [], tex: S => `${S('p')} = P[\\text{miss}] = 1 - ${fmt(make / 100)}`, steps: () => [`= ${fmt(miss)}`] }), q: q1(miss), x: sayX(ri(2, 4)) } } },
    () => ({ text: 'You roll a pair of fair dice over and over until you roll doubles (both dice show the same number). X is the number of rolls.', clue: 'until you roll doubles',
      trap: 'Independent rolls, stopping at the first doubles: geometric. The work is p: 6 of the 36 outcomes are doubles.',
      vars: { p: worked({ ...frac(1, 6), from: 'doubles', note: '6 of the 36 outcomes' }, { order: [], tex: S => `${S('p')} = \\frac{6}{36}`, steps: () => ['= \\frac{1}{6}'] }), q: q1(1 / 6, '\\tfrac{5}{6}'), x: sayX(ri(2, 5)) } }),
    () => { const pct = pickOne([10, 20, 25, 40]); return { text: `Each new user who signs up has a ${pct}% chance of having been referred by a friend, independently. X is the number of sign-ups up to and including the first referred user.`, clue: 'up to and including the first referred user',
      trap: 'X counts the tries up to the first success, and the number of tries is not fixed: geometric, not binomial.',
      vars: { p: worked(V(pct / 100, `${pct}%`), { order: [], tex: S => `${S('p')} = ${pct}\\% = \\frac{${pct}}{100}`, steps: () => [`= ${fmt(pct / 100)}`] }), q: q1(pct / 100), x: sayX(ri(2, 5)) } } },
    () => { const [pp, qq] = pickOne([['0.2', '0.8'], ['0.25', '0.75'], ['0.3', '0.7'], ['0.4', '0.6']]); return { text: 'X has the moment generating function shown.', clue: 'moment generating function',
      params: { right: `p = ${pp}`, slips: [`p = ${qq}`, `p = ${fmt(+pp / +qq)}`, `p = ${fmt(+pp * +qq)}`] },
      latex: `m_X(t) = \\frac{${pp}e^t}{1 - ${qq}e^t}`,
      trap: `pe^t/(1 − qe^t) is the geometric MGF: p = ${pp} on top, q = ${qq} below, and p + q = 1.`,
      read: { kind: 'MGF', tex: c => `m_X(t) = \\frac{${c('p', pp)}e^t}{1 - ${c('q', qq)}e^t}`, notes: [['p', `the number on top, times eᵗ, is p = ${pp}`], ['q', `the number subtracted below is q = ${qq} (and p + q = 1)`]], shape: 'pe^t/(1 − qe^t) is the geometric MGF' },
      vars: { p: V(+pp, null, 'the number on top'), q: V(+qq, null, 'the number below'), x: sayX(ri(2, 4)) } } },
  ],
  negbin: [
    () => { const r = ri(2, 3), pct = pickOne([20, 25, 30]); return { text: `A telemarketer makes a sale on ${pct}% of her calls, independently. Her shift ends as soon as she makes her ${ord(r)} sale. X is the number of calls she makes during the shift.`, clue: `as soon as she makes her ${ord(r)} sale`,
      trap: `“As soon as she makes her ${ord(r)} sale” is a stopping rule: she calls until the ${ord(r)} success, so the number of calls is not fixed. X counts tries: negative binomial, not binomial.`,
      vars: { r: V(r, `${ord(r)} sale`), p: worked(V(pct / 100, `${pct}%`), { order: [], tex: S => `${S('p')} = ${pct}\\% = \\frac{${pct}}{100}`, steps: () => [`= ${fmt(pct / 100)}`] }), q: q1(pct / 100), x: sayX(r + ri(1, 4)) } } },
    () => { const r = ri(2, 3), p = pickOne(['0.3', '0.4']); return { text: `Each fish a biologist catches is tagged with probability ${p}, independently. She keeps fishing until she has caught ${r} tagged fish. X is the number of fish she catches.`, clue: `until she has caught ${r} tagged fish`,
      trap: 'Tagged fish sound hypergeometric, but there is no fixed group to draw from: the same chance per fish, until the r-th tagged one. Negative binomial.',
      vars: { r: V(r, `caught ${r} tagged fish`), p: V(+p, `probability ${p}`), q: q1(+p), x: sayX(r + ri(1, 4)) } } },
    () => { const r = ri(2, 4); return { text: `In a video game, each loot box holds a rare item with probability 0.25, independently. X is the number of boxes a player opens to collect ${r} rare items.`, clue: `to collect ${r} rare items`,
      trap: `“Opens to collect ${r} rare items” means opening boxes until the ${ord(r)} success: negative binomial. (With 1 rare item it would be geometric.)`,
      vars: { r: V(r, `collect ${r} rare items`), p: V(0.25, 'probability 0.25'), q: q1(0.25), x: sayX(r + ri(1, 4)) } } },
    // quiz 3.6 #48: the story gives the strikes, but X waits for balls
    () => { const strike = pickOne([80, 85, 90, 95]), r = pickOne([3, 4]), ball = (100 - strike) / 100; return { text: `A pitching machine throws a strike ${strike}% of the time, independently. X is the number of pitches it throws to get its ${ord(r)} ball (a pitch outside the strike zone).`, clue: `to get its ${ord(r)} ball`,
      trap: `X waits for balls, not strikes: a ball is the “success”, so p = 1 − ${fmt(strike / 100)} = ${fmt(ball)}, not ${fmt(strike / 100)}. Waiting for the ${ord(r)} ball: negative binomial with r = ${r}.`,
      vars: { r: V(r, `${ord(r)} ball`), p: worked(V(ball, `${strike}%`, 'a ball is the “success”'), { order: [], tex: S => `${S('p')} = P[\\text{ball}] = 1 - ${fmt(strike / 100)}`, steps: () => [`= ${fmt(ball)}`] }), q: q1(ball), x: sayX(r + 3) } } },
  ],
  hyper: [
    () => { const N = ri(20, 30), r = ri(8, 14), x = ri(2, 3); return { text: `A 6-person jury is chosen at random from a pool of ${N} people, ${r} of whom are women. X is the number of women on the jury.`, clue: 'chosen at random from a pool',
      trap: 'A jury is chosen without replacement from a small pool, so the chance changes after each pick: hypergeometric, not binomial.',
      vars: { N: V(N, `pool of ${N} people`), r: V(r, `${r} of whom are women`), n: V(6, '6-person jury'), x: sayX(x) } } },
    () => { const N = ri(12, 20), r = ri(2, 4); return { text: `A box of ${N} light bulbs has ${r} that are burned out. You grab 4 bulbs from the box at once. X is the number of burned-out bulbs you grab.`, clue: 'at once',
      trap: '“At once” means no bulb can be grabbed twice: without replacement from a small box, so hypergeometric.',
      vars: { N: V(N, `box of ${N} light bulbs`), r: V(r, `has ${r} that are burned out`), n: V(4, 'grab 4 bulbs'), x: sayX(1) } } },
    () => ({ text: 'A lottery draws 6 different numbers from 1 to 40. You bought a ticket with 6 different numbers on it. X is how many of your numbers are drawn.', clue: 'draws 6 different numbers',
      trap: 'Your 6 numbers are the “successes” hidden among the 40, and the draw takes 6 with no repeats: hypergeometric.',
      vars: { N: V(40, 'from 1 to 40'), r: V(6, 'a ticket with 6 different numbers', 'your numbers are the successes'), n: V(6, 'draws 6 different numbers'), x: sayX(ri(1, 2)) } }),
    () => { const [N, r, n] = pickOne([[15, 6, 12], [10, 6, 7], [12, 8, 7], [9, 5, 6]]), lo = n - (N - r); return { text: `A class of ${N} students has ${r} seniors. For a survey, ${n} students are chosen at random, without replacement. X is the number of seniors chosen.`, clue: 'without replacement',
      trap: `Chosen without replacement from one class: hypergeometric. And with only ${N - r} non-seniors, at least ${lo} of the ${n} must be seniors.`,
      vars: { N: V(N, `class of ${N} students`), r: V(r, `has ${r} seniors`), n: V(n, `${n} students are chosen`), x: sayX(lo + 1) } } },
  ],
  poisson: [
    () => { const [l, m] = pickOne([[60, 2], [90, 2], [120, 2], [120, 3], [180, 2], [240, 1], [60, 5], [90, 4]]), k = (l * m) / 60; return { text: `A call center gets about ${l} calls an hour, arriving at random. X is the number of calls in a ${m}-minute span.`, clue: 'arriving at random',
      trap: 'Convert first: the rate is per hour but the window is in minutes, so s = minutes ÷ 60. Events at random times in a window: Poisson.',
      vars: { lam: V(l, `${l} calls an hour`), s: worked({ ...frac(m, 60), from: `${m}-minute span`, note: `${m} min = ${m}/60 hour` }, { order: [], tex: S => `${S('s')} = ${m}\\text{ min} = \\frac{${m}}{60}\\text{ hour}` }), k: V(k, null, 'k = λs, from the line above'), x: sayX(near(k, 0, 9)) } } },
    () => { const e = pickOne([50, 100]), pages = pickOne(e === 50 ? [100, 150, 200, 300, 400] : [200, 300, 400, 500, 600, 800]), k = pages / e; return { text: `${an(pages) === 'an' ? 'An' : 'A'} ${pages}-page report averages one typo every ${e} pages. X is the number of typos in the whole report.`, clue: `one typo every ${e} pages`,
      trap: `“One typo every ${e} pages” is a rate, λ = 1/${e} per page. There are no separate tries with a chance each, so Poisson.`,
      vars: { lam: worked({ ...frac(1, e), from: `one typo every ${e} pages`, note: `1 typo per ${e} pages` }, { order: [], tex: S => `${S('lam')} = \\frac{1\\text{ typo}}{${e}\\text{ pages}}`, steps: () => [`= \\frac{1}{${e}}\\text{ per page}`] }), s: V(pages, `${pages}-page report`, 'pages'), k: V(k, null, 'k = λs, from the line above'), x: sayX(near(k, 0, 12)) } } },
    () => { const l = pickOne([1, 1.5, 2]), m = pickOne([2, 3, 4]), k = l * m; return { text: `Accidents at a busy intersection happen at random, about ${l} per month, even though thousands of cars pass through. X is the number of accidents in the next ${m} months.`, clue: `about ${l} per month`,
      trap: '“Thousands of cars” tempts binomial, but no one knows the number of cars or a chance per car, only a rate: Poisson.',
      vars: { lam: V(l, `about ${l} per month`), s: V(m, `next ${m} months`, 'months'), k: V(k, null, 'k = λs, from the line above'), x: sayX(near(k, 0, 12)) } } },
  ],
  uniform: [
    () => { const b = pickOne([10, 12, 15, 20]); return { text: `Trains leave a station every ${b} minutes, exactly on schedule. You walk onto the platform at a random moment, knowing nothing about the schedule. X is how long you wait for the next train.`, clue: 'exactly on schedule',
      trap: `A wait sounds exponential, but the trains run on a fixed schedule, so every wait from 0 to ${b} minutes is equally likely: uniform.`,
      vars: { A: V(0, null, 'a train could be leaving right now: 0'), B: V(b, `every ${b} minutes`) } } },
    () => { const [a, b] = pickOne([[1, 5], [2, 6], [1, 4], [3, 5]]); return { text: `A package is promised “sometime between ${a} pm and ${b} pm,” and every moment in that window is equally likely. X is the delivery time, in hours after noon.`, clue: 'every moment in that window is equally likely',
      trap: 'A time window with no favorite moment is flat, not a bell curve: uniform.',
      vars: { A: V(a, `between ${a} pm`), B: V(b, `and ${b} pm`) } } },
    () => ({ text: 'A fair spinner is marked in degrees from 0 to 360. X is the angle where it stops.', clue: 'A fair spinner',
      trap: '“Fair” means every angle is equally likely: uniform on [0, 360].',
      vars: { A: V(0, 'from 0'), B: V(360, 'to 360') } }),
  ],
  exponential: [
    () => { const l = pickOne([1, 2, 3]), t = pickOne([0.5, 1]); return { text: `Earthquakes in a region strike at random, at an average rate of ${l} per year. X is the time, in years, from now until the next one.`, clue: 'until the next one',
      trap: 'X is a time, not a count (the number of quakes in a year would be Poisson). The wait for the first event: exponential.',
      vars: { lam: V(l, `${l} per year`), t: V(t, null, `say we want P[X > ${t} year]`) } } },
    () => { const l = pickOne([4, 6, 10, 12]), t = pickOne([0.25, 0.5]); return { text: `Buses arrive at a stop at random, ${l} per hour on average. X is how long you wait, in hours, for the first bus.`, clue: 'how long you wait, in hours, for the first bus',
      trap: 'X is a time, not a count: the wait for the first event of a Poisson process is exponential, λ = the rate, β = 1/λ.',
      vars: { lam: V(l, `${l} per hour`), t: V(t, null, `say we want P[X > ${t} hour]`) } } },
    () => { const b = pickOne([3, 4, 5, 10]); return { text: `X is gamma with α = 1 and β = ${b}.`, clue: 'α = 1', avoid: ['gamma'],
      trap: 'A gamma with α = 1 is the exponential, with λ = 1/β. Name both.',
      vars: { lam: worked({ ...frac(1, b), from: `β = ${b}`, note: 'λ = 1/β' }, { order: [], tex: S => `${S('lam')} = \\frac{1}{\\beta}`, steps: () => [`= \\frac{1}{${b}}`] }), t: V(b, null, `say we want P[X > ${b}]`) } } },
    () => { const l = pickOne([1.5, 2, 3]), t = pickOne([0.5, 1]); return { text: `Customers arrive at a bank at random, ${l} per minute on average. X is the time between one arrival and the next.`, clue: 'the time between one arrival and the next',
      trap: 'From one arrival, X is the wait for the next single event of the Poisson process: exponential, with β = 1/λ.',
      vars: { lam: V(l, `${l} per minute`), t: V(t, null, `say we want P[X > ${t} minute]`) } } },
    () => { const b = pickOne([3, 4, 5, 10]); return { text: 'X has the moment generating function shown.', clue: 'moment generating function', avoid: ['gamma'],
      params: { right: `\\beta = ${b},\\ \\lambda = \\tfrac{1}{${b}}`, slips: [`\\lambda = ${b},\\ \\beta = \\tfrac{1}{${b}}`, `\\alpha = ${b},\\ \\beta = 1`, `\\beta = ${b},\\ \\lambda = ${b}`] },
      latex: `m_X(t) = \\frac{1}{1 - ${b}t}`,
      trap: `1/(1 − βt) is (1 − βt)^(−1): a gamma with α = 1, which is the exponential, with β = ${b} and λ = 1/${b}.`,
      read: { kind: 'MGF', tex: c => `m_X(t) = \\frac{1}{1 - ${c('lam', b)}t}`, notes: [['lam', `the power is −1 (α = 1) and the number times t is β = ${b}, so λ = 1/${b}`]], shape: '1/(1 − βt) is the exponential MGF (a gamma with α = 1)' },
      vars: { lam: worked({ ...frac(1, b), note: 'λ = 1/β' }, { order: [], tex: S => `${S('lam')} = \\frac{1}{\\beta}`, steps: () => [`= \\frac{1}{${b}}`] }), t: V(b, null, `say we want P[X > ${b}]`) } } },
  ],
  // a gamma on the test comes as its pdf or its MGF (the wait for a 2nd, 3rd, … event is not asked)
  gamma: [
    () => { const a = pickOne([2, 3]), b = pickOne([3, 4, 5]), den = fact(a - 1) * b ** a; return { text: 'The time X (in hours) to repair a machine has the pdf shown.', clue: 'has the pdf shown',
      latex: `f(x) = \\frac{1}{${den}}\\,${xpow(a - 1)}e^{-x/${b}}, \\quad x > 0`,
      trap: `Match it to x^(α−1)e^(−x/β): the power of x is α − 1 = ${a - 1}, so α = ${a}, and β = ${b}. β isn’t 2, so it is gamma but not chi-squared.`,
      read: { kind: 'pdf', tex: c => `f(x) = \\frac{1}{${den}}\\,x^{${c('al', a - 1)}}e^{-x/${c('be', b)}}`, notes: [['al', `${a === 2 ? 'x alone is x¹, so ' : ''}the power of x is α − 1 = ${a - 1}, so α = ${a}`], ['be', `x is divided by β = ${b} in the exponent (check: Γ(${a})·${b}${a === 2 ? '²' : '³'} = ${den}, the number below)`]], shape: 'x^(α−1) e^(−x/β) is the gamma shape; β isn’t 2, so not chi-squared' },
      vars: { al: V(a, null, `x^${a - 1} is x^(α−1)`), be: V(b, null, `e^(−x/${b}) is e^(−x/β)`) } } },
    // (α ≠ β, so swapping them is a real slip)
    () => { const a = ri(2, 5), b = pickOne([3, 4, 5].filter(x => x !== a)); return { text: 'X has the moment generating function shown.', clue: 'moment generating function',
      params: { right: `\\alpha = ${a},\\ \\beta = ${b}`, slips: [`\\alpha = ${b},\\ \\beta = ${a}`, `\\alpha = -${a},\\ \\beta = ${b}`, `\\alpha = ${a},\\ \\beta = \\tfrac{1}{${b}}`, `\\alpha = ${a},\\ \\beta = -${b}`] },
      latex: `m_X(t) = (1 - ${b}t)^{-${a}}`,
      trap: `(1 − βt)^(−α) is the gamma MGF: β = ${b}, α = ${a}. β isn’t 2, so not chi-squared.`,
      read: { kind: 'MGF', tex: c => `m_X(t) = (1 - ${c('be', b)}t)^{-${c('al', a)}}`, notes: [['be', `the number times t is β = ${b}`], ['al', `the power, without its minus, is α = ${a}`]], shape: '(1 − βt)^(−α) is the gamma MGF; β isn’t 2 and α isn’t 1, so plain gamma' },
      vars: { al: V(a, null, 'the power is −α'), be: V(b, null, 'the number times t is β') } } },
  ],
  chi: [
    () => { const a = ri(2, 8); return { text: `X is gamma with α = ${a} and β = 2.`, clue: 'β = 2', avoid: ['gamma'],
      trap: `A gamma with β = 2 is chi-squared, with γ = 2α = ${2 * a} degrees of freedom.`,
      vars: { ga: worked(V(2 * a, `α = ${a}`, 'γ = 2α'), { answer: true, order: [], tex: S => `${S('ga')} = 2\\alpha = 2(${a})`, steps: () => [`= ${2 * a}`] }) } } },
    () => { const a = ri(2, 8); return { text: 'X has the moment generating function shown.', clue: 'moment generating function', avoid: ['gamma'],
      params: { right: `\\gamma = ${2 * a}\\ \\ (\\text{a gamma with } \\alpha = ${a},\\ \\beta = 2)`, slips: [`\\gamma = ${a}`, `\\gamma = ${fmt(a / 2)}`, `\\gamma = ${a + 2}`] },
      latex: `m_X(t) = (1 - 2t)^{-${a}}`,
      trap: `(1 − 2t)^(−γ/2) is the chi-squared MGF: γ/2 = ${a}, so γ = ${2 * a}.`,
      read: { kind: 'MGF', tex: c => `m_X(t) = (1 - 2t)^{-${c('ga', a)}}`, notes: [['ga', `the number times t is 2, so it is chi-squared; the power is γ/2 = ${a}, so γ = ${2 * a}`]], shape: '(1 − 2t)^(−γ/2) is the chi-squared MGF (a gamma with β = 2)' },
      vars: { ga: worked(V(2 * a, null, `the power is −γ/2 = −${a}`), { answer: true, order: [], tex: S => `${S('ga')} = 2(${a})`, steps: () => [`= ${2 * a}`] }) } } },
  ],
  normal: [
    () => { const mu = ri(2, 8), sig = ri(2, 6), half = (sig * sig) / 2; return { text: 'X has the moment generating function shown.', clue: 'moment generating function',
      params: { right: `\\mu = ${mu},\\ \\sigma^2 = ${sig * sig}\\ \\ (\\sigma = ${sig})`, slips: [`\\mu = ${mu},\\ \\sigma^2 = ${fmt(half)}`, `\\mu = ${mu},\\ \\sigma = ${sig * sig}`, `\\mu = ${fmt(half)},\\ \\sigma^2 = ${2 * mu}`] },
      latex: `m_X(t) = e^{${mu}t + ${fmt(half)}t^2}`,
      trap: `e^(μt + σ²t²/2) is the normal MGF: μ = ${mu}, and σ²/2 = ${fmt(half)}, so σ² = ${sig * sig} and σ = ${sig}.`,
      read: { kind: 'MGF', tex: c => `m_X(t) = e^{${c('mu', mu)}t + ${c('sig', fmt(half))}t^2}`, notes: [['mu', `the number times t is μ = ${mu}`], ['sig', `the number times t² is σ²/2 = ${fmt(half)}, so σ² = ${sig * sig} and σ = ${sig}`]], shape: 'e^(μt + σ²t²/2) is the normal MGF' },
      vars: { mu: V(mu, null, 'the number times t is μ'), sig: worked(V(sig, null, `σ²/2 = ${fmt(half)}`), { order: [], tex: S => `${S('sig')} = \\sqrt{2(${fmt(half)})}`, steps: () => [`= \\sqrt{${sig * sig}}`, `= ${sig}`] }), x: V(mu + sig * pickOne([-1.5, -1, 1, 1.5, 2]), null, 'say X is this value') } } },
    () => { const mu = pickOne([16.1, 16.2]), x = +(mu + 0.2 * pickOne([-2, -1, 1, 1.5, 2])).toFixed(2); return { text: `The weights of “1-pound” bags of sugar are bell-shaped around a mean of ${mu} oz, with a standard deviation of 0.2 oz. X is a random bag's weight.`, clue: 'bell-shaped',
      trap: '“Bell-shaped around a mean, with a standard deviation” is the normal.',
      vars: { mu: V(mu, `mean of ${mu} oz`), sig: V(0.2, 'standard deviation of 0.2 oz'), x: V(x, null, 'say X is this weight') } } },
  ],
}

// the story with its deciding phrase highlighted (or plain, before the end)
function storyEl(sc, lit) {
  const p = h('p', 'story')
  const at = lit ? sc.text.indexOf(sc.clue) : -1
  if (at < 0) {
    p.textContent = sc.text
    return p
  }
  p.append(document.createTextNode(sc.text.slice(0, at)), h('mark', 'clue', sc.clue), document.createTextNode(sc.text.slice(at + sc.clue.length)))
  return p
}
function leafCard(key) {
  const L = LEAVES[key]
  const c = h('div', 'leafcard')
  const t = h('h3', '', L.name)
  t.append(h('small', '', L.sec))
  const row = (label, text) => {
    const r = h('p')
    r.append(h('span', '', label), document.createTextNode(text))
    return r
  }
  const pdf = h('p')
  pdf.append(h('span', '', L.name === 'Chi-squared' ? 'Is' : 'pdf'), tex(L.tex, false))
  c.append(t, pdf, row('Use case', L.use), row('X is', L.x), row('Key', L.key))
  return c
}
