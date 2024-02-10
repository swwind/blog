import { defineConfig } from "vite";
import { preact } from "@preact/preset-vite";
import { blitz, blitzMdx } from "@biliblitz/vite";

import tsconfigPaths from "vite-tsconfig-paths";

import rehypeKatex from "rehype-katex-browser";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRuby from "remark-ruby";

export default defineConfig({
  plugins: [
    blitz(),
    preact(),
    blitzMdx({
      remarkPlugins: [remarkGfm, remarkMath, remarkRuby],
      rehypePlugins: [[rehypePrism, { ignoreMissing: true }], rehypeKatex],
      jsxImportSource: "preact",
      providerImportSource: "@mdx-js/preact",
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    // exclude: ["@biliblitz/blitz"],
  },
});
