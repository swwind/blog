import { useEffect, useRef } from "preact/hooks";
import { TurnstileObject } from "turnstile-types";

const TURNSTILE_CALLBACK = "cf__reactTurnstileOnLoad";
const TURNSTILE_URL = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${TURNSTILE_CALLBACK}&render=explicit`;

declare global {
  interface Window {
    [TURNSTILE_CALLBACK]?: () => void;
    turnstile?: TurnstileObject;
  }
}

let status: "idle" | "waiting" | "done" = "idle";
const waitingPromises: {
  resolve: (t: TurnstileObject) => void;
  reject: (e: ErrorEvent) => void;
}[] = [];

if (typeof window !== "undefined") {
  window[TURNSTILE_CALLBACK] = () => {
    status = "done";
    if (!window.turnstile) throw new Error("Turnstile failed to load");
    waitingPromises.forEach(({ resolve }) => resolve(window.turnstile!));
  };
}

function loadTurnstile() {
  const script = document.createElement("script");
  script.async = true;
  script.src = TURNSTILE_URL;
  script.addEventListener("error", (e) => {
    waitingPromises.forEach(({ reject }) => reject(e));
  });
  document.head.appendChild(script);
}

export function ensureTurnstile() {
  if (status === "idle") {
    status = "waiting";
    loadTurnstile();
  }

  if (status === "waiting") {
    return new Promise<TurnstileObject>((resolve, reject) => {
      waitingPromises.push({ resolve, reject });
    });
  }

  return Promise.resolve(window.turnstile!);
}

type Props = {
  sitekey: string;
};

export function Turnstile(props: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    (async (div) => {
      const turnstile = await ensureTurnstile();

      turnstile.render(div, {
        sitekey: props.sitekey,
        language: "zh",
      });
    })(ref.current);
  }, []);

  return <div ref={ref}></div>;
}
