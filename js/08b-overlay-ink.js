// js/08b-overlay-ink.js · pen ink on the pop-ups
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- pen ink on the pop-ups: every pop-up is paper too ----------
// The page's ink sits under the pop-ups, so each pop-up (a video, Weak spots, the formula
// sheet) gets its own: a layer over its content that doesn't catch taps. The pen writes
// anywhere on it; a quick pen tap on a button still presses it, and a stroke that starts
// on one writes instead. A video keeps the pen's taps, so tapping it pauses it. Fingers
// scroll and tap. Eraser and Clear ink sit in the pop-up's top bar. A pop-up redrawn with
// the same ink key (switching between a level's videos) keeps its ink; closing clears it.
const overlayEl = document.getElementById('overlay')
let overlayInkKept = null // the ink of the pop-up just replaced: { key, canvas }

function attachOverlayInk(inner, kept) {
  const el = document.createElement('canvas')
  el.className = 'overlay-ink'
  const ctx = el.getContext('2d')
  let drawing = null, pending = null, last = null, heldStroke = false, erasing = false, eatClick = false
  const size = () => {
    const w = inner.clientWidth, ht = inner.scrollHeight
    if (!w || !ht) return
    const dpr = window.devicePixelRatio || 1
    if (Math.abs(el.width - Math.round(w * dpr)) < 2 && Math.abs(el.height - Math.round(ht * dpr)) < 2) return
    // keep what's written when the pop-up changes size
    let snap = null
    if (el.width && el.height) {
      snap = document.createElement('canvas')
      snap.width = el.width
      snap.height = el.height
      snap.getContext('2d').drawImage(el, 0, 0)
    }
    el.width = Math.round(w * dpr)
    el.height = Math.round(ht * dpr)
    el.style.width = w + 'px'
    el.style.height = ht + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (snap) ctx.drawImage(snap, 0, 0, snap.width / dpr, snap.height / dpr)
  }
  const at = e => {
    const r = el.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const typing = t => t.closest('input, select, textarea')
  const tappable = t => t.closest('button, a, label, [role="button"], [role="listbox"]')
  const begin = (id, from, held) => {
    size()
    drawing = id
    heldStroke = held
    last = from
    try { inner.setPointerCapture(id) } catch {}
  }
  inner.addEventListener('pointerdown', e => {
    eatClick = false
    if (e.pointerType === 'touch') return
    if (e.pointerType === 'mouse' && e.button !== 0 && !sideButton(e)) return
    const t = e.target instanceof Element ? e.target : null
    if (!t || typing(t)) return
    if (tappable(t)) {
      pending = { id: e.pointerId, x: e.clientX, y: e.clientY, from: at(e), held: sideButton(e) }
      return
    }
    begin(e.pointerId, at(e), sideButton(e))
    e.preventDefault()
  })
  inner.addEventListener('pointermove', e => {
    // the pen moved off its spot on a button: that's writing, not a tap
    if (pending && e.pointerId === pending.id) {
      if (Math.hypot(e.clientX - pending.x, e.clientY - pending.y) < 8) return
      begin(pending.id, pending.from, pending.held)
      pending = null
      eatClick = true
    }
    if (e.pointerId !== drawing) return
    e.preventDefault()
    const p = at(e)
    const erase = erasing || heldStroke || sideButton(e)
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'
    ctx.strokeStyle = penColor()
    ctx.lineWidth = erase ? 26 : e.pressure > 0 ? 0.6 + e.pressure * 3 : 2
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last = p
  })
  const up = e => {
    pending = null
    if (e.pointerId !== drawing) return
    drawing = null
    heldStroke = false
  }
  inner.addEventListener('pointerup', up)
  inner.addEventListener('pointercancel', up)
  // a stroke that started on a button doesn't press it
  inner.addEventListener('click', e => {
    if (!eatClick) return
    eatClick = false
    e.preventDefault()
    e.stopPropagation()
  }, true)
  // the pen must write, not scroll the pop-up; fingers still scroll it
  inner.addEventListener('touchstart', e => { if (drawing !== null) e.preventDefault() }, { passive: false })
  inner.addEventListener('touchmove', e => { if (drawing !== null || pending) e.preventDefault() }, { passive: false })
  // Chrome reports the side button as a right click: no menu, and this stroke erases
  inner.addEventListener('contextmenu', e => {
    if (e.target instanceof Element && typing(e.target)) return
    e.preventDefault()
    if (drawing !== null) heldStroke = true
  })
  const onResize = () => (el.isConnected ? size() : removeEventListener('resize', onResize))
  addEventListener('resize', onResize)
  inner.append(el)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    size()
    // the same pop-up's ink from just before it was redrawn, where it was
    if (kept?.width) {
      const dpr = window.devicePixelRatio || 1
      ctx.drawImage(kept, 0, 0, kept.width / dpr, kept.height / dpr)
    }
  }))
  // Eraser and Clear ink in the top bar, before Close
  const head = inner.querySelector('.overlay-head')
  if (head) {
    const close = head.lastElementChild
    const eraser = document.createElement('button')
    eraser.type = 'button'
    eraser.className = 'tool'
    eraser.textContent = 'Eraser'
    eraser.setAttribute('aria-pressed', 'false')
    eraser.addEventListener('click', () => {
      erasing = !erasing
      eraser.setAttribute('aria-pressed', String(erasing))
    })
    const clear = document.createElement('button')
    clear.type = 'button'
    clear.className = 'tool'
    clear.textContent = 'Clear ink'
    clear.addEventListener('click', () => ctx.clearRect(0, 0, el.width, el.height))
    head.insertBefore(eraser, close)
    head.insertBefore(clear, close)
  }
}

// every pop-up that opens gets its ink; one redrawn under the same key keeps it
new MutationObserver(records => {
  for (const r of records) {
    for (const n of r.removedNodes) {
      const c = n instanceof Element ? n.querySelector(':scope > .overlay-ink') : null
      overlayInkKept = c && n.dataset.inkKey ? { key: n.dataset.inkKey, canvas: c } : null
    }
    for (const n of r.addedNodes) {
      if (!(n instanceof Element) || !n.classList.contains('overlay-inner')) continue
      const kept = overlayInkKept && n.dataset.inkKey && overlayInkKept.key === n.dataset.inkKey ? overlayInkKept.canvas : null
      attachOverlayInk(n, kept)
    }
  }
  // closed: nothing to keep
  if (overlayEl.hidden) overlayInkKept = null
}).observe(overlayEl, { childList: true })
