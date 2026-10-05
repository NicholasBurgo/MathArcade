// js/01-setup.js · setup: the engine, the tables and the level helpers
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.

const T2 = window.Test2
const unit = T2.unit
// the printed tables: the engine's, plus binomial n = 10 and 15 for the homework
const printedTables = () => (window.HW ? window.HW.tables() : unit.printedTables())
const TABLE_LIST = window.HW ? ['binomial10', 'binomial15', ...unit.tables] : unit.tables
// every engine question can make another of its kind, for "How do I do this?"
for (const t of unit.topics) for (const tp of t.templates) {
  const make = tp.generate
  tp.generate = function (...a) {
    const p = make.apply(this, a)
    if (p && typeof p === 'object') p.another = () => tp.generate()
    return p
  }
}
// every engine question kind, by 'topic:template'
const KIND = Object.fromEntries(unit.topics.flatMap(t => t.templates.map(tp => [`${t.id}:${tp.id}`, { t, tp }])))
const ROUND = 6
// a level of its own (not a study-guide line): name the distribution, every chapter,
// from test-style stories with traps
const TREE_LEVEL = 'Which distribution? (all chapters)'
// where an MGF comes from: the recipe, then the moves, line by line
const MGF_LEVEL = 'Build the MGF'
// its numbers (n, p, r, N, k) and the values X can take, read off the story
const PARAM_LEVEL = 'Read off the numbers'
const isTree = short => short === TREE_LEVEL
const isMgf = short => short === MGF_LEVEL
const isParam = short => short === PARAM_LEVEL
// the fundamentals: levels of their own (every chapter), not one section's
const isWorld0 = short => isTree(short) || isMgf(short) || isParam(short)
const REVIEW_NAMES = { 'Chapter 3 review': 1, 'Chapter 4 review': 1, Everything: 1 }
// every kind of engine question a level has
const levelKinds = short => (isWorld0(short) || short in REVIEW_NAMES ? [] : (LEVELS[short]?.kinds ?? []).map(k => KIND[k]).filter(Boolean))
// a round shows every kind at least once, and never fewer than ROUND questions; a mix
// asks one question from each of its levels; naming the distribution is quick, so its
// rounds run twice as long
const roundSize = short => (short in REVIEW_NAMES ? REVIEW[short].length : isTree(short) ? ROUND * 2 : isMgf(short) ? 8 : isParam(short) ? 10 : levelKinds(short).length ? Math.max(ROUND, levelKinds(short).length) : Math.max(ROUND, Math.min(10, sliceKinds(short).length)))
