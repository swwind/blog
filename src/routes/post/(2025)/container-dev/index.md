---
title: 基于 nspawn 容器化开发环境
---

# 基于 nspawn 容器化开发环境

<vue-metadata author="swwind" time="2025-6-30"></vue-metadata>

容器化开发环境，就是我希望把所有开发套件和代码全都放到一个容器中运行，无论我装多少东西不会影响外部桌面环境的正常使用。

也许看上去有点吃饱了撑着，但是我感觉这样做会让我感到舒适。同时很主要的一点是，整套操作实现起来并不复杂，而且 VSCode 对于 SSH 远程连接有着堪比本地开发一样的爽快体验，因此何乐而不为呢。

我们会用到的东西包括：

- systemd-networkd
- systemd-nspawn

是的，全都是 systemd 全家桶自带的东西，因此我们什么都不需要额外安装。换句话说，只要你是个带 systemd 的操作系统，那么应该都能实现我们的目标。

如果你是用 NetworkManager 上网的，那么可能会和 systemd-networkd 打起来，你可能需要自己寻找解决办法。

## 网络配置

自从我开始用软路由之后，我就对 systemd-networkd 大彻大悟了。这个东西什么都能做，只要你愿意去看它的[使用手册](https://systemd.network)。

之前我还写过一篇关于 nspawn 容器的网络配置相关的东西的文章，用了一大堆工具，但实际上所有事情都可以交给 systemd-networkd 完成。

我们先还是从创建虚拟网桥开始，创建文件 `/etc/systemd/network/vth0.netdev`。

```ini
[NetDev]
Name=vth0
Kind=bridge
```

这样 systemd-networkd 就会自动帮我们创建这个网桥了。

接着创建文件 `/etc/systemd/network/20-vth0.network`

```ini
[Match]
Name=vth0

[Network]
Address=192.168.26.1/24
Address=fd20:1926:0817::1/64
IPMasquerade=both
```

这里我们设置的都是静态地址，回头容器里面也要手动设置地址和网关。

然后重启 `systemd-networkd.service`，你会看到多出来了一个网络接口 `vth0`。

如果你用 `ip a` 查看地址，你会发现这个网桥并没有地址，是正常现象，等后面容器起来了才会开始有地址。

## 安装容器

参考 [ArchWiki](https://wiki.archlinux.org/title/Systemd-nspawn#Examples) 中相关的内容，我们这里就安装一个经典的 Arch Linux 系统。

```sh
sudo pacstrap -K -c /var/lib/machines/container-dev base base-devel
```

安装完成之后编辑 `/etc/systemd/nspawn/container-dev.nspawn`

```ini
[Network]
Bridge=vth0
```

最后用下面的指令开启容器。

```sh
sudo machinectl start container-dev
```

如果要开机自动启动，那就把 `start` 改成 `enable` 就好了，和 `systemctl` 如出一辙（~~好像本来也是一家东西~~）。

要进入容器，用下面的指令

```sh
sudo machinectl shell container-dev
# or with specific user
sudo machinectl shell user@container-dev
```

进入容器之后要先配置一下网络，编辑 `/etc/systemd/network/20-wired.network`

```ini
[Match]
Name=host*

[Network]
Address=192.168.26.2/24
Gateway=192.168.26.1
Address=fd20:1926:0817::dead:beaf/64
Gateway=fd20:1926:0817::1
```

然后启动 `systemd-networkd.service` 和 `systemd-resolved.service`，你应该就能上网了。

关于 DNS：

- 如果你比较懒，或者网络环境比较固定，你可以直接编辑 `/etc/systemd/resolve.conf` 选择你的 DNS 服务器（或者直接加到 `[Network] DNS=` 里面）
- 如果环境比较麻烦，你可以尝试让 systemd-networkd 充当 DNS 服务器转发子网的请求，具体可以自己去查文档

解决了网络问题之后你就可以在容器里面为所欲为了，创建新用户、添加主机的公钥等。

完成之后我们直接用 SSH 连接就好。

例如，我们可以添加下面配置到 `~/.ssh/config`

```ini
Host dev
    HostName 192.168.26.2
```

以后直接 `ssh dev` 就能进去容器了。

## VSCode 远程连接

这还需要我教你？装个插件就好了。

如果你要说你用的是开源的版本，然后没有 Remote SSH 插件可以用，你可能要换成某些开源替代品。

## X11 Forward

是的，如果我们想要让容器里面的桌面应用能显示出来，只需要配置好 X11 Forward 就可以了。

其实也很简单，只要在容器里面编辑 `/etc/ssh/sshd_config`，打开下面几行内容

```ini
X11Forwarding yes
X11DisplayOffset 10
X11UseLocalhost yes
```

然后运行 `systemctl restart sshd.service` 重启服务。

之后使用 `ssh -Y dev` 进入容器，就可以运行 X11 的桌面应用程序了。

## 最后

至此，我们基于 systemd 全家桶的工具构建了简单高效的容器化开发环境，虽然整套都还是无头服务器版本，但我觉得目前来讲基本够用了。

参考：

- [使用 systemd-nspawn 容器化 Android Studio](https://liolok.com/zhs/containerize-android-studio-with-systemd-nspawn/)

## 评论

<vue-reactions path="container-dev"></vue-reactions>
