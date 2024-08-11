<template>
  <div class="mx-6 my-3 flex gap-2">
    <ReactionButton
      v-for="{ name, icon } in reactionTypes"
      :key="name"
      :label="loading ? '…' : reactions[name] || 0"
      :reacted="reacted.includes(name)"
      :icon="icon"
      :prevention="name === 'down'"
      @click="handleReaction(name)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import ReactionButton from "./ReactionButton.vue";
import {
  addReaction,
  getReactions,
  readLocalReactions,
  writeLocalReactions,
  type ReactionRecord,
} from "./utils.ts";

const props = defineProps<{
  path: string;
}>();

const reactionTypes = [
  { name: "up", icon: "👍" },
  { name: "down", icon: "👎" },
  { name: "clown", icon: "🤡" },
  { name: "grinning", icon: "😅" },
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
  if (!reacted.value.includes(name)) {
    reacted.value = [...reacted.value, name];
    reactions.value = {
      ...reactions.value,
      [name]: (reactions.value[name] ?? 0) + 1,
    };
    addReaction(props.path, name);
  }
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
