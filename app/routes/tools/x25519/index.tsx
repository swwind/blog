import { meta$ } from "@biliblitz/blitz/server";
import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";

export const meta = meta$(() => {
  return { title: "生成炫酷的 ECDH 密钥对" };
});

export default () => {
  const logs = useSignal("");

  const startRef = useRef<HTMLInputElement>(null);
  const includeRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const curveRef = useRef<HTMLSelectElement>(null);

  const pubKey = useSignal("");
  const privKey = useSignal("");

  const buttonRef = useRef<HTMLButtonElement>(null);

  const callback = async () => {
    buttonRef.current!.disabled = true;

    const start = startRef.current?.value || "";
    const include = includeRef.current?.value || "";
    const end = endRef.current?.value || "";
    const curve = curveRef.current?.value || "P-256";

    async function arrayBufferToBase64(array: ArrayBuffer) {
      return new Promise<string>((resolve) => {
        const blob = new Blob([array]);
        const reader = new FileReader();

        reader.onload = (event) => {
          const dataUrl = event.target!.result as string;
          resolve(dataUrl.split(",")[1]);
        };

        reader.readAsDataURL(blob);
      });
    }

    async function generateKeys() {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: curve,
        },
        true,
        ["deriveBits"],
      );

      const publicKeyBuffer = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey,
      );
      const privateKeyBuffer = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey,
      );

      const publicKey = await arrayBufferToBase64(publicKeyBuffer);
      if (
        !publicKey.startsWith(start) ||
        !publicKey.endsWith(end) ||
        !publicKey.includes(include)
      ) {
        return null;
      }
      const privateKey = await arrayBufferToBase64(privateKeyBuffer);

      return { publicKey, privateKey };
    }

    let total = 0;
    while (true) {
      const success = await generateKeys();

      if (!success) {
        total++;
        logs.value = `Try: #${total}`;
        continue;
      }

      pubKey.value = success.publicKey;
      privKey.value = success.privateKey;
      break;
    }

    buttonRef.current!.disabled = false;
  };

  return (
    <>
      <h1>生成炫酷的 ECDH 密钥对</h1>

      <p class="flex flex-wrap gap-4">
        <span>公钥开头字符</span>
        <input type="text" class="w-64 font-mono" ref={startRef} />
      </p>
      <p class="flex flex-wrap gap-4">
        <span>公钥包含字符</span>
        <input type="text" class="w-64 font-mono" ref={includeRef} />
      </p>
      <p class="flex flex-wrap gap-4">
        <span>公钥结束字符</span>
        <input type="text" class="w-64 font-mono" ref={endRef} />
      </p>
      <p class="flex flex-wrap gap-4">
        <span>曲线</span>
        <select ref={curveRef}>
          <option value="P-256">P-256</option>
          <option value="P-384">P-384</option>
          <option value="P-521">P-521</option>
        </select>
      </p>

      <p class="flex flex-wrap items-center gap-4">
        <button class="border px-4 py-1" onClick={callback} ref={buttonRef}>
          生成
        </button>
        <span>{logs}</span>
      </p>

      <p class="flex flex-wrap gap-4">
        <span>公钥</span>
        <span class="break-all font-mono">{pubKey}</span>
      </p>
      <p class="flex flex-wrap gap-4">
        <span>私钥</span>
        <span class="break-all font-mono">{privKey}</span>
      </p>
    </>
  );
};
