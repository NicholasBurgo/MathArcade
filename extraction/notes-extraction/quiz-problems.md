# Possible Quiz Problems

*Only the "Possible quiz" exercises from [assignments.md](assignments.md), with their full text copied from [../homework-extraction](../homework-extraction). Where the quiz lists only some parts of an exercise, only those parts are included.*

## Chapter 3

### Section 3.4 – Geometric distribution and the MGF

#### 24

The probability that a wildcat well will be productive is $1/13$. Assume that a group is drilling wells in various parts of the country so that the status of one well has no bearing on that of any other. Let $X$ denote the number of wells drilled to obtain the first strike.

- (a) Verify that $X$ is geometric, and identify the value of the parameter $p$.
- (b) What is the exact expression for the density for $X$?
- (c) What is the exact expression for the moment generating function for $X$?
- (d) What are the numerical values of $E[X]$, $E[X^2]$, $\sigma^2$, and $\sigma$?
- (e) Find $P[X \ge 2]$.

### Section 3.5 – Binomial distribution

#### 37

Albino rats used to study the hormonal regulation of a metabolic pathway are injected with a drug that inhibits body synthesis of protein. The probability that a rat will die from the drug before the experiment is over is $.2$. If 10 animals are treated with the drug, how many are expected to die before the experiment ends? What is the probability that at least eight will survive? Would you be surprised if at least five died during the course of the experiment? Explain, based on the probability of this occurring.

#### 42 (a, b)

It is possible for a computer to pick up an erroneous signal that does not show up as an error on the screen. The error is called a silent paging error. A particular terminal is defective, and when using the system word processor, it introduces a silent paging error with probability $.1$. The word processor is used 20 times during a given week.

- (a) Find the probability that no silent paging errors occur.
- (b) Find the probability that at least one such error occurs.

### Section 3.6 – Negative binomial distribution

#### 48

A particular pitching machine is manufactured so that it will throw the ball into the strike zone of a 6-foot batter 90% of the time. What is the average number of pitches that it will throw in order to walk a batter (that is, throw 4 pitches outside of the strike zone)? What is the probability that the fourth ball will be thrown on the seventh pitch?

### Section 3.7 – Hypergeometric distribution

#### 54

Suppose that $X$ is hypergeometric with $N = 20$, $r = 17$, and $n = 5$. What are the possible values for $X$? What is $E[X]$ and $\operatorname{Var} X$?

#### 55

Suppose that $X$ is hypergeometric with $N = 20$, $r = 3$, and $n = 5$. What are the possible values for $X$? What is $E[X]$ and $\operatorname{Var} X$?

#### 56

Suppose that $X$ is hypergeometric with $N = 20$, $r = 10$, and $n = 5$. What are the possible values for $X$? What is $E[X]$ and $\operatorname{Var} X$?

### Section 3.8 – Poisson distribution

#### 61 (e–i)

Let $X$ be a Poisson random variable with parameter $k = 10$.

- (e) Find $P[X \le 4]$.
- (f) Find $P[X < 4]$.
- (g) Find $P[X = 4]$.
- (h) Find $P[X \ge 4]$.
- (i) Find $P[4 \le X \le 9]$.

## Chapter 4

### Section 4.1 – Continuous densities

#### 1

Consider the function

$$f(x) = kx \qquad 2 \le x \le 4$$

- (a) Find the value of $k$ that makes this a density for a continuous random variable.
- (b) Find $P[2.5 \le X \le 3]$.
- (c) Find $P[X = 2.5]$.
- (d) Find $P[2.5 < X \le 3]$.

#### 10

*(Uniform distribution.)* Find the general expression for the cumulative distribution function for a random variable $X$ that is uniformly distributed over the interval $(a, b)$. See Exercise 5.

*Setup from Exercise 5, which isn't assigned:* A random variable $X$ is said to be uniformly distributed over an interval $(a, b)$ if its density is given by

$$f(x) = \frac{1}{b - a} \qquad a < x < b$$

### Section 4.2 – Expectation and distribution parameters

#### 15

Consider the random variable $X$ with density

$$f(x) = (1/6)x \qquad 2 \le x \le 4$$

- (a) Find $E[X]$.
- (b) Find $E[X^2]$.
- (c) Find $\sigma^2$ and $\sigma$.

#### 24

Assume that the increase in demand for electric power in millions of kilowatt hours over the next 2 years in a particular area is a random variable whose density is given by

$$f(x) = (1/64)x^3 \qquad 0 < x < 4$$

- (a) Verify that this is a valid density.
- (b) Find the expression for the cumulative distribution for $X$, and use it to find the probability that the demand will be at most 2 million kilowatt hours.
- (c) If the area only has the capacity to generate an additional 3 million kilowatt hours, what is the probability that demand will exceed supply?
- (d) Find the average increase in demand.

### Section 4.3 – Gamma, exponential, and chi-squared

#### 25

Evaluate each of these integrals:

- (a) $\displaystyle\int_0^\infty z^2 e^{-z}\,dz$
- (b) $\displaystyle\int_0^\infty z^7 e^{-z}\,dz$
- (c) $\displaystyle\int_0^\infty x^3 e^{-x/2}\,dx$
- (d) $\displaystyle\int_0^\infty (1/16)\,x e^{-x/4}\,dx$

#### 38 (d)

Consider a chi-squared random variable with 15 degrees of freedom.

- (d) Use Table IV of App. A to find each of the following:
  - $P[X^2_{15} \le 5.23]$
  - $P[6.26 \le X^2_{15} \le 27.5]$
  - $\chi^2_{.05}$
  - $P[X^2_{15} \ge 22.3]$
  - $\chi^2_{.01}$
  - $\chi^2_{.95}$

### Section 4.4 – Normal distribution

#### 39

Use Table V of App. A to find each of the following:

- (a) $P[Z \le 1.57]$.
- (b) $P[Z < 1.57]$.
- (c) $P[Z = 1.57]$.
- (d) $P[Z > 1.57]$.
- (e) $P[-1.25 \le Z \le 1.75]$.
- (f) $z_{.10}$.
- (g) $z_{.90}$.
- (h) The point $z$ such that $P[-z \le Z \le z] = .95$.
- (i) The point $z$ such that $P[-z \le Z \le z] = .90$.

#### 43

Let $X$ denote the time in hours needed to locate and correct a problem in the software that governs the timing of traffic lights in the downtown area of a large city. Assume that $X$ is normally distributed with mean 10 hours and variance 9.

- (a) Find the probability that the next problem will require at most 15 hours to find and correct.
- (b) The fastest 5% of repairs take at most how many hours to complete?

### Section 4.5 – Normal probability rule and Chebyshev's inequality

#### 47

*Not extracted yet.* The problem text isn't in `homework-extraction/`.

### Section 4.6 – Normal approximation to the binomial

#### 52

*Not extracted yet.* The problem text isn't in `homework-extraction/`.
