// The possible quiz questions (extraction/notes-extraction/quiz-problems.md) and the
// sections they come from. Loads after the g*.js files. Keeps the quiz problems, cut to
// the parts the quiz lists, and the study guide's derivations (group 7), which only the
// arcade uses. The homework-only problems are left out of the app.
;(() => {
  const HW = window.HW

  // the test's sections, in the order of the notes
  HW.SECTIONS = [
    { id: '3.4', title: 'Geometric distribution and the MGF' },
    { id: '3.5', title: 'Binomial distribution' },
    { id: '3.6', title: 'Negative binomial distribution' },
    { id: '3.7', title: 'Hypergeometric distribution' },
    { id: '3.8', title: 'Poisson distribution' },
    { id: '4.1', title: 'Continuous densities' },
    { id: '4.2', title: 'Expectation and distribution parameters' },
    { id: '4.3', title: 'Gamma, exponential and chi-squared' },
    { id: '4.4', title: 'Normal distribution' },
  ]

  // problem id → the parts the quiz lists (null: every part)
  HW.QUIZ = {
    '3.4-24': null,
    '3.5-37': null,
    '3.5-42': ['a', 'b'],
    '3.6-48': null,
    '3.7-54': null,
    '3.7-55': null,
    '3.7-56': null,
    '3.8-61': ['e', 'f', 'g', 'h', 'i'],
    '4.1-1': null,
    '4.1-10': null,
    '4.2-15': null,
    '4.2-24': null,
    '4.3-25': null,
    '4.3-38': ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'],
    '4.4-39': null,
    '4.4-43': null,
  }

  // the parts the quiz lists, written the way the quiz writes them: 'a, b', 'e–i', and
  // 'd' for d1–d6 (the home screen shows "3.8 #61 (e–i)")
  const listed = keep => {
    const ls = [...new Set(keep.map(l => l[0]))]
    const run = ls.length > 2 && ls.every((l, i) => !i || l.charCodeAt(0) === ls[i - 1].charCodeAt(0) + 1)
    return run ? `${ls[0]}–${ls.at(-1)}` : ls.join(', ')
  }

  HW.problems = HW.problems.filter(p => p.id in HW.QUIZ || p.group === 7)
  for (const p of HW.problems) {
    p.quiz = p.id in HW.QUIZ
    const keep = HW.QUIZ[p.id]
    if (!keep) continue
    p.listed = listed(keep)
    const make = p.make
    p.make = v => {
      const built = make(v)
      return { ...built, parts: built.parts.filter(pt => keep.includes(pt.label)) }
    }
  }
  HW.quizProblems = () => HW.problems.filter(p => p.quiz)
})()
