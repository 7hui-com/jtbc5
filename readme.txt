JTBC(5.0)

运行环境：
php8.0+，mysql8.0+

基本配置：
需要将站点主目录设置为 Public 目录。
需要将所有请求转发至入口文件，以下是配置方法：

1.Nginx
需要在配置文件中的 server 下增加配置：
if (!-f $request_filename) {
  rewrite ^(.*)$ /index.php$1 last;
  break;
}

2.Apache
安装完成之后，在 Public 目录下设置 .htaccess 文件：
<IfModule mod_rewrite.c>
  RewriteEngine on
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^(.*)$ /index.php/$1 [QSA,PT,L]
</IfModule>

3.IIS
需要安装地址重写模块，下载地址：https://www.iis.net/downloads/microsoft/url-rewrite
安装完成之后，在 Public 目录下设置 web.config 文件，内容为：
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

© 2004~2022 上海七慧网络科技有限公司 All Rights Reserved.