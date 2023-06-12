function toChineseCalendar(date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    calendar: "chinese",
  })
    .format(date)
    .slice(4, -3)
    .replace("十一月", "冬月");
}

function toYangliCalendar(date) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "short" })
    .format(date)
    .replace(/\//g, "-");
}

const startDate = new Date("2017-01-01").getTime() + 60 * 60 * 1000;
const endDate = new Date("2023-12-31").getTime();

const map = new Map();
for (let i = startDate; i < endDate; i += 24 * 60 * 60 * 1000) {
  const yangli = toYangliCalendar(i);
  const yinli = toChineseCalendar(i);
  // console.log(yangli, '=>', yinli);
  map.set(yinli, yangli);
}

const filelist = `
src/routes/(black-history)/post/(2017)/codeforces-round-357-div-2-solution/index.mdx
src/routes/(black-history)/post/(2017)/codeforces-round-396-div-2-solution/index.mdx
src/routes/(black-history)/post/(2017)/codeforces-round-439-div-2-solution/index.mdx
src/routes/(black-history)/post/(2017)/noip2017-travel/index.mdx
src/routes/(black-history)/post/(2018)/canvas-live/index.mdx
src/routes/(black-history)/post/(2018)/functional-1/index.mdx
src/routes/(black-history)/post/(2018)/happy-new-year/index.mdx
src/routes/(black-history)/post/(2018)/how-to-use-live2d-in-hexo/index.mdx
src/routes/(black-history)/post/(2018)/html5-game/index.mdx
src/routes/(black-history)/post/(2018)/load-cover-from-mp3-file/index.mdx
src/routes/(black-history)/post/(2018)/number-theory/index.mdx
src/routes/(black-history)/post/(2018)/reverse-sentense/index.mdx
src/routes/(black-history)/post/(2018)/tensorflow/index.mdx
src/routes/(black-history)/post/(2018)/write-a-simple-acg-game/index.mdx
src/routes/(black-history)/post/(2018)/zjoi-day2/index.mdx
src/routes/(black-history)/post/(2018)/zjoi2018-day1/index.mdx
src/routes/(black-history)/post/(2019)/arch-install/index.mdx
src/routes/(black-history)/post/(2019)/ascii-to-gbk/index.mdx
src/routes/(black-history)/post/(2019)/bt-download/index.mdx
src/routes/(black-history)/post/(2019)/certificate/index.mdx
src/routes/(black-history)/post/(2019)/lightdm-theme-writing/index.mdx
src/routes/(black-history)/post/(2019)/quick-js/index.mdx
src/routes/(black-history)/post/(2020)/archlinux-setup/index.mdx
src/routes/(black-history)/post/(2020)/galois-theory/index.mdx
src/routes/(black-history)/post/(2020)/happy-new-year-2021/index.mdx
src/routes/(black-history)/post/(2020)/js-ts-gui-framework/index.mdx
src/routes/(black-history)/post/(2020)/vue3-ssr-tutorial/index.mdx
src/routes/(black-history)/post/(2021)/anbox-arknights/index.mdx
src/routes/(black-history)/post/(2021)/bevy-engine-ichi/index.mdx
src/routes/(black-history)/post/(2021)/clean-bilibili/index.mdx
src/routes/(black-history)/post/(2022)/bstar-unlock/index.mdx
src/routes/(black-history)/post/(2022)/waydroid-arknights/index.mdx
src/routes/(black-history)/post/(2022)/x25519/index.mdx
src/routes/post/(2023)/hevc-wasm/index.mdx
src/routes/post/(2023)/qwik-blog/index.mdx
`
  .trim()
  .split("\n");

const fs = require("fs");

for (const file of filelist) {
  const content = fs.readFileSync(file, "utf-8");
  const startPos = content.indexOf('<div class="info">');
  const endPos = content.indexOf("</div>");

  if (startPos > -1 && endPos > -1) {
    const data = content
      .slice(startPos + 18, endPos)
      .trim()
      .split("\n")
      .map((x) => x.trim());
    // console.log(data);

    const author = data[0].slice(6, -7);
    const time = data[1].slice(6, -7);
    const realtime = map.get(time);
    const tags = data
      .slice(2)
      .map((x) => x.slice(7, -7))
      .join(",");
    console.log(author, realtime, tags);

    const replace = `
import { Metadata } from "~/components/metadata/metadata";

<Metadata
  author="${author}"
  time="${realtime}"${
      tags
        ? `
  tags="${tags}"`
        : ""
    }
/>
`;

    const newContent =
      content.slice(0, startPos) + replace + content.slice(endPos + 6);

    fs.writeFileSync(file, newContent);
  }
}
