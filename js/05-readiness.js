// js/05-readiness.js · readiness: the homework's skills (openSkills), and the arcade's next level
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- readiness: the homework's skills (openSkills), and the arcade's next level ----------
const grade = r => (r >= 0.9 ? 'A' : r >= 0.8 ? 'B' : r >= 0.7 ? 'C' : r >= 0.6 ? 'D' : r > 0 ? 'F' : '–')
const nextUp = () => ORDER.find(k => (state.stars[k] || 0) < 2) ?? ORDER.find(k => (state.stars[k] || 0) < 3) ?? ORDER[0]
