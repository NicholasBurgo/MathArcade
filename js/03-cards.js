// js/03-cards.js · power-up cards: the whole idea in plain words
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- power-up cards: the whole idea in plain words ----------
const CARDS = {
  'Normal table': [
    'The table gives the area to the LEFT of z: P[Z ≤ z].',
    'Row = z cut off after one decimal (1.2, not rounded), column = the second decimal (0.05). Together: z = 1.25.',
    'Area on the right: 1 − the table value. Between two z values: bigger value − smaller value.',
    'Backwards: find the area inside the table, then read z off its row and column.',
    'z with a subscript has that area to its RIGHT: for z.10 look up .90, so z.10 = 1.28.',
    'Middle area A between −z and z: look up (1 + A)/2. Middle .95 → .975 → z = 1.96.',
  ],
  'Normal word problems': [
    'Turn x into z: z = (x − μ)/σ. Round z to 2 decimals.',
    'Look z up: that is the area to the left, which is also the percentile.',
    'IQ (μ = 100, σ = 15): a 139 gives z = 2.6, the table says 0.9953, so the 99.53rd percentile.',
    'Backwards: area → z from the table → x = μ + zσ. The middle 95% is μ ± 1.96σ.',
    'Given the variance σ²? Take its square root first: variance 9 means σ = 3.',
  ],
  'Binomial table': [
    'Pick the table for your n (10, 15, 19 or 20), the column for p, the row for x. The entry is P[X ≤ x].',
    'Fewer than 8 means at most 7: read row 7. At least 8: 1 − row 7. More than 8: 1 − row 8.',
    'Exactly 8: row 8 − row 7.',
  ],
  'Chi-squared table': [
    'Rows: degrees of freedom γ. Columns: the area to the LEFT of the value.',
    'χ² with r in the subscript has area r on the RIGHT, so read the column for 1 − r. χ²₀.₀₅ lives in the 0.95 column.',
    'Given a value in a row, its column heading tells you the left area. The right area is 1 minus that.',
  ],
  'Binomial probabilities and mean': [
    'Binomial: n tries fixed in advance, independent, each a success with the same p. X counts the successes.',
    'Exactly x: C(n, x)·pˣ·qⁿ⁻ˣ, with q = 1 − p.',
    'At least 1 = 1 − f(0) = 1 − qⁿ. At most 2 = f(0) + f(1) + f(2).',
    'Mean np, variance npq.',
  ],
  'Negative binomial probabilities': [
    'Tries until the r-th success: negative binomial. X can be r, r + 1, r + 2, …',
    'f(x) = C(x − 1, r − 1)·pʳ·q^(x−r): r − 1 successes somewhere in the first x − 1 tries, then a success.',
    'At most 5 = f(r) + … + f(5).',
    'Mean r/p, variance rq/p². With r = 1 it is the geometric.',
  ],
  'Hypergeometric values and probabilities': [
    'Draw n of N without putting any back; r of the N are successes. X counts the successes drawn.',
    'X runs from max(0, n − (N − r)) up to min(n, r).',
    'f(x) = C(r, x)·C(N − r, n − x)/C(N, n). At most 2 = f(0) + f(1) + f(2).',
    'Mean n·r/N. Variance n·(r/N)·((N − r)/N)·((N − n)/(N − 1)).',
  ],
  'Poisson probabilities': [
    'Events at an average rate λ per unit, counted over s units: k = λs, with λ and s in the same units.',
    'f(x) = e⁻ᵏkˣ/x! (on the formula sheet). Mean k, variance k.',
    'At least 4 = 1 − [f(0) + f(1) + f(2) + f(3)]. Less than 4 stops at 3.',
    'It is a pdf: Σ kˣ/x! = eᵏ, so the total is e⁻ᵏ·eᵏ = 1.',
  ],
  'Uniform pdf': [
    'Uniform on (a, b) means flat: every value is equally likely.',
    'The rectangle from a to b must have area 1, so its height is 1/(b − a). That height is the pdf.',
    'A probability is a length over the full length: P[c < X < d] = (d − c)/(b − a).',
  ],
  'First event (exponential)': [
    'Events arrive at rate λ (like 3 per hour). The wait W for the first one is exponential with β = 1/λ: f(w) = λe^(−λw).',
    'P[W ≤ t] = 1 − e^(−λt). P[W > t] = e^(−λt).',
    '"1 every 5 hours" means λ = 1/5 per hour. Put the rate and the time in the same unit first.',
  ],
  'Continuous probabilities': [
    'For a continuous X, a probability is an area: P[a < X < b] = ∫ from a to b of f(x) dx.',
    'Find an antiderivative, plug in b, subtract what you get at a.',
    'A single point has no width, so no area: P[X = a] = 0, and < and ≤ give the same answer.',
  ],
  'Mean and variance from an MGF': [
    'E[X] = m′(0): differentiate the MGF, then plug in t = 0.',
    'E[X²] = m″(0). Var X = m″(0) − (m′(0))².',
    'A sum like 0.3e^(2t) + 0.7e^(5t): m′(0) = 2(0.3) + 5(0.7).',
    'Geometric, m(t) = pe^t/(1 − qe^t): E[X] = 1/p, Var X = q/p².',
  ],
  'Geometric pdf': [
    'X is the try on which the first success happens.',
    'That means x − 1 failures (q each) and then a success (p): f(x) = q^(x−1)·p.',
    'It sums to 1: a geometric series with a = p and r = q gives p/(1 − q) = p/p = 1.',
  ],
  'Geometric cdf': [
    'F(x) = P[X ≤ x]: add q^(k−1)·p from k = 1 up to x.',
    'That is a finite geometric series (on the sheet): p(1 − qˣ)/(1 − q).',
    '1 − q is p, so the p cancels: F(x) = 1 − qˣ.',
    'So P[X > x] = qˣ: more than x tries means the first x all failed.',
  ],
  'Discrete pdf: find c, probabilities, mean': [
    'A discrete pdf: f(x) ≥ 0, and its values add up to 1.',
    'To find c: write out f(x) for every x with c in it, add them, set the sum equal to 1, solve.',
    'P[X ≥ 2], or F(2) = P[X ≤ 2]: add f(x) for those x only.',
    'E[X] = Σ x·f(x), E[X²] = Σ x²·f(x), Var X = E[X²] − (E[X])².',
  ],
  'Geometric MGF': [
    'm(t) = E[e^(tX)]: multiply each f(x) by e^(tx) and add them all up.',
    'Geometric: Σ e^(tx)·q^(x−1)·p. Pull out the constants; what is left is a geometric series in qe^t.',
    'Sum it: m(t) = pe^t/(1 − qe^t). The series only adds up while qe^t < 1, that is t < −ln q.',
    'A pdf on a few values gives one term per value: f(1)e^t + f(2)e^(2t) + …',
  ],
  'Binomial pdf': [
    'One particular order of x successes and n − x failures has probability pˣqⁿ⁻ˣ: independent tries multiply.',
    'There are C(n, x) such orders, so f(x) = C(n, x)·pˣ·qⁿ⁻ˣ for x = 0, 1, …, n.',
    'It sums to 1: the binomial theorem makes the sum (p + q)ⁿ = 1ⁿ = 1.',
  ],
  'Negative binomial pdf': [
    'X is the try on which the r-th success comes, so X = r, r + 1, r + 2, …',
    'The first x − 1 tries hold exactly r − 1 successes (a binomial), then try x is a success.',
    'f(x) = C(x − 1, r − 1)·p^(r−1)·q^(x−r) × p = C(x − 1, r − 1)·pʳ·q^(x−r).',
  ],
  'Hypergeometric pdf': [
    'Draw n of N items without putting any back; r of the N are successes. All C(N, n) samples are equally likely.',
    'Samples with exactly x successes: C(r, x)·C(N − r, n − x). So f(x) = C(r, x)·C(N − r, n − x)/C(N, n).',
    'Some questions give a story: decide binomial, negative binomial or hypergeometric first, then write its pdf.',
  ],
  'Verify a pdf, or find the constant': [
    'A pdf needs two things: f(x) ≥ 0 everywhere, and a total area of 1 (the integral over its range).',
    'To find c: integrate with c out front, set the result equal to 1, solve for c.',
    'Example: c·x² on [0, 3]. The integral is c·9, so c = 1/9.',
  ],
  'pdf ↔ cdf': [
    'The cdf F(x) = P[X ≤ x]: integrate f from the left end of its range up to x.',
    'Before the range F = 0, after it F = 1. Then P[a < X ≤ b] = F(b) − F(a).',
    'Going back: f(x) = F′(x). A continuous cdf starts at 0, ends at 1, never goes down and has no jumps.',
  ],
  'Mean and variance from a pdf': [
    'E[X] = ∫ x·f(x) dx over the range where f isn’t 0.',
    'E[X²] = ∫ x²·f(x) dx. Var X = E[X²] − (E[X])², and σ = √Var X.',
    'Uniform on (a, b): mean (a + b)/2, variance (b − a)²/12.',
  ],
  'Integration by parts': [
    '∫ u dv = uv − ∫ v du. For x·e^(ax): u = x, dv = e^(ax) dx.',
    'Result: (x/a)e^(ax) − e^(ax)/a² + C.',
    'An E[X] can need it once: for f(x) = e^(−x), E[X] = ∫₀^∞ x·e^(−x) dx = 1.',
  ],
  'Continuous MGF': [
    'm(t) = ∫ e^(tx)·f(x) dx over the range where f isn’t 0.',
    'Combine the exponents: e^(tx)·e^(−x) = e^(−(1 − t)x). Integrate, and say which t keep it finite (here t < 1).',
    'Then E[X] = m′(0), E[X²] = m″(0) and Var X = m″(0) − (m′(0))².',
    'Shortcuts: (1 − βt)^(−α) has mean αβ and variance αβ². e^(μt + σ²t²/2) has mean μ and variance σ².',
  ],
  'Gamma integrals': [
    'Skip by parts for ∫₀^∞ xⁿe^(−x) dx (n a whole number): it is Γ(n + 1) = n!. So x⁴e^(−x) gives 4! = 24.',
    'With e^(−x/β): ∫₀^∞ x^(α−1)e^(−x/β) dx = Γ(α)·β^α.',
    'To make A·x^(α−1)e^(−x/β) a pdf: A = 1/(Γ(α)·β^α).',
    'That gamma pdf has mean αβ and variance αβ²; its MGF is (1 − βt)^(−α), for t < 1/β.',
  ],
}
