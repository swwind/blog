<template>
  <span v-if="rendered" v-html="html"></span>
  <span v-else>{{ text }}</span>
</template>

<script lang="ts" setup>
import katex from "katex";
import { ref, computed, onMounted } from "vue";

const props = defineProps<{
  mode: "inline" | "display";
  content: string;
}>();

const rendered = ref(false);
const text = computed(() =>
  props.mode === "inline"
    ? `\\( ${props.content} \\)`
    : `\\[\n${props.content}\n\\]`,
);
const html = ref("");

onMounted(() => {
  const renderedContent = katex.renderToString(props.content, {
    strict: false,
    displayMode: props.mode === "display",
  });
  rendered.value = true;
  html.value = renderedContent;
});
</script>
