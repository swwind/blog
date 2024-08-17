---
title: "Codeforces Round #439 (Div. 2) 题解"
---

# Codeforces Round #439 (Div. 2) 题解

<vue-metadata author="swwind" time="2017-10-11" tags="codeforces,javascript,python"></vue-metedata>

## 前言

吃着空写写水题题解。
大佬就不要看了。

P.S. 我发现同样一份代码打四遍是在浪费时间，所以这次每题只放一份代码。

## A. The Artful Expedient

### 题意概述

给你两个数组，问你所有满足 `x[i] ^ y[j] == x[k]` 或者 `x[i] ^ y[j] == y[k]` 的数对$(i, j)$的数量的奇偶性。

奇数输出`Koyomi`，偶数输出`Karen`。

### 思路

emmmmmm......
其实只要能找到一个$(i, j)$，那么$(i, k)$或者$(k, j)$也是满足条件的。
所以一定是偶数。直接输出`Karen`就行了。

### 代码

**php**

```php
Karen
```

## B. The Eternal Immortality

### 题意概述

求 $\Pi^b_{i=a}\pmod{10}$

### 思路

暴力求。
当答案是 $0$ 之后就直接跳出好了。

### 代码

**python**

```python
a, b = map(int, input().split(' '))
c = 1
a += 1
while a <= b :
	c = c * a % 10
	a += 1
	if c == 0 :
		break
print(c)
```

## C. The Intriguing Obsession

### 题意概述

有三种颜色的岛。
每种颜色的岛之间要么没有路，要么最短路大于等于 $3$。
输出方案数，对 $998,244,353$ 取模。

### 思路

考虑每两种岛之间连边。
根据题目条件，每个岛要么连一条向另一种颜色的边，要么不连。
这就是一个组合数问题了。
然后总方案数就是三种颜色的岛两两计算的乘积了。

### 代码

**python**

```python
a, b, c = map(int, input().split(' '))
p = 998244353

def calc (a, b) :
	if a > b:
		a, b = b, a
	ans = 0
	tmp = 1
	for i in range(a + 1):
		ans = (ans + tmp) % p
		tmp = tmp * (a - i) * (b - i) * pow(i + 1, p - 2, p) % p
	return ans

ans = calc(a, b) * calc(b, c) * calc(a, c) % p

print(ans)
```

## ~~D. The Overdosing Ubiquity~~

不会

## E. The Untended Antiquity

### 题意概述

平面内，每次让你删除一个矩形或者添加一个矩形，或者询问两个点 $(x_1, y_1), (x_2, y_2)$ 能否不跨越矩形的边到达。

**保证矩形不会重叠**

### 思路

直接上二维树状数组，要有信仰。

### 代码

**JavaScript**

```javascript
(function () {
  var f = new Array();
  for (var i = 1; i <= 2520; i++) f[i] = new Array(2521).join(0).split("");
  var str = readline().split(" "),
    n = +str[0],
    m = +str[1],
    k = +str[2],
    cnt = 0;
  var add = function (a, b, v) {
    for (var i = a; i <= n; i += i & -i)
      for (var j = b; j <= m; j += j & -j) f[i][j] = +f[i][j] + v;
  };
  var ask = function (a, b) {
    var ans = 0;
    for (var i = a; i; i ^= i & -i)
      for (var j = b; j; j ^= j & -j) ans += +f[i][j];
    return ans;
  };
  var update = function (a, b, c, d, e) {
    add(a, b, e);
    add(a, d + 1, -e);
    add(c + 1, b, -e);
    add(c + 1, d + 1, e);
  };
  var hash = function (a, b, c, d) {
    return a * b * c * d;
  };
  while (k--) {
    var line = readline().split(" "),
      op = +line[0],
      x1 = +line[1],
      y1 = +line[2],
      x2 = +line[3],
      y2 = +line[4],
      id = hash(x1, y1, x2, y2);
    if (op == 1) {
      update(x1, y1, x2, y2, id);
    } else if (op == 2) {
      update(x1, y1, x2, y2, -id);
    } else {
      print(ask(x1, y1) === ask(x2, y2) ? "Yes" : "No");
      // print(ask(x1, y1))
      // print(ask(x2, y2))
    }
  }
})();
```

## 总结

AB 送分，C 题有一定的思维难度，D 题不会，E 题没读清题面导致傻掉。

总体来讲还行。

这场就这样吧。
