import { useEffect, useRef } from "preact/hooks";
import katex from "katex";

import "katex/dist/katex.css";

type Props = {
  mode: "inline" | "display";
  content: string;
};

export function Katex(props: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    katex.render(props.content, ref.current!, {
      displayMode: props.mode === "display",
      throwOnError: false,
    });
  }, [props.mode, props.content]);

  return <span ref={ref} data-katex={props.content}></span>;
}
