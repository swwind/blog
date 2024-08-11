<template>
  <div>
    <h1>鸡肋的哈希密码生成器</h1>

    <p class="flex flex-wrap gap-4">
      <span>第一密码</span>
      <input
        type="password"
        class="w-64 font-mono"
        v-model="psw1"
        autocomplete="false"
      />
    </p>
    <p class="flex flex-wrap gap-4">
      <span>第二密码</span>
      <input
        type="password"
        class="w-64 font-mono"
        v-model="psw2"
        autocomplete="false"
      />
    </p>
    <p class="flex flex-wrap gap-4">
      <span>第三密码</span>
      <input
        type="password"
        class="w-64 font-mono"
        v-model="psw3"
        autocomplete="false"
      />
    </p>
    <p class="flex flex-wrap gap-4">
      <span>作用空间</span>
      <input
        type="text"
        class="w-64 font-mono"
        v-model="namespace"
        autocomplete="false"
        @focus="updatePassword"
        @input="updatePassword"
      />
      <span v-if="copied">已复制</span>
    </p>

    <p class="flex flex-wrap gap-4">
      <span>最终结果</span>
      <code class="font-mono">{{ censored }}</code>
      <button class="cursor-pointer underline" @click="copy(final)">
        字母数字
      </button>
      <button class="cursor-pointer underline" @click="copy(strong)">
        带符号
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useHead } from "@unhead/vue";
import md5 from "blueimp-md5";

useHead({
  title: "鸡肋的哈希密码生成器",
});

const psw1 = ref("");
const psw2 = ref("");
const psw3 = ref("");
const namespace = ref("");

const final = ref("****************");
const strong = computed(() => final.value + "1%aA");
const censored = computed(() => censor(final.value));

const updatePassword = () => {
  final.value = main(psw1.value, psw2.value, psw3.value, namespace.value);
};

const copied = ref(false);
const copy = async (text: string) => {
  await navigator.clipboard.writeText(text);
  copied.value = true;
};

function hash(str: string, key: string, times: number): string {
  if (!times) return str;
  return hash(md5(str + key), str, times - 1);
}

function main(str1: string, str2: string, str3: string, type: string): string {
  const h1 = hash(str1, str2, 10);
  const h2 = hash(str2, str3, 10);
  const h3 = hash(str3, str1, 10);
  const h4 = hash(str1, str3, 10);
  const h5 = hash(str2, str1, 10);
  const h6 = hash(str3, str2, 10);
  const r1 = hash(md5(h1 + h2 + h3), type, 10);
  const r2 = hash(md5(h4 + h5 + h6), type, 10);
  return btoa(hash(r1, r2, 10)).slice(0, 16);
}

function censor(password: string): string {
  return password.slice(0, 4) + "*".repeat(8) + password.slice(-4);
}
</script>
