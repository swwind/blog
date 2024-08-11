<template>
  <p>
    <span
      class="cursor-not-allowed"
      @click="shoutOut"
      :style="{ cursor: `url(${poop}) 12 12, pointer` }"
    >
      <slot />
    </span>
  </p>
</template>

<script setup lang="ts">
import shout from "~/assets/audio/senpai.aac";
import poop from "~/assets/images/poop.webp";

function shoutOut() {
  const audio = new Audio(shout);
  audio.addEventListener("canplay", () => {
    audio.play();
  });
}
</script>
