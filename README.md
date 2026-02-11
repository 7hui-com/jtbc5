# JTBC CMS(5.0)

## 官方网站：

https://www.jtbc.cn/

## 系统特点：
JTBC CMS(5.0) 是一款基于`PHP`和`MySQL`的内容管理系统`原生全栈开发框架`，开源协议为`AGPLv3`，没有任何附加条款。系统可以通过命令行`一键安装`，源码方面不基于任何第三方框架，不使用任何脚手架，仅依赖一些常见的第三方类库如图表组件等，您只需要了解`最基本的前端知识`就能`很敏捷的进行二次开发`，同时我们对于常见的前端功能做了`Web Component`方式的封装，即便是您仅了解`HTML/CSS`也能在二次开发方面游刃有余。另外，对于常见的应用如企业网站等，则可通过后台的`云端市场`直接`一键安装`，哪怕是没有任何技术背景也可以轻松驾驭！

## 运行环境：

PHP(8.0+), MySQL(8.0+)

## 一键安装：

如果您有`全新安装的服务器操作系统`并且具备`root`权限，那么可以尝试一键安装。

### 1.ubuntu server [22.04 | 24.04]

```
curl https://download.jtbc.cn/php/5.0/ubuntu-jtbc-install.sh | sudo sh
```

### 2.debian server [11 | 12]

```
curl https://download.jtbc.cn/php/5.0/debian-jtbc-install.sh | sudo sh
```

## 手动配置：

1. 需要将站点主目录设置为`Public`目录。
2. 需要`HTTP Server`支持`PATH_INFO`并将所有请求`转发至入口文件`即可。

### 1.Nginx

需要在配置文件中的`server`下增加配置：

```
if (!-f $request_filename) {
  rewrite ^(.*)$ /index.php$1 last;
  break;
}
```

另外需要添加配置让`Nginx`支持`PATH_INFO`参考如下：

```
location ~ \.php {
  fastcgi_pass unix:/run/php/php8.4-fpm.sock;
  fastcgi_index index.php;
  include fastcgi_params;
  set $real_script_name $fastcgi_script_name;
  if ($fastcgi_script_name ~ "^(.+?\.php)(/.+)$") {
    set $real_script_name $1;
    set $path_info $2;
  }
  fastcgi_param SCRIPT_FILENAME $document_root$real_script_name;
  fastcgi_param SCRIPT_NAME $real_script_name;
  fastcgi_param PATH_INFO $path_info;
}
```

### 2.Apache

安装完成之后，在`Public`目录下设置`.htaccess`文件：

```
<IfModule mod_rewrite.c>
  RewriteEngine on
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^(.*)$ /index.php/$1 [QSA,PT,L]
</IfModule>
```

### 3.IIS

需要安装地址重写模块，下载地址：https://www.iis.net/downloads/microsoft/url-rewrite
安装完成之后，在`Public`目录下设置`web.config`文件，内容为：

```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="index">
          <match url="(.*)" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.php/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## 更多帮助：

https://help.jtbc.cn/php/5.0/

## 部分模板（整体应用包）预览：

|||
| ------------ | ------------ |
|![](https://v5.images.jtbc.cn/package/700065/poster.png)|![](https://v5.images.jtbc.cn/package/700090/poster.png)|
|![](https://v5.images.jtbc.cn/package/700058/poster.png)|![](https://v5.images.jtbc.cn/package/700085/poster.png)|
|![](https://v5.images.jtbc.cn/package/700026/poster.png)|![](https://v5.images.jtbc.cn/package/500026/poster.png)|
|![](https://v5.images.jtbc.cn/package/700021/poster.png)|![](https://v5.images.jtbc.cn/package/700084/poster.png)|
|![](https://v5.images.jtbc.cn/package/700052/poster.png)|![](https://v5.images.jtbc.cn/package/700047/poster.png)|
|![](https://v5.images.jtbc.cn/package/700027/poster.png)|![](https://v5.images.jtbc.cn/package/700069/poster.png)|

© 2006~2026 上海七慧网络科技有限公司 All Rights Reserved.
