# blog

个人博客.

构建环境：Node.js >= 22.13.0，pnpm 12.3.4。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

`pnpm build` 依次执行类型检查、客户端构建、Node.js SSR 构建和静态页面生成。
