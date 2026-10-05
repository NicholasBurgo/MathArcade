// Group 6: chi-squared and normal tables (4.3 #38; 4.4 #39, 40, 42, 43)
;(() => {
  const R = String.raw
  const { num, fix } = HW
  const { pick, chance, shuffle, step } = HW.rand

  // ---------- writing numbers the book's way ----------
  // an area or a subscript: .05, .10, .975 (at least 2 decimals, no 0 in front)
  const bk = x => {
    const r = +(+x).toFixed(6)
    const d = Math.max(2, (String(r).split('.')[1] || '').length)
    return r.toFixed(d).replace(/^(-?)0\./, '$1.')
  }
  // a printed normal-table area: .9418
  const a4 = x => fix(x, 4).replace(/^(-?)0\./, '$1.')
  // z in TeX: 1.57, -1.28, and 3 decimals when it sits halfway (1.645)
  const zt = z => (Math.abs(Math.round(z * 1000)) % 10 ? z.toFixed(3) : z.toFixed(2))
  // the same in plain words, with a real minus sign
  const zw = z => zt(z).replace('-', '−')
  const minus = s => String(s).replace(/^-/, '−')
  const pct = r => String(+(r * 100).toFixed(4))
  // a typed probability: tight, and never more than 15% of the answer
  const tolP = p => (p > 0 ? Math.min(0.0005, 0.15 * p) : 0.0005)
  // a printed chi-squared value ('25.0', '7.26'): a bit more than half a unit in its last place
  const tolChi = s => 0.6 * 10 ** -((String(s).split('.')[1] || '').length)
  // an x found from a z: allow the neighbouring table z (halfway rule) and rounding to the data's
  // decimals, but never more than 0.1σ (so a wrong z still fails)
  const tolX = (sig, dp) => +Math.min(0.1 * sig, Math.max(0.006 * sig, 0.5 * 10 ** -dp)).toFixed(10)
  // how often something happens, in words: 'about 6 in 1000 samples'
  const often = (p, noun) => {
    if (p < 0.001) {
      const k = Math.round(p * 10000)
      return k ? `about ${k} in 10,000 ${noun}` : `fewer than 1 in 10,000 ${noun}`
    }
    if (p < 0.01) return `about ${Math.round(p * 1000)} in 1000 ${noun}`
    if (p < 0.1) return `about ${Math.round(p * 100)} in 100 ${noun}`
    return `about 1 in ${Math.round(1 / p)} ${noun}`
  }
  // the arcade's wrong choices: the real mistakes, minus any that land on the answer (within
  // 1.5 tol) or repeat another; prob = a probability, so 0 and 1 and beyond are dropped
  const W = (value, tol, list, prob = false) => {
    const out = [], seen = new Set()
    for (const x of list) {
      if (!Number.isFinite(x)) continue
      const w = +x.toFixed(6)
      if ((prob && (w <= 0 || w >= 1)) || Math.abs(w - value) <= 1.5 * tol + 1e-9) continue
      const k = +w.toPrecision(4)
      if (seen.has(k)) continue
      seen.add(k)
      out.push(w)
      if (out.length === 5) break
    }
    return out
  }
  // z with its 2nd decimal cut off instead of rounded (1.6667 → 1.66): the "didn't round" slip
  const trunc2 = z => Math.trunc(z * 100 + (z < 0 ? -1e-9 : 1e-9)) / 100
  // the height of the standard normal curve (people give it for P[Z = z])
  const dens0 = z => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI)
  // a choice with the right option first; a wrong option that happens to read the same is dropped
  const choice = (right, wrongs) => {
    const key = o => (o.tex ?? o.text).replace(/\s+/g, '')
    const seen = new Set([key(right)])
    const options = [right]
    for (const w of wrongs) if (!seen.has(key(w)) && options.length < 5) { seen.add(key(w)); options.push(w) }
    return { type: 'choice', options, correct: 0 }
  }

  // ---------- the normal table ----------
  // forward: the printed left area at z, and where it sits
  const leftAt = z => {
    const c = HW.zCell(z)
    return { p: HW.phi(z), look: HW.zLook(z), where: `row ${minus(c.row)}, column ${bk(c.col)}` }
  }
  // backwards: the z whose printed left area is closest to A (halfway z when two are equally close).
  // other: the printed z on the other side of A, when it is clearly farther (a real near miss), else null
  const zBack = A => {
    const f = HW.zFor(A)
    const [c0, c1] = f.cells
    const makes = z => {
      const c = HW.zCell(z)
      return `row ${minus(c.row)} and column ${bk(c.col)} make z = ${zw(z)}`
    }
    const look = `Look for ${bk(A)} INSIDE the table, among the areas (not among the z’s).`
    let say, other = null
    if (f.halfway) {
      say = `${look} It is not printed: it sits exactly halfway between ${a4(+c0.entry)} (z = ${zw(c0.z)}) and ${a4(+c1.entry)} (z = ${zw(c1.z)}). Use the z halfway between them: ${zw(f.z)}.`
    } else if (Math.abs(+c0.entry - A) < 1e-9) {
      say = `${look} It is printed exactly: ${a4(A)}, where ${makes(f.z)}.`
    } else {
      // step along the table to the first entry on the other side of A
      const dir = +c0.entry < A ? 1 : -1
      let z = f.z
      for (let i = 0; i < 50 && (HW.phi(z) - A) * dir <= 0; i++) z = Math.round((z + dir * 0.01) * 100) / 100
      if (Math.abs(HW.phi(z) - A) - Math.abs(+c0.entry - A) >= 0.0005 - 1e-9) other = z
      const [lo, hi] = dir > 0 ? [f.z, z] : [z, f.z]
      say = `${look} It is not printed exactly. The entries on either side are ${a4(HW.phi(lo))} (z = ${zw(lo)}) and ${a4(HW.phi(hi))} (z = ${zw(hi)}). ${a4(+c0.entry)} is closer (${a4(Math.abs(+c0.entry - A))} away, against ${a4(Math.abs(HW.phi(z) - A))}), so ${makes(f.z)}.`
    }
    const why = f.halfway
      ? 'The book’s rule: when the area is exactly halfway between two entries, use the z halfway between them.'
      : f.z < 0
      ? 'Less than half the area is to the left, so the point is below the middle: z is negative.'
      : 'More than half the area is to the left, so the point is above the middle: z is positive.'
    return { z: f.z, look: f.look, say, why, halfway: f.halfway, other }
  }

  // ---------- graphs ----------
  const bell = (mu, sig) => x => Math.exp(-((x - mu) ** 2) / (2 * sig * sig)) / (sig * Math.sqrt(2 * Math.PI))
  // a normal curve from μ − 3.6σ to μ + 3.6σ; ticks at the cut points, then μ and μ ± kσ where there is room
  const normalGraph = ({ mu = 0, sig = 1, shades = [], cuts = [], note }) => {
    const lo = mu - 3.6 * sig, hi = mu + 3.6 * sig
    const ticks = cuts.filter(c => c > lo && c < hi).map(c => +c.toFixed(6))
    for (const k of [0, -1, 1, -2, 2, -3, 3]) {
      const t = +(mu + k * sig).toFixed(6)
      if (ticks.every(u => Math.abs(u - t) > 0.45 * sig)) ticks.push(t)
    }
    return {
      kind: 'curve',
      title: mu === 0 && sig === 1 ? 'standard normal · Z, μ = 0, σ = 1' : `normal · μ = ${num(mu, 4)}, σ = ${num(sig, 4)}`,
      lo,
      hi,
      pdf: bell(mu, sig),
      shades: shades.map(([a, b]) => [Math.max(a, lo), Math.min(b, hi)]).filter(([a, b]) => b > a),
      ticks: ticks.sort((a, b) => a - b),
      ...(note ? { note } : {}),
    }
  }
  // the chi-squared density: gamma with α = γ/2, β = 2
  const chiPdf = g => {
    const c = Math.log(HW.gamma(g / 2)) + (g / 2) * Math.log(2)
    return x => (x <= 0 ? 0 : Math.exp((g / 2 - 1) * Math.log(x) - x / 2 - c))
  }
  const chiGraph = (g, shades, cuts, note) => {
    const hi = Math.max(g + 5 * Math.sqrt(2 * g), ...cuts.map(c => c * 1.15))
    const ticks = []
    for (const t of [...cuts].sort((a, b) => a - b)) if (ticks.every(u => Math.abs(u - t) > 0.07 * hi)) ticks.push(t)
    if (ticks.every(u => u > 0.07 * hi)) ticks.unshift(0)
    return { kind: 'curve', title: `chi-squared · γ = ${g}`, lo: 0, hi, pdf: chiPdf(g), shades: shades.map(([a, b]) => [Math.max(0, a), Math.min(hi, b)]), ticks, note }
  }

  // ---------- normal word problems: x → z → area, and back ----------
  // the z-score of x, rounded to 2 decimals for the table. F writes a data value (x and x − μ).
  const zOf = (x, mu, sig, F, name = 'z') => {
    const raw = (x - mu) / sig
    const z = Math.round(raw * 100) / 100
    const exact = Math.abs(raw * 100 - Math.round(raw * 100)) < 1e-6
    const tex = R`${name} = \frac{x - \mu}{\sigma} = \frac{${F(x)} - ${num(mu, 6)}}{${num(sig, 6)}} = \frac{${F(x - mu)}}{${num(sig, 6)}} ${exact ? '=' : R`\approx`} ${zt(z)}`
    return { z, raw, exact, tex }
  }
  // the reason to give when a z had to be rounded
  const roundWhy = zs => {
    const r = zs.filter(q => !q.exact)
    if (!r.length) return null
    const long = q => num(q.raw, 4).replace('-', '−') + (num(q.raw, 4) === num(q.raw, 9) ? '' : '…')
    return `Round z to 2 decimals before you use the table: ${r.map(q => `${long(q)} → ${zw(q.z)}`).join(', ')}.`
  }
  // back from z to x
  const xFromZ = (z, mu, sig) => {
    const x = mu + z * sig, d = Math.abs(z) * sig
    const eq = num(x, 6) === num(x, 4) ? '=' : R`\approx`
    return { x, tex: R`x = ${num(mu, 6)} + (${zt(z)})(${num(sig, 6)}) = ${num(mu, 6)} ${z < 0 ? '-' : '+'} ${num(d, 6)} ${eq} ${num(x, 4)}` }
  }
  const SYM = { [R`\le`]: '≤', '<': '<', [R`\ge`]: '≥', '>': '>' }

  // P[a ≤ X ≤ b]: shade, two z's, two look-ups, subtract
  const betweenPart = ({ label, ask, mu, sig, a, b, F, sketch = false }) => {
    const za = zOf(a, mu, sig, F, 'z_1'), zb = zOf(b, mu, sig, F, 'z_2')
    const La = leftAt(za.z), Lb = leftAt(zb.z), p = Lb.p - La.p
    // the outside instead of the inside, one end only, adding, a dropped minus sign, subtracting the z's, z cut instead of rounded
    const wrong = W(p, tolP(p), [1 - p, Lb.p, La.p, Lb.p + La.p, za.z < 0 && zb.z > 0 ? Lb.p - HW.phi(-za.z) : NaN, HW.phi(zb.z - za.z), HW.phi(trunc2(zb.raw)) - HW.phi(trunc2(za.raw))], true)
    const ev = R`P[${F(a)} \le X \le ${F(b)}]`
    const graph = normalGraph({ mu, sig, shades: [[a, b]], cuts: [a, b], note: `shaded: P[${F(a)} ≤ X ≤ ${F(b)}] = ${a4(p)}` })
    const s3 = k => num(mu + k * sig, 4)
    return {
      label,
      ask,
      skill: 'normal-word',
      hint: 'Shade the area between the two values. Turn each one into a z with z = (x − μ)/σ, then use left areas from the table.',
      check: { type: 'number', value: p, tol: tolP(p), wrong },
      answer: R`${ev} = ${a4(p)}`,
      steps: [
        sketch
          ? {
              say: `Sketch the density: a bell, symmetric about μ = ${num(mu, 6)}. Mark μ ± σ (${s3(-1)} and ${s3(1)}), μ ± 2σ (${s3(-2)} and ${s3(2)}) and μ ± 3σ (${s3(-3)} and ${s3(3)}) on the axis. Then shade the area between ${F(a)} and ${F(b)}: that area is the probability.`,
              graph,
              why: 'The curve is highest at μ and bends at μ ± σ. Almost all of it (99.7%) lies within 3σ of μ, so those marks make the sketch to scale.',
            }
          : {
              say: `The probability is the area under the density between ${F(a)} and ${F(b)}. Shade it on your sketch.`,
              graph,
              why: 'For a continuous variable, a probability is an area under its density.',
            },
        {
          say: 'Turn each end into a z-score with z = (x − μ)/σ.',
          tex: [za.tex, zb.tex],
          why: roundWhy([za, zb]) ?? 'z counts how many standard deviations x is from μ. The table only knows Z, so every x has to become a z first.',
        },
        { say: `The table gives left areas. At z₂ = ${zw(zb.z)}: ${Lb.where}.`, look: Lb.look, tex: R`P[Z \le ${zt(zb.z)}] = ${a4(Lb.p)}` },
        { say: `At z₁ = ${zw(za.z)}: ${La.where}.`, look: La.look, tex: R`P[Z \le ${zt(za.z)}] = ${a4(La.p)}` },
        {
          say: 'Subtract: everything left of the right end, minus everything left of the left end, leaves the area in between.',
          tex: R`${ev} = P[${zt(za.z)} \le Z \le ${zt(zb.z)}] = ${a4(Lb.p)} - ${a4(La.p)} = ${a4(p)}`,
        },
      ],
      trap: 'Subtracting the z-scores (or the x-values) instead of the areas. Each z turns into a left area first; then subtract the two areas.',
    }
  }

  // P[X ≤ x] (or <), or P[X ≥ x] (or >) with right = true. pre: steps to put first.
  const oneSidePart = ({ label, ask, hint, mu, sig, x, F, sym, right = false, pre = [], trap, extraWrong = [] }) => {
    const zx = zOf(x, mu, sig, F), L = leftAt(zx.z), p = right ? 1 - L.p : L.p
    // the other tail, z cut instead of rounded, a 0-to-z table, forgetting to divide by σ, dividing by σ²
    const side = q => (right ? 1 - q : q)
    const wrong = W(p, tolP(p), [...extraWrong, 1 - p, side(HW.phi(trunc2(zx.raw))), Math.abs(L.p - 0.5), side(HW.phi(x - mu)), side(HW.phi((x - mu) / (sig * sig)))], true)
    const ev = R`P[X ${sym} ${F(x)}]`, evZ = R`P[Z ${sym} ${zt(zx.z)}]`
    const word = { [R`\le`]: `“At most ${F(x)}” (≤)`, '<': `“Less than ${F(x)}”`, [R`\ge`]: `“At least ${F(x)}” (≥)`, '>': `“More than ${F(x)}”` }[sym]
    const graph = normalGraph({ mu, sig, shades: [right ? [x, Infinity] : [-Infinity, x]], cuts: [x], note: `shaded: P[X ${SYM[sym]} ${F(x)}] = ${a4(p)}` })
    const steps = [
      ...pre,
      {
        say: `Turn ${F(x)} into a z-score.`,
        tex: zx.tex,
        why: roundWhy([zx]) ?? 'z counts how many standard deviations x is from μ. The table only knows Z, so x has to become a z first.',
      },
      right
        ? { say: `Look up the left area at z = ${zw(zx.z)}: ${L.where}.`, look: L.look, tex: R`P[Z \le ${zt(zx.z)}] = ${a4(L.p)}` }
        : {
            say: `Look up the left area at z = ${zw(zx.z)}: ${L.where}.`,
            look: L.look,
            tex: R`${ev} = ${evZ} = ${a4(p)}`,
            why: `${word} is the area to the LEFT of ${F(x)}. Standardizing keeps it on the left of z, and left areas are exactly what the table gives.`,
            graph,
          },
    ]
    if (right)
      steps.push({
        say: `${word} is the area to the RIGHT. The whole area is 1, so subtract the left area from 1.`,
        tex: R`${ev} = 1 - ${a4(L.p)} = ${a4(p)}`,
        why: 'For a continuous variable the single point has probability 0, so > and ≥ give the same area.',
        graph,
      })
    return {
      label,
      ask,
      skill: 'normal-word',
      hint,
      check: { type: 'number', value: p, tol: tolP(p), wrong },
      answer: R`${ev} = ${a4(p)}`,
      steps,
      trap: trap ?? (right ? `Stopping at ${a4(L.p)}: that is the area to the LEFT of ${F(x)}.` : `No “1 −” here: the table already gives the area to the left.`),
    }
  }

  // "Would you be surprised / is there cause for concern if X is above e?"
  const rarePart = ({ label, ask, mu, sig, e, F, noun, concern }) => {
    const ze = zOf(e, mu, sig, F), L = leftAt(ze.z), p = 1 - L.p, yes = p < 0.05
    const ev = R`P[X > ${F(e)}]`, P = a4(p)
    const say = concern
      ? { yes: 'Yes, there is cause for concern.', no: 'No, there is no real cause for concern.' }
      : { yes: 'Yes, I would be surprised.', no: 'No, I would not be surprised.' }
    const right = yes
      ? { text: R`${say.yes} \(${ev} = ${P}\): ${often(p, noun).startsWith('fewer') ? '' : 'only '}${often(p, noun)} are above ${F(e)}, so this rarely happens by chance.` }
      : { text: R`${say.no} \(${ev} = ${P}\): ${often(p, noun)} are above ${F(e)}, so this happens by chance fairly often.` }
    const wrongs = [
      { text: R`${say.no} \(${ev} = ${a4(L.p)}\), so most ${noun} are above ${F(e)}.` },
      yes
        ? { text: R`${say.no} \(${ev} = ${P}\) is more than 0, so it can happen, and that is all that matters.` }
        : { text: R`${say.yes} \(${ev} = ${P}\) is less than .5, so it is unlikely to happen by chance.` },
      yes
        ? { text: `${say.no} ${F(e)} is only ${F(e - mu)} above the mean of ${num(mu, 6)}.` }
        : { text: `${say.yes} ${F(e)} is above the mean of ${num(mu, 6)}, so it is not normal.` },
    ]
    return {
      label,
      ask,
      skill: 'normal-word',
      hint: `Find the probability first: “in excess of ${F(e)}” is the area to the RIGHT of ${F(e)}. Then ask whether that is small.`,
      check: choice(right, wrongs),
      answer: R`${ev} = ${P} \;\Rightarrow\; \text{${yes ? say.yes : say.no}}`,
      steps: [
        { say: `Find the probability first. “In excess of ${F(e)}” is the area to the RIGHT of ${F(e)}. Turn ${F(e)} into a z-score.`, tex: ze.tex, ...(roundWhy([ze]) ? { why: roundWhy([ze]) } : {}) },
        { say: `Look up the left area at z = ${zw(ze.z)}: ${L.where}.`, look: L.look, tex: R`P[Z \le ${zt(ze.z)}] = ${a4(L.p)}` },
        {
          say: 'The right area is 1 minus the left area.',
          tex: R`${ev} = 1 - ${a4(L.p)} = ${P}`,
          graph: normalGraph({ mu, sig, shades: [[e, Infinity]], cuts: [e], note: `shaded: P[X > ${F(e)}] = ${P}` }),
        },
        {
          say: yes
            ? `${P} is ${often(p, noun)}. ${say.yes} A value this high would rarely ${concern ? 'occur naturally, so it points to a real problem rather than ordinary variation' : 'happen by chance, so it suggests something is unusual about this one'}.`
            : `${P} is ${often(p, noun)}. ${say.no} A value this high happens by chance fairly often.`,
          why: 'A common yardstick: a probability under .05 (1 in 20) is unusual, and under .01 is very unusual.',
        },
      ],
      trap: 'A bare yes or no is not the answer: the question says explain, based on the probability. Give the probability and say why it is (or is not) small.',
    }
  }

  // backwards: the point with a share r above it (top) or below it, then x = μ + zσ. sigNote: extra words for the last step
  const pointPart = ({ label, ask, mu, sig, r, top, unit, dp, sigNote, varGiven = false }) => {
    const A = top ? +(1 - r).toFixed(4) : r
    const zb = zBack(A), xr = xFromZ(zb.z, mu, sig)
    const mirror = mu - zb.z * sig
    // the wrong tail, x = μ + z (no σ), the two-tailed z (as if the area were split), x = μ + z/σ, and σ² for σ
    const tail = Math.min(A, 1 - A), z2 = Math.sign(zb.z) * HW.zFor(+(1 - tail / 2).toFixed(4)).z
    const tolx = tolX(sig, dp)
    const wrong = W(xr.x, tolx, [mirror, mu + zb.z, mu + z2 * sig, ...(varGiven ? [mu + zb.z * sig * sig] : []), mu + zb.z / sig])
    return {
      label,
      ask,
      skill: 'normal-word',
      hint: top
        ? `The point has ${pct(r)}% of the area to its RIGHT. The table works with areas to the LEFT, so start from 1 − ${bk(r)}.`
        : `The point has ${pct(r)}% of the area to its LEFT. Find that area INSIDE the table, read off z, then turn z back into x.`,
      check: { type: 'number', value: xr.x, tol: tolx, wrong },
      answer: R`x ${num(xr.x, 6) === num(xr.x, 4) ? '=' : R`\approx`} ${num(xr.x, 4)}${unit ? R`\ ${unit}` : ''}`,
      steps: [
        {
          say: top
            ? `${r < 0.5 ? 'Only ' : ''}${pct(r)}% are at this point or above, so the area to its RIGHT is ${bk(r)}. The table needs the area to its LEFT: 1 − ${bk(r)} = ${bk(A)}.`
            : `${pct(r)}% are at this point or below, so the area to its LEFT is ${bk(r)}. That is the kind of area the table holds.`,
          tex: top ? R`P[X \ge x] = ${bk(r)} \;\Rightarrow\; P[X \le x] = 1 - ${bk(r)} = ${bk(A)}` : R`P[X \le x] = ${bk(r)}`,
          why: `Sketch it: the point is ${A > 0.5 ? 'above' : 'below'} μ, with ${pct(r)}% of the area to its ${top ? 'right' : 'left'}.`,
        },
        { say: zb.say, look: zb.look, tex: R`z = ${zt(zb.z)}`, why: zb.why },
        {
          say: 'Go back from z to x: multiply z = (x − μ)/σ by σ, then add μ.',
          tex: [R`z = \frac{x - \mu}{\sigma} \;\Rightarrow\; x = \mu + z\sigma`, xr.tex],
          why: `${sigNote ? sigNote + ' ' : ''}x sits ${zw(Math.abs(zb.z))} standard deviations ${zb.z < 0 ? 'below' : 'above'} the mean.`,
          graph: normalGraph({ mu, sig, shades: [top ? [xr.x, Infinity] : [-Infinity, xr.x]], cuts: [xr.x], note: `shaded: the ${top ? 'top' : 'bottom'} ${pct(r)}%, cut at x ≈ ${num(xr.x, 4)}` }),
        },
      ],
      trap: top
        ? `Looking up ${bk(r)} instead of ${bk(A)} gives the bottom ${pct(r)}%, x ≈ ${num(mirror, 4)}. Here the ${pct(r)}% is ABOVE the point: a right-hand area.`
        : `Using ${zw(-zb.z)} instead of ${zw(zb.z)} gives the top ${pct(r)}%, x ≈ ${num(mirror, 4)}. Here the ${pct(r)}% is BELOW the point: a left-hand area.`,
    }
  }

  // a data value on the story's grid (dp decimals) whose z lies in [zlo, zhi] and does not round on a tie
  const gridX = (mu, sig, dp, zlo, zhi) => {
    for (let i = 0; i < 500; i++) {
      const x = +(mu + (zlo + Math.random() * (zhi - zlo)) * sig).toFixed(dp)
      const raw = (x - mu) / sig
      if (raw < zlo - 1e-9 || raw > zhi + 1e-9 || Math.abs(raw) > 3.45 || x <= 0) continue
      if (Math.abs((Math.abs(raw * 100) % 1) - 0.5) < 1e-6) continue
      return x
    }
    throw new Error(`no x on the grid with z in [${zlo}, ${zhi}]`)
  }
  // two ends for a "between" question: usually one each side of μ, sometimes both on one side
  const gridPair = (mu, sig, dp) => {
    const mode = Math.random()
    if (mode < 0.65) return [gridX(mu, sig, dp, -2.6, -0.5), gridX(mu, sig, dp, 0.5, 2.6)]
    if (mode < 0.85) return [gridX(mu, sig, dp, 0.2, 1.0), gridX(mu, sig, dp, 1.4, 2.8)]
    return [gridX(mu, sig, dp, -2.8, -1.4), gridX(mu, sig, dp, -1.0, -0.2)]
  }

  // ---------- 4.3 #38: chi-squared with γ degrees of freedom ----------
  // χ²_r has area r to its RIGHT, so it lives in the column for left area 1 − r
  const leftOf = r => String(+(1 - +r).toFixed(3))
  // the column headings next to a column (a misread), as numbers
  const nextCols = c => {
    const j = HW.CHI_COLS.indexOf(String(c))
    return [HW.CHI_COLS[j - 1], HW.CHI_COLS[j + 1]].filter(Boolean)
  }
  // a printed value, or NaN when the row is not in the table (the wrong-row slip at γ = 30)
  const chiOr = (g, col) => (g >= 1 && g <= 30 ? +HW.chi(g, col) : NaN)
  const PAIRS = [['0.025', '0.975'], ['0.05', '0.95'], ['0.01', '0.99'], ['0.1', '0.9'], ['0.05', '0.975'], ['0.025', '0.95'], ['0.01', '0.95'], ['0.1', '0.95'], ['0.25', '0.75'], ['0.005', '0.995'], ['0.05', '0.9']]

  HW.add({
    id: '4.3-38',
    section: '4.3',
    num: '38',
    group: 6,
    title: 'Reading the chi-squared table',
    hw: { g: 15, c1: '0.01', pair: ['0.025', '0.975'], r3: '0.05', c4: '0.9', r5: '0.01', r6: '0.95' },
    twin: () => {
      const g = pick(Array.from({ length: 28 }, (_, i) => i + 3).filter(x => x !== 15))
      // like the homework, the seven look-ups use seven different columns, so no part gives away another
      for (;;) {
        const [r3, r5] = shuffle(['0.1', '0.05', '0.025', '0.01', '0.005']).slice(0, 2)
        const pair = pick(PAIRS)
        const v = {
          g,
          c1: pick(['0.005', '0.01', '0.025', '0.05', '0.1', '0.25']),
          pair,
          r3,
          c4: pick(['0.75', '0.9', '0.95', '0.975', '0.99', '0.995']),
          r5,
          r6: pick(['0.9', '0.95', '0.975', '0.99']),
        }
        const cols = [v.c1, ...pair, leftOf(r3), v.c4, leftOf(r5), leftOf(v.r6)]
        if (new Set(cols).size === cols.length) return v
      }
    },
    make: v => {
      const { g } = v
      const X = R`X^2_{${g}}`
      const odd = g % 2 === 1
      const aT = odd ? `${g}/2` : String(g / 2) // α, written in an exponent
      const aF = odd ? R`\frac{${g}}{2}` : R`\frac{${g}}{2} = ${g / 2}` // α worked out
      const am1 = odd ? `${g - 2}/2` : String(g / 2 - 1) // α − 1
      const am1F = odd ? R`\frac{${g - 2}}{2}` : String(g / 2 - 1)
      const xPow = am1 === '1' ? 'x' : R`x^{${am1}}`
      const gam = R`\Gamma(${aT})`
      const dens = R`f(x) = \frac{1}{${gam}\,2^{${aT}}}\,${xPow}\,e^{-x/2}, \quad x > 0`
      const P = (rel, val) => R`P[${X} ${rel} ${val}]`

      // (d1) P[X² ≤ v]
      const v1 = HW.chi(g, v.c1), p1 = +v.c1
      // (d2) P[lo ≤ X² ≤ hi]
      const [lc, hc] = v.pair, lo = HW.chi(g, lc), hi = HW.chi(g, hc), p2 = +(+hc - +lc).toFixed(3)
      // (d4) P[X² ≥ v]
      const v4 = HW.chi(g, v.c4), p4 = +(1 - +v.c4).toFixed(3)

      // (d3, d5, d6) χ²_r
      const rightPoint = (label, r) => {
        const col = leftOf(r), val = HW.chi(g, col), wrong = HW.chi(g, r)
        const big = +r > 0.5
        // the r column (subscript read as a left area), the columns next door, the rows next door
        const wrongs = W(+val, tolChi(val), [+wrong, ...nextCols(col).map(c => +HW.chi(g, c)), chiOr(g - 1, col), chiOr(g + 1, col)])
        return {
          label,
          ask: R`Use Table IV of App. A to find \(\chi^2_{${bk(r)}}\).`,
          skill: 'chi-table',
          hint: R`\(\chi^2_{${bk(r)}}\) has area ${bk(r)} to its RIGHT, but the table’s column headings are areas to the LEFT.`,
          check: { type: 'number', value: +val, tol: tolChi(val), wrong: wrongs },
          answer: R`\chi^2_{${bk(r)}} = ${val}`,
          steps: [
            {
              say: R`\(\chi^2_{${bk(r)}}\) is the point with area ${bk(r)} to its RIGHT.`,
              tex: R`P[${X} \ge \chi^2_{${bk(r)}}] = ${bk(r)}`,
              why: 'In this book the subscript on χ² (and on z) is always the area to the right.',
            },
            {
              say: 'The table’s columns are areas to the LEFT, so turn it around.',
              tex: R`P[${X} \le \chi^2_{${bk(r)}}] = 1 - ${bk(r)} = ${bk(col)}`,
              why: big
                ? `Most of the area (${bk(r)}) is to its right, so this point is out on the left: expect a small value.`
                : `Only ${bk(r)} is to its right, so this point is out in the right tail: expect a big value.`,
            },
            {
              say: `Read row ${g} (the degrees of freedom) under the ${bk(col)} column, not the ${bk(r)} column.`,
              look: HW.chiLook(g, col),
              tex: R`\chi^2_{${bk(r)}} = ${val}`,
              graph: chiGraph(g, [[+val, Infinity]], [+val], `shaded: the area ${bk(r)} to the right of ${val}`),
            },
          ],
          trap: R`Reading the ${bk(r)} column gives ${wrong}. That is \(\chi^2_{${bk(col)}}\), the point with ${bk(r)} to its LEFT.`,
        }
      }

      return {
        text: R`Consider a chi-squared random variable with ${g} degrees of freedom.`,
        parts: [
          {
            label: 'a',
            ask: R`What is the mean of \(${X}\)? What is its variance?`,
            skill: 'formulas',
            hint: 'A chi-squared with γ degrees of freedom is a gamma with α = γ/2 and β = 2. The gamma mean is αβ and its variance is αβ².',
            check: {
              type: 'numbers',
              items: [
                // α alone, the variance, α/β (β read as a rate)
                { label: R`E[${X}]`, value: g, tol: 0.01, wrong: W(g, 0.01, [g / 2, 2 * g, g / 4]) },
                // the mean, γβ² (α = γ), α/β²
                { label: R`\operatorname{Var} ${X}`, value: 2 * g, tol: 0.01, wrong: W(2 * g, 0.01, [g, 4 * g, g / 8]) },
              ],
            },
            answer: R`E[${X}] = ${g}, \quad \operatorname{Var} ${X} = ${2 * g}`,
            steps: [
              {
                say: `Write the chi-squared as a gamma. With γ = ${g} degrees of freedom, α = γ/2 and β = 2.`,
                tex: R`\alpha = ${aF}, \qquad \beta = 2`,
                why: 'That is what chi-squared means in this book: a gamma with β = 2 and α = half the degrees of freedom. It is not on the formula sheet.',
              },
              {
                say: 'The gamma mean is αβ.',
                tex: R`E[${X}] = \alpha\beta = \frac{${g}}{2} \cdot 2 = ${g}`,
                why: 'The 2s cancel, so the mean of a chi-squared is always its degrees of freedom.',
              },
              {
                say: 'The gamma variance is αβ².',
                tex: R`\operatorname{Var} ${X} = \alpha\beta^2 = \frac{${g}}{2} \cdot 4 = ${2 * g}`,
                why: 'So the variance of a chi-squared is always twice its degrees of freedom.',
              },
            ],
            trap: `The mean is γ = ${g}, not α = ${odd ? `${g}/2` : g / 2}. The variance is 2γ = ${2 * g}, not γ.`,
          },
          {
            label: 'b',
            ask: R`What is the expression for the density for \(${X}\)?`,
            skill: 'formulas',
            hint: 'Start from the gamma density on the formula sheet and put in α = γ/2 and β = 2.',
            check: choice({ tex: dens }, [
              { tex: R`f(x) = \frac{1}{\Gamma(${g})\,2^{${g}}}\,x^{${g - 1}}\,e^{-x/2}, \quad x > 0` },
              { tex: R`f(x) = \frac{2^{${aT}}}{${gam}}\,${xPow}\,e^{-2x}, \quad x > 0` },
              { tex: R`f(x) = \frac{1}{${gam}\,2^{${aT}}}\,x^{${aT}}\,e^{-x/2}, \quad x > 0` },
            ]),
            answer: dens,
            steps: [
              {
                say: 'Start from the gamma density (it is on the formula sheet).',
                tex: R`f(x) = \frac{1}{\Gamma(\alpha)\,\beta^{\alpha}}\,x^{\alpha - 1}e^{-x/\beta}, \quad x > 0`,
              },
              {
                say: `A chi-squared with ${g} degrees of freedom is a gamma with α = ${odd ? `${g}/2` : g / 2} and β = 2. Work out α − 1 too: it is the power on x.`,
                tex: R`\alpha = ${aF}, \qquad \beta = 2, \qquad \alpha - 1 = ${am1F}`,
              },
              {
                say: 'Put them in.',
                tex: odd ? dens : [dens, R`\Gamma(${g / 2}) = ${g / 2 - 1}!${g <= 12 ? R` = ${HW.fact(g / 2 - 1)}, \quad \Gamma(${g / 2})\,2^{${g / 2}} = ${HW.fact(g / 2 - 1) * 2 ** (g / 2)}` : ''}`],
                why: odd ? `Γ(${g}/2) and 2^(${g}/2) are constants; you can leave them as they are.` : `Γ(n) = (n − 1)! for a whole number n.`,
              },
            ],
            trap: 'The power on x is α − 1, not α. And e^(−x/β) with β = 2 is e^(−x/2), not e^(−2x).',
          },
          {
            label: 'c',
            ask: R`What is the expression for the moment generating function for \(${X}\)?`,
            skill: 'formulas',
            hint: 'The gamma MGF is (1 − βt)^(−α). Put in the chi-squared’s α and β.',
            check: choice({ tex: R`m(t) = (1 - 2t)^{-${aT}}` }, [
              { tex: R`m(t) = (1 - 2t)^{-${g}}` },
              { tex: R`m(t) = \left(1 - \tfrac{1}{2}t\right)^{-${aT}}` },
              { tex: R`m(t) = (1 - 2t)^{${aT}}` },
            ]),
            answer: R`m_{${X}}(t) = (1 - 2t)^{-${aT}}, \quad t < \tfrac{1}{2}`,
            steps: [
              {
                say: 'The gamma MGF is (1 − βt)^(−α).',
                tex: R`m_X(t) = (1 - \beta t)^{-\alpha}, \quad t < \frac{1}{\beta}`,
                why: 'It is not on the formula sheet, so learn it with the gamma mean αβ and variance αβ².',
              },
              {
                say: `Put in β = 2 and α = ${odd ? `${g}/2` : g / 2}.`,
                tex: R`m_{${X}}(t) = (1 - 2t)^{-${aT}}, \quad t < \frac{1}{2}`,
                why: 'The MGF only exists while 1 − 2t > 0, that is, t < 1/2.',
              },
              {
                say: 'Check it against (a): the first derivative at t = 0 should be the mean.',
                tex: R`m'(t) = \left(-${odd ? R`\frac{${g}}{2}` : g / 2}\right)(1 - 2t)^{-${odd ? `${g + 2}/2` : g / 2 + 1}}\cdot(-2) = ${g}(1 - 2t)^{-${odd ? `${g + 2}/2` : g / 2 + 1}} \;\Rightarrow\; m'(0) = ${g}`,
                why: 'The power rule brings down −α and lowers the power by 1; the chain rule multiplies by the −2 from inside. At t = 0, (1 − 0) to any power is 1.',
              },
            ],
            trap: 'The exponent is −γ/2, not −γ, and it is negative.',
          },
          {
            label: 'd1',
            ask: R`Use Table IV of App. A to find \(${P(R`\le`, v1)}\).`,
            skill: 'chi-table',
            hint: `The value ${v1} is given, so look for it INSIDE row ${g} of the table. Its column heading is an area.`,
            // the right area 1 − p, the columns next door
            check: { type: 'number', value: p1, tol: tolP(p1), wrong: W(p1, tolP(p1), [1 - p1, ...nextCols(v.c1).map(Number)], true) },
            answer: R`${P(R`\le`, v1)} = ${bk(p1)}`,
            steps: [
              {
                say: `Go to row ${g} (the degrees of freedom) and look along it for ${v1}.`,
                look: HW.chiLook(g, v.c1, +v1),
                why: 'The numbers inside Table IV are values of X². The column headings are areas.',
              },
              {
                say: `${v1} sits in the ${bk(v.c1)} column. A column heading is the area to the LEFT of the values under it, and the area to the left of ${v1} is exactly the probability asked for.`,
                tex: R`${P(R`\le`, v1)} = ${bk(p1)}`,
                graph: chiGraph(g, [[0, +v1]], [+v1], `shaded: P[X² ≤ ${v1}] = ${bk(p1)}`),
              },
            ],
            trap: 'No “1 −” here: “≤” asks for the area to the left, and the column heading already is that area.',
          },
          {
            label: 'd2',
            ask: R`Use Table IV of App. A to find \(P[${lo} \le ${X} \le ${hi}]\).`,
            skill: 'chi-table',
            hint: 'Area between two values = (area to the left of the bigger one) − (area to the left of the smaller one).',
            // adding, the two tails, one end only (as a left or a right area)
            check: { type: 'number', value: p2, tol: tolP(p2), wrong: W(p2, tolP(p2), [+hc + +lc, 1 - p2, +hc, 1 - +lc, +lc, 1 - +hc], true) },
            answer: R`P[${lo} \le ${X} \le ${hi}] = ${bk(p2)}`,
            steps: [
              {
                say: 'An area between two values is the area to the left of the right end, minus the area to the left of the left end.',
                tex: R`P[${lo} \le ${X} \le ${hi}] = ${P(R`\le`, hi)} - ${P(R`\le`, lo)}`,
                why: `Everything left of ${hi}, take away the part left of ${lo}, leaves the piece in between.`,
              },
              { say: `Find ${hi} in row ${g}. It sits in the ${bk(hc)} column.`, look: HW.chiLook(g, hc, +hi), tex: R`${P(R`\le`, hi)} = ${bk(hc)}` },
              { say: `Find ${lo} in row ${g}. It sits in the ${bk(lc)} column.`, look: HW.chiLook(g, lc, +lo), tex: R`${P(R`\le`, lo)} = ${bk(lc)}` },
              {
                say: 'Subtract.',
                tex: R`P[${lo} \le ${X} \le ${hi}] = ${bk(hc)} - ${bk(lc)} = ${bk(p2)}`,
                graph: chiGraph(g, [[+lo, +hi]], [+lo, +hi], `shaded: P[${lo} ≤ X² ≤ ${hi}] = ${bk(p2)}`),
              },
            ],
            trap: 'Adding the two column headings, or subtracting them the wrong way round. A between-area is a difference of left areas: bigger minus smaller.',
          },
          rightPoint('d3', v.r3),
          {
            label: 'd4',
            ask: R`Use Table IV of App. A to find \(${P(R`\ge`, v4)}\).`,
            skill: 'chi-table',
            hint: `Find ${v4} in row ${g}. Its column heading is the area to its LEFT, but this asks for the area to its RIGHT.`,
            // stopping at the left area, the columns next door
            check: { type: 'number', value: p4, tol: tolP(p4), wrong: W(p4, tolP(p4), [+v.c4, ...nextCols(v.c4).map(c => 1 - +c)], true) },
            answer: R`${P(R`\ge`, v4)} = ${bk(p4)}`,
            steps: [
              {
                say: `Find ${v4} in row ${g}. It sits in the ${bk(v.c4)} column, so the area to its LEFT is ${bk(v.c4)}.`,
                look: HW.chiLook(g, v.c4, +v4),
                tex: R`${P(R`\le`, v4)} = ${bk(v.c4)}`,
              },
              {
                say: 'You want the area to the RIGHT. The whole area under the density is 1, so subtract the left area from 1.',
                tex: R`${P(R`\ge`, v4)} = 1 - ${P(R`\le`, v4)} = 1 - ${bk(v.c4)} = ${bk(p4)}`,
                why: `For a continuous variable P[X² = ${v4}] = 0, so ≥ and > give the same area.`,
                graph: chiGraph(g, [[+v4, Infinity]], [+v4], `shaded: P[X² ≥ ${v4}] = ${bk(p4)}`),
              },
            ],
            trap: `Stopping at ${bk(v.c4)}: that is the area to the LEFT of ${v4}.`,
          },
          rightPoint('d5', v.r5),
          rightPoint('d6', v.r6),
        ],
      }
    },
  })

  // ---------- 4.4 #39: the normal table both ways ----------
  HW.add({
    id: '4.4-39',
    section: '4.4',
    num: '39',
    group: 6,
    title: 'Reading the normal table',
    hw: { z1: 1.57, za: -1.25, zb: 1.75, r6: '0.1', r7: '0.9', A8: '0.95', A9: '0.9' },
    twin: () => {
      const z1 = (chance(0.35) ? -1 : 1) * step(0.25, 2.75, 0.01)
      const mode = Math.random()
      let za, zb
      if (mode < 0.7) [za, zb] = [-step(0.2, 2.6, 0.01), step(0.2, 2.6, 0.01)]
      else if (mode < 0.85) { za = step(0.1, 1.5, 0.01); zb = +(za + step(0.3, 1.5, 0.01)).toFixed(2) }
      else { zb = -step(0.1, 1.5, 0.01); za = +(zb - step(0.3, 1.5, 0.01)).toFixed(2) }
      const [A8, A9] = shuffle(['0.95', '0.9', '0.99', '0.8', '0.98', '0.5', '0.7', '0.6', '0.85']).slice(0, 2)
      return {
        z1,
        za,
        zb,
        r6: pick(['0.1', '0.05', '0.025', '0.01', '0.2', '0.15', '0.3', '0.005', '0.4']),
        r7: pick(['0.9', '0.95', '0.975', '0.99', '0.8', '0.85', '0.7', '0.6']),
        A8,
        A9,
      }
    },
    make: v => {
      const { z1, za, zb } = v
      const L1 = leftAt(z1), La = leftAt(za), Lb = leftAt(zb)
      const Z1 = zt(z1)
      const zList = [...new Set([z1, za, zb])].map(z => R`\(${zt(z)}\)`)
      const listed = zList.length === 3 ? `${zList[0]}, ${zList[1]} and ${zList[2]}` : zList.join(' and ')
      const g = (shades, cuts, note) => normalGraph({ shades, cuts, note })
      const negWhy = z => (z < 0 ? 'A negative z has its own rows at the top of the table; the column is still the second decimal.' : null)
      // how a z splits into a row and a column
      const splitWhy = z => {
        const c = HW.zCell(z)
        return `The row is z to one decimal (${minus(c.row)}); the column is its second decimal (${bk(c.col)}). Where they meet is the area to the LEFT of ${zw(z)}.${z < 0 ? ' A negative z has its own rows, at the top of the table.' : ''}`
      }
      const p1 = L1.p, pe = Lb.p - La.p
      // the other tail, a 0-to-z table, the row next door
      const wrongA = W(p1, tolP(p1), [1 - p1, Math.abs(p1 - 0.5), HW.phi(z1 + (z1 < 0 ? -0.1 : 0.1))], true)
      // < read like the binomial table (one step down), the other tail, a 0-to-z table
      const wrongB = W(p1, tolP(p1), [HW.phi(z1 - 0.01), 1 - p1, Math.abs(p1 - 0.5)], true)
      // the table entry, the height of the curve, the right area
      const wrongC = W(0, 0.0005, [p1, +dens0(z1).toFixed(4), 1 - p1], true)
      // stopping at the left area, a 0-to-z table, two tails, the middle
      const wrongD = W(1 - p1, tolP(1 - p1), [p1, Math.abs(p1 - 0.5), 2 * (1 - p1), Math.abs(2 * p1 - 1)], true)
      // the two tails outside, the minus sign dropped, subtracting the z's, adding, one end only
      const wrongE = W(pe, tolP(pe), [1 - pe, za < 0 && zb > 0 ? Lb.p - HW.phi(-za) : NaN, HW.phi(zb - za), Lb.p + La.p, Lb.p], true)

      // (f) and (g): z_r, the point with area r to its right
      const zRight = (label, r) => {
        const A = +(1 - +r).toFixed(4), b = zBack(A)
        const mirror = zBack(+r).z
        const tz = b.halfway ? 0.0051 : 0.005
        // r read as a left area (the mirror), the printed z on the other side, the two-tailed z, a 0-to-z table
        const tail = Math.min(+r, 1 - +r), two = Math.sign(b.z) * HW.zFor(+(1 - tail / 2).toFixed(4)).z
        const wrong = W(b.z, tz, [mirror, b.other ?? NaN, two, +r < 0.5 ? HW.zFor(+(0.5 + +r).toFixed(4)).z : NaN])
        return {
          label,
          ask: R`\(z_{${bk(r)}}\).`,
          skill: 'normal-table',
          hint: R`\(z_{${bk(r)}}\) has area ${bk(r)} to its RIGHT. Turn that into an area to the LEFT, then look for that area INSIDE the table.`,
          check: { type: 'number', value: b.z, tol: tz, wrong },
          answer: R`z_{${bk(r)}} = ${zt(b.z)}`,
          steps: [
            {
              say: R`\(z_{${bk(r)}}\) is the point with area ${bk(r)} to its RIGHT.`,
              tex: R`P[Z \ge z_{${bk(r)}}] = ${bk(r)}`,
              why: 'In this book the subscript on z is always the area to the right.',
            },
            { say: 'The table works with areas to the LEFT, so turn it around.', tex: R`P[Z \le z_{${bk(r)}}] = 1 - ${bk(r)} = ${bk(A)}` },
            { say: b.say, look: b.look, tex: R`z_{${bk(r)}} = ${zt(b.z)}`, why: b.why, graph: g([[b.z, Infinity]], [b.z], `shaded: the area ${bk(r)} to the right of z = ${zw(b.z)}`) },
          ],
          trap: `Looking up ${bk(r)} itself gives ${zw(mirror)}, which is z with ${bk(r)} to its LEFT: the mirror image.`,
        }
      }
      // (h) and (i): P[−z ≤ Z ≤ z] = A
      const zMiddle = (label, A) => {
        const tail = +((1 - +A) / 2).toFixed(4), left = +((1 + +A) / 2).toFixed(4), b = zBack(left)
        const wrong = zBack(+A).z
        const tz = b.halfway ? 0.0051 : 0.005
        // the middle area looked up as a left area, the tail looked up (−z), the tail subtracted, the printed z on the
        // other side, half the middle looked up (the 0-to-z habit, without adding the .5 left of 0)
        const wrongs = W(b.z, tz, [wrong, -b.z, HW.zFor(+(+A - tail).toFixed(4)).z, b.other ?? NaN, HW.zFor(+(+A / 2).toFixed(4)).z])
        return {
          label,
          ask: R`The point \(z\) such that \(P[-z \le Z \le z] = ${bk(A)}\).`,
          skill: 'normal-table',
          hint: `The middle ${bk(A)} leaves the rest split evenly between the two tails. How much area is then to the LEFT of z?`,
          check: { type: 'number', value: b.z, tol: tz, wrong: wrongs },
          answer: R`z = ${zt(b.z)}`,
          steps: [
            {
              say: `Picture it: the middle ${bk(A)} is centred at 0, between −z and z. What is left over, 1 − ${bk(A)}, is split evenly between the two tails.`,
              tex: R`\text{each tail} = \frac{1 - ${bk(A)}}{2} = ${bk(tail)}`,
              why: 'The normal curve is symmetric about 0, so the two tails are the same size.',
            },
            {
              say: 'The area to the LEFT of z is the middle plus the left tail.',
              tex: R`P[Z \le z] = ${bk(A)} + ${bk(tail)} = ${bk(left)}`,
              why: R`A shortcut for any middle area \(A\): the left area at \(z\) is \(\frac{1 + A}{2}\).`,
            },
            { say: b.say, look: b.look, tex: R`z = ${zt(b.z)}`, why: b.why, graph: g([[-b.z, b.z]], [-b.z, b.z], `shaded: the middle ${bk(A)}, from −${zw(b.z)} to ${zw(b.z)}`) },
          ],
          trap: `Looking up ${bk(A)} itself gives ${zw(wrong)}. The middle area is not the area to the left of z.`,
        }
      }

      return {
        text: R`Use Table V of App. A to find each of the following. In (a)–(e) you start from \(z\) (here ${listed}) and want an area; in (f)–(i) you start from an area and want \(z\).`,
        parts: [
          {
            label: 'a',
            ask: R`\(P[Z \le ${Z1}]\).`,
            skill: 'normal-table',
            hint: 'Table V gives the area to the LEFT of z. The row is z to one decimal place; the column is its second decimal.',
            check: { type: 'number', value: L1.p, tol: tolP(L1.p), wrong: wrongA },
            answer: R`P[Z \le ${Z1}] = ${a4(L1.p)}`,
            steps: [
              {
                say: `P[Z ≤ ${zw(z1)}] is the area under the curve to the LEFT of ${zw(z1)}. That is exactly what Table V lists.`,
                graph: g([[-Infinity, z1]], [z1], `shaded: P[Z ≤ ${zw(z1)}] = ${a4(L1.p)}`),
              },
              { say: `Split ${zw(z1)} into a row and a column: ${L1.where}.`, look: L1.look, tex: R`P[Z \le ${Z1}] = ${a4(L1.p)}`, why: splitWhy(z1) },
            ],
          },
          {
            label: 'b',
            ask: R`\(P[Z < ${Z1}]\).`,
            skill: 'normal-table',
            hint: 'Does leaving out the single point z make any difference for a continuous variable?',
            check: { type: 'number', value: L1.p, tol: tolP(L1.p), wrong: wrongB },
            answer: R`P[Z < ${Z1}] = ${a4(L1.p)}`,
            steps: [
              {
                say: `Z is continuous, so the single point ${zw(z1)} has probability 0. Leaving it out changes nothing.`,
                tex: R`P[Z < ${Z1}] = P[Z \le ${Z1}] - P[Z = ${Z1}] = P[Z \le ${Z1}]`,
              },
              { say: `So it is the same entry as (a): ${L1.where}.`, look: L1.look, tex: R`P[Z < ${Z1}] = ${a4(L1.p)}` },
            ],
            trap: '< versus ≤ matters for a discrete table like the binomial. For the normal it makes no difference.',
          },
          {
            label: 'c',
            ask: R`\(P[Z = ${Z1}]\).`,
            skill: 'normal-table',
            hint: 'For a continuous variable, how much area sits over a single point?',
            check: { type: 'number', value: 0, tol: 0.0005, wrong: wrongC },
            answer: R`P[Z = ${Z1}] = 0`,
            steps: [
              {
                say: 'A probability for a continuous variable is an area under its density. Over a single point that region has no width.',
                tex: R`P[Z = ${Z1}] = \int_{${Z1}}^{${Z1}} f(z)\,dz = 0`,
                why: 'An area with width 0 is 0, however tall the curve is there.',
              },
              { say: 'That is why (a) and (b) gave the same answer.', tex: R`P[Z \le ${Z1}] = P[Z < ${Z1}] + P[Z = ${Z1}] = ${a4(L1.p)} + 0` },
            ],
            trap: `Don’t look anything up. The entry ${a4(L1.p)} is P[Z ≤ ${zw(z1)}], a whole area; one point has none.`,
          },
          {
            label: 'd',
            ask: R`\(P[Z > ${Z1}]\).`,
            skill: 'normal-table',
            hint: 'The table only gives areas to the LEFT. The whole area under the curve is 1.',
            check: { type: 'number', value: 1 - L1.p, tol: tolP(1 - L1.p), wrong: wrongD },
            answer: R`P[Z > ${Z1}] = ${a4(1 - L1.p)}`,
            steps: [
              { say: 'The table only gives left areas. The whole area is 1, so the right area is 1 minus the left area.', tex: R`P[Z > ${Z1}] = 1 - P[Z \le ${Z1}]` },
              { say: `The left area is the entry in ${L1.where}.`, look: L1.look, tex: R`P[Z \le ${Z1}] = ${a4(L1.p)}` },
              {
                say: 'Subtract.',
                tex: R`P[Z > ${Z1}] = 1 - ${a4(L1.p)} = ${a4(1 - L1.p)}`,
                graph: g([[z1, Infinity]], [z1], `shaded: P[Z > ${zw(z1)}] = ${a4(1 - L1.p)}`),
              },
            ],
            trap: `Stopping at ${a4(L1.p)}: that is the area to the LEFT of ${zw(z1)}.`,
          },
          {
            label: 'e',
            ask: R`\(P[${zt(za)} \le Z \le ${zt(zb)}]\).`,
            skill: 'normal-table',
            hint: 'Area between two z’s = (left area of the bigger z) − (left area of the smaller z).',
            check: { type: 'number', value: pe, tol: tolP(pe), wrong: wrongE },
            answer: R`P[${zt(za)} \le Z \le ${zt(zb)}] = ${a4(Lb.p - La.p)}`,
            steps: [
              {
                say: 'An area between two z’s is the left area of the bigger z minus the left area of the smaller z.',
                tex: R`P[${zt(za)} \le Z \le ${zt(zb)}] = P[Z \le ${zt(zb)}] - P[Z \le ${zt(za)}]`,
                why: `Everything left of ${zw(zb)}, take away the part left of ${zw(za)}, leaves the area in between.`,
              },
              { say: `Left area at ${zw(zb)}: ${Lb.where}.`, look: Lb.look, tex: R`P[Z \le ${zt(zb)}] = ${a4(Lb.p)}`, ...(negWhy(zb) ? { why: negWhy(zb) } : {}) },
              { say: `Left area at ${zw(za)}: ${La.where}.`, look: La.look, tex: R`P[Z \le ${zt(za)}] = ${a4(La.p)}`, ...(negWhy(za) ? { why: negWhy(za) } : {}) },
              {
                say: 'Subtract.',
                tex: R`P[${zt(za)} \le Z \le ${zt(zb)}] = ${a4(Lb.p)} - ${a4(La.p)} = ${a4(Lb.p - La.p)}`,
                graph: g([[za, zb]], [za, zb], `shaded: P[${zw(za)} ≤ Z ≤ ${zw(zb)}] = ${a4(Lb.p - La.p)}`),
              },
            ],
            trap: 'Adding the two entries, or subtracting them the wrong way round (that gives a negative “probability”).',
          },
          zRight('f', v.r6),
          zRight('g', v.r7),
          zMiddle('h', v.A8),
          zMiddle('i', v.A9),
        ],
      }
    },
  })

  // ---------- 4.4 #40: soil bulk density (and twins) ----------
  // each story writes its own questions; U is the unit in TeX ('' for none)
  const DENSITY = [
    {
      intro: (m, s) => R`The bulk density of soil is defined as the mass of dry solids per unit bulk volume. A high bulk density implies a compact soil with few pores. Bulk density is an important factor in influencing root development, seedling emergence, and aeration. Let \(X\) denote the bulk density of Pima clay loam. Studies show that \(X\) is normally distributed with \(\mu = ${m}\) and \(\sigma = ${s}\ \text{g/cm}^3\).`,
      U: R`\text{g/cm}^3`,
      dp: 1,
      noun: 'samples',
      b: x => R`Find the probability that a randomly selected sample of Pima clay loam will have bulk density less than \(${x}\).`,
      c: x => R`Would you be surprised if a randomly selected sample of this type of soil has a bulk density in excess of \(${x}\)? Explain, based on the probability of this occurring.`,
      d: (r, top) => `What point has the property that only ${r}% of the soil samples have bulk density this ${top ? 'high or higher' : 'low or lower'}?`,
      mus: [1.5],
      sigs: [0.2],
    },
    {
      intro: (m, s) => R`A machine makes the steel balls for bicycle wheel bearings. A ball that is too large jams, and one that is too small rattles. Let \(X\) denote the diameter of a ball from this machine. Records show that \(X\) is normally distributed with \(\mu = ${m}\) and \(\sigma = ${s}\ \text{mm}\).`,
      U: R`\text{mm}`,
      dp: 3,
      noun: 'balls',
      b: x => R`Find the probability that a randomly selected ball will have a diameter less than \(${x}\).`,
      c: x => R`Would you be surprised if a randomly selected ball has a diameter in excess of \(${x}\)? Explain, based on the probability of this occurring.`,
      d: (r, top) => `What point has the property that only ${r}% of the balls have a diameter this ${top ? 'large or larger' : 'small or smaller'}?`,
      mus: [6, 8, 10],
      sigs: [0.02, 0.03, 0.04],
    },
    {
      intro: (m, s) => R`A cereal company fills boxes labeled 16 ounces. Let \(X\) denote the actual weight of the cereal in a box. The filling machine is set so that \(X\) is normally distributed with \(\mu = ${m}\) and \(\sigma = ${s}\ \text{oz}\).`,
      U: R`\text{oz}`,
      dp: 2,
      noun: 'boxes',
      b: x => R`Find the probability that a randomly selected box will have a fill weight less than \(${x}\).`,
      c: x => R`Would you be surprised if a randomly selected box has a fill weight in excess of \(${x}\)? Explain, based on the probability of this occurring.`,
      d: (r, top) => `What point has the property that only ${r}% of the boxes have a fill weight this ${top ? 'heavy or heavier' : 'light or lighter'}?`,
      mus: [16.4, 16.5, 16.6],
      sigs: [0.15, 0.2, 0.25],
    },
    {
      intro: (m, s) => R`Rain in an industrial region is slightly acidic. Let \(X\) denote the pH of a rainwater sample collected there. Measurements show that \(X\) is normally distributed with \(\mu = ${m}\) and \(\sigma = ${s}\).`,
      U: '',
      dp: 2,
      noun: 'samples',
      b: x => R`Find the probability that a randomly selected rainwater sample will have a pH less than \(${x}\).`,
      c: x => R`Would you be surprised if a randomly selected rainwater sample has a pH in excess of \(${x}\)? Explain, based on the probability of this occurring.`,
      d: (r, top) => `What point has the property that only ${r}% of the rainwater samples have a pH this ${top ? 'high or higher' : 'low or lower'}?`,
      mus: [4.8, 5, 5.2],
      sigs: [0.2, 0.25, 0.3],
    },
    {
      intro: (m, s) => R`A company tests the AA batteries it packs with its LED camping lanterns. Let \(X\) denote the life of a battery in a lantern left on. Tests show that \(X\) is normally distributed with \(\mu = ${m}\) and \(\sigma = ${s}\ \text{hours}\).`,
      U: R`\text{hours}`,
      dp: 1,
      noun: 'batteries',
      b: x => R`Find the probability that a randomly selected battery will have a life less than \(${x}\).`,
      c: x => R`Would you be surprised if a randomly selected battery has a life in excess of \(${x}\)? Explain, based on the probability of this occurring.`,
      d: (r, top) => `What point has the property that only ${r}% of the batteries have a life this ${top ? 'long or longer' : 'short or shorter'}?`,
      mus: [30, 36, 40, 45],
      sigs: [3, 4, 5, 6],
    },
  ]

  HW.add({
    id: '4.4-40',
    section: '4.4',
    num: '40',
    group: 6,
    title: 'Soil bulk density',
    hw: { s: 0, mu: 1.5, sig: 0.2, a: 1.1, b: 1.9, c: 0.9, e: 2.0, r: 0.1, top: true },
    twin: () => {
      const s = 1 + Math.floor(Math.random() * (DENSITY.length - 1))
      const S = DENSITY[s], mu = pick(S.mus), sig = pick(S.sigs)
      const [a, b] = gridPair(mu, sig, S.dp)
      const c = gridX(mu, sig, S.dp, -3.2, -0.6)
      const e = chance(0.7) ? gridX(mu, sig, S.dp, 2.33, 3.4) : gridX(mu, sig, S.dp, 0.3, 1.2)
      return { s, mu, sig, a, b, c, e, r: pick([0.1, 0.05, 0.01, 0.025, 0.2, 0.15, 0.25]), top: chance(0.65) }
    },
    make: v => {
      const S = DENSITY[v.s], { mu, sig } = v
      const F = x => x.toFixed(S.dp)
      const withU = x => (S.U ? R`${F(x)}\ ${S.U}` : F(x))
      const M = num(mu, 6), Sg = num(sig, 6), S2 = num(sig * sig, 6), half = num((sig * sig) / 2, 6)
      const dens = (m, s, e) => R`f(x) = \frac{1}{\sqrt{2\pi}\,(${s})}\,e^{-(x-${m})^2/${e}}`
      const right = dens(M, Sg, R`(2(${Sg})^2)`)
      const c0 = 1 / (Math.sqrt(2 * Math.PI) * sig)
      return {
        text: S.intro(M, Sg),
        parts: [
          {
            label: 'a1',
            ask: R`What is the density for \(X\)? Sketch a graph of the density function.`,
            skill: 'formulas',
            hint: 'The normal density is on the formula sheet. Put in μ and σ, and remember σ is squared in the exponent.',
            check: choice({ tex: right }, [
              { tex: dens(M, S2, R`(2(${Sg})^2)`) },
              { tex: dens(M, Sg, R`(2(${Sg}))`) },
              { tex: dens(Sg, M, R`(2(${M})^2)`) },
            ]),
            answer: R`${right} \approx ${num(c0, 4)}\,e^{-(x-${M})^2/${num(2 * sig * sig, 6)}}`,
            steps: [
              {
                say: 'Start from the normal density (it is on the formula sheet).',
                tex: R`f(x) = \frac{1}{\sqrt{2\pi}\,\sigma}\,e^{-(x-\mu)^2/(2\sigma^2)}, \quad -\infty < x < \infty`,
              },
              {
                say: `Put in μ = ${M} and σ = ${Sg}. In the exponent σ is squared: 2σ² = 2(${S2}) = ${num(2 * sig * sig, 6)}.`,
                tex: R`${right} \approx ${num(c0, 4)}\,e^{-(x-${M})^2/${num(2 * sig * sig, 6)}}`,
                why: `The number in front is 1/(√(2π)·${Sg}) ≈ ${num(c0, 4)}: the height of the curve at its peak.`,
              },
              {
                say: `Sketch it: a bell, symmetric about μ = ${M}. Mark μ ± σ (${num(mu - sig, 4)}, ${num(mu + sig, 4)}), μ ± 2σ (${num(mu - 2 * sig, 4)}, ${num(mu + 2 * sig, 4)}) and μ ± 3σ (${num(mu - 3 * sig, 4)}, ${num(mu + 3 * sig, 4)}).`,
                graph: normalGraph({ mu, sig, note: `peak height ≈ ${num(c0, 4)} at x = ${M}` }),
                why: 'The curve is highest at μ and bends at μ ± σ. Almost all of it (99.7%) lies within 3σ of μ, so those marks make the sketch to scale.',
              },
            ],
            trap: 'σ goes in front once, not squared; in the exponent it is squared (2σ²). Mixing those two up is the usual slip.',
          },
          betweenPart({ label: 'a2', ask: R`Indicate on this graph the probability that \(X\) lies between ${F(v.a)} and ${F(v.b)}. Find this probability.`, mu, sig, a: v.a, b: v.b, F }),
          oneSidePart({
            label: 'b',
            ask: S.b(withU(v.c)),
            hint: '“Less than” is an area to the LEFT. Turn the value into z, then read the table.',
            mu,
            sig,
            x: v.c,
            F,
            sym: '<',
          }),
          rarePart({ label: 'c', ask: S.c(withU(v.e)), mu, sig, e: v.e, F, noun: S.noun, concern: false }),
          pointPart({ label: 'd', ask: S.d(pct(v.r), v.top), mu, sig, r: v.r, top: v.top, unit: S.U, dp: S.dp }),
          {
            label: 'e',
            ask: R`What is the moment generating function for \(X\)?`,
            skill: 'formulas',
            hint: 'The normal MGF is e^(μt + σ²t²/2). Square σ first.',
            check: choice({ tex: R`m_X(t) = e^{${M}t + ${half}t^2}` }, [
              { tex: R`m_X(t) = e^{${M}t + ${S2}t^2}` },
              { tex: R`m_X(t) = e^{${M}t + ${num(sig / 2, 6)}t^2}` },
              { tex: R`m_X(t) = e^{${M}t + ${half}t}` },
            ]),
            answer: R`m_X(t) = e^{${M}t + ${half}t^2}`,
            steps: [
              {
                say: 'The normal MGF is e^(μt + σ²t²/2).',
                tex: R`m_X(t) = e^{\mu t + \sigma^2 t^2/2}`,
                why: 'It is not on the formula sheet, so learn it.',
              },
              {
                say: `Put in μ = ${M} and σ² = (${Sg})² = ${S2}.`,
                tex: R`m_X(t) = e^{${M}t + (${S2})t^2/2} = e^{${M}t + ${half}t^2}`,
                why: 'The formula uses the variance σ², so square σ before you halve it.',
              },
              {
                say: 'Check: the first derivative at t = 0 should be the mean.',
                tex: R`m_X'(t) = (${M} + ${S2}t)\,e^{${M}t + ${half}t^2} \;\Rightarrow\; m_X'(0) = ${M} = \mu`,
                why: 'e⁰ = 1, so only μ is left. A quick way to catch a slip.',
              },
            ],
            trap: 'Using σ instead of σ², or forgetting the /2.',
          },
        ],
      }
    },
  })

  // ---------- 4.4 #42: fasting blood glucose (and twins) ----------
  const HEALTH = [
    {
      intro: (m, s) => `Among diabetics, the fasting blood glucose level \\(X\\) may be assumed to be approximately normally distributed with mean ${m} milligrams per 100 milliliters and standard deviation ${s} milligrams per 100 milliliters.`,
      U: R`\text{mg/100 ml}`,
      dp: 0,
      noun: 'diabetics',
      a: (lo, hi) => R`Sketch a graph of the density for \(X\). Indicate on this graph the probability that a randomly selected diabetic will have a blood glucose level between ${lo} and ${hi} mg/100 ml. Find this probability.`,
      c: (r, high) => `Find the point that has the property that ${r}% of all diabetics have a fasting glucose level of this value or ${high ? 'higher' : 'lower'}.`,
      d: e => `If a randomly selected diabetic is found to have fasting blood glucose level in excess of ${e}, do you think there is cause for concern? Explain, based on the probability of this occurring naturally.`,
      mus: [106],
      sigs: [8],
    },
    {
      intro: (m, s) => `Among adults aged 40 to 50 who take no blood pressure medication, the systolic blood pressure \\(X\\) may be assumed to be approximately normally distributed with mean ${m} mm Hg and standard deviation ${s} mm Hg.`,
      U: R`\text{mm Hg}`,
      dp: 0,
      noun: 'adults in this group',
      a: (lo, hi) => R`Sketch a graph of the density for \(X\). Indicate on this graph the probability that a randomly selected adult in this group will have a systolic blood pressure between ${lo} and ${hi} mm Hg. Find this probability.`,
      c: (r, high) => `Find the point that has the property that ${r}% of all adults in this group have a systolic blood pressure of this value or ${high ? 'higher' : 'lower'}.`,
      d: e => `If a randomly selected adult in this group is found to have a systolic blood pressure in excess of ${e}, do you think there is cause for concern? Explain, based on the probability of this occurring naturally.`,
      mus: [120, 124, 128],
      sigs: [10, 12, 14],
    },
    {
      intro: (m, s) => `Among healthy adults aged 20 to 30, the total blood cholesterol level \\(X\\) may be assumed to be approximately normally distributed with mean ${m} milligrams per deciliter and standard deviation ${s} milligrams per deciliter.`,
      U: R`\text{mg/dl}`,
      dp: 0,
      noun: 'adults in this group',
      a: (lo, hi) => R`Sketch a graph of the density for \(X\). Indicate on this graph the probability that a randomly selected adult in this group will have a cholesterol level between ${lo} and ${hi} mg/dl. Find this probability.`,
      c: (r, high) => `Find the point that has the property that ${r}% of all adults in this group have a cholesterol level of this value or ${high ? 'higher' : 'lower'}.`,
      d: e => `If a randomly selected adult in this group is found to have a cholesterol level in excess of ${e}, do you think there is cause for concern? Explain, based on the probability of this occurring naturally.`,
      mus: [175, 180, 185],
      sigs: [20, 25, 30],
    },
    {
      intro: (m, s) => `Among healthy adults, the resting heart rate \\(X\\) may be assumed to be approximately normally distributed with mean ${m} beats per minute and standard deviation ${s} beats per minute.`,
      U: R`\text{beats/min}`,
      dp: 0,
      noun: 'adults',
      a: (lo, hi) => R`Sketch a graph of the density for \(X\). Indicate on this graph the probability that a randomly selected adult will have a resting heart rate between ${lo} and ${hi} beats per minute. Find this probability.`,
      c: (r, high) => `Find the point that has the property that ${r}% of all healthy adults have a resting heart rate of this value or ${high ? 'higher' : 'lower'}.`,
      d: e => `If a randomly selected adult is found to have a resting heart rate in excess of ${e}, do you think there is cause for concern? Explain, based on the probability of this occurring naturally.`,
      mus: [68, 70, 72],
      sigs: [6, 7, 8],
    },
    {
      intro: (m, s) => `Among healthy adults, the body temperature \\(X\\) taken by mouth may be assumed to be approximately normally distributed with mean ${m} °F and standard deviation ${s} °F.`,
      U: R`{}^\circ\text{F}`,
      dp: 1,
      noun: 'healthy adults',
      a: (lo, hi) => R`Sketch a graph of the density for \(X\). Indicate on this graph the probability that a randomly selected healthy adult will have a temperature between ${lo} and ${hi} °F. Find this probability.`,
      c: (r, high) => `Find the point that has the property that ${r}% of all healthy adults have a temperature of this value or ${high ? 'higher' : 'lower'}.`,
      d: e => `If a randomly selected adult is found to have a temperature in excess of ${e} °F, do you think there is cause for concern? Explain, based on the probability of this occurring naturally.`,
      mus: [98.2, 98.4],
      sigs: [0.5, 0.6, 0.7],
    },
  ]

  HW.add({
    id: '4.4-42',
    section: '4.4',
    num: '42',
    group: 6,
    title: 'Fasting blood glucose',
    hw: { s: 0, mu: 106, sig: 8, a: 90, b: 122, x: 120, ge: false, r: 0.25, high: false, e: 130 },
    twin: () => {
      const s = 1 + Math.floor(Math.random() * (HEALTH.length - 1))
      const S = HEALTH[s], mu = pick(S.mus), sig = pick(S.sigs)
      const [a, b] = gridPair(mu, sig, S.dp)
      const ge = chance(0.3)
      // not at μ itself (that is just .5): like the homework's 120, a z away from 0
      const x = chance(0.65) ? gridX(mu, sig, S.dp, 0.3, ge ? 2.4 : 2.6) : gridX(mu, sig, S.dp, ge ? -1.5 : -2.4, -0.3)
      const e = chance(0.7) ? gridX(mu, sig, S.dp, 2.33, 3.4) : gridX(mu, sig, S.dp, 0.3, 1.2)
      return { s, mu, sig, a, b, x, ge, r: pick([0.25, 0.1, 0.05, 0.2, 0.3, 0.15, 0.4, 0.75, 0.8, 0.9, 0.95]), high: chance(0.3), e }
    },
    make: v => {
      const S = HEALTH[v.s], { mu, sig } = v
      const F = x => x.toFixed(S.dp)
      const sym = v.ge ? R`\ge` : R`\le`
      return {
        text: S.intro(num(mu, 6), num(sig, 6)),
        parts: [
          betweenPart({ label: 'a', ask: S.a(F(v.a), F(v.b)), mu, sig, a: v.a, b: v.b, F, sketch: true }),
          oneSidePart({
            label: 'b',
            ask: R`Find \(P[X ${sym} ${F(v.x)}\ ${S.U}]\).`,
            hint: v.ge ? 'This is an area to the RIGHT. Turn the value into z, read the left area, then take it from 1.' : 'This is an area to the LEFT. Turn the value into z, then read the table.',
            mu,
            sig,
            x: v.x,
            F,
            sym,
            right: v.ge,
          }),
          pointPart({ label: 'c', ask: S.c(pct(v.r), v.high), mu, sig, r: v.r, top: v.high, unit: S.U, dp: S.dp }),
          rarePart({ label: 'd', ask: S.d(F(v.e)), mu, sig, e: v.e, F, noun: S.noun, concern: true }),
        ],
      }
    },
  })

  // ---------- 4.4 #43: traffic-light software (the variance trap) ----------
  const REPAIR = [
    {
      intro: (m, v) => R`Let \(X\) denote the time in hours needed to locate and correct a problem in the software that governs the timing of traffic lights in the downtown area of a large city. Assume that \(X\) is normally distributed with mean ${m} hours and variance ${v}.`,
      unit: 'hours',
      dp: 0,
      a: (h, more) => `Find the probability that the next problem will require ${more ? 'more than' : 'at most'} ${h} hours to find and correct.`,
      b: (r, slow) => (slow ? `The slowest ${r}% of repairs take at least how many hours to complete?` : `The fastest ${r}% of repairs take at most how many hours to complete?`),
      mus: [10],
      sigs: [3],
    },
    {
      intro: (m, v) => R`Let \(X\) denote the time in minutes from when an order is placed until the pizza arrives, for a shop that delivers across a college town. Assume that \(X\) is normally distributed with mean ${m} minutes and variance ${v}.`,
      unit: 'minutes',
      dp: 0,
      a: (h, more) => `Find the probability that the next delivery will take ${more ? 'more than' : 'at most'} ${h} minutes.`,
      b: (r, slow) => (slow ? `The slowest ${r}% of deliveries take at least how many minutes?` : `The fastest ${r}% of deliveries take at most how many minutes?`),
      mus: [28, 30, 32, 35],
      sigs: [3, 6, 7],
    },
    {
      intro: (m, v) => R`Let \(X\) denote the time in minutes a new warehouse worker needs to assemble a flat-pack bookshelf. Assume that \(X\) is normally distributed with mean ${m} minutes and variance ${v}.`,
      unit: 'minutes',
      dp: 0,
      a: (h, more) => `Find the probability that the next bookshelf will take ${more ? 'more than' : 'at most'} ${h} minutes to assemble.`,
      b: (r, slow) => (slow ? `The slowest ${r}% of assemblies take at least how many minutes?` : `The fastest ${r}% of assemblies take at most how many minutes?`),
      mus: [45, 50, 55],
      sigs: [6, 7, 9],
    },
    {
      intro: (m, v) => R`Let \(X\) denote the finishing time in minutes of a runner in a large city marathon. Assume that \(X\) is normally distributed with mean ${m} minutes and variance ${v}.`,
      unit: 'minutes',
      dp: 0,
      a: (h, more) => `Find the probability that a randomly selected runner takes ${more ? 'more than' : 'at most'} ${h} minutes to finish.`,
      b: (r, slow) => (slow ? `The slowest ${r}% of runners take at least how many minutes to finish?` : `The fastest ${r}% of runners finish in at most how many minutes?`),
      mus: [240, 255, 270],
      sigs: [30, 35, 45],
    },
    {
      intro: (m, v) => R`Let \(X\) denote the time in days a repair shop needs to diagnose and fix a laptop sent in under warranty. Assume that \(X\) is normally distributed with mean ${m} days and variance ${v}.`,
      unit: 'days',
      dp: 1,
      a: (h, more) => `Find the probability that the next laptop will take ${more ? 'more than' : 'at most'} ${h} days to fix.`,
      b: (r, slow) => (slow ? `The slowest ${r}% of repairs take at least how many days?` : `The fastest ${r}% of repairs take at most how many days?`),
      mus: [8, 9, 10],
      sigs: [1.2, 1.5, 1.8],
    },
  ]

  HW.add({
    id: '4.4-43',
    section: '4.4',
    num: '43',
    group: 6,
    title: 'Traffic-light software repairs',
    hw: { s: 0, mu: 10, sig: 3, h: 15, more: false, r: 0.05, slow: false },
    twin: () => {
      const s = 1 + Math.floor(Math.random() * (REPAIR.length - 1))
      const S = REPAIR[s], mu = pick(S.mus), sig = pick(S.sigs)
      const more = chance(0.35)
      // like 15 → 5/3 in the homework, prefer an x whose z has to be rounded
      let h
      for (let i = 0; i < 40; i++) {
        h = gridX(mu, sig, S.dp, -1.5, 2.6)
        if (Math.abs(((h - mu) / sig) * 100 - Math.round(((h - mu) / sig) * 100)) > 1e-6) break
      }
      return { s, mu, sig, h, more, r: pick([0.05, 0.1, 0.01, 0.025, 0.2, 0.15]), slow: chance(0.3) }
    },
    make: v => {
      const S = REPAIR[v.s], { mu, sig } = v
      const F = x => x.toFixed(S.dp)
      const V = num(sig * sig, 4), Sg = num(sig, 6)
      // the trap: dividing by the variance
      const zWrong = Math.round(((v.h - mu) / (sig * sig)) * 100) / 100
      const pWrong = v.more ? 1 - HW.phi(zWrong) : HW.phi(zWrong)
      const sigStep = {
        say: `The problem gives the VARIANCE, σ² = ${V}. The z formula needs the standard deviation σ, so take the square root.`,
        tex: R`\sigma^2 = ${V} \;\Rightarrow\; \sigma = \sqrt{${V}} = ${Sg}`,
        why: 'z = (x − μ)/σ divides by σ, not σ². Mixing them up is how this problem is usually lost.',
      }
      const a = oneSidePart({
        label: 'a',
        ask: S.a(F(v.h), v.more),
        hint: `Careful: ${V} is the variance. Get σ first, then z = (x − μ)/σ.`,
        mu,
        sig,
        x: v.h,
        F,
        sym: v.more ? '>' : R`\le`,
        right: v.more,
        pre: [sigStep],
        extraWrong: [pWrong],
        trap: `Using σ = ${V} (the variance) gives z ≈ ${zw(zWrong)} and ${a4(pWrong)}, which is wrong. The ${V} is σ², not σ.`,
      })
      const b = pointPart({
        label: 'b',
        ask: S.b(pct(v.r), v.slow),
        mu,
        sig,
        r: v.r,
        top: v.slow,
        unit: R`\text{${S.unit}}`,
        dp: S.dp,
        sigNote: `Use σ = ${Sg} here, not the variance ${V}.`,
        varGiven: true,
      })
      b.hint = v.slow
        ? `The slowest ${pct(v.r)}% are the LONGEST times: an area of ${bk(v.r)} to the RIGHT. And σ = √${V}.`
        : `The fastest ${pct(v.r)}% are the SHORTEST times: an area of ${bk(v.r)} to the LEFT. And σ = √${V}.`
      b.steps[0].say = v.slow
        ? `The slowest ${pct(v.r)}% are the longest times, out in the right tail: area ${bk(v.r)} to the RIGHT, so ${bk(1 - v.r)} to the LEFT.`
        : `The fastest ${pct(v.r)}% are the shortest times, out in the left tail: area ${bk(v.r)} to the LEFT.`
      const mirror = mu - zBack(v.slow ? 1 - v.r : v.r).z * sig
      b.trap = v.slow
        ? `Slowest means LONGEST, the right tail. Using the left tail gives ${num(mirror, 4)} ${S.unit}, the fastest ${pct(v.r)}%.`
        : `Fastest means SHORTEST, the left tail. Using +${zw(Math.abs(zBack(v.r).z))} gives ${num(mirror, 4)} ${S.unit}, the slowest ${pct(v.r)}%.`
      return { text: S.intro(num(mu, 6), V), parts: [a, b] }
    },
  })
})()
