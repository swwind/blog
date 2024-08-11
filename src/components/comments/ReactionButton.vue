<template>
  <button :class="[button, reacted ? selected : unselected]" @click="callback">
    <span class="text-sm">{{ icon }}</span>
    <span class="text-sm">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const button = "flex items-center gap-2 rounded-full px-3 py-1";
const selected =
  "dark:bg-slate-600 dark:text-slate-200 bg-slate-800 text-slate-100";
const unselected = "border border-slate-600";

const props = defineProps<{
  icon: string;
  label: string | number;
  reacted: boolean;
  prevention: boolean;
}>();
const emits = defineEmits<{
  (e: "click"): void;
}>();

const mygo = [
  "您是不是点错了？",
  "真的要点踩吗？",
  "真的不能再给我一次机会了吗？",
  "您真的要这么残忍吗？",
  "你在生气对吧…？",
  "真的很对不起",
  "至少见一面让我当面道歉好吗？",
  "你总是做一些我不希望你做的事",
  "只要是我能做的，我什么都愿意做",
  "像个傻瓜一样",
  "让我来结束这一切吧",
];

let count = 0;

const callback = () => {
  if (props.prevention && count < mygo.length) {
    alert(mygo[count++]);
  } else {
    emits("click");
  }
};
</script>
