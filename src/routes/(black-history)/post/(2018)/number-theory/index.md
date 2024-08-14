---
title: 数论学习入门 #1
---

# 数论学习入门 #1

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata author="swwind" time="2018-12-21" tags="数论">
</vue-metadata>

数论虽然在 NOIP 中不作深入的要求，但是在这之上的比赛就经常会有涉及到这类知识的算法题目。

本文来总结整理一下一些初等的数论知识。

> Mathematics is the queen of the sciences—and number theory is the queen of mathematics.
> 数学是科学的皇后，数论是数学的皇后。
>
> ——卡尔·弗里德里希·高斯

# 基本定理和性质

_本文所使用的符号均参照数学选修 4-6_

## 质数与合数

在大于 $1$ 的自然数中，除了 $1$ 和该数自身外，无法被其他自然数整除的数称为**质数**（aka. **素数**)。

大于 $1$ 的自然数若不是素数，则称之为**合数**（aka. **合成数**）。

**$1$ 既不是质数，也不是合数。**

## 最大公约数和最小公倍数

**最大公约数**（abbr. **gcd**, **g**reatest **c**ommon **d**ivisor）指能够整除多个整数的最大正整数。

如果 $c$ 是 $a$ 和 $b$ 的最大公约数，我们记为 $(a, b) = c$。

如果 $(a,b)=1$，那么我们称 $a$ 与 $b$ **互质**，可以记为 $a \bot b$。

**最小公倍数**（abbr. **lcm**, **l**east **c**ommon **m**ultiple）指能够被多个整数整除的最小正整数。

如果 $c$ 是 $a$ 和 $b$ 的最大公约数，我们记为 $[a, b] = c$。

一个大家都知道的结论：$(a, b) \times [a, b] = ab$

## 整除

如果 $a$ 能够整除 $b$，我们称 $a$ 是 $b$ 的**约数**或**因子**，记为 $a \mid b$。

相反，如果 $a$ 不能够整除 $b$，我们记为 $a \nmid b$。

整除有一些优秀的性质：

- $a \mid b, b \mid c, a \bot b \Rightarrow ab \mid c$
- $a \mid bc, a \bot b \Rightarrow a \mid c$
- $a \mid bc \Rightarrow a \mid b$ 或 $a \mid c$

正确性显然。

## Sum 和 Product

$$
\begin{aligned}
\sum_{i=1}^{n}a_i &= a_1 + a_2 + ... + a_n \\
\prod_{i=1}^{n}a_i &= a_1 a_2 ... a_n
\end{aligned}
$$

## 算数基本定理

设 $n>1$，则 $n$ 可以分解成素数的乘积

$$
n = p_1p_2...p_k
$$

如果不计这些素数的次序，则分解式是唯一的。

设 $n = p_1^{a_1}p_2^{a_2}...p_k^{a_k}$ 是 $n$ 的标准分解式，若用 $d(n)$ 表示 $n$ 的所有正约数的个数，那么

$$
d(n) = \prod_{i=1}^{k}(a_i+1)
$$

## 组合数与阶乘

**组合数**（aka. **二项式系数**） $\binom{n}{m}$ 表示从 $n$ 个本质不同的物品中选出 $m$ 个物品的方案数（不计选择的顺序）。

$$
\binom{n}{m} = \frac{n!}{(n-m)!m!}
$$

其中

$$
n!=\begin{cases}1,&n=0 \\
\prod_{i=1}^{n}i,&n>0
\end{cases}
$$

于是我们有递推式：

$$
\binom{n}{m} = \binom{n-1}{m} + \binom{n-1}{m-1}
$$

**二项式定理**：

$$
(x+y)^n = \sum_{i=0}^{n}\binom{n}{i}x^{n-i}y^i
$$

## 同余

如果 $a$ 和 $b$ 对 $p$ 的余数相等，那么我们记为 $a \equiv b \pmod p$

# 数论函数

## 积性函数

如果 $f(x)$ 是积性函数，那么对于 $\forall a, b \in N, a \bot b$，满足 $f(ab) = f(a)f(b)$。

下面是一些常见的积性函数：

- $\sigma_k(n) = \sum_{d|n}d^k$
- $d(n)=\sigma_0(n)$ 表示 $n$ 的正因子个数
- $\sigma(n)=\sigma_1(n)$ 表示 $n$ 的所有正因子的和
- $id_k(n)=n^k$
- $l(n)=id_0(n)=1$
- $id(n)=id_1(n)=n$
- $\varepsilon(n)=\begin{cases}1,&n=1\\\\0,&n>1\end{cases}$

## 欧拉函数

<figure>
  <img src="/assets/euler.jpg" />
  <figcaption>莱昂哈德·欧拉(1707-1783)</figcaption>
</figure>

**欧拉函数** $\varphi(n)$ 表示小于 $n$ 的与 $n$ 互质的正整数的个数。

设 $n = p_1^{a_1}p_2^{a_2}...p_k^{a_k}$，则有

$$
\varphi(n) = n(1-\frac{1}{p_1})(1-\frac{1}{p_2})...(1-\frac{1}{p_k})
$$

$\varphi(n)$ 是**积性函数**。

**欧拉定理**：设 $m>1$，$(a,m)=1$，则 $a^{\varphi(m)} \equiv 1 \pmod m$

如果 $m$ 是质数，那么 $\varphi(m)=m-1$，这其实就是费马小定理了。

**费马小定理**：设 $p$ 是质数，$(a,p)=1$，则 $a^{p-1} \equiv 1 \pmod p$

**扩展欧拉定理**：

$$
a^b \equiv \begin{cases}
a^{b \mod \varphi(p)}, &a \bot p \\
a^{b} , &b < \varphi(p) \\
a^{b \mod \varphi(p) + \varphi(p)}, &b \geq \varphi(p)
\end{cases} \pmod p
$$

<figure>
  <img src="/assets/fermat.jpg" />
  <figcaption>皮埃尔·德·费马(1601-1665)</figcaption>
</figure>

> **例题：** 求 $2^{2^{2^{...}}} \mod p$

> **解：** 令 $S = 2^{2^{2^{...}}}$
> 则 $S \equiv 2^{S \mod \varphi(p) + \varphi(p)} \pmod p$
> 于是问题可以转化为求 $S$ 对 $\varphi(p)$ 取模的子问题。
> 以此类推，当模数为 $1$ 时，答案显然为 $0$。
> 然后递归回去计算即可。

## 莫比乌斯函数

莫比乌斯函数 $\mu(n)$ 的定义：

设 $n = p_1^{a_1}p_2^{a_2}...p_k^{a_k}$，

$$
\mu(n) = \begin{cases}
1, & n = 1 \\\\
(-1) ^ k, & \forall a_i=1 \\\\
0, & \exists a_i \gt 1
\end{cases}
$$

$\mu(n)$ 也是积性函数。

$$
\sum_{d \mid n}\mu(d) = \varepsilon(n)
$$

# 算法

## 狄利克雷卷积

<figure>
  <img src="/assets/dirichlet.jpg" />
  <figcaption>约翰·彼得·古斯塔夫·勒热纳·狄利克雷(1805-1859)</figcaption>
</figure>

如果 $f(n),g(n)$ 是数论函数，令 $h = f \times g$，则

$$
h(n)=\sum_{d|n}f(d)g(\frac{n}{d})
$$

狄利克雷卷积有一些优秀的性质：

- 交换律 $f\times g=g\times f$
- 结合律 $(f\times g)\times h=f\times (g\times h)$
- 分配律 $f\times (g+h)=f\times g+f\times h$
- 单位元 $\varepsilon\times f=f$

一些公式：

- $d(n)=\sum_{d|n}l(d) \Leftrightarrow d = l \times l$
- $\sigma(n)=\sum_{d|n}id(d) \Leftrightarrow \sigma = l \times id$
- $\varepsilon(n)=\sum_{d|n}\mu(d) \Leftrightarrow \varepsilon = l \times \mu$
- $\varphi(n)=\sum_{d|n}\mu(d)\frac nd \Leftrightarrow \varphi = \mu \times id$
- $n=\sum_{d|n}\varphi(d) \Leftrightarrow id = l \times \varphi$

## 莫比乌斯反演

如果 $f(n),g(n)$ 是数论函数，则有

$$
f(n)=\sum_{d \mid n}g(d) \Leftrightarrow g(n) = \sum_{d \mid n}\mu(d)f(\frac{n}{d})
$$

证明：

$$
\begin{aligned}
f &= g \times l \\
f \times \mu &= g \times l \times \mu \\
f \times \mu &= g \times \varepsilon \\
f \times \mu &= g
\end{aligned}
$$

变形：

$$
f(k)=\sum_{d=1}^{\lfloor\frac{n}{k}\rfloor} g(dk) \Rightarrow g(k) = \sum_{d=1}^{\lfloor\frac{n}{k}\rfloor} \mu(d)f(dk)
$$

~~这怎么证啊。。。~~

> **例题：**
> 求 $(n \leq m)$
>
> $$
> \sum_{i=1}^{n}\sum_{j=1}^{m}[(i,j)=k]
> $$

> **解：**
> 设
>
> $$
> f(k)=\sum_{i=1}^{n}\sum_{j=1}^{m}[(i,j)=k] \\
> g(k)=\sum_{i=1}^{n}\sum_{j=1}^{m}[k \mid (i,j)]
> $$
>
> 则有
>
> $$
> g(k)=\sum_{d=1}^{\lfloor\frac{n}{k}\rfloor}f(dk)
> $$
>
> 根据莫比乌斯反演得
>
> $$
> f(k) = \sum_{d=1}^{\lfloor\frac{n}{k}\rfloor} \mu(d)g(dk)
> $$
>
> 考虑如何计算 $g(k)$，我们马上就能发现
>
> $$
> g(k) = \left\lfloor \frac{n}{k} \right\rfloor\left\lfloor \frac{m}{k} \right\rfloor
> $$
>
> 所以
>
> $$
> f(k) = \sum_{d=1}^{\lfloor\frac{n}{k}\rfloor} \mu(d)\left\lfloor \frac{n}{dk} \right\rfloor\left\lfloor \frac{m}{dk} \right\rfloor
> $$
>
> 直接计算是 $O(n)$ 的，可以利用前缀和和分块的技巧优化到单次询问 $O(\sqrt{n}+\sqrt{m})$。

# 总结

~~如果你不知道一个公式怎么证明，那就打表~~
~~打表找规律大法好~~

文章写太长不好，剩下来的以后讲。
下次应该会多写几道例题。

~~别问我为什么退役了才写这个~~
