import { Link } from "@biliblitz/blitz";
import { header } from "~/metadata.json";

import { BookIcon, HomeIcon, LinkIcon, MusicIcon } from "lucide-preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import arknights from "~/assets/audio/arknights.mp3";
import spacewalk from "~/assets/audio/space_walk.mp3";

const underline = "border-b-[1px] border-transparent hover:border-slate-200";

const tracks = [
  { src: arknights, name: "Arknights" },
  { src: spacewalk, name: "太空漫步" },
];

export const Header = () => {
  const ref = useRef<HTMLAudioElement>(null);

  const [id, setId] = useState<number | null>(null);

  const track = useMemo(() => (id === null ? null : tracks[id]), [id]);
  const trackName = useMemo(() => track?.name || "关", [track]);
  const trackSrc = useMemo(() => track?.src || tracks[0].src, [track]);

  useEffect(() => {
    if (id === null) {
      ref.current?.pause();
    } else {
      ref.current?.play();
    }
  }, [id]);

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
            setId((id) =>
              id === null ? 0 : id === tracks.length - 1 ? null : id + 1,
            );
          }}
        >
          <audio src={trackSrc} loop ref={ref} hidden />
          <MusicIcon class="h-4 w-4" />
          背景音乐 - {trackName}
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
