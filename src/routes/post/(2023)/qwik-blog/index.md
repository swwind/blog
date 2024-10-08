---
title: 使用 Qwik City 快速搭建一个博客
---

# 使用 Qwik City 快速搭建一个博客

<vue-metadata author="swwind" time="2023-3-5"></vue-metadata>

[Qwik](https://qwik.builder.io) 是最近刚刚开始流行的新型前端框架，而 Qwik City 则是其对应的全栈框架。全栈框架的概念基本对标 Remix + React，只是在某些方面私认为做的比 Remix 要好，比如一个页面可以写多个 `loader$` 和 `action$`，就可以不用在 Remix 的 `action` 里面套一大堆的 `switch` 和 `case` 语句来区分是做什么的了。

## 初始化

首先我们需要的是创建一个普通的 Qwik 项目，选择一个基本的 Basic App 就可以了。

```bash
yarn create qwik
```

接着我们安装一些必要的 Qwik 依赖，来使其能够在 Cloudflare Pages 上运行。

```bash
yarn qwik add
```

## KaTeX

安装完 Cloudflare Pages 之后我们再安装一些必要的 remark 和 rehype 插件来让 `.mdx` 文件能够支持 $\KaTeX$ 数学公式，如果您完全不用数学公式那么可以忽略这个步骤。

```bash
yarn add remark-math rehype-katex
```

由于 remark 和 rehype 全家桶用的都是纯 es module 语法，所以我们需要对 `vite` 做一定的修改。

之后将 `vite.config.ts` 改成 `vite.config.mts`，并且修改以下内容。

```js
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// ...

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        mdx: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      }),
      // ...
    ],
    // ...
  };
});
```

接着将文件 `adapters/cloudflare-pages/vite.config.ts` 也改成 `.mts` 后缀名，同时将其中的 `import` 语句改成下面的样子。

```js
import baseConfig from "../../vite.config.mjs";
```

最后在 `package.json` 文件中同步一下对文件名的修改，防止 `yarn build.server` 找不到文件。

之后需要导入 $\KaTeX$ 的样式文件，需要修改 `src/root.tsx` 文件。

```js
import katexStyles from "katex/dist/katex.min.css?inline";

export default component$(() => {
  useStyles$(katexStyles);

  // ...
});
```

## 写文章

可以把 `src/routes` 里面的自带的一大堆样例文件删掉，然后新建 `index.mdx` 文件，就可以直接写文章了。所有的网页结构和样式都是需要自己添加的，如果您嫌懒可以直接 fork 我的仓库 [`swwind/blog`](https://github.com/swwind/blog)。

```mdx
---
title: Hello World
---

# Hello World

This is my first page.
```

## 发布

发布则非常简单，到 Cloudflare Pages 控制台上面新建一个项目，然后链接到 GitHub 的仓库，采用预设 Qwik，构建填写 `yarn build`，发布目录填写 `dist` 就好了。

之后每次提交到 GitHub 上面之后 Cloudflare Pages 就会自动构建和部署。

## 评论

<vue-reactions path="qwik-blog"></vue-reactions>
