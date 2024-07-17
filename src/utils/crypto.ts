export async function arrayBufferToBase64(array: ArrayBuffer) {
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

export function stringToArrayBuffer(str: string) {
  const array = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    array[i] = str.charCodeAt(i);
  }
  return array.buffer;
}

export function base64ToArrayBuffer(str: string) {
  return stringToArrayBuffer(atob(str));
}

export async function generateKeys() {
  return await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );
}

export async function exportPublicKey(pubkey: CryptoKey) {
  const buffer = await crypto.subtle.exportKey("spki", pubkey);
  return arrayBufferToBase64(buffer);
}

export async function exportPrivateKey(seckey: CryptoKey) {
  const buffer = await crypto.subtle.exportKey("pkcs8", seckey);
  return arrayBufferToBase64(buffer);
}

export async function importPublicKey(pubkey: string) {
  return await crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(pubkey),
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"],
  );
}

export async function importPrivateKey(seckey: string) {
  return await crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(seckey),
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );
}

export async function sign(seckey: CryptoKey, content: string) {
  const buffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-512" },
    seckey,
    stringToArrayBuffer(content),
  );
  return arrayBufferToBase64(buffer);
}
