<script setup>
import { useBlitz } from "@biliblitz/blitz";
import { useHead } from "@unhead/vue";
import ProgressBar from "./components/progressbar/ProgressBar.vue";

import "./global.css";
import { isDev, isSSR } from "@biliblitz/blitz/utils";

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

if (!isDev && isSSR) {
  useHead({
    script: [
      {
        defer: true,
        src: "https://static.cloudflareinsights.com/beacon.min.js",
        "data-cf-beacon": '{"token": "57439b4043fd4e1e9d05b344fa6adf84"}',
      },
    ],
  });
}

useBlitz();
</script>

<template>
  <router-view />
  <progress-bar />
</template>
