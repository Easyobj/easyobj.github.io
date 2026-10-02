# ABB 2026 正式服务器部署指南

版本：2026-10-02（适用于 PHP 模板渲染版 V5.7.1）

本文从一台新 Linux 云服务器开始，部署 PHP 活动页、数据库、HTTPS 和微信公众号网页授权。GitHub Pages 只能提供静态视觉预览，不能运行 PHP、保存用户进度或进行微信 OAuth。

部署示例采用 Ubuntu 26.04 LTS、Nginx、PHP 8.5-FPM、MariaDB、单独的 HTTPS 子域名和 GitHub 只读部署密钥。项目最低兼容 PHP 7.4，但新服务器应使用仍受安全支持的 PHP 分支。Ubuntu 26.04 LTS 标准支持到 2031 年 5 月，PHP 8.5 安全支持到 2029 年 12 月。若云厂商暂未提供 Ubuntu 26.04 镜像，可使用 Ubuntu 24.04 LTS 和该系统仓库中的受支持 PHP 版本，并相应调整 PHP-FPM 套接字名称。

## 1. 准备域名、云服务器和公众号

先由活动方或 IT 管理员准备以下内容：

- 一台有公网 IPv4 的 Ubuntu LTS 云服务器。建议至少 2 vCPU、4 GB 内存、40 GB SSD；实际容量按活动并发量和数据保留要求核定。
- 一个由活动方管理的 HTTPS 域名，例如 `h5.company.example`。将 DNS A 记录指向服务器公网 IP；如果没有可用 IPv6，不要添加 AAAA 记录。
- 已认证且有网页授权权限的微信公众号、AppID、AppSecret，以及公众号管理员权限。
- 已确认的活动起止时间、时区、奖品总库存、每日库存及抽奖权重。
- 有权限读取 `Easyobj/abb2026` 源码仓库的只读 GitHub Deploy Key。

建议使用独立子域名并将站点放在域名根路径。最终访问地址是 `https://h5.company.example/`，`app_url` 必须与之完全一致。把示例域名替换为真实域名后，再配置公众号。

若服务器放在中国大陆，先由服务器提供商/企业 IT 确认域名备案、接入备案及公网网站服务要求。微信公众号的网页授权域名需要与 HTTPS 站点主机名相符。登录微信公众平台，在“设置与开发 / 公众号设置 / 功能设置”中配置网页授权域名；平台要求验证时，按后台提供的文件和路径上传到站点根目录并在线确认可访问。域名配置及验证界面可能随账号类型和平台改版变化，以公众号后台当前提示为准。

注意：GitHub Pages 域名 `easyobj.github.io` 不是正式业务域名，也不能替代公众号网页授权域名或 PHP 服务器。

## 2. 初始化服务器

通过云厂商控制台创建服务器。安全组仅开放 TCP 22、80、443；SSH 尽量限制为 IT 办公网或 VPN 来源。不要向公网开放 MySQL/MariaDB 的 3306 端口。

以管理员账号 SSH 登录后更新系统并安装运行组件：

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y nginx mariadb-server git curl ca-certificates \
  php8.5-fpm php8.5-cli php8.5-mysql php8.5-curl php8.5-mbstring \
  snapd
sudo systemctl enable --now nginx mariadb php8.5-fpm
```

如果该镜像仓库里的 PHP 小版本包不同，先执行 `apt-cache policy php-fpm` 和 `apt-cache search '^php[0-9.]+-fpm$'`，选用 Ubuntu 官方仓库当前提供的受支持版本，再将下面的套接字 `/run/php/php8.5-fpm.sock` 改成实际路径。不要为照抄版本号安装已停止安全维护的 PHP。

确认 PHP 和必需扩展：

```bash
php -v
php -m | grep -E '^(curl|json|mbstring|openssl|PDO|pdo_mysql|session)$'
```

确认输出包含项目所需扩展。`json`、`openssl`、`PDO` 和 `session` 通常随 PHP 基础包提供；`pdo_mysql` 由 `php8.5-mysql` 提供。

关闭 PHP 屏幕错误输出并隐藏 PHP 版本标识：

```bash
sudoedit /etc/php/8.5/fpm/php.ini
```

确认配置为：

```ini
display_errors = Off
log_errors = On
expose_php = Off
```

保存后执行 `sudo systemctl restart php8.5-fpm`。生产错误写入受控日志，不显示给活动参与者。

如果使用 UFW，还要在云安全组已开放 22/80/443 的前提下执行：

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
sudo ufw status verbose
```

确认 SSH 仍可连接后再关闭当前会话。不要开放 3306。

## 3. 建立只读源码部署密钥

创建专用 Linux 账号和发布目录：

```bash
sudo adduser --disabled-password --gecos '' abbdeploy
sudo adduser abbdeploy www-data
sudo install -d -o abbdeploy -g www-data -m 2750 /srv/abb2026
sudo install -d -o abbdeploy -g www-data -m 2750 /srv/abb2026/app
```

以 `abbdeploy` 创建 SSH 密钥：

```bash
sudo -u abbdeploy install -d -m 700 /home/abbdeploy/.ssh
sudo -u abbdeploy ssh-keygen -t ed25519 -N '' \
  -C 'abb2026 production read-only deploy key' \
  -f /home/abbdeploy/.ssh/id_ed25519
sudo cat /home/abbdeploy/.ssh/id_ed25519.pub
```

将显示的公钥添加到 GitHub 仓库 `Easyobj/abb2026` 的 **Settings → Deploy keys**，保持只读权限，不勾选写权限。不要复制或发送私钥 `id_ed25519`。添加前核对 GitHub 当前公布的 SSH 主机指纹，再将 GitHub 主机密钥写入该账号的 `known_hosts`：

```bash
sudo -u abbdeploy sh -c 'ssh-keyscan -t ed25519 github.com > /home/abbdeploy/.ssh/known_hosts.candidate'
sudo -u abbdeploy ssh-keygen -lf /home/abbdeploy/.ssh/known_hosts.candidate
# 先将上一步指纹与 GitHub 官方公布的 SSH 指纹核对；一致后才安装。
sudo -u abbdeploy mv /home/abbdeploy/.ssh/known_hosts.candidate /home/abbdeploy/.ssh/known_hosts
sudo -u abbdeploy chmod 600 /home/abbdeploy/.ssh/known_hosts
```

从项目源码仓库拉取 `main`：

```bash
sudo -u abbdeploy git clone --branch main --single-branch \
  git@github.com:Easyobj/abb2026.git /srv/abb2026/app
sudo chgrp -R www-data /srv/abb2026/app
sudo find /srv/abb2026/app -type d -exec chmod 750 {} +
sudo find /srv/abb2026/app -type f -exec chmod 640 {} +
```

Nginx/PHP-FPM 通过 `www-data` 组读取文件；源码目录不允许其他系统用户读取。后续更新也由 `abbdeploy` 拉取，然后重新执行上面的组和权限命令。

## 4. 创建数据库和最小权限账号

Ubuntu 本机 MariaDB 默认通过系统管理员使用 Unix Socket 登录。创建独立数据库与应用账号：

```bash
sudo mariadb
```

在 MariaDB 提示符里执行以下 SQL。将占位密码替换为密码管理器生成的强随机密码，并把同一值填入下一节的 `config.local.php`。请勿把真实密码提交到 Git 或贴入工单、聊天记录。

```sql
CREATE DATABASE abb2026
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'abb2026_app'@'127.0.0.1'
  IDENTIFIED BY 'REPLACE_WITH_A_RANDOM_PASSWORD';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON abb2026.* TO 'abb2026_app'@'127.0.0.1';

FLUSH PRIVILEGES;
EXIT;
```

用应用账号仅授予运行所需的读写权限。数据库建表和升级由系统管理员手动执行，应用账号不应有建库、改表、授权或远程登录权限。

导入项目当前的完整表结构和奖品名称/库存初值：

```bash
cd /srv/abb2026/app
sudo mariadb abb2026 < api/database/schema.sql
```

不要重新执行初始化 SQL 来“清空”已有生产数据库；升级前按备份和迁移章节操作。现有 V5.4/V5.5 测试库升级后台表时，才执行项目明确提供的迁移：

```bash
sudo mariadb abb2026 < api/database/migrations/2026_10_02_admin.sql
```

## 5. 配置 PHP 应用

从示例创建服务器专用配置文件，限制文件权限：

```bash
cd /srv/abb2026/app
sudo cp api/config.local.php.example api/config.local.php
sudo chown root:www-data api/config.local.php
sudo chmod 640 api/config.local.php
sudoedit api/config.local.php
sudo chown root:www-data api/config.local.php
sudo chmod 640 api/config.local.php
```

将内容按真实环境填写。下面只说明字段，不是可直接上线的凭据：

```php
'app_env' => 'production',
'app_url' => 'https://h5.company.example',
'timezone' => 'Asia/Shanghai',
'db' => [
    'host' => '127.0.0.1',
    'port' => 3306,
    'name' => 'abb2026',
    'user' => 'abb2026_app',
    'password' => '填入上一步生成的数据库随机密码',
],
'wechat' => [
    'app_id' => '填入公众号 AppID',
    'app_secret' => '填入公众号 AppSecret',
    'scope' => 'snsapi_userinfo',
    'browser_required' => true,
],
'activity' => [
    'starts_at' => '填入活动方确认的 YYYY-MM-DD HH:MM:SS',
    'ends_at' => '填入活动方确认的 YYYY-MM-DD HH:MM:SS',
],
```

其余数组括号和现有配置示例保持完整。活动时间使用 `Asia/Shanghai` 时区。生产 `browser_required` 必须为 `true`；本机调试例外只放在被 Git 忽略的本地配置中。配置完检查权限：

```bash
sudo stat -c '%U:%G %a %n' /srv/abb2026/app/api/config.local.php
```

预期为 `root:www-data 640`。配置文件禁止通过 Nginx 下载。

## 6. 配置 Nginx 和 HTTPS

先建立 HTTP 站点，以便 Certbot 验证域名。把域名替换为实际域名：

```bash
sudoedit /etc/nginx/sites-available/abb2026
```

写入以下配置：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name h5.company.example;

    root /srv/abb2026/app;
    index index.php index.html;

    access_log /var/log/nginx/abb2026.access.log;
    error_log  /var/log/nginx/abb2026.error.log warn;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # 静态 index.html 只用于 Pages 预览；生产访问必须经过 PHP 的微信门禁。
    location = /index.html {
        return 302 /index.php$is_args$args;
    }

    # 配置、源码、数据库脚本、Git 元数据和 PHP 模板不能直接下载。
    location ~* ^/(?:\.|templates/|api/(?:src/|database/|bin/|config(?:\.local)?\.php$)) {
        deny all;
    }
    location ~* \.(?:md|sql|log|ini|env|bak|dist|example)$ {
        deny all;
    }

    location ~ \.php$ {
        try_files $uri =404;
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
    }

    location ~* \.(?:woff2|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.php {
        add_header Cache-Control "no-cache";
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
    }
}
```

确认套接字存在：

```bash
ls -l /run/php/php8.5-fpm.sock
```

启用站点并检查配置：

```bash
sudo ln -s /etc/nginx/sites-available/abb2026 /etc/nginx/sites-enabled/abb2026
sudo nginx -t
sudo systemctl reload nginx
```

若已有默认站点或其他业务站点，不要直接删除其配置；先确认域名匹配和默认站点优先级，再按服务器现状调整。

确认 DNS 已生效且公网 80 端口可达，再签发证书：

```bash
sudo systemctl enable --now snapd.socket
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/local/bin/certbot
sudo certbot --nginx -d h5.company.example
sudo certbot renew --dry-run
```

按照 Certbot 提示选择 HTTP 自动跳转 HTTPS。确认自动续期定时器：

```bash
systemctl list-timers | grep -i certbot
```

Certbot 会调整 Nginx HTTPS 配置。最终配置要保留上面的拒绝访问规则和 PHP-FPM 转发，并确认 Nginx 的 443 server block 也使用同一 `root`。网页必须能通过 HTTPS 打开，且 HTTP 会跳转到 HTTPS。

说明：仓库里的 `nginx-cache.conf` 是静态缓存片段，不是完整站点配置；不能直接拿它替代本节 Nginx server block。GitHub Pages 也不读取该片段。

## 7. 配置微信公众号网页授权

登录公众号后台，在“设置与开发 / 公众号设置 / 功能设置”配置网页授权域名 `h5.company.example`。按后台要求下载并上传域名校验文件，验证它可通过 HTTPS 在站点根路径访问。授权域名通常填写主机名，不填写 `https://` 和路径；以平台页面实际校验规则为准。

确认项目配置中的 `app_url` 与正式访问域名严格一致，回调地址将由代码拼为：

```text
https://h5.company.example/api/auth/callback.php
```

该活动入口会先检查微信内置浏览器 User-Agent。微信内首次访问时，服务器创建 OAuth `state` 并跳转到微信授权；回调核验 `state` 后，服务器用 `code` 换取用户信息并建立 PHP 会话。非微信浏览器只看到“请在微信中打开”提示，不会显示活动内容。

如果公众号后台无法保存域名、网页授权提示权限不足、OAuth 报回调域名错误，先检查公众号认证/接口权限、授权域名和 `app_url`，不要通过关掉 `browser_required` 绕过线上校验。

## 8. 建管理员、配置奖品并执行上线预检

先创建独立管理员账号。密码在 SSH 终端隐藏输入，不写入命令参数或 shell 历史：

```bash
cd /srv/abb2026/app
read -r -s -p 'New admin password: ' ABB_ADMIN_PASSWORD
printf '\n'
export ABB_ADMIN_PASSWORD
php api/bin/create-admin.php eventadmin
unset ABB_ADMIN_PASSWORD
```

密码至少 12 个字符。保存到企业密码管理器。

打开后台：

```text
https://h5.company.example/api/admin/
```

以新管理员登录。活动方确认概率与库存后，再在后台录入实际抽奖权重。项目初始化 SQL 有意将 `draw_weight` 留空；不得猜测、均分或临时填入权重。未确认时服务端拒绝抽奖，这是预期保护。

运行完整预检：

```bash
cd /srv/abb2026/app
php api/bin/preflight.php
```

所有检查必须为 `[OK]`，包括 PHP 扩展、HTTPS 域名、公众号凭据、微信浏览器门禁、有效活动时间、数据库结构和所有已启用奖品的权重。修复配置后重跑，不能把 `[SKIP]` 或 `[FAIL]` 当成上线通过。

也可通过 HTTPS 检查运维状态：

```bash
curl -fsS 'https://h5.company.example/api/index.php?action=health'
```

该 JSON 地址只用于运维健康检查；答题、抽奖和页面进度由 `index.php` 的 PHP 控制器及 PHP 模板完成。

## 9. 上线验收

按顺序使用真实手机和活动方批准的测试账号验收：

1. 在 Safari/Chrome 等非微信浏览器打开正式 URL，只显示“请在微信中打开”，源码页面不包含用户进度。
2. 在微信内打开正式 URL，首次进入公众号 OAuth；授权成功后到达活动首页，刷新后仍保持登录。
3. 完成六个答题站点，检查答对、答错、开放题重试和刷新后的进度恢复。
4. 用不满足条件的账号尝试抽奖，应提示先完成六站；未设置抽奖权重时也必须拒绝抽奖。
5. 活动方批准权重后，用专门测试环境或明确批准的测试奖品验证抽奖、一次性兑奖码、库存扣减和重复抽奖恢复。不要在真实奖池上用普通测试账号消耗奖品。
6. 登录管理后台，验证参与统计、奖品配置、兑奖码核销、重复核销保护、开放题 CSV 导出及操作审计。
7. 查看页面响应、PHP-FPM/Nginx 日志及数据库状态；确认日志没有输出 AppSecret、数据库密码、完整 OAuth token 或不必要的 OpenID。

授权域名和真实公众号凭据未配置前，本地测试无法证明真实微信 OAuth 全链路已经通过。不要以 GitHub Pages 页面代替此项验收。

## 10. 备份、更新与回滚

### 数据备份

生产开始收集用户信息之前，先启用数据库定期备份。备份必须存放在 Web 根目录之外并加密传到另一台受控存储；设置保留周期和恢复责任人。每日检查备份任务结果，并定期做恢复演练。不要把生产 OpenID、开放题答案或数据库 dump 放入源码仓库。

数据库备份示例使用 MariaDB 本机管理员的 Unix Socket 权限，通常不会询问数据库密码。它会生成一份位于 Web 根目录之外的本地压缩备份；这只是备份任务的输出样例，必须接入企业的加密异地存储和定时任务后才能满足生产备份要求。

```bash
sudo install -d -o root -g root -m 700 /var/backups/abb2026
sudo tee /usr/local/sbin/abb2026-db-backup.sh >/dev/null <<'SCRIPT'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
backup_dir=/var/backups/abb2026
stamp=$(date -u +%Y-%m-%dT%H%M%SZ)
temp_file=$(mktemp "$backup_dir/.abb2026-XXXXXX.sql.gz")
trap 'rm -f "$temp_file"' EXIT
mariadb-dump --single-transaction --routines --triggers abb2026 | gzip -c > "$temp_file"
gzip -t "$temp_file"
mv "$temp_file" "$backup_dir/abb2026-$stamp.sql.gz"
SCRIPT
sudo chmod 750 /usr/local/sbin/abb2026-db-backup.sh
sudo /usr/local/sbin/abb2026-db-backup.sh
```

每日自动运行可使用 systemd timer：

```bash
sudo tee /etc/systemd/system/abb2026-backup.service >/dev/null <<'UNIT'
[Unit]
Description=ABB 2026 MariaDB backup

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/abb2026-db-backup.sh
UNIT

sudo tee /etc/systemd/system/abb2026-backup.timer >/dev/null <<'UNIT'
[Unit]
Description=Daily ABB 2026 database backup

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=15m

[Install]
WantedBy=timers.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now abb2026-backup.timer
systemctl list-timers abb2026-backup.timer
```

本地定时备份还需接入企业的加密异地存储工具，并验证任务退出码、文件大小和恢复演练；仅在本机留备份不能防止磁盘或实例故障。备份文件包含个人数据，必须限制访问。

### 发布更新

先确认 GitHub `main` 已包含已审查的版本。活动期间更新前先备份数据库，并安排运营窗口：

```bash
cd /srv/abb2026/app
sudo -u abbdeploy git switch main
sudo -u abbdeploy git fetch origin main
sudo -u abbdeploy git pull --ff-only origin main
sudo chgrp -R www-data /srv/abb2026/app
sudo find /srv/abb2026/app -type d -exec chmod 750 {} +
sudo find /srv/abb2026/app -type f -exec chmod 640 {} +
sudo chown root:www-data /srv/abb2026/app/api/config.local.php
sudo chmod 640 /srv/abb2026/app/api/config.local.php
php -l /srv/abb2026/app/index.php
php /srv/abb2026/app/api/bin/preflight.php
sudo nginx -t
sudo systemctl reload php8.5-fpm nginx
```

发布后立即检查 HTTPS 首页、微信授权、日志及数据库连接。静态资源文件更新时，项目代码需同步更新版本参数或内容哈希，避免客户端继续使用旧缓存。

### 回滚

如果部署后出现故障，先停止活动推广和抽奖操作，保留日志与数据库状态，通知活动负责人。回滚 PHP/静态代码到上一个已审查的提交：

```bash
cd /srv/abb2026/app
sudo -u abbdeploy git log -5 --oneline
sudo -u abbdeploy git checkout --detach <上一个已验证的提交哈希>
sudo chgrp -R www-data /srv/abb2026/app
sudo find /srv/abb2026/app -type d -exec chmod 750 {} +
sudo find /srv/abb2026/app -type f -exec chmod 640 {} +
sudo chown root:www-data /srv/abb2026/app/api/config.local.php
sudo chmod 640 /srv/abb2026/app/api/config.local.php
php /srv/abb2026/app/api/bin/preflight.php
sudo nginx -t && sudo systemctl reload php8.5-fpm nginx
```

若本次发布包含数据库迁移，不要盲目恢复旧代码或覆盖数据库；先根据迁移的向前/向后兼容性和备份恢复方案评估。当前项目升级应只运行仓库明确提供的迁移脚本。

## 11. 故障排查

| 现象 | 优先检查 |
| --- | --- |
| 502 Bad Gateway | `systemctl status php8.5-fpm`、Nginx 中的 FPM socket 名称、`/var/log/nginx/abb2026.error.log` |
| 首页显示服务错误 | `api/config.local.php` 语法、文件权限、PHP-FPM 错误日志、数据库连接 |
| 微信授权提示域名错误 | 公众号网页授权域名、HTTPS 证书、`app_url` 主机名、OAuth 回调 URL |
| 非微信浏览器显示活动页面 | `wechat.browser_required` 是否为 `true`，当前请求是否经过代理且保留真实 User-Agent |
| 预检提示奖品权重未配置 | 等待活动方书面确认权重，然后在管理后台填写；不要在代码或 SQL 中编造 |
| 管理员打不开后台 | `/api/admin/` 路径、PHP-FPM、数据库管理员表、Nginx 对 `/api/admin/` 的 PHP 处理 |
| HTTPS 证书续期失败 | DNS、80/443 安全组、Nginx 站点配置、`certbot renew --dry-run` 输出 |

常用只读排查命令：

```bash
sudo systemctl status nginx php8.5-fpm mariadb --no-pager
sudo tail -n 100 /var/log/nginx/abb2026.error.log
sudo journalctl -u php8.5-fpm -n 100 --no-pager
sudo nginx -t
php /srv/abb2026/app/api/bin/preflight.php
```

## 参考文档

- [PHP 官方支持版本表](https://www.php.net/supported-versions.php)
- [Ubuntu 官方发行版支持周期](https://ubuntu.com/project/docs/release-team/list-of-releases/)
- [Certbot 官方 Nginx 操作指南](https://certbot.eff.org/instructions?ws=nginx)
- [微信公众号网页授权官方文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)
- [GitHub 官方 SSH 主机指纹](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints)
