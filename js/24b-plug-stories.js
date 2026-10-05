// js/24b-plug-stories.js · the section levels' stories (3.4–3.8, and 4.1's uniform): their numbers, and the words for what they ask
// Loaded in order by index.html as a classic script: top-level names are shared with the other js/ files.
// ---------- the section levels' stories: their numbers, and the words for what they ask ----------
// Each story is like the tree's (js/18-tree.js): its text, the phrase that names the
// distribution (clue), and its numbers (vars: value, the words they come from, a note,
// and a line of work for a number the story only implies). Then the words for a
// question about X: say(qx, one) puts a quantifier like "at most 4" into a sentence (one:
// the count is 1, for "is" and "comes"), avg asks for the mean in the story's words,
// on(x) words P[X = x] its own way ([the sentence, the phrase holding x]), and math
// stories ("X is Poisson with k = 10") are asked in symbols only.
// Binomial stories can also ask about the other side (other: "at least 8 survive").
// 1st, 2nd, 3rd, 4th, …, 11th, 12th, 13th, 21st
const plOrd = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
// a percentage turned into p, worked: p = 20% = 20/100 = 0.2
const plPct = (pct, from, note) => worked(V(pct / 100, from, note), { order: [], tex: S => `${S('p')} = ${pct}\\% = \\frac{${pct}}{100}`, steps: () => [`= ${fmt(pct / 100)}`] })
// a success that is the opposite of what the story counts: p = 1 − 0.9
const plFlip = (keep, what, from) => worked(V(+(1 - keep).toFixed(6), from, `a ${what} is the “success”`), { order: [], tex: S => `${S('p')} = P[\\text{${what}}] = 1 - ${fmt(keep)}`, steps: () => [`= ${fmt(1 - keep)}`] })
// k = λs, worked from a rate and a window (s may need its units changed first)
const plK = (lam, s, steps) => worked(V(+(lam * s).toFixed(6), null, 'k = λs, from the line above'), { order: ['lam', 's'], tex: S => `${S('k')} = ${S('lam')}${S('s', 2)}`, steps: () => steps })
const PL_STORIES = {
  geometric: [
    // quiz 3.4 #24
    () => ({ text: 'The probability that a wildcat well is productive is 1/13. The wells are drilled in different parts of the country, so each one is independent of the others. X is the number of wells drilled to get the first strike.', clue: 'to get the first strike',
      vars: { p: { ...frac(1, 13), from: 'is 1/13', note: 'a productive well is the success' }, q: q1(1 / 13, '\\tfrac{12}{13}') },
      say: (qx, one) => `it takes ${qx} ${one ? 'well' : 'wells'} to get the first strike`, avg: 'On average, how many wells are drilled to get the first strike?' }),
    () => { const p = pickOne(['0.1', '0.2', '0.25', '0.3']); return { text: `A salesperson calls customers one at a time, and each call ends in a sale with probability ${p}, independently. X is the number of calls she makes to get the first sale.`, clue: 'to get the first sale',
      vars: { p: V(+p, `probability ${p}`), q: q1(+p) },
      say: (qx, one) => `it takes ${qx} ${one ? 'call' : 'calls'} to get the first sale`, avg: 'On average, how many calls does she make to get the first sale?' } },
    () => ({ text: 'You roll a fair die until the first six shows up. X is the number of rolls.', clue: 'until the first six',
      vars: { p: { ...frac(1, 6), from: 'a fair die', note: '1 face out of 6' }, q: q1(1 / 6, '\\tfrac{5}{6}') },
      say: (qx, one) => `it takes ${qx} ${one ? 'roll' : 'rolls'} to get the first six`, avg: 'On average, how many rolls does it take to get the first six?' }),
    () => { const p = pickOne(['0.05', '0.1', '0.2']); return { text: `Each chip off a production line is defective with probability ${p}, independently. An inspector tests chips one at a time until she finds a defective one. X is the number of chips she tests.`, clue: 'until she finds a defective one',
      vars: { p: V(+p, `probability ${p}`), q: q1(+p) },
      say: (qx, one) => `she tests ${qx} ${one ? 'chip' : 'chips'}`, avg: 'On average, how many chips does she test?' } },
    () => { const make = pickOne([70, 75, 80, 90]), miss = (100 - make) / 100; return { text: `A basketball player makes ${make}% of her free throws, independently. She keeps shooting until she misses one. X is the number of shots she takes.`, clue: 'until she misses one',
      trap: `The success here is a miss, so p = 1 − ${fmt(make / 100)} = ${fmt(miss)}, not ${fmt(make / 100)}.`,
      vars: { p: plFlip(make / 100, 'miss', `${make}%`), q: q1(miss) },
      say: (qx, one) => `she takes ${qx} ${one ? 'shot' : 'shots'}`, avg: 'On average, how many shots does she take?' } },
    // the class's example: digits until the first 0
    () => ({ text: 'Digits from 0 to 9 are chosen at random, one at a time. X is the number of digits chosen until the first 0.', clue: 'until the first 0',
      vars: { p: pOver(1, 10, 'from 0 to 9', '1 digit out of 10'), q: q1(0.1) },
      say: (qx, one) => `it takes ${qx} ${one ? 'digit' : 'digits'} to get the first 0`, avg: 'On average, how many digits are chosen to get the first 0?' }),
    () => ({ text: 'You roll a pair of fair dice over and over until you roll doubles (both dice show the same number). X is the number of rolls.', clue: 'until you roll doubles',
      vars: { p: worked({ ...frac(1, 6), from: 'doubles', note: '6 of the 36 outcomes' }, { order: [], tex: S => `${S('p')} = \\frac{6}{36}`, steps: () => ['= \\frac{1}{6}'] }), q: q1(1 / 6, '\\tfrac{5}{6}') },
      say: (qx, one) => `it takes ${qx} ${one ? 'roll' : 'rolls'} to roll doubles`, avg: 'On average, how many rolls does it take to roll doubles?' }),
    () => { const pct = pickOne([10, 20, 25, 40]); return { text: `Each new user who signs up was referred by a friend with probability ${pct}%, independently. X is the number of sign-ups up to and including the first referred one.`, clue: 'up to and including the first referred one',
      vars: { p: plPct(pct, `${pct}%`), q: q1(pct / 100) },
      say: (qx, one) => `it takes ${qx} ${one ? 'sign-up' : 'sign-ups'} to get the first referred user`, avg: 'On average, how many sign-ups does it take to get the first referred user?' } },
  ],
  binomial: [
    // quiz 3.5 #37: X counts the deaths; the question can count the survivors
    () => ({ text: 'Rats in a study are given a drug that blocks protein synthesis. Each rat dies from the drug before the experiment ends with probability 0.2, independently. The drug is given to 10 rats. X is the number of rats that die.', clue: 'given to 10 rats',
      vars: { n: V(10, 'given to 10 rats'), p: V(0.2, 'probability 0.2'), q: q1(0.2) },
      say: (qx, one) => `${qx} of the 10 rats ${one ? 'dies' : 'die'}`, other: (qx, one) => `${qx} of the 10 rats ${one ? 'survives' : 'survive'}`, otherIs: 'survive',
      avg: 'How many of the 10 rats are expected to die?' }),
    // quiz 3.5 #42: n = 20, so the table
    () => ({ text: 'A defective terminal makes a silent paging error with probability 0.1 each time the word processor is used, independently. The word processor is used 20 times this week. X is the number of uses with a silent paging error.', clue: 'used 20 times',
      vars: { n: V(20, 'used 20 times'), p: V(0.1, 'probability 0.1'), q: q1(0.1) },
      say: (qx, one) => `${qx} silent paging ${one ? 'error occurs' : 'errors occur'}`, zero: 'no silent paging errors occur',
      avg: 'How many silent paging errors are expected this week?' }),
    () => { const n = pickOne([8, 10, 12, 20]), c = pickOne([4, 5]); return { text: `A quiz has ${n} multiple-choice questions with ${c} choices each, and you guess on every one. X is the number you get right.`, clue: `you guess on every one`,
      vars: { n: V(n, `${n} multiple-choice questions`), p: pOver(1, c, `${c} choices each`, `1 right out of ${c}`), q: q1(1 / c) },
      say: qx => `you get ${qx} right`, other: qx => `you get ${qx} wrong`, otherIs: 'wrong', avg: `How many of the ${n} do you expect to get right?` } },
    () => { const n = pickOne([8, 10, 12, 20]), p = pickOne(['0.6', '0.7', '0.75', '0.8']); return { text: `A basketball player makes each free throw with probability ${p}, independently. She takes ${n} free throws. X is the number she makes.`, clue: `She takes ${n} free throws`,
      vars: { n: V(n, `takes ${n} free throws`), p: V(+p, `probability ${p}`), q: q1(+p) },
      say: qx => `she makes ${qx} of them`, other: qx => `she misses ${qx} of them`, otherIs: 'missed', avg: `How many of the ${n} free throws does she expect to make?` } },
    // the class's example: signals, p = 0.9
    () => ({ text: 'A receiver identifies each incoming signal correctly with probability 0.9, independently. X is the number of the next 10 signals it identifies correctly.', clue: 'the next 10 signals',
      vars: { n: V(10, 'the next 10 signals'), p: V(0.9, 'probability 0.9'), q: q1(0.9) },
      say: qx => `it identifies ${qx} of the 10 signals correctly`, other: qx => `it gets ${qx} of the 10 signals wrong`, otherIs: 'wrong', avg: 'How many of the 10 signals are expected to be identified correctly?' }),
    () => { const pct = pickOne([10, 20, 25, 30]), n = pickOne([10, 12, 20]); return { text: `On average, ${pct}% of an airline's flights arrive late, and flights are late independently of each other. X is the number of the next ${n} flights that arrive late.`, clue: `the next ${n} flights`,
      trap: '“On average” sounds like Poisson, but there is a fixed number of flights, each late with the same chance: binomial.',
      vars: { n: V(n, `the next ${n} flights`), p: plPct(pct, `${pct}%`), q: q1(pct / 100) },
      say: (qx, one) => `${qx} of the next ${n} flights ${one ? 'arrives' : 'arrive'} late`, other: (qx, one) => `${qx} of the next ${n} flights ${one ? 'arrives' : 'arrive'} on time`, otherIs: 'on time',
      avg: `How many of the next ${n} flights are expected to arrive late?` } },
    () => { const pct = pickOne([30, 40]); return { text: `In a city, ${pct}% of the voters support a new park. A poll asks 20 voters chosen at random. X is the number of them who support it.`, clue: 'asks 20 voters',
      vars: { n: V(20, 'asks 20 voters'), p: plPct(pct, `${pct}%`), q: q1(pct / 100) },
      say: (qx, one) => `${qx} of the 20 voters ${one ? 'supports' : 'support'} the park`, avg: 'How many of the 20 voters are expected to support the park?' } },
    () => { const n = pickOne([10, 12, 15, 20]), p = pickOne(['0.8', '0.9']); return { text: `Each seed in a packet germinates with probability ${p}, independently. You plant ${n} seeds. X is the number that germinate.`, clue: `You plant ${n} seeds`,
      vars: { n: V(n, `plant ${n} seeds`), p: V(+p, `probability ${p}`), q: q1(+p) },
      say: (qx, one) => `${qx} of the ${n} seeds ${one ? 'germinates' : 'germinate'}`, other: (qx, one) => `${qx} of the ${n} seeds ${one ? 'fails' : 'fail'} to germinate`, otherIs: 'fail',
      avg: `How many of the ${n} seeds are expected to germinate?` } },
  ],
  negbin: [
    // quiz 3.6 #48: X waits for balls, not strikes
    () => { const strike = pickOne([90, 90, 80]), ball = (100 - strike) / 100; return { text: `A pitching machine throws a strike ${strike}% of the time, independently. It walks a batter by throwing 4 balls (pitches outside the strike zone). X is the number of pitches it throws to walk a batter.`, clue: 'to walk a batter',
      trap: `X waits for balls, not strikes: a ball is the “success”, so p = 1 − ${fmt(strike / 100)} = ${fmt(ball)}, not ${fmt(strike / 100)}.`,
      vars: { r: V(4, 'throwing 4 balls', 'the 4th ball walks the batter'), p: plFlip(strike / 100, 'ball', `${strike}%`), q: q1(ball) },
      say: (qx, one) => `it takes ${qx} ${one ? 'pitch' : 'pitches'} to walk a batter`, on: x => [`the 4th ball is thrown on the ${plOrd(x)} pitch`, `the ${plOrd(x)} pitch`],
      avg: 'What is the average number of pitches it throws to walk a batter?' } },
    // the class's example: lots until the 3rd defective one
    () => ({ text: '10% of the lots a factory makes are defective, independently. Lots are made until the 3rd defective lot. X is the number of lots made.', clue: 'until the 3rd defective lot',
      vars: { r: V(3, '3rd defective lot'), p: plPct(10, '10%'), q: q1(0.1) },
      say: (qx, one) => `${qx} ${one ? 'lot is' : 'lots are'} made`, on: x => [`the 3rd defective lot is lot number ${x}`, `lot number ${x}`], avg: 'On average, how many lots are made?' }),
    () => { const r = pickOne([2, 3]), p = pickOne(['0.2', '0.3', '0.4']); return { text: `Each well an oil company drills strikes oil with probability ${p}, independently. X is the number of wells drilled to get the ${plOrd(r)} strike.`, clue: `to get the ${plOrd(r)} strike`,
      vars: { r: V(r, `${plOrd(r)} strike`), p: V(+p, `probability ${p}`), q: q1(+p) },
      say: (qx, one) => `it takes ${qx} ${one ? 'well' : 'wells'} to get the ${plOrd(r)} strike`, on: x => [`the ${plOrd(r)} strike comes on the ${plOrd(x)} well`, `the ${plOrd(x)} well`],
      avg: `On average, how many wells are drilled to get the ${plOrd(r)} strike?` } },
    () => { const r = pickOne([2, 3, 4]), p = pickOne(['0.6', '0.7', '0.8']); return { text: `A player makes each free throw with probability ${p}, independently. She shoots until she has made ${r} of them. X is the number of shots she takes.`, clue: `until she has made ${r} of them`,
      vars: { r: V(r, `made ${r} of them`), p: V(+p, `probability ${p}`), q: q1(+p) },
      say: (qx, one) => `she takes ${qx} ${one ? 'shot' : 'shots'}`, on: x => [`her ${plOrd(r)} basket comes on the ${plOrd(x)} shot`, `the ${plOrd(x)} shot`], avg: 'On average, how many shots does she take?' } },
    () => { const r = pickOne([2, 3]), pct = pickOne([20, 25, 30]); return { text: `A telemarketer makes a sale on ${pct}% of her calls, independently. Her shift ends as soon as she makes her ${plOrd(r)} sale. X is the number of calls she makes in the shift.`, clue: `as soon as she makes her ${plOrd(r)} sale`,
      trap: `“As soon as she makes her ${plOrd(r)} sale” is a stopping rule: the number of calls is not fixed, so not binomial. X counts tries until the ${plOrd(r)} success: negative binomial.`,
      vars: { r: V(r, `her ${plOrd(r)} sale`), p: plPct(pct, `${pct}%`), q: q1(pct / 100) },
      say: (qx, one) => `she makes ${qx} ${one ? 'call' : 'calls'} in the shift`, avg: 'On average, how many calls does she make in a shift?' } },
    () => { const r = pickOne([2, 3]), p = pickOne(['0.3', '0.4']); return { text: `Each fish a biologist catches is tagged with probability ${p}, independently. She keeps fishing until she has caught ${r} tagged fish. X is the number of fish she catches.`, clue: `until she has caught ${r} tagged fish`,
      vars: { r: V(r, `caught ${r} tagged fish`), p: V(+p, `probability ${p}`), q: q1(+p) },
      say: qx => `she catches ${qx} fish`, avg: 'On average, how many fish does she catch?' } },
    () => { const r = pickOne([2, 3]); return { text: `Each loot box in a video game holds a rare item with probability 0.25, independently. X is the number of boxes a player opens to collect ${r} rare items.`, clue: `to collect ${r} rare items`,
      vars: { r: V(r, `collect ${r} rare items`), p: V(0.25, 'probability 0.25'), q: q1(0.25) },
      say: (qx, one) => `the player opens ${qx} ${one ? 'box' : 'boxes'}`, avg: `On average, how many boxes does a player open to collect ${r} rare items?` } },
    () => { const r = pickOne([2, 3]); return { text: `Each job applicant is qualified with probability 0.35, independently. X is the number of applicants interviewed to find the ${plOrd(r)} qualified one.`, clue: `to find the ${plOrd(r)} qualified one`,
      vars: { r: V(r, `the ${plOrd(r)} qualified one`), p: V(0.35, 'probability 0.35'), q: q1(0.35) },
      say: (qx, one) => `it takes ${qx} ${one ? 'interview' : 'interviews'} to find the ${plOrd(r)} qualified applicant`, avg: `On average, how many applicants are interviewed to find the ${plOrd(r)} qualified one?` } },
  ],
  hyper: [
    // quiz 3.7 #54–56
    () => { const r = pickOne([17, 3, 10]); return { text: `X is hypergeometric with N = 20, r = ${r} and n = 5.`, math: true,
      vars: { N: V(20, 'N = 20'), r: V(r, `r = ${r}`), n: V(5, 'n = 5') } } },
    // the class's example: N = 15, r = 6, n = 12, so X runs from 3 to 6
    () => ({ text: 'X is hypergeometric with N = 15, r = 6 and n = 12.', math: true,
      vars: { N: V(15, 'N = 15'), r: V(6, 'r = 6'), n: V(12, 'n = 12') } }),
    () => { const N = ri(15, 30), r = ri(3, 8), n = ri(3, 6); return { text: `A shipment of ${N} parts has ${r} defective ones. An inspector picks ${n} of the parts at random, without replacement. X is the number of defective parts picked.`, clue: 'without replacement',
      vars: { N: V(N, `shipment of ${N} parts`), r: V(r, `has ${r} defective`), n: V(n, `picks ${n} of the parts`) },
      say: (qx, one) => `${qx} of the ${n} parts picked ${one ? 'is' : 'are'} defective`, avg: 'How many defective parts is the inspector expected to pick?' } },
    () => { const n = ri(3, 6), W = ri(5, 10), M = ri(5, 10); return { text: `A committee of ${n} is chosen at random from a club of ${W} women and ${M} men. X is the number of women on it.`, clue: `A committee of ${n} is chosen`,
      vars: { N: worked(V(W + M, `${W} women and ${M} men`, `${W} + ${M} people`), { order: [], tex: S => `${S('N')} = ${W} + ${M}`, steps: () => [`= ${W + M}`] }), r: V(W, `${W} women`, 'the women are the “successes”'), n: V(n, `committee of ${n}`) },
      say: (qx, one) => `${qx} of the committee ${one ? 'is a woman' : 'are women'}`, avg: 'How many women are expected on the committee?' } },
    () => { const n = pickOne([5, 5, 7]); return { text: `You are dealt a ${n}-card hand from a standard 52-card deck. X is the number of hearts in the hand.`, clue: `dealt a ${n}-card hand`,
      vars: { N: V(52, '52-card deck'), r: V(13, 'hearts', '13 hearts in a deck'), n: V(n, `${n}-card hand`) },
      say: (qx, one) => `the hand has ${qx} ${one ? 'heart' : 'hearts'}`, avg: 'How many hearts are expected in the hand?' } },
    () => { const N = ri(12, 20), r = ri(2, 4); return { text: `A box of ${N} light bulbs has ${r} that are burned out. You grab 4 bulbs from the box at once. X is the number of burned-out bulbs you grab.`, clue: 'at once',
      trap: '“At once” means no bulb can be grabbed twice: without replacement from a small box, so hypergeometric.',
      vars: { N: V(N, `box of ${N} light bulbs`), r: V(r, `has ${r} that are burned out`), n: V(4, 'grab 4 bulbs') },
      say: (qx, one) => `you grab ${qx} burned-out ${one ? 'bulb' : 'bulbs'}`, avg: 'How many burned-out bulbs do you expect to grab?' } },
    () => { const N = ri(20, 30), r = ri(8, 14); return { text: `A 6-person jury is chosen at random from a pool of ${N} people, ${r} of whom are women. X is the number of women on the jury.`, clue: 'chosen at random from a pool',
      vars: { N: V(N, `pool of ${N} people`), r: V(r, `${r} of whom are women`), n: V(6, '6-person jury') },
      say: (qx, one) => `${qx} of the jurors ${one ? 'is a woman' : 'are women'}`, avg: 'How many women are expected on the jury?' } },
    () => { const [N, r, n] = pickOne([[15, 6, 12], [10, 6, 7], [12, 8, 7], [9, 5, 6]]); return { text: `A class of ${N} students has ${r} seniors. For a survey, ${n} students are chosen at random, without replacement. X is the number of seniors chosen.`, clue: 'without replacement',
      vars: { N: V(N, `class of ${N} students`), r: V(r, `has ${r} seniors`), n: V(n, `${n} students are chosen`) },
      say: (qx, one) => `${qx} of the students chosen ${one ? 'is a senior' : 'are seniors'}`, avg: 'How many seniors are expected among the students chosen?' } },
  ],
  poisson: [
    // quiz 3.8 #61
    () => { const k = pickOne([10, 10, 2, 3, 4, 5, 6]); return { text: `X is a Poisson random variable with parameter k = ${k}.`, math: true, vars: { k: V(k, `k = ${k}`) } } },
    () => {
      let l, m
      do { l = ri(3, 12); m = pickOne([10, 15, 20, 30]) } while (!Number.isInteger((l * m) / 60))
      const k = (l * m) / 60
      return { text: `A help desk gets an average of ${l} calls per hour. X is the number of calls in the next ${m} minutes.`, clue: `an average of ${l} calls per hour`,
        vars: { lam: V(l, `${l} calls per hour`), s: worked({ ...frac(m, 60), from: `next ${m} minutes`, note: `${m} min = ${m}/60 hour` }, { order: [], tex: S => `${S('s')} = ${m}\\text{ min} = \\frac{${m}}{60}\\text{ hour}` }), k: plK(l, m / 60, [`= \\frac{${l * m}}{60}`, `= ${fmt(k)}`]) },
        // the slip: minutes used as if they were hours
        raw: m, say: (qx, one) => `${qx} ${one ? 'call comes' : 'calls come'} in during the next ${m} minutes`, avg: `How many calls are expected in the next ${m} minutes?` }
    },
    () => { const l = pickOne(['0.2', '0.5', '1.5']), s = ri(4, Math.min(12, Math.floor(8 / l))), k = +(l * s).toFixed(2); return { text: `A textbook averages ${l} typos per page. X is the number of typos in ${an(s)} ${s}-page chapter.`, clue: `averages ${l} typos per page`,
      vars: { lam: V(+l, `${l} typos per page`), s: V(s, `${s}-page chapter`, 'pages'), k: plK(+l, s, [`= ${fmt(k)}`]) },
      say: (qx, one) => `the chapter has ${qx} ${one ? 'typo' : 'typos'}`, avg: 'How many typos are expected in the chapter?' } },
    () => { const l = ri(2, 4), s = ri(2, Math.floor(8 / l)); return { text: `A road has an average of ${l} potholes per mile. X is the number of potholes in a ${s}-mile stretch.`, clue: `an average of ${l} potholes per mile`,
      vars: { lam: V(l, `${l} potholes per mile`), s: V(s, `${s}-mile stretch`, 'miles'), k: plK(l, s, [`= ${l * s}`]) },
      say: (qx, one) => `the stretch has ${qx} ${one ? 'pothole' : 'potholes'}`, avg: `How many potholes are expected in the ${s}-mile stretch?` } },
    // the class's example: white blood cells in a drop
    () => { const [l, s] = pickOne([[6000, 0.001], [4000, 0.0005], [5000, 0.0008]]), k = +(l * s).toFixed(6); return { text: `The average white blood cell count is ${l} per cubic millimeter of blood. A drop of ${s} cubic millimeter is taken. X is the number of white blood cells in the drop.`, clue: `${l} per cubic millimeter`,
      vars: { lam: V(l, `${l} per cubic millimeter`), s: V(s, `${s} cubic millimeter`, 'cubic millimeters'), k: plK(l, s, [`= ${fmt(k)}`]) },
      say: (qx, one) => `the drop holds ${qx} white blood ${one ? 'cell' : 'cells'}`, avg: 'How many white blood cells are expected in the drop?' } },
    // the class's example: releases per year, counted over months
    () => { const m = pickOne([3, 6]), k = (8 * m) / 12; return { text: `Radioactive gas is released at a power plant an average of 8 times per year. X is the number of releases in the next ${m} months.`, clue: 'an average of 8 times per year',
      vars: { lam: V(8, '8 times per year'), s: worked({ ...frac(m, 12), from: `next ${m} months`, note: `${m} months = ${m}/12 year` }, { order: [], tex: S => `${S('s')} = ${m}\\text{ months} = \\frac{${m}}{12}\\text{ year}` }), k: plK(8, m / 12, [`= \\frac{${8 * m}}{12}`, `= ${fmt(k)}`]) },
      raw: m, say: (qx, one) => `${qx} ${one ? 'release happens' : 'releases happen'} in the next ${m} months`, avg: `How many releases are expected in the next ${m} months?` } },
    () => { const [l, m] = pickOne([[2.5, 800], [2, 500], [5, 400], [2.5, 400], [5, 600]]), k = +((l * m) / 1000).toFixed(6); return { text: `A copper wire has an average of ${l} flaws per km. X is the number of flaws in a ${m} m piece of the wire.`, clue: `${l} flaws per km`,
      vars: { lam: V(l, `${l} flaws per km`), s: worked({ ...frac(m, 1000), from: `${m} m piece`, note: `${m} m = ${m}/1000 km` }, { order: [], tex: S => `${S('s')} = ${m}\\text{ m} = \\frac{${m}}{1000}\\text{ km}` }), k: plK(l, m / 1000, [`= \\frac{${fmt(l * m)}}{1000}`, `= ${fmt(k)}`]) },
      raw: m, say: (qx, one) => `the piece has ${qx} ${one ? 'flaw' : 'flaws'}`, avg: `How many flaws are expected in the ${m} m piece?` } },
    () => { const l = pickOne([1, 1.5, 2]), m = pickOne([2, 3, 4]), k = l * m; return { text: `Accidents at a busy intersection happen at random, about ${l} per month, even though thousands of cars pass through. X is the number of accidents in the next ${m} months.`, clue: `about ${l} per month`,
      trap: '“Thousands of cars” tempts binomial, but no one knows the number of cars or a chance per car, only a rate: Poisson.',
      vars: { lam: V(l, `about ${l} per month`), s: V(m, `next ${m} months`, 'months'), k: plK(l, m, [`= ${fmt(k)}`]) },
      say: (qx, one) => `${qx} ${one ? 'accident happens' : 'accidents happen'} in the next ${m} months`, avg: `How many accidents are expected in the next ${m} months?` } },
  ],
  // 4.1: X anywhere from A to B, every value equally likely (say puts "at most 7" or
  // "between 3 and 8" into the story's words)
  uniform: [
    () => { const b = pickOne([10, 15, 20, 30]); return { text: `A bus is equally likely to arrive at any moment in the next ${b} minutes. X is how many minutes from now it arrives.`, clue: 'equally likely to arrive at any moment',
      vars: { A: V(0, null, 'it can come right now: 0'), B: V(b, `next ${b} minutes`) }, say: qx => `the bus arrives ${qx} minutes from now` } },
    () => { const a = ri(1, 5), b = a + pickOne([4, 5, 8, 10]); return { text: `A program picks a real number X anywhere from ${a} to ${b}, with every value equally likely.`, clue: 'every value equally likely',
      vars: { A: V(a, `from ${a}`), B: V(b, `to ${b}`) }, say: qx => `X is ${qx}` } },
    () => { const b = pickOne([20, 40, 50, 100]); return { text: `A ${b} cm rod is cut at a point chosen uniformly along its length. X is the distance, in cm, from the left end to the cut.`, clue: 'chosen uniformly',
      vars: { A: V(0, null, 'the left end: 0'), B: V(b, `${b} cm rod`) }, say: qx => `the cut is ${qx} cm from the left end` } },
    () => { const b = pickOne([10, 12, 15, 20]); return { text: `Trains leave a station every ${b} minutes, exactly on schedule. You walk onto the platform at a random moment. X is how many minutes you wait for the next train.`, clue: 'exactly on schedule',
      trap: `A wait sounds exponential, but the trains run on a fixed schedule, so every wait from 0 to ${b} minutes is equally likely: uniform.`,
      vars: { A: V(0, null, 'a train could be leaving right now: 0'), B: V(b, `every ${b} minutes`) }, say: qx => `you wait ${qx} minutes` } },
    () => { const [a, b] = pickOne([[1, 5], [2, 6], [1, 4], [3, 5], [2, 7]]); return { text: `A package is promised “sometime between ${a} pm and ${b} pm,” and every moment in that window is equally likely. X is the delivery time, in hours after noon.`, clue: 'every moment in that window is equally likely',
      vars: { A: V(a, `between ${a} pm`), B: V(b, `and ${b} pm`) }, say: qx => `it is delivered ${qx} hours after noon` } },
    () => ({ text: 'A fair spinner is marked in degrees from 0 to 360. X is the angle where it stops.', clue: 'A fair spinner',
      vars: { A: V(0, 'from 0'), B: V(360, 'to 360') }, say: qx => `it stops at an angle of ${qx} degrees` }),
    () => { const b = pickOne([5, 8, 10, 12]); return { text: `An elevator arrives at a time equally likely to be anywhere from 0 to ${b} seconds after you press the button. X is that time, in seconds.`, clue: 'equally likely to be anywhere',
      vars: { A: V(0, 'from 0'), B: V(b, `to ${b} seconds`) }, say: qx => `the elevator arrives ${qx} seconds after you press the button` } },
  ],
}
