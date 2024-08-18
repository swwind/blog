import { defineConfig } from "vite";
import { blitz } from "@biliblitz/vite";
import vue from "@vitejs/plugin-vue";
import { markdown } from "@biliblitz/vite-plugin-markdown";
import unheadAddon from "@unhead/addons/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import vueDevTools from "vite-plugin-vue-devtools";
import metadata from "./src/metadata.json";

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
        [rehypeKatex, { strict: "ignore" }],
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "append" }],
        // @ts-ignore
        [rehypeToc, { headings: ["h1", "h2", "h3", "h4"] }],
        rehypeRemoveComments,
        [rehypeReplaceElement, { map: { a: "vue-link" } }],
      ],
      scriptSetup(frontmatter) {
        return `
          import { useHead as _useHead, useServerHead as _useServerHead } from "@unhead/vue";
          import { isSSR as _isSSR } from "@biliblitz/blitz/utils";
          import _metadata from "@/metadata.json";
          const _sitename = _metadata["site-name"];
          const _title = ${frontmatter.index ? `title` : `title + " | " + _sitename`};
          const _desc = description || _metadata["site-description"];
          _useHead({ title: _title, meta: [{ name: "description", content: _desc }] });
          if (_isSSR) {
            _useServerHead({
              meta: [
                { property: "og:title", content: _title },
                { property: "og:description", content: _desc },
                { property: "og:site_name", content: _sitename },
                { property: "og:locale", content: "zh_CN" },
                { property: "og:type", content: "website" },
              ],
            });
          }
        `;
      },
    }),
    vue({ include: [/\.vue$/, /\.md$/] }),
    unheadAddon(),
    blitz(),
    tsconfigPaths({ loose: true }),
    vueDevTools(),
  ],
  server: {
    proxy: {
      "/api/": "http://localhost:8788/",
    },
  },
  optimizeDeps: {
    include: ["lucide-vue-next", "vue-turnstile"],
  },
});
