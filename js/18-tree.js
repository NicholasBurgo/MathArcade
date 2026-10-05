// js/18-tree.js · the tree: which distribution, every chapter
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the tree: which distribution, every chapter ----------
const LEAVES = {
  poisson: { name: 'Poisson', sec: '§3.8', tex: '\\displaystyle f(x) = \\frac{e^{-k}k^{x}}{x!}', use: 'how many events land in a window, at any average rate (e.g. calls in 30 minutes, typos on a page, flaws per km)', x: 'a count: 0, 1, 2, … (no upper limit)', key: 'k = λs = rate × size of the window, same units (e.g. 4/hr × ½ hr = 2) · mean k, variance k' },
  hyper: { name: 'Hypergeometric', sec: '§3.7', tex: '\\displaystyle f(x) = \\frac{\\binom{r}{x}\\binom{N-r}{n-x}}{\\binom{N}{n}}', use: 'grab n from a group of N that holds r successes, no putting back (e.g. test 4 of 10 laptops, 3 bad)', x: 'successes grabbed: max(0, n − (N − r)) … min(n, r)', key: 'N in the group, r successes in it, n grabbed · mean n·r/N, variance n·(r/N)·((N − r)/N)·((N − n)/(N − 1))' },
  binomial: { name: 'Binomial', sec: '§3.5', tex: '\\displaystyle f(x) = \\binom{n}{x}p^{x}q^{\\,n-x}', use: 'a set number n of independent tries, same p each; X counts successes (e.g. guessing on all 12 quiz questions)', x: 'successes: 0, 1, …, n', key: 'C(n, x)·pˣ·qⁿ⁻ˣ, q = 1 − p · mean np, variance npq · the test gives the n = 20 table' },
  geometric: { name: 'Geometric', sec: '§3.4', tex: '\\displaystyle f(x) = q^{\\,x-1}p', use: 'independent tries until the FIRST success, any p; X counts the tries (e.g. calls until the first sale)', x: 'tries: 1, 2, 3, …', key: 'f(x) = qˣ⁻¹p · F(x) = 1 − qˣ · mean 1/p, variance q/p²' },
  negbin: { name: 'Negative binomial', sec: '§3.6', tex: '\\displaystyle f(x) = \\binom{x-1}{r-1}p^{r}q^{\\,x-r}', use: 'independent tries until the r-th success (2nd, 3rd, …), any p; X counts the tries (e.g. lots until the 3rd defective one)', x: 'tries: r, r + 1, …', key: '(r − 1 successes in x − 1 tries) × p · r = which success it stops at · mean r/p, variance rq/p²' },
  uniform: { name: 'Uniform', sec: '§4.1', tex: '\\displaystyle f(x) = \\frac{1}{B-A}', use: 'every value from A to B equally likely, any A < B (e.g. a bus anytime in the next 10 minutes)', x: 'anywhere in [A, B]', key: 'f(x) = 1/(B − A), F(x) = (x − A)/(B − A): probability = length ÷ length · mean (A + B)/2, variance (B − A)²/12' },
  // the exponential as the formula sheet prints it, with β = 1/λ
  exponential: { name: 'Exponential', sec: '§4.3', tex: '\\displaystyle f(x) = \\frac{1}{\\beta}e^{-x/\\beta}', use: 'the wait until the FIRST (or next) event of a Poisson process, at any rate λ; also the time from one event to the next (e.g. the first call, at 3 per hour)', x: 'a wait, any time > 0', key: 'β = 1/λ: (1/β)e^(−x/β) = λe^(−λx) · P[X > t] = e^(−λt), P[X ≤ t] = 1 − e^(−λt) · mean β, variance β²' },
  // the test names a gamma or hands you its pdf (or MGF); a gamma integral hides one too
  gamma: { name: 'Gamma', sec: '§4.3', tex: '\\displaystyle f(x) = \\frac{x^{\\alpha-1}e^{-x/\\beta}}{\\Gamma(\\alpha)\\,\\beta^{\\alpha}}', use: 'named gamma with α and β, or a pdf of the shape x^(α−1)e^(−x/β) (e.g. (1/16)xe^(−x/4): α = 2, β = 4)', x: 'any value > 0', key: 'α − 1 = the power of x, β = what x is divided by in e^(−x/β) · mean αβ, variance αβ² · Γ(n + 1) = n!' },
  chi: { name: 'Chi-squared', sec: '§4.3', tex: '\\displaystyle \\text{gamma with } \\alpha = \\tfrac{\\gamma}{2},\\ \\beta = 2', use: 'named χ² with γ degrees of freedom, or a gamma with β = 2; values come from the table (e.g. χ²₀.₀₅ with γ = 10 is 18.3)', x: 'a χ² value > 0', key: 'gamma with α = γ/2, β = 2 · mean γ, variance 2γ · χ²ᵣ has area r to its RIGHT: read column 1 − r' },
  normal: { name: 'Normal', sec: '§4.4', tex: '\\displaystyle f(x) = \\frac{1}{\\sqrt{2\\pi}\\,\\sigma}e^{-(x-\\mu)^2/2\\sigma^2}', use: 'a bell curve with any mean μ and standard deviation σ (e.g. IQ: μ = 100, σ = 15)', x: 'any number', key: 'z = (x − μ)/σ → z-table → left area · zᵣ has area r to its RIGHT' },
}
// each branch: the answer, why it fits, and where it leads
const TREE = {
  q: 'What is X doing?',
  branches: [
    {
      a: 'Counting', more: 'whole numbers 0, 1, 2, … (Ch 3)',
      why: 'X answers “how many”, so it is a whole number: Chapter 3.',
      node: {
        q: 'What’s the story?',
        branches: [
          { a: 'Events at a rate', more: '“λ per hour”, “per page”, “per mile”: any rate', why: 'An average rate over time or space, with no separate tries: Poisson.', leaf: 'poisson' },
          { a: 'Grab from a group', more: 'no putting back', why: 'A fixed group, and what you take is not put back: hypergeometric.', leaf: 'hyper' },
          {
            a: 'Repeated tries', more: 'independent, same p each try',
            why: 'Independent tries that each succeed with the same chance p.',
            node: {
              q: 'What’s fixed?',
              branches: [
                { a: 'The number of tries', more: '“out of n”, “n times”: n is set first', why: 'The tries are set in advance and X counts successes: binomial.', leaf: 'binomial' },
                {
                  a: 'The number of successes', more: 'keep going “until …”',
                  why: 'You keep going until a set number of successes, and X counts the tries.',
                  node: {
                    q: 'Which success ends it?',
                    branches: [
                      { a: 'The first', more: '“until the first …”', why: 'It stops at the first success: geometric. (That is also negative binomial with r = 1, but name the special case.)', leaf: 'geometric' },
                      { a: 'The r-th', more: '“until the 2nd, 3rd, … ”', why: 'It stops at the 2nd, 3rd, … success: negative binomial.', leaf: 'negbin' },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      a: 'Measuring', more: 'any decimal in a range (Ch 4)',
      why: 'X is a time, a height, a score: it can be any decimal, so Chapter 4.',
      node: {
        q: 'What’s the story?',
        branches: [
          { a: 'Every value equally likely', more: '“anywhere from A to B”', why: 'Flat: every value in an interval is equally likely: uniform.', leaf: 'uniform' },
          // the test only waits for the FIRST event (§4.3); a gamma comes named, or as its pdf or MGF
          { a: 'The wait for the first event', more: 'events at rate λ: “until the first / next …”, “time between …”', why: 'The wait for the first (or next) event of a Poisson process with rate λ: exponential, with β = 1/λ. (That is also gamma with α = 1, but name the special case.)', leaf: 'exponential' },
          { a: 'A gamma shape', more: '“gamma with α and β”, or a pdf like x^(α−1)e^(−x/β)', why: 'The question names a gamma, or gives a pdf of the shape x^(α−1)e^(−x/β) (or the MGF (1 − βt)^(−α)), with α ≠ 1 and β ≠ 2: gamma.', leaf: 'gamma' },
          { a: 'A χ² value', more: '“the chi-squared table”, or a gamma with β = 2', why: 'The question names χ² or its degrees of freedom, or gives a gamma with β = 2 (or its MGF, (1 − 2t)^(−γ/2)): chi-squared.', leaf: 'chi' },
          { a: 'A bell curve', more: '“normally distributed”, μ and σ', why: 'Normal, with a mean μ and a standard deviation σ: normal.', leaf: 'normal' },
        ],
      },
    },
  ],
}
// the branches that lead to a leaf, top to bottom
function pathTo(leaf, node = TREE) {
  for (const b of node.branches) {
    if (b.leaf === leaf) return [{ node, b }]
    if (b.node) {
      const rest = pathTo(leaf, b.node)
      if (rest) return [{ node, b }, ...rest]
    }
  }
  return null
}

const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
const pickOne = arr => arr[Math.floor(Math.random() * arr.length)]
const ord = n => n + (n === 2 ? 'nd' : n === 3 ? 'rd' : 'th')
// "an 8-page chapter", "an 800-page report", "an 11-page …", else "a"
const an = n => (n === 8 || n === 11 || n === 18 || /^8\d*$/.test(String(n)) ? 'an' : 'a')
// stories for each leaf: the text, and the phrase that decides it
// a number from the story: its value, the words it comes from (highlighted in
// the story), a note on how, and how it looks in a formula (tex) and in a chip
const fmt = x => String(+x.toFixed(4))
const V = (val, from, note, texStr, txt) => ({ val, from, note, tex: texStr ?? fmt(val), txt: txt ?? texStr ?? fmt(val) })
const frac = (a, b) => V(a / b, null, null, `\\tfrac{${a}}{${b}}`, `${a}/${b}`)
const sayX = x => V(x, null, `say we want P[X = ${x}]`)
const near = (mean, lo, hi) => Math.min(hi, Math.max(lo, Math.round(mean) + ri(-1, 1)))
// a number worked out from the story, not read off it: a line of work comes first
const worked = (v, work) => ({ ...v, work })
const q1 = (p, qTex) => worked({ ...V(1 - p, null, 'q = 1 − p'), ...(qTex ? { tex: qTex, txt: qTex.replace(/\\tfrac\{(\d+)\}\{(\d+)\}/, '$1/$2') } : {}) },
  { order: ['p'], tex: s => `${s('q')} = 1 - ${s('p')}`, steps: () => [`= ${qTex ?? fmt(1 - p)}`] })
const pOver = (a, b, from, note) => worked(V(a / b, from, note), { order: [], tex: s => `${s('p')} = \\frac{${a}}{${b}}`, steps: () => [`= ${fmt(a / b)}`] })
// stories for each leaf: the text, the phrase that decides it, and its numbers
const STORIES = {
  binomial: [
    () => { const n = ri(8, 20); return { text: `A quiz has ${n} multiple-choice questions with 4 choices each, and you guess on every one. X is how many you get right.`, clue: `${n} multiple-choice questions`,
      vars: { n: V(n, `${n} multiple-choice questions`), p: pOver(1, 4, '4 choices each', '1 right out of 4'), q: q1(0.25), x: sayX(near(n / 4, 0, n)) } } },
    () => { const n = ri(8, 20), p = pickOne(['0.6', '0.7', '0.75', '0.8']); return { text: `A basketball player makes each free throw with probability ${p}, independently. She takes ${n} free throws. X is how many she makes.`, clue: `She takes ${n} free throws`,
      vars: { n: V(n, `takes ${n} free throws`), p: V(+p, `probability ${p}`), q: q1(+p), x: sayX(near(n * p, 0, n)) } } },
    () => { const n = ri(5, 12); return { text: `A card is drawn from a deck, its suit is noted, and the card is put back. This is done ${n} times. X is the number of hearts drawn.`, clue: 'the card is put back',
      vars: { n: V(n, `done ${n} times`), p: pOver(13, 52, 'hearts', '13 of the 52 cards'), q: q1(0.25), x: sayX(near(n / 4, 0, n)) } } },
  ],
  geometric: [
    () => { const p = pickOne(['0.1', '0.2', '0.25', '0.3']); return { text: `A salesperson calls customers one at a time, and each call ends in a sale with probability ${p}, independently. X is the number of calls until the first sale.`, clue: 'until the first sale',
      vars: { p: V(+p, `probability ${p}`), q: q1(+p), x: sayX(ri(2, 5)) } } },
    () => ({ text: 'You roll a die until the first six shows up. X is the number of rolls.', clue: 'until the first six',
      vars: { p: { ...frac(1, 6), from: 'the first six', note: '1 face out of 6' }, q: q1(1 / 6, '\\tfrac{5}{6}'), x: sayX(ri(2, 5)) } }),
    () => { const p = pickOne(['0.05', '0.1', '0.2']); return { text: `Each chip off a line is defective with probability ${p}, independently. An inspector tests chips until the first defective one. X is the number of chips tested.`, clue: 'until the first defective one',
      vars: { p: V(+p, `probability ${p}`), q: q1(+p), x: sayX(ri(2, 5)) } } },
  ],
  negbin: [
    () => { const r = ri(2, 5), p = pickOne(['0.2', '0.3', '0.4']); return { text: `Each well an oil company drills strikes oil with probability ${p}, independently. X is the number of wells drilled until the ${ord(r)} strike.`, clue: `until the ${ord(r)} strike`,
      vars: { r: V(r, `${ord(r)} strike`), p: V(+p, `probability ${p}`), q: q1(+p), x: sayX(r + ri(1, 4)) } } },
    () => { const r = ri(2, 3), pct = pickOne([10, 20, 25]); return { text: `${pct}% of the lots a factory makes are defective. Lots are made until the ${ord(r)} defective lot. X is the number of lots made.`, clue: `until the ${ord(r)} defective lot`,
      vars: { r: V(r, `${ord(r)} defective lot`), p: worked(V(pct / 100, `${pct}%`), { order: [], tex: s => `${s('p')} = ${pct}\\% = \\frac{${pct}}{100}`, steps: () => [`= ${fmt(pct / 100)}`] }), q: q1(pct / 100), x: sayX(r + ri(1, 4)) } } },
    () => { const r = ri(2, 5), p = pickOne(['0.6', '0.7', '0.8']); return { text: `A player makes each free throw with probability ${p}, independently. She shoots until she makes ${r} of them. X is the number of shots she takes.`, clue: `until she makes ${r} of them`,
      vars: { r: V(r, `makes ${r} of them`), p: V(+p, `probability ${p}`), q: q1(+p), x: sayX(r + ri(1, 3)) } } },
  ],
  hyper: [
    () => { const N = ri(15, 40), r = ri(3, 8), n = ri(3, 6); return { text: `A shipment of ${N} parts has ${r} defective ones. An inspector picks ${n} parts at random, without replacement. X is the number of defective parts picked.`, clue: 'without replacement',
      vars: { N: V(N, `shipment of ${N} parts`), r: V(r, `has ${r} defective`), n: V(n, `picks ${n} parts`), x: sayX(ri(1, 2)) } } },
    () => { const n = pickOne([5, 7, 13]); return { text: `You are dealt a ${n}-card hand from a standard 52-card deck. X is the number of hearts in your hand.`, clue: `dealt a ${n}-card hand`,
      vars: { N: V(52, '52-card deck'), r: V(13, 'hearts', '13 hearts in a deck'), n: V(n, `${n}-card hand`), x: sayX(ri(1, 3)) } } },
    () => { const n = ri(3, 6), W = ri(5, 12), M = ri(5, 12); return { text: `A committee of ${n} is chosen at random from a club of ${W} women and ${M} men. X is the number of women on it.`, clue: `A committee of ${n} is chosen`,
      vars: { N: worked(V(W + M, `${W} women and ${M} men`, `${W} + ${M} people`), { order: [], tex: s => `${s('N')} = ${W} + ${M}`, steps: () => [`= ${W + M}`] }), r: V(W, `${W} women`, 'the women are the “successes”'), n: V(n, `committee of ${n}`), x: sayX(ri(1, Math.min(3, n))) } } },
  ],
  poisson: [
    () => {
      let l, m
      do { l = ri(3, 12); m = pickOne([10, 15, 20, 30]) } while (!Number.isInteger((l * m * 4) / 60))
      const k = (l * m) / 60
      return { text: `A help desk gets an average of ${l} calls per hour. X is the number of calls in the next ${m} minutes.`, clue: `an average of ${l} calls per hour`,
        vars: { lam: V(l, `${l} calls per hour`), s: worked({ ...frac(m, 60), from: `next ${m} minutes`, note: `${m} min = ${m}/60 hour` }, { order: [], tex: S => `${S('s')} = ${m}\\text{ min} = \\frac{${m}}{60}\\text{ hour}` }), k: V(k, null, 'k = λs, from the line above'), x: sayX(near(k, 0, 9)) } }
    },
    () => { const l = pickOne(['0.2', '0.5', '1.5']), s = ri(4, Math.min(12, Math.floor(8 / l))), k = +(l * s).toFixed(2); return { text: `A textbook averages ${l} typos per page. X is the number of typos in ${an(s)} ${s}-page chapter.`, clue: `averages ${l} typos per page`,
      vars: { lam: V(+l, `${l} typos per page`), s: V(s, `${s}-page chapter`, 'pages'), k: V(k, null, 'k = λs, from the line above'), x: sayX(near(k, 0, 20)) } } },
    () => { const l = ri(2, 4), s = ri(2, Math.floor(8 / l)); return { text: `A road has an average of ${l} potholes per mile. X is the number of potholes in a ${s}-mile stretch.`, clue: `an average of ${l} potholes per mile`,
      vars: { lam: V(l, `${l} potholes per mile`), s: V(s, `${s}-mile stretch`, 'miles'), k: V(l * s, null, 'k = λs, from the line above'), x: sayX(near(l * s, 0, 40)) } } },
  ],
  uniform: [
    () => { const b = pickOne([10, 15, 20, 30]); return { text: `A bus is equally likely to arrive at any moment in the next ${b} minutes. X is when it arrives.`, clue: 'equally likely to arrive at any moment',
      vars: { A: V(0, null, 'it starts now: 0'), B: V(b, `next ${b} minutes`) } } },
    () => { const a = ri(0, 5), b = a + ri(4, 10); return { text: `A program picks a real number X anywhere from ${a} to ${b}, with every value equally likely.`, clue: 'every value equally likely',
      vars: { A: V(a, `from ${a}`), B: V(b, `to ${b}`) } } },
    () => { const b = pickOne([30, 50, 100]); return { text: `A ${b} cm rod is cut at a point chosen uniformly along its length. X is where it is cut.`, clue: 'chosen uniformly',
      vars: { A: V(0, null, 'one end of the rod: 0'), B: V(b, `${b} cm rod`) } } },
  ],
  exponential: [
    () => { const l = ri(3, 12), t = pickOne([0.25, 0.5]); return { text: `Customers walk into a coffee shop at an average rate of ${l} per hour. X is the time until the first customer arrives.`, clue: 'the time until the first customer',
      vars: { lam: V(l, `${l} per hour`), t: V(t, null, `say we want P[X > ${t} hour]`) } } },
    () => { const l = ri(2, 8), t = pickOne([0.5, 1]); return { text: `A Geiger counter clicks ${l} times a minute on average. X is the wait for the first click.`, clue: 'the wait for the first click',
      vars: { lam: V(l, `${l} times a minute`), t: V(t, null, `say we want P[X > ${t} minute]`) } } },
    () => { const m = ri(3, 10), t = ri(1, m); return { text: `A server crashes on average once every ${m} days. X is the time until its next crash.`, clue: 'the time until its next crash',
      vars: { lam: worked({ ...frac(1, m), from: `once every ${m} days`, note: `1 crash per ${m} days` }, { order: [], tex: s => `${s('lam')} = \\frac{1\\text{ crash}}{${m}\\text{ days}}`, steps: () => [`= \\frac{1}{${m}}\\text{ per day}`] }), t: V(t, null, `say we want P[X > ${t} days]`) } } },
  ],
  // the test names a gamma (4.3 #29) or gives its pdf; it never waits for the 2nd, 3rd, … event
  gamma: [
    () => { const a = ri(2, 5), b = pickOne([3, 4, 5]); return { text: `X is a gamma random variable with α = ${a} and β = ${b}.`, clue: 'a gamma random variable',
      vars: { al: V(a, `α = ${a}`), be: V(b, `β = ${b}`) } } },
  ],
  chi: [
    () => { const g = ri(3, 20); return { text: `X has a chi-squared distribution with ${g} degrees of freedom. Find the value with area 0.05 to its right.`, clue: `chi-squared distribution with ${g} degrees of freedom`,
      vars: { ga: V(g, `${g} degrees of freedom`), ra: V(0.05, 'area 0.05 to its right') } } },
    () => { const g = ri(3, 20); return { text: `Use the χ² table with γ = ${g} to find the value of X that cuts off the top 1%.`, clue: 'the χ² table',
      vars: { ga: V(g, `γ = ${g}`), ra: V(0.01, 'the top 1%', '1% = 0.01') } } },
  ],
  normal: [
    () => ({ text: 'IQ scores are normally distributed with mean 100 and standard deviation 15. X is a random person’s IQ.', clue: 'normally distributed',
      vars: { mu: V(100, 'mean 100'), sig: V(15, 'standard deviation 15'), x: V(100 + pickOne([-20, -15, 10, 15, 25, 30]), null, 'say X is this score') } }),
    () => { const m = pickOne([63, 64, 65]); return { text: `Heights of adult women follow a bell curve with mean ${m} inches and standard deviation 2.5 inches. X is a random woman’s height.`, clue: 'follow a bell curve',
      vars: { mu: V(m, `mean ${m} inches`), sig: V(2.5, 'standard deviation 2.5 inches'), x: V(m + pickOne([-4, -2.5, 2, 3, 5]), null, 'say X is this height') } } },
    () => { const m = ri(65, 78), sd = ri(6, 10); return { text: `Exam scores are normal with μ = ${m} and σ = ${sd}. X is a random student’s score.`, clue: `normal with μ = ${m}`,
      vars: { mu: V(m, `μ = ${m}`), sig: V(sd, `σ = ${sd}`), x: V(Math.min(100, m + pickOne([-12, -5, 8, 10, 15])), null, 'say X is this score') } } },
  ],
}
