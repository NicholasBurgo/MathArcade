// js/30-tree-questions.js · the tree's questions: which distribution, from all ten
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the tree's questions: which distribution, from all ten ----------
// the distributions a story is most often mistaken for (Read off the numbers uses them)
const CONFUSED = {
  binomial: ['hyper', 'negbin', 'poisson', 'geometric', 'normal'],
  geometric: ['negbin', 'binomial', 'exponential', 'poisson', 'hyper'],
  negbin: ['geometric', 'binomial', 'gamma', 'hyper', 'poisson'],
  hyper: ['binomial', 'poisson', 'negbin', 'geometric', 'uniform'],
  poisson: ['binomial', 'exponential', 'geometric', 'hyper', 'gamma'],
  uniform: ['normal', 'exponential', 'binomial', 'chi', 'gamma'],
  exponential: ['gamma', 'poisson', 'geometric', 'uniform', 'chi'],
  gamma: ['exponential', 'negbin', 'chi', 'poisson', 'normal'],
  // not gamma: every chi-squared IS a gamma (β = 2)
  chi: ['normal', 'exponential', 'uniform', 'poisson', 'binomial'],
  normal: ['uniform', 'chi', 'binomial', 'exponential', 'gamma'],
}
// a story, every distribution's name, and the tree path as the explanation
// the distributions with a test-style "X has this MGF" story (Build the MGF asks those)
const MGF_LEAVES = ['geometric', 'exponential', 'gamma', 'chi', 'normal']
// the ones a test makes you name from a story; it always names a normal, and a chi-squared
// too, unless it hands you a gamma with β = 2 (chi-squared = gamma(γ/2, 2), the only chi story here)
const TREE_LEAVES = ['binomial', 'geometric', 'negbin', 'hyper', 'poisson', 'exponential', 'uniform', 'gamma', 'chi']
function treeProblem(leaf = pickOne(TREE_LEAVES), hard = false, { mgf = false } = {}) {
  // Level 1 is stories; naming a distribution from its MGF belongs to Build the MGF
  let sc
  do sc = pickOne((hard ? HARD : STORIES)[leaf])()
  while ((sc.clue === 'moment generating function') !== mgf)
  const path = pathTo(leaf)
  // every distribution with its formula, in the tree's order (counting, then measuring),
  // so where a name sits gives nothing away; a story's other right names (a gamma with
  // β = 2 is also a chi-squared) count as right too (alsoRight, by key)
  const names = PICK_ORDER
  return {
    ask: mgf ? 'X has the MGF shown. Name the distribution of X and its parameters.' : 'Which distribution does X have?',
    text: sc.text,
    latex: sc.latex ? `${sc.latex} \\qquad X \\sim \\,?` : 'X \\sim \\,?',
    trap: sc.trap,
    read: sc.read,
    options: names.map(k => ({ name: LEAVES[k].name, latex: LEAVES[k].tex, key: k })),
    answer: CHOICE_LETTERS[names.indexOf(leaf)],
    placeholder: 'a to j',
    hint: { text: `${path.map(x => x.b.a).join(' → ')}. ${path[path.length - 1].b.why}` },
    clue: sc.clue,
    leaf,
    // the names that are just as right (a gamma with β = 2 is a chi-squared)
    alsoRight: sc.avoid ?? [],
    mgfParams: sc.params,
    vars: sc.vars,
  }
}
// what to say when the other right name is picked
const ALSO_NOTE = {
  chi: 'Right: it is a gamma with β = 2, and a gamma with β = 2 is also the chi-squared with γ = 2α. On the test, name both.',
  exponential: 'Right: it is a gamma with α = 1, and a gamma with α = 1 is also the exponential with λ = 1/β. On the test, name both.',
}
