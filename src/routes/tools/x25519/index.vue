<template>
  <div>
    <h1>生成炫酷的 ECDH 密钥对</h1>

    <p class="flex flex-wrap gap-4">
      <span>公钥开头字符</span>
      <input type="text" class="w-64 font-mono" v-model="start" />
    </p>
    <p class="flex flex-wrap gap-4">
      <span>公钥包含字符</span>
      <input type="text" class="w-64 font-mono" v-model="include" />
    </p>
    <p class="flex flex-wrap gap-4">
      <span>公钥结束字符</span>
      <input type="text" class="w-64 font-mono" v-model="end" />
    </p>
    <p class="flex flex-wrap gap-4">
      <span>曲线</span>
      <select v-model="curve">
        <option value="P-256">P-256</option>
        <option value="P-384">P-384</option>
        <option value="P-521">P-521</option>
      </select>
    </p>

    <p class="flex flex-wrap items-center gap-4">
      <button
        class="border px-4 py-1"
        @click="generateKeys"
        :disabled="isGenerating"
      >
        生成
      </button>
      <span>{{ logs }}</span>
    </p>

    <p class="flex flex-wrap gap-4">
      <span>公钥</span>
      <span class="break-all font-mono">{{ pubKey }}</span>
    </p>
    <p class="flex flex-wrap gap-4">
      <span>私钥</span>
      <span class="break-all font-mono">{{ privKey }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "@unhead/vue";
import { arrayBufferToBase64 } from "@/utils/crypto.ts";

useHead({
  title: "生成炫酷的 ECDH 密钥对",
});

const start = ref("");
const include = ref("");
const end = ref("");
const curve = ref("P-256");
const pubKey = ref("");
const privKey = ref("");
const logs = ref("");
const isGenerating = ref(false);

async function generateKeys() {
  isGenerating.value = true;

  async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: curve.value },
      true,
      ["deriveBits"],
    );

    const publicKeyBuffer = await crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey,
    );
    const privateKeyBuffer = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

    const publicKey = await arrayBufferToBase64(publicKeyBuffer);
    const privateKey = await arrayBufferToBase64(privateKeyBuffer);

    return { publicKey, privateKey };
  }

  let total = 0;
  while (true) {
    const { publicKey, privateKey } = await generateKeyPair();

    if (
      !publicKey.startsWith(start.value) ||
      !publicKey.endsWith(end.value) ||
      !publicKey.includes(include.value)
    ) {
      total++;
      logs.value = `Try: #${total}`;
      continue;
    }

    pubKey.value = publicKey;
    privKey.value = privateKey;
    break;
  }

  isGenerating.value = false;
}
</script>
