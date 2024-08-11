import manifest from "../../metadata.json";
import { isDev } from "@biliblitz/blitz/utils";
import md5 from "blueimp-md5";

export type Comment = {
  id: string;
  name: string;
  content: string;
  time: number;
  userAgent: string;
  pubkey: string;
  hash: string;
};

export const origin = isDev
  ? "http://localhost:8787"
  : manifest["comment-api-origin"];

export const sitekey = isDev
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

export function generateUserHash(pubkey: string) {
  return (parseInt(md5(pubkey).toLowerCase(), 16) % 10000)
    .toString()
    .padStart(4, "0");
}

export function weakRandomString() {
  let x = "";
  for (let i = 0; i < 24; ++i) {
    x += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return x;
}

export async function fetchComments(path: string) {
  const response = await fetch(`${origin}/comments?path=${path}`);
  return (await response.json()) as {
    count: number;
    path: string;
    comments: Comment[];
  };
}

export async function createComment(formData: FormData) {
  const response = await fetch(`${origin}/comment`, {
    method: "POST",
    body: formData,
  });
  if (response.status !== 200) {
    return {
      ok: false as const,
      error: await response.text(),
    };
  }
  return (await response.json()) as {
    ok: true;
    key: string;
    comment: Comment;
  };
}

export function toVersionString(something: {
  name: string | undefined;
  version: string | undefined;
}) {
  if (something.name) {
    if (something.version) return `${something.name}/${something.version}`;
    return something.name;
  }
  return null;
}

export async function removeComment(path: string, uuid: string, key: string) {
  const formData = new FormData();
  formData.append("path", path);
  formData.append("uuid", uuid);
  formData.append("key", key);
  const response = await fetch(`${origin}/delete`, {
    method: "POST",
    body: formData,
  });
  return (await response.json()) as { ok: true };
}

export async function addReaction(path: string, name: string) {
  const response = await fetch(origin + `/reactions/${path}/${name}`, {
    method: "POST",
  });
  return (await response.json()) as { updated: number };
}

export type ReactionRecord = Record<string, number>;

export async function getReactions(path: string) {
  const response = await fetch(`${origin}/reactions/${path}`);
  return (await response.json()) as ReactionRecord;
}

export function readLocalReactions(path: string) {
  return (localStorage.getItem(`reactions:${path}`) || "")
    .split(",")
    .filter((x) => x !== "");
}

export function writeLocalReactions(path: string, reactions: string[]) {
  localStorage.setItem(`reactions:${path}`, reactions.join(","));
}
