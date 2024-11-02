<template>
  <div>
    <h2>锟斤拷生成器</h2>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>原文</span>
      <input type="text" class="w-64 font-mono" v-model="input" />
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>古文码</span>
      <span>{{ guwenma }}</span>
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>口字码</span>
      <span>{{ kouzima }}</span>
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>符号码</span>
      <span>{{ fuhaoma }}</span>
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>拼音码</span>
      <span>{{ pinyinma }}</span>
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>问句码</span>
      <span>{{ wenjuma }}</span>
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>锟拷码</span>
      <span>{{ kunkaoma }}</span>
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>烫烫烫</span>
      <span>{{ tangtangtang }}</span>
    </p>

    <p class="flex flex-wrap items-baseline gap-4">
      <span>屯屯屯</span>
      <span>{{ tuntuntun }}</span>
    </p>

    <h3>说明</h3>

    <ul>
      <li>古文码：以 GBK 的方式读取 UTF-8 编码的字符串</li>
      <li>口字码：以 UTF-8 的方式读取 GBK 编码的字符串</li>
      <li>符号码：以 ASCII 的方式读取 UTF-8 编码的字符串</li>
      <li>拼音码：以 ASCII 的方式读取 GBK 编码的字符串</li>
      <li>
        问句码：以 UTF-8 的方式读取 GBK 编码的字符串，再以 GBK 的方式重新读取
      </li>
      <li>
        锟拷码：以 GBK 的方式读取 UTF-8 编码的字符串，再以 UTF-8 的方式重新读取
      </li>
      <li>烫烫烫：内存全为 0xCC</li>
      <li>屯屯屯：内存全为 0xCD</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useHead } from "@unhead/vue";
import { encodeGBK } from "@/utils/gbk.ts";

useHead({
  title: "锟斤拷生成器",
});

const input = ref("");
const guwenma = ref("");
const kouzima = ref("");
const fuhaoma = ref("");
const pinyinma = ref("");
const wenjuma = ref("");
const kunkaoma = ref("");
const tangtangtang = ref("");
const tuntuntun = ref("");

function decodeGBK(buffer: Uint8Array) {
  return new TextDecoder("gbk").decode(buffer);
}

function encodeUtf8(input: string) {
  return new TextEncoder().encode(input);
}

function decodeUtf8(buffer: Uint8Array) {
  return new TextDecoder().decode(buffer);
}

function decodeAscii(buffer: Uint8Array) {
  return new TextDecoder("ascii").decode(buffer);
}

watch(input, (input) => {
  guwenma.value = decodeGBK(encodeUtf8(input));
  kouzima.value = decodeUtf8(encodeGBK(input));
  fuhaoma.value = decodeAscii(encodeUtf8(input));
  pinyinma.value = decodeAscii(encodeGBK(input));
  wenjuma.value = decodeUtf8(encodeGBK(decodeGBK(encodeUtf8(input))));
  kunkaoma.value = decodeGBK(encodeUtf8(decodeUtf8(encodeGBK(input))));

  tangtangtang.value = decodeGBK(
    new Uint8Array(new Array(input.length * 2).fill(0xcc)),
  );
  tuntuntun.value = decodeGBK(
    new Uint8Array(new Array(input.length * 2).fill(0xcd)),
  );
});
</script>
