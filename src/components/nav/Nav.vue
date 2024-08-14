<template>
  <nav class="toc">
    <NavToc :toc="toc" />
  </nav>
</template>

<script setup lang="ts">
import type { Toc } from "@/utils/toc.ts";
import NavToc from "./NavToc.vue";

defineProps<{ toc: Toc }>();
</script>
