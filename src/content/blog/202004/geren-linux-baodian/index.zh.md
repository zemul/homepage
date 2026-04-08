---
title: "个人 Linux 宝典"
date: "2020-04"
description: "移动文件 shell mv /root/test/ /root/test2/ 将 test 下面所有文件移动到 test2 里面 mv /root/test/test1.zip /root/test/"
lang: zh
tags: ["教程", "Linux"]
---


## 移动文件

```shell
mv /root/test/* /root/test2/
# 将 test 下面所有文件移动到 test2 里面
mv /root/test/test1.zip /root/test/test100.zip 
# 重命名文件
```
**参数：**
-i：交互方式操作。如果mv操作将导致对已存在的目标文件的覆盖，此时系统询问是否重写，要求用户回答”y”或”n”，这样可以避免误覆盖文件。
-f：禁止交互操作。mv操作要覆盖某个已有的目标文件时不给任何指示，指定此参数后i参数将不再起作用。 - r 指示mv将参数中列出的全部目录和子目录均递归地移动。



## 重命名文件

```shell
cd /home/www/site/
mv typecho.tar.gz tp.tar
```



## 删除文件

```shell
# 删除文件夹实例：
rm -rf /var/log/httpd/access

# 删除文件使用实例：
rm -f /var/log/httpd/access.log
```


 ## 新建文件夹

```shell
mkdir /root/newfolder
```

## 设置权限
```shell
chmod 777 /root/usr/test
```

## 安装 docker

