---
title: "Codeforces Round #357 (Div. 2) 题解"
---

# Codeforces Round #357 (Div. 2) 题解

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata
  author="swwind"
  time="2017-10-10"
  tags="javascript,python,java,codeforces"
/>

# 前言

今天吃着空，和同学打了一场 Codeforces。
然后我吃着更空，还想写一写题解。
~~毕竟好久没更题解了~~

# A. A Good Contest

## 题意概述

给你 $n$ 个人打某场 Codeforces 前后 Rating 的变化，问你是否有原来就是红名的 dalao 涨分了。
红名的 Rating 大于等于 2400 。

## 思路

小学题

## 代码

### C++

```cpp
#include <bits/stdc++.h>
#define N 100020
#define ll long long
using namespace std;
inline int read(){
	int x=0,f=1;char ch=getchar();
	while(ch>'9'||ch<'0')ch=='-'&&(f=0)||(ch=getchar());
	while(ch<='9'&&ch>='0')x=(x<<3)+(x<<1)+ch-'0',ch=getchar();
	return f?x:-x;
}
int main(int argc, char const *argv[]) {
	int n = read();
	string str;
	for (int i = 1; i <= n; i++) {
		cin >> str;
		int x = read(), y = read();
		if (x >= 2400 && y > x)
			return puts("YES")&0;
	}
	puts("NO");
	return 0;
}
```

### Java

```java
import java.io.*;
import java.util.*;

public class Main {
	public static void main(String[] args) {
		Scanner scan = new Scanner(System.in);
		int n = scan.nextInt();
		for (int i = 1; i <= n; i++) {
			String str = scan.next();
			int x = scan.nextInt();
			int y = scan.nextInt();
			if (x >= 2400 && y > x) {
				System.out.println("YES");
				scan.close();
				return;
			}
		}
		System.out.println("NO");
		scan.close();
	}
}
```

### JavaScript

```javascript
(function () {
  var n = parseInt(readline());

  for (var i = 1; i <= n; i++) {
    var s = readline().split(" "),
      x = parseInt(s[1]),
      y = parseInt(s[2]);

    if (x >= 2400 && y > x) return print("YES");
  }
  print("NO");
})();
```

### Python 3

```python
n = int(input())
i = 1
while i <= n:
	s, x, y = input().split(' ')
	x = int(x)
	y = int(y)
	if (x >= 2400) and (y > x):
		print('YES')
		exit(0)
	i = i+1
print('NO')
```

### 速度比较

**由于本人没有多次试验取平均值，所以试验结果并不可靠，不过可以凑活着比一下**

| language   |   Time |
| ---------- | -----: |
| C++        |  31 ms |
| Java       | 140 ms |
| JavaScript |  31 ms |
| Python 3   |  62 ms |

可以看出， Java 目前是跑的最慢的。
JavaScript 与 C++ 平分秋色。
Python 3 则介于两者中间。

总结完毕，我们来看下一题。

# B. Economy Game

## 题意概述

给你一个数 $n$，询问是否有一个三元组 $(a, b, c)$ 满足 $1234567*a + 123456*b + 1234*c = n$。

## 思路

暴力枚举即可。

## 代码

### C++

```cpp
#include <bits/stdc++.h>
#define N 100020
#define ll long long
using namespace std;
inline int read(){
	int x=0,f=1;char ch=getchar();
	while(ch>'9'||ch<'0')ch=='-'&&(f=0)||(ch=getchar());
	while(ch<='9'&&ch>='0')x=(x<<3)+(x<<1)+ch-'0',ch=getchar();
	return f?x:-x;
}
int main(int argc, char const *argv[]) {
	ll n = read();
	for (ll a = 0; a <= n; a += 1234567)
		for (ll b = 0; b+a <= n; b += 123456) {
			if ((n-a-b) % 1234 == 0)
				return puts("YES")&0;
		}
	puts("NO");
	return 0;
}
```

### Java

```java
import java.io.*;
import java.util.*;
public class Main {
	public static void main(String[] args) {
		Scanner scan = new Scanner(System.in);
		int n = scan.nextInt();
		scan.close();
		for (int a = 0; a <= n; a += 1234567)
			for (int b = 0; a + b <= n; b += 123456)
				if ((n - a - b) % 1234 == 0) {
					System.out.println("YES");
					return;
				}
		System.out.println("NO");
	}
}
```

### JavaScript

```javascript
(function () {
  var n = 1 * readline();
  for (var a = 0; a <= n; a += 1234567)
    for (var b = 0; a + b <= n; b += 123456)
      if ((n - a - b) % 1234 === 0) return print("YES");
  print("NO");
})();
```

### Python 3

```python
n = int(input())
a = 0
while a <= n:
	b = 0
	while a + b <= n:
		if (n - a - b) % 1234 == 0:
			print('YES')
			exit(0)
		b += 123456
	a += 1234567
print('NO')
```

### 比较

速度

| Language   |   Time |
| ---------- | -----: |
| C++        |  15 ms |
| Java       | 139 ms |
| JavaScript |  31 ms |
| Python 3   |  77 ms |

C++ 的优势逐渐显现了出来。
~~我估计 Java 快要萎掉了~~

这题就这样解决了，再来看下一题。

# C. Heap Operations

## 题意概述

有一个小根堆，给你$n$个操作，要你在中间插入几个操作，使得所有的 `getMin` 操作都正确并且所有的 `removeMin` 操作都不会出错（比如给一个空集执行 `removeMin` ）。

## 思路

贪心。

`insert x` 操作不需要处理。
`getMin x` 操作需要把堆中所有小于$x$的元素弹出，如果堆是空或者最小值不是$x$需要`insert x`。
`removeMin` 操作只需要单独判断一下堆是否为空即可。

手写一个堆是不存在的。

## 代码

### C++

```cpp
#include <bits/stdc++.h>
#define N 100020
#define ll long long
using namespace std;
inline int read(){
	int x=0,f=1;char ch=getchar();
	while(ch>'9'||ch<'0')ch=='-'&&(f=0)||(ch=getchar());
	while(ch<='9'&&ch>='0')x=(x<<3)+(x<<1)+ch-'0',ch=getchar();
	return f?x:-x;
}
vector<pair<int, int>> ans;
priority_queue<int, vector<int>, greater<int>> q;
string str;
int main(int argc, char const *argv[]) {
	int n = read();
	for (int i = 1; i <= n; i++) {
		cin >> str;
		if (str == "removeMin") {
			if (!q.size()) {
				ans.push_back(make_pair(1, 1));
			} else {
				q.pop();
			}
			ans.push_back(make_pair(3, 0));
		} else if (str == "insert") {
			int x = read();
			q.push(x);
			ans.push_back(make_pair(1, x));
		} else if (str == "getMin") {
			int x = read();
			while (q.size() && q.top() < x) {
				q.pop();
				ans.push_back(make_pair(3, 0));
			}
			if (!q.size() || q.top() != x) {
				q.push(x);
				ans.push_back(make_pair(1, x));
			}
			ans.push_back(make_pair(2, x));
		}
	}
	cout << ans.size() << endl;
	for (auto x : ans) {
		if (x.first == 1)
			cout << "insert " << x.second << endl;
		else if (x.first == 2)
			cout << "getMin " << x.second << endl;
		else
			cout << "removeMin" << endl;
	}
	return 0;
}
```

### Java

Java 光荣的 TLE 了。
我实在卡不了常数了。

```java
import java.io.*;
import java.util.*;

public class Main {
	public PriorityQueue <Integer> que = new PriorityQueue <> ();
	public int op[] = new int[1000020];
	public int vl[] = new int[1000020];
	public int cnt = 0;
	public Scanner scan;
	public Main (Scanner scan) {
		this.scan = scan;
	}
	public void work() {
		int n = scan.nextInt();
		for (int i = 1; i <= n; i++) {
			String str = scan.next();
			if (str.equals("removeMin")) {
				if (que.size() == 0) {
					op[++cnt] = 1;
					vl[cnt] = 233;
				} else {
					que.poll();
				}
				op[++cnt] = 3;
			} else if (str.equals("getMin")) {
				int x = scan.nextInt();
				while (que.size() > 0 && que.peek() < x) {
					que.poll();
					op[++cnt] = 3;
				}
				if (que.size() == 0 || que.peek() != x) {
					que.add(x);
					op[++cnt] = 1;
					vl[cnt] = x;
				}
				op[++cnt] = 2;
				vl[cnt] = x;
			} else if (str.equals("insert")) {
				int x = scan.nextInt();
				que.add(x);
				op[++cnt] = 1;
				vl[cnt] = x;
			}
		}
		scan.close();
		System.out.println(cnt);
		for (int i = 1; i <= cnt; i++) {
			if (op[i] == 1)
				System.out.println("insert " + vl[i]);
			else if (op[i] == 2)
				System.out.println("getMin " + vl[i]);
			else
				System.out.println("removeMin");
		}
	}
	public static void main(String[] args) {
		Main main = new Main(new Scanner(System.in));
		main.work();
	}
}
```

### JavaScript

JavaScript 不存在 PriorityQueue。
所以代码也是不存在的。

### Python 3

我不会用 heapq 亦或者 PriorityQueue。
所以就放过我吧 (っ TωT)っ

### 比较

| Language   |     Time |
| ---------- | -------: |
| C++        |   904 ms |
| Java       | 1000+ ms |
| JavaScript |      --- |
| Python 3   |      --- |

至此我们说明 C++ 是跑的最快的一门语言。

~~Java 开和 C++ 一样的时限是要闹怎样啊。。。~~

# D. Gifts by the List

## 题意概述

有$n$个人和$m$个父子关系，每个人都有想把礼物送给$a_i$的欲望，但是他必须把礼物送给你给出的一张名单中自上而下第一个是他的祖先的人。如果这个人不是他想送出礼物的人，他就会变得很不开心。问你有没有一个能让所有人开心的名单。没有输出 `-1` 。

## 思路

先 %%% lbc dalao 给我提供了思路。

![momomo](/assets/momomo.gif)

每个人只有把礼物送给他自己或者他爸爸或者他爸爸送给的人才能保证不冲突。
这样连边然后拓扑排序一波就搞定了。

## 代码

```cpp
#include <bits/stdc++.h>
#define N 400020
#define ll long long
using namespace std;
inline int read(){
	int x=0,f=1;char ch=getchar();
	while(ch>'9'||ch<'0')ch=='-'&&(f=0)||(ch=getchar());
	while(ch<='9'&&ch>='0')x=(x<<3)+(x<<1)+ch-'0',ch=getchar();
	return f?x:-x;
}
int to[N], head[N], nxt[N], init[N], cnt, q[N];
void insert(int x, int y) {
	to[++cnt] = y;
	nxt[cnt] = head[x];
	head[x] = cnt;
	init[y]++;
}
int fa[N], wt[N], used[N], ans;
vector<int> son[N];
void dfs(int x) {
	int y = fa[x], z = wt[y];
	if (y) {
		if (wt[x] != z && wt[x] != y && wt[x] != x)
			exit(puts("-1") & 0);
		if (wt[x] == y)
			insert(y, x);
		else if (wt[x] == z)
			insert(z, x);
		else if (wt[x] == x)
			insert(x, z);
	} else {
		if (wt[x] != x)
			exit(puts("-1") & 0);
	}
	for (auto s : son[x])
		dfs(s);
}
int main(int argc, char const *argv[]) {
	int n = read(), m = read();
	for (int i = 1; i <= m; i++) {
		int x = read(), y = read();
		son[x].push_back(y);
		fa[y] = x;
	}
	for (int i = 1; i <= n; i++) {
		wt[i] = read();
		if (!used[wt[i]]) {
			ans ++;
			used[wt[i]] = 1;
		}
	}
	for (int i = 1; i <= n; i++)
		if (!fa[i]) dfs(i);
	int l = 0, r = 0;
	for (int i = 1; i <= n; i++)
		if (!init[i]) q[++r] = i;
	printf("%d\n", ans);
	while (l < r) {
		int x = q[++l];
		if (used[x])
			printf("%d\n", x);
		for (int i = head[x]; i; i = nxt[i])
			if (!--init[to[i]]) q[++r] = to[i];
	}
	return 0;
}
```

因为代码太长了，所以 Java 、 JavaScript 和 Python 3 就不打了。~~其实就是懒~~

因此代码速度的比较也是不存在的。

# E. Runaway to a Shadow

计算几何？<span class="meiryo">さようなら。</span>
