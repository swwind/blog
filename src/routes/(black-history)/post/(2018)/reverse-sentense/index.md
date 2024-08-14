---
title: 翻转字符串！
---

# 翻转字符串！

<vue-metadata author="swwind" time="2018-4-11" tags="jQuery,React,Vue"></vue-metadata>

~~突然想水博客~~

今天在网易云上看到这样一个评论：

> ¡ǝɹɐ noʎ oɥʍ ʍouʞ uɐɔ I os uoʇʇnq ǝɥʇ ʞɔı̣lɔ uɐɔ noʎ 'ƃuǝʇuɐpǝpuɐı̣x lǝǝɟ oslɐ noʎ ʇɐɥʇ suɐǝɯ ǝƃɐssɐd sı̣ɥʇ pɐǝɹ uɐɔ noʎ ɟı̣ 'ǝƃɐssɐd sı̣ɥʇ uı̣ ƃuı̣ɥʇǝɯos noʎ llǝʇ oʇ ǝʌɐɥ I :ɹɐǝp ʎɯ

看起来是不是很酷？

那我们就试着来写一个这样的一个翻译器。

用什么写呢？

<figure>
  <img src="https://cdn.vijos.org/file/059e249ee4ab1314ac1f786ec5cee3e9fb164709" />
  <figcaption>一张用来搞笑的图</figcaption>
</figure>

那我们就用上边提到的三样东西都写一遍，做一下对比。

首先一张表是一定要打的啦。

```javascript
const trans = {
  a: "ɐ",
  b: "q",
  c: "ɔ",
  d: "p",
  e: "ǝ",
  f: "ɟ",
  g: "ƃ",
  h: "ɥ",
  i: "ı",
  j: "ɾ",
  k: "ʞ",
  l: "l",
  m: "ɯ",
  n: "u",
  o: "o",
  p: "d",
  q: "b",
  r: "ɹ",
  s: "s",
  t: "ʇ",
  u: "n",
  v: "ʌ",
  w: "ʍ",
  x: "x",
  y: "ʎ",
  z: "z",
  "!": "¡",
  "&": "⅋",
  _: "‾",
  "?": "¿",
  A: "∀",
  B: "q",
  C: "Ɔ",
  D: "p",
  E: "Ǝ",
  F: "Ⅎ",
  G: "פ",
  H: "H",
  I: "I",
  J: "ſ",
  K: "ʞ",
  L: "˥",
  M: "W",
  N: "N",
  O: "O",
  P: "Ԁ",
  Q: "Q",
  R: "ɹ",
  S: "S",
  T: "┴",
  U: "∩",
  V: "Λ",
  W: "M",
  X: "X",
  Y: "⅄",
  Z: "Z",
  9: "6",
  6: "9",
  7: "ㄥ",
  3: "Ɛ",
  ",": "`",
  "]": "[",
  "[": "]",
  "(": ")",
  ")": "(",
  "}": "{",
  "{": "}",
  "\\": "/",
  "/": "\\",
  "<": ">",
  ">": "<",
  "`": ",",
};
String.prototype.reverse = function () {
  return [...this]
    .reverse()
    .map((c) => trans[c] || c)
    .join([]);
};
```

### jQuery 大法

首先就用我最早接触的 jQuery 啦 ( • ̀ω•́ )✧

简短而不失风度。

```javascript
$("#jquery textarea").on("input", (e) => {
  let elem = $(e.currentTarget);
  elem.next().text(elem.val().reverse());
});
```

```html
<div id="jquery">
  <p><b>jQuery Demo</b></p>
  <textarea></textarea>
  <div id="jquery-result"></div>
</div>
<!-- cdn -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
```

### React 大法

接着我们来用用一个灰常好的框架：React。

你也不需要做太多的事情。

~~无视高亮~~

```jsx
class Reverser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
    };
  }
  handle() {
    this.setState({
      text: this.refs.input.value,
    });
  }
  render() {
    return (
      <div>
        <p>
          <b>React Demo</b>
        </p>
        <textarea onChange={this.handle.bind(this)} ref="input"></textarea>
        <div>{this.state.text.reverse()}</div>
      </div>
    );
  }
}

ReactDOM.render(<Reverser />, document.getElementById("react-demo"));
```

```html
<div id="react-demo"></div>
<!-- 下面素质三连 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/16.4.0-alpha.0911da3/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.4.0-alpha.0911da3/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.0.0-beta.3/babel.min.js"></script>
```

### Vue 大法

没听说过 Vue？
洛谷的前端似乎就是用 Vue 写的。

<p>
  <span class="truth" title="你知道的太多了">
    {"所以洛谷的 UI 经常会爆炸"}
  </span>
</p>

```javascript
var vuedemo = new Vue({
  el: "#vue-demo",
  data: {
    result: "",
  },
  methods: {
    handle: function (e) {
      this.result = e.srcElement.value.reverse();
    },
  },
});
```

```html
<div id="vue-demo">
  <p><b>Vue Demo</b></p>
  <textarea v-on:input="handle"></textarea>
  <div v-text="result"></div>
</div>
<!-- cdn -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17-beta.0/vue.min.js"></script>
```

### 对比

数字均为越小越好。

| 项目   | js 代码长度 | html 代码长度 | 依赖大小 |
| ------ | ----------- | ------------- | -------- |
| jQuery | 1           | 2             | 87KB     |
| React  | 3           | 1             | 1.15MB   |
| Vue    | 2           | 2             | 86KB     |

~~事实证明，jQuery 还是很不错的。~~

但是 jQuery 太好破解了。

~~看看人家 BZOJ，用户名合法性验证写在前端，中文 ID 随便注册~~

经过打包压缩后的 React 可不这么容易破解。
