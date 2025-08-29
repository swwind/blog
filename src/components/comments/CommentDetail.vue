<script setup lang="ts">
import { computed } from "vue";
import { type Comment, toVersionString, generateUserHash } from "./utils.ts";
import { UAParser } from "ua-parser-js";
import { formatDate } from "@/utils/chinese-calendar.ts";

const props = defineProps<{
  comment: Comment;
  deletable: boolean;
}>();

const emits = defineEmits<{
  (e: "delete", id: string): void;
}>();

const info = computed(() => {
  const parser = new UAParser(props.comment.userAgent.trim());
  return {
    name: props.comment.name.trim() || "匿名用户",
    content: props.comment.content.trim(),
    time: formatDate(props.comment.time),
    browser: toVersionString(parser.getBrowser()),
    os: toVersionString(parser.getOS()),
    hash: generateUserHash(props.comment.pubkey),
  };
});
</script>

<template>
  <div class="mx-6 my-4">
    <div>
      <b>{{ info.name }}#{{ info.hash }}</b>
      <span class="ml-3 text-sm">{{ info.time }}</span>
      <span class="ml-3 text-sm" v-if="info.browser">{{ info.browser }}</span>
      <span class="ml-3 text-sm" v-if="info.os">{{ info.os }}</span>
      <a
        class="ml-3 cursor-pointer text-sm underline"
        href="https://ntfy.sww.moe/blog"
        v-if="deletable"
      >
        {{ "订阅回复" }}
      </a>
      <span
        class="ml-3 cursor-pointer text-sm underline"
        v-if="deletable"
        @click="emits('delete', comment.id)"
      >
        {{ "删除" }}
      </span>
    </div>

    <div class="m-4">
      <span v-if="info.content" class="whitespace-pre-line">{{
        info.content
      }}</span>
      <span v-else class="italic">
        他居然钻了空子发了一条空评论！但是事实上他还是什么也做不到，他只是想向世人炫耀自己的技术水平罢了。多么悲哀！
      </span>
    </div>
  </div>
</template>
