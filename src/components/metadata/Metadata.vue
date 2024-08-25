<template>
  <div>
    <div class="info">
      <span>{{ author }}</span>
      <time>{{ yangliTime }}</time>
      <time v-if="updated">{{ `最后更新于 ${yangliUpdated}` }}</time>
      <span v-for="tag in tagList" :key="tag">#{{ tag }}</span>
    </div>

    <template v-if="outdate && yearsOld > 0">
      <hr />
      <p>
        <b>
          注意：距离本文最后一次更新已经超过
          {{ yearsOld }} 年，世界线的变动可能会导致故事走向
          <a
            href="https://moegirl.uk/Bad_End"
            referrerpolicy="no-referrer"
            target="_blank"
          >
            不同的结局
          </a>
          。
        </b>
      </p>
      <hr />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { toYangliCalendar } from "@/utils/chinese-calendar.ts";

const props = defineProps<{
  author: string;
  time: string;
  tags?: string;
  outdate?: boolean;
  updated?: string;
}>();

const time = computed(() => new Date(props.time));
const yearsOld = computed(() =>
  Math.floor(
    (Date.now() - new Date(props.updated || props.time).getTime()) /
      (365 * 24 * 60 * 60 * 1000),
  ),
);

const yangliTime = computed(() => toYangliCalendar(time.value));
const yangliUpdated = computed(
  () => props.updated && toYangliCalendar(new Date(props.updated)),
);

const tagList = computed(() => props.tags?.split(",") || []);
</script>
