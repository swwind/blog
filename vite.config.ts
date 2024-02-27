import { defineConfig } from "vite";
import { preact } from "@preact/preset-vite";
import { blitz, blitzMdx } from "@biliblitz/vite";

import tsconfigPaths from "vite-tsconfig-paths";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRuby from "remark-ruby";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
  plugins: [
    blitz(),
    preact(),
    blitzMdx({
      remarkPlugins: [remarkGfm, remarkMath, remarkRuby],
      rehypePlugins: [
        [rehypePrism, { ignoreMissing: true }],
        rehypeKatex,
        rehypeSlug,
        rehypeAutolinkHeadings,
      ],
      jsxImportSource: "preact",
    }),
    tsconfigPaths(),
  ],
});
