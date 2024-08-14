---
title: 基于 systemd-nspawn 的轻量化容器搭建与网络配置
---

# 基于 systemd-nspawn 的轻量化容器搭建与网络配置

<vue-metadata author="swwind" time="2024-4-16" updated="2024-4-29"></vue-metadata>

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
  --include=dbus-broker,systemd-container \
  --components=main,universe \
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

我的目标配置如下：主机上创建一个虚拟网卡，掌管 `192.168.26.0/24` 的 NAT 网络，所有容器通过该网卡进行上网和与其他容器通信。

### 主机创建虚拟网卡

使用 `ip` 工具创建一个 `nat0` 虚拟网卡并给予地址。

```sh
sudo ip link add nat0 type bridge
sudo ip addr add 192.168.26.1/24 dev nat0
sudo ip link set nat0 up
```

### 配置 iptables 路由

首先开启系统的 IPv4 转发功能。

```sh
sudo sysctl -w net.ipv4.conf.all.forwarding=1
sudo sysctl -w net.ipv4.conf.default.forwarding=1
```

然后写入 iptables 规则。

```sh
# 允许 DHCP 和 DNS 数据包进入本机（不过好像默认都是开的）
sudo iptables -I INPUT -i nat0 -p udp --dport 67 -j ACCEPT
sudo iptables -I INPUT -i nat0 -p tcp --dport 67 -j ACCEPT
sudo iptables -I INPUT -i nat0 -p udp --dport 53 -j ACCEPT
sudo iptables -I INPUT -i nat0 -p tcp --dport 53 -j ACCEPT
# 允许转发
sudo iptables -I FORWARD -i nat0 -j ACCEPT
sudo iptables -I FORWARD -o nat0 -j ACCEPT
# 设置网络地址转换
sudo iptables -t nat -A POSTROUTING -s 192.168.26.0/24 -j MASQUERADE
```

### 开启 DHCP & DNS 服务器

首先需要安装 `dnsmasq`。

```sh
# 开启 DHCP & DNS 服务
sudo dnsmasq --interface=nat0 --except-interface=lo \
  --dhcp-range=192.168.26.20,192.168.26.100,12h \
  --listen-address=192.168.26.1 --port=53 \
  --pid-file=/var/run/nat0-dnsmasq.pid
```

`dnsmasq` 会自动读取 `/etc/resolv.conf` 并将 DNS 请求转发到上游的 DNS 服务器。

### 配置 nspawn 容器

编辑 `/etc/systemd/nspawn/<container-name>.nspawn` 文件，添加以下内容。

```conf
[Network]
Bridge=nat0
```

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

可以使用 `machinectl` 来管理所有的容器。

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

DNS 服务器可能需要手动配置，直接编辑 `/etc/resolv.conf` 并添加 `nameserver 192.168.26.1` 即可。

```sh
echo "nameserver 192.168.26.1" > /etc/resolv.conf
```

最后直接使用 `ping www.bilibili.com`，应该可以正常 DNS 解析与路由数据包。

## 其他问题

### IPv6

参考阅读 [SLAAC 环境下的 IPv6 桥接与中继 - Menci's Blog](https://blog.men.ci/ipv6-slaac-relay-and-bridge/)。

取决于你本机获取的 IPv6 地址段大小，有下面几种情况：

1. 本机获取的是一整段 `/64` 地址，即上层路由器会将整段地址的数据包都路由到本机，比较常见在家庭宽带的路由器中；
2. 本机获取到的只有一个 `/128` 地址，即路由器只会将目标地址完全匹配的数据包路由到本机，比较常见在校园网和其他环境中。

如果你不知道你是什么情况，可以主动尝试添加一个 IPv6 地址，并检查数据包能否回到本机。

假设你使用 `eno1` 网卡进行上网，使用 `ip addr show dev eno1 | grep inet6` 可以查看到该设备的 IPv6 地址。

```
inet6 2001:db8:1234:5678:1111:2222:3333:4444/64 scope global dynamic noprefixroute
inet6 fe80::6b12:c8e3:92d1:9ced/64 scope link noprefixroute
```

可以看到上面的 `2001:db8:1234:5678:1111:2222:3333:4444/64` 即是本机的公网 IPv6 地址。

之后保留前面的 64 位地址不变，将后 64 位地址替换成任意其他数字，添加到该网卡中。

```sh
sudo ip addr add 2001:db8:1234:5678::1/64 dev eno1
```

然后使用 `ping -I <addr> <domain>` 验证使用该地址的数据包能否返回。

```sh
ping -I 2001:db8:1234:5678::1 www.bilibili.com
```

如果能够返回，则说明分配给本机的是整个网段，否则说明分配给本机的只是单独的一个地址。

~~当然你也可以直接假定是第二种情况，除非你在路由器上面跑 nspawn。~~

#### 可以用整个网段

针对第一种情况，我们直接在 `dnsmasq` 中启用 RA 功能分发本网段的地址即可。

我没有折腾过，你可能需要自己查阅文档。

当然，如果你不想给容器分配公网地址，你也可以用下面的方式。

#### 只能用一个地址

针对这种情况也有很多解决办法，这里给出一种基于 NAT6 的地址分配方式。

首先开启系统的 IPv6 转发功能。

```sh
sudo sysctl -w net.ipv6.conf.all.forwarding=1
sudo sysctl -w net.ipv6.conf.default.forwarding=1
```

然后随便找一个 IPv6 的保留地址段（以 `fc00::/7` 开头，例如 `fd23::/64`），在创建 `nat0` 的时候顺便给予其该地址段。

```sh
sudo ip addr add fd23::1/64 dev nat0
```

之后配置 `iptables` 的时候加入关于 IPv6 的网络地址转换功能。

```sh
# 允许转发
sudo ip6tables -I FORWARD -i nat0 -j ACCEPT
sudo ip6tables -I FORWARD -o nat0 -j ACCEPT
# 设置网络地址转换
sudo ip6tables -t nat -A POSTROUTING -s fd23::/64 -j MASQUERADE
```

最后启动 `dnsmasq` 的时候加入以下参数来自动分配 IPv6 地址。

```
--dhcp-range=fd23::/64,ra-stateless,ra-names
```

之后重启容器，就可以看到容器被自动分配了 `fd23::/64` 的地址，并且可以通过网络地址转换功能接入 IPv6 网络。

当然，你可以删除上文中的 IPv4 相关内容，就可以获得一个 IPv6 Only 的容器。<span class="truth" title="你知道的太多了">但是没有什么用</span>

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
