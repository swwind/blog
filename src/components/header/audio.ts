export function createSeamlessPlayer() {
  const ctx = new AudioContext();

  let introBuffer: AudioBuffer | null = null;
  let loopBuffer: AudioBuffer | null = null;

  let introSource: AudioBufferSourceNode | null = null;
  let loopSource: AudioBufferSourceNode | null = null;

  async function loadAudio(url: string) {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  async function load({ intro, loop }: { intro: string; loop: string }) {
    [introBuffer, loopBuffer] = await Promise.all([
      loadAudio(intro),
      loadAudio(loop),
    ]);
  }

  function play() {
    if (!introBuffer || !loopBuffer) {
      throw new Error("Audio not loaded");
    }

    const now = ctx.currentTime;

    // intro
    introSource = ctx.createBufferSource();
    introSource.buffer = introBuffer;
    introSource.connect(ctx.destination);

    // loop
    loopSource = ctx.createBufferSource();
    loopSource.buffer = loopBuffer;
    loopSource.loop = true;
    loopSource.connect(ctx.destination);

    // 精确调度
    introSource.start(now);
    loopSource.start(now + introBuffer.duration);
  }

  function stop() {
    try {
      introSource?.stop();
    } catch {}
    try {
      loopSource?.stop();
    } catch {}
    introSource = null;
    loopSource = null;
  }

  async function resume() {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  return {
    load,
    play,
    stop,
    resume,
    get context() {
      return ctx;
    },
  };
}
