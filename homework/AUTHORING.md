# Writing a homework problem

Each file in this folder (`g1-….js` to `g7-….js`) adds the problems of one group from
`extraction/test-homework/`. `core.js` loads first and gives you `window.HW`.
`index.html` draws every problem: its story, each part with a hint, an answer check,
the steps one at a time, and the boxed answer. **Twins** are the same problem with new
numbers and a new story, so the student can practise until it sticks. The test is
"similar to the homework", so a twin is the closest thing to a test question.

Look at `g1-discrete-pdfs-cdfs-mgfs.js` problem `3.4-24` for a complete example.

## The shape of a problem

```js
;(() => {
  const R = String.raw            // so TeX backslashes stay single: R`\frac{1}{13}`
  const { num, fix, frac } = HW

  HW.add({
    id: '3.4-24',                 // section-number, unique
    section: '3.4', num: '24',    // shown as "3.4 #24"
    group: 1,                     // 1–7, the test-homework file
    title: 'Wildcat wells',       // a few words for lists
    hw: { ... },                  // the homework's own numbers (and story)
    twin: () => ({ ... }),        // new numbers and story, same kind of problem
    make: v => ({                 // builds the problem from hw or twin()
      text: R`The probability that a well … is \(1/13\). Let \(X\) …`,
      parts: [ PART, PART, ... ],
    }),
  })
})()
```

- `make(v)` must work for `hw` **and** for every `twin()`. With `hw` it must give the
  homework's exact wording (light rewording is fine, the numbers must match).
- `twin` is optional, but only leave it out when a problem is letters-only (a
  derivation with no numbers). Then the UI says "this one is the same every time".
- A twin must have every part label the homework version has (progress is saved by
  label, and the arcade cuts parts by label). It may add parts, and a write-it-out part
  may become one with a number to check; a `numbers` part keeps its count of numbers.
- Compute every number in code from `v`. Never type a result by hand: the twin needs it
  computed, and computing it for `hw` too means the homework answer can't be a typo.

## Text

`text`, `ask`, `hint`, `say`, `why`, `trap` and choice `text` are plain words with math in
`\( … \)` (inline) or `\[ … \]` (display). `**bold**` works. Everything else is literal.
`tex` (in steps, `answer`, choice `tex`) is TeX only, no `\( \)` around it.

## A part

```js
{
  label: 'a',                     // '' when the problem has one part
  ask: R`Verify that \(X\) is geometric, and identify \(p\).`,
  skill: 'label',                 // a key of HW.skills (see core.js)
  hint: 'What is X counting: successes in a fixed number of tries, or tries until something?',
  check: CHECK,
  answer: R`X \text{ is geometric with } p = \tfrac{1}{13}`,   // TeX, short, shown boxed
  steps: [STEP, ...],             // 2 to 7 steps
  trap: 'optional: the mistake people make here',
}
```

### check

- `{ type: 'number', value: 0.9231, tol: 0.0005, wrong: [0.0769, 0.8521] }`: one typed
  number. The student can type `12/13`, `.9231`, `92.31%`, `1-1/13` or `sqrt(156)`. Pick
  `tol` so every sensible rounding of the right answer passes and the common wrong answers
  fail. `wrong` (2 to 5 numbers, computed in code) is the mistakes people actually make:
  the complement, the off-by-one, p and q swapped, σ for σ², the exact value where the
  table value is asked. The arcade shows each part as a single question with choices, and
  these are its wrong choices (made-up ones fill in when there are fewer than 5).
- `{ type: 'numbers', items: [{ label: 'E[X]', value: 13, tol: 0.01, wrong: [...] }, …] }`:
  several typed numbers. `label` is TeX. In the arcade each item is its own question.
- `{ type: 'choice', options: [{ tex: … } or { text: … }, …], correct: 0 }`: 3 to 5
  options, the UI shuffles them. Wrong options are the real mistakes: p and q swapped,
  x instead of x − 1, a missing range, the wrong distribution. Never two right options.
- `{ type: 'self' }`: for "show", "derive", "verify", "sketch" and "explain". The student
  writes it on paper (or with the pen), then compares with the steps and marks
  themselves. Most derivations are `self`.

### a step

```js
{
  say: 'Success is a productive well, so p is its chance.',   // what we do, plain words
  tex: R`p = \frac{1}{13}, \qquad q = 1 - p = \frac{12}{13}`,  // optional, a string or an array of lines
  why: 'q is always 1 − p: each well either is productive or isn’t.',  // optional
  look: HW.zLook(1.57),            // optional: a window of a printed table, row and column lit
  graph: { … },                   // optional: a graph (see below)
}
```

Write steps for someone who missed the lecture. One idea per step. `say` is the move,
`tex` is what you'd write on the test, `why` is the reason in everyday words. Name the
formula before using it ("The geometric mean is 1/p"). Say where a number comes from
("q = 1 − 1/13"). Keep fractions exact while they're simple, then give the decimal.
The last step lands on the answer. Don't write "clearly", "obviously" or "simply".

### tables

The test gives printed tables, so table answers must come from them:

- Binomial (n = 10, 15, 19, 20): `HW.binomTable(n, p, x)` is P(X ≤ x) as printed;
  `HW.binomLook(n, p, x)` is the step's `look`. Twins that use the table must keep n in
  `HW.BINOM_NS` and p in `HW.BINOM_PS`.
- Normal: round z to 2 decimals first, then `HW.phi(z)` is the printed left area and
  `HW.zLook(z)` its look. Backwards, `HW.zFor(area)` gives `{ z, look }` (the closest
  printed entry; 1.645 when the area sits halfway).
- Chi-squared: `HW.chi(γ, leftArea)` is the printed value (a string like `'25.0'`);
  `HW.chiLook(γ, leftArea)` its look. Columns are LEFT areas; χ²ᵣ has area r on the
  RIGHT, so it lives in column 1 − r.

### graphs

`graph` takes the app's graph spec, drawn as an SVG:

- curve: `{ kind: 'curve', title, lo, hi, pdf: x => …, shade: [a, b] or shades: [[a, b], …], ticks: [...], marks: [...], note }`
- bars: `{ kind: 'bars', title, xs: [...], ys: [...], hits: new Set([...]), note }`

Use one where a picture helps: a shaded area for a probability, a sketch the problem asks for.

## Helpers in core.js

`HW.choose`, `HW.fact`, `HW.gamma`, `HW.binom.pmf/cdf`, `HW.pois.pmf/cdf`,
`HW.hyper.pmf/lo/hi`, the table helpers above, `HW.num(x, d)` (round, drop trailing
zeros), `HW.fix(x, d)` (exactly d decimals), `HW.frac(n, d)` (reduced TeX fraction),
`HW.fracText(n, d)`, and `HW.rand.int/pick/chance/shuffle/step` for twins.

## Checking your file

    node /path/to/scratchpad/check.js homework/g1-discrete-pdfs-cdfs-mgfs.js

builds every problem with its homework numbers and with 200 twins, checks the shape,
the numbers and that every piece of TeX typesets, and prints the homework answers so
you can compare them with your own working.
