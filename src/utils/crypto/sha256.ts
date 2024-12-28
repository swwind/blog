import { encodeBase64 } from "@std/encoding";

export async function sha256(message: Uint8Array) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", message));
}

export async function verify(message: Uint8Array, tag: Uint8Array) {
  const mac = await sha256(message);
  // console.log(encodeBase64(mac), encodeBase64(tag))
  return encodeBase64(mac) === encodeBase64(tag);
}
