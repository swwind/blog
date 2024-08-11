<template>
  <a :href="href" target="_blank" v-if="isExternal">
    <slot />
  </a>
  <router-link :to="href" v-else>
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  href: string;
}>();

const isExternal = computed(
  () =>
    props.href.startsWith("https://") ||
    props.href.startsWith("http://") ||
    props.href.startsWith("//"),
);
</script>
