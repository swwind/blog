<template>
  <header class="mx-6 mb-4 flex shrink-0 justify-between pt-6 font-serif">
    <span>
      <router-link
        to="/"
        :class="`inline-flex items-center gap-2 ${underline}`"
      >
        <HomeIcon class="h-4 w-4" />
        <span class="hidden md:inline-block">{{ header }}</span>
        <span class="inline-block md:hidden">首页</span>
      </router-link>
    </span>

    <span class="inline-flex items-center gap-4">
      <span
        class="hidden cursor-pointer items-center gap-2 md:inline-flex"
        :class="underline"
        @click="toggleTrack"
      >
        <audio loop ref="audioRef" hidden />
        <MusicIcon class="h-4 w-4" />
        背景音乐 - {{ trackName }}
      </span>

      <router-link
        to="/tools/"
        :class="`inline-flex items-center gap-2 ${underline}`"
      >
        <WrenchIcon class="h-4 w-4" />
        工具
      </router-link>

      <router-link
        to="/about/"
        :class="`inline-flex items-center gap-2 ${underline}`"
      >
        <BookIcon class="h-4 w-4" />
        关于
      </router-link>

      <router-link
        to="/friend/"
        :class="`inline-flex items-center gap-2 ${underline}`"
      >
        <LinkIcon class="h-4 w-4" />
        友链
      </router-link>
    </span>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { header } from "@/metadata.json";

import {
  BookIcon,
  HomeIcon,
  LinkIcon,
  MusicIcon,
  WrenchIcon,
} from "lucide-vue-next";

import arknights from "@/assets/audio/arknights.mp3";
import spacewalk from "@/assets/audio/space_walk.mp3";
import oniichan from "@/assets/audio/oniichan.mp3";

const underline = "border-b-[1px] border-transparent hover:border-slate-200";

const tracks = [
  { src: arknights, name: "Arknights" },
  { src: spacewalk, name: "太空漫步" },
  { src: oniichan, name: "哦哈哟～欧尼酱～" },
];

const audioRef = ref<HTMLAudioElement | null>(null);
const id = ref<number | null>(null);

const track = computed(() => (id.value === null ? null : tracks[id.value]));
const trackName = computed(() => track.value?.name || "关");
const trackSrc = computed(() => track.value?.src || tracks[0].src);

watch(id, (newId) => {
  const audio = audioRef.value!;

  if (newId === null) {
    audio.pause();
  } else {
    audio.src = trackSrc.value;
    audio.oncanplay = () => audio.play();
  }
});

const toggleTrack = () => {
  id.value =
    id.value === null
      ? 0
      : id.value === tracks.length - 1
        ? null
        : id.value + 1;
};
</script>
