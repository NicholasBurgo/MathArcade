# What to Learn for Test 2

This is worked out from [study-guide.md](study-guide.md). It covers Chapter 3 §3.4–3.8 and Chapter 4 §4.1–4.4. Homework references like "3.4 #24(b)" point to the files in [../homework-extraction](../homework-extraction).

Throughout, $q = 1 - p$.

## 1. Skill checklist

Each "Be able to" item from the study guide, with the section it comes from and the assigned homework that practices it.

| # | Skill | Section | Homework practice |
|---|---|---|---|
| 1 | Derive the pdf for geometric, binomial, negative binomial, hypergeometric | 3.4–3.7 | 3.4 #24(b), 25(b); 3.5 #36(a); 3.7 #59(a), 60(a) |
| 2 | Show a given function is a pdf (discrete or continuous) | 3.4, 4.1, 4.2 | 3.4 #31(a); 4.1 #4(a); 4.2 #23(a), 24(a) |
| 3 | Derive the cdf for a geometric experiment | 3.4 | 3.4 #27 |
| 4 | Derive the MGF for a geometric distribution | 3.4 | 3.4 #24(c), 25(c) |
| 5 | Find the mean or variance from an MGF | 3.4–4.3 | 3.4 #31(d, f); 3.5 #36(d), 43(b, c); 4.2 #17(b, c); 4.3 #29(c) |
| 6 | Find probabilities with the binomial, negative binomial, hypergeometric or Poisson pdf | 3.5–3.8 | 3.5 #37, 42(a, b), 44(a); 3.6 #47, 48; 3.7 #59(c), 60(c); 3.8 #61(e–i), 63, 66 |
| 7 | Use the binomial table | 3.5, 3.7 | 3.5 #37, 44(a); 3.7 #59(d), 60(d) |
| 8 | Label a scenario as binomial, negative binomial, hypergeometric or Poisson | 3.4–3.8 | 3.4 #24(a), 25(a); 3.5 #37, 42, 44; 3.6 #47, 48; 3.7 #59, 60; 3.8 #63, 66 |
| 9 | Find the coefficient that makes a function a continuous pdf | 4.1 | 4.1 #1(a) |
| 10 | Find probabilities from a continuous pdf | 4.1, 4.2 | 4.1 #1(b–d), 4(b); 4.2 #24(c) |
| 11 | Derive the cdf for a continuous distribution | 4.1, 4.2 | 4.1 #10, 13; 4.2 #23(b), 24(b) |
| 12 | Find the pdf from a cdf | 4.1 | 4.1 #14 |
| 13 | Derive the pdf for a uniform distribution | 4.1 | None directly (4.1 #10 uses it) |
| 14 | Find the mean or variance of a continuous random variable | 4.2 | 4.2 #15, 16, 23(c, d), 24(d) |
| 15 | Derive the MGF for a continuous distribution | 4.2, 4.3 | 4.2 #17(a); 4.3 #29(b) |
| 16 | Time until the first event in a Poisson process | 4.3 | 4.3 #35, 37 |
| 17 | Use the chi-squared table in both directions | 4.3 | 4.3 #38(d) |
| 18 | Use the normal table in both directions | 4.4 | 4.4 #39 |
| 19 | Find z-scores from x-values | 4.4 | 4.4 #40, 42, 43 |
| 20 | Normal word problems: $x \leftrightarrow z \leftrightarrow$ left area $\leftrightarrow$ probability | 4.4 | 4.4 #40, 42, 43 |
| — | Gamma function (from Important Terms) | 4.3 | 4.3 #25 |

**Gaps in the homework.** No assigned problem asks you to *derive* the uniform pdf (#13), the negative binomial pdf, or the hypergeometric pdf (#1). Practice those derivations on your own using section 4 below.

## 2. Not on the formula sheet

The sheet gives the geometric series sums, the Poisson, normal, gamma and exponential pdfs, and $\Gamma$. Everything below is **not** listed, so you need to know it or be able to derive it:

- $E[X] = \sum x f(x)$ or $\int x f(x)\,dx$, and the same with $x^2$ for $E[X^2]$.
- $\operatorname{Var} X = E[X^2] - (E[X])^2$ and $\sigma = \sqrt{\operatorname{Var} X}$.
- $m_X(t) = E[e^{tX}]$, $E[X] = m_X'(0)$ and $E[X^2] = m_X''(0)$.
- Every mean, variance and MGF in the table in section 3.
- The geometric cdf, $F(x) = 1 - q^x$ for positive integers $x$.
- The uniform pdf, cdf, mean and variance.
- Chi-squared with $\gamma$ degrees of freedom is gamma with $\alpha = \gamma/2$ and $\beta = 2$.
- A Poisson process with rate $\lambda$ over an interval of length $s$ has $k = \lambda s$, and the wait until its first event is exponential with $\beta = 1/\lambda$.
- $z = (x - \mu)/\sigma$.
- The geometric, binomial, negative binomial and hypergeometric pdfs are only "possibly given," so learn them too.

## 3. Distribution reference

| Distribution | pdf | $E[X]$ | $\operatorname{Var} X$ | $m_X(t)$ |
|---|---|---|---|---|
| Geometric | $q^{x-1}p$, $\ x = 1, 2, \ldots$ | $1/p$ | $q/p^2$ | $\dfrac{pe^t}{1 - qe^t}$ |
| Binomial | $\binom{n}{x}p^x q^{n-x}$, $\ x = 0, \ldots, n$ | $np$ | $npq$ | $(q + pe^t)^n$ |
| Negative binomial | $\binom{x-1}{r-1}q^{x-r}p^r$, $\ x = r, r+1, \ldots$ | $r/p$ | $rq/p^2$ | $\dfrac{(pe^t)^r}{(1 - qe^t)^r}$ |
| Hypergeometric | $\dfrac{\binom{r}{x}\binom{N-r}{n-x}}{\binom{N}{n}}$ | $n\dfrac{r}{N}$ | $n\dfrac{r}{N}\dfrac{N-r}{N}\dfrac{N-n}{N-1}$ | not used |
| Poisson | $\dfrac{e^{-k}k^x}{x!}$, $\ x = 0, 1, \ldots$ | $k$ | $k$ | $e^{k(e^t - 1)}$ |
| Uniform on $(a, b)$ | $\dfrac{1}{b-a}$ | $\dfrac{a+b}{2}$ | $\dfrac{(b-a)^2}{12}$ | $\dfrac{e^{bt} - e^{at}}{t(b-a)}$ |
| Gamma | $\dfrac{1}{\Gamma(\alpha)\beta^\alpha}x^{\alpha-1}e^{-x/\beta}$ | $\alpha\beta$ | $\alpha\beta^2$ | $(1 - \beta t)^{-\alpha}$ |
| Exponential | $\dfrac{1}{\beta}e^{-x/\beta}$ | $\beta$ | $\beta^2$ | $\dfrac{1}{1 - \beta t}$ |
| Chi-squared ($\gamma$ d.f.) | gamma with $\alpha = \gamma/2$, $\beta = 2$ | $\gamma$ | $2\gamma$ | $(1 - 2t)^{-\gamma/2}$ |
| Normal | $\dfrac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\mu)^2/2\sigma^2}$ | $\mu$ | $\sigma^2$ | $e^{\mu t + \sigma^2 t^2/2}$ |

### Telling the discrete distributions apart

| If the problem... | It's... |
|---|---|
| Has a fixed number $n$ of independent trials with the same $p$, and counts successes | Binomial |
| Counts trials until the **first** success | Geometric |
| Counts trials until the **$r$-th** success | Negative binomial |
| Draws $n$ items **without replacement** from $N$ items, $r$ of which are "successes" | Hypergeometric |
| Counts events over a stretch of time or space at an average rate | Poisson, with $k = \lambda s$ |
| Asks how long until the first event of a Poisson process | Exponential, with $\beta = 1/\lambda$ |

When the sample is small compared with the population (rule of thumb $n/N \le .05$), a hypergeometric can be approximated by a binomial with $p = r/N$. That's what 3.7 #59(d) and 60(d) ask for.

## 4. Derivations to practice

**Geometric pdf.** $X = x$ means $x - 1$ failures followed by a success. The trials are independent, so $f(x) = q^{x-1}p$.

**Binomial pdf.** Any one sequence with $x$ successes and $n - x$ failures has probability $p^x q^{n-x}$, and there are $\binom{n}{x}$ such sequences.

**Negative binomial pdf.** Trial $x$ must be the $r$-th success, so the first $x - 1$ trials hold exactly $r - 1$ successes. That gives $\binom{x-1}{r-1}p^{r-1}q^{x-r} \cdot p$.

**Hypergeometric pdf.** Choose $x$ of the $r$ successes and $n - x$ of the $N - r$ others, then divide by all $\binom{N}{n}$ samples. The possible values run from $\max(0,\ n - (N - r))$ to $\min(n, r)$.

**Showing a function is a pdf.** Check $f(x) \ge 0$, then show $\sum f(x) = 1$ (discrete) or $\int f(x)\,dx = 1$ (continuous). For the geometric, the infinite series gives $\sum_{x=1}^{\infty} q^{x-1}p = \dfrac{p}{1-q} = 1$.

**Geometric cdf.** Use the finite geometric sum with $a = p$ and $r = q$:
$F(x) = \sum_{k=1}^{x} q^{k-1}p = \dfrac{p(1 - q^x)}{1 - q} = 1 - q^x$.
For non-integer $x$, use $1 - q^{\lfloor x \rfloor}$.

**Geometric MGF.**
$m_X(t) = \sum_{x=1}^{\infty} e^{tx}q^{x-1}p = pe^t \sum_{x=1}^{\infty} (qe^t)^{x-1} = \dfrac{pe^t}{1 - qe^t}$.
The series converges only when $qe^t < 1$, that is, $t < -\ln q$.

**Uniform pdf.** Set $f(x) = c$ on $(a, b)$. Then $\int_a^b c\,dx = c(b - a) = 1$, so $c = \dfrac{1}{b-a}$. Its cdf is $F(x) = \dfrac{x-a}{b-a}$ for $a < x < b$.

**Coefficient that makes a pdf.** Integrate $f$ over its range with the constant left in, set the result equal to 1, and solve for the constant.

**Continuous cdf.** $F(x) = \int_{-\infty}^{x} f(t)\,dt$. Write it piecewise: 0 below the range, the integral inside the range, and 1 above it.

**pdf from a cdf.** $f(x) = F'(x)$ on each piece. A valid continuous cdf rises from 0 to 1, never decreases, and has no jumps. If one of those fails, say which one.

**Continuous MGF.** $m_X(t) = \int e^{tx}f(x)\,dx$. Combine the exponents and integrate, and note which values of $t$ make the integral converge.

## 5. Topic notes

### Continuous probabilities (§4.1)

- $P[a \le X \le b] = \int_a^b f(x)\,dx$.
- $P[X = a] = 0$, so it doesn't matter whether you use $<$ or $\le$. That's the point of 4.1 #1(b–d).

### Gamma function and integrals (§4.3)

- $\Gamma(1) = 1$, $\Gamma(\alpha) = (\alpha - 1)\Gamma(\alpha - 1)$, and $\Gamma(n) = (n - 1)!$.
- $\int_0^\infty z^n e^{-z}\,dz = \Gamma(n + 1) = n!$.
- When the exponent is $-x/\beta$, use the gamma pdf integrating to 1: $\int_0^\infty x^{\alpha-1}e^{-x/\beta}\,dx = \Gamma(\alpha)\beta^\alpha$. This handles 4.3 #25(c, d).

### First event in a Poisson process (§4.3)

Let $W$ be the wait until the first event, with rate $\lambda$. Then $W > t$ exactly when there are zero events in $[0, t]$, so:

- $P[W > t] = e^{-\lambda t}$
- $P[W \le t] = 1 - e^{-\lambda t}$

Convert units first. For example, a rate given per year and a wait given in months need to match.

### Poisson counts (§3.8)

The study guide names the binomial, chi-squared and normal tables, but not a Poisson table. Be ready to add up Poisson pdf terms by hand.

- "At least 1" means $1 - P[X = 0]$.
- "More than 10" means $1 - P[X \le 10]$.

### Reading the tables

- **Binomial (Table I):** It's cumulative, giving $P[X \le x]$.
  - $P[X = x] = F(x) - F(x - 1)$
  - $P[X \ge x] = 1 - F(x - 1)$
  - $P[a \le X \le b] = F(b) - F(a - 1)$
- **Normal (Table V):** It gives the left area $P[Z \le z]$.
  - A right area is $1 - \text{left}$.
  - A middle area is the difference of two left areas.
  - For $P[-z \le Z \le z] = A$, look up a left area of $(1 + A)/2$. For example, $.95$ gives $.975$ and $z = 1.96$.
- **Chi-squared (Table IV):** Find the row for the degrees of freedom. Read across to go from a value to a probability, or from a probability to a value.
- **Subscript notation:** In this book, $z_r$ and $\chi^2_r$ mean the point with area $r$ to its **right**. For example, $z_{.10} \approx 1.28$. Check this against your class notes, since courses sometimes flip it.

### Normal word problems (§4.4)

- **Forward:** $x \to z = \dfrac{x - \mu}{\sigma} \to$ left area from the table $\to$ the probability asked for.
- **Backward:** probability $\to$ left area $\to z$ from the table $\to x = \mu + z\sigma$.
- Check whether you were given the variance or the standard deviation. In 4.4 #43 the variance is 9, so $\sigma = 3$.
