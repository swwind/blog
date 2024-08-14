import { defineConfig } from "vite";
import { blitz } from "@biliblitz/vite";
import vue from "@vitejs/plugin-vue";
import { markdown } from "@biliblitz/vite-plugin-markdown";
import unheadAddon from "@unhead/addons/vite";
import tsconfigPaths from "vite-tsconfig-paths";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRuby from "remark-ruby";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import rehypeToc from "rehype-toc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
  plugins: [
    markdown({
      remarkPlugins: [remarkGfm, remarkMath, remarkRuby],
      rehypePlugins: [
        [rehypePrism, { ignoreMissing: true }],
        // @ts-ignore
        rehypeKatex,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        // @ts-ignore
        [rehypeToc, { headings: ["h2", "h3", "h4"] }],
      ],
    }),
    vue({ include: [/\.vue$/, /\.md$/] }),
    unheadAddon(),
    blitz(),
    tsconfigPaths({ loose: true }),
  ],
});
