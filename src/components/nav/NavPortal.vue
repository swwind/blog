<template>
  <Nav :toc="parsedToc" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import Nav from "./Nav.vue";

const props = defineProps<{ toc: string }>();

const parsedToc = computed(() => JSON.parse(props.toc));
</script>
