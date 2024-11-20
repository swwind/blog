---
title: Linux 下使用 Tproxy 指南
---

# Linux 下使用 Tproxy 指南

<vue-metadata author="swwind" time="2024-11-19"></vue-metadata>

<!-- 绝大部分时候，程序都会尊重并使用 HTTP 代理，但也会有程序死活不走代理。这时候就可以通过直接开一个透明代理来调教这些应用程序。 -->

背景略。

一般来说，目前的猫猫工具都会提供一个 tproxy 功能，用于实现透明代理。但是这个功能并不是开箱即用的，仍然需要用户进行一定的手动配置。

本文会介绍一种可以工作的透明代理方案。

<!-- ## 计网前置基础知识 -->

<!-- 希望各位大学的计算机网络没有白学。 -->

<!-- - 你需要知道 TCP、UDP 协议是什么，在哪一层。 -->
<!-- - 你需要知道 ICMP 是什么，在哪一层。 -->

<!-- 一般来说 tproxy 只会支持 TCP / UDP 协议的透明代理，是否支持 UDP 可能更加取决于落地服务器。 -->

下文统一假设 tproxy 服务运行在本机 `127.0.0.1` / `::1` 的 `7893` 端口上。

## 原理

实现透明代理的最基本操作，就是利用 iptables 劫持网络数据包流量，然后转发到 tproxy 服务的端口上。

劫持操作需要发生在 iptables 的 `mangle` 表的 `PREROUTING` 链上。

```sh
# 将所有进入本机的 tcp/udp 数据包交给 tproxy
iptables -t mangle -A PREROUTING -p tcp -j TPROXY --on-ip 127.0.0.1 --on-port 7893
iptables -t mangle -A PREROUTING -p udp -j TPROXY --on-ip 127.0.0.1 --on-port 7893
```

不过这并不是直接能用的，你一跑上面的指令你电脑就上不了网了，因为你将很多不需要转发的东西也转发到 tproxy 里面了。

准确来说，我们可能不希望透明代理会劫持一些发送到内网地址的数据包，也不会希望将一些应该送达到本机的数据包再塞到 tproxy 中。此外，你也不会希望你的猫猫进程发送的数据包再被劫持到透明代理中去（这样就死循环了）。

但在这之前更重要的是，本机上网的流量并不会经过 `PREROUTING` 链，而是直接从 `OUTPUT` 到 `POSTROUTING` 链出去，因而完全不会被劫持到 tproxy 中。

因此，我们需要一个简单的 trick 去让本机的数据包都走一遍 `PREROUTING` 链再出去。

```sh
# 添加一条路由规则，对于 mark 为 1 的数据包，默认从 lo 设备出去
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100
# 将所有从本机出去的 tcp/udp 数据包都 mark 为 1
iptables -t mangle -A OUTPUT -p tcp -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -p udp -j MARK --set-mark 1
```

`lo` 设备是一个回环设备，这会使数据包先到达本机的 `lo` 设备，再通过转发的方式出去。这样，数据包就可以经过 `PREROUTING` 链从而被上面的脚本劫持到 tproxy 里面了。

## 实现

因此，综合上面的考量，我们可以写出大致如下的脚本。

### 重路由本机数据包

当然，如果你在路由器上折腾，只针对子网实现透明代理，那么你就不需要这一步。

```sh
# 添加一条路由规则，对于 mark 为 1 的数据包，默认从 lo 设备出去
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# 添加一个新的链，用来判断本机出去的数据包是否需要经过代理
iptables -t mangle -N CLASH
iptables -t mangle -A CLASH -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A CLASH -d 127.0.0.0/8 -j RETURN
iptables -t mangle -A CLASH -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A CLASH -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A CLASH -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A CLASH -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A CLASH -p tcp -j MARK --set-mark 1
iptables -t mangle -A CLASH -p udp -j MARK --set-mark 1

# 对于本机非 clash-meta 用户都启用透明代理
iptables -t mangle -A OUTPUT -m owner ! --uid-owner clash-meta -j CLASH
```

对于 IPv6 的情况，也是类似。

```sh
# 添加一条路由规则，对于 mark 为 1 的数据包，默认从 lo 设备出去
ip -6 rule add fwmark 1 table 101
ip -6 route add local ::/0 dev lo table 101

# 添加一个新的链，用来判断本机出去的数据包是否需要经过代理
ip6tables -t mangle -N CLASH6
ip6tables -t mangle -A CLASH6 -d ::1/128 -j RETURN
ip6tables -t mangle -A CLASH6 -d fc00::/7 -j RETURN
ip6tables -t mangle -A CLASH6 -d ff00::/8 -j RETURN
ip6tables -t mangle -A CLASH6 -d fe80::/10 -j RETURN
ip6tables -t mangle -A CLASH6 -p tcp -j MARK --set-mark 1
ip6tables -t mangle -A CLASH6 -p udp -j MARK --set-mark 1

# 对于本机非 clash-meta 用户都启用透明代理
ip6tables -t mangle -A OUTPUT -m owner ! --uid-owner clash-meta -j CLASH6
```

### 劫持到透明代理

之后就好办了，不过除了绕过私有地址之外，我们也需要绕过本机的 v4/v6 公网地址，以免应该到达本机的数据包被塞到透明代理里面。

```sh
# 创建新链，判断 IPv4 是否需要劫持
iptables -t mangle -N CLASH_LAN
iptables -t mangle -A CLASH_LAN -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A CLASH_LAN -d 127.0.0.0/8 -j RETURN
iptables -t mangle -A CLASH_LAN -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A CLASH_LAN -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A CLASH_LAN -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A CLASH_LAN -d 255.255.255.255/32 -j RETURN
# 如果你本机有一个 IPv4 的公网地址，可能你还需要绕过目标地址为你本机的 v4 网络数据包
v4address=($(ip -4 a | grep inet | awk '{print $2}'))
for a in ${v4address[@]}; do
  iptables -t mangle -A CLASH_LAN -d "$a" -j RETURN
done
# 将应该劫持的数据包重定向到 tproxy 服务
iptables -t mangle -A CLASH_LAN -p tcp -j TPROXY --on-ip 127.0.0.1 --on-port 7893
iptables -t mangle -A CLASH_LAN -p udp -j TPROXY --on-ip 127.0.0.1 --on-port 7893
# 添加劫持到 PREROUTING 链上
iptables -t mangle -A PREROUTING -j CLASH_LAN
```

对于 IPv6 如下。

```sh
# 创建新链，判断 IPv6 数据包是否需要劫持
ip6tables -t mangle -N CLASH6_LAN
ip6tables -t mangle -A CLASH6_LAN -d ::1/128 -j RETURN
ip6tables -t mangle -A CLASH6_LAN -d fc00::/7 -j RETURN
ip6tables -t mangle -A CLASH6_LAN -d ff00::/8 -j RETURN
ip6tables -t mangle -A CLASH6_LAN -d fe80::/10 -j RETURN
# 绕过本机公网 v6 地址，因为本机肯定有一个公网 v6 地址
v6address=($(ip -6 a | grep inet6 | awk '{print $2}' | grep '^[23]'))
for a in ${v6address[@]}; do
  ip6tables -t mangle -A CLASH6_LAN -d "$a" -j RETURN
done
# 将应该劫持的数据包重定向到 tproxy 服务
ip6tables -t mangle -A CLASH6_LAN -p tcp -j TPROXY --on-ip ::1 --on-port 7893
ip6tables -t mangle -A CLASH6_LAN -p udp -j TPROXY --on-ip ::1 --on-port 7893
# 添加劫持到 PREROUTING 链上
ip6tables -t mangle -A PREROUTING -j CLASH6_LAN
```

然后就好了。

### 关闭透明代理

上面所有代码的一键删除脚本。

```sh
# 删除本机重路由规则
ip rule del fwmark 1 table 100
ip route del local 0.0.0.0/0 dev lo table 100
iptables -t mangle -D OUTPUT -m owner ! --uid-owner clash-meta -j CLASH
iptables -t mangle -F CLASH
iptables -t mangle -X CLASH
ip -6 rule del fwmark 1 table 101
ip -6 route del local ::/0 dev lo table 101
ip6tables -t mangle -D OUTPUT -m owner ! --uid-owner clash-meta -j CLASH6
ip6tables -t mangle -F CLASH6
ip6tables -t mangle -X CLASH6

# 删除劫持到透明代理的规则
iptables -t mangle -D PREROUTING -j CLASH_LAN
iptables -t mangle -F CLASH_LAN
iptables -t mangle -X CLASH_LAN
ip6tables -t mangle -D PREROUTING -j CLASH6_LAN
ip6tables -t mangle -F CLASH6_LAN
ip6tables -t mangle -X CLASH6_LAN
```

### 其他说明

如果想要控制什么网段可以访问，什么用户不允许访问之类的，可以直接魔改这份脚本。

例如：对于本机发出的 DNS 查询数据包都不劫持。

```sh
iptables -t mangle -A CLASH -p udp --dport 53 -j RETURN
iptables -t mangle -A CLASH -p tcp --dport 53 -j RETURN
iptables -t mangle -A CLASH -p tcp --dport 853 -j RETURN
```

## 留言

<vue-reactions path="how-to-use-tproxy-linux"></vue-reactions>
