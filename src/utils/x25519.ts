import { decodeBase64, encodeBase64 } from "@std/encoding";

export function genkey() {
  const seckey = crypto.getRandomValues(new Uint8Array(32));
  seckey[0] &= 0xf8;
  seckey[31] = (seckey[31] & 0x7f) | 0x40;
  return encodeBase64(seckey);
}

const p = (1n << 255n) - 19n;

function fastpow(x: bigint, y: bigint) {
  let z = 1n;
  for (; y > 0n; y >>= 1n, x = (x * x) % p) {
    if (y & 1n) z = (z * x) % p;
  }
  return z;
}

function inverse(x: bigint) {
  return fastpow(x, p - 2n);
}

function scalarmult(scalar: Uint8Array, base: bigint) {
  let a = 1n,
    b = base,
    c = 0n,
    d = 1n,
    e: bigint,
    f: bigint;
  for (let i = 254; i >= 0; --i) {
    const bit = (scalar[i >> 3] >> (i & 7)) & 1;
    [a, b, c, d] = bit ? [b, a, d, c] : [a, b, c, d];
    e = (a + c) % p;
    a = (a - c + p) % p;
    c = (b + d) % p;
    b = (b - d + p) % p;
    d = (e * e) % p;
    f = (a * a) % p;
    a = (c * a) % p;
    c = (b * e) % p;
    e = (a + c) % p;
    a = (a - c + p) % p;
    b = (a * a) % p;
    c = (d - f + p) % p;
    a = (c * 121665n) % p;
    a = (a + d) % p;
    c = (c * a) % p;
    a = (d * f) % p;
    d = (b * base) % p;
    b = (e * e) % p;
    [a, b, c, d] = bit ? [b, a, d, c] : [a, b, c, d];
  }
  return (a * inverse(c)) % p;
}

function unpack(x: bigint) {
  const arr = new Uint8Array(32);
  for (let i = 0; i < 32; ++i) {
    arr[i] = Number((x >> BigInt(i * 8)) & 0xffn);
  }
  return arr;
}

function pack(buffer: Uint8Array) {
  let result = 0n;
  for (let i = 31; i >= 0; --i) {
    result = result * 256n + BigInt(buffer[i]);
  }
  return result;
}

export function pubkey(seckey: string) {
  const sec = decodeBase64(seckey);
  const pub = scalarmult(sec, 9n);
  return encodeBase64(unpack(pub));
}

export function ecdh(seckey: string, pubkey: string) {
  const sec = decodeBase64(seckey);
  const pub = pack(decodeBase64(pubkey));
  const key = scalarmult(sec, pub);
  return encodeBase64(unpack(key));
}
