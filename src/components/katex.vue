<template>
  <span v-html="renderedContent"></span>
</template>

<script lang="ts" setup>
import katex from "katex";

const props = defineProps<{
  mode: "inline" | "display";
  content: string;
}>();

const renderedContent = katex.renderToString(props.content, {
  strict: false,
  displayMode: props.mode === "display",
});
</script>
