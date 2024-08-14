<template>
  <div class="relative">
    <article class="typography">
      <slot />
    </article>
  </div>
</template>

<script setup lang="ts">
import Link from "./Link.vue";
import NavPortal from "../nav/NavPortal.vue";
</script>
