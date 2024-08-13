<template>
  <div class="progress" :class="state"></div>
</template>

<script setup lang="ts">
import { injectProgressBar } from "./controller.ts";

const { state } = injectProgressBar();
</script>

<style scoped>
.progress {
  @apply pointer-events-none fixed left-0 top-0 h-0.5 overflow-visible bg-green-500;
  transition-property: width, opacity;
  box-shadow: 0 0 25px #22c55e;

  &.init {
    @apply w-0 opacity-0;
    transition-timing-function: step-end, step-end;
    transition-duration: 0ms;
  }

  &.show {
    @apply w-[99%] opacity-100;
    transition-timing-function: ease-out, step-start;
    transition-duration: 10s;
  }

  &.finish {
    @apply w-full opacity-0;
    transition-timing-function: linear, ease-in;
    transition-duration: 0.3s;
  }
}
</style>
