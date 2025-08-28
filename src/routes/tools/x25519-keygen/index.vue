<template>
  <div>
    <h1>X25519 密钥生成</h1>

    <p>使用浏览器安全随机数生成器生成。</p>

    <p class="flex flex-wrap gap-4">
      <span class="font-bold">密钥</span>
      <code>{{ sk }}</code>
      <button class="cursor-pointer underline" @click="copy(sk)">复制</button>
      <button class="cursor-pointer underline" @click="generate">刷新</button>
    </p>

    <p class="flex flex-wrap gap-4">
      <span class="font-bold">公钥</span>
      <code>{{ pk }}</code>
      <button class="cursor-pointer underline" @click="copy(pk)">复制</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { genkey, pubkey } from "@/utils/crypto/x25519.ts";

useHead({
  title: "X25519 密钥生成",
  meta: [{ property: "og:title", content: "X25519 密钥生成" }],
});

const sk = ref("");
const pk = ref("");

function generate() {
  const sec = genkey();
  const pub = pubkey(sec);
  sk.value = sec;
  pk.value = pub;
}

function copy(text: string) {
  navigator.clipboard.writeText(text).then(() => {});
}

onMounted(() => {
  generate();
});
</script>
