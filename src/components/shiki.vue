<template>
  <pre><code v-if="html" :class="`language-${language}`" v-html="html"></code><code v-else :class="`language-${language}`">{{ content }}</code></pre>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps<{ content: string; language: string }>();
const html = ref("");

onMounted(() => {
  watch(
    () => [props.content, props.language] as const,
    async ([content, language], _previous, onCleanup) => {
      let active = true;
      onCleanup(() => {
        active = false;
      });
      html.value = "";
      if (["text", "plain", "plaintext", ""].includes(language)) return;
      try {
        const { highlight } = await import("../utils/shiki.ts");
        const result = await highlight(content, language);
        if (active) html.value = result;
      } catch (error) {
        console.warn("Code highlighting failed", error);
      }
    },
    { immediate: true },
  );
});
</script>
