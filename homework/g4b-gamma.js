// Group 4 (second file): gamma integrals and the gamma distribution (4.3 #25, 29)
;(() => {
  const R = String.raw
  const { num, frac, fact } = HW

  // x^n as TeX: 'x' for n = 1, 'x^{n}' otherwise
  const pow = (v, n) => (n === 1 ? v : `${v}^{${n}}`)
  // e^{-x/β} as TeX ('e^{-x}' when β = 1)
  const expo = (v, b) => (b === 1 ? `e^{-${v}}` : `e^{-${v}/${b}}`)
  // the gamma density with whole-number α and any β > 0
  const gammaPdf = (a, b) => x => (x <= 0 ? 0 : (x ** (a - 1) * Math.exp(-x / b)) / (fact(a - 1) * b ** a))
  // tolerance for a whole-number or simple answer
  const tolFor = x => Math.max(0.005, Math.abs(x) * 1e-4)
  // n! written out: 4! = 4·3·2·1
  const factOut = n => (n <= 1 ? '1' : Array.from({ length: n }, (_, i) => n - i).join(R` \cdot `))
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

  // ---------- 4.3 #25: gamma integrals ----------
  // (a), (b): ∫ z^n e^{-z} dz = Γ(n + 1) = n!
  // (c): ∫ x^n e^{-x/β} dx = Γ(n + 1) β^(n+1)
  // (d): ∫ (1/D) x^n e^{-x/β} dx = Γ(n + 1) β^(n+1) / D  (D = Γ(α)β^α makes it a gamma density)
  HW.add({
    id: '4.3-25',
    section: '4.3',
    num: '25',
    group: 4,
    title: 'Gamma integrals',
    hw: { na: 2, nb: 7, nc: 3, bc: 2, nd: 1, bd: 4, dd: 16 },
    twin: () => {
      const na = HW.rand.int(2, 4)
      const nb = HW.rand.int(5, 9)
      let nc, bc
      do {
        nc = HW.rand.int(1, 4)
        bc = HW.rand.int(2, 6)
      } while (fact(nc) * bc ** (nc + 1) > 30000 || (nc === 3 && bc === 2))
      let nd, bd
      do {
        nd = HW.rand.int(1, 3)
        bd = HW.rand.int(2, 5)
      } while (fact(nd) * bd ** (nd + 1) > 600 || (nd === nc && bd === bc))
      const G = fact(nd) * bd ** (nd + 1)
      const r = Math.random()
      const dd = r < 0.5 ? G : r < 0.75 ? 2 * G : G % 2 === 0 ? G / 2 : G
      return { na, nb, nc, bc, nd, bd, dd }
    },
    make: v => {
      const { na, nb, nc, bc, nd, bd, dd } = v
      // (c)
      const ac = nc + 1, Gc = fact(nc) * bc ** ac
      // (d)
      const ad = nd + 1, Gd = fact(nd) * bd ** ad, ansD = Gd / dd
      const ansDT = frac(Gd, dd)
      const dWhy =
        dd === Gd
          ? R`That is no accident. The gamma density with \(\alpha = ${ad}\) and \(\beta = ${bd}\) is \(\frac{1}{\Gamma(${ad})\,${bd}^{${ad}}}${pow('x', nd)}${expo('x', bd)} = \frac{1}{${Gd}}${pow('x', nd)}${expo('x', bd)}\): exactly what we integrated. The area under any density is 1.`
          : dd > Gd
            ? R`Another way to see it: the gamma density with \(\alpha = ${ad}\) and \(\beta = ${bd}\) has the constant \(\frac{1}{${Gd}}\). Here the constant is \(\frac{1}{${dd}}\), half of that, so the area is half of 1.`
            : R`Another way to see it: the gamma density with \(\alpha = ${ad}\) and \(\beta = ${bd}\) has the constant \(\frac{1}{${Gd}}\). Here the constant is \(\frac{1}{${dd}}\), twice that, so the area is twice 1.`
      const gd = gammaPdf(ad, bd), hiD = ad * bd + 4 * bd * Math.sqrt(ad)
      const plainGamma = (n, letter) => [
        {
          say: 'This is the gamma function from the formula sheet. Write its definition next to the integral.',
          tex: R`\Gamma(\alpha) = \int_0^\infty z^{\alpha - 1} e^{-z}\,dz`,
          why: 'Same shape: a power of z times e^(−z), integrated from 0 to ∞.',
        },
        {
          say: `Match the powers. Our power is ${n}, and the definition’s power is α − 1.`,
          tex: R`\alpha - 1 = ${n} \;\Rightarrow\; \alpha = ${n + 1} \;\Rightarrow\; \int_0^\infty ${pow(letter, n)} e^{-${letter}}\,d${letter} = \Gamma(${n + 1})`,
        },
        {
          say: 'α is a whole number, so Γ(α) = (α − 1)!.',
          tex: n === 1 ? R`\Gamma(2) = 1! = 1` : R`\Gamma(${n + 1}) = ${n}! = ${factOut(n)} = ${fact(n)}`,
          why: n <= 3
            ? R`It comes from \(\Gamma(\alpha) = (\alpha - 1)\Gamma(\alpha - 1)\) and \(\Gamma(1) = 1\): ${n === 1 ? R`\(\Gamma(2) = 1 \cdot \Gamma(1) = 1\)` : n === 2 ? R`\(\Gamma(3) = 2\,\Gamma(2) = 2 \cdot 1 \cdot \Gamma(1) = 2\)` : R`\(\Gamma(4) = 3\,\Gamma(3) = 3 \cdot 2\,\Gamma(2) = 3 \cdot 2 \cdot 1 = 6\)`}.`
            : R`Shortcut worth remembering: \(\int_0^\infty z^n e^{-z}\,dz = n!\). The power becomes the factorial.`,
        },
      ]
      return {
        text: R`Evaluate each of these integrals: \[\text{(a)}\ \int_0^\infty ${pow('z', na)} e^{-z}\,dz \qquad \text{(b)}\ \int_0^\infty ${pow('z', nb)} e^{-z}\,dz\] \[\text{(c)}\ \int_0^\infty ${pow('x', nc)} ${expo('x', bc)}\,dx \qquad \text{(d)}\ \int_0^\infty (1/${dd})\,${pow('x', nd)} ${expo('x', bd)}\,dx\]`,
        parts: [
          {
            label: 'a',
            ask: R`\(\displaystyle\int_0^\infty ${pow('z', na)} e^{-z}\,dz\)`,
            skill: 'gamma-fn',
            hint: 'Compare it with the definition of Γ(α) on the formula sheet. What is α − 1 here?',
            // wrong: Γ(α) = α! (so (n + 1)!), and α = n (so (n − 1)!)
            check: { type: 'number', value: fact(na), tol: tolFor(fact(na)), wrong: wrongs(fact(na), tolFor(fact(na)), [fact(na + 1), fact(na - 1)]) },
            answer: R`\int_0^\infty ${pow('z', na)} e^{-z}\,dz = \Gamma(${na + 1}) = ${na}! = ${fact(na)}`,
            steps: plainGamma(na, 'z'),
            trap: `The power is α − 1, so a power of ${na} means α = ${na + 1}, and Γ(${na + 1}) = ${na}! = ${fact(na)}. Writing ${na + 1}! = ${fact(na + 1)} is the classic slip.`,
          },
          {
            label: 'b',
            ask: R`\(\displaystyle\int_0^\infty ${pow('z', nb)} e^{-z}\,dz\)`,
            skill: 'gamma-fn',
            hint: 'Same idea as (a): it is a gamma function. Find α from the power.',
            check: { type: 'number', value: fact(nb), tol: tolFor(fact(nb)), wrong: wrongs(fact(nb), tolFor(fact(nb)), [fact(nb + 1), fact(nb - 1)]) },
            answer: R`\int_0^\infty ${pow('z', nb)} e^{-z}\,dz = \Gamma(${nb + 1}) = ${nb}! = ${fact(nb)}`,
            steps: plainGamma(nb, 'z'),
            trap: `Γ(${nb + 1}) is ${nb}! = ${fact(nb)}, not ${nb + 1}! = ${fact(nb + 1)}.`,
          },
          {
            label: 'c',
            ask: R`\(\displaystyle\int_0^\infty ${pow('x', nc)} ${expo('x', bc)}\,dx\)`,
            skill: 'gamma-fn',
            hint: `The exponent is −x/${bc}, not −x, so it isn’t Γ(α) on the nose. Substitute z = x/${bc}, or use the fact that a gamma density integrates to 1.`,
            // wrong: no dx = β dz factor (β^(α−1)), Γ(α) = α!, β ignored (a plain Γ), divided by β^α
            check: { type: 'number', value: Gc, tol: tolFor(Gc), wrong: wrongs(Gc, tolFor(Gc), [fact(nc) * bc ** nc, fact(ac) * bc ** ac, fact(nc), fact(nc) / bc ** ac]) },
            answer: R`\int_0^\infty ${pow('x', nc)} ${expo('x', bc)}\,dx = \Gamma(${ac})\,${bc}^{${ac}} = ${Gc}`,
            steps: [
              {
                say: 'Use the gamma integral formula. It comes from the gamma density: its total area is 1.',
                tex: [
                  R`\int_0^\infty \frac{1}{\Gamma(\alpha)\beta^\alpha}\,x^{\alpha-1}e^{-x/\beta}\,dx = 1`,
                  R`\Rightarrow\quad \int_0^\infty x^{\alpha-1}e^{-x/\beta}\,dx = \Gamma(\alpha)\,\beta^\alpha`,
                ],
                why: 'The constant 1/(Γ(α)β^α) can come out of the integral. Multiply both sides by Γ(α)β^α and it is gone.',
              },
              {
                say: `Match our integral to x^(α−1) e^(−x/β): the power of x is α − 1, and the number dividing x in the exponent is β.`,
                tex: R`\alpha - 1 = ${nc} \;\Rightarrow\; \alpha = ${ac}, \qquad ${expo('x', bc)} = e^{-x/\beta} \;\Rightarrow\; \beta = ${bc}`,
              },
              {
                say: 'Put them in. Γ(α) = (α − 1)!.',
                tex: R`\Gamma(${ac})\,${bc}^{${ac}} = ${nc}! \cdot ${bc ** ac} = ${fact(nc)} \cdot ${bc ** ac} = ${Gc}`,
                why: `The same α goes in both places: Γ(${ac}) and ${bc} to the power ${ac}. Both are one more than the power of x.`,
              },
              {
                say: `The same answer by substitution, if you prefer: let z = x/${bc}, so x = ${bc}z and dx = ${bc} dz.`,
                tex: R`\int_0^\infty ${pow(`(${bc}z)`, nc)} e^{-z}\,${bc}\,dz = ${pow(String(bc), nc)} \cdot ${bc}\int_0^\infty ${pow('z', nc)} e^{-z}\,dz = ${bc}^{${ac}}\,\Gamma(${ac}) = ${Gc}`,
                why: nc === 1
                  ? R`The substitution turns it into a plain gamma function like (a) and (b). One ${bc} comes from \(x = ${bc}z\) and one more from \(dx = ${bc}\,dz\): \(${bc}^{2}\) in all, and \(2 = \alpha\).`
                  : R`The substitution turns it into a plain gamma function like (a) and (b). \(${bc}^{${nc}}\) comes from \(x = ${bc}z\) inside the power, and one more ${bc} from \(dx = ${bc}\,dz\): \(${bc}^{${ac}}\) in all, and \(${ac} = \alpha\).`,
              },
            ],
            trap: `Forgetting the dx = ${bc} dz factor gives ${bc}^${nc}·Γ(${ac}) = ${bc ** nc * fact(nc)}. The power on β is α = ${ac}, not α − 1 = ${nc}.`,
          },
          {
            label: 'd',
            ask: R`\(\displaystyle\int_0^\infty (1/${dd})\,${pow('x', nd)} ${expo('x', bd)}\,dx\)`,
            skill: 'gamma-fn',
            hint: 'Pull the constant out front, then treat what is left like (c).',
            // wrong: the 1/D forgotten, Γ(α) = α!, β^(α−1), and “it looks like a density, so 1”
            check: { type: 'number', value: ansD, tol: tolFor(ansD), wrong: wrongs(ansD, tolFor(ansD), [Gd, (fact(ad) * bd ** ad) / dd, ansD / bd, 1]) },
            answer: R`\int_0^\infty \tfrac{1}{${dd}}\,${pow('x', nd)} ${expo('x', bd)}\,dx = \frac{\Gamma(${ad})\,${bd}^{${ad}}}{${dd}} = ${ansDT}`,
            steps: [
              {
                say: 'Pull the constant out of the integral.',
                tex: R`\int_0^\infty \frac{1}{${dd}}\,${pow('x', nd)} ${expo('x', bd)}\,dx = \frac{1}{${dd}}\int_0^\infty ${pow('x', nd)} ${expo('x', bd)}\,dx`,
              },
              {
                say: nd === 1 ? 'Match what is left to x^(α−1) e^(−x/β). A plain x is x¹.' : 'Match what is left to x^(α−1) e^(−x/β).',
                tex: R`\alpha - 1 = ${nd} \;\Rightarrow\; \alpha = ${ad}, \qquad ${expo('x', bd)} = e^{-x/\beta} \;\Rightarrow\; \beta = ${bd}`,
              },
              {
                say: 'Use the gamma integral formula from (c), and Γ(α) = (α − 1)!.',
                tex: R`\int_0^\infty ${pow('x', nd)} ${expo('x', bd)}\,dx = \Gamma(${ad})\,${bd}^{${ad}} = ${nd}! \cdot ${bd ** ad} = ${fact(nd)} \cdot ${bd ** ad} = ${Gd}`,
              },
              {
                say: 'Multiply by the constant you pulled out.',
                tex: R`\frac{1}{${dd}} \cdot ${Gd} = ${ansDT}${Number.isInteger(ansD) ? '' : R` = ${num(ansD, 4)}`}`,
                why: dWhy,
                graph: { kind: 'curve', title: `gamma · α = ${ad}, β = ${bd}`, lo: 0, hi: hiD, pdf: gd, shade: [0, hiD], ticks: [0, ad * bd], note: `the gamma density with α = ${ad}, β = ${bd}: its whole area is 1` },
              },
            ],
            trap: dd === Gd ? `Stopping at ${Gd} forgets the 1/${dd} in front. Spotting the gamma density saves the work: a density always integrates to 1.` : `It looks like a gamma density, but check the constant: a density with α = ${ad}, β = ${bd} needs 1/${Gd}, not 1/${dd}.`,
          },
        ],
      }
    },
  })

  // ---------- 4.3 #29: gamma with α and β: density, MGF, mean and variance ----------
  const GAMMA_STORIES = [
    (a, b) => R`Let \(X\) be a gamma random variable with \(\alpha = ${a}\) and \(\beta = ${b}\).`,
    (a, b) => R`The time \(X\) (in minutes) that a bank teller spends with a customer is a gamma random variable with \(\alpha = ${a}\) and \(\beta = ${b}\).`,
    (a, b) => R`The amount of rain \(X\) (in millimetres) that falls in one storm in a dry region is a gamma random variable with \(\alpha = ${a}\) and \(\beta = ${b}\).`,
    (a, b) => R`The lifetime \(X\) (in hundreds of hours) of a pump seal is a gamma random variable with \(\alpha = ${a}\) and \(\beta = ${b}\).`,
  ]

  HW.add({
    id: '4.3-29',
    section: '4.3',
    num: '29',
    group: 4,
    title: 'Gamma: density, MGF, mean',
    hw: { a: 3, b: 4, s: 0 },
    twin: () => {
      let a, b
      do {
        a = HW.rand.int(2, 5)
        b = HW.rand.pick([2, 3, 4, 5, 6, 10])
      } while (a === b || fact(a - 1) * b ** a > 100000 || (a === 3 && b === 4))
      return { a, b, s: HW.rand.int(1, GAMMA_STORIES.length - 1) }
    },
    make: v => {
      const { a, b } = v
      const Ga = fact(a - 1), Bp = b ** a, G = Ga * Bp
      const mu = a * b, varX = a * b * b, sd = Math.sqrt(varX), ex2 = a * (a + 1) * b * b
      const xp = pow('x', a - 1)
      const dens = R`f(x) = \frac{1}{${G}}\,${xp}e^{-x/${b}}, \quad x > 0`
      const mgf = R`(1 - ${b}t)^{-${a}}`
      const sqA = Math.round(Math.sqrt(a))
      const sdExact = sqA * sqA === a ? R` = ${b} \cdot ${sqA} = ${sd}` : R` = ${b}\sqrt{${a}} \approx ${num(sd, 4)}`
      const pdf = gammaPdf(a, b)
      return {
        text: GAMMA_STORIES[v.s](a, b),
        parts: [
          {
            label: 'a',
            ask: R`What is the expression for the density for \(X\)?`,
            skill: 'formulas',
            hint: 'Write the gamma density from the formula sheet, then put in α and β. Work out Γ(α) as a number.',
            check: {
              type: 'choice',
              options: [
                { tex: dens },
                { tex: R`f(x) = \frac{1}{${fact(b - 1) * a ** b}}\,${pow('x', b - 1)}e^{-x/${a}}, \quad x > 0` },
                { tex: R`f(x) = \frac{1}{${fact(a) * Bp}}\,${xp}e^{-x/${b}}, \quad x > 0` },
                { tex: R`f(x) = \frac{1}{${G}}\,${pow('x', a)}e^{-x/${b}}, \quad x > 0` },
                { tex: R`f(x) = \frac{1}{${G}}\,${xp}e^{-${b}x}, \quad x > 0` },
              ],
              correct: 0,
            },
            answer: dens,
            steps: [
              {
                say: 'Start from the gamma density on the formula sheet.',
                tex: R`f(x) = \frac{1}{\Gamma(\alpha)\,\beta^\alpha}\,x^{\alpha-1}e^{-x/\beta}, \quad x > 0`,
              },
              {
                say: `Put in α = ${a} and β = ${b}.`,
                tex: R`f(x) = \frac{1}{\Gamma(${a})\,${b}^{${a}}}\,x^{${a}-1}e^{-x/${b}}`,
                why: 'α goes in three places: Γ(α), the power on β, and the power α − 1 on x. β goes in two: β^α and the e^(−x/β).',
              },
              {
                say: 'Work out the constant. Γ(α) = (α − 1)!.',
                tex: R`\Gamma(${a}) = ${a - 1}! = ${Ga}, \qquad ${b}^{${a}} = ${Bp}, \qquad \Gamma(${a})\,${b}^{${a}} = ${Ga} \cdot ${Bp} = ${G}`,
              },
              {
                say: 'Write the density, with its range.',
                tex: dens,
                graph: { kind: 'curve', title: `gamma · α = ${a}, β = ${b}`, lo: 0, hi: mu + 4 * sd, pdf, ticks: [0, mu], note: `the peak is at (α − 1)β = ${(a - 1) * b}; the mean αβ = ${mu}` },
              },
            ],
            trap: `Γ(${a}) is ${a - 1}! = ${Ga}, not ${a}! = ${fact(a)}. And the exponent is −x/β = −x/${b}, not −${b}x.`,
          },
          {
            label: 'b',
            ask: R`What is the moment generating function for \(X\)?`,
            skill: 'cont-mgf',
            hint: 'm(t) = E[e^(tX)]: integrate e^(tx) times the density from (a). Combine the two exponentials into one.',
            check: {
              type: 'choice',
              options: [
                { tex: R`m_X(t) = ${mgf}` },
                { tex: R`m_X(t) = (1 - ${a}t)^{-${b}}` },
                { tex: R`m_X(t) = \left(1 - \frac{t}{${b}}\right)^{-${a}}` },
                { tex: R`m_X(t) = (1 - ${b}t)^{${a}}` },
              ],
              correct: 0,
            },
            answer: R`m_X(t) = ${mgf}, \quad t < \tfrac{1}{${b}}`,
            steps: [
              {
                say: 'Start from the definition: the MGF is the expected value of e^(tX). For a continuous X, integrate e^(tx) times the density.',
                tex: R`m_X(t) = E\left[e^{tX}\right] = \int_0^\infty e^{tx}\,\frac{1}{${G}}\,${xp}e^{-x/${b}}\,dx`,
              },
              {
                say: 'Combine the two exponentials, and write the result as e^(−x/(new β)).',
                tex: R`e^{tx}e^{-x/${b}} = e^{-x\left(\frac{1}{${b}} - t\right)} = e^{-x(1 - ${b}t)/${b}} = e^{-x/\beta^*}, \qquad \beta^* = \frac{${b}}{1 - ${b}t}`,
                why: `To use the gamma integral, the exponent has to look like −x/(something). It also has to be negative: we need 1 − ${b}t > 0, that is t < 1/${b}. Otherwise e^(…) grows and the integral is infinite.`,
              },
              {
                say: 'Now it is a gamma integral with α = ' + a + ' and β*. Use the formula from 4.3 #25.',
                tex: R`\int_0^\infty ${xp}e^{-x/\beta^*}\,dx = \Gamma(${a})\,(\beta^*)^{${a}} = ${Ga === 1 ? '' : Ga}\left(\frac{${b}}{1 - ${b}t}\right)^{${a}} = \frac{${G}}{(1 - ${b}t)^{${a}}}`,
              },
              {
                say: `Multiply by the 1/${G} that was in front.`,
                tex: R`m_X(t) = \frac{1}{${G}} \cdot \frac{${G}}{(1 - ${b}t)^{${a}}} = ${mgf}, \quad t < \tfrac{1}{${b}}`,
              },
              {
                say: 'Check it against the table: the gamma MGF is (1 − βt)^(−α).',
                tex: R`(1 - \beta t)^{-\alpha} = ${mgf}`,
                why: 'If a test only asks "what is the MGF", the table answer is enough. If it says "derive", write the integral steps above.',
              },
            ],
            trap: 'The 1 − βt has β in it (the scale), and the power is −α. Swapping α and β, or flipping the sign of the power, gives a different distribution.',
          },
          {
            label: 'c',
            ask: R`Find \(\mu\), \(\sigma^2\), and \(\sigma\).`,
            skill: 'mgf-moments',
            hint: 'Gamma: μ = αβ and σ² = αβ². Or take m′(0) and m″(0) from the MGF in (b).',
            check: {
              type: 'numbers',
              items: [
                // μ: αβ² (the variance), α/β (the rate form), (α − 1)β (the peak)
                { label: R`\mu`, value: mu, tol: 0.01, wrong: wrongs(mu, 0.01, [varX, a / b, (a - 1) * b]) },
                // σ²: αβ (the mean), μ², E[X²] without − μ², σ
                { label: R`\sigma^2`, value: varX, tol: 0.05, wrong: wrongs(varX, 0.05, [mu, mu * mu, ex2, sd]) },
                // σ: σ² (no square root), √(αβ), αβ
                { label: R`\sigma`, value: sd, tol: 0.01, wrong: wrongs(sd, 0.01, [varX, Math.sqrt(mu), mu]) },
              ],
            },
            answer: R`\mu = ${mu},\ \sigma^2 = ${varX},\ \sigma ${Number.isInteger(sd) ? '=' : R`\approx`} ${num(sd, 2)}`,
            steps: [
              {
                say: 'The gamma mean is αβ.',
                tex: R`\mu = \alpha\beta = ${a} \cdot ${b} = ${mu}`,
              },
              {
                say: 'The gamma variance is αβ².',
                tex: R`\sigma^2 = \alpha\beta^2 = ${a} \cdot ${b}^2 = ${a} \cdot ${b * b} = ${varX}`,
              },
              {
                say: 'σ is the square root of the variance.',
                tex: R`\sigma = \sqrt{${varX}}${sdExact}`,
              },
              {
                say: 'The MGF route (use it when the test says “use the MGF”): E[X] = m′(0). Take the derivative with the chain rule, then put in t = 0.',
                tex: R`m_X'(t) = -${a}(1 - ${b}t)^{-${a + 1}} \cdot (-${b}) = ${a * b}(1 - ${b}t)^{-${a + 1}}, \qquad m_X'(0) = ${mu}`,
                why: 'The derivative of the inside, 1 − βt, is −β. The two minus signs cancel.',
              },
              {
                say: 'Then E[X²] = m″(0): take one more derivative and put in t = 0. Then σ² = E[X²] − μ².',
                tex: [
                  R`m_X''(t) = ${a * b} \cdot (-${a + 1})(1 - ${b}t)^{-${a + 2}} \cdot (-${b}) = ${ex2}(1 - ${b}t)^{-${a + 2}}, \qquad E[X^2] = m_X''(0) = ${ex2}`,
                  R`\sigma^2 = ${ex2} - ${mu}^2 = ${ex2} - ${mu * mu} = ${varX}`,
                ],
                why: `The power −${a + 1} comes down in front, and the chain rule gives another −β = −${b}. Same answers as αβ and αβ².`,
              },
            ],
            trap: 'The variance is αβ², not αβ. And σ is the square root of the variance, not the variance itself.',
          },
        ],
      }
    },
  })
})()
