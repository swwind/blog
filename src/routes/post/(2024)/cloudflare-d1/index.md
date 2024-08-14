---
title: Cloudflare D1 使用记录
---

# Cloudflare D1 使用记录

<vue-metadata author="swwind" time="2024-7-14"></vue-metadata>

> 相关文档
>
> - [Cloudflare Workers KV 使用手册](https://developers.cloudflare.com/kv/)
> - [Cloudflare D1 使用手册](https://developers.cloudflare.com/d1/)
> - [Hono 使用手册](https://hono.dev/)

博客原来的评论系统是基于 Cloudflare Workers KV 的，
但是我感觉 Cloudflare Workers KV 不太适合作为咱们评论系统的底层数据库实现，
因为我感觉这个好像根本没有数据库的[一致性检查](https://developers.cloudflare.com/kv/reference/how-kv-works/#consistency)。

这通常不会导致太大的问题，但是会有概率使得某些评论被吞掉。

所以我准备将博客的评论系统从 Cloudflare Workers KV 迁移到 Cloudflare D1。

下面是创建和使用 Cloudflare D1 的一些过程，我放在这里作为一个记录，省得以后再去翻英文文档。

## 创建 Workers 项目

如果你还没有创建，你可以使用下面的指令来创建一个。

```sh
npm create cloudflare@latest project-name
```

接着回答问题进行配置即可。

## 创建一个数据库

使用下面的指令创建新的 Cloudflare D1 数据库。

```sh
npx wrangler d1 create my-database
```

这将会在控制台中输出如下的内容，你应该将这些配置文件粘贴进 `wrangler.toml` 中。

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "<xxxxxxxx-xxxx-xxxx-xxxxxxxxxxx>"
```

## 初始化数据库

编写你的数据库 schema 文件，例如保存为 `schema.sql`。

```sql
-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);

-- 添加默认数据
INSERT INTO students (id, name) VALUES
(114514, "田所浩二"),
(1919810, "田所浩三");
```

使用下面的指令写入到本地开发数据库中，并执行查询语句验证数据。

```sh
npx wrangler d1 execute my-database --local --file=./schema.sql
npx wrangler d1 execute my-database --local --command='SELECT * FROM students'
```

如果你确认这在本地没有问题，可以使用下面的指令在生产环境中部署和验证。

```sh
npx wrangler d1 execute my-database --remote --file=./schema.sql
npx wrangler d1 execute my-database --remote --command='SELECT * FROM students'
```

## 编写脚本

首先我们需要编辑 `./src/index.ts` 文件，添加如下内容。

```ts
export type Env = {
  DB: D1Database; // 这里的 "DB" 与之前的的 binding = "DB" 相同即可
};
```

接着我们使用 [Hono](https://hono.dev/) 作为全站的路由服务器实现。

```ts
const app = new Hono<{ Bindings: Env }>();

type Student = {
  id: number;
  name: string;
};

app.get("/student/:name", async (c) => {
  const student = await c.env.DB.prepare(
    "SELECT * FROM students WHERE name = ?",
  )
    .bind(c.req.param("name"))
    .first<Student>();

  return c.json({ student });
});

export default app;
```

## 测试和部署

在本地使用下面的指令启动一个 DEV 服务器，该服务器默认监听 8787 端口。

```sh
npx wrangler dev
```

测试完成之后，可以使用下面的指令部署到生产环境。

```sh
npx wrangler deploy
```

然后你就可以愉快地玩耍了。

## 评论

<vue-reactions path="cloudflare-d1"></vue-reactions>
