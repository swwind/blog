import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { origin } from "./utils.ts";

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

function onThumbDown(callback: () => void) {
  let count = 0;
  return () => {
    if (count < mygo.length) {
      alert(mygo[count++]);
    } else {
      callback();
    }
  };
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

type ReactionsProps = {
  path: string;
};

const selected =
  "dark:bg-slate-600 dark:text-slate-200 bg-slate-800 text-slate-100";
const unselected = "border border-slate-600";

const button = "flex items-center gap-2 rounded-full px-3 py-1";

type ReactionButtonProps = {
  reacted: boolean;
  onClick: () => void;
  icon: string;
  label: string | number;
  prevention: boolean;
};

function ReactionButton(props: ReactionButtonProps) {
  const callback = useMemo(() => {
    return props.prevention ? onThumbDown(props.onClick) : props.onClick;
  }, [props.prevention, props.onClick]);

  return (
    <button
      class={[button, props.reacted ? selected : unselected].join(" ")}
      onClick={() => callback()}
    >
      <span class="text-sm">{props.icon}</span>
      <span class="text-sm">{props.label}</span>
    </button>
  );
}

const reactionTypes = [
  { name: "up", icon: "👍" },
  { name: "down", icon: "👎" },
  { name: "clown", icon: "🤡" },
  { name: "grinning", icon: "😅" },
];

export function Reactions(props: ReactionsProps) {
  const [loading, setLoading] = useState(true);
  const [reacted, setReacted] = useState<string[]>([]);
  const [reactions, setReactions] = useState<Reactions>({});

  useEffect(() => {
    const ctrl = new AbortController();
    getReactions(props.path, ctrl.signal).then((reactions) => {
      setReactions(reactions);
      setLoading(false);
    });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    setReacted(readLocalReactions(props.path));
  }, []);

  useEffect(() => {
    if (reacted.length > 0) {
      writeLocalReactions(props.path, reacted);
    }
  }, [reacted]);

  return (
    <div class="mx-6 my-3 flex gap-2">
      {reactionTypes.map(({ name, icon }) => (
        <ReactionButton
          label={loading ? "…" : reactions[name] || 0}
          reacted={reacted.includes(name)}
          icon={icon}
          onClick={() => {
            if (!reacted.includes(name)) {
              setReacted((reacted) => [...reacted, name]);
              setReactions((reactions) => ({
                ...reactions,
                [name]: (reactions[name] ?? 0) + 1,
              }));
              addReaction(props.path, name);
            }
          }}
          prevention={name === "down"}
        />
      ))}
    </div>
  );
}
