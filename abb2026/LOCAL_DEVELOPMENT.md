# ABB 2026 本地开发环境

当前 Mac 已安装 PHP 8.5 和 MariaDB 13，并建立了 `abb2026_local` 开发数据库。V5.8.0 已接入去年 ThinkPHP 3.2.3 内核并验证本项目使用的路径；生产同样需要 PHP 7.4+，以受安全支持且实测兼容的版本为准。

## 当前本机地址

- PHP 模板活动页：`http://127.0.0.1:8080/index.php#home`
- 运营后台：`http://127.0.0.1:8080/index.php?m=Admin&c=Index&a=index`（旧 `/api/admin/` 会跳转）
- 管理员用户名：`localadmin`
- 管理员密码：使用本机初始化时单独提供的密码

以上账号只用于本机开发，不得用于正式环境。

需要重置本地管理员密码时运行：

```bash
ABB_ADMIN_PASSWORD='新的至少12位密码' php api/bin/create-admin.php localadmin --role=operator
```

## 启动

```bash
cd /Users/asimov/Downloads/abb/html
./api/bin/start-local.sh
```

终端出现地址后保持窗口运行；按 `Ctrl+C` 停止 PHP。本地 MariaDB 由 Homebrew 服务管理。

## 本地配置

`api/config.local.php` 包含本机数据库信息和开发用户，已被 `api/.gitignore` 排除，不会提交到 Git。Pages 发布时也必须继续排除该文件。

本地模式通过固定的开发 OpenID 自动登录，不调用真实微信授权。`index.php` 使用 ThinkPHP 控制器及 `Application/Other/View/Index/` 下的 PHP 模板；`index.html` 仅用于 GitHub Pages 静态预览。启动脚本的 router 会禁止下载内核、Application、配置及运行缓存；本机访问 `/index.html` 会转到 PHP 入口。

正式凭据另存到 Web 根目录之外的 `private/abb2026.production.php`。本地开发仍读 `api/config.local.php`；生产使用 `ABB_CONFIG_FILE` 指向服务器私有文件，目标数据库固定为 `abb2026`。设置实际域名和活动时间后才能执行生产预检。

本机 `api/config.local.php` 将 `wechat.browser_required` 设为 `false`，仅为桌面浏览器调试绕过微信环境检查。该文件不会提交；生产默认强制微信内置浏览器和公众号 OAuth。

## 检查

V5.9.0 本机已执行增量安全表迁移，未清空 `abb2026_local`。后台默认 15 分钟空闲、8 小时绝对过期；五次账号登录尝试或 50 次同 IP 登录尝试/15 分钟会暂时限速。成功登录重置账号桶，不清除 IP 桶。旧后台 Session 需重新登录。

其他已有测试库升级时先执行 `api/database/migrations/2026_10_03_security_baseline.sql`；不要重新导入完整初始化 SQL。正式配置可通过 `security` 数组调整限速和过期参数，默认值见 `Application/Common/Conf/settings.php`。

V5.9.1 使用同一安全表，不重建本地数据库。正常六站可连续完成；每用户 12 次答题/分钟、3 次抽奖尝试/分钟，达到上限后等窗口恢复。不要在生产库手动删除限速记录以“修复”冷却。公开 health 仅存活，详细就绪检查使用 CLI preflight。PHP 内置服务器不能代替 Nginx 请求体/连接数保护，生产按 SERVER_DEPLOYMENT.md 配置。

V5.9.2 本机仅增量增加 `form_challenges`、`risk_events`，保留业务进度和库存。凭证 10 分钟过期或提交后失效，刷新即可重新领取；不同标签页互不覆盖。每用户每分钟最多签发 30 页凭证，冷却时仍可查询保存结果。Pages 不再进行本机判题，实际六站流程在 PHP 本地环境验收。

V5.9.3 本机已执行运营增量迁移，原 localadmin 保持 operator、密码不变，旧后台会话需重新登录。核销先查询后确认，有效期两分钟，一次使用；重新查询会替换同会话之前的核销确认。若审核状态变化，必须重新查询。仅核销账号不展示批量用户/中奖记录或运营配置。创建测试核销账号时显式使用 `--role=redeemer`；更换已有角色使用 `php api/bin/set-admin-role.php <用户名> operator|redeemer`，此命令不改密码并撤销旧后台会话。操作仅在你确实需要管理本地测试账号时执行。

每个数据库连接显式使用活动时区（默认 Asia/Shanghai 对应 +08:00），不改数据库 GLOBAL 时区。既有记录不重写；若旧测试数据用不同时间基准，需先备份并人工核对，不能批量猜测平移。

```bash
php api/bin/preflight.php --local
node --check app.js
node --check runtime-config.js
```

`--local` 跳过生产模式、HTTPS、微信凭据和微信门禁检查；数据库、内核、活动时间与奖品权重仍会真实验证。正式发布必须去掉 `--local`。

## 重新建库

如需清空本地业务数据，可先备份，再明确删除并重建 `abb2026_local`，随后执行：

```bash
mariadb abb2026_local < api/database/schema.sql
```

数据库脚本默认不设置抽奖权重；本地测试需在后台填写，正式环境必须使用活动方确认值。
