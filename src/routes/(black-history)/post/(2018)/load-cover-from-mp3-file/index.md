---
title: 从 mp3 文件中加载专辑封面
---

# 从 mp3 文件中加载专辑封面

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata author="swwind" time="2018-4-5">
</vue-metadata>

偶然翻出了以前在网上搜到的加载封面的脚本，今天就来分析一下。

我们的目的是实现一个函数 `parseCover(data)`，用来从二进制文件中解析出专辑封面。

## 判断是否有含有封面

需要满足两点：

- 文件以 `"ID3"` 开头
- 文件中能找到 `"APIC"`

## 获取文件大小

文件大小保存于 `"APIC"` 之后的四个字符，以十六进制存储。

## 获取文件

文件大小之后跳过两个字符，接下来长度为 `filesize` 的内容就是文件的主体。
但是图片的实际内容是从 `ffd8`（16 进制）之后才开始的。
在此之前会有一些关于图片类型的说明，这个我们用不到，所以不用管。

---

给出源代码：

```javascript
// @author swwind
var parseCover = function (data) {
  if (data.substr(0, 3) !== "ID3") {
    return false;
  }
  var index = data.indexOf("APIC");
  if (index < 0) {
    return false;
  }
  var calc = function (code) {
    var res =
      code.charCodeAt(0) * 0x1000000 +
      code.charCodeAt(1) * 0x10000 +
      code.charCodeAt(2) * 0x100 +
      code.charCodeAt(3) * 0x1;
    return res;
  };
  var filesize = calc(data.substr(index + 4, 4));
  var pic1 = data.substr(index + 10, filesize);
  var pic2 = pic1.slice(pic1.indexOf("\xff\xd8"));
  return "data:image/jpeg;base64," + btoa(pic2);
};
```

顺便讲讲怎么从本地读取文件。

首先，你只能从 `<input type="file">` 中获取文件。
接着你只需要一个 `FileReader`。
兼容性还可以。[caniuse](https://caniuse.com/#search=FileReader)

```javascript
var reader = new FileReader();
reader.onload = function (e) {
  var data = this.result;
  var image = parseCover(data);
  document.getElementById("cover").src = image || "";
};
reader.readAsBinaryString(file);
```
