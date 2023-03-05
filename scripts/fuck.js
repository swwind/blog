const { writeFileSync, mkdirSync } = require("fs");
const { posts } = require("./data.json");

for (const post of posts
  .sort(
    (b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  .filter((post) => new Date(post.createdAt).getFullYear() === 2022)) {
  const time = new Date(post.createdAt)
    .toLocaleString("zh-CN-u-ca-chinese", { dateStyle: "full" })
    .replace("十一月", "冬月")
    .slice(4, -3);

  console.log(
    JSON.stringify({ time, slot: post.slot, title: post.title }) + ","
  );

  // console.log(post.title, time);
  console.log(post.tags);
  // mkdirSync(`./src/routes/(black-history)/post/(2022)/${post.slot}`, {
  //   recursive: true,
  // });
  // writeFileSync(
  //   `./src/routes/(black-history)/post/(2022)/${post.slot}/index.mdx`,
  //   post.content
  // );
}
