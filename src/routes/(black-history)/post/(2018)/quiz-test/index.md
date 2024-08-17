---
title: 问卷测试
---

# 问卷测试

<vue-metadata author="swwind" time="2018-06-06"></vue-metadata>

~~我是不是要成为万年不更博客的博主了~~

来做一些奇怪的测试题

---

我永远喜欢？

- <input type="checkbox" /> Isaac Newton
- <input type="checkbox" /> Albert Einstein
- <input type="checkbox" /> <span class="correct">ゼロツー</span>
- <input type="checkbox" /> <span class="correct">雪ノ下 雪乃</span>

---

我最喜欢喝什么？

- <input type="radio" name="drink" /> <span class="correct">农夫山泉</span>
- <input type="radio" name="drink" /> 可口可乐
- <input type="radio" name="drink" /> 雪碧
- <input type="radio" name="drink" /> 不明<span class="opacity-0">乳白色</span>液体

---

方伯伯怎么了？

- <input type="checkbox" /> <span class="correct">起来了</span>
- <input type="checkbox" /> 走了
- <input type="checkbox" /> 睡了
- <input type="checkbox" /> <span class="correct">AK 了</span>

---

人在做，谁在看？

- <input type="radio" name="looking" /> 天在看
- <input type="radio" name="looking" /> <span class="correct">YX 在看</span>
- <input type="radio" name="looking" /> 花在看
- <input type="radio" name="looking" /> 老大在看

---

谁走我就走？

- <input type="radio" name="run" /> GAY 铭
- <input type="radio" name="run" /> GAY 泽
- <input type="radio" name="run" /> 方将军
- <input type="radio" name="run" /> <span class="correct">大峥哥</span>
- <input type="radio" name="run" /> 饿死

---

我经常去几楼食堂吃饭？

- <input type="radio" name="shokudou" /> 一楼
- <input type="radio" name="shokudou" /> <span class="correct">二楼</span>
- <input type="radio" name="shokudou" /> 小卖部

---

我玩过（碰过不算）？

- <input type="checkbox" /> <span class="correct">GTA 5</span>
- <input type="checkbox" /> 屁股
- <input type="checkbox" /> 吃鸡
- <input type="checkbox" /> 彩⑥
- <input type="checkbox" /> 炉石
- <input type="checkbox" /> 星际
- <input type="checkbox" /> 魔兽
- <input type="checkbox" /> 以撒
- <input type="checkbox" /> <span class="correct">MC</span>
- <input type="checkbox" /> 泰拉瑞亚
- <input type="checkbox" /> 饥荒
- <input type="checkbox" /> <span class="correct">\*.io</span>

---

我经常去的网站（或应用）？

- <input type="checkbox" /> <span class="correct">Twitter</span>
- <input type="checkbox" /> Facebook
- <input type="checkbox" /> <span class="correct">GitHub</span>
- <input type="checkbox" /> <span class="correct">Telegram</span>
- <input type="checkbox" /> Google+
- <input type="checkbox" /> Tencent TIM
- <input type="checkbox" /> ~~琉璃神社~~
- <input type="checkbox" /> <span class="correct">Steam</span>

---

Microsoft killed?

- <input type="checkbox" /> <span class="correct">rare</span>
- <input type="checkbox" /> <span class="correct">skype</span>
- <input type="checkbox" /> <span class="correct">netscape</span>
- <input type="checkbox" /> <span class="correct">nokia</span>
- <input type="checkbox" /> <span class="correct">minecraft</span>
- <input type="checkbox" /> <span class="correct">github</span>

---

<script setup>
const show = () => {
  document.querySelectorAll('.correct')
    .forEach(x => x.style.color = 'lime');
}
</script>

<button v-on:click="show" class="underline">显示答案</button>

> If you want to keep a secret, you must also hide it from yourself.

~~Powered by [hexo-helper-quiz](https://github.com/swwind/hexo-helper-quiz).~~ Powered by myself.
