---
title: Arch Linux i3wm 的安装与配置
---

# Arch Linux i3wm 的安装与配置

<script setup>
import VueMetadata from "@/components/metadata/Metadata.vue"
</script>

<vue-metadata author="swwind" time="2020-7-30" tags="archlinux,lightdm">
</vue-metadata>

i3wm 是经典的平铺 wm，用惯了的话操作起来还是很上手的。

这里从成功安装了 Arch Linux 之后继续讲起，可以得到的最终效果如下：

![1596090744488-2020-07-30_14-31.png](/assets/1596090744488-2020-07-30_14-31.png)

## 启用 archlinuxcn 源

```bash
echo -e '[archlinuxcn]\nServer = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch' | sudo tee -a /etc/pacman.conf > /dev/null
sudo pacman -Syy
sudo pacman -S archlinuxcn-keyring
```

## 安装 i3wm 以及一些必要组件

```bash
sudo pacman -S xorg i3-gaps polybar dunst fcitx compton xorg-init curl \
               zsh wqy-microhei wqy-zenhei pulseaudio pulseaudio-alsa \
               pamixer nitrogen lxappearance pavucontrol polkit-gnome fcitx-{gtk2,gtk3,qt4,qt5} \
               pikaur xfce4-terminal nerd-fonts-complete flameshot git playerctl python-gobject \
               libsodium xclip thunar
# 下面是夹带的私货
sudo pacman -S google-chrome visual-studio-code-bin electron-netease-cloud-music typora
```

安装我正在使用的 i3wm 主题。

```bash
cd $HOME
git clone https://github.com/swwind/dotfiles .dotfiles
cd .dotfiles
./install_config.sh
```

## 安装 lightdm

```bash
sudo pacman -S lightdm lightdm-webkit2-greeter

sudo vim /etc/lightdm/lightdm.conf
# greeter-session=lightdm-webkit2-greeter

sudo systemctl enable lightdm.service
```

安装完毕之后可以 `reboot` 重启电脑进入 i3wm 桌面环境。

如果你 lightdm 崩了，请使用 `Ctrl + Alt + f1-f7` 切 tty 进行抢救操作。

## i3wm 主题操作指南

该主题系博主 fork 自 timber3252 的 i3wm 主题。

### polybar

左上角是一个 playerctl 和音量调节的快捷按键。

- 对于 playerctl 的操作：
  - 左键：下一首
  - 中键：暂停
  - 右键：上一首
- 对于音量调节的操作：
  - 滚轮：调节大小
  - 左键：静音/取消静音

左下角是桌面和窗口的标题。

右上角放有网络配置、时间，以及应用程序的图标。

右下角是当前的 CPU 和内存的使用状况，以及温度和电量。

### 快捷键

_以下 $mod 表示你电脑上的 Windows 键_

- `$mod + d` 打开 dmenu 选择 command
- `$mod + z` 打开 dmenu 选择 Application
- `$mod + Enter` 打开终端（`xfce4-terminal`）
- `$mod + w` 使用分页模式
- `$mod + e` 使用平铺模式
- `$mod + f` 全屏/退出全屏
- `$mod + Shift + Space` 切换窗口浮动/平铺
- `$mod + Shift + q` 关闭窗口
- `$mod + 1-9` 切换到桌面 1-9
- `$mod + Shift + 1-9` 将当前窗口移至桌面 1-9
- `$mod + {h,j,k,l}` 切换 focus 窗口
- `$mod + Shift + {h,j,k,l}` 将当前窗口移动至桌面的左/下/上/右
- 按住 `$mod` 和鼠标右键并拖动：调节浮动的窗口大小

### 快捷入口

- `$mod + o` 快速打开应用，不出所料，你应该可以看到左下角的标题栏变成了下面的样子：

  > App: (w)eb browser, (f)ile manager, (m)usic player, (t)ypora

  之后再次按 `w`, `f`, `m` 或者 `t` 即可快速打开应用。
  具体请查看 `~/.config/i3/config`；

- `$mod + p` 快速打开设置，具体请查看 `~/.config/i3/config`；
- `$mod + 0` 快速锁屏/关机，具体请查看 `~/.config/i3/config`。

### 锁屏/壁纸

壁纸使用 `nitrogen`，直接打开即可。

锁屏需要使用 `betterlockscreen`。

```bash
sudo pacman -S betterlockscreen
betterlockscreen -u path/to/image.png # 设置锁屏壁纸
betterlockscreen -l # 直接锁屏
```

锁屏之后直接敲入用户密码即可解锁（~~对，他连一个输入框也不需要~~）。

### 鼠标，图标与 gtk 主题

以下是个人正在使用的主题

```bash
sudo pacman -S capitaine-cursors papirus-icon-theme arc-gtk-theme
```

安装完成之后使用 `lxappearance` 即可选择主题。(Arc-Dark, Papirus-Dark, Capitaine Cursors)

## 科学上网

_有一部分内容请自行 Google。_

由于从 AUR 里面获取应用很慢，于是我们需要用 proxychains 在终端使用代理。

```bash
sudo pacman -S proxychains-ng
sudo vim /etc/proxychains.conf # 修改最后一行 SOCKS5 localhost 1080
```

之后便可以安装 aur 里面的内容。

```bash
proxychains -q pikaur -S lux clipit electron-ssr fcitx-sogoupinyin
```

`lux` （一个调整亮度的工具）在使用前需要先用 sudo 权限运行一次。

```bash
sudo lux
```

Google Chrome 临时使用代理的方法：

```bash
google-chrome-stable --proxy-server=socks5://localhost:1080
```

安装 oh-my-zsh：

```bash
sh -c "$(proxychains -q curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

## Steam

安装 steam 需要先启用 multilib 来提供 32 位的支持。

```bash
sudo vim /etc/pacman.conf
```

找到以下两行并取消注释

```toml
[multilib]
Include = /etc/pacman.d/mirrorlist
```

接着更新一下系统

```bash
sudo pacman -Syyu
```

然后就可以直接从官方源里面安装 steam。

```bash
sudo pacman -S steam
```

## 安装 Anbox 玩手游

```bash
sudo pacman -S anbox-git anbox-image anbox-modules-dkms-git linux-headers
sudo systemctl enable anbox-container-manager.service
```

安装完毕之后重启电脑。

之后直接打开 `anbox` 即可。

安装 apk 请使用以下方法：

```bash
sudo pacman -S android-tools
adb devices
adb install xxxxx.apk
```

注意：这个 Anbox 兼容性感人，只能玩玩 Arknights，其他游戏不要想了（特别是 Google Play 上的那些东西）。

## あとがき

祝你好运。

以上。
