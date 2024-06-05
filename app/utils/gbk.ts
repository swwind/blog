const ranges = [
  // GBK/1
  [0xa1, 0xa9, 0xa1, 0xfe],
  // GBK/2
  [0xb0, 0xf7, 0xa1, 0xfe],
  // GBK/3
  [0x81, 0xa0, 0x40, 0xfe],
  // GBK/4
  [0xaa, 0xfe, 0x40, 0xa0],
  // GBK/5
  [0xa8, 0xa9, 0x40, 0xa0],
  // user defined 1
  [0xaa, 0xaf, 0xa1, 0xfe],
  // user defined 2
  [0xf8, 0xfe, 0xa1, 0xfe],
  // user defined 3
  [0xa1, 0xa7, 0x40, 0xa0],
];

const codes = new Uint16Array(23940);
let i = 0;

for (const [b1Begin, b1End, b2Begin, b2End] of ranges) {
  for (let b2 = b2Begin; b2 <= b2End; b2++) {
    if (b2 !== 0x7f) {
      for (let b1 = b1Begin; b1 <= b1End; b1++) {
        codes[i++] = (b2 << 8) | b1;
      }
    }
  }
}
const str = new TextDecoder("gbk").decode(codes);

// 编码表
const table = new Uint16Array(65536);
for (let i = 0; i < str.length; i++) {
  table[str.charCodeAt(i)] = codes[i];
}

export function encodeGBK(str: string) {
  const buf = new Uint8Array(str.length * 2);
  let n = 0;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      buf[n++] = code;
    } else {
      const gbk = table[code];
      buf[n++] = gbk & 0xff;
      buf[n++] = gbk >> 8;
    }
  }
  return buf.subarray(0, n);
}
