import { createServer, createServerBlitz } from "@biliblitz/blitz/server";
import { manifest } from "blitz:manifest/server";
import Root from "./Root.vue";
import { createSSRApp } from "vue";
import { createServerHead } from "@unhead/vue";
import { renderSSRHead } from "@unhead/ssr";
import { createMemoryHistory, createRouter } from "vue-router";
import { renderToString } from "vue/server-renderer";
import { createProgressBar } from "./components/progressbar/controller.ts";

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
