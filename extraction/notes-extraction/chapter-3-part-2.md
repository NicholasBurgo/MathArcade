# Notes for Chapter 3 (part 2)

*Copied from `3800 Chapter 3 Notes part 2.pdf` (12 pages). The handout leaves blank space under each example and proof for working in class; those blanks are marked "*(blank for work)*". The quiz and homework numbers for every section are collected in [assignments.md](assignments.md).*

Throughout, $q = 1 - p$.

## Section 3.4 – Geometric Distribution and the Moment Generating Function

> Possible quiz question: Chapter 3 exercise 24
> Homework: Chapter 3 exercises 25, 27, 31

Geometric experiments:

- Series of trials, each of which is a success or failure
- Trials are identical and independent ($p$ constant)
- The random variable $X$ is the number of trials needed to obtain the first success

Sample space: *(blank for work)*

Give the pdf for a geometric experiment. *(blank for work)*

A random variable $X$ has a geometric distribution with parameter $p$ if its density function is given by $f(x) = (1-p)^{x-1}p$ with $0 < p < 1$ and $x \in \mathbb{N}$.

The cdf is a geometric series with $a = p$, $r = 1 - p = q$.

Find the cdf for a geometric experiment. *(blank for work)*

**Example:** Choosing digits randomly, let $X$ be the number of trials until we reach the first zero. What is the expected number of trials needed? *(blank for work)*

### Moment Generating Function (MGF)

Let $X$ be a random variable. The $k$th ordinary moment for $X$ is $E[X^k]$. It's not always easy to calculate the ordinary moments $E(X), E(X^2), \dots$ directly. Many times, the moment generating function is easier to use.

Let $X$ be a random variable with density $f$. The MGF for $X$ is denoted by $m_X(t)$ and is given by

$$m_X(t) = E[e^{tX}]$$

provided that it is finite for all $t$ in some interval.

The moment generating function completely defines the distribution. If a moment generating function for the distribution of a random variable $X$ matches the moment generating function for a particular distribution (such as the geometric distribution), then the distribution of $X$ is that type of distribution.

### Geometric Moment Generating Function

The moment generating function for the geometric distribution is

$$m_X(t) = \frac{pe^t}{1 - qe^t}, \qquad t < -\ln q, \quad q = 1 - p$$

Proof: *(blank for work)*

Maclaurin series expansion for $e^z$:

$$e^z = \sum_{k=0}^{\infty} \frac{z^k}{k!} = 1 + z + \frac{1}{2}z^2 + \frac{1}{6}z^3 + \cdots$$

*(The PDF writes $x^k/k!$ inside the sum; it means $z^k/k!$.)*

To find the ordinary moments using the moment generating function, we take derivatives. The $k$th derivative of the moment generating function gives us the $k$th ordinary moment when evaluated at $t = 0$.

$$E[X^k] = \left.\frac{d^k m_X(t)}{dt^k}\right|_{t=0}$$

**Example:** Find the mean and variance for the geometric distribution by using the moment generating function. *(blank for work)*

**Example:** What is the expected number of trials needed to get the first zero when choosing digits at random? *(blank for work)*

**Example:** Describe the distribution of the random variable $X$ which has moment generating function

$$m_X(t) = \frac{0.4e^t}{1 - 0.6e^t}$$

*(blank for work)*

## Section 3.5 – Binomial Distribution

> Possible quiz questions: Chapter 3 exercises 37, 42(a, b)
> Homework: Chapter 3 exercises 36(a–d), 43(b, c), 44a (explain how to use table)

**Binomial Experiments:**

- Fixed number of trials resulting in success or failure
- Trials are identical and independent with probability $p$ of success
- The random variable $X$ denotes the number of successes in $n$ trials

Give the pdf for a binomial experiment. *(blank for work)*

### Binomial Theorem

$$(a + b)^n = \sum_{k=0}^{n} \binom{n}{k} a^k b^{n-k}$$

**Example:** Find the product $(x + 1)^4$ using the binomial theorem. *(blank for work)*

**Example:** Show that $f(x) = \binom{n}{x} p^x q^{n-x}$ is a pdf. *(blank for work)*

**Example:** There is a 0.9 chance of correctly identifying a signal. Find the probability of correctly identifying exactly 7 out of the next 10 signals. *(blank for work)*

The moment generating function for the binomial random variable $X$ is

$$m_X(t) = (q + pe^t)^n$$

Proof: *(blank for work)*

**Example:** Find the mean and variance of the binomial distribution. *(blank for work)*

**Example:** Find the moment generating function for the previous (signal) example. Find the expected number of signals identified correctly out of 10 signals, and find the variance. *(blank for work)*

### Binomial CDF

The binomial cdf can be directly calculated, but we often make use of tables of values.

To use the table:

- Find the table that matches your value of $n$. You'll have an $n = 20$ table provided on the test.
- Find the row matching your value of $x$, the number of successes.
- Look in the column matching $p$, the probability of success, to find the probability that $X$ is less than or equal to $x$.

**Example:** Use the table below to find the following probabilities when there are 20 trials and a 40% probability of success.

- $P(X \le 8)$
- $P(X < 8)$
- $P(X \ge 8)$
- $P(X > 8)$
- $P(X = 8)$

*(blank for work)*

### Table I – Cumulative binomial distribution (concluded)

Each entry is $P(X \le t)$. The PDF page is a scan of the textbook table; the values below were recomputed and match the scan.

**n = 19**

| t | 0.1 | 0.2 | 0.25 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.75 | 0.8 | 0.9 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0.1351 | 0.0144 | 0.0042 | 0.0011 | 0.0001 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 1 | 0.4203 | 0.0829 | 0.0310 | 0.0104 | 0.0008 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 2 | 0.7054 | 0.2369 | 0.1113 | 0.0462 | 0.0055 | 0.0004 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 3 | 0.8850 | 0.4551 | 0.2631 | 0.1332 | 0.0230 | 0.0022 | 0.0001 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 4 | 0.9648 | 0.6733 | 0.4654 | 0.2822 | 0.0696 | 0.0096 | 0.0006 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 5 | 0.9914 | 0.8369 | 0.6678 | 0.4739 | 0.1629 | 0.0318 | 0.0031 | 0.0001 | 0.0000 | 0.0000 | 0.0000 |
| 6 | 0.9983 | 0.9324 | 0.8251 | 0.6655 | 0.3081 | 0.0835 | 0.0116 | 0.0006 | 0.0001 | 0.0000 | 0.0000 |
| 7 | 0.9997 | 0.9767 | 0.9225 | 0.8180 | 0.4878 | 0.1796 | 0.0352 | 0.0028 | 0.0005 | 0.0000 | 0.0000 |
| 8 | 1.0000 | 0.9933 | 0.9713 | 0.9161 | 0.6675 | 0.3238 | 0.0885 | 0.0105 | 0.0023 | 0.0003 | 0.0000 |
| 9 | 1.0000 | 0.9984 | 0.9911 | 0.9674 | 0.8139 | 0.5000 | 0.1861 | 0.0326 | 0.0089 | 0.0016 | 0.0000 |
| 10 | 1.0000 | 0.9997 | 0.9977 | 0.9895 | 0.9115 | 0.6762 | 0.3325 | 0.0839 | 0.0287 | 0.0067 | 0.0000 |
| 11 | 1.0000 | 1.0000 | 0.9995 | 0.9972 | 0.9648 | 0.8204 | 0.5122 | 0.1820 | 0.0775 | 0.0233 | 0.0003 |
| 12 | 1.0000 | 1.0000 | 0.9999 | 0.9994 | 0.9884 | 0.9165 | 0.6919 | 0.3345 | 0.1749 | 0.0676 | 0.0017 |
| 13 | 1.0000 | 1.0000 | 1.0000 | 0.9999 | 0.9969 | 0.9682 | 0.8371 | 0.5261 | 0.3322 | 0.1631 | 0.0086 |
| 14 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9994 | 0.9904 | 0.9304 | 0.7178 | 0.5346 | 0.3267 | 0.0352 |
| 15 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9999 | 0.9978 | 0.9770 | 0.8668 | 0.7369 | 0.5449 | 0.1150 |
| 16 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9996 | 0.9945 | 0.9538 | 0.8887 | 0.7631 | 0.2946 |
| 17 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9992 | 0.9896 | 0.9690 | 0.9171 | 0.5797 |
| 18 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9999 | 0.9989 | 0.9958 | 0.9856 | 0.8649 |
| 19 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

**n = 20**

| t | 0.1 | 0.2 | 0.25 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.75 | 0.8 | 0.9 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0.1216 | 0.0115 | 0.0032 | 0.0008 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 1 | 0.3917 | 0.0692 | 0.0243 | 0.0076 | 0.0005 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 2 | 0.6769 | 0.2061 | 0.0913 | 0.0355 | 0.0036 | 0.0002 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 3 | 0.8670 | 0.4114 | 0.2252 | 0.1071 | 0.0160 | 0.0013 | 0.0000 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 4 | 0.9568 | 0.6296 | 0.4148 | 0.2375 | 0.0510 | 0.0059 | 0.0003 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 5 | 0.9887 | 0.8042 | 0.6172 | 0.4164 | 0.1256 | 0.0207 | 0.0016 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| 6 | 0.9976 | 0.9133 | 0.7858 | 0.6080 | 0.2500 | 0.0577 | 0.0065 | 0.0003 | 0.0000 | 0.0000 | 0.0000 |
| 7 | 0.9996 | 0.9679 | 0.8982 | 0.7723 | 0.4159 | 0.1316 | 0.0210 | 0.0013 | 0.0002 | 0.0000 | 0.0000 |
| 8 | 0.9999 | 0.9900 | 0.9591 | 0.8867 | 0.5956 | 0.2517 | 0.0565 | 0.0051 | 0.0009 | 0.0001 | 0.0000 |
| 9 | 1.0000 | 0.9974 | 0.9861 | 0.9520 | 0.7553 | 0.4119 | 0.1275 | 0.0171 | 0.0039 | 0.0006 | 0.0000 |
| 10 | 1.0000 | 0.9994 | 0.9961 | 0.9829 | 0.8725 | 0.5881 | 0.2447 | 0.0480 | 0.0139 | 0.0026 | 0.0000 |
| 11 | 1.0000 | 0.9999 | 0.9991 | 0.9949 | 0.9435 | 0.7483 | 0.4044 | 0.1133 | 0.0409 | 0.0100 | 0.0001 |
| 12 | 1.0000 | 1.0000 | 0.9998 | 0.9987 | 0.9790 | 0.8684 | 0.5841 | 0.2277 | 0.1018 | 0.0321 | 0.0004 |
| 13 | 1.0000 | 1.0000 | 1.0000 | 0.9997 | 0.9935 | 0.9423 | 0.7500 | 0.3920 | 0.2142 | 0.0867 | 0.0024 |
| 14 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9984 | 0.9793 | 0.8744 | 0.5836 | 0.3828 | 0.1958 | 0.0113 |
| 15 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9997 | 0.9941 | 0.9490 | 0.7625 | 0.5852 | 0.3704 | 0.0432 |
| 16 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9987 | 0.9840 | 0.8929 | 0.7748 | 0.5886 | 0.1330 |
| 17 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9998 | 0.9964 | 0.9645 | 0.9087 | 0.7939 | 0.3231 |
| 18 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9995 | 0.9924 | 0.9757 | 0.9308 | 0.6083 |
| 19 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 0.9992 | 0.9968 | 0.9885 | 0.8784 |
| 20 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |

## Section 3.6 – Negative Binomial Distribution

> Possible quiz questions: Chapter 3 exercise 48
> Homework: Chapter 3 exercise 47

**Negative Binomial Experiment:**

- Series of independent and identical trials which result in success or failure
- Keep doing trials until exactly $r$ successes are obtained
- $X$ is the number of trials necessary for $r$ successes

Give the pdf for the negative binomial distribution. *(blank for work)*

**Example:** What is the probability that 20 lots will have to be produced in order to obtain the third defective lot if 10% of lots are defective? *(blank for work)*

## Section 3.7 – Hypergeometric Distribution

> Possible quiz questions: Chapter 3 exercises 54–56
> Homework: Chapter 3 exercises 59, 60

**Hypergeometric Experiment:**

- Take a random sample of size $n$ from a population of $N$ without replacement
- There are $r$ successes in the population
- $X$ is the number of successes in the sample

Give the pdf for the hypergeometric distribution. *(blank for work)*

**Example:** $X$ is a hypergeometric random variable with $N = 15$, $r = 6$, and $n = 12$. Find all possible values of $X$ and calculate the probability that $X$ is 4. *(blank for work)*

**Example:** A machine fills 1000 bottles of beer. 20 bottles are checked to see if they're underfilled. Let $X$ be the number of underfilled bottles in the sample. Suppose 100 underfilled bottles were produced. Find the probability that there are at least 3 underfilled bottles in the sample. *(blank for work)*

## Section 3.8 – Poisson Distribution

> Possible quiz questions: Chapter 3 exercise 61(e–i)
> Homework: Chapter 3 exercises 63, 66

Poisson processes involve observing discrete events in an interval of time, length, or space.

**Examples:**

- The number of white blood cells in a drop of blood
- The number of times radioactive gas is released from a nuclear power plant in 3 months
- The number of customers per hour in a store

A random variable $X$ has a Poisson distribution with parameter $k$ if

$$f(x) = \frac{e^{-k}k^x}{x!}, \qquad x = 0, 1, 2, \dots, \quad k > 0$$

Show that this is a pdf. *(blank for work)*

The expected value of the Poisson random variable $X$ with parameter $k$ is $k$, and its variance is $k$.

$X$ is a Poisson random variable with parameter $k = \lambda s$, where $\lambda$ is the average number of events in one unit and $k$ is the average number of events in $s$ units.

**Steps for a Poisson problem:**

- Determine the basic unit of measurement used
- Determine the average number of occurrences per unit
- Determine the length or size of the observation interval
- Use $k$ to write the pdf

**Example:** The average white blood cell count is 6000 per cubic millimeter of blood. A 0.001 cubic millimeter drop is taken and $X$ represents the number of white blood cells. What is the probability of observing at most 2 white blood cells in the drop? *(blank for work)*

### Summary of Discrete Distributions

- Binomial: $X$ is the number of successes in a fixed number of independent trials
- Negative binomial: $X$ is the number of trials needed to reach $r$ successes
- Geometric: negative binomial with $r = 1$
- Hypergeometric: $X$ is the number of successes in a sample without replacement
- Poisson: $X$ is the number of events in an interval
