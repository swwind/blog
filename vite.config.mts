import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";

import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkGemoji from "remark-gemoji";

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity({
        mdxPlugins: {
          remarkGfm: true,
          rehypeAutolinkHeadings: true,
          rehypeSyntaxHighlight: true,
        },
        mdx: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
      }),
      qwikVite(),
      tsconfigPaths(),
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
  };
});
