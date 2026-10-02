# ABB 2026 正式服务器部署指南

版本：2026-10-02，ThinkPHP 3.2.3 / V5.8.0。

已确定：沿用去年的服务器、数据库账号和公众号，为今年新建独立 `abb2026` 数据库。不要替换旧站点、升级旧服务器整个系统、导入去年用户数据或清空已有库。Pages 是静态验收页，不能运行 PHP 或微信授权。

以下使用 Linux / Nginx / PHP-FPM 示例。服务器操作需实际 SSH 连接信息；所有域名、PHP 版本及路径示例必须按现有服务器核实后替换。不要直接照抄套接字版本号。

## 1. 检查原服务器

先确认 SSH 地址/别名、端口和用户名，旧活动源码及配置位置，今年的 HTTPS 域名、公众号授权域名、活动时间与确认的奖品权重。

在原服务器做只读检查：

```bash
php -v
php -m
nginx -t
systemctl list-units --type=service --all | grep -E 'php.*fpm|mysql|mariadb|nginx'
```

本项目本地验证使用 PHP 8.5；代码最低 PHP 7.4，但正式服务器应选用仍受安全维护且与现有业务兼容的版本。需要 PDO/pdo_mysql、curl、mbstring、openssl、json、session。若旧站 PHP 太老，安装并行版本及独立 FPM 池，不改变旧站的 socket 或池配置。Apache 服务器使用根目录 `.htaccess` 的等价保护并确认 AllowOverride 生效。

数据库服务沿用原实例，3306 不需对公网开放。检查磁盘、内存、证书与备份，不在现有服务器盲目执行系统升级或防火墙修改。

## 2. 独立部署代码

示例新目录：`/srv/abb2026/app`。若沿用现有部署账号，将 `abbdeploy` 替换为实际账号；只在账号不存在时创建。GitHub 只读部署密钥可以复用已有授权方式，但不能提交私钥。

```bash
sudo install -d -o abbdeploy -g www-data -m 2750 /srv/abb2026
sudo -u abbdeploy git clone --branch main --single-branch \
  git@github.com:Easyobj/abb2026.git /srv/abb2026/app
sudo chgrp -R www-data /srv/abb2026/app
sudo find /srv/abb2026/app -type d -exec chmod 750 {} +
sudo find /srv/abb2026/app -type f -exec chmod 640 {} +
sudo install -d -o www-data -g www-data -m 750 \
  /srv/abb2026/app/Application/Runtime \
  /srv/abb2026/app/Application/Runtime/5.8.0
sudo install -d -o www-data -g www-data -m 700 /var/lib/php/abb2026-sessions
```

源码归部署账号所有，仅 Runtime 和独立 Session 目录让 PHP 用户写入。不要拷贝去年的 Runtime、用户缓存或日志。

## 3. 复用私密配置，新建今年数据库

配置保存在 Web 根之外。下面旧配置路径是示例，先核实；不要打印内容：

```bash
sudo install -d -o root -g www-data -m 750 /etc/abb2026
cd /srv/abb2026/app
sudo php api/bin/import-legacy-config.php \
  --source=/实际旧项目/Application/Common/Conf/config.php \
  --output=/etc/abb2026/settings.php \
  --app-url=https://h5.company.example
sudo chown root:www-data /etc/abb2026/settings.php
sudo chmod 640 /etc/abb2026/settings.php
```

导入保持旧 DB_HOST、端口、账号、密码与公众号凭据，只把库名改成 `abb2026`；不会覆盖已有配置。未提供真实域名时不要填示例域名作为正式配置。原配置的 `localhost` 是原服务器本机，不是开发者电脑。

先预演（不连接数据库），再在确认的原服务器执行：

```bash
sudo php api/bin/provision-database.php --config=/etc/abb2026/settings.php
sudo php api/bin/provision-database.php --config=/etc/abb2026/settings.php --execute
```

脚本仅允许库名 `abb2026`，新建库并导入 `api/database/schema.sql`；若库已有任何表则拒绝初始化。不会修改去年的数据库。DDL 不是完整可回滚事务；执行失败时检查新库中的部分建表状态，不要直接删库重来。若原账号无建库权限，由服务器数据库管理员创建并授权今年库；不要为此擅自修改去年账号权限。

新库奖品来自今年资料，抽奖权重有意保持 NULL，须由活动方确认。已有今年数据库升级只执行经过审查的迁移，不重新导入初始化 SQL。

## 4. 补充正式配置与独立 FPM 池

```bash
sudoedit /etc/abb2026/settings.php
```

填今年实际 `app_url`、`activity.starts_at`、`activity.ends_at`（格式 YYYY-MM-DD HH:MM:SS，Asia/Shanghai）；保留：

```php
'app_env' => 'production',
'dev_openid' => '',
// wechat 中：
'browser_required' => true,
// db 中：
'name' => 'abb2026',
```

不要重新在聊天或命令行参数中输入密码/密钥。导入时已读取原值。复用原账号保留其权限风险；独立数据库不等于最小权限账号，旧凭据的历史暴露风险也仍存在。

为实际 PHP 版本新建 FPM 池，例如 `/etc/php/8.5/fpm/pool.d/abb2026.conf`：

```ini
[abb2026]
user = www-data
group = www-data
listen = /run/php/php8.5-fpm-abb2026.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
pm = ondemand
pm.max_children = 10
pm.process_idle_timeout = 10s
pm.max_requests = 500
env[ABB_CONFIG_FILE] = /etc/abb2026/settings.php
php_admin_flag[display_errors] = off
php_admin_flag[log_errors] = on
php_admin_flag[expose_php] = off
php_admin_value[session.save_path] = /var/lib/php/abb2026-sessions
```

进程数按服务器容量核定。先用实际 FPM 二进制执行配置测试（如 `sudo php-fpm8.5 -t`），再 reload 对应服务；不要中断旧活动。私密配置在框架启动之前读取，不写入 ThinkPHP 编译缓存。

## 5. Nginx、HTTPS 与保护规则

为今年域名单独创建站点。下面是最终 HTTPS server 示例；证书路径、域名和 FPM socket 必须实际存在。签发证书前，按现有服务器的证书管理方式设置 80 验证站点，不删除旧配置。

```nginx
server {
    listen 443 ssl;
    server_name h5.company.example;
    ssl_certificate /实际证书/fullchain.pem;
    ssl_certificate_key /实际证书/privkey.pem;
    root /srv/abb2026/app;
    index index.php index.html;
    access_log /var/log/nginx/abb2026.access.log;
    error_log /var/log/nginx/abb2026.error.log warn;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location = /index.html {
        return 302 /index.php$is_args$args;
    }
    location ~* ^/(?:Application|ThinkPHP|templates)(?:/|$) {
        deny all;
    }
    location ~* ^/api/(?:database/|bin/|config[^/]*|bootstrap\.php$) {
        deny all;
    }
    location ~ (^|/)\. {
        deny all;
    }
    location ~* \.(?:md|sql|log|ini|env|bak|dist|example)$ {
        deny all;
    }
    location ~ \.php$ {
        try_files $uri =404;
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.5-fpm-abb2026.sock;
    }
    location ~* \.(?:woff2|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
server {
    listen 80;
    server_name h5.company.example;
    return 301 https://$host$request_uri;
}
```

保留 PHP 发出的 `Cache-Control: no-store`，不对活动/后台响应做反向代理缓存。源码保护规则必须放在 PHP 正则前；不能仅隐藏配置却允许请求框架入口。项目 `nginx-cache.conf` 只是片段，不是完整 server 配置。

```bash
sudo nginx -t
sudo systemctl reload nginx
```

确认 HTTPS 证书、HTTP 跳转与域名均正确，再检查以下路径拒绝访问：`/Application/Common/bootstrap.php`、`/ThinkPHP/ThinkPHP.php`、`/api/config.local.php`、`/api/database/schema.sql`、`/.git/config`。公开 `index.html` 应跳转 PHP。证书续期按服务器现有工具验证；不要创建冲突的第二套续期任务。

## 6. 微信授权、管理员及预检

在公众号后台按当前提示配置今年的网页授权域名及验证文件。旧域名已经不再使用时，不应继续写入今年的 app_url。正式活动地址为 `https://实际域名/`；回调是：

```text
https://实际域名/index.php?m=Other&c=Auth&a=callback
```

非微信浏览器只显示打开提示；微信内访问立即 OAuth，回调校验 state 并建立会话。User-Agent 门禁不能代替 OAuth 身份验证。

在 SSH 终端创建后台账号，密码隐藏输入：

```bash
cd /srv/abb2026/app
read -r -s -p 'New admin password: ' ABB_ADMIN_PASSWORD
printf '\n'
export ABB_ADMIN_PASSWORD
sudo --preserve-env=ABB_ADMIN_PASSWORD -u www-data \
  env ABB_CONFIG_FILE=/etc/abb2026/settings.php \
  php api/bin/create-admin.php eventadmin
unset ABB_ADMIN_PASSWORD
sudo -u www-data env ABB_CONFIG_FILE=/etc/abb2026/settings.php \
  php api/bin/preflight.php
```

密码至少 12 位，存入企业密码管理器。后台地址 `https://实际域名/index.php?m=Admin&c=Index&a=index`。录入已确认权重后再次完整预检，所有项应 OK；不能用 `--local` 的跳过项代替上线通过。运维健康地址仍为 `/api/index.php?action=health`，前端业务采用 PHP 模板和表单而不是 JSON API。

## 7. 真实上线验收

- 非微信浏览器不得看到活动业务内容；微信首次授权、刷新保持登录。
- 六站答题的正确/错误/开放答案、刷新进度与活动时间边界。
- 未满足条件或权重未配置时拒绝抽奖。
- 经批准的测试奖池验证一次抽奖、重复请求同一码、总库存和当日库存扣减一次；不要消耗未批准的正式奖品。
- 后台登录限速、一次核销、重复核销拒绝、CSV 导出与审计。
- 日志、异常页面、编译缓存不含密码、AppSecret 或 OAuth token。
- 真实公众号授权往返需要实际域名/服务器，Pages 和本地模拟不能替代。

## 8. 备份、发布和回滚

先备份今年数据库、配置与服务器站点配置，备份存放 Web 根之外并接入加密异地存储。不要把生产用户数据或 SQL dump 放入 Git。

由有备份权限的数据库管理员运行（socket 登录示例，按原服务器认证方式调整）：

```bash
sudo install -d -o root -g root -m 700 /var/backups/abb2026
sudo sh -c 'umask 077; mariadb-dump --single-transaction abb2026 > /var/backups/abb2026/pre-release.sql'
```

示例固定文件名会覆盖旧备份；仅用于首次备份，后续按现有备份系统生成唯一文件名并验证恢复，不重复覆盖。

更新代码：

```bash
cd /srv/abb2026/app
sudo -u abbdeploy git fetch origin main
sudo -u abbdeploy git pull --ff-only origin main
php -l index.php
sudo -u www-data env ABB_CONFIG_FILE=/etc/abb2026/settings.php php api/bin/preflight.php
sudo nginx -t
```

新版本若更换 Runtime 版本目录，先创建并授予 PHP 用户写权限；不要让整个代码目录可写。版本化静态资源和 Runtime 防止旧缓存混用。reload 实际 FPM 与 Nginx 后验收首页、授权与后台。

回滚前保留当前状态并通知活动方。以部署账号切到上一个经过验证的提交，再按该版本指南确认私密配置路径、Runtime 权限、预检和 FPM。数据库迁移需评估兼容性，不能用旧代码或 SQL 强行覆盖活动数据。过往版本可能尚不支持 `ABB_CONFIG_FILE`，不能假定任意旧提交直接回滚可用。

## 9. 故障排查

| 现象 | 检查 |
| --- | --- |
| 502 | 新 FPM 池是否启动、socket 名称及权限、今年 Nginx 日志 |
| 服务错误 | 私密配置可读性、ABB_CONFIG_FILE、PHP 扩展、Runtime 可写、数据库权限 |
| 授权域名错误 | 公众号授权域名、app_url、证书及回调 URL |
| 抽奖不可用 | 活动时间、资格、确认权重与库存，禁止编造成功结果 |
| 后台不可用 | Admin 查询路由、管理员表、Session 写权限、登录锁定 |

源码和 Pages 每阶段同步发布；正式 PHP 服务器另行部署。未实际完成远端建库和真实微信验收前，不声明生产上线完成。
