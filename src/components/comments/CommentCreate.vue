<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  createComment,
  weakRandomString,
  sitekey,
  type Comment,
} from "./utils.ts";
import VueTurnstile from "vue-turnstile";

const props = defineProps<{
  path: string;
}>();

const emits = defineEmits<{
  (e: "prepend", payload: { comment: Comment; key: string }): void;
  (e: "success"): void;
}>();

// metas
const name = ref("");
const pubkey = ref("");
const saveMeta = () => {
  localStorage.setItem(
    "comments-metadata",
    [name.value, pubkey.value].join("\0"),
  );
};
onMounted(() => {
  const cache = localStorage.getItem("comments-metadata");
  [name.value, pubkey.value] = cache
    ? cache.split("\0")
    : ["", weakRandomString()];
});

// submits
const submitting = ref(false);
const submit = (event: Event) => {
  event.preventDefault();

  const formData = new FormData(
    event.currentTarget as HTMLFormElement,
    (event as SubmitEvent).submitter,
  );
  submitting.value = true;

  createComment(formData).then((res) => {
    submitting.value = false;

    if (res.ok) {
      saveMeta();
      emits("prepend", { comment: res.comment, key: res.key });
      emits("success");
    } else {
      alert(`error: ${res.error}`);
    }
  });
};

// turnstiles
const token = ref("");
const finish = computed(() => token.value !== "");
</script>

<template>
  <form method="POST" @submit="submit">
    <input type="hidden" name="path" :value="path" />
    <input type="hidden" name="pubkey" :value="pubkey" />
    <input type="hidden" name="cf-turnstile-token" :value="token" />
    <div class="grid grid-cols-3 gap-2">
      <input
        type="text"
        name="name"
        class="col-span-3"
        placeholder="尊姓大名"
        v-model="name"
      />
      <textarea
        name="content"
        class="col-span-3 h-24 min-h-24"
        placeholder="不支持 Markdown"
        required
      />
      <div class="col-span-3">
        <div class="flex items-center justify-between">
          <div>
            <img src="/momoi.webp" alt="waifu" class="h-16 w-16" />
          </div>
          <vue-turnstile
            :siteKey="sitekey"
            v-model="token"
            @error="console.log"
          />
        </div>
      </div>
      <button
        :disabled="submitting || !finish"
        class="col-span-3 border-2 border-slate-800 disabled:pointer-events-none disabled:opacity-60 dark:border-slate-100"
      >
        {{
          finish ? (submitting ? "提交中..." : "提交评论") : "等待验证通过..."
        }}
      </button>
    </div>
  </form>
</template>
