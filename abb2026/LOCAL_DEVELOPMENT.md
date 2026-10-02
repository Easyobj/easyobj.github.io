# ABB 2026 本地开发环境

当前 Mac 已安装 PHP 8.5 和 MariaDB 13，并建立了 `abb2026_local` 开发数据库。正式最低版本仍为 PHP 7.4、MySQL 5.7。

## 当前本机地址

- PHP 模板活动页：`http://127.0.0.1:8080/index.php#home`
- 运营后台：`http://127.0.0.1:8080/api/admin/`
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

本地模式通过固定的开发 OpenID 自动登录，不调用真实微信授权。`index.php` 使用 PHP 控制器和模板渲染；`index.html` 仅用于 GitHub Pages 静态预览。

本机 `api/config.local.php` 将 `wechat.browser_required` 设为 `false`，仅为桌面浏览器调试绕过微信环境检查。该文件不会提交；生产默认强制微信内置浏览器和公众号 OAuth。

## 检查

```bash
php api/bin/preflight.php --local
node --check app.js
node --check runtime-config.js
```

`--local` 只跳过正式环境专属的 HTTPS 和微信公众号凭据检查，数据库、表结构、活动时间与奖品权重仍会真实验证。正式发布必须去掉 `--local`。

## 重新建库

如需清空本地业务数据，可先备份，再明确删除并重建 `abb2026_local`，随后执行：

```bash
mariadb abb2026_local < api/database/schema.sql
```

数据库脚本默认不设置抽奖权重；本地测试需在后台填写，正式环境必须使用活动方确认值。
