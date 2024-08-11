import { defineConfig } from "vite";
import { blitz } from "@biliblitz/vite";
import vue from "@vitejs/plugin-vue";
import { blitzMdx as mdx } from "@biliblitz/vite-plugin-mdx";
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
import type { TocItem } from "~/utils/toc.ts";

const parseItem = (tree: any): TocItem => {
  const [a, ...os] = tree.children;
  return {
    label: a.children[0].value,
    hash: a.properties.href,
    children: os.flatMap(parseItems),
  };
};

const parseItems = (tree: any): TocItem[] => {
  return tree.children.map(parseItem);
};

export function parseToc(nav: any) {
  return parseItems(nav.children[0]);
}

export default defineConfig({
  plugins: [
    vue(),
    mdx({
      jsxImportSource: "vue",
      providerImportSource: "@mdx-js/vue",
      remarkPlugins: [remarkGfm, remarkMath, remarkRuby],
      rehypePlugins: [
        [rehypePrism, { ignoreMissing: true }],
        // @ts-ignore
        rehypeKatex,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        [
          // @ts-ignore
          rehypeToc,
          {
            headings: ["h2", "h3", "h4"],
            customizeTOC(tree: any) {
              const toc = parseToc(tree);
              return {
                type: "element",
                tagName: "set-nav",
                properties: { toc: JSON.stringify(toc) },
              };
            },
          },
        ],
      ],
    }),
    unheadAddon(),
    blitz(),
    tsconfigPaths(),
  ],
});
