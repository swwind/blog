---
title: Arch Linux 的安装和开发环境的配置
---

# Arch Linux 的安装和开发环境的配置

<vue-metadata author="swwind" time="2019-1-17" tags="archlinux"></vue-metadata>

Arch Linux 是我目前觉得最好用的 linux 操作系统。本文讲一讲 Arch Linux 的安装过程和一些坑。

---

**严重警告：本文已经过时，不具有任何参考意义，请您一切以[官方的安装教程](https://wiki.archlinux.org/index.php/installation_guide)为准。**

---

<figure>
  <img src="https://wiki.archlinux.org/extensions/ArchLinux/modules/archnavbar/archlogo.svg?29b1c" />
</figure>

本文主要学习自 [官方的安装教程(EN)](https://wiki.archlinux.org/index.php/installation_guide)

**前排警告：如果要装双系统，先装 Windows 10。**

# 烧镜像

**假设现在你在 Windows 7/10 系统上**

首先下载镜像文件（`archlinux-xxxx.xx.xx-x86_64.iso`）。
国内为了追求速度，可以到[清华大学开源软件镜像站（TUNA）](https://mirrors.tuna.tsinghua.edu.cn/archlinux/iso/)下载。

当然也可以用其他的镜像网站，关系不大。
下载完成后记得效验一下 md5 hash 值。

下载完成后，我们需要使用 [Rufus](https://rufus.ie/) 软件进行 U 盘的烧制。
过程过于简单，不讲。

烧完之后重启电脑，进 BIOS 选择 U 盘启动，然后静静地等待 Arch Linux 启动。

# 安装到磁盘

Arch Linux Live 默认使用 zsh 作为 shell，也就是说我们可以自由地使用 Tab 补全机制。

## 联网

第一个要解决的问题是联网。

1. **我能 ping 通 baidu.com**

   那你什么也不用做

2. **我不能 ping 通 baidu.com**

   那就放弃吧，你什么都做不到

### 更改 pacman 镜像（可选）

```bash
vim /etc/pacman.d/mirrorlist
```

将不要用的镜像地址用 `#` 注释掉即可。
建议使用 TUNA 的镜像。

## 准备磁盘空间

使用 `fdisk -l` 查看磁盘情况，使用 `cfdisk /dev/sda` 来编辑磁盘分区。

> 如果你电脑有什么找阿的硬盘保护系统，直接把它搞掉免除后患。
> 要搞掉硬盘保护系统，推荐直接全盘格式化，简单粗暴而最行之有效。
>
> ```bash
> parted /dev/sda
> ```
>
> ```plain
> GNU Parted 3.2
> Using /dev/sda
> Welcome to GNU Parted! Type 'help' to view a list of commands.
> (parted)
> ```
>
> 输入 `mklabel`，然后会跳出提示，此时输入 `gpt` 然后回车。
> 输入 `quit` 退出 `parted`。

你需要三个分区：

1. 主分区，可以设的大一点，分区类型选择 `Linux extended`。(`/dev/sdaX`)
2. Swap 分区，一般是 RAM 的两倍大小（？），分区类型选择 `Linux swap / Solaris`。(`/dev/sdaY`)
3. EFI 引导分区，300 MB 左右，分区类型选择 `EFI System`。(`/dev/sdaZ`)（可能已经存在了）

在 `cfdisk` 中划分好之后，需要格式化分区。

```bash
mkfs.ext4 /dev/sdaX # 格式化主分区
mkswap /dev/sdaY # 格式化 swap 分区
swapon /dev/sdaY
```

注意，如果你已经存在一个 `EFI` 分区，则不需要格式化，否则使用以下命令格式化。

```bash
mkfs.fat /dev/sdaZ
```

## 安装系统

先 mount 分区。

```bash
mount /dev/sdaX /mnt
mkdir /mnt/boot
mount /dev/sdaZ /mnt/boot
```

使用 `pacstrap` 安装基本软件包。

```bash
pacstrap -K /mnt base base-devel
```

接着生成 fstab 文件。

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

### chroot

等待安装完成后使用 `arch-chroot /mnt` 进入新系统。

> 如果你是用 `wifi-menu` 联网的，请在这时安装下面两个包：
>
> ```bash
> pacman -S dialog wpa_supplicant
> ```
>
> 如果不是，请及时安装 dhcpcd 或者 NetworkManager。
>
> <p>
>   <span class="truth" title="mdzz">
>     {"我因为这两个包的缺失重启了两三次。。。"}
>   </span>
> </p>

接下来我们要做一些简单的设置。

```bash
# 设置时区
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 更新时间
hwclock --systohc

# 语言设置
vim /etc/locale.gen # 将需要的语言去掉注释
locale-gen # 生成
# 选择默认语言
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

### 写引导

**注意这一步非常重要。**

现在应该还在 `chroot` 里面。

```bash
pacman -S grub os-prober
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=grub
```

注意看一下 `/boot/` 里面有没有 vmlinuz-linux 以及 initramfs-linux，如果没有，可以使用 `pacman -S linux` 重新安装。

生成主配置文件：

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

看一看 `stdout` 的输出，`os-prober` 应该能找到电脑上所有的其他盘的系统。

如果不能，则手动修复引导。

注意：修改 grub 配置文件后必须**再生成一次主配置文件**，最后再退出 `chroot` 并 `reboot`。

#### 修复 Windows 10 引导

你现在能找到 `/boot/EFI/Microsoft/Boot/bootmgfw.efi` 这个文件。

<p>
  <span class="truth">如果没有，重装 win10 吧</span>
</p>

编辑 `/etc/grub.d/40_custom` 这个文件，在后面加上：

```plain
menuentry "Microsoft Windows 10" {
  insmod part_gpt
  insmod fat
  insmod search_fs_uuid
  insmod chain
  chainloader /EFI/Microsoft/Boot/bootmgfw.efi
}
```

注意这只是一个临时的解决办法。
也许你进去 arch 之后再 `grub-mkconfig` 一下就能找到 win10 了。
如果是这样，那么删除这一段就行了（否则你将会看到两个 win10 的选项）。

## 装机配置

咕咕咕
