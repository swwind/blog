import { meta$ } from "@biliblitz/blitz/server";
import { useRef } from "preact/hooks";
import { encodeGBK } from "~/utils/gbk.ts";

export const meta = meta$((_c, prev) => {
  prev.title = "锟斤拷生成器";
});

export default () => {
  const ref = useRef<HTMLInputElement>(null);
  const res = useRef<HTMLSpanElement>(null);

  const callback = () => {
    const text = ref.current?.value || "";
    const step1 = encodeGBK(text);
    const step2 = new TextDecoder().decode(step1);
    const step3 = new TextEncoder().encode(step2);
    const final = new TextDecoder("gbk").decode(step3);
    res.current && (res.current.textContent = final);
  };

  return (
    <>
      <h2>锟斤拷生成器</h2>

      <p class="flex flex-wrap items-baseline gap-4">
        <span>原文</span>
        <input
          type="text"
          class="w-64 font-mono"
          ref={ref}
          onInput={callback}
        />
      </p>

      <p class="flex flex-wrap items-baseline gap-4">
        <span>密文</span>
        <span ref={res}></span>
      </p>
    </>
  );
};
