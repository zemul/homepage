---
title: "V2Board + Poseidon"
date: "2020-06"
description: "使用aaPanel测试 准备工作 - 安装aaPanel，这里是最新版。 shell yum install -y wget && wget -O install.sh http://www.aapa"
lang: zh
tags: ["教程"]
---


## 使用aaPanel测试

### 准备工作

- 安装aaPanel，这里是[最新版](https://forum.aapanel.com/d/9-aapanel-linux-panel-673-installation-tutorial)。

```shell
yum install -y wget && wget -O install.sh http://www.aapanel.com/script/install_6.0_en.sh && bash install.sh
```

- 用户名密码

```shell
aaPanel: https://panel.humanzoo.club/loginz
username: humanzoo
password: 720fb8e1e.
```

* 安装

  ☑️ Nginx 1.17
  ☑️ MySQL 5.6
  ☑️ PHP 7.3
  ☑️ redis 

* 解除被禁止的函数

  * putenv 
  * proc_open 
  * pcntl_alarm 
  * pcntl_signal

* 数据库

```shell
数据库名：humanzoo
用户名：humanzoo
密码：zsMxwfGtYfBbGhLR
```

* 修改面板的图标

```shell
# 默认图标在 /www/server/panel/BTPanel/static
cd /www/server/panel/BTPanel/static
```

* 将站点下方所有文件删除

* 伪静态

```json
location /downloads {
}

location / {  
    try_files $uri $uri/ /index.php$is_args$query_string;  
}

location ~ .*\.(js|css)?$
{
    expires      1h;
    error_log off;
    access_log /dev/null; 
}
```

* 下载1.2.2

```shell
git clone -b 1.2.2 https://github.com/v2board/v2board.git ./

wget https://getcomposer.org/download/1.9.0/composer.phar

php composer.phar install

php artisan v2board:install
```

### 尝试后端

* 通讯密钥 

```
dwNgNurDtrXJrmVege
```



* 第一个 docker ws 安装

```shell
# 公共部分
curl -fsSL https://get.docker.com | bash
curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod a+x /usr/local/bin/docker-compose
rm -f `which dc` 
ln -s /usr/local/bin/docker-compose /usr/bin/dc

systemctl start docker
service docker start
systemctl enable docker.service
systemctl status docker.service

# 先进入root文件夹
cd /root
yum install -y git
git clone https://github.com/ColetteContreras/v2ray-poseidon.git

cd /root/v2ray-poseidon/docker/v2board/ws
ls
yum install vim
vim /root/v2ray-poseidon/docker/v2board/ws/config.json
vim /root/v2ray-poseidon/docker/v2board/ws/docker-compose.yml

cd /root/v2ray-poseidon/docker/v2board/ws
dc up -d

# Poseidon 后端升级
dc pull && dc up -d
```

``` shell
# 通信密钥
dwNgNurDtrXJrmVege
```

* 查看 BBR

```shell
uname -r
sysctl net.ipv4.tcp_available_congestion_control

```

* Debian 安装 yum

```shell
apt-get update
apt-get install build-essential
apt-get install yum
```

* 同步时间

```shell
yum -y install ntpdate
timedatectl set-timezone Asia/Shanghai
ntpdate ntp1.aliyun.com
```

* 安装 BBR Plus

```shell
wget --no-check-certificate -O tcp.sh https://github.com/cx9208/Linux-NetSpeed/raw/master/tcp.sh && chmod +x tcp.sh && ./tcp.sh
```

* 国内源 iptables 转发

```shell
wget -qO natcfg.sh http://arloor.com/sh/iptablesUtils/natcfg.sh && bash natcfg.sh
```



# 探针的使用

* [原教程来源于这里](https://www.ioiox.com/archives/27.html) 相当清楚简洁。Docker 也好用。

服务器端配置脚本

```shell
wget -N --no-check-certificate https://raw.githubusercontent.com/stilleshan/files/master/projects/ops/serverstatus/status.sh && chmod +x status.sh
bash status.sh s

# vim 更新配置文件，更改完成配置以后，要重启 Docker
vim /root/ServerStatus/config.json
docker restart serverstatus
```

```shell
# 客户端的脚本和服务器一致，要多次安装。
wget -N --no-check-certificate https://raw.githubusercontent.com/stilleshan/ServerStatus/master/status.sh && chmod +x status.sh

bash status.sh c
```

* 同时也安装了一个 -V 版本的探针

```shell
wget -N --no-check-certificate https://raw.githubusercontent.com/P3TERX/ServerStatus-V/master/status.sh && chmod +x status.sh && bash status.sh


# 客户端菜单
bash status.sh c
# 服务端菜单
bash status.sh s
```





* 阿里云的AccessKey的使用

[AliDDNS 2.0教程](https://blog.ilemonrain.com/linux/aliddns-v2.html)

