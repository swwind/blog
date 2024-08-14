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
import rehypeRemoveComments from "rehype-remove-comments";
import { rehypeRemoveParagraph } from "./src/utils/rehype-remove-paragraph.ts";
import { rehypeReplaceElement } from "./src/utils/rehype-replace-element.ts";

export default defineConfig({
  plugins: [
    markdown({
      remarkPlugins: [remarkGfm, remarkMath, remarkRuby],
      rehypePlugins: [
        rehypeRemoveParagraph,
        [rehypePrism, { ignoreMissing: true }],
        rehypeKatex,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        // @ts-ignore
        [rehypeToc, { headings: ["h2", "h3", "h4"] }],
        rehypeRemoveComments,
        [rehypeReplaceElement, { map: { a: "vue-link" } }],
      ],
    }),
    vue({ include: [/\.vue$/, /\.md$/] }),
    unheadAddon(),
    blitz(),
    tsconfigPaths({ loose: true }),
  ],
});
