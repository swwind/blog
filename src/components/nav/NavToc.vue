<template>
  <ol>
    <li v-for="(item, index) in toc" :key="index">
      <router-link :to="item.hash">{{ item.label }}</router-link>
      <NavToc v-if="item.children.length > 0" :toc="item.children" />
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { Toc } from "~/utils/toc.ts";
import NavToc from "./NavToc.vue";

defineProps<{ toc: Toc }>();
</script>
