---
title: 基于 nspawn 容器化开发环境
---

# 基于 nspawn 容器化开发环境

<vue-metadata author="swwind" time="2025-6-30" updated="2026-1-20"></vue-metadata>

容器化开发环境，就是我希望把所有开发套件和代码全都放到一个容器中运行，无论我装多少东西不会影响外部桌面环境的正常使用。

也许看上去有点吃饱了撑着，但是我感觉这样做会让我感到舒适。同时很主要的一点是，整套操作实现起来并不复杂，而且 VSCode 对于 SSH 远程连接有着堪比本地开发一样的爽快体验，因此何乐而不为呢。

我们会用到的东西包括：

- systemd-networkd
- systemd-nspawn

是的，全都是 systemd 全家桶自带的东西，因此我们什么都不需要额外安装。换句话说，只要你是个带 systemd 的操作系统，那么应该都能实现我们的目标。

另外，如果你是用 NetworkManager 上网的，那么可能会和 systemd-networkd 打起来，你可能需要自己寻找解决办法。

## 运行模式

首先我们来说说 systemd-nspawn 的运行模式，主要分为两种。

1. **Boot 模式**：会启动一个 init 进程，相当于开了一个虚拟机，可以配置自己的 systemd service。如果你希望容器里面跑个 SSH，再远程连接进去，那么你应该采用这个。
2. **非 Boot 模式**：差不多类似 chroot 的方式，进去之后只运行目标程序，程序退出即关闭容器。如果你想直接在容器里面跑 IDE（例如 idea），那你可以采用这个。

其中，Boot 模式一般采用 systemd service 方式来管理，需要将容器安装在 `/var/lib/machines/xxx` 中，并通过 `/etc/systemd/nspawn/xxx.nspawn` 文件来配置。之后便可以通过 `machinectl start xxx` 来管理该容器。

非 Boot 模式我建议安装在用户目录下，并且通过命令行参数来进行配置。如果指令过长，那么建议写到 `~/.bashrc` 文件内，例如：

```bash
dev() {
    sudo systemd-nspawn -q -D "$HOME/machines/dev" \
        "$@"
}
```

之后就可以直接通过 `dev <command>` 来直接在容器中运行某程序了。

下文中的所有配置选项都会给出两种不同方式的使用范例。

## 安装容器

参考 [ArchWiki](https://wiki.archlinux.org/title/Systemd-nspawn#Examples) 中相关的内容，我们这里就安装一个经典的 Arch Linux 系统。

```sh
sudo mkdir /var/lib/machines/dev
sudo pacstrap -K -c /var/lib/machines/dev base base-devel
```

## 网络配置

自从我开始用软路由之后，我就对 systemd-networkd 大彻大悟了。这个东西什么都能做，只要你愿意去看它的[使用手册](https://systemd.network)。

之前我还写过一篇关于 nspawn 容器的网络配置相关的东西的文章，用了一大堆工具，但实际上所有事情都可以交给 systemd-networkd 完成。

关于容器内要如何上网，实际上分为三种情况，看你实际需求。

1. 能上网就行：可以直接什么都不配置，这样默认会和 host 用同一套网络接口。
2. 我自己有个网桥：如果你希望给容器做个简单子网划分，那么可以配置一个网桥接口，这样容器内上网必须经过 host 作为网关。
3. 我要完全接管网络：那就手动创建一个 netns，在配置里给出该 netns 的名称即可。

当然还有其他用法，可以自己看手册。

### 创建网桥

我们先从创建虚拟网桥开始，创建文件 `/etc/systemd/network/br0.netdev`。

```ini
[NetDev]
Name=br0
Kind=bridge
```

这样 systemd-networkd 就会自动帮我们创建这个网桥了。

接着创建文件 `/etc/systemd/network/20-br0.network`

```ini
[Match]
Name=br0

[Network]
Address=192.168.26.1/24
Address=fd20:1926:0817::1/64
IPMasquerade=both
```

这里我们设置的都是静态地址，回头容器里面也要手动设置地址和网关。

然后重启 `systemd-networkd.service`，你会看到多出来了一个网络接口 `br0`。

如果你用 `ip a` 查看地址，你会发现这个网桥并没有地址，是正常现象，等后面容器起来了才会开始有地址。

要配置容器使用该网桥，可以在 `xxx.nspawn` 文件中配置

```ini
[Network]
Bridge = br0
```

或者添加 `--network-bridge=br0` 参数。

### 创建 netns

如果您决定直接给容器分配 netns，那么想必您已经非常熟悉 Linux 的网络栈了。

要配置容器使用您的 netns（例如 ns1），可以在 `xxx.nspawn` 文件中配置

```ini
[Network]
NamespacePath = /run/netns/ns1
```

或者添加 `--network-namespace-path=/run/netns/foo` 参数。

## 启动容器

**Boot 模式**

如果用的是 Boot 模式，那么可以通过下面的指令来开启

```sh
sudo machinectl start dev
```

如果要开机自动启动，那就把 `start` 改成 `enable` 就好了，和 `systemctl` 如出一辙（~~好像本来也是一家东西~~）。

要进入容器，用下面的指令

```sh
sudo machinectl shell dev
# or with specific user
sudo machinectl shell john@dev
```

**非 Boot 模式**

直接用我们编辑的函数进入即可，可以添加 `--user` 参数来表明希望运行程序的用户。

```sh
dev --user john bash
```

## 显卡穿透

当然，作为开发容器，还是要能访问一定设备资源的。默认来说容器内无法访问显卡设备，这里我们来说说怎么穿透进去。

### Intel / AMD

这两家比较类似，因为东西都放在 `/dev/dri` 下面，我们只要把这个文件夹绑定进去，再给权限就可以了。

如果是 Boot 模式，则编辑 `xxx.nspawn` 文件

```ini
[Files]
Bind = /dev/dri
```

如果是非 Boot 模式，则添加 `--bind=/dev/dri` 参数。

另外，我们也要添加权限规则，**允许容器读写显卡设备**。

如果是 Boot 模式，则通过 `systemctl edit systemd-nspawn@xxx.service`，添加下面的内容：

```ini
[Service]
DeviceAllow=/dev/dri rw
DeviceAllow=char-drm rwm
```

如果是非 Boot 模式，则添加 `--property="DeviceAllow=/dev/dri rw"`, `--property="DeviceAllow=char-drm rwm"` 参数。

最后，不要忘了在容器中装上显卡驱动。

### NVIDIA

NVIDIA 的情况也比较不同，他们会把东西放在 `/dev/nvidia*` 中。不过方法也是同理，将对应的设备绑定到容器中即可。

## 桌面穿透

有些时候仅仅穿透显卡是不太够用的，我们可能还需要在容器内跑图形化界面。

关于如何穿透桌面也有若干种方案，看具体需求。

1. **X11 Forward**：直接用 SSH 提供的功能，简单粗暴，但是无法使用显卡渲染（是这样的）。只在 Boot 模式下可能有点用，非 Boot 模式下你可能甚至无法开启 sshd 服务器（容器同时只能执行一个指令）。
2. **文件绑定方式**：通过 Bind 文件方式提供桌面功能，缺点是需要依赖 `/run/user` 下面的一些文件，可能会导致 `machinectl enable` 不可用（因为开机的时候可能用户桌面还没开起来）。

### X11 Forward

如果我们想要让容器里面的桌面应用能简单粗暴地显示出来，只需要配置好 X11 Forward 就可以了。

具体过程很简单，只要在容器里面编辑 `/etc/ssh/sshd_config`，找到并编辑下面几行内容

```ini
X11Forwarding yes
X11DisplayOffset 10
X11UseLocalhost yes
```

然后运行 `systemctl restart sshd.service` 重启服务。

之后使用 `ssh -Y dev` 进入容器，就可以自动转发 X11 的桌面应用程序了。

### 文件绑定方式

这里假设用户使用 Wayland 桌面（如果不是，请立即按下键盘上的 Ctrl+W 键）。

首先我们需要确认下面的一些环境变量内容，可以通过 `printenv XXX` 来查看。

- `XDG_RUNTIME_DIR`: 一般是 `/run/user/1000`
- `WAYLAND_DISPLAY`: 一般是 `wayland-0`
- `DISPLAY`: 一般是 `:1`（也有可能是 `:0`）

接着我们需要将相关文件绑定到容器中。

此外，你也有可能需要执行下面的指令来让 XWayland 服务器接受来自容器的连接。

```bash
xhost +local:
```

**Boot 模式**

由于 Boot 模式的特性，我们不能直接将 `/run/user/1000` 直接绑定到容器内（不然你桌面会原地升天），我们需要将需要用的一些文件绑定到 `/tmp` 中。

```ini
[Files]
Bind=/run/user/1000/wayland-0:/tmp/wayland-0
BindReadOnly=/tmp/.X11-unix
```

接着我们需要在容器内的用户环境中设置默认的环境变量，一般直接编辑**容器内** `.bashrc` 即可。

```sh
export XDG_RUNTIME_DIR = /run/user/1000 # 和外面一样，虽然可能用不到
export WAYLAND_DISPLAY = /tmp/wayland-0 # 我们绑定到的地址
export DISPLAY = :1 # 和外面一样
```

**非 Boot 模式**

直接添加下面的若干参数即可。由于非 Boot 模式不会自动接管 `/run/user/1000` 文件夹，所以理论上直接将整个文件夹塞进去也没事。

```bash
--bind=/run/user/$(id -u) \
--bind-ro=/tmp/.X11-unix \
--set-env="XDG_RUNTIME_DIR=/run/user/$(id -u)" \
--set-env="WAYLAND_DISPLAY=$WAYLAND_DISPLAY" \
--set-env="DISPLAY=$DISPLAY" \
```

## 音频穿透

虽然不知道为什么，但是我们可能喜欢在容器里面听歌。虽然听着有点怪，但这也不是不行。

方法和上面的差不多，主要我们需要添加的是 `/run/user/1000/pipewire-0` 和 `/run/user/1000/pulse` 这两个文件，和 `PULSE_SERVER`, `PIPEWIRE_RUNTIME_DIR` 两个环境变量。

另外，可能还需要在系统里面装上 `pipewire` 和 `pipewire-pulse`。

**Boot 模式**

```ini
[Files]
Bind = /run/user/1000/pipewire-0:/tmp/pipewire-0
Bind = /run/user/1000/pulse:/tmp/pulse
```

```bash
export PIPEWIRE_RUNTIME_DIR = /tmp
export PULSE_SERVER = unix:/tmp/pulse/native
```

**非 Boot 模式**

应该默认就能跑，不行的话手动加上下面内容。

```bash
# --bind=/run/user/$(id -u) \
--set-env="PIPEWIRE_RUNTIME_DIR=/run/user/$(id -u)" \
--set-env="PULSE_SERVER=unix:/run/user/$(id -u)/pulse/native" \
```

## 最后

至此，我们基于 systemd 全家桶的工具构建了简单高效的容器化开发环境，甚至还可以用来打游戏。

如果你确实懒得看上面的内容，那么我也给你准备了完整版本（如果你的需求和硬件配置和我的一模一样）。

```ini
# /etc/systemd/nspawn/dev.nspawn
[Network]
Bridge=br0

[Exec]
PrivateUsers=no

[Files]
Bind=/dev/dri
Bind=/run/user/1000/wayland-0:/tmp/wayland-0
Bind=/run/user/1000/pipewire-0:/tmp/pipewire-0
Bind=/run/user/1000/pulse:/tmp/pulse
BindReadOnly=/tmp/.X11-unix
```

```ini
# systemctl edit systemd-nspawn@dev.service
[Service]
DeviceAllow=/dev/dri rw
DeviceAllow=char-drm rwm
```

```bash
# ~/.bashrc (in dev)
export XDG_RUNTIME_DIR=/run/user/1000
export WAYLAND_DISPLAY=/tmp/wayland-0
export DISPLAY=:1
export PULSE_SERVER=unix:/tmp/pulse/native
export PIPEWIRE_RUNTIME_DIR=/tmp
```

参考：

- [使用 systemd-nspawn 容器化 Android Studio](https://liolok.com/zhs/containerize-android-studio-with-systemd-nspawn/)

致谢：

- @pomoke @q234rty @rebmit233

如果你还是没跑起来，那可能你系统情况太复杂了，我也帮不到你了。

## 评论

<vue-reactions path="container-dev"></vue-reactions>
