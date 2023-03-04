const { posts } = require("./data.json");

for (const post of posts.sort(
  (b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
)) {
  const time = new Date(post.createdAt)
    .toLocaleString("zh-CN-u-ca-chinese", { dateStyle: "full" })
    .replace("十一月", "冬月")
    .slice(4, -3);

  console.log(
    JSON.stringify({ time, slot: post.slot, title: post.title }) + ","
  );

  // console.log(post.title, time);
}
