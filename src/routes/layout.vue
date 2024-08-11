<script lang="ts">
const accessDenied = atob(
  "PGgxPllvdXIgYWNjZXNzIHRvIHRoaXMgc2l0ZSBpcyBwcm9oaWJpdGVkIGR1ZSB0byBhIHN1c3BpY2lvdXMgYmVoYXZpb3VyLjwvaDE+",
);
const senpaiURL = atob(
  "aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj0tUmhBbGhtTnptOA==",
);
</script>

<script setup lang="ts">
import { onMounted } from "vue";
import { useHead } from "@unhead/vue";
import metadata from "../metadata.json";

import Christmas from "~/components/easter-egg/Christmas.vue";
import Footer from "~/components/footer/Footer.vue";
import Header from "~/components/header/Header.vue";
import Typography from "~/components/typography/Typography.vue";

useHead({
  title: metadata["site-name"],
});

onMounted(() => {
  try {
    const canvas = document.createElement("canvas");
    const hasWebGL =
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    if (!hasWebGL) throw new Error("bad browser");
  } catch {
    setTimeout(() => {
      location.href = senpaiURL;
    }, 5000);
    document.write(accessDenied);
  }
});
</script>

<template>
  <div
    class="mx-auto flex min-h-screen max-w-4xl flex-col transition-[translate] duration-1000 xl:translate-x-24"
  >
    <Header />
    <main class="flex-1">
      <Typography>
        <router-view />
      </Typography>
    </main>
    <Footer />
    <Christmas />
  </div>
</template>
