---
title: 向下兼容是一种怎么样的体验
---

# 向下兼容是一种怎么样的体验

<vue-metadata author="swwind" time="2018-03-01"></vue-metadata>

前几天同学托我用 PHP 写一个论坛。

首先正常人应该都会想到去 github 上找现成的对吧。

但是后来发现找到的能支持 PHP 5.3 的模板几乎没有。

于是本人只好手写。

鉴于本人长期积累的<s>颓废</s>开发经验，前端不成问题。

后端由于服务商限制，我只能用 PHP。

数据库什么的我不会。那么就直接在服务器上用 `.log` 文件来保存吧。

毕竟我只对 json 方面的数据存储比较熟。

经过近一两个星期的爆肝<s>颓废</s>开发，基本功能算是写好了。

然后扔到服务器上，返回了如下信息：

```text
Parse error: syntax error, unexpected '(' in /www/users/yangwanlt.club/index.php on line 75
```

我一看源代码：

![img1](/assets/xxjrsyzzmydty1.png)

好吧算我输，我 JavaScript 写多了。

那我把里面的东西改成一个 `array` 定义再用 `__invoke()` 调用就行了吧？

改完之后再上传了一发，返回了如下信息：

```text
Parse error: syntax error, unexpected '[' in /www/users/yangwanlt.club/Route.php on line 24
```

这是说数组都不能用 `[]` 来定义么。。。

然后我在网上看到了这个。

![img2](/assets/xxjrsyzzmydty2.png)

也就是说他们的 PHP 版本已经小于 5.4 了么。。。

那我强行改成 `array()` 来定义总行了吧。

然后又返回了错误信息：

```text
Parse error: syntax error, unexpected T_FUNCTION in /www/users/yangwanlt.club/routes.php on line 3
```

这是说我连匿名函数都不能用了？

然后我去翻文档，发现官方是这么说的：

![img3](/assets/xxjrsyzzmydty3.png)

也就是说服务商的 PHP 连 5.3 都没有？？？

不能用匿名函数写个毛线啊。

最后查出来发现是 PHP 5.2.175.2.17。

WTF。。。

---

> 我要回前端去了，我受不这些语法错误了，PHP 社区如果觉得有人能用 5.2 开发，那这个社区就是疯了。
>
> > 我理解你，你应该去看看 **Discuz!** 社区。
>
> 为什么？
>
> > 你听说过 PHP7 吗？
