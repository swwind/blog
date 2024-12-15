---
title: Arch Linux 上部署 Deno 项目的方案
---

# Arch Linux 上部署 Deno 项目的方案

<vue-metadata author="swwind" time="2024-12-15"></vue-metadata>

~~首先我们可以用 Deno Deploy，一键上云。~~

不存在的，Deno Deploy 是不可能用的，毕竟我们有一台自己的服务器，能在自己服务器上跑当然最好。

然后我就发现，deno 项目部署起来确实有点麻烦，所以我把我最终的解决方案放在这里，可以给你们参考。

总的来说，我决定将 deno 基础服务和项目分别打包，这样可以在后期更加方便地部署更多的轮子。

## 基础服务包 deno-srv

> 打包代码可以参考 [swwind/deno-srv](https://github.com/swwind/deno-srv)。

首先，我们肯定希望以一个单独的用户来跑我们的 deno 项目，我们暂且把他叫做 `deno-srv`。

考虑到 deno 下载源文件的逻辑，这个用户还要有一个可以读写的家目录，我们就把他定为 `/var/lib/deno-srv`。

我们用 sysusers 和 tmpfiles 服务来声明这两个东西。

然后，我们提供一个 systemctl 的服务模板 `deno-srv@.service`，提供一般性的低权限用户运行 deno 项目的服务。

```ini
[Unit]
Description=Deno Service (%i)
Documentation=https://deno.land
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=deno-srv
StateDirectory=%i
EnvironmentFile=/etc/%i.conf
WorkingDirectory=/opt/deno-srv/%i
ExecStart=/usr/bin/deno task start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

这个模板给了以下的规则：

- 环境变量文件（一般是项目的 `./.env`），必须拷贝到 `/etc/%i.conf`；
- 整个项目的所有文件应当在 `/opt/deno-srv/%i` 下面；
- 启动脚本为 `deno task start`；
- 运行时数据应当存放在 `/var/lib/%i` 中。

## 给 deno 项目打包

下面以我自己搞的一个 pastebin 轮子 [swwind/shortbin](https://github.com/swwind/shortbin) 为例，演示如何使用上面的 `deno-srv` 包。

```bash
_pkgname=shortbin
pkgname=shortbin-git
pkgver=0.1.0
pkgrel=1
pkgdesc="A tiny self-host paste bin and URL shortener written in TypeScript."
arch=('any')
url="https://github.com/swwind/shortbin"
license=('MIT')
depends=('deno-srv')
makedepends=()
backup=("etc/$_pkgname.conf")
options=('!strip')
source=("https://github.com/swwind/$_pkgname/archive/refs/heads/master.tar.gz")
sha256sums=('7548172b87fcb0b18832f442882c08913c643830eba827c08a86d1c5c96ef80c')

package() {
  mkdir -p "$pkgdir/opt/deno-srv"
  cp -r "$srcdir"/$_pkgname-master "$pkgdir"/opt/deno-srv/$_pkgname
  install -Dm644 "$srcdir"/$_pkgname-master/.env "$pkgdir"/etc/$_pkgname.conf
}
```

然后就结束了。

用 `makepkg` 手动构建，然后直接用 `pacman` 装上就好了。

启动 `deno-srv@shortbin.service`，你就可以看到服务跑起来了。

## 事后

现在还没有出锅，等什么时候爆炸了我再给你们说。

## 评论

<vue-reactions path="deploy-deno"></vue-reactions>
