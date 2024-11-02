<script setup>
import { useBlitz } from "@biliblitz/blitz";
import { useHead } from "@unhead/vue";
import ProgressBar from "./components/progressbar/ProgressBar.vue";

import "./global.css";
import { isSSR } from "@biliblitz/blitz/utils";

import tracking from "./utils/tracking.js?url";

useHead({
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
  ],
  link: [
    { rel: "manifest", href: "/manifest.json" },
    { rel: "shortcut icon", href: "/momoi.webp" },
  ],
});

useBlitz();

if (!import.meta.env.DEV && isSSR) {
  useHead({
    script: [
      {
        defer: true,
        "data-secret": '{"token":"fcfe972463c2499b96a7377883dcf6fa"}',
        src: tracking,
      },
    ],
  });
}
</script>

<template>
  <router-view />
  <progress-bar />
</template>
