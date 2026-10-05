// js/02-sections-and-levels.js · the path: the fundamentals, the test's sections in the order of the notes, then the mixes
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the path: the fundamentals, the test's sections in the order of the notes, then the mixes ----------
// A section level lists its engine question kinds ('topic:template'), which play their
// work out (work panels, tables, graphs), and the quiz and study-guide derivation parts
// that go with it: [problem id, part labels], or null for every part. A level plays
// its parts only when it has no engine kinds; the challenge uses them when none of the
// level's kinds can be typed.
// Engine kinds left out: mgf:which (picks the formula; the test has you use it),
// mgf:identify (Build the MGF names an MGF's distribution, every chapter),
// discrete-derive:why (reasons from three sections' derivations; each build says why as
// it plays), continuous-cdf:discrete-pdf (a pdf from a step cdf: the guide asks it only
// for continuous X), chi-squared:mean-var (not on the guide; the quiz keeps only 38(d)),
// integration:steps (the same integral as integration:antiderivative, a box at a time).
const SECTION_LEVELS = {
  '3.4': {
    'Geometric pdf': {
      kinds: ['geometric-derive:pdf-build', 'geometric-derive:pdf-numbers', 'geometric-derive:show-pdf', 'geometric-derive:show-pdf-numbers', 'geometric:pmf'],
      parts: [['3.4-24', ['a', 'b']], ['gap-geometric-pdf', null]],
    },
    'Geometric cdf': {
      kinds: ['geometric-derive:cdf-build', 'geometric-derive:cdf-numbers', 'geometric:cdf'],
      parts: [['gap-geometric-cdf', null], ['3.4-24', ['e']]],
    },
    'Discrete pdf: find c, probabilities, mean': {
      kinds: ['continuous-pdf:find-c-discrete', 'continuous-expectation:discrete-prob', 'continuous-cdf:discrete-cdf', 'continuous-expectation:discrete-mean', 'continuous-expectation:discrete-var'],
      parts: [['gap-discrete-constant', null]],
    },
    'Geometric MGF': {
      kinds: ['geometric-derive:mgf-sum', 'geometric-derive:mgf-factor', 'geometric-derive:mgf-series', 'geometric-derive:mgf-result', 'geometric-derive:mgf-domain', 'geometric-derive:mgf-numbers', 'continuous-mgf:discrete-table', 'continuous-mgf:discrete-formula', 'continuous-mgf:discrete-series'],
      parts: [['3.4-24', ['c']], ['gap-geometric-mgf', ['a', 'b']]],
    },
    'Mean and variance from an MGF': {
      kinds: ['mgf:geometric', 'mgf:finite', 'geometric:mean-var'],
      parts: [['3.4-24', ['d']], ['gap-geometric-mgf', ['c']]],
    },
  },
  '3.5': {
    'Binomial pdf': {
      kinds: ['discrete-derive:binom-build', 'discrete-derive:binom-sum'],
      parts: [['gap-binomial-pdf', null]],
    },
    'Binomial probabilities and mean': {
      kinds: ['binomial:exactly', 'binomial:cumulative', 'binomial:mean-var'],
      parts: [['3.5-42', null], ['3.5-37', ['a', 'b']]],
    },
    'Binomial table': {
      kinds: ['binomial-table:at-most', 'binomial-table:at-least', 'binomial-table:exactly', 'binomial-table:between', 'binomial-table:words', 'binomial-table:story'],
      parts: [['3.5-37', ['c', 'd']]],
    },
  },
  '3.6': {
    'Negative binomial pdf': {
      kinds: ['discrete-derive:negbin-build'],
      parts: [['gap-negbin-pdf', null]],
    },
    'Negative binomial probabilities': {
      kinds: ['negative-binomial:exactly', 'negative-binomial:cumulative', 'negative-binomial:possible'],
      parts: [['3.6-48', null], ['gap-negbin-mgf', null]],
    },
  },
  '3.7': {
    // the last pdf to derive, so a story here can be any of the three
    'Hypergeometric pdf': {
      kinds: ['discrete-derive:hyper-build', 'discrete-derive:numbers'],
      parts: [['gap-hyper-pdf', null]],
    },
    'Hypergeometric values and probabilities': {
      kinds: ['hypergeometric:values', 'hypergeometric:exactly', 'hypergeometric:tail'],
      parts: [['3.7-54', null], ['3.7-55', null], ['3.7-56', null]],
    },
  },
  '3.8': {
    'Poisson probabilities': {
      kinds: ['poisson:find-k', 'poisson:pmf', 'poisson:tail', 'poisson:moments', 'discrete-derive:poisson-sum'],
      parts: [['3.8-61', null]],
    },
  },
  '4.1': {
    'Verify a pdf, or find the constant': {
      kinds: ['continuous-pdf:is-pdf', 'continuous-pdf:find-c', 'continuous-pdf:find-c-prob'],
      parts: [['4.1-1', ['a']], ['4.2-24', ['a']]],
    },
    'Continuous probabilities': {
      kinds: ['continuous-pdf:prob', 'continuous-pdf:point'],
      parts: [['4.1-1', ['b', 'c', 'd']], ['4.2-24', ['c']]],
    },
    'pdf ↔ cdf': {
      kinds: ['continuous-cdf:derive', 'continuous-cdf:value', 'continuous-cdf:interval', 'continuous-cdf:pdf', 'continuous-cdf:pdf-value'],
      parts: [['4.1-10', null], ['4.2-24', ['b']], ['gap-pdf-from-cdf', null]],
    },
    'Uniform pdf': {
      kinds: ['uniform:derive', 'uniform:height', 'uniform:prob'],
      parts: [['gap-uniform-pdf', null], ['4.1-10', null]],
    },
  },
  '4.2': {
    'Mean and variance from a pdf': {
      kinds: ['continuous-expectation:mean', 'continuous-expectation:second-moment', 'continuous-expectation:variance', 'uniform:mean'],
      parts: [['4.2-15', null], ['4.2-24', ['d']]],
    },
    // the E[X] of e^(−x), or of an exponential, needs it once
    'Integration by parts': {
      kinds: ['integration:antiderivative', 'integration:definite'],
      parts: [],
    },
    'Continuous MGF': {
      kinds: ['continuous-mgf:combine', 'continuous-mgf:integral', 'continuous-mgf:domain', 'continuous-mgf:exponential', 'continuous-mgf:uniform', 'continuous-mgf:numbers', 'continuous-mgf:why', 'mgf:continuous'],
      parts: [['gap-continuous-mgf', ['a']]],
    },
  },
  '4.3': {
    // the gamma's MGF and moments are 4.3 in the notes (the derivation sits with 4.2's)
    'Gamma integrals': {
      kinds: ['integration:gamma-not-parts', 'gamma:constant', 'gamma:mean-var'],
      parts: [['4.3-25', null], ['gap-continuous-mgf', ['b', 'c']]],
    },
    'First event (exponential)': {
      kinds: ['exponential:at-most', 'exponential:units', 'exponential:more-than', 'exponential:between', 'exponential:derive', 'exponential:pdf', 'exponential:mean-var'],
      parts: [],
    },
    'Chi-squared table': {
      kinds: ['chi-squared:critical', 'chi-squared:left-value', 'chi-squared:right-area', 'chi-squared:left-area', 'chi-squared:between'],
      parts: [['4.3-38', null]],
    },
  },
  '4.4': {
    'Normal table': {
      kinds: ['normal-table:left', 'normal-table:right', 'normal-table:between', 'normal-table:tails', 'normal-table:z-one-side', 'normal-table:z-middle', 'normal-table:z-r'],
      parts: [['4.4-39', null]],
    },
    'Normal word problems': {
      kinds: ['normal-apps:z-score', 'normal-apps:less-more', 'normal-apps:between', 'normal-apps:outside', 'normal-apps:x-from-area', 'normal-apps:percentile', 'normal-apps:middle'],
      parts: [['4.4-43', null]],
    },
  },
}
const LEVELS = Object.assign({}, ...Object.values(SECTION_LEVELS))
const SECTION_TITLES = Object.fromEntries((window.HW?.SECTIONS ?? []).map(s => [s.id, s.title]))
// a level with nothing to ask (no engine kind, no problem to cut parts from) is left out
const playable = short => LEVELS[short].kinds.some(k => KIND[k]) || LEVELS[short].parts.some(([id]) => (window.HW?.problems ?? []).some(p => p.id === id))
const WORLDS = [
  { name: 'Fundamentals', blurb: 'Every chapter: which distribution it is, and its numbers.', levels: [TREE_LEVEL, PARAM_LEVEL] },
  ...Object.entries(SECTION_LEVELS).map(([sec, levels]) => ({ sec, name: SECTION_TITLES[sec] ?? `Section ${sec}`, levels: Object.keys(levels).filter(playable) })),
].filter(w => w.levels.length)
// the mixes: each chapter's levels, then every level, the fundamentals included
const REVIEW = {
  'Chapter 3 review': WORLDS.filter(w => w.sec?.startsWith('3.')).flatMap(w => w.levels),
  'Chapter 4 review': WORLDS.filter(w => w.sec?.startsWith('4.')).flatMap(w => w.levels),
  Everything: [...WORLDS.flatMap(w => w.levels), MGF_LEVEL],
}
// Build the MGF reviews every MGF on the test, so it waits until the sections are done
WORLDS.push({ name: 'Mixed', blurb: 'Each chapter, every MGF on the test, then everything at once.', levels: ['Chapter 3 review', 'Chapter 4 review', MGF_LEVEL, 'Everything'] })
const isReview = short => short in REVIEW
// where a level sits: the fundamentals, its section, or the mixes
const worldOf = short => WORLDS.find(w => w.levels.includes(short))
const placeOf = short => {
  const w = worldOf(short)
  return w?.sec ? `${w.sec} · ${w.name}` : w?.name ?? ''
}
// a level's engine kinds, grouped by topic (for picks weighted toward the bigger topics)
function topicsOf(short) {
  const by = new Map()
  for (const { t, tp } of levelKinds(short)) {
    if (!by.has(t.id)) by.set(t.id, { ...t, templates: [] })
    by.get(t.id).templates.push(tp)
  }
  return [...by.values()]
}
// the table levels: stories and tables, where each given number has one role
const TABLE_LEVELS = new Set(['Normal table', 'Normal word problems', 'Binomial table', 'Chi-squared table'])
const ORDER = WORLDS.flatMap(w => w.levels)
const BOSS_ORDER = ORDER.filter(s => !isReview(s))
