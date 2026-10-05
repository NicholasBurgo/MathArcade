// js/41-boot.js · boot: the last listeners, then the first screen
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.

document.getElementById('sound').addEventListener('click', () => {
  state.muted = !state.muted
  save()
  hud()
  if (!state.muted) sfx.right(0)
})
document.addEventListener('keydown', e => {
  if (!overlay.hidden) {
    if (e.key === 'Escape') closeOverlay()
    return
  }
  if (e.key === 'Escape' && !tablesPop.hidden) closeTables()
})

// a new screen (question, card, results) starts with a clean page
new MutationObserver(() => {
  clearInk()
}).observe(document.getElementById('view'), { childList: true })
// #dev in the address: the panels, for testing them on their own
if (location.hash === '#dev') window.__arcade = { workPanel, plugPanel, mgfPlayer, mgfBuildProblem, BUILDS, paramProblem, paramCard, treeProblem, buildChoices6, tex, h, distGraph, graphOf, inferGraph, drawGraph, problemFor, REVIEW }
hud()
renderMap()
connect()
