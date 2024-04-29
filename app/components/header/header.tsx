import { Link } from "@biliblitz/blitz";
import { header } from "~/metadata.json";

import { BookIcon, HomeIcon, LinkIcon, MusicIcon } from "lucide-preact";
import { useRef } from "preact/hooks";
import bgm from "~/assets/audio/bgm.mp3";

const underline = "border-b-[1px] border-transparent hover:border-slate-200";

export const Header = () => {
  const ref = useRef<HTMLAudioElement>(null);

  return (
    <header class="mx-6 mb-4 flex shrink-0 justify-between pt-6 font-serif">
      <span>
        <Link href="/" class={`inline-flex items-center gap-2 ${underline}`}>
          <HomeIcon class="h-4 w-4" />
          {header}
        </Link>
      </span>

      <span class="inline-flex items-center gap-4">
        <span
          class={`inline-flex cursor-pointer items-center gap-2 ${underline}`}
          onClick={() => {
            if (ref.current) {
              if (ref.current.paused) {
                ref.current.play();
              } else {
                ref.current.pause();
              }
            }
          }}
        >
          <audio src={bgm} loop ref={ref} hidden />
          <MusicIcon class="h-4 w-4" />
          背景音乐
        </span>
        <Link
          href="/about"
          class={`inline-flex items-center gap-2 ${underline}`}
        >
          <BookIcon class="h-4 w-4" />
          关于
        </Link>
        <Link
          href="/friend"
          class={`inline-flex items-center gap-2 ${underline}`}
        >
          <LinkIcon class="h-4 w-4" />
          友链
        </Link>
      </span>
    </header>
  );
};
