# Notes for Chapter 4

*Copied from `3800 Chapter 4 Notes.pdf` (18 pages). The handout leaves blank space under each example and proof for working in class; those blanks are marked "*(blank for work)*". The quiz and homework numbers for every section are collected in [assignments.md](assignments.md).*

## Section 4.1 – Continuous Densities

> Possible quiz question: Chapter 4 exercises 1, 10
> Homework: Chapter 4 exercises 4, 13, 14

A random variable is continuous if it can assume any value in an interval or union of intervals of real numbers and the probability that it assumes a specific value is 0.

We can determine the probability that a value will fall into a range.

### Continuous Density

Let $X$ be a continuous random variable. A function $f$ that satisfies the three criteria below is a density (pdf) for $X$.

- $f(x) \ge 0$ for all real numbers $x$
- $\int_{-\infty}^{\infty} f(x)\,dx = 1$
- $P[a \le X \le b] = \int_a^b f(x)\,dx$ for real numbers $a$ and $b$

For continuous random variables, we replace the summation with an integral, and find probabilities of ranges instead of individual values.

**Example:** The lead concentration in gasoline (grams per liter) is given by the pdf

$$f(x) = \begin{cases} 12.5x - 1.25 & 0.1 \le x \le 0.5 \\ 0 & \text{otherwise} \end{cases}$$

Show that this is a pdf, then find the probability that the lead concentration in a randomly selected liter will be between 0.2 and 0.3 grams per liter. *(blank for work)*

Notice that since $P(X = a) = 0$ and $P(X = b) = 0$, the following is true:

$$P[a \le X \le b] = P[a \le X < b] = P[a < X \le b] = P[a < X < b]$$

### Cumulative Distribution

The cumulative distribution function is $F(x) = P[X \le x]$. For continuous random variables, it is

$$F(x) = \int_{-\infty}^{x} f(t)\,dt$$

**Example:** Find the cdf for the lead concentration in gasoline. *(blank for work)*

Given the cdf, we can find the pdf by differentiation.

**Example:** Find the pdf for the cdf found in the last example. *(blank for work)*

### Uniform Distribution

The uniform distribution is $f(x) = c$, where $c$ is a constant and the total area under the curve is 1.

**Example:** Show that the function below is a pdf.

$$f(x) = \begin{cases} 5 & 1 \le x \le 6 \\ 0 & \text{otherwise} \end{cases}$$

*(blank for work)*

*(As printed, $5 \cdot (6 - 1) = 25 \ne 1$, so this is not a pdf; the uniform density on $[1, 6]$ is $1/5$. The handout probably meant $f(x) = 1/5$.)*

**Example:** Find the probability that $X$ falls between 2 and 4. *(blank for work)*

## Section 4.2 – Expectation and Distribution Parameters

> Possible quiz questions: Chapter 4 exercises 15, 24
> Homework: Chapter 4 exercises 16, 17, 23

Let $X$ be a continuous random variable with density $f$, and let $H(X)$ be a random variable. The expected value of $H(X)$ is given by

$$E[H(X)] = \int_{-\infty}^{\infty} H(x)f(x)\,dx$$

provided that $\int_{-\infty}^{\infty} |H(x)|f(x)\,dx < \infty$.

In particular, $\mu = E(X) = \int_{-\infty}^{\infty} xf(x)\,dx$.

**Example:** Find the mean lead concentration in gasoline using the example from section 4.1. *(blank for work)*

**Example:** Find the variance of the lead concentration in gasoline. *(blank for work)*

**Example:** Suppose the density for $X$ is given by $f(x) = e^{-x}$ for $x > 0$. Find the mean. *(blank for work)*

**Example:** Find the moment generating function for the pdf in the last example and use it to find the mean and variance. *(blank for work)*

**Example:** A random variable $X$ with density

$$f(x) = \frac{1}{\pi}\,\frac{a}{a^2 + (x - b)^2} \qquad x \in \mathbb{R},\ b \in \mathbb{R},\ a > 0$$

has a Cauchy distribution with parameters $a$ and $b$. Letting $a = 1$ and $b = 0$, show that the mean does not exist. *(blank for work)*

## Section 4.3 – Gamma, Exponential, and Chi-Squared Distributions

> Possible quiz questions: Chapter 4 exercise 25, 38d
> Homework: Chapter 4 exercise 29, 35, 37, 38

The gamma function is defined by

$$\Gamma(\alpha) = \int_0^{\infty} z^{\alpha - 1}e^{-z}\,dz$$

Some important properties:

- $\Gamma(1) = 1$
- $\Gamma(\alpha + 1) = \alpha\Gamma(\alpha)$ for $\alpha > 1$
- $\Gamma(n + 1) = n!$ for $n \in \mathbb{Z}$

*(The last property is meant for nonnegative integers $n$.)*

**Example:** Evaluate the integral $\int_0^{\infty} z^3 e^{-z}\,dz$. *(blank for work)*

**Example:** Evaluate the integral $\int_0^{\infty} A\,x^2 e^{-x/3}\,dx$. Determine the value of $A$ that would make this a probability density function. *(blank for work)*

### Gamma Distribution

A random variable $X$ with density

$$f(x) = \frac{1}{\Gamma(\alpha)\beta^{\alpha}}\,x^{\alpha - 1}e^{-x/\beta}$$

where $x > 0$, $\alpha > 0$, $\beta > 0$ is said to have a gamma distribution with parameters $\alpha$ and $\beta$.

**Example:** Find the moment generating function for the gamma distribution. *(blank for work)*

**Example:** Use the moment generating function to find the mean and variance of the gamma distribution. *(blank for work)*

### Exponential Distribution

An exponential random variable is a gamma random variable with $\alpha = 1$. The pdf for an exponential random variable is

$$f(x) = \frac{1}{\beta}e^{-x/\beta} \qquad x > 0,\ \beta > 0$$

**Example:** Sketch the graph of an exponential random variable. *(blank for work)*

**Theorem:** Consider a Poisson process with parameter $\lambda$. Let $W$ denote the time of the occurrence of the first event. $W$ has an exponential distribution with $\beta = \frac{1}{\lambda}$.

Proof: *(blank for work)*

**Example:** The mean number of killer particles emitted by a killer paramecium is 1 every 5 hours. In observing such a paramecium, what is the probability that we must wait at most 4 hours before the first particle is emitted? *(blank for work)*

### Chi-Squared Distribution

Let $X$ be a gamma random variable with $\beta = 2$ and $\alpha = \frac{\gamma}{2}$ where $\gamma$ is a positive integer. $X$ is said to have a chi-squared distribution with $\gamma$ degrees of freedom. We denote this variable by $\chi^2_{\gamma}$.

**Example:** Sketch the graph of the chi-squared distribution. *(blank for work)*

### Chi-Squared Distribution Table

The columns of the chi-squared table correspond to the area to the left of the chi-squared critical value, and the rows correspond to the degrees of freedom $\gamma$.

Notation: We use $\chi^2_r$ to denote the chi-squared value with area $r$ to the right, so the tail area we're looking up on the table is the area $1 - r$ to the left.

**Example:** For $\gamma = 14$, find the following:

- $\chi^2_{0.005}$
- $\chi^2_{0.995}$
- $P(\chi^2 > 19.8)$
- $P(\chi^2 < 9.3)$
- $P(4.11 < \chi^2 < 27.7)$

*(blank for work)*

## Section 4.4 – Normal Distribution

> Possible quiz questions: Chapter 4 exercises 39, 43
> Homework: Chapter 4 exercises 40, 42

A random variable $X$ with density

$$f(x) = \frac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\mu)^2/2\sigma^2} \qquad x \in \mathbb{R},\ \mu \in \mathbb{R},\ \sigma > 0$$

is said to have a normal distribution with parameters $\mu$ and $\sigma$, where $\mu$ is the mean and $\sigma$ is the standard deviation of the normal distribution.

The moment generating function for $X$ is

$$m_X(t) = e^{\mu t + \sigma^2 t^2/2}$$

**Example:** Show that the mean of the normal random variable $X$ with parameters $\mu$ and $\sigma$ is $\mu$ and that the variance is $\sigma^2$. *(blank for work)*

**Example:** The number of grams of hydrocarbons emitted by an automobile per mile is approximately normally distributed with a mean of 1 gram and a standard deviation of 0.25 grams.

- Sketch the graph of this distribution. *(blank for work)*
- Explain why the distribution is "approximately normal" rather than normal. *(blank for work)*

### Standard Normal Distribution

We can't integrate the pdf for the normal distribution for most intervals and have to find probabilities numerically. These probabilities can be compiled into a table of values for everyday use. However, we would need a different table for every combination of $\mu$ and $\sigma$. We use the standard normal distribution so that we only need one table.

The standard normal distribution has a mean of 0 and a standard deviation of 1. We can convert any normal distribution to a standard normal distribution.

Let $X$ be a normal random variable with mean $\mu$ and standard deviation $\sigma$. The variable

$$Z = \frac{X - \mu}{\sigma}$$

is a standard normal random variable.

**Example:** Let $X$ denote the number of grams of hydrocarbons emitted by an automobile per mile. Assuming that $X$ is normal with $\mu = 1$ gram and $\sigma = 0.25$ gram, find the probability that a randomly selected automobile will be between 0.9 and 1.54 grams. *(blank for work)*

### Using the Standard Normal Table

Find the ones and tenths place of your z-score on the left side of the table (the row heading). Then find the hundredths place of the z-score on the top row (the column heading). The entry in that row and column is the probability that a randomly chosen value will fall below your z-score.

- $P(Z < 1.42)$
- $P(Z > 0.51)$
- $P(Z < -0.51)$
- $P(-0.13 < Z < 2.4)$
- $P(Z < 3.99)$

*(blank for work)*

Notation: $z_r$ denotes the z-score with an area of $r$ to the right of it.

**Example:** Let $X$ denote the amount of radiation that can be absorbed by an individual before death ensues. Assume that $X$ is normal with a mean of 500 roentgens and a standard deviation of 150 roentgens. Above what dosage level will only 5% of those exposed survive? *(blank for work)*

**Example:** Find $z_0$ in each case.

- $P(Z < z_0) = 0.2413$
- $P(Z > z_0) = 0.1382$
- $P(-z_0 < Z < z_0) = 0.9000$
- $P(-1.28 < Z < z_0) = 0.74$

*(blank for work)*

## Section 4.5 – Normal Probability Rule and Chebyshev's Inequality

> Possible quiz questions: Chapter 4 exercise 47
> Homework: Chapter 4 exercises 48

The normal probability rule gives us a way to quickly decide which values of the random variable $X$ are common or uncommon.

### Normal probability rule

Let $X$ be normally distributed with parameters $\mu$ and $\sigma$. Then

$$P(\mu - \sigma < X < \mu + \sigma) \approx 0.68$$
$$P(\mu - 2\sigma < X < \mu + 2\sigma) \approx 0.95$$
$$P(\mu - 3\sigma < X < \mu + 3\sigma) \approx 0.997$$

In other words, there is about a 68% chance a randomly chosen value is within one standard deviation of the mean, 95% chance it's within two standard deviations, and 99.7% chance it's within three standard deviations.

Proof: *(blank for work)*

**Example:** Let $X$ denote the amount of radiation that can be absorbed by an individual before death ensues. Assume that $X$ is normal with a mean of 500 roentgens and a standard deviation of 150 roentgens. Between what two values can the center 65% of measurements be found? The center 95%? *(blank for work)*

### Chebyshev's inequality

Let $X$ be a random variable with mean $\mu$ and standard deviation $\sigma$. Then for any positive number $k$,

$$P[|X - \mu| < k\sigma] \ge 1 - \frac{1}{k^2}$$

Notice that there is no requirement of normality.

**Example:** Find the probabilities that a randomly chosen value will fall within one standard deviation of the mean, two standard deviations of the mean, and three standard deviations of the mean using Chebyshev's inequality. Compare these probabilities with the probabilities given in the normal probability rule. *(blank for work)*

**Example:** Let $X$ represent the millions of staffing hours worked in a plant without a serious accident ($\mu = 2$, $\sigma = 0.1$). A serious accident has just occurred. Would it be unusual for the next serious accident to occur within the next 1.6 million staffing hours? *(blank for work)*

## Section 4.6 – Normal Approximation to the Binomial Distribution

> Possible quiz questions: Chapter 4 exercise 52
> Homework: Chapter 4 exercises 54ab, 56

Let $X$ be binomial with parameters $n$ and $p$. For large $n$, $X$ is approximately normal with mean $np$ and variance $npq$.

This fact helps us to make approximations when tables and calculators are not available. In this case, "large" means a large enough $n$ such that $np > 5$ and $n(1 - p) > 5$.

### Half-unit correction

Because we're using a continuous distribution to approximate a discrete distribution, we have to make some sort of correction to avoid the problem of finding $P(X = x)$. This value is always 0 for a continuous distribution but we expect it not to be for the discrete distribution.

The following shows the graph of a binomial distribution. *(blank for a graph)*

We make a half-unit correction in order to account for differences between the discrete and continuous distributions. We find the z-score for either $x - 0.5$ or $x + 0.5$, depending on which value will include the entire bar for $x$.

| Binomial | Normal approximation |
|---|---|
| $P(X = a)$ | $P(a - 0.5 < X < a + 0.5)$ |
| $P(X \ge a)$ | $P(X > a - 0.5)$ |
| $P(X \le a)$ | $P(X < a + 0.5)$ |
| $P(X > a)$ | $P(X > a + 0.5)$ |
| $P(X < a)$ | $P(X < a - 0.5)$ |

**Example:** Let $X$ be binomial with $n = 20$ and $p = 0.4$. What is the probability that there will be 12 or more successes? *(blank for work)*
