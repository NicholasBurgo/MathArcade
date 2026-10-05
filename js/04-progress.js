// js/04-progress.js · progress
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- progress ----------
const LOCAL_KEY = 'math3800-arcade.v1'
const fresh = () => ({ v: 1, stars: {}, plays: {}, recent: {}, practice: {}, hw: {}, hwTests: [], muted: false, answered: 0, correct: 0, boss: null, updated: 0 })
// progress saved before XP, the pet and the day streak were taken out still carries them
const tidy = s => {
  for (const k of ['xp', 'pet', 'days', 'lastDay']) delete s[k]
  return s
}
let state = fresh()
try {
  const s = JSON.parse(localStorage.getItem(LOCAL_KEY))
  if (s && s.v === 1) state = tidy({ ...fresh(), ...s })
} catch {}

let remote = null // the viewer's own progress document, when the page can sync
let writing = Promise.resolve()
function save() {
  state.updated = Date.now()
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)) } catch {}
  if (remote) {
    const body = JSON.parse(JSON.stringify(state))
    writing = writing.then(() => remote.set(body)).catch(() => {})
  }
}
async function connect() {
  try {
    if (!window.claude?.use) return
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')])
    if (!db || !user) return
    const id = await user.id()
    if (!id) return
    const ref = db.doc('data/users/' + id + '/arcade')
    const snap = await ref.get()
    remote = ref
    const theirs = snap.exists ? snap.data() : null
    if (theirs && theirs.v === 1 && (theirs.updated || 0) > (state.updated || 0)) {
      state = tidy({ ...fresh(), ...JSON.parse(JSON.stringify(theirs)) })
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(state)) } catch {}
      hud()
      if (screen === 'map') renderMap()
    } else if (state.updated) save()
  } catch {}
}
