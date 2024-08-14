---
title: js/ts 的桌面图形界面框架汇总
---

# js/ts 的桌面图形界面框架汇总

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata author="swwind" time="2020-7-26" tags="javascript">
</vue-metadata>

随着 NodeJS 和 Deno 的逐渐普及，JavaScript 社区也在一直寻找着可以用的桌面 APP 解决方案。由于桌面 GUI 的框架大多是用 C/C++ 写的，NodeJS 和 Deno 不得不需要一些使用别的语言包装好的框架。Deno 相比于 Node 可以原生支持 Rust 编写插件，但是目前整个 Deno 社区还在开荒阶段，因此想要用 Rust 里的 GUI 框架也许还要等上几个月（或者几年？）。

目前常见的有以下几种解决方案：

1. 包装 Chromium；
2. 封装 Qt 之类的 C/C++ 框架；
3. 在不同平台调用不同的系统原生 webview 组件（Cocoa/WebKit on macOS, webkit2gtk on Linux and Edge on Windows 10）并提供统一 API；
4. 利用 Chrome DevTools Protocol 直接调用已经安装的 Chrome 浏览器创建窗口。

其中第一类包括 [Electron](https://www.electronjs.org/) 以及 [NW.js](https://nwjs.io/) 等框架，Web 兼容性最强，但是包装出来的应用有点大（因为需要塞一个 Chromium）

第二类包括 [Proton Native](https://proton-native.js.org/) 等框架。

第三类包括 [webview_deno](https://github.com/webview/webview_deno), [neutralino](https://neutralino.js.org/), [tauri](https://tauri.studio/) 等框架，Web 兼容性可能没有第一类强，但是包装出来的应用可以很小。

第四类包括 [carlo(unmaintained)](https://github.com/GoogleChromeLabs/carlo) 等框架，由于需要宿主机有至少一个 Chromium 的换皮浏览器，因此可能支持面有一点不全面。

---

四类框架各有优缺点，但是普遍渲染性能较差。因此如果需要对图形渲染要求高的话，还是不建议使用以上的框架。最好去学 C/C++ <span class="truth">或者鬼畜的 Rust </span>以使用高性能的 GUI 框架。
