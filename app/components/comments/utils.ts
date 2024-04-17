import { exportPublicKey, sign } from "~/utils/crypto.ts";
import manifest from "../../metadata.json";
import md5 from "blueimp-md5";

export async function signAddComment(
  formData: FormData,
  pubkey: CryptoKey,
  seckey: CryptoKey,
) {
  const path = formData.get("path") as string;
  const name = formData.get("name") as string;
  // const site = formData.get("site") as string;
  // const avatar = formData.get("avatar") as string;
  const content = formData.get("content") as string;

  const data = JSON.stringify({
    path,
    name,
    // site,
    // avatar,
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

export type Comment = {
  id: string;
  name: string;
  // site: string;
  // avatar: string;
  content: string;
  time: number;
  userAgent: string;
  pubkey: string;
};

export const origin = import.meta.env.DEV
  ? "http://localhost:8787"
  : manifest["comment-api-origin"];

export const sitekey = import.meta.env.DEV
  ? "1x00000000000000000000AA"
  : manifest["cf-sitekey"];

const github = (id: string) => `https://github.com/${id}.png`;
const qq = (id: string) => `https://q1.qlogo.cn/g?b=qq&nk=${id}&s=100`;
const gravatar = (hash: string) =>
  `https://gravatar.com/avatar/${hash}.jpg?s=100`;

export function getAvatarURL(avatar: string) {
  if (!avatar) return null;
  if (avatar.startsWith("gh:")) return github(avatar.slice(3));
  if (avatar.startsWith("qq:")) return qq(avatar.slice(3));
  return gravatar(
    avatar.length === 32 && /^[a-z0-9]$/.test(avatar) ? avatar : md5(avatar),
  );
}
