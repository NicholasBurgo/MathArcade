// js/09-math.js · math
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- math ----------
let mathReady = false
const mathBoot = (window.MathJax?.startup?.promise ?? Promise.reject(new Error('no MathJax')))
  .then(() => {
    // tex2svg skips typesetting, so add MathJax's own styles (they hide the screen-reader copy)
    document.head.append(MathJax.svgStylesheet())
    mathReady = true
  })
  .catch(() => {})
function tex(latex, display = true) {
  const el = document.createElement(display ? 'div' : 'span')
  el.className = display ? 'math-d' : 'math-i'
  if (mathReady) {
    try { el.append(MathJax.tex2svg(latex, { display })); return el } catch {}
  }
  el.textContent = latex
  return el
}
const h = (tag, cls, text) => {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (typeof text === 'string' && RICH.test(text)) el.append(...richNodes(text))
  else if (text != null) el.textContent = text
  return el
}
// Text with math in it never shows raw carets: \( … \) is typeset inline, and
// e^(tx), p^x, q^(x−1) are raised (m_X lowered), each power kept with its base
// so an all-caps label leaves both alone.
const RICH = /\\\(|\^|[A-Za-z]_[A-Za-z](?![A-Za-z0-9])/
function richNodes(text) {
  const out = []
  text.split(/\\\(([\s\S]*?)\\\)/).forEach((part, i) => {
    if (i % 2) return out.push(tex(part, false))
    let buf = ''
    const flush = () => {
      if (buf) out.push(document.createTextNode(buf))
      buf = ''
    }
    const raise = (tag, inner) => {
      const base = buf.slice(-1)
      buf = buf.slice(0, -1)
      flush()
      const sp = document.createElement('span')
      sp.className = 'mx'
      const s = document.createElement(tag)
      s.append(...richNodes(inner))
      sp.append(base, s)
      out.push(sp)
    }
    for (let at = 0; at < part.length; ) {
      const c = part[at]
      if (c === '^' && buf) {
        if (part[at + 1] === '(') {
          let d = 0, j = at + 1
          for (; j < part.length; j++) if (part[j] === '(') d++
          else if (part[j] === ')' && --d === 0) break
          if (j < part.length) {
            raise('sup', part.slice(at + 2, j))
            at = j + 1
            continue
          }
        } else {
          const m = /^(?:\d+|[A-Za-zα-ωΑ-Ω])/.exec(part.slice(at + 1))
          if (m) {
            raise('sup', m[0])
            at += 1 + m[0].length
            continue
          }
        }
      }
      if (c === '_' && /[A-Za-z]$/.test(buf) && /^[A-Za-z](?![A-Za-z0-9])/.test(part.slice(at + 1))) {
        raise('sub', part[at + 1])
        at += 2
        continue
      }
      buf += c
      at++
    }
    flush()
  })
  return out
}
