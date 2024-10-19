<script setup lang="ts">
import { onMounted } from "vue";
import { useHead } from "@unhead/vue";
import metadata from "../metadata.json";

import Christmas from "@/components/easter-egg/Christmas.vue";
import Footer from "@/components/footer/Footer.vue";
import Header from "@/components/header/Header.vue";
import Typography from "@/components/typography/Typography.vue";

useHead({
  title: metadata["site-name"],
});

// === 彩蛋 ===
onMounted(() => {
  const today = new Date();
  if (today.getMonth() === 11 && today.getDate() === 31) {
    document.body.classList.add("aniki");
  }
});
</script>

<template>
  <div
    class="mx-auto flex min-h-screen max-w-4xl flex-col transition-[translate] duration-1000"
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
