// js/32b-videos.js · videos for when you're stuck, played inside the app
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- videos: a short lesson per level, played in a pop-up ----------
// Each level lists the videos that teach it (checked on YouTube: each exists and allows
// embedding). A note says where a video writes things differently from the class.

const VID = {
  overview: { id: 'UrOXRvG9oYE', title: 'Overview of Some Discrete Probability Distributions', who: 'jbstatistics', len: '6:21' },
  examples: { id: 'Jm_Ch-iESBg', title: 'Discrete Probability Distributions: Example Problems', who: 'jbstatistics', len: '14:51' },
  binomNot: { id: 'UJFIZY0xx_s', title: 'Binomial/Not Binomial: Some Examples', who: 'jbstatistics', len: '8:08' },
  discreteEV: { id: 'Vyk8HQOckIE', title: 'The Expected Value and Variance of Discrete Random Variables', who: 'jbstatistics', len: '11:20' },
  geometric: { id: 'zq9Oz82iHf0', title: 'An Introduction to the Geometric Distribution', who: 'jbstatistics', len: '10:48' },
  mgfIntro: { id: 'OhsfHSN2PfA', title: 'Gentle introduction to moment generating functions', who: 'Phil Chan' },
  geoMgf: { id: '2ROoHCJYrYE', title: 'Geometric Distribution: Derivation of Mean, Variance & MGF', who: 'Computation Empire',
    note: 'Check whether the video counts trials (x = 1, 2, …, like your class, so m(t) = peᵗ/(1 − qeᵗ)) or failures (x = 0, 1, …).' },
  binomial: { id: 'qIzC1-9PwQo', title: 'An Introduction to the Binomial Distribution', who: 'jbstatistics', len: '14:11' },
  negbin: { id: 'BPlmjp2ymxw', title: 'Introduction to the Negative Binomial Distribution', who: 'jbstatistics', len: '7:33' },
  hyper: { id: 'L2KMttDm3aY', title: 'An Introduction to the Hypergeometric Distribution', who: 'jbstatistics', len: '15:35' },
  poisson: { id: 'jmqZG6roVqU', title: 'An Introduction to the Poisson Distribution', who: 'jbstatistics', len: '9:03',
    note: 'The video calls the Poisson’s parameter λ; your class calls it k (with k = λs for a rate λ over a stretch s).' },
  poissonMV: { id: '65n_v92JZeE', title: 'The Poisson Distribution: Deriving the Mean and Variance', who: 'jbstatistics', len: '9:17',
    note: 'The video calls the Poisson’s parameter λ; your class calls it k (with k = λs for a rate λ over a stretch s).' },
  poissonOrNot: { id: 'sv_KXSiorFk', title: 'Poisson or Not?', who: 'jbstatistics', len: '14:40',
    note: 'The video calls the Poisson’s parameter λ; your class calls it k (with k = λs for a rate λ over a stretch s).' },
  contIntro: { id: 'OWSOhpS00_s', title: 'An Introduction to Continuous Probability Distributions', who: 'jbstatistics', len: '5:52' },
  contProb: { id: 'EPm7FdajBvc', title: 'Finding Probabilities and Percentiles for a Continuous Distribution', who: 'jbstatistics', len: '11:59' },
  findK: { id: 'RsuS2ehsTDM', title: 'Probability Density Function: Finding k (Part 1)', who: 'ExamSolutions' },
  uniform: { id: 'izE1dXrH5JA', title: 'Introduction to the Continuous Uniform Distribution', who: 'jbstatistics', len: '7:03' },
  contMV: { id: 'Ro7dayHU5DQ', title: 'Deriving the Mean and Variance of a Continuous Probability Distribution', who: 'jbstatistics', len: '7:22' },
  expMgf: { id: '0odkBfjSX9g', title: 'Exponential Distribution: Derivation of Mean, Variance & MGF', who: 'Computation Empire',
    note: 'If the video writes the exponential with a rate λ, your class uses β = 1/λ: f(x) = (1/β)e^(−x/β), mean β, MGF 1/(1 − βt).' },
  gammaMgf: { id: 'WOJCC84zZHE', title: 'Gamma Distribution: Derivation of Mean, Variance & MGF', who: 'Computation Empire',
    note: 'If the video uses a rate, your class’s β is 1 over it: f(x) = x^(α−1)e^(−x/β)/(Γ(α)β^α), MGF (1 − βt)^(−α), mean αβ, variance αβ².' },
  gammaFn: { id: '9oro7kUixX0', title: 'Proof: Γ(α+1) = αΓ(α) and Γ(n) = (n−1)!', who: 'Computation Empire' },
  gammaDist: { id: 'J0Yzmb_PY3Y', title: 'The gamma distribution: an introduction', who: 'Ox educ',
    note: 'If the video uses a rate, your class’s β is 1 over it: f(x) = x^(α−1)e^(−x/β)/(Γ(α)β^α).' },
  expPoisson: { id: 'C7V3d2yB58U', title: 'The Exponential Distribution: Time Between Poisson Events', who: 'Steve Brunton',
    note: 'The video uses a rate λ. Your class writes the wait as exponential with β = 1/λ, so P[W ≤ t] = 1 − e^(−λt) = 1 − e^(−t/β).' },
  expProcess: { id: 'OWYGlwy0lkI', title: 'The Connection Between the Exponential Distribution and the Poisson Process', who: 'Steve Brunton',
    note: 'The video uses a rate λ; your class’s β is 1/λ.' },
  chiIntro: { id: 'hcDb12fsbBU', title: 'An Introduction to the Chi-Square Distribution', who: 'jbstatistics', len: '5:29' },
  chiTable: { id: 'C-0uN1inmcc', title: 'Using the Chi-square Table to Find Areas and Percentiles', who: 'jbstatistics',
    note: 'Your table’s columns are areas to the LEFT, so χ²ᵣ (area r on the right) is in column 1 − r. Check which tail the video’s table lists before copying a lookup.' },
  zAreas: { id: '-UljIcq_rfc', title: 'Finding Areas Using the Standard Normal Table (area to the left of z)', who: 'jbstatistics', len: '6:16' },
  zPercentiles: { id: '9KOJtiHAavE', title: 'Finding Percentiles Using the Standard Normal Table (area to the left of z)', who: 'jbstatistics', len: '7:33' },
  standardize: { id: '4R8xm19DmPM', title: 'Standardizing Normally Distributed Random Variables', who: 'jbstatistics', len: '10:28' },
  normalIntro: { id: 'iYiOVISWXS4', title: 'An Introduction to the Normal Distribution', who: 'jbstatistics', len: '5:27' },
}

// the videos for each level, best first
const LEVEL_VIDEOS = {
  'Which distribution? (all chapters)': ['overview', 'examples', 'binomNot'],
  'Read off the numbers': ['overview', 'examples'],
  'Geometric pdf': ['geometric'],
  'Geometric cdf': ['geometric'],
  'Discrete pdf: find c, probabilities, mean': ['discreteEV'],
  'Geometric MGF': ['mgfIntro', 'geoMgf'],
  'Mean and variance from an MGF': ['mgfIntro', 'geoMgf'],
  'Binomial pdf': ['binomial'],
  'Binomial probabilities and mean': ['binomial', 'binomNot'],
  'Binomial table': ['binomial'],
  'Negative binomial pdf': ['negbin'],
  'Negative binomial probabilities': ['negbin'],
  'Hypergeometric pdf': ['hyper'],
  'Hypergeometric values and probabilities': ['hyper'],
  'Poisson probabilities': ['poisson', 'poissonMV', 'poissonOrNot'],
  'Verify a pdf, or find the constant': ['findK', 'contIntro'],
  'Continuous probabilities': ['contProb', 'contIntro'],
  'pdf ↔ cdf': ['contProb'],
  'Uniform pdf': ['uniform'],
  'Mean and variance from a pdf': ['contMV'],
  'Continuous MGF': ['mgfIntro', 'expMgf', 'gammaMgf'],
  'Gamma integrals': ['gammaFn', 'gammaDist'],
  'First event (exponential)': ['expPoisson', 'expProcess'],
  'Chi-squared table': ['chiTable', 'chiIntro'],
  'Normal table': ['zAreas', 'zPercentiles'],
  'Normal word problems': ['standardize', 'normalIntro'],
  'Build the MGF': ['mgfIntro', 'gammaMgf', 'geoMgf'],
}
const videosFor = level => (LEVEL_VIDEOS[level] ?? []).map(k => VID[k]).filter(Boolean)

// the player: the video in a 16:9 frame, its note, and the level's other videos to switch to
// the notes written for a level, kept while switching between its videos
let videoNotesKept = null
function openVideos(level, at = 0) {
  const list = videosFor(level)
  if (!list.length) return
  const v = list[Math.min(at, list.length - 1)]
  const old = overlay.querySelector('.video-notes-ink')
  videoNotesKept = old && videoNotesKept?.level === level ? { level, canvas: old } : { level, canvas: null }
  overlay.replaceChildren()
  const inner = h('div', 'overlay-inner video-inner')
  const head = h('div', 'overlay-head')
  head.append(h('strong', '', `Video · ${level}`), hwBtn('Close', 'tool', closeOverlay))
  inner.append(head)
  const frame = h('div', 'video-frame')
  const ifr = document.createElement('iframe')
  // enablejsapi: the Play and Pause buttons below talk to the player
  ifr.src = `https://www.youtube-nocookie.com/embed/${v.id}?rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`
  ifr.title = v.title
  ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  ifr.allowFullscreen = true
  ifr.referrerPolicy = 'strict-origin-when-cross-origin'
  const pad = videoInk(frame)
  frame.append(ifr, pad.el)
  const notes = videoNotes(inner, videoNotesKept.canvas)
  inner.append(videoTools(ifr, pad, notes), frame, h('p', 'video-title', `${v.title} · ${v.who}${v.len ? ' · ' + v.len : ''}`))
  if (v.note) inner.append(h('p', 'video-note', 'Heads up: ' + v.note))
  if (list.length > 1) {
    const more = h('div', 'video-list')
    list.forEach((w, i) => {
      const b = hwBtn(`${w.title}${w.len ? ' · ' + w.len : ''}`, 'tool' + (i === at ? ' on' : ''), () => openVideos(level, i))
      more.append(b)
    })
    inner.append(h('h3', '', 'More on this'), more)
  }
  inner.append(h('p', 'paper-note', 'Needs the internet. Closing this stops the video and clears what you wrote.'))
  // room to write: lined paper under everything, and the pen's ink over the whole pop-up
  const paper = h('div', 'video-paper')
  paper.append(h('div', 'eyebrow', 'Notes · write anywhere on this page with the pen'))
  inner.append(paper, notes.el)
  overlay.append(inner)
  overlay.hidden = false
  overlay.scrollTop = 0
  document.body.style.overflow = 'hidden'
}

// a "Video" button for a question's row (none when the level has no video)
function videoButton(level) {
  if (!videosFor(level).length) return null
  const b = h('button', 'btn ghost', 'Video')
  b.type = 'button'
  b.title = 'A short lesson on this kind of question'
  b.addEventListener('click', () => openVideos(level))
  return b
}

// the level card's "Stuck? Watch one of these" list
function videoCard(level) {
  const list = videosFor(level)
  if (!list.length) return null
  const wrap = h('div', 'video-card')
  wrap.append(h('div', 'eyebrow', 'Stuck? Watch one of these'))
  const row = h('div', 'video-list')
  list.forEach((v, i) => row.append(hwBtn(`▶ ${v.title}${v.len ? ' · ' + v.len : ''}`, 'tool', () => openVideos(level, i))))
  wrap.append(row)
  return wrap
}

// ---------- writing on the video: a clear layer over it for the pen ----------
// A YouTube video can't be drawn into, so the pen writes on a canvas laid over it. With
// Write on, the layer takes the pen (and the mouse); fingers do nothing there, so play
// and pause from the buttons above. With Write off, taps go through to the video.
// The pen's side button (or the Eraser button) erases, as on the page.
function videoInk(frame) {
  const el = document.createElement('canvas')
  el.className = 'video-ink'
  const ctx = el.getContext('2d')
  let on = true, erasing = false, drawing = null, last = null, heldStroke = false
  const size = () => {
    const r = frame.getBoundingClientRect()
    if (!r.width) return
    const dpr = window.devicePixelRatio || 1
    // keep what's written when the frame changes size (turning the tablet)
    let snap = null
    if (el.width && el.height) {
      snap = document.createElement('canvas')
      snap.width = el.width
      snap.height = el.height
      snap.getContext('2d').drawImage(el, 0, 0)
    }
    el.width = Math.round(r.width * dpr)
    el.height = Math.round(r.height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (snap) ctx.drawImage(snap, 0, 0, r.width, r.height)
  }
  const at = e => {
    const r = el.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const stroke = (a, b, e) => {
    const erase = erasing || heldStroke || sideButton(e)
    ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over'
    ctx.strokeStyle = penColor()
    ctx.lineWidth = erase ? 26 : e.pressure > 0 ? 0.8 + e.pressure * 3.5 : 2.5
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  el.addEventListener('pointerdown', e => {
    // the pen and the mouse write; a finger or a palm on the video does nothing
    if (e.pointerType === 'touch') return
    if (!el.width) size()
    drawing = e.pointerId
    heldStroke = sideButton(e)
    last = at(e)
    try { el.setPointerCapture(e.pointerId) } catch {}
    e.preventDefault()
  })
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== drawing) return
    e.preventDefault()
    const p = at(e)
    stroke(last, p, e)
    last = p
  })
  const up = e => {
    if (e.pointerId !== drawing) return
    drawing = null
    heldStroke = false
  }
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  // Chrome reports the side button as a right click: no menu, and this stroke erases
  el.addEventListener('contextmenu', e => {
    e.preventDefault()
    if (drawing !== null) heldStroke = true
  })
  const onResize = () => (el.isConnected ? size() : removeEventListener('resize', onResize))
  addEventListener('resize', onResize)
  requestAnimationFrame(size)
  return {
    el,
    setWrite(v) {
      on = v
      el.classList.toggle('off', !on)
    },
    get write() {
      return on
    },
    setErase(v) {
      erasing = v
    },
    clear() {
      ctx.clearRect(0, 0, el.width, el.height)
    },
  }
}

// the buttons over the video: play, pause, write on it, erase, clear
function videoTools(ifr, pad, notes) {
  const say = func => ifr.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
  // the player listens for commands once it has been greeted
  ifr.addEventListener('load', () => ifr.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'))
  const row = h('div', 'video-tools')
  const play = hwBtn('▶ Play', 'tool', () => say('playVideo'))
  const pause = hwBtn('⏸ Pause', 'tool', () => say('pauseVideo'))
  const write = hwBtn('', 'tool video-write', () => {
    pad.setWrite(!pad.write)
    show()
  })
  const eraser = hwBtn('Eraser', 'tool', () => {
    const v = eraser.getAttribute('aria-pressed') !== 'true'
    eraser.setAttribute('aria-pressed', String(v))
    pad.setErase(v)
    notes.setErase(v)
  })
  eraser.setAttribute('aria-pressed', 'false')
  const clear = hwBtn('Clear ink', 'tool', () => {
    pad.clear()
    notes.clear()
  })
  const show = () => {
    write.textContent = pad.write ? '✏ Write: on' : '✏ Write: off'
    write.setAttribute('aria-pressed', String(pad.write))
    write.title = pad.write ? 'The pen writes on the video. Turn off to tap the video itself.' : 'Taps go to the video. Turn on to write on it.'
  }
  show()
  row.append(play, pause, write, eraser, clear)
  return row
}

// ---------- notes around the video: the whole pop-up is paper for the pen ----------
// The ink lies over the pop-up's content without catching taps, so fingers still scroll
// and press buttons; the pen writes anywhere that isn't a button or the video (the
// video has its own layer, Write on). Side button or Eraser erases.
function videoNotes(inner, keep = null) {
  const el = document.createElement('canvas')
  el.className = 'video-notes-ink'
  const ctx = el.getContext('2d')
  let drawing = null, last = null, heldStroke = false, erasing = false
  const size = () => {
    const w = inner.clientWidth, ht = inner.scrollHeight
    if (!w || !ht) return
    const dpr = window.devicePixelRatio || 1
    if (Math.abs(el.width - Math.round(w * dpr)) < 2 && Math.abs(el.height - Math.round(ht * dpr)) < 2) return
    // keep what's written when the page changes size
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
  // buttons, the video and its own writing layer keep their taps
  const blocked = e => e.target instanceof Element && Boolean(e.target.closest('button, input, a, select, textarea, label, [role="button"], iframe, .video-ink'))
  inner.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || blocked(e)) return
    if (e.pointerType === 'mouse' && e.button !== 0 && !sideButton(e)) return
    size()
    drawing = e.pointerId
    heldStroke = sideButton(e)
    last = at(e)
    try { inner.setPointerCapture(e.pointerId) } catch {}
    e.preventDefault()
  })
  inner.addEventListener('pointermove', e => {
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
    if (e.pointerId !== drawing) return
    drawing = null
    heldStroke = false
  }
  inner.addEventListener('pointerup', up)
  inner.addEventListener('pointercancel', up)
  // the pen must write, not scroll the pop-up; fingers still scroll it
  inner.addEventListener('touchstart', e => { if (drawing !== null) e.preventDefault() }, { passive: false })
  inner.addEventListener('touchmove', e => { if (drawing !== null) e.preventDefault() }, { passive: false })
  // Chrome reports the side button as a right click: no menu, and this stroke erases
  inner.addEventListener('contextmenu', e => {
    if (blocked(e)) return
    e.preventDefault()
    if (drawing !== null) heldStroke = true
  })
  const onResize = () => (el.isConnected ? size() : removeEventListener('resize', onResize))
  addEventListener('resize', onResize)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    size()
    // the notes from the level's last video, where they were on the page
    if (keep?.width) ctx.drawImage(keep, 0, 0, keep.width / (window.devicePixelRatio || 1), keep.height / (window.devicePixelRatio || 1))
  }))
  return {
    el,
    setErase(v) {
      erasing = v
    },
    clear() {
      ctx.clearRect(0, 0, el.width, el.height)
    },
  }
}
