---
title: 再看软解 HEVC：开启 SIMD 优化，加快帧渲染
---

# 再看软解 HEVC：开启 SIMD 优化，加快帧渲染

<vue-metadata author="swwind" time="2024-12-27"></vue-metadata>

> 上文：[基于 WebAssembly 软解 HEVC 视频](/post/hevc-wasm/)

在之前的工作中，我们成功在浏览器中对 HEVC 编码的视频进行了解码并播放。

这一期我们聊聊如何进行优化，以最大程度榨干用户设备的计算资源。

## 开启 SIMD 优化

SIMD 是 WASM 中的一套指令集，专门用于并行计算。

例如，你可能有地方会同时对 4 个 i32 执行加法操作，那么开启 SIMD 优化之后，这四条加法指令可以被合并到一条指令中。

```plain
# before
i32.add
i32.add
i32.add
i32.add
# after
i32x4.add
```

关于 CPU 具体怎么解释执行，这就不关我们的事情了。

开启 SIMD 需要在编译的时候加入 `-msimd128` 选项，我们需要在编译 ffmpeg 和 decoder.c 的时候都加上。

对于 ffmpeg，我们需要在 configure 的时候加上最后两个 flag。

```bash
emconfigure ./configure \
  --extra-cflags="-msimd128" \
  --extra-cxxflags="-msimd128" \
  ...
```

在编译 decoder.c 的时候，直接添加 `-msimd128` 即可。

## 加快绘制帧的操作

实验发现，软解视频的时候大部分时间开销都在绘制 YUV420P 格式的图片上面。

在之前的工作中，我们使用着色器的方式将 YUV420P 格式的图像转换成 RGB 格式的图像，但实际上这是一种歪门邪道。

浏览器实际上是提供了关于 YUV420P 等奇怪 format 图像的解码支持的，~~只是大部分人可能都不知道~~。

参考 [VideoFrame](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame) 接口，这个东西用于保存视频的一帧画面数据。

观察发现：

- 该对象是一个图像来源，因此可以直接画到 Canvas 上面。
- 该对象提供了直接通过 `Uint8Array` 创建帧画面的操作，并且可以指定数据格式（其中就包含了 YUV420P）。

所以我们直接通过这个对象渲染帧画面就好了。

```js
const videoFrame = new VideoFrame(yuvData, {
  codedWidth: width,
  codedHeight: height,
  timestamp: id * (1_000 / fps),
  format: "I420",
});

ctx.drawImage(videoFrame, 0, 0);
```

## 实验结果

你可以在 [这个 Demo 页面](https://swwind.github.io/ffmpeg-hevc-wasm/) 上看到最新的软解实现。

此前，通过着色器方式渲染只有 15fps 左右，使用新的接口绘制之后能达到 55fps。此外，开启 SIMD 之后更是能达到 70fps。

因此软解是有前途的，各位可以把这套方案应用到自己的视频网站上面，然后把客户的电脑风扇调教得嗡嗡响。

## 评论

<vue-reactions path="hevc-wasm-2"></vue-reactions>
