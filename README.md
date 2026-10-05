# Math Arcade

A study game for Math 3800 Test 2 (discrete and continuous distributions, §3.4–4.4),
made for a Galaxy Tab with an S Pen. It covers what the possible quiz questions and the
study guide ask for, section by section like the class notes. Every answer is picked from
a list, then the work plays out: the numbers go into the formula, each piece is worked, then
the table and the graph.

## Run it

- Online: https://nicholasburgo.github.io/MathArcade/
- On this computer or the home network:

      python3 serve.py          # http://localhost:8380, or http://<this computer's IP>:8380 on a tablet
      python3 serve.py 9000     # another port

  `serve.py` tells browsers not to keep stale copies, so a refresh always gets the latest
  files.

Progress is saved in each browser, so the online copy and the local one keep separate progress.

## What's in it

### The arcade (the home screen)

- **Next up** — the first level without two stars. The bell counts the stars you've earned;
  tap it for your weak spots.
- **Fundamentals** — every chapter:
  - *Which distribution?* — name the distribution for a test-style story with a trap, from
    a list with their formulas. A right answer plugs the story's numbers into the formula,
    works every piece out (C(n, x), x!, Γ(α), the table lookup), boxes the answer and draws
    the distribution. The card's decision tree plays each path with the reason.
  - *Read off the numbers* — n, p, r, N or k (k = λs), or the values X can take, lit up in
    the story and landed on their letters.
  - *Build the MGF* — where every MGF on the test comes from, line by line, with the move
    each line makes and why.
- **3.4 → 4.4** — one block per section of the notes, each with its own levels: the pdfs,
  cdfs and MGFs to derive, the probabilities, means and variances to find, the tables, the
  calculus.
- **Mixed** — a Chapter 3 review, a Chapter 4 review and Everything.
- **Arcade challenge** — one written question per level, timed, graded after you hand it in.

On every question: **Hint** (how to start, never the answer), **How do I do this?** (one of
the same kind with new numbers, answered and played), **Learn mode** (try it or tap Show me;
nothing counts) and **Paper mode** (no list, type the answer, as on the real test).

### Quiz questions (the card at the bottom)

The 16 possible quiz questions by section, cut to the parts the quiz lists. Each one is a
level of its own (outside the arcade's sections, reviews and challenge), with a card like
the arcade's: the quiz's story and the parts it asks, videos, **Start**, **Quick round**,
**Learn mode** and **Paper mode**.

- A round asks the parts in the quiz's order (one question per number of a part with
  several), each with a new story and new numbers. The uniform cdf is also asked in the
  quiz's own letters.
- Every part is a long dropdown: twelve numbers, or up to ten choices (the part's real
  slips and its options with other numbers). A part to write out is asked on its key line.
- After every answer, right or wrong, the part's steps play like the arcade's work: the
  first move, the story's numbers flying into each row, the reason under each step, the
  table and the graph, the answer boxed. A wrong pick says which slip it was, when known.
- **The quiz's own numbers** runs every part once as the quiz writes it (no stars); **Old
  view** is the earlier page with every part at once.

A part counts toward readiness half for the quiz's own numbers and half for new numbers.
The quiz screen also has **New numbers** per section and a timed **practice quiz** (one
question per section, a short one, or one section).

### Tools

- **Tables** — the printed tables in a pop-up like the calculator: the question stays there
  to write on and answer. Binomial n = 10, 15, 19 and 20, the normal and the chi-squared
  table. It opens on the table for the level or question you are in; tap a cell to light its
  row and column, drag it by its title bar. A step's **Open the whole table** opens it on
  that cell.
- **Calc** — a pop-up calculator from the header: + − × ÷, powers, x!, C(n, k), √, ln, eˣ,
  π, e and Ans, with 2(3) read as times. Drag it by its title bar out of the way; it stays
  there, and it floats over the tables so you can look up and work at once.
- **Formulas** — what the formula sheet gives, what it might give, and what is never on it.
- **Weak spots** — every skill on the study guide, weakest first, with the levels that drill it.
- **S Pen ink** — write anywhere with the pen; fingers still scroll. Hold the side button
  to erase; let go to write again. Samsung Internet reports the held button directly;
  Chrome only sends a right click as it goes down, so there the stroke it lands in erases.
  If the button opens Air Command instead, turn Air Command off in the S Pen settings.
  Open the page with `#pen` to see what the pen reports.

## Files

- `index.html` — the page: its markup, then the styles and scripts below, in order.
- `js/` — the game, one file per area (`02-sections-and-levels.js`, `14-question.js`,
  `24-plug-panel.js`, …; the quiz questions' levels are `37b-quiz-levels.js`). They load
  in order as plain scripts and share one global scope: a name defined at the top level
  of one file is visible in the others, so the order in `index.html` matters.
- `css/` — the styles, one file per area.
- `homework/` — the quiz questions: `core.js` (skills, tables, helpers), the problem files
  (`g1-…js` to `g7-…js`, each problem worked step by step with a twin that has new numbers),
  `quiz.js` (which problems and parts the quiz lists, and the sections), `AUTHORING.md` (how
  a problem is written) and `tools/check.js` (checks every problem and its twins).
- `extraction/` — the class notes, the study guide, what to learn, the quiz questions and
  the homework, as Markdown.
- `engine.js` — a bundle of the MathReps Test 2 question generators (from the
  Math-380-test repo at commit 1fcb54b, reworded to ask like the test): `window.Test2`.
- `serve.py` — the local server.
