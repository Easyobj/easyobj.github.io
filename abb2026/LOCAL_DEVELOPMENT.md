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
ABB_ADMIN_PASSWORD='新的至少12位密码' php api/bin/create-admin.php localadmin
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
