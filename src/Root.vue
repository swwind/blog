<script setup>
import { useBlitz } from "@biliblitz/blitz";
import { useHead } from "@unhead/vue";
import ProgressBar from "./components/progressbar/ProgressBar.vue";

import "./global.css";

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
</script>

<template>
  <router-view />
  <progress-bar />
</template>
