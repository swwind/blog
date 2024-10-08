---
title: Curve25519/X25519 原理与实现
---

# Curve25519/X25519 原理与实现

<vue-metadata author="swwind" time="2022-12-20" tags="Crypto"></vue-metadata>

研究 WireGuard 的时候突然好奇公钥和私钥的一堆字符串里面保存的究竟是什么东西，于是稍微研究了一下 X25519 和 ECDH 相关的内容。写一篇文章总结一下这套东西究竟是什么，以及用了什么奇技淫巧生成的公钥和私钥，希望对各位学习密码学 ECDH 相关内容有所帮助。

## 蒙哥马利曲线

蒙哥马利曲线是一类椭圆曲线，其满足的通式为

$$
M_{A,B}: By^2=x^3+Ax^2+x
$$

其中满足 $B(A^2-4) \ne 0$。

关于曲线长什么样你们可以自己脑补，我就不贴图了。

## 椭圆曲线上的加法

我们定义椭圆曲线 $E$ 上的加法是指点 $P, Q \in E$ 连成的直线 $L$ 与椭圆曲线 $E$ 所交的第三个点关于 $x$ 轴的对称点。

显然根据定义我们可以知道这个加法运算满足交换律，即 $P+Q=Q+P$。

当点 $P$ 与点 $Q$ 重合的时候，我们将此时椭圆曲线上点 $P$ 处的切线作为直线 $L$ 与椭圆曲线求交。

当点 $P$ 与点 $Q$ 关于 $x$ 轴对称（我们记为 $P=Q^{-1}$）的时候，则可能 $L$ 与 $E$ 没有第三个交点，这时候我们人为添加一个无穷远点 $O$，用来作为这种情况下的解，即 $P+P^{-1}=O$。

此外我们有

$$
\begin{aligned}
O + O &= O \\
P + O &= P \\
\end{aligned}
$$

经过简单推导可以看出 $O$ 满足许多加法中零元的性质，因此我们可以将点 $O$ 看作是由集合 $S=\{P | P\in E\}\cup \{O\}$ 和加法 $\left\langle + \right\rangle$ 构成的群 $G=\left\langle S,+ \right\rangle$ 中的单位元。

## Curve25519

Curve25519 指的是一条曲线，这条曲线是指一条蒙哥马利曲线

$$
C: y^2=x^3+486662x^2+x
$$

并且定义在质数模域 $p=2^{255}-19$ 上，故将曲线称之为 Curve25519。

我们定义群 $G$ 是由该椭圆曲线上的点和一个无穷远点 $O$，以及椭圆曲线上的加法运算 $\left\langle + \right\rangle$ 所定义的群，根据一些我也不知道怎么推的魔法手段可以得出群 $G$ 的阶，即 $|G| = hq$，其中 $h=2^c=8$ 被称为余因子（cofactor），$q$ 是一个比较大的质数，准确来说有 $q=2^{252}+27742317777372353535851937790883648493$。

根据拉格朗日定理，我们可以知道如果群 $G$ 有子群 $E$，则 $|E|$ 必为 $|G|$ 的一个因子。所以我们可以知道，对于群 $G$ 中的任意元素的阶必定是 $1,2,4,8,q,2q,4q,8q$ 中的一个。

## X25519 与 ECDH

X25519 指的是在曲线 Curve25519 上计算的一套 ECDH 密钥交换算法，其中选择的基点是 $G=(9, y)$，并且可以通过计算可以知道点 $G$ 的阶是 $ord(G) = q$。

ECDH 的过程如下：

1. Alice 生成自己的私钥 $a$，并且计算公钥 $A=a \cdot G$
2. Bob 生成自己的私钥 $b$，并且计算公钥 $B=b \cdot G$
3. Alice 和 Bob 将自己的公钥通过不安全信道发送给对方
4. Alice 计算 $K=a \cdot B = a \cdot (b \cdot G) = ab \cdot G$
5. Bob 计算 $K=b \cdot A = b \cdot (a \cdot G) = ab \cdot G$

Alice 和 Bob 可以得到一个相同的结果作为接下来对称加密的密钥，但是攻击者仅通过偷听到的 $A$ 和 $B$ 很难计算出 $a, b$ 的值，也很难得出 $K$ 的结果。

但是这个算法也有一些缺陷，假设 Alice 想要窃取 Bob 的密钥，那么 Alice 可以从 Curve25519 曲线中挑选出一个阶比较小的点 $S$ 作为自己的公钥，我们不妨设 $ord(S)=8$，即 $8 \cdot S=O$。那么 Bob 在收到 Alice 的公钥之后会计算 $K=b \cdot S$，并将 $K$ 作为接下来对称加密的密钥。而 Alice 知道 $K$ 只有可能是 $8$ 种不同的结果，并且可以根据 Bob 接下来的行为判断出 Bob 得到的是哪个密钥，从而得到 $b \bmod 8$ 的结果，相当于泄露了 3 比特的密钥信息。这种攻击手段被称为小子群约束攻击（Small Subgroup Confinement Attack，~~我乱翻译的~~）。

想要防范上面的攻击，可以当 Bob 收到对方密钥之后预先计算一下 $K'=h \cdot A$ 是否等于无穷远点 $O$。可以证明，如果 Alice 的公钥的阶小于等于 $h$，则 $K'$ 的结果将必定是 $O$。这时候 Bob 可以认为 Alice 的公钥不合法，从而拒绝接下来的通信。

X25519 并没有从上面的角度出发，而是直接钦点私钥的最低三位比特必须是 0，这样 Alice 将无法得到任何有用的信息。

此外 X25519 也指定私钥的长度为 256 位，其中最高位比特必须为 0，次高位比特必须为 1，这将密钥的空间降低到了 $2^{251}$ 级别，同时将私钥的最高有效位也固定了下来，可以防止一些旁道攻击。

## 如何计算点加法

接下来具体介绍 X25519 的实现，我们在 ECDH 的全部过程中只需要一样操作，就是计算一个点 $P$ 自己加自己 $n$ 次的乘法 $n \cdot P$。

首先我们考虑计算点 $P, Q$ 之间加法的一般过程，分以下情况考虑：

1.  $Q = O$ 或者 $P = O$，则有 $P + O = P$ 或者 $O + Q = Q$；
2.  $x_P = x_Q, y_P = -y_Q$，即 $P = Q^{-1}$，则我们有 $P+Q=O$；
3.  $x_P \ne x_Q$，假设 $P+Q=R$，则我们令直线 $L$ 是经过点 $P, Q, R^{-1}$ 的直线，我们有

    $$
    L: y = kx+b
    $$

    其中 $k=\frac{y_P-y_Q}{x_P-x_Q}$，我们将 $L$ 带入椭圆曲线 $E: y^2=x^3+Ax^2+x$ 中得到（其中 $A=486662$）

    $$
    (kx+b)^2=x^3+Ax^2+x
    $$

    即

    $$
    x^3+(A-k^2)x^2+(1-2kb)x-b^2=0
    $$

    根据代数基本定理，我们有

    $$
    (x-x_P)(x-x_Q)(x-x_R) = 0
    $$

    即

    $$
    x^3-(x_P+x_Q+x_R)x^2+(x_Px_Q+x_Px_R+x_Qx_R)x-x_Px_Qx_R=0
    $$

    比较系数可以得到

    $$
    A-k^2 = -(x_P+x_Q+x_R)
    $$

    即

    $$
    x_R = k^2-A-x_P-x_Q
    $$

    并且根据点 $P, R^{-1}$ 经过直线 $L$ 可以知道

    $$
    \begin{aligned}
    y_P&=kx_P+b\\
    -y_R&=kx_R+b
    \end{aligned}
    $$

    将上述两式相减可以得到

    $$
    y_R=k(x_P-x_R)-y_P
    $$

    至此我们可以得到点 $R$ 的解

    $$
    \begin{cases}
    x_R = k^2-A-x_P-x_Q \\
    y_R = k(x_P-x_R)-y_P
    \end{cases}
    $$

4.  $x_P = x_Q, y_P = y_Q$，即 $P = Q$ 的情况，这时候我们需要求椭圆曲线 $E$ 在点 $P$ 处的切线。我们可以先将椭圆曲线的表达式两边同时对 $x$ 求导，得到（其中 $A=486662$）

    $$
    2y\frac{\text{d}y}{\text{d}x} = 3x^2+2Ax+1
    $$

    即

    $$
    k=\frac{\text{d}y}{\text{d}x}=\frac{3x_P^2+2Ax_P+1}{2y_P}
    $$

    接下来的情况与上述相同，将 $k$ 的值带入第三种情况的时候求得的最终式子即可。

通过上面分析的四种情况，再使用快速幂相关的思想，我们已经可以实现一个计算点乘法的函数。但是实际上我们还可以再做进一步优化。

## 蒙哥马利梯子算法

这个名字是我乱翻译的，原名叫做 Montgomery Ladder 算法，基本思想是将点拆分成 $(X:Y:Z)$ 三元组，其中满足 $x=\frac{X}{Z}, y=\frac{Y}{Z}$，接着构造一个函数 $L(P, i)$ 满足（下面将 $i \cdot P$ 简写成 $P_{i}$）

$$
\begin{aligned}
L(P, 0) &= (O, P) \\
L(P, i) &= (P_i, P_{i+1}) \\
\end{aligned}
$$

考虑如何转移上面的式子，我们可以简单得出

$$
\begin{aligned}
L(P, 2i) &= (P_i + P_i, P_i + P_{i+1}) \\
L(P, 2i+1) &= (P_i + P_{i+1}, P_{i+1} + P_{i+1})
\end{aligned}
$$

至此我们得到了一个通过 $L(P, i)$ 计算 $L(P, 2i)$ 和 $L(P, 2i+1)$ 的算法，我们可以将其用于一种另类的快速幂算法，同样可以在 $O(\log n)$ 的时间内求出 $n \cdot P$ 的值。

接下来我们要考虑的就是如何优化求 $P_i + P_i$ 和 $P_i + P_{i+1}$ 的过程。

首先我们考虑求 $P_{2i}=P_i + P_i$ 的情况，为了方便考虑，我们暂时排除 $P_i=O$ 和 $P_{2i} = O$ 的情况，将无穷远点的问题留到最后单独考虑。排除掉无穷远点的情况之后，这种就是上述的第四类情况，我们可以直接利用现成的结论

$$
\begin{aligned}
x_{2i} &= k^2-A-2x_i \\
&= \frac{(3x_i^2+2Ax_i+1)^2}{4y_i^2} -A-2x_i \\
&= \frac{(3x_i^2+2Ax_i+1)^2 - 4(x_i^3+Ax_i^2+x_i)(A+2x_i)}{4(x_i^3+Ax_i^2+x_i)} \\
% &= \frac{[9x_i^4+12Ax_i^3+(6+4A^2)x_i^2+4Ax_i+1] - [8x_i^4+12Ax_i^3+(8+4A^2)x_i^2+4Ax_i]}{4(x_i^3+Ax_i^2+x_i)} \\
&= \frac{x_i^4-2x_i^2+1}{4(x_i^3+Ax_i^2+x_i)} \\
&= \frac{\frac{X_i^4}{Z_i^4}-2\frac{X_i^2}{Z_i^2}+1}{4(\frac{X_i^3}{Z_i^3}+A\frac{X_i^2}{Z_i^2}+\frac{X_i}{Z_i})} \\
&= \frac{X_i^4-2X_i^2Z_i^2+Z_i^4}{4(X_i^3Z_i+AX_i^2Z_i^2+X_iZ_i^3)} \\
&= \frac{(X_i^2-Z_i^2)^2}{4X_iZ_i(X_i^2+AX_iZ_i+Z_i^2)} \\
\end{aligned}
$$

从而我们可以得到递推式

$$
\begin{cases}
X_{2i} &= (X_i^2-Z_i^2)^2 \\
Z_{2i} &= 4X_iZ_i(X_i^2+AX_iZ_i+Z_i^2)
\end{cases}
$$

之后考虑 $P_{2i+1} = P_i + P_{i+1}$ 的情况，同样为了方便考虑，我们暂时将下面几种情况排除，在最后单独进行考虑：

1. $P_i = O$ 或者 $P_{i+1} = O$ 的情况；
2. $P_i = P_{i+1}$，即 $P = O$ 的情况；
3. $P_i = P_{i+1}^{-1}$，即 $P_{2i+1}=O$ 的情况。

排除了上面的两种情况之后我们可以得到 $x_{i} \ne x_{i+1}$，故可以采用之前的第三种情况。

$$
\begin{aligned}
x_{2i+1} &= k^2-A-x_i-x_{i+1} \\
&=\frac{(y_i-y_{i+1})^2}{(x_i-x_{i+1})^2} - A - x_i - x_{i+1} \\
&=\frac{y_i^2-2y_iy_{i+1}+y_{i+1}^2 - (A + x_i+x_{i+1})(x_i-x_{i+1})^2}{(x_i-x_{i+1})^2} \\
% &=\frac{(x_i^3+Ax_i^2+x_i-2y_iy_{i+1}+x_{i+1}^3+Ax_{i+1}^2+x_{i+1}) - (Ax_i^2-2Ax_ix_{i+1}+Ax_{i+1}^2+x_i^3-2x_i^2x_{i+1}+x_ix_{i+1}^2+x_i^2x_{i+1}-2x_ix_{i+1}^2+x_{i+1}^3)}{(x_i-x_{i+1})^2} \\
&=\frac{(1+x_ix_{i+1})(x_i+x_{i+1}) +2Ax_ix_{i+1}-2y_iy_{i+1}}{(x_i-x_{i+1})^2} \\
\end{aligned}
$$

此外，我们可以根据 $P_{i+1} = P_{i} + P$，即 $P = P_i^{-1}+ P_{i+1}$ 可以得到

$$
\begin{aligned}
x_P &= \frac{(1+x_ix_{i+1})(x_i+x_{i+1}) +2Ax_ix_{i+1}+2y_iy_{i+1}}{(x_i-x_{i+1})^2} \\
\end{aligned}
$$

将上面两式相乘可以得到

$$
\begin{aligned}
x_{2i+1}x_P(x_i-x_{i+1})^4 &= [(1+x_ix_{i+1})(x_i+x_{i+1}) +2Ax_ix_{i+1}]^2-(2y_iy_{i+1})^2 \\
&= [(1+x_ix_{i+1})(x_i+x_{i+1}) +2Ax_ix_{i+1}]^2-4(x_i^3+Ax_i^2+x_i)(x_{i+1}^3+Ax_{i+1}^2+x_{i+1}) \\
&= ... \\
&= (x_i-x_{i+1})^2(x_ix_{i+1}-1)^2
\end{aligned}
$$

进而我们可以得到

$$
\begin{aligned}
x_{2i+1} &= \frac{(x_ix_{i+1}-1)^2}{x_P(x_i-x_{i+1})^2} \\
&= \frac{(\frac{X_iX_{i+1}}{Z_iZ_{i+1}}-1)^2}{\frac{X_P}{Z_P}(\frac{X_i}{Z_i}-\frac{X_{i+1}}{Z_{i+1}})^2} \\
&= \frac{Z_P(X_iX_{i+1}-Z_iZ_{i+1})^2}{X_P(X_iZ_{i+1}-Z_iX_{i+1})^2} \\
\end{aligned}
$$

从而我们可以得到递推式

$$
\begin{cases}
X_{2i+1} &= Z_P(X_iX_{i+1}-Z_iZ_{i+1})^2 \\
Z_{2i+1} &= X_P(X_iZ_{i+1}-Z_iX_{i+1})^2
\end{cases}
$$

其中 $x_P = \frac{X_P}{Z_P}$，我们可以直接令 $X_P = x_P, Z_P=1$。

可以发现我们对于上面的两种情况都不需要 $y$ 坐标的参与，因此我们可以直接将 $y$ 坐标丢弃。

接下来我们单独考虑各种地方出现无穷远点 $O$ 的情况，由于我们无法使用一个有限的坐标来表示无穷远点的情况，因此我们特别定义当 $X\ne 0$ 并且 $Z=0$ 的时候表示无穷远点。

幸运的是，上面得到的递推式恰好可以处理所有关于无穷远点 $O$ 的情况，关于这个结论的详细论证可以在[这篇文章][curve25519]的第 4.5 小节中找到，我懒得复制粘贴了。

## 代码实现

代码也懒得复制粘贴了，稍微说一点细节和原因，具体实现可以自己看[这篇文章][curve25519]。

关于一个高精度表示，总共用 16 个 long long，每一个 long long 对应 16 比特信息。使用 long long 来保存是为了不用每次加减法都要运算一次进位。因此在代码中可以看到加法和减法做完之后都不再进行进位的操作。

在做乘法的时候，直接使用 $O(n^2)$ 的算法两两相乘，最后加到数组中，值得注意的是，根据 $2^{256} a+b = (2p+38)a+b=38a+b \pmod p$ 知道，可以直接将超出 $2^{256}$ 的部分乘以 $38$ 之后直接加到低位中。乘法结束之后处理两次进位，防止下一次乘法溢出。

最后计算完毕之后进行三次进位操作，即可保证数组中的每个元素都落在 $[0, 2^{16}-1]$ 范围内。但这时候保存的数字的范围依旧是 $[0, 2^{256}-1]$，我们需要计算其在 $p$ 模域下的值，那么会有三种可能，分别是 $\{t, t-p, t-2p\}$。我们将 $t$ 依次减去 $p$，判断减法是否溢出，就可以知道取模的结果应该是三种情况中的哪一个。

最后关于 Montgomery Ladder 算法的具体实现，文章中给出了输入 $(a, b, c, d) = (X_i, X_{i+1}, Z_i, Z_{i+1})$，输出 $(a, b, c, d) = (X_{2i}, 4X_{2i+1}, Z_{2i}, 4Z_{2i+1})$ 的一套计算过程。如果我们要计算的是 $P_{2i+1}$ 和 $P_{2i+2}$ 的话只需要将算法输入中的 $a, b$ 和 $c, d$ 对调即可，即将输入变为 $(a, b, c, d) = (X_{i+1}, X_i, Z_{i+1}, Z_i)$，输出就会变成 $(a, b, c, d) = (X_{2i+2}, 4X_{2i+1}, Z_{2i+2}, 4Z_{2i+1})$，将输出的 $a, b$ 和 $c, d$ 再次对调就可以得到下一轮的输入格式。

计算完毕之后根据 $x_P = \frac{X_P}{Z_P} = X_P Z_P^{-1} \pmod p$ 计算出 $x_P$ 的值，就可以作为公钥，或者是 ECDH 的结果。

有没有可能公钥或者 ECDH 计算的结果是无穷远点 $O$ 呢？

根据私钥的范围我们可以知道 $a = 8(2^{251}+x) (x \in [0, 2^{251}-1])$，如果 $A=a \cdot G = O$，则我们可以知道 $q \mid a$，即 $q \mid 8(2^{251}+x)$。因为 $(q, 8) = 1, q \nmid 8$，故必须有 $q \mid 2^{251} + x$，但是由于 $q>2^{252}, 2^{251} \le 2^{251}+x < 2^{252}$，所以必然有 $q \nmid 2^{251} + x$，即合法的 X25519 公钥不可能是无穷远点 $O$。

同理，若 ECDH 计算的最终结果 $K = ab \cdot G = O$，则有 $q \mid ab$，即 $q \mid 64(2^{251}+x_1)(2^{251}+x_2)$。根据上述结论可以知道 $q \nmid 64, q\nmid 2^{251}+x_1, q \nmid 2^{251}+x_2$，故 $q \nmid 64(2^{251}+x_1)(2^{251}+x_2)$，因此 ECDH 结果也必然不会是无穷远点 $O$。

## あとがき

希望本文对各位在研究如何实现椭圆曲线加密的时候有所帮助。

[curve25519]: https://www.cl.cam.ac.uk/teaching/2122/Crypto/curve25519.pdf
