import { exportPublicKey, sign } from "./crypto.ts";

export async function signAddComment(
  formData: FormData,
  pubkey: CryptoKey,
  seckey: CryptoKey,
) {
  const path = formData.get("path") as string;
  const name = formData.get("name") as string;
  const site = formData.get("site") as string;
  const avatar = formData.get("avatar") as string;
  const content = formData.get("content") as string;

  const data = JSON.stringify({
    path,
    name,
    site,
    avatar,
    content,
  });
  formData.append("pubkey", await exportPublicKey(pubkey));
  formData.append("sign", await sign(seckey, data));
}

export async function signDeleteComment(
  formData: FormData,
  pubkey: CryptoKey,
  seckey: CryptoKey,
) {
  const path = formData.get("path") as string;
  const uuid = formData.get("uuid") as string;

  const data = JSON.stringify({ path, uuid });
  formData.append("pubkey", await exportPublicKey(pubkey));
  formData.append("sign", await sign(seckey, data));
}
