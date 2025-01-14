---
title: 基于 WebAssembly 软解 HEVC 视频
---

# 基于 WebAssembly 软解 HEVC 视频

<vue-metadata author="swwind" time="2023-4-3"></vue-metadata>

~~我一定是疯了~~

对于经常流浪在各大资源网站的用户，可以看到 HEVC 视频编码对于很多资源的发布者来说非常普遍，但是在浏览器中对于 HEVC 编码的支持却非常糟糕。目前来说，Mozilla 明确表示 Firefox 浏览器不会支持 HEVC 视频编码，而 Chrome 浏览器则表示只会在支持硬件解码的平台上支持 HEVC 编码。

因此，如果想要在浏览器中硬着头皮播放 HEVC 编码的视频，使用软解是无法避免的。但是希望您在准备开始研究 HEVC 的软解之前，确认自己确实无法避免使用 HEVC 编码，无论您是切换成 AVC，AV1 亦或者是 VP9 编码都能够获得非常好的支持。

本文仅作软解 HEVC 的实现教程，不涉及超出作者认知范围内的性能优化。

## 编译定制 ffmpeg

ffmpeg 本身支持的特性非常多，但是我们只需要的是对于 HEVC 编码视频字节流的解码功能，因此需要特殊定制 ffmpeg。

将 ffmpeg 仓库整个 clone 下来之后，可以通过 `./configure --help` 查看定制 ffmpeg 需要的所有参数。这里我们只需要一个 HEVC 的 parser 和 decoder 即可，其余的所有特性都可以关闭。

具体配置完成的编译脚本可以参考下文，注意在编译之前确保您已经安装了 Emscripten 工具链。编译的过程会比较慢，需要耐心等待。

```bash
#!/usr/bin/bash

set -e

LIB_TARGET="$PWD/ffmpeg-lib"

FFMPEG_FLAGS=(
  --cc=emcc
  --cxx=em++
  --ar=emar
  --nm=emnm
  --ranlib=emranlib
  --prefix=$LIB_TARGET
  --enable-cross-compile
  --target-os=none
  --arch=x86_64
  --cpu=generic
  --enable-gpl
  --enable-version3
  --disable-sdl2
  --disable-iconv
  --disable-runtime-cpudetect
  --disable-cuda-llvm
  --disable-programs
  --disable-doc
  --disable-avdevice
  --disable-swresample
  --disable-swscale
  --disable-postproc
  --disable-avformat
  --disable-avfilter
  --disable-everything
  --disable-debug
  --disable-asm
  --disable-fast-unaligned
  --disable-network
  --enable-parser=hevc
  --enable-decoder=hevc
)

[ -d "$LIB_TARGET" ] && rm -rf "$LIB_TARGET"
mkdir "$LIB_TARGET"

cd ffmpeg

emconfigure ./configure ${FFMPEG_FLAGS[@]}

emmake make
emmake make install
```

构建完成之后可以看到 `./ffmpeg-lib` 文件中出现了 `include`, `lib` 和 `share` 文件夹，说明定制版的 ffmpeg 编译成功。

## 使用 C 语言进行解码

编译完 ffmpeg 之后可以参考 `./ffmpeg-lib/share/decode_video.c` 文件夹下面的示例程序了解如何通过 libavcodec 解码 HEVC 视频流。

下面展示的是主要的解码过程，节选自上文提到的样例代码，有删改。

```cpp
static void decode(AVCodecContext *dec_ctx, AVFrame *frame, AVPacket *pkt)
{
    char buf[1024];
    int ret;

    ret = avcodec_send_packet(dec_ctx, pkt);
    if (ret < 0) {
        fprintf(stderr, "Error sending a packet for decoding\n");
        exit(1);
    }

    while (ret >= 0) {
        ret = avcodec_receive_frame(dec_ctx, frame);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
            return;
        else if (ret < 0) {
            fprintf(stderr, "Error during decoding\n");
            exit(1);
        }

        // Y data in frame->data[0]
        // U data in frame->data[1]
        // V data in frame->data[2]
    }
}

/* use the parser to split the data into frames */
int parse(uint8_t *data, size_t *data_size) {
    int ret;

    while (data_size > 0) {
        ret = av_parser_parse2(parser, c, &pkt->data, &pkt->size,
                                data, data_size, AV_NOPTS_VALUE, AV_NOPTS_VALUE, 0);
        if (ret < 0) {
            fprintf(stderr, "Error while parsing\n");
            exit(1);
        }
        data      += ret;
        data_size -= ret;

        if (pkt->size)
            decode(c, frame, pkt);
    }
}
```

注意到上面的代码逻辑比较复杂，会直接一口气将视频所有的帧画面都解析出来，不好控制解析视频帧的过程。

为了简化大部分操作，我们将这些具体的 API 函数都暴露出来，将具体的逻辑控制使用 js 代码实现。

具体的抽象可以参考我魔改过的 [`decode_video.c`](https://github.com/swwind/ffmpeg-hevc-wasm/blob/master/src/decode_video.c)。

## 编译 C 代码到 WebAssembly

`emcc` 支持将目标文件直接编译成 `.wasm` 文件，并且支持许多特性开关。

在这里我们需要将代码在 Web Worker 中使用，最后使用 `vite` 统一打包，因此大致需要以下参数进行编译。

```bash
#!/usr/bin/bash

set -e

[ -d build ] && rm -rf build
mkdir build

emcc src/decode_video.c \
  ffmpeg-lib/lib/libavcodec.a \
  ffmpeg-lib/lib/libavutil.a \
  -O2 \
  -I"ffmpeg-lib/include" \
  -s WASM=1 \
  -s MODULARIZE \
  -s ENVIRONMENT="worker" \
  -s MAXIMUM_MEMORY=67108864 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXPORT_ES6=1 \
  -s EXPORTED_RUNTIME_METHODS=ccall,cwrap \
  -o build/decode_video.js

sed -i 's/= import.meta.url/= undefined/g' build/decode_video.js
```

最后的 `sed` 是用来修复 [vite 不支持在 Web Worker 中使用 `import.meta.url`](https://github.com/vitejs/vite/issues/12611) 特性的暂时修复。如果您看到这个 Issue 已经被修复了，那么就可以去掉这句话。

编译成功之后就可以看到 `build/decode_video.js` 和 `build/decode_video.wasm` 文件。

## 使用 JavaScript 控制解码流程

首先我们将整个视频文件通过 fetch 下载下来，并通过下面的代码将视频文件拷贝到 WebAssembly 的内存中。

```js
const response = await fetch("xxx.hevc");
const buffer = await response.arrayBuffer();

// copy video into memory
const ptr = Module.__malloc(buffer.byteLength);
Module.HEAPU8.set(new Uint8Array(buffer), ptr);
```

接下来就是使用 JavaScript 的 Generator 函数实现解析视频每一帧的操作。

```js
// decode frames
function* generator() {
  let data = ptr;
  let data_size = buffer.byteLength;

  const size = width * height;

  while (1) {
    const ret = Module.__parser_parse(parser, ctx, pkt, data, data_size);
    if (ret < 0) break;

    data += ret;
    data_size -= ret;

    if (Module.__packet_size(pkt) > 0) {
      const ret = Module.__send_packet(ctx, pkt);
      if (ret < 0) break;

      while (Module.__receive_frame(ctx, frame) > 0) {
        const yptr = Module.__frame_data_y(frame);
        const uptr = Module.__frame_data_u(frame);
        const vptr = Module.__frame_data_v(frame);

        const yData = Module.HEAPU8.subarray(yptr, yptr + size);
        const uData = Module.HEAPU8.subarray(uptr, uptr + size / 4);
        const vData = Module.HEAPU8.subarray(vptr, vptr + size / 4);

        yield [yData, uData, vData];
        Module.__frame_unref(frame);
      }
    }
  }
}
```

通过上面的代码，我们就可以每次通过 `.next()` 函数获取视频的下一帧数据。

## 使用 WebGL 绘制 YUV420P 图像

YUV420P 的图像数据基于三个维度，Y 维度存放整张图片每个像素点的亮度值，U 维度和 V 维度存放图片的色度和浓度。其中每 2x2 个像素共享一个 U 值和 V 值，因此 Y 维度有 W\*H 字节的数据，而 U 维度和 V 维度分别只有 W\*H/4 字节的数据。

WebGL 不支持直接绘制 YUV 格式的图片，但是我们可以通过使用着色器进行渲染的方式来优化转换成 RGB 的时间开销。

```cpp
// 顶点着色器
attribute vec2 aPosition;
varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vTexCoord = aPosition * 0.5 + 0.5;
}
```

```cpp
// 片段着色器
precision highp float;
uniform sampler2D uTextureY;
uniform sampler2D uTextureU;
uniform sampler2D uTextureV;
varying vec2 vTexCoord;

void main() {
  vec2 upsideDownCoord = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  float y = texture2D(uTextureY, upsideDownCoord).r;
  float u = texture2D(uTextureU, upsideDownCoord).r - 0.5;
  float v = texture2D(uTextureV, upsideDownCoord).r - 0.5;

  float r = y + 1.13983 * v;
  float g = y - 0.39465 * u - 0.58060 * v;
  float b = y + 2.03211 * u;

  gl_FragColor = vec4(r, g, b, 1.0);
}
```

有上面两个着色器之后就可以用 chatGPT 生成配套的 WebGL 操作代码，具体可以参考 [`yuv420p-renderer.js`](https://github.com/swwind/ffmpeg-hevc-wasm/blob/master/yuv420p-renderer.js) 这份代码。

值得注意的是这段代码只对于 YUV420P 格式的数据有效，对于其他格式的视频还需要重新考虑实现的过程。

## 结果

我部署了一个[在线的小网页](https://swwind.github.io/ffmpeg-hevc-wasm/)来查看软解的效果。

实际体验发现，Firefox 解码上面的第一个视频遇到了严重的性能瓶颈，目标帧率是 24fps，而实际上只能达到 12fps 的平均水平。与此同时，Chrome 却可以轻松越过这个瓶颈。导致上述问题的原因未知。

> 下文：[再看软解 HEVC：开启 SIMD 优化，加快帧渲染](/post/hevc-wasm-2/)

## 评论

<vue-reactions path="hevc-wasm"></vue-reactions>
