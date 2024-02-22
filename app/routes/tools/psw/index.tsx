import { meta$ } from "@biliblitz/blitz/server";
import {
  Signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
import { JSX } from "preact/jsx-runtime";

// @ts-ignore
import md5 from "blueimp-md5";
import { useEffect } from "preact/hooks";

export const meta = meta$(() => {
  return { title: "鸡肋的哈希密码生成器" };
});

function Input(
  props: JSX.HTMLAttributes<HTMLInputElement> & {
    bind: Signal<string>;
  },
) {
  const { bind, ...remains } = props;

  return (
    <input
      {...remains}
      class="w-64 font-mono"
      value={bind}
      onInput={(e) => (bind.value = e.currentTarget.value)}
    />
  );
}

function hash(str: string, key: string, times: number) {
  if (!times) return str;
  return hash(md5(str + key), str, times - 1);
}
function main(str1: string, str2: string, str3: string, type: string) {
  const h1 = hash(str1, str2, 10);
  const h2 = hash(str2, str3, 10);
  const h3 = hash(str3, str1, 10);
  const h4 = hash(str1, str3, 10);
  const h5 = hash(str2, str1, 10);
  const h6 = hash(str3, str2, 10);
  const r1 = hash(md5(h1 + h2 + h3), type, 10);
  const r2 = hash(md5(h4 + h5 + h6), type, 10);
  return btoa(hash(r1, r2, 10)).slice(0, 16);
}

function censor(password: string) {
  return password.slice(0, 4) + "*".repeat(8) + password.slice(-4);
}

export default () => {
  const psw1 = useSignal("");
  const psw2 = useSignal("");
  const psw3 = useSignal("");
  const namespace = useSignal("");

  const final = useSignal("****************");
  const strong = useComputed(() => final.value + "1%aA");
  const censored = useComputed(() => censor(final.value));

  const updatePassword = () => {
    final.value = main(psw1.value, psw2.value, psw3.value, namespace.value);
  };

  const copied = useSignal(false);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    copied.value = true;
  };

  return (
    <>
      <h1>鸡肋的哈希密码生成器</h1>

      <p class="flex flex-wrap gap-4">
        <span>第一密码</span>
        <Input type="password" bind={psw1} autocomplete="false" />
      </p>
      <p class="flex flex-wrap gap-4">
        <span>第二密码</span>
        <Input type="password" bind={psw2} autocomplete="false" />
      </p>
      <p class="flex flex-wrap gap-4">
        <span>第三密码</span>
        <Input type="password" bind={psw3} autocomplete="false" />
      </p>
      <p class="flex flex-wrap gap-4">
        <span>作用空间</span>
        <Input
          type="text"
          bind={namespace}
          autocomplete="false"
          onFocus={updatePassword}
          onChange={updatePassword}
        />
        {copied.value && <span>已复制</span>}
      </p>

      <p class="flex flex-wrap gap-4">
        <span>最终结果</span>
        <code class="font-mono">{censored}</code>
        <button
          class="cursor-pointer underline"
          onClick={() => copy(final.value)}
        >
          字母数字
        </button>
        <button
          class="cursor-pointer underline"
          onClick={() => copy(strong.value)}
        >
          带符号
        </button>
      </p>
    </>
  );
};
