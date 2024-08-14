import { createServer, createServerBlitz } from "@biliblitz/blitz/server";
import { manifest } from "blitz:manifest/server";
import { createSSRApp } from "vue";
import { createServerHead } from "@unhead/vue";
import { renderSSRHead } from "@unhead/ssr";
import { createMemoryHistory, createRouter } from "vue-router";
import { renderToString } from "vue/server-renderer";
import { createProgressBar } from "./components/progressbar/controller.ts";

import Root from "./Root.vue";
import Link from "./components/typography/Link.vue";
import Metadata from "./components/metadata/Metadata.vue";
import Comments from "./components/comments/Comments.vue";
import Reactions from "./components/comments/Reactions.vue";

export default createServer(
  async (c, runtime) => {
    const app = createSSRApp(Root);
    const head = createServerHead();
    const router = createRouter({
      routes: manifest.routes,
      history: createMemoryHistory(manifest.base),
    });
    const progressbar = createProgressBar();
    const blitz = createServerBlitz({ runtime, manifest });

    await router.replace(c.req.path);
    await router.isReady();

    app.use(head);
    app.use(router);
    app.use(progressbar);
    app.use(blitz);

    app.component("vue-link", Link);
    app.component("vue-metadata", Metadata);
    app.component("vue-comments", Comments);
    app.component("vue-reactions", Reactions);

    const ctx = {};
    const appHTML = await renderToString(app, ctx);
    const payload = await renderSSRHead(head, { omitLineBreaks: true });

    return c.html(
      `<!DOCTYPE html>` +
        `<html${payload.htmlAttrs}>` +
        `<head>${payload.headTags}</head>` +
        `<body${payload.bodyAttrs}>` +
        `${payload.bodyTagsOpen}` +
        `<div id="app">${appHTML}</div>` +
        `${payload.bodyTags}` +
        `</body>` +
        `</html>`,
    );
  },
  { manifest },
);
