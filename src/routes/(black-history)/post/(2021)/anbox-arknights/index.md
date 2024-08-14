---
title: 在 Arch Linux 上用 Anbox 玩舟游
---

# 在 Arch Linux 上用 Anbox 玩舟游

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata author="swwind" time="2021-5-10" tags="anbox,arknights,archlinux">
</vue-metadata>

本文简单总结在 Arch Linux 上安装 Anbox 并用其来玩舟游的一些步骤。

_注意：也许您应该多参考 [ArchWiki](https://wiki.archlinux.org/title/Anbox) 而不是本博客。_

_注意：Anbox 可悲的兼容性也许只能用来勉强玩玩舟游。_

_⚠⚠⚠ 警告 ⚠⚠⚠：(2022/6/6) 本文已经过时，新的 linux-zen 5.18 内核已经不再提供 ashmem 模块，而是使用 memfd 作为替代。如果您还想继续玩 Arknights，您可以使用 [Waydroid](https://wiki.archlinux.org/title/Waydroid) 作为 Anbox 的替代，或者自己编译 linux 内核。_

## 安装 Anbox

以前的直接安装 `dkms` 的方法已经在新版本的内核下失效，我们只能用别的办法。

### 安装内核

安装使用 `linux-zen` 内核。

```bash
sudo pacman -S linux-zen
# update grub (maybe differ)
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

之后重启计算机。

### 添加 binderfs

```bash
sudo mkdir /dev/binderfs
sudo mount -t binder none /dev/binderfs
```

让系统每次启动的时候都自动执行上面的两行指令：

1. 新建文件 `/etc/tmpfiles.d/anbox.conf`

   ```
   d! /dev/binderfs 0755 root root
   ```

2. 在 `/etc/fstab` 中最后添加一行

   ```
   none                         /dev/binderfs binder   nofail  0      0
   ```

### 安装 Android 镜像

```bash
sudo pacman -S anbox-image
```

不建议使用带 GApps 的镜像，因为你会发现 Google Play 里面的 App 一个都装不了。

### 安装 Anbox

```bash
sudo pacman -S anbox-git
sudo systemctl enable --now anbox-container-manager.service
```

### 配置网络

如果你用 NetworkManager：

```bash
nmcli con add type bridge ifname anbox0 -- connection.id anbox-net ipv4.method shared ipv4.addresses 192.168.250.1/24
```

### 启动 Anbox

直接在你的 kde 菜单里面找到 `anbox`，然后点击即可。

如果启动失败，则需要排查问题。

> 博主遇到的一个问题：
>
> ```
> [client.cpp:48@start] Failed to start container: Failed to start container: Failed to set config item lxc.group.devices.deny
> ```
>
> 降级 lxc 至 4.0.6 版本解决。

## 安装舟游！

首先到官网里面直接下载 apk（不会真的有人玩 b 服吧）。

之后通过 `adb` 安装。

```bash
sudo pacman -S android-tools

adb devices
# you should see such that:
#   List of devices attached
#   emulator-5558	device

adb install Downloads/arknights-hg-1501.apk
```

等待片刻即安装完毕。

之后可以直接在系统 Applications 里面找到 Arknights，直接点击启动即可。

## 若干问题的解决方案

### 窗口上方的白条不见了

> Q: 我怎么点什么按钮都有垂直方向上的偏差啊

这是因为你原来在窗口上方应该存在的高度 42px 的窗口栏不见了（因为特性）。

打开别的什么 Anbox App，或者在别的 Anbox App 里面多点几下，窗口栏应该会回来。

注意窗口栏回来之后就不要再修改窗口大小或者移动窗口了，否则他又会消失了。

或者参考我的 PR: [anbox/anbox#1810](https://github.com/anbox/anbox/pull/1810)

### 帧率太低

> Q: 老子高配电脑怎么还掉帧啊

可能是你的 Nvidia 驱动没装好。

安装 Nvidia 驱动（警告：做好重装电脑准备）：

```bash
sudo pacman -S linux-headers linux-zen-headers
sudo pacman -S dkms
pikaur -S nvidia nvidia-dkms opencl-nvidia
```

然后重启（祝你好运）。

## 结尾

Anbox 虽然安装过程过于复杂，而且兼容性也非常感人，但是其性能是真的不错，比在 VirtualBox 里面用 Android x86 虚拟机不知道快到哪里去了。

另：欢迎加好友带带我 `swwind#2659`。
