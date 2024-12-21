const chacha20KeyExpand = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

function add(a: number, b: number) {
  return Number((BigInt(a >>> 0) + BigInt(b >>> 0)) & 0xffffffffn);
}

function rol(a: number, b: number) {
  const aa = BigInt(a >>> 0),
    bb = BigInt(b >>> 0);
  return Number(((aa << bb) | (aa >> (32n - bb))) & 0xffffffffn);
}

function xor(a: number, b: number) {
  return a ^ b;
}

function chacha20Round(
  x: number[],
  a: number,
  b: number,
  c: number,
  d: number,
) {
  x[a] = add(x[a], x[b]);
  x[d] = xor(x[d], x[a]);
  x[d] = rol(x[d], 16);

  x[c] = add(x[c], x[d]);
  x[b] = xor(x[b], x[c]);
  x[b] = rol(x[b], 12);

  x[a] = add(x[a], x[b]);
  x[d] = xor(x[d], x[a]);
  x[d] = rol(x[d], 8);

  x[c] = add(x[c], x[d]);
  x[b] = xor(x[b], x[c]);
  x[b] = rol(x[b], 7);
}

function chacha20Qround(x: number[]) {
  chacha20Round(x, 0, 4, 8, 12);
  chacha20Round(x, 1, 5, 9, 13);
  chacha20Round(x, 2, 6, 10, 14);
  chacha20Round(x, 3, 7, 11, 15);
  chacha20Round(x, 0, 5, 10, 15);
  chacha20Round(x, 1, 6, 11, 12);
  chacha20Round(x, 2, 7, 8, 13);
  chacha20Round(x, 3, 4, 9, 14);
}

function chacha20StateFromKey(
  key: Uint8Array, // length = 32
  counter: number,
  nonce: Uint8Array, // length = 12
) {
  const key32 = new Uint32Array(key.buffer); // length = 8
  const nonce32 = new Uint32Array(nonce.buffer); // length = 3

  return new Uint32Array([
    ...chacha20KeyExpand,
    ...key32,
    counter,
    ...nonce32,
  ]);
}

function chacha20(
  state: Uint32Array, // length = 16
) {
  const x = [...state];
  for (let i = 0; i < 10; ++i) {
    chacha20Qround(x);
  }
  for (let i = 0; i < 16; ++i) {
    state[i] = add(state[i], x[i]);
  }
}

export function encrypt(
  key: Uint8Array, // length = 32
  nonce: Uint8Array, // length = 12
  message: Uint8Array,
) {
  const cipher = new Uint8Array(message.length);
  for (let i = 0; i < message.length; i += 64) {
    const state = chacha20StateFromKey(key, (i >> 6) + 1, nonce);
    chacha20(state);
    const buffer = new Uint8Array(state.buffer);
    for (let j = 0; j < 64 && i + j < message.length; ++j) {
      cipher[i + j] = message[i + j] ^ buffer[j];
    }
  }
  return cipher;
}
