<script setup>
import { useBlitz } from "@biliblitz/blitz";
import { useHead } from "@unhead/vue";
import ProgressBar from "./components/progressbar/ProgressBar.vue";

import "./global.css";
import { isSSR } from "@biliblitz/blitz/utils";

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
        "data-cf-beacon": '{"token": "4408419e77824ae681bd7f1138843558"}',
        src: "https://static.cloudflareinsights.com/beacon.min.js",
      },
    ],
  });
}
</script>

<template>
  <router-view />
  <progress-bar />
</template>
