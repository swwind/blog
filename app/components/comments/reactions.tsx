import { ThumbsDown, ThumbsUp } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { origin } from "./comments.tsx";

type ReactionsProps = {
  path: string;
};

const selected =
  "dark:bg-slate-600 dark:text-slate-200 bg-slate-800 text-slate-100";
const unselected = "border border-slate-600";

const button = "flex items-center gap-2 rounded-full px-3 py-1";
const hidden = "cursor-default pointer-events-none opacity-0";
const block = "cursor-default";

let count = 0;
const mygo = [
  "要不要再思考一下？",
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

function onThumbDown(callback: () => void) {
  const now = count++;
  if (now < mygo.length) {
    return alert(mygo[now]);
  }
  callback();
}

async function addReaction(path: string, name: string) {
  const response = await fetch(origin + `/reactions/${path}/${name}`, {
    method: "POST",
  });
  return (await response.json()) as { updated: number };
}

type Reactions = Record<string, number>;

async function getReactions(path: string, signal: AbortSignal) {
  const response = await fetch(origin + `/reactions/${path}`, { signal });
  return (await response.json()) as Reactions;
}

function readLocalReactions(path: string) {
  return (localStorage.getItem(`reactions:${path}`) || "")
    .split(",")
    .filter((x) => x !== "");
}

function writeLocalReactions(path: string, reactions: string[]) {
  localStorage.setItem(`reactions:${path}`, reactions.join(","));
}

export function Reactions(props: ReactionsProps) {
  const [first, setFirst] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Reactions>({});

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      const reactions = await getReactions(props.path, ctrl.signal);
      setReactions(reactions);
      setLoading(false);
    })();
    return () => ctrl.abort();
  }, []);

  const [reacted, setReacted] = useState<string[]>([]);

  useEffect(() => {
    setReacted(readLocalReactions(props.path));
  }, []);

  useEffect(() => {
    if (reacted.length > 0) {
      writeLocalReactions(props.path, reacted);
    }
  }, [reacted]);

  const up = reactions["up"] ?? 0;
  const down = reactions["down"] ?? 0;

  return (
    <div class="mx-6 my-3 flex gap-2">
      <button
        class={[button, reacted.includes("up") ? selected : unselected].join(
          " ",
        )}
        onClick={async () => {
          if (!reacted.includes("up")) {
            const { updated } = await addReaction(props.path, "up");
            setReacted((reacted) => [...reacted, "up"]);
            setReactions((reactions) => ({ ...reactions, up: updated }));
          }
        }}
      >
        <ThumbsUp class="h-4 w-4" />
        <span class="text-sm">{loading ? "…" : up}</span>
      </button>
      <button
        class={[
          button,
          reacted.includes("down") ? selected : unselected,
          first ? hidden : block,
        ].join(" ")}
        onMouseEnter={() => setFirst(true)}
        onClick={() =>
          onThumbDown(async () => {
            if (!reacted.includes("down")) {
              const { updated } = await addReaction(props.path, "down");
              setReacted((reacted) => [...reacted, "down"]);
              setReactions((reactions) => ({ ...reactions, down: updated }));
            }
          })
        }
      >
        <ThumbsDown class="h-4 w-4" />
        <span class="text-sm">{loading ? "…" : down}</span>
      </button>
      <button
        class={[
          button,
          reacted.includes("down") ? selected : unselected,
          first ? block : hidden,
        ].join(" ")}
        onMouseEnter={() => setFirst(false)}
        onClick={() =>
          onThumbDown(async () => {
            if (!reacted.includes("down")) {
              const { updated } = await addReaction(props.path, "down");
              setReacted((reacted) => [...reacted, "down"]);
              setReactions((reactions) => ({ ...reactions, down: updated }));
            }
          })
        }
      >
        <ThumbsDown class="h-4 w-4" />
        <span class="text-sm">{loading ? "…" : down}</span>
      </button>
    </div>
  );
}
