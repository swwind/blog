<template>
  <div>
    <h2>锟斤拷生成器</h2>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>原文</span>
      <input
        type="text"
        class="w-64 font-mono"
        v-model="inputText"
        @input="callback"
      />
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>密文</span>
      <span>{{ resultText }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "@unhead/vue";
import { encodeGBK } from "~/utils/gbk.ts";

useHead({
  title: "锟斤拷生成器",
});

const inputText = ref("");
const resultText = ref("");

const callback = () => {
  const step1 = encodeGBK(inputText.value);
  const step2 = new TextDecoder().decode(step1);
  const step3 = new TextEncoder().encode(step2);
  const final = new TextDecoder("gbk").decode(step3);
  resultText.value = final;
};
</script>
