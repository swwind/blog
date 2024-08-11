<template>
  <nav class="toc">
    <NavToc :toc="toc" />
  </nav>
</template>

<script setup lang="ts">
import { Toc } from "~/utils/toc";
import NavToc from "./NavToc.vue";

defineProps<{ toc: Toc }>();
</script>
