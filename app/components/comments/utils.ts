import manifest from "../../metadata.json";
import md5 from "blueimp-md5";

export type Comment = {
  id: string;
  name: string;
  // site: string;
  // avatar: string;
  content: string;
  time: number;
  userAgent: string;
  pubkey: string;
  hash: string;
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
