---
title: 基于 systemd-nspawn 的轻量化容器搭建与网络配置
---

# 基于 systemd-nspawn 的轻量化容器搭建与网络配置

<vue-metadata author="swwind" time="2024-4-16" updated="2024-10-19"></vue-metadata>

有时候需要搞一个 Ubuntu 的环境来做一些实验，或者需要一个沙箱来跑毒瘤程序，相比于搬出 VirtualBox 等大家伙，使用基于 systemd-nspawn 的轻量化的容器在性能上会优秀不少。

## 创建容器

可以参考 [Arch Wiki](https://wiki.archlinux.org/title/systemd-nspawn#Examples) 上的样例，在 `/var/lib/machines/` 中创建容器。

如果你不想创建在 `/var/lib/machines/` 里面也没事，但是后面的程序会默认在这个地方找文件，所以在别的地方创建完了之后必须软链接到这里。下文均以在 `/var/lib/machines/` 中创建 `<container-name>` 容器为例，请将 `<container-name>` 替换为自定义名称。

### Arch

需要先安装 `arch-install-scripts`。

```sh
sudo mkdir /var/lib/machines/<container-name>
sudo pacstrap -K -c /var/lib/machines/<container-name> base
```

### Debian / Ubuntu

需要先安装 `debootstrap` 和 `debian-archive-keyring`（或者 `ubuntu-keyring`）。

```sh
cd /var/lib/machines
sudo debootstrap \
  --include=systemd-container \
  <codename> <container-name> <repository-url>
```

其中 `codename` 是发行版代号，可以在其他地方找到。

`repository-url` 可以设置为 tuna 的镜像地址（去掉最后的 `/`）。

```
https://mirrors.tuna.tsinghua.edu.cn/debian/
https://mirrors.tuna.tsinghua.edu.cn/ubuntu/
```

## 配置网络

网络配置是一个很复杂的事情，很多时候我也不知道发生了什么，不过事情看起来都可以正常工作。

我的目标配置如下：

1. 主机上创建一个虚拟网桥 `nat0`，所有容器通过该网桥进行上网和与其他容器通信。
2. 设立 DHCP 服务器分发 `192.168.26.0/24` 网段地址。
3. 设立 RA 服务器广播 `fd23::/64` 网段。
4. 设立 DNS 服务器监听本机地址提供服务。
5. 所有容器通过 NAT（网络地址转换）上外网。

### 主机创建虚拟网卡

使用 `ip` 工具创建一个 `nat0` 虚拟网卡并给予地址。

```sh
sudo ip link add nat0 type bridge
sudo ip addr add 192.168.26.1/24 dev nat0
sudo ip addr add fd23::1/64 dev nat0
sudo ip link set nat0 up
```

### 配置 iptables 路由

首先开启系统的 IPv4 和 IPv6 的转发功能。

```sh
sudo sysctl -w net.ipv4.conf.all.forwarding=1
sudo sysctl -w net.ipv4.conf.default.forwarding=1
sudo sysctl -w net.ipv6.conf.all.forwarding=1
sudo sysctl -w net.ipv6.conf.default.forwarding=1
```

然后写入 iptables 规则。

```sh
# 设置网络地址转换
sudo iptables -t nat -A POSTROUTING -s 192.168.26.0/24 ! -d 192.168.26.0/24 -j MASQUERADE
sudo ip6tables -t nat -A POSTROUTING -s fd23::/64 ! -d fd23::/64 -j MASQUERADE
```

### 开启 DHCP & DNS 服务器

首先需要安装 `dnsmasq`。

```sh
# 开启 DHCP & DNS 服务
sudo dnsmasq --interface=nat0 --except-interface=lo \
  --dhcp-range=192.168.26.20,192.168.26.100,12h \
  --dhcp-range=fd23::/64,ra-stateless,ra-names \
  --listen-address=192.168.26.1 \
  --dhcp-option=6,192.168.26.1 \
  --pid-file=/var/run/nat0-dnsmasq.pid
```

`dnsmasq` 会自动读取 `/etc/resolv.conf` 并将 DNS 请求转发到上游的 DNS 服务器。

### 配置 nspawn 容器

编辑 `/etc/systemd/nspawn/<container-name>.nspawn` 文件，添加以下内容。

```conf
[Network]
Bridge=nat0
```

或者在手动启动的时候添加 `--network-bridge=nat0` 参数。

## 启动

我们默认 root 是没有设置密码的，如果想要设置 root 密码可以如下操作：

```sh
# 进入容器但不启动（类似 chroot）
sudo systemd-nspawn -D /var/lib/machines/<container-name>

# 设置 root 密码
passwd
```

完成之后可以连按三次 `Ctrl` + `]` 退出。

### 管理工具

可以使用 `machinectl` 来管理所有（位于 `/var/lib/machines/` 下面的）容器。

```sh
# 启动
sudo machinectl start <container-name>
# 停止
sudo machinectl stop <container-name>
# 打开终端（类似 TTY）
sudo machinectl login <container-name>
# 免密码打开 shell（root 就是可以为所欲为）
sudo machinectl shell <user>@<container-name>
```

### 容器内网络配置

使用 `ip a` 来查看容器内的所有网络设备，如果没有任何问题，你将可以看到 `lo` 和另外一个 `host0@if5` 的设备（数字可能不太一样）。

一般来说，直接启动 `systemd-networkd.service` 就可以自动配置 ip 地址。

```sh
sudo systemctl enable --now systemd-networkd.service
```

DNS 服务器应该会自动配置完成，如果没有成功，也可以直接编辑 `/etc/resolv.conf` 并添加 `nameserver 192.168.26.1`。

```sh
echo "nameserver 192.168.26.1" > /etc/resolv.conf
```

最后直接使用 `ping www.bilibili.com`，应该可以正常 DNS 解析与路由数据包。

使用 `curl ip.sb` 查看本机访问外网时的 IP 地址。

## 其他问题

### IPv6

参考阅读 [SLAAC 环境下的 IPv6 桥接与中继 - Menci's Blog](https://blog.men.ci/ipv6-slaac-relay-and-bridge/)。

建议别折腾给容器分发 v6 地址，除非你在路由器上搞这个。

### ping 不能用

Arch Linux 下的 `ping` 工具貌似有些小问题，可能会像这样报错：

```
ping: socktype: SOCK_RAW
ping: socket: Operation not permitted
ping: => missing cap_net_raw+p capability or setuid?
```

可以使用 `setcap` 给 `/usr/bin/ping` 添加缺少的 capability。

```sh
sudo setcap 'cap_net_raw+p' /usr/bin/ping
```

## 留言

给文章一个评价吧！如果过程中有遇到任何问题，可以留言讨论。

<vue-reactions path="nspawn-is-great"></vue-reactions>
