# ABB 2026 正式服务器部署指南

## 今年数据库增量升级（ops-db-upgrade-20261005）

用户另行授权备份、升级今年独立库、同步七奖品并创建运营管理员。本阶段仅操作 `abb20260919game` 数据库；未修改去年库、数据库实例全局设置、Nginx/HTTPS 或指定目录外的服务器文件。

- 升级前完整导出表结构、数据、触发器、存储过程和事件。备份保存到本地私密目录，不把 SQL 备份放在网站可下载目录；临时连接凭据文件在限定目录内用 root-only 权限创建，导出后清除。
- 导入 `api/database/migrations/2026_10_05_activity_rules.sql`，不重导 `schema.sql`。活动开始日期留空，仍由运营管理员按实际日期设定。
- 用现有奖品同步工具先预演回滚再应用，启用今年七奖品（总量 1496、每日配额 374）。过时奖品停用但保留；不删除或重置用户、答案、中奖、核销或每日已用库存。再次预演确认无变化。
- 新建一个独立的 operator 账号，使用随机强密码并保存于本地私密文件，不复用服务器密码、不把密码写入命令参数、Git 或 Pages。只读验证数据库密码哈希、角色、启用状态和创建审计；不通过 HTTP 提交后台密码。
- 升级后表结构、运营权限和七奖品方案检查通过，用户/答案/中奖/每日库存前后校对一致；52 项隔离奖品与领取时限回归通过。未擅自设置活动日期；PHP 预检的 activity/draw_window 项因此仍失败。
- 预检的 HTTPS 项只检查 `app_url` 格式，不证明证书和 TLS 可用。仍须完成真实 HTTPS、Nginx 二级目录敏感路径保护、活动日期及真实微信授权验收后上线。相关目录外配置需另行授权。

## 二级目录 FTP 恢复说明（ops-directory-recovery-20261004）

目录恢复阶段仅获准修复服务器 `/data/www/abb20260919game/` 内的 Runtime 与私密配置。目录内缓存与配置恢复已进行，页面加载验证不能代替数据库升级、真实微信授权、HTTPS 和 Nginx 敏感路径保护验收；后续单独授权的数据库升级见上方。没有执行本指南下方的系统级安装、Nginx/FPM 配置修改或重导数据库初始化示例。

- 首次 FTP 上传后要创建 `Application/Runtime/5.9.9/`，不能让 PHP 尝试在 root 所有且不可写的 `Application/` 下自动创建。只给实际 PHP 用户版本缓存目录的写权限，不给整个项目设置 777。
- 服务器私密配置为 `api/config.local.php`，不在公共上传包中。更新代码时保留；复用已授权的正式账号、公众号凭据，但数据库名称必须为今年独立库。
- 生产配置使用完整的 HTTPS origin/path（包含 `/abb20260919game`），保持 `production`、空 `dev_openid` 和微信环境限制。HTTPS 未可用时，不降低 Cookie 安全设置来让 HTTP 登录通过。
- 本次限定范围使用 `Application/Runtime/sessions/` 保存 Session，`Application/Runtime/Logs/php-errors.php` 保存应用 PHP 错误日志；由服务器私密配置设置当前应用的 `session.save_path` 与 `error_log`，不修改全局 PHP 设置。日志文件首行是 PHP 404/exit guard，禁止删除或改成可公开下载的纯文本备份。
- Runtime 根目录 `root:www 0750`，版本缓存 `www:www 0750`，Session/Logs `www:www 0700`，私密配置 `root:www 0640`，应用日志 `www:www 0600`。这些用户名仅针对本次核实的 PHP 用户，其他服务器应按实际用户替换。
- 配置本身必须拒绝直接 HTTP 执行，仍需 Nginx 对整个子目录的框架、配置、SQL、CLI 和日志路径实施拒绝访问。下方第 5 节是域名根目录示例，不能原样当作二级目录规则。Nginx/HTTPS 配置若在用户允许目录之外，须另行授权，由服务器管理员调整。
- 数据库升级先备份，再导入增量迁移、同步今年七奖品、设置活动日期并初始化实际后台角色账号；页面返回 200 不代表这些事项已完成。本次数据库检查使用只读事务，不导入 SQL、不清理中奖记录、不创建账号。

V5.9.6 FTP 上传补充：只上传工作区根目录 `abb20260919game/` 的部署白名单内容；源码仓库现位于 `source-repository/abb20260919game/`。保留服务器现有配置与 Runtime，详见 `FTP_UPLOAD.md`。本文的 Git clone 仍是另一种部署方式，不应将含 Git/文档的克隆目录当作 FTP 上传包。

版本：ThinkPHP 3.2.3 / V5.9.9。已有库先备份，再导入 api/database/migrations/2026_10_05_activity_rules.sql，在运营后台设置日期。中奖当天/两小时内核销、按日余量加权、超时库存锁定的规则见 `PRIZE_RULES_2026.md`，不重导初始化 SQL。二维码见 `CLAIM_QR.md`，安全计划见 `SECURITY_REMEDIATION_PLAN.md`。本次服务器操作边界见上方二级目录恢复说明；下方通用部署示例并未执行。

已确定：沿用去年的服务器、数据库账号和公众号，为今年新建独立 `abb20260919game` 数据库。不要替换旧站点、升级旧服务器整个系统、导入去年用户数据或清空已有库。Pages 是静态验收页，不能运行 PHP 或微信授权。

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

示例新目录：`/srv/abb20260919game/app`。若沿用现有部署账号，将 `abbdeploy` 替换为实际账号；只在账号不存在时创建。GitHub 只读部署密钥可以复用已有授权方式，但不能提交私钥。

```bash
sudo install -d -o abbdeploy -g www-data -m 2750 /srv/abb20260919game
sudo -u abbdeploy git clone --branch main --single-branch \
  git@github.com:Easyobj/abb2026.git /srv/abb20260919game/app
sudo chgrp -R www-data /srv/abb20260919game/app
sudo find /srv/abb20260919game/app -type d -exec chmod 750 {} +
sudo find /srv/abb20260919game/app -type f -exec chmod 640 {} +
sudo install -d -o www-data -g www-data -m 750 \
  /srv/abb20260919game/app/Application/Runtime \
  /srv/abb20260919game/app/Application/Runtime/5.9.9
sudo install -d -o www-data -g www-data -m 700 /var/lib/php/abb20260919game-sessions
```

源码归部署账号所有，仅 Runtime 和独立 Session 目录让 PHP 用户写入。不要拷贝去年的 Runtime、用户缓存或日志。

## 3. 复用私密配置，新建今年数据库

配置保存在 Web 根之外。下面旧配置路径是示例，先核实；不要打印内容：

```bash
sudo install -d -o root -g www-data -m 750 /etc/abb20260919game
cd /srv/abb20260919game/app
sudo php api/bin/import-legacy-config.php \
  --source=/实际旧项目/Application/Common/Conf/config.php \
  --output=/etc/abb20260919game/settings.php \
  --app-url=https://h5.company.example
sudo chown root:www-data /etc/abb20260919game/settings.php
sudo chmod 640 /etc/abb20260919game/settings.php
```

导入保持旧 DB_HOST、端口、账号、密码与公众号凭据，只把库名改成 `abb20260919game`；不会覆盖已有配置。未提供真实域名时不要填示例域名作为正式配置。原配置的 `localhost` 是原服务器本机，不是开发者电脑。

先预演（不连接数据库），再在确认的原服务器执行：

```bash
sudo php api/bin/provision-database.php --config=/etc/abb20260919game/settings.php
sudo php api/bin/provision-database.php --config=/etc/abb20260919game/settings.php --execute
```

脚本仅允许库名 `abb20260919game`，新建库并导入 `api/database/schema.sql`；若库已有任何表则拒绝初始化。不会修改去年的数据库。DDL 不是完整可回滚事务；执行失败时检查新库中的部分建表状态，不要直接删库重来。若原账号无建库权限，由服务器数据库管理员创建并授权今年库；不要为此擅自修改去年账号权限。

新库奖品来自今年资料，抽奖权重有意保持 NULL，须由活动方确认。已有今年数据库升级只执行经过审查的迁移，不重新导入初始化 SQL。

V5.8.0 已有库升级 V5.9.0 时，由数据库管理员执行以下增量迁移（仅在确认是今年库后执行）：

```bash
sudo mariadb abb20260919game < api/database/migrations/2026_10_03_security_baseline.sql
sudo mariadb abb20260919game < api/database/migrations/2026_10_03_form_challenges.sql
sudo mariadb abb20260919game < api/database/migrations/2026_10_03_operations.sql
sudo mariadb abb20260919game < api/database/migrations/2026_10_03_claim_confirmation.sql
```

以上为增量安全/运营/本人确认迁移，不修改用户/答案/库存；运营迁移为原管理员补 operator 角色但不改密码。先迁移，再切换代码并预检。旧后台会话在升级后重新登录。

后台默认按管理员 ID 每 15 分钟最多 5 次登录尝试、按直接来源 IP 每 15 分钟最多 50 次；账号成功登录仅重置账号桶。若经受信反向代理转发，在 Nginx 配置受信代理真实 IP，不能把浏览器提供的 X-Forwarded-For 直接当可信地址。代理配置和更完整业务限流见后续阶段。

在服务器现有定时任务系统中每日运行清理脚本；不建立冲突的第二套调度：

```bash
sudo -u www-data env ABB_CONFIG_FILE=/etc/abb20260919game/settings.php php api/bin/cleanup-security.php
```

每次最多删除 10000 个已过期桶；规模较大时由运维调整频率。该脚本不会清理抽奖、核销或用户记录。

## 4. 补充正式配置与独立 FPM 池

```bash
sudoedit /etc/abb20260919game/settings.php
```

填今年实际 `app_url`、`activity.starts_at`、`activity.ends_at`（格式 YYYY-MM-DD HH:MM:SS，Asia/Shanghai）；保留：

```php
'app_env' => 'production',
'dev_openid' => '',
// wechat 中：
'browser_required' => true,
// db 中：
'name' => 'abb20260919game',
```

不要重新在聊天或命令行参数中输入密码/密钥。导入时已读取原值。复用原账号保留其权限风险；独立数据库不等于最小权限账号，旧凭据的历史暴露风险也仍存在。

为实际 PHP 版本新建 FPM 池，例如 `/etc/php/8.5/fpm/pool.d/abb20260919game.conf`：

```ini
[abb20260919game]
user = www-data
group = www-data
listen = /run/php/php8.5-fpm-abb20260919game.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
pm = ondemand
pm.max_children = 10
pm.process_idle_timeout = 10s
pm.max_requests = 500
env[ABB_CONFIG_FILE] = /etc/abb20260919game/settings.php
php_admin_flag[display_errors] = off
php_admin_flag[log_errors] = on
php_admin_flag[expose_php] = off
php_admin_value[session.save_path] = /var/lib/php/abb20260919game-sessions
```

进程数按服务器容量核定。先用实际 FPM 二进制执行配置测试（如 `sudo php-fpm8.5 -t`），再 reload 对应服务；不要中断旧活动。私密配置在框架启动之前读取，不写入 ThinkPHP 编译缓存。

## 5. Nginx、HTTPS 与保护规则

为今年域名单独创建站点。下面是最终 HTTPS server 示例；证书路径、域名和 FPM socket 必须实际存在。签发证书前，按现有服务器的证书管理方式设置 80 验证站点，不删除旧配置。

在已有 Nginx `http {}` 中仅包含一次 `include /srv/abb20260919game/app/nginx-security-http.conf;`。在下面 PHP location 中包含 `nginx-security-php.conf`。默认 PHP 30 请求/秒、POST 10 请求/秒，分别允许 100/30 突发，同 IP PHP 并发上限 50；这里只是共享网络的资源保护，不能当作一人一次资格校验。根据展会出口 NAT 和服务器容量压测后调整。静态图片不受 PHP 桶限制。请求体 16 KiB、读取超时 10 秒，拒绝的超频请求返回 429；应用用户桶仍独立生效。

```nginx
server {
    listen 443 ssl;
    server_name h5.company.example;
    ssl_certificate /实际证书/fullchain.pem;
    ssl_certificate_key /实际证书/privkey.pem;
    root /srv/abb20260919game/app;
    index index.php index.html;
    access_log /var/log/nginx/abb20260919game.access.log;
    error_log /var/log/nginx/abb20260919game.error.log warn;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location = /index.html {
        return 302 /index.php$is_args$args;
    }
    location ~* ^/+(?:Application|ThinkPHP|templates)(?:/|$) {
        deny all;
    }
    location ~* ^/+api/(?:src/|database/|bin/|config[^/]*|bootstrap\.php$) {
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
        include /srv/abb20260919game/app/nginx-security-php.conf;
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.5-fpm-abb20260919game.sock;
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

如果有 CDN/反向代理，只有确认实际代理出口 CIDR、安装了 `http_realip_module`，且防火墙限制源站入口后，才配置 `set_real_ip_from 实际受信CIDR; real_ip_header X-Forwarded-For; real_ip_recursive on;`。不得使用 `0.0.0.0/0` 或 `::/0`，也不能把示例 CIDR 当成真实代理。直连源站不启用该配置。PHP 的限频只读取 `REMOTE_ADDR`，不自行相信 X-Forwarded-For/X-Real-IP。HTTPS Cookie 依据实际 HTTPS 或正式 app_url，不信任客户端伪造 X-Forwarded-Proto。以伪造头实测确认计数不变化。

Nginx 指令作用域与代理信任依据官方文档：[limit_req](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)、[realip](https://nginx.org/en/docs/http/ngx_http_realip_module.html)。请求大小上限也需要 Web 服务器执行，不能仅靠 PHP 代码在自动解析 POST 后判断；参考 [OWASP DoS 防护](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)。此配置需在真实服务器执行 nginx -t 和受控压测，Pages 不执行它。

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
cd /srv/abb20260919game/app
read -r -s -p 'New admin password: ' ABB_ADMIN_PASSWORD
printf '\n'
export ABB_ADMIN_PASSWORD
sudo --preserve-env=ABB_ADMIN_PASSWORD -u www-data \
  env ABB_CONFIG_FILE=/etc/abb20260919game/settings.php \
  php api/bin/create-admin.php eventadmin --role=operator
unset ABB_ADMIN_PASSWORD
sudo -u www-data env ABB_CONFIG_FILE=/etc/abb20260919game/settings.php \
  php api/bin/preflight.php
```

密码至少 12 位，存入企业密码管理器。后台地址 `https://实际域名/index.php?m=Admin&c=Index&a=index`。录入已确认权重后再次完整预检，所有项应 OK；不能用 `--local` 的跳过项代替上线通过。公开 `/api/index.php?action=health` 只报告 PHP 存活，不读取数据库、私密配置、Session，也不代表业务就绪。详细健康检查仅通过有服务器权限的 CLI `sudo -u www-data env ABB_CONFIG_FILE=/etc/abb20260919game/settings.php php api/bin/preflight.php` 执行；禁止将详细报告重新暴露到公网。前端业务采用 PHP 模板和表单而不是 JSON API。

V5.9.1 默认每用户答题 12 次/分钟、抽奖尝试 3 次/分钟（资格不足、配置未就绪也计数），后台敏感动作每管理员 30 次/分钟、答案导出 2 次/分钟，OAuth 启动/回调各 IP 300 次/分钟。限频发生在业务事务之前，拒绝不写答案或扣库存；数据库安全桶计数仍会增加。有效用户换 Session 不会重置额度；普通结果 GET 查询免费。已通过站点的重复有效答案保留原答案/时间/次数。私密配置 `security` 可覆盖默认值，所有计数共用第一阶段的增量安全表，无第二次业务表重建。

V5.9.2 每次活动页面签发 7 个随机凭证（六站各一、抽奖一），仅存 SHA-256 摘要，绑定用户/操作/站点，10 分钟过期，一次 UPDATE 原子消费。请求拒绝、网络错误或浏览器后退导致旧凭证不可用时，刷新后以数据库进度恢复，不重复扣库存；多标签页凭证独立。每用户每分钟最多签发 30 页，额度耗尽时保留结果查询但暂停签发。后台维护工具也清理过期凭证，请把已有安全清理任务调整至每小时（不要建立冲突的第二套任务）。OAuth state 同样十分钟过期且兑换前消费，失败后重新进入授权。

风险线索只记录六站已通过答案时间跨度少于 60 秒、同网络十分钟至少 20 个账号等启发式事件，不包含答案原文或原始 IP，不自动冻结/拒奖。IP 摘要并非不可还原的匿名数据，仍按受限运营数据处理；共享 NAT 可能触发正常线索，必须人工结合实际规则审核。V5.9.3 在运营后台提供审核标记/解除、说明和前后值审计，新线索晚于审核时重新提示；保留期限由活动方最终确认。公开源码仍包含服务端题库，正式防刷不能依赖源码保密。

V5.9.3 角色 `operator` 可以管理奖池、导出、暂停/恢复新增抽奖和风险审核；`redeemer` 只能按兑奖码查询单条记录并核销，不显示批量用户/中奖信息。旧管理员迁移后默认 operator，密码不变；角色加入会话指纹后旧 Session 需重新登录。新建/重置账号必须传 `--role=operator` 或 `--role=redeemer`；仅更换角色用 `php api/bin/set-admin-role.php 用户名 角色`，变更审计标记来源为受控服务器 CLI，不虚构网页操作员身份。CLI 可恢复误设角色，须限制 SSH 权限。

V5.9.4 已确认领奖前工作人员核验资格且必须本人领取。参与者在已授权微信中奖页面通过带 CSRF 和一次性表单凭证的 POST 生成 16 位随机本人确认码，两分钟有效，每用户每分钟最多三次。表单每页额外提供一个领取操作凭证，即当前共八个。数据库仅存本人码 SHA-256；新码替换旧码。核销人员输入兑奖码和现场本人码，查询奖品、昵称、状态和风险提示，再勾选资格/本人两项确认。工作人员 Session 凭证绑定管理员/兑奖码/风险版本/本人码摘要，有效期限不超过本人码且一次消费。并发核销在同一事务消费本人码、更新领取状态并写审计；任何失败全部回滚。过期、码更新、审核变化需刷新本人页面或重新查询。已核销状态可直接查询但不显示发奖按钮。资格未核实或非本人领取可记录固定结论，不能借此取消中奖/回收库存。现场人员须实际核对，短期码不是实名证明，无法单靠微信防多账号或实时转发。详细流程见 `ONSITE_REDEMPTION.md`。

“暂停新增抽奖”与抽奖事务使用同一控制行锁，提交暂停后不再创建新中奖记录；既有结果 GET 查询、核销继续。若用户页面未刷新，服务器仍会拒绝新抽奖，并显示暂停提示。库存超过总库存/每日已用超过配额、默认每分钟至少 100 次发奖和待复核风险用户，会在运营页提示；阈值只告警、不自动制裁，共享网络场景需现场核对。当前没有配置短信/邮件告警通道，不假装已外发通知。

每个 ABB2026 PDO 连接设置活动时区对应的 MySQL Session time_zone，默认 +08:00，确保 NOW()/每日配额与 PHP 日期一致；不修改共享数据库服务器 GLOBAL 设置，也不重写历史记录。切流前核对原记录的时间基准，发现不一致须先备份、由活动方批准修正，不能猜测迁移偏移量。

Pages 发布使用静态白名单，不同步任何 PHP、Application、ThinkPHP、api、SQL、私密配置或 Runtime。在确认 Pages 工作树干净后运行 `php api/bin/build-static-preview.php`，再执行 `php api/bin/build-pages.php /实际路径/easyobj-github-io/abb2026` 查看差异，确认后加 `--execute`。该工具仅接受约定的 Pages 目录，保留 AGENTS.md；旧已发布服务端文件从当前分支移除，Git 历史仍可恢复。完整 PHP 代码继续进入源码仓库和正式服务器。

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
sudo install -d -o root -g root -m 700 /var/backups/abb20260919game
sudo sh -c 'umask 077; mariadb-dump --single-transaction abb20260919game > /var/backups/abb20260919game/pre-release.sql'
```

示例固定文件名会覆盖旧备份；仅用于首次备份，后续按现有备份系统生成唯一文件名并验证恢复，不重复覆盖。

更新代码：

```bash
cd /srv/abb20260919game/app
sudo -u abbdeploy git fetch origin main
sudo -u abbdeploy git pull --ff-only origin main
php -l index.php
sudo -u www-data env ABB_CONFIG_FILE=/etc/abb20260919game/settings.php php api/bin/preflight.php
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
