<template>
  <div class="mx-6 my-3 flex gap-2 text-sm">
    <button
      v-for="{ name, icon } in reactedTypes"
      :key="name"
      class="flex items-center gap-2 rounded-full px-3 py-1"
      :class="
        reacted.includes(name)
          ? 'bg-slate-800 text-slate-100 dark:bg-slate-600 dark:text-slate-200'
          : 'border border-slate-600'
      "
      @click="handleReaction(name)"
    >
      <span>{{ icon }}</span>
      <span>{{ loading ? "…" : reactions[name] || 0 }}</span>
    </button>

    <div
      v-if="unreactedTypes.length > 0"
      class="flex items-center gap-2 rounded-full border border-slate-600 px-3 py-1"
    >
      <button
        v-for="{ name, icon } in unreactedTypes"
        :key="name"
        @click="handleReaction(name)"
      >
        {{ icon }}
      </button>
    </div>
  </div>

  <Comments v-if="props.disableComments !== true" :path="path" />
  <p v-else>评论区已关闭</p>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import {
  addReaction,
  getReactions,
  readLocalReactions,
  writeLocalReactions,
  type ReactionRecord,
} from "./utils.ts";
import Comments from "./Comments.vue";

const props = defineProps<{
  path: string;
  disableComments?: boolean;
}>();

const reactionTypes = [
  { name: "up", icon: "👍" },
  { name: "down", icon: "👎" },
  { name: "clown", icon: "🤡" },
  { name: "grinning", icon: "😅" },
  { name: "heart", icon: "❤️" },
  { name: "fire", icon: "🔥" },
  { name: "laugh", icon: "😂" },
  { name: "wow", icon: "😮" },
  { name: "cry", icon: "😢" },
  { name: "angry", icon: "😡" },
  { name: "party", icon: "🎉" },
  { name: "thinking", icon: "🤔" },
  { name: "sunglasses", icon: "😎" },
];

const loading = ref(true);
const reacted = ref<string[]>([]);
const reactions = ref<ReactionRecord>({});

onMounted(() => {
  getReactions(props.path).then((responseReactions) => {
    reactions.value = responseReactions;
    loading.value = false;
  });

  reacted.value = readLocalReactions(props.path);
});

watch(reacted, (newReacted) => {
  if (newReacted.length > 0) {
    writeLocalReactions(props.path, newReacted);
  }
});

const handleReaction = (name: string) => {
  if (name === "down") {
    return alert("你居然敢给我点踩？");
  }

  if (!reacted.value.includes(name)) {
    reacted.value = [...reacted.value, name];
    reactions.value = {
      ...reactions.value,
      [name]: (reactions.value[name] ?? 0) + 1,
    };
    addReaction(props.path, name);
  }
};

const reactedTypes = computed(() =>
  reactionTypes
    .filter((x) => reactions.value[x.name] > 0)
    .sort((a, b) => reactions.value[b.name] - reactions.value[a.name]),
);
const unreactedTypes = computed(() =>
  reactionTypes.filter((x) => !reactions.value[x.name]),
);
</script>
