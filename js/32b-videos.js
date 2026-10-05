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
// each quiz question's videos, by its topic (its level, js/37b, plays them)
const QUIZ_VIDEOS = {
  '3.4-24': ['geometric', 'mgfIntro', 'geoMgf'],
  '3.5-37': ['binomial', 'binomNot'],
  '3.5-42': ['binomial', 'binomNot'],
  '3.6-48': ['negbin'],
  '3.7-54': ['hyper'],
  '3.7-55': ['hyper'],
  '3.7-56': ['hyper'],
  '3.8-61': ['poisson', 'poissonMV'],
  '4.1-1': ['findK', 'contProb', 'contIntro'],
  '4.1-10': ['uniform', 'contProb'],
  '4.2-15': ['contMV'],
  '4.2-24': ['contMV', 'contProb', 'findK'],
  '4.3-25': ['gammaFn', 'gammaDist'],
  '4.3-38': ['chiTable', 'chiIntro'],
  '4.4-39': ['zAreas', 'zPercentiles'],
  '4.4-43': ['standardize', 'zPercentiles', 'normalIntro'],
}
const videosFor = level => (LEVEL_VIDEOS[level] ?? []).map(k => VID[k]).filter(Boolean)

// the player: the video in a 16:9 frame, its note, and the level's other videos to switch to
function openVideos(level, at = 0) {
  const list = videosFor(level)
  if (!list.length) return
  const v = list[Math.min(at, list.length - 1)]
  overlay.replaceChildren()
  const inner = h('div', 'overlay-inner video-inner')
  // the pop-up's ink (js/08b) stays while switching between this level's videos
  inner.dataset.inkKey = 'video:' + level
  const head = h('div', 'overlay-head')
  head.append(h('strong', '', `Video · ${level}`), hwBtn('Close', 'tool', closeOverlay))
  inner.append(head)
  const frame = h('div', 'video-frame')
  const ifr = document.createElement('iframe')
  // enablejsapi: the Play and Pause buttons below talk to the player
  ifr.src = `https://www.youtube-nocookie.com/embed/${v.id}?rel=0&playsinline=1`
  ifr.title = v.title
  ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  ifr.allowFullscreen = true
  ifr.referrerPolicy = 'strict-origin-when-cross-origin'
  frame.append(ifr)
  inner.append(frame, h('p', 'video-title', `${v.title} · ${v.who}${v.len ? ' · ' + v.len : ''}`))
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
  // room to write: lined paper under everything (the pen writes anywhere but the video)
  const paper = h('div', 'video-paper')
  paper.append(h('div', 'eyebrow', 'Notes · write anywhere on this page with the pen'))
  inner.append(paper)
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
  list.forEach((v, i) => row.append(hwBtn(`${v.title}${v.len ? ' · ' + v.len : ''}`, 'tool', () => openVideos(level, i))))
  wrap.append(row)
  return wrap
}

