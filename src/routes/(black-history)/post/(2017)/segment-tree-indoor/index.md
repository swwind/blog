---
title: 线段树入门详解
---

# 线段树入门详解

<vue-metadata author="swwind" time="2017-03-12"></vue-metadata>

## 简介

线段树其实就是一个超级简单的数据结构。就是把一个序列搞出若干个区间，在询问和修改时改一下区间就行了。

比方说某节点表示 $[1, n]$ 的区间，那么该节点的左子树就表示 $[1, (n+1)/2]$ 的区间，右子树就表示 $[(n+1)/2+1, n]$ 的区间。然后每个节点维护一下该区间内的目标对象（sum、max等）就行了，这样可以在 $O(n^2)$ 的时间内建树，在 $O(\log(n))$ 的时间内完成查询操作。

注意到线段树是颗二叉树，所以每个节点的左儿子可以表示为 `x*2` (位运算简化为 `x<<1`)，右儿子为 `x*2+1`(`x<<1|1`)。注意在查询的时候如果要修改的刚好就是该节点的区间，那么可以为这个节点打一个flag（俗称Lazy标记），而不必把他下面的节点全部更新（不然是 $O(n)$ 的了）。

## 模板

下面就是模板了，但是希望大家先不看模板打一遍，再与模板校对并优化

先是每个节点的结构体：

```cpp
struct node{
	int l, r, sum, mx, lazy; // l, r: 左右边界，sum、mx: 最大值 lazy只是个标记
}tr[N<<2]; // 节点要开长度的四倍大小
```

建树：

```cpp
void build(int x, int l, int r){
	tr[x].l = l, tr[x].r = r;
	if(l == r){
		tr[x].sum = tr[x].mx = a[l];
		return;
	}
	int mid = tr[x].l + tr[x].r >> 1;
	build(x<<1, l, mid);
	build(x<<1|1, mid+1, r);
	push_up(x); // 更新x的值
}
```

然后是push_up的内容：

```cpp
void push_up(int x){
	tr[x].sum = tr[x<<1].sum + tr[x<<1|1].sum + a[x]; // 更新sum
	tr[x].mx = max(tr[x<<1].mx, tr[x<<1|1].mx); // 更新max
}
```

接着是查询：

```cpp
int asksum(int x, int l, int r){
	push_down(x); // 这步后来会讲到，下传标记
	if(tr[x].l == l && tr[x].r == r) return tr[x].sum;
	int mid = tr[x].l + tr[x].r >> 1;
	if(r <= mid) return asksum(x<<1, l, r); // 若果询问的区间明显在节点区间的左半边，那么去问节点的左子树
	if(l > mid) return asksum(x<<1|1, l, r); // 如果在右边就去问右子树
	return asksum(x<<1, l, mid) + asksum(x<<1|1, mid+1, r); // 不然两个都要问
}
int askmax(int x, int l, int r){ // 这个和上面一个基本一样
	push_down(x);
	if(tr[x].l == l && tr[x].r == r) return tr[x].mx;
	int mid = tr[x].l + tr[x].r >> 1;
	if(r <= mid) return askmax(x<<1, l, r);
	if(l > mid) return askmax(x<<1|1, l, r);
	return max(askmax(x<<1, l, mid), askmax(x<<1|1, mid+1, r));
}
```

然后是区间加的操作：

```cpp
void update(int x, int l, int r, int v){
	if(tr[x].l == l && tr[x].r == r){
		tr[x].lazy += val; // 这标记就是说，他的儿子都要加这么多，但是懒得算下去了
		tr[x].sum += val*(tr[x].r - tr[x].l + 1);
		tr[x].mx += val;
		return;
	}
	int mid = tr[x].l + tr[x].r >> 1;
	if(r <= mid) update(x<<1, l, r, val);
	else if(l > mid) update(x<<1|1, l, r, val);
	else update(x<<1, l, mid, val), update(x<<1|1, mid+1, r, val);
	push_up(x); // 更新x的值
}
```

然后就是标记下传啦！

```cpp
void push_down(int x){
	if(!tr[x].lazy) return; // 没有标记就返回
	if(tr[x].l){ // 有左儿子
		tr[tr[x].l].lazy += tr[x].lazy;
		tr[tr[x].l].sum += tr[x].lazy*(tr[x].r - tr[x].l + 1);
		tr[tr[x].l].mx += tr[x].lazy;
	}
	if(tr[x].r){ // 有右儿子
		tr[tr[x].r].lazy += tr[x].lazy;
		tr[tr[x].r].sum += tr[x].lazy*(tr[x].r - tr[x].l + 1);
		tr[tr[x].r].mx += tr[x].lazy;
	}
	tr[x].lazy = 0;
}
```

## 最后

看完了之后就有一大波水题在等着你！

就算看不懂照题解多打几遍慢慢就懂了的！

刷题才是王道！

GL&HF
