<template>
  <canvas class="hidden" ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import snowflakeURL from "~/assets/snowflake.svg";

function generateSnow() {
  return {
    x: Math.random(),
    t: Math.random(),
    a: Math.random(),
    s: Math.random(),
    r: Math.random(),
  };
}

type Snow = ReturnType<typeof generateSnow>;

const canvas = ref<HTMLCanvasElement | null>(null);

let stop = false;
const ctrl = new AbortController();

onMounted(() => {
  const today = new Date();
  if (
    today.getMonth() == 11 &&
    24 <= today.getDate() &&
    today.getDate() <= 25
  ) {
    console.log("Merry Chistmas!!");
  } else {
    // skip easter egg
    return;
  }

  const cvs = canvas.value!;
  cvs.classList.remove("hidden");
  cvs.classList.add("fixed", "top-0", "left-0", "pointer-events-none");

  const ctx = cvs.getContext("2d");
  if (!ctx) {
    throw new Error("Hello IE user!");
  }
  ctx.imageSmoothingEnabled = false;

  const snowflake = new Image();

  const snows: Snow[] = [];
  for (let i = 0; i < 100; ++i) snows.push(generateSnow());

  const render = () => {
    if (!stop) requestAnimationFrame(render);

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    const time = Date.now() / 20000;

    for (const snow of snows) {
      const t = (snow.t + time) % 1;
      const size = (snow.s * 0.5 + 0.5) * 1.5;
      const alpha = snow.a * 0.5 + 0.5;
      const rotate = t * snow.r * Math.PI * 10;

      const x = (snow.x * 1.5 - 0.25) * cvs.width;
      const y = (t * 1.5 - 0.25) * cvs.height;

      ctx.rotate(0.1);
      ctx.translate(x, y);
      ctx.rotate(rotate);
      ctx.scale(size, size);
      ctx.globalAlpha = alpha;

      ctx.drawImage(
        snowflake,
        -snowflake.width / 2,
        -snowflake.height / 2,
        snowflake.width,
        snowflake.height,
      );

      ctx.scale(1 / size, 1 / size);
      ctx.rotate(-rotate);
      ctx.translate(-x, -y);
      ctx.rotate(-0.1);
    }
  };

  snowflake.src = snowflakeURL;
  snowflake.onload = () => requestAnimationFrame(render);

  const resize = () => {
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
  };
  resize();
  addEventListener("resize", resize, { signal: ctrl.signal });
});

onUnmounted(() => {
  stop = true;
  ctrl.abort();
});
</script>
