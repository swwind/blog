<template>
  <div class="relative">
    <article class="typography">
      <MDXProvider
        :components="{
          a: Link,
          'set-nav': NavPortal,
        }"
      >
        <slot />
      </MDXProvider>
    </article>
  </div>
</template>

<script setup lang="ts">
import { MDXProvider } from "@mdx-js/vue";
import Link from "./Link.vue";
import NavPortal from "../nav/NavPortal.vue";
</script>
