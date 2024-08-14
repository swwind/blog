import { manifest } from "blitz:manifest/client";
import { createHead } from "@unhead/vue";
import { createRouter, createWebHistory } from "vue-router";
import { createApp } from "vue";
import { createBlitz } from "@biliblitz/blitz";
import { createProgressBar } from "./components/progressbar/controller.ts";

import Root from "./Root.vue";
import Link from "./components/typography/Link.vue";
import Metadata from "./components/metadata/Metadata.vue";
import Reactions from "./components/comments/Reactions.vue";

const head = createHead();
const router = createRouter({
  routes: manifest.routes,
  history: createWebHistory(manifest.base),
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    return savedPosition || { top: 0 };
  },
});
const progressbar = createProgressBar();
const blitz = createBlitz({ manifest });

createApp(Root)
  .use(head)
  .use(router)
  .use(progressbar)
  .use(blitz)
  .component("vue-link", Link)
  .component("vue-metadata", Metadata)
  .component("vue-reactions", Reactions)
  .mount("#app", true);
