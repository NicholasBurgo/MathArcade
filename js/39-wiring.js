// js/39-wiring.js · wiring
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- wiring ----------
document.getElementById('home').addEventListener('click', () => {
  closeOverlay()
  renderMap()
})
document.getElementById('open-tables').addEventListener('click', () => (tablesPop.hidden ? openTables(tableHere()) : closeTables()))
addEventListener('resize', () => {
  if (tablesPop.hidden || !tablesPop.style.left) return
  const r = tablesPop.getBoundingClientRect()
  placeTables(r.left, r.top)
})
document.getElementById('open-sheet').addEventListener('click', openSheet)
document.getElementById('open-ready').addEventListener('click', () => openSkills())
