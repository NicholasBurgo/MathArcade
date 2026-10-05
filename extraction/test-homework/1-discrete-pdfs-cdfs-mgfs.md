# Discrete pdfs, cdfs and MGFs

## 3.4 #24

**Test skills:** (a) label the scenario; (b) derive the pdf; (c) derive the MGF; (d) mean and variance; (e) probability from the pdf

The probability that a wildcat well will be productive is $1/13$. Assume that a group is drilling wells in various parts of the country so that the status of one well has no bearing on that of any other. Let $X$ denote the number of wells drilled to obtain the first strike.

- (a) Verify that $X$ is geometric, and identify the value of the parameter $p$.
- (b) What is the exact expression for the density for $X$?
- (c) What is the exact expression for the moment generating function for $X$?
- (d) What are the numerical values of $E[X]$, $E[X^2]$, $\sigma^2$, and $\sigma$?
- (e) Find $P[X \ge 2]$.

## 3.4 #25

**Test skills:** (a) label the scenario; (b) derive the pdf; (c) derive the MGF; (d) mean and variance; (e) probability from the pdf

The zinc-phosphate coating on the threads of steel tubes used in oil and gas wells is critical to their performance. To monitor the coating process, an uncoated metal sample with known outside area is weighed and treated along with the lot of tubing. This sample is then stripped and reweighed. From this it is possible to determine whether or not the proper amount of coating was applied to the tubing. Assume that the probability that a given lot is unacceptable is $.05$. Let $X$ denote the number of runs conducted to produce an unacceptable lot. Assume that the runs are independent in the sense that the outcome of one run has no effect on that of any other.

- (a) Verify that $X$ is geometric. What is "success" in this experiment? What is the numerical value of $p$?
- (b) What is the exact expression for the density for $X$?
- (c) What is the exact expression for the moment generating function for $X$?
- (d) What are the numerical values of $E[X]$, $E[X^2]$, $\sigma^2$, and $\sigma$?
- (e) Find the probability that the number of runs required to produce an unacceptable lot is at least 3.

## 3.4 #27

**Test skills:** derive the geometric cdf, then use it for a probability

Find the expression for the cumulative distribution function for the random variable of Exercise 25. Use this function to find the probability that at most three runs are required to produce an unacceptable lot.

## 3.4 #31

**Test skills:** (a) show it's a pdf; (b, e) mean and $E[X^2]$ from the definition; (c) find the MGF; (d, f) mean and $E[X^2]$ from the MGF; (g) variance

Consider the random variable $X$ whose density is given by

$$f(x) = \frac{(x-3)^2}{5} \qquad x = 3, 4, 5$$

- (a) Verify that this function is a density for a discrete random variable.
- (b) Find $E[X]$ directly. That is, evaluate $\sum_{\text{all } x} x f(x)$.
- (c) Find the moment generating function for $X$.
- (d) Use the moment generating function to find $E[X]$, thus verifying your answer to part (b) of this exercise.
- (e) Find $E[X^2]$ directly. That is, evaluate $\sum_{\text{all } x} x^2 f(x)$.
- (f) Use the moment generating function to find $E[X^2]$, thus verifying your answer to part (e) of this exercise.
- (g) Find $\sigma^2$ and $\sigma$.

## 3.5 #36 (a–d)

**Test skills:** (a) binomial pdf; (b) MGF; (c) mean and variance; (d) mean and variance from the MGF

Let $X$ be binomial with parameters $n = 15$ and $p = .2$.

- (a) Find the expression for the density for $X$.
- (b) Find the expression for the moment generating function for $X$.
- (c) Find $E[X]$ and $\operatorname{Var} X$.
- (d) Find $E[X]$, $E[X^2]$, and $\operatorname{Var} X$ using the moment generating function, thus verifying your answer to part (c) of this exercise.

## 3.5 #43 (b, c)

**Test skills:** mean and $E[X^2]$ from the MGF

*Setup from part (a), which isn't assigned:* $m_X(t)$ is the moment generating function for a binomial random variable with parameters $n$ and $p$.

- (b) Use $m_X(t)$ to show that $E[X] = np$.
- (c) Use $m_X(t)$ to show that $E[X^2] = n^2p^2 - np^2 + np$.
