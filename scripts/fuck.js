const { writeFileSync, mkdirSync } = require("fs");
const { posts } = require("./data.json");

for (const post of posts
  .sort(
    (b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  .filter((post) => new Date(post.createdAt).getFullYear() === 2020)) {
  const time = new Date(post.createdAt)
    .toLocaleString("zh-CN-u-ca-chinese", { dateStyle: "full" })
    .replace("十一月", "冬月")
    .slice(4, -3);

  console.log(`### [${post.title}](/post/${post.slot})\n\n发表于${time}。\n`);

  // console.log(post.title, time);

  // console.log(post.tags);
  mkdirSync(`./src/routes/(black-history)/post/(2020)/${post.slot}`, {
    recursive: true,
  });
  writeFileSync(
    `./src/routes/(black-history)/post/(2020)/${post.slot}/index.mdx`,

    `---
title: ${post.title}
---

# ${post.title}

<div class="info">
  <span>swwind</span>
  <time>${time}</time>${post.tags
      .map((tag) => `\n  <span>#${tag}</span>`)
      .join("")}
</div>

${post.content.replace("<!-- more -->", "")}`
  );
}
