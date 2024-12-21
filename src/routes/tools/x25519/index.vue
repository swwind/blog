<template>
  <div>
    <h1>性感荷官在线 ECDH</h1>

    <p class="flex flex-wrap gap-4">
      <span>我的公钥</span>
      <input
        type="text"
        class="w-64 font-mono"
        disabled
        v-model="alicePubkey"
      />
      <button class="cursor-pointer underline" @click="generateKeypair">
        换一个
      </button>
      <button class="cursor-pointer underline" @click="copyPubkey">
        {{ copySuccess ? "已复制" : "复制" }}
      </button>
    </p>

    <p class="flex flex-wrap gap-4">
      <span>对面的公钥</span>
      <input type="text" class="w-64 font-mono" v-model="bobPubkey" />
    </p>

    <p class="flex flex-wrap gap-4">
      <span>ECDH 结果</span>
      <input type="text" class="w-64 font-mono" disabled v-model="key" />
      <button class="cursor-pointer underline" @click="ecdh">计算</button>
      <span class="text-red-500">{{ ecdherr }}</span>
    </p>

    <p class="flex flex-col gap-2">
      <span>明文</span>
      <textarea class="block min-h-32 w-full" v-model="message" />
      <span class="inline-flex gap-4">
        <button class="cursor-pointer underline" @click="encrypt">
          ⬇加密
        </button>
        <button class="cursor-pointer underline" @click="decrypt">
          ⬆解密
        </button>
        <span class="text-red-500">{{ cerr }}</span>
      </span>
      <textarea class="block min-h-32 w-full" v-model="cipher" />
      <span>密文</span>
    </p>

    <p>本工具基于 X25519 算法交换密钥，基于 ChaCha20 算法进行加密。</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { ecdh as x25519, genkey, pubkey } from "@/utils/crypto/x25519.ts";
import { encrypt as chacha20 } from "@/utils/crypto/chacha20.ts";
import { decodeBase64, encodeBase64 } from "@std/encoding";
import { sha256, verify } from "@/utils/crypto/sha256";

useHead({
  title: "性感荷官在线 ECDH",
  meta: [{ property: "og:title", content: "性感荷官在线 ECDH" }],
});

const aliceSeckey = ref("");
const alicePubkey = ref("");
const bobPubkey = ref("");
const key = ref("");
const copySuccess = ref(false);

const message = ref("");
const cipher = ref("");

const cerr = ref("");
const ecdherr = ref("");

function generateKeypair() {
  const sec = genkey();
  const pub = pubkey(sec);
  aliceSeckey.value = sec;
  alicePubkey.value = pub;
  copySuccess.value = false;
}

function ecdh() {
  if (!aliceSeckey.value) {
    ecdherr.value = "缺少私钥";
    return;
  }
  if (!bobPubkey.value) {
    ecdherr.value = "缺少公钥";
    return;
  }
  if (!/^[a-zA-Z0-9\+\/]{43}\=$/.test(bobPubkey.value)) {
    ecdherr.value = "公钥不合法";
    return;
  }
  key.value = x25519(aliceSeckey.value, bobPubkey.value);
  ecdherr.value = "";
}

function copyPubkey() {
  navigator.clipboard.writeText(alicePubkey.value).then(() => {
    copySuccess.value = true;
  });
}

async function encrypt() {
  if (!key.value) {
    cerr.value = "请先完成 ECDH";
    return;
  }
  if (!message.value) {
    cerr.value = "请输入明文";
    return;
  }
  const keybuf = decodeBase64(key.value);
  const nonce = decodeBase64("c3d3aW5kJ3NibG9n");
  const plain = new TextEncoder().encode(message.value);
  const mac = await sha256(plain);
  const msg = new Uint8Array(plain.length + mac.length);
  msg.set(plain);
  msg.set(mac, plain.length);
  // console.log("encoding", encodeBase64(msg));
  // console.log("message=", encodeBase64(plain));
  // console.log("sha256 =", encodeBase64(mac));
  const c = chacha20(keybuf, nonce, msg);
  cipher.value = encodeBase64(c);
  cerr.value = "加密完成";
}

async function decrypt() {
  if (!key.value) {
    cerr.value = "请先完成 ECDH";
    return;
  }
  if (!cipher.value) {
    cerr.value = "请输入密文";
    return;
  }
  const keybuf = decodeBase64(key.value);
  const nonce = decodeBase64("c3d3aW5kJ3NibG9n");
  const c = decodeBase64(cipher.value);
  const plain = chacha20(keybuf, nonce, c);
  // console.log("decoding", encodeBase64(plain), plain.length);
  const msg = plain.subarray(0, plain.length - 32);
  const mac = plain.subarray(plain.length - 32);
  // console.log("message=", encodeBase64(msg));
  // console.log("sha256 =", encodeBase64(mac));
  if (!(await verify(msg, mac))) {
    cerr.value = "解密失败，密钥错误";
    return;
  }
  message.value = new TextDecoder().decode(msg);
  cerr.value = "解密完成";
}

onMounted(() => {
  generateKeypair();
});
</script>
