// js/08-ink.js · S Pen ink: only a stylus writes; fingers and the mouse scroll and tap
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- S Pen ink: only a stylus writes; fingers and the mouse scroll and tap ----------
// The ink sits on the page (it scrolls with the question) and clears itself
// when the screen changes. The pen's side button (or eraser end) erases.
const ink = document.getElementById('ink')
const inkCtx = ink.getContext('2d')
const inkClear = document.getElementById('ink-tools')
const inkEraseBtn = document.getElementById('ink-erase')
// the pen writes in blue (a lighter blue on the dark theme)
const penColor = () => getComputedStyle(document.documentElement).getPropertyValue('--pen-blue').trim() || '#1d4ed8'
// the on-screen eraser, for when the side button is taken (Air Command)
let inkEraseMode = false
const setEraseMode = on => {
  inkEraseMode = on
  inkEraseBtn.setAttribute('aria-pressed', String(on))
  if (on) inkClear.hidden = false
}
inkEraseBtn.addEventListener('click', () => setEraseMode(!inkEraseMode))
let inking = false
let inkLast = null
const pageSize = () => ({ w: document.documentElement.clientWidth, h: Math.max(document.documentElement.scrollHeight, innerHeight) })
// keep = copy the strokes across (rotation, the page growing below them)
function sizeInk(keep) {
  // measure the page without the ink layer, so it never props the page open
  const was = ink.style.height
  ink.style.height = '0px'
  const { w, h } = pageSize()
  ink.style.height = was
  const dpr = window.devicePixelRatio || 1
  let snap = null
  if (keep && ink.width && ink.height) {
    snap = document.createElement('canvas')
    snap.width = ink.width
    snap.height = ink.height
    snap.getContext('2d').drawImage(ink, 0, 0)
  }
  ink.width = Math.round(w * dpr)
  ink.height = Math.round(h * dpr)
  ink.style.width = w + 'px'
  ink.style.height = h + 'px'
  inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  inkCtx.lineCap = 'round'
  inkCtx.lineJoin = 'round'
  if (snap) inkCtx.drawImage(snap, 0, 0, snap.width / dpr, snap.height / dpr)
}
function clearInk() {
  inking = false
  inkLast = null
  sizeInk(false)
  inkClear.hidden = true
  setEraseMode(false)
}
const onControl = e => e.target instanceof Element && e.target.closest('button, input, a, select, textarea, label, [role="button"], [role="listbox"], .tables-pop, .calc, .overlay')
const sideButton = e => (e.buttons & 34) !== 0 || e.button === 2 || e.button === 5
// where the pen is on the page: the screen spot plus how far the page is scrolled
const onPage = e => ({ x: e.clientX + window.scrollX, y: e.clientY + window.scrollY })
// With the side button held, some Samsung browsers stop calling the S Pen a pen and
// report a right-button mouse instead. Take that as an erase stroke too, and once
// a stroke starts, follow that pointer to the end whatever it is called.
let inkPointer = null
const penLike = e => e.pointerType === 'pen' || (e.pointerType === 'mouse' && sideButton(e))
// Hold to erase: a stroke erases while the side button is held and writes again
// once it is let go. Browsers report a held button in two ways:
//  - the standard one: the pointer's buttons bit 2 (barrel) or 32 (eraser end) on
//    every event while it is held (Samsung Internet);
//  - only a right click as it goes down (Chrome): then the stroke it belongs to
//    erases to its end, including what it drew before the click arrived.
// Chrome can also cut a held-button drag short; if the pen keeps moving with the
// button held, erasing picks back up.
let heldAt = 0 // when the last right click from the side button arrived
let strokeHeld = false // a right click came during (or just before) this stroke
let strokePts = [] // this stroke's points, to wipe if it turns out to be an erase
const held = e => sideButton(e) || strokeHeld
const wipe = pts => {
  if (pts.length < 2) return
  inkCtx.save()
  inkCtx.globalCompositeOperation = 'destination-out'
  inkCtx.lineWidth = 26
  inkCtx.beginPath()
  inkCtx.moveTo(pts[0].x, pts[0].y)
  for (const pt of pts.slice(1)) inkCtx.lineTo(pt.x, pt.y)
  inkCtx.stroke()
  inkCtx.restore()
}
function sidePress(e) {
  if (onControl(e)) return
  e.preventDefault()
  window.getSelection()?.removeAllRanges()
  // during a stroke it belongs to that stroke; with the pen up, to the next touch
  if (!inking) heldAt = Date.now()
  else if (!strokeHeld) {
    strokeHeld = true
    wipe(strokePts)
  }
}
window.addEventListener('pointerdown', e => {
  penCheck(e)
  if (!penLike(e) || onControl(e)) return
  const { w, h } = pageSize()
  if (Math.abs(parseFloat(ink.style.width) - w) > 1 || parseFloat(ink.style.height) < h) sizeInk(true)
  inking = true
  inkPointer = e.pointerId
  // a right click just before the pen touched means the button is down
  strokeHeld = Date.now() - heldAt < 700
  inkLast = onPage(e)
  strokePts = [inkLast]
  e.preventDefault()
}, { passive: false })
window.addEventListener('pointermove', e => {
  penCheck(e)
  // the browser cut a held-button stroke short, but the pen is down with the button still held
  if (!inking && penLike(e) && (e.buttons & 34) !== 0 && !onControl(e)) {
    inking = true
    inkPointer = e.pointerId
    inkLast = onPage(e)
    strokePts = [inkLast]
  }
  if (!inking || e.pointerId !== inkPointer) return
  e.preventDefault()
  const erase = inkEraseMode || held(e)
  inkCtx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'
  inkCtx.strokeStyle = penColor()
  inkCtx.lineWidth = erase ? 26 : e.pressure > 0 ? 0.6 + e.pressure * 3 : 2
  inkCtx.beginPath()
  inkCtx.moveTo(inkLast.x, inkLast.y)
  const at = onPage(e)
  inkCtx.lineTo(at.x, at.y)
  inkCtx.stroke()
  inkLast = at
  strokePts.push(at)
  if (!erase) inkClear.hidden = false
}, { passive: false })
const inkUp = e => {
  penCheck(e)
  inking = false
  strokeHeld = false
  strokePts = []
  inkLast = null
  inkPointer = null
}
window.addEventListener('pointerup', inkUp)
window.addEventListener('pointercancel', inkUp)
// the pen must ink, not scroll: cancel its touch gestures; fingers still pan
window.addEventListener('touchstart', e => { if (inking) e.preventDefault() }, { passive: false })
window.addEventListener('touchmove', e => {
  if (inking || ([...e.touches].some(t => t.touchType === 'stylus') && !onControl(e))) e.preventDefault()
}, { passive: false })
// the side button as a right click: no context menu, no text selection, just erasing
window.addEventListener('contextmenu', sidePress)
window.addEventListener('mousedown', e => { if (e.button === 2) sidePress(e) })
window.addEventListener('selectstart', e => {
  if (inking || inkEraseMode || !(e.target instanceof Element && e.target.closest('input, textarea'))) e.preventDefault()
})

// Pen check: open the page with #pen and a small box shows what the tablet
// reports for each pen event, side button included. Off otherwise.
const penBox = location.hash === '#pen' ? document.body.appendChild(Object.assign(document.createElement('pre'), { className: 'pen-check', textContent: 'Pen check: touch the screen with the S Pen' })) : null
function penCheck(e) {
  if (!penBox) return
  penBox.textContent =
    `event    ${e.type}\ntype     ${e.pointerType || '(none)'}\nbutton   ${e.button}\nbuttons  ${e.buttons}\npressure ${e.pressure?.toFixed?.(2) ?? '-'}\n` +
    `button   ${(e.buttons & 34) !== 0 ? 'held' : '-'}${Date.now() - heldAt < 1500 ? ' (right click)' : ''}\nerasing  ${inking && (inkEraseMode || held(e)) ? 'YES' : 'no'}`
}
window.addEventListener('contextmenu', e => penBox && (penBox.textContent += `\ncontextmenu (${e.pointerType || 'no type'})`), true)
window.addEventListener('resize', () => sizeInk(true))
document.getElementById('ink-clear').addEventListener('click', clearInk)
