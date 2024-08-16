<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { fetchComments, type Comment, removeComment } from "./utils.ts";
import CommentCreate from "./CommentCreate.vue";
import CommentDetail from "./CommentDetail.vue";

const props = defineProps<{
  path: string;
}>();

const show = ref(false);
const toggle = () => (show.value = !show.value);

const storage = ref<Map<string, string>>(new Map());
onMounted(() => {
  try {
    const keys = localStorage.getItem("sww.moe:keys");
    if (keys) storage.value = new Map(JSON.parse(keys));
  } catch {}
});
watch(
  () => [...storage.value.entries()],
  (update) => {
    localStorage.setItem("sww.moe:keys", JSON.stringify(update));
  },
);

const loading = ref(true);
const comments = ref<Comment[]>([]);

const prepend = ({ comment, key }: { comment: Comment; key: string }) => {
  comments.value.unshift(comment);
  storage.value.set(comment.id, key);
};

onMounted(async () => {
  const resp = await fetchComments(props.path);
  loading.value = false;
  comments.value = resp.comments;
});

const remove = async (id: string) => {
  const response = await removeComment(props.path, id, storage.value.get(id)!);
  if (response.ok) {
    storage.value.delete(id);
    comments.value = comments.value.filter((x) => x.id !== id);
  }
};
</script>

<template>
  <p>
    <button
      class="col-span-3 border-2 border-slate-800 px-8 dark:border-slate-100"
      @click="toggle"
    >
      {{ show ? "关闭" : "添加评论" }}
    </button>
  </p>

  <div class="mx-6 my-4">
    <CommentCreate
      v-if="show"
      :path="path"
      @prepend="prepend"
      @success="toggle"
    />
  </div>

  <p v-if="loading" class="italic opacity-60">少女祈祷中...</p>
  <p v-if="!loading && !comments.length" class="italic opacity-60">
    暂时没有评论
  </p>
  <div v-if="!loading && comments.length > 0">
    <CommentDetail
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
      :deletable="storage.has(comment.id)"
      @delete="remove"
    />
  </div>
</template>
