---
title: HTML5 游戏初探
---

# HTML5 游戏初探

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata author="swwind" time="2018-8-1" tags="javascript">
</vue-metadata>

尝试写一个类似 [diep.io](https://diep.io) 的 HTML5 多人在线游戏？

> HTML5 是什么？兼容性怎么样？

HTML5 早在 2014 年就已问世。
目前来讲，所有的主流浏览器都支持 HTML5 的语法了。
所以我们大可不必担心兼容性问题。

<p>
  <span class="truth" title="你知道的太多了">
    {"其实我们只用一个 canvas 就行了"}
  </span>
</p>

> 为什么选择 HTML5 而不是 flash 或 unity 呢？

HTML5 不需要用插件，也不会有跨平台问题。
flash 已经逐渐被埋没了。

> HTML5 是编程语言吗？怎么用它写游戏？

**不是。**

<figure>
  <img src="/assets/html5.jpg" />
  <figcaption>事实的真相</figcaption>
</figure>

# 依赖项目

- [pixi.js](http://www.pixijs.com/) 用来绘制游戏画面
- [socket.io](https://socket.io) 用来服务端与客户端之间通信，基于 WebSocket 技术

\* _上面两个项目可以手写，但是直接用现成的可以方便很多_

# 逻辑框架

MVC 框架相信大家就算不知道，也肯定有所耳闻。
虽然这是个 50 多年前就提出的框架，但是依旧有参考价值。

MVC 是指 **M**odel(模型)、**V**iew(视图) 以及 **C**ontroller(控制器)

## Model(模型)

建模是肯定要建的。

考虑一下我们要保存什么。

- 地图
  - 宽(width)和高(height)
  - 每个格子的具体方块([[int]])
- 玩家
  - 每个玩家一个唯一 id 用来识别身份(hash)
  - 横纵坐标(vector)
  - 目前的移动方向（速度）(vector)
- 子弹
  - 由谁射出（确保不会伤害到自己）(hash)
  - 横纵坐标和移动方向(vector)

其他的慢慢添加。

## View(视图)

用户层面，将从服务器接收的数据显示给用户。

这里我们使用 pixi.js 简化开发过程。

具体过程请参考 [pixi.js 简体中文教程](https://github.com/Zainking/learningPixi)，本文不再赘述。

## Controller(控制器)

`window.addEventListener` 监听按键和鼠标事件即可。
每次移动方向有变化就向服务器发送一次数据。

取消右键菜单 `document.oncontextmenu = (e) => false;`。

# 具体分配工作

- **游戏的逻辑全部在服务端运行**

  包括玩家移动、子弹伤害、碰撞检测等内容，全部在服务端实现。
  客户端只需要传回控制事件即可。
  这一点非常重要。
  不然很容易作弊（直接瞬移）。

- **定时广播**

  服务端每隔 1000/60ms 进行一次计算，并且将全部数据广播到客户端，由客户端向用户显示。
  1000/60ms 可以保证有 60fps 的帧率。

# 可能遇到的坑

1. **socket.io 无法直接发送 Map 对象？**

   socket.io 内部是使用 WebSocket 的。
   由于它需要支持传送 JavaScript Object，就只能先将其转变成 JSON 再发送。
   然而 Map Object 好像不支持 `JSON.stringify`（返回 `“{}”`）。
   那么我们只能这么写：

   ```js
   // server
   socket.emit("update", Array.from(players));

   // client
   socket.on("update", (_players) => {
     const players = new Map(_players);
   });
   ```

2. **蜜汁卡顿？**

   那就卡顿吧，修不好的。

3. **写到一半放弃梦想？**

   那就放弃了吧。

# 我的成果

[swwind/ctanet](https://bitbucket.org/swwind/ctanet) <span class="truth">权限是不可能给的，这辈子都不可能给的</span>

![shiina-mashiro](/assets/shiina-mashiro.jpg)
