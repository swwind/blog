---
title: 王强路的模拟赛 T2 haiku
---

# 王强路的模拟赛 T2 haiku

<vue-metadata author="swwind" time="2017-09-16"></vue-metadata>

## 题面

给定一个长度为 $N$ 的序列 $a$，序列中的每个数都可以是 $1 \sim 10$ 中的某一个，总共有 $10^N$ 种序列，现在给出 $N,X,Y,Z$，问有多少个长度为$N$的序列满足其有四个下标 $x,y,z,w$ 使得

- $a[x]+a[x+1]+...+a[y-1]=X$
- $a[y]+a[y+1]+...+a[z-1]=Y$
- $a[z]+a[z+1]+...+a[w]=Z$

## Sample Input

```
3 5 7 5
```

## Sample Output

```
1
```

## 样例解释

在这组样例中，只存在一组合法的序列，即 $a = [5,7,5]$。

## 数据范围

$3 \le N \le 40$。

$1 \le X \le 5$，$1 \le Y \le 7$，$1 \le Z \le 5$。

## 题解

神题。。首先膜拜[zyy大佬](http://blog.csdn.net/zhouyuyang233/)用AC自动机水了此题。

![momomo](/assets/momomo.gif)

~~P.S.王强路应该不会说什么的对吧~~

直接说正解吧。。

很容易想到的方法枚举所有成立的序列 $a[x],a[x+1],a[x+2],...,a[z-1],a[z]$，然后计算其余位数随便取的方案数就行了。

但这样会有重复的出现。

注意到 $n$、$x$、$y$、$z$ 都很小，于是我们可以从第一位开始 dfs 枚举每一位取什么。

如果以当前位为 $z$，前面有符合条件的 $x$ 和 $y$ 的话，就可以直接加上后面几位随便取的方案数并返回。

这样就不会有重复计算的了。

那么问题就在于如何快速地算出有没有符合条件的 $x$、$y$、$z$ 了。

标算提供了一种状压的思路。

我们可以用`"1"`来代替1，`"10"`来代替2，`"100"`来代替3，以此类推。

拿样例 $x=5,y=7,z=5$ 来说，这样替换一个符合条件的数组 `[2, 3, 2, 5, 1, 4]` 即为 `"10100101000011000"`。

而 $xyz$ 组成的数组替换后即为`"10000100000010000"`。

可以注意到，两个 01 串的 `&` 值即为 $xyz$ 组成的 01 串。

$$
\begin{array}
{}&{10100101000011000}\\
{\&}&{10000100000010000}\\
\hline
{}&{10000100000010000}
\end{array}
$$

这样就可以愉快地在$O(1)$的时间里判断是否满足条件啦。
具体可以看我程序。
![inline](/assets/huaji.png)

```cpp
#include "bits/stdc++.h"
#define mod 1000000007
using namespace std;
inline int read(){
	int x=0,f=1;char ch=getchar();
	while(ch>'9'||ch<'0')ch=='-'&&(f=0)||(ch=getchar());
	while(ch<='9'&&ch>='0')x=(x<<3)+(x<<1)+ch-'0',ch=getchar();
	return f?x:-x;
}
int f[41][1<<17], p[41];
int n, z, y, x, end_state;
int dfs(int i, int j){
	if (i == n) return 0;
	if (~f[i][j]) return f[i][j];
	long long res = 0;
	for (int k = 1; k <= 10; k++) {
		int next_state = (j << k) | (1 << k-1);
		res += ((next_state & end_state) == end_state)
			? p[n-i-1] : dfs(i+1, next_state & ((1 << x+y+z) - 1));
	}
	return f[i][j] = res%mod;
}
int main(int argc, char const *argv[]){
	freopen("haiku.in", "r", stdin);
	freopen("haiku.out", "w", stdout);
	memset(f, -1, sizeof(int)*5373952);
	n = read(); x = read(); y = read(); z = read(); p[0] = 1;
	for (int i = 1; i <= 40; i++) p[i] = p[i-1]*10ll%mod;
	end_state = (1 << x+y+z-1) | (1 << y+z-1) | (1 << z-1);
	printf("%d\n", dfs(0, 0));
	return 0;
}
```
