# FTP 部署目录（V5.9.9）

V5.9.9 更新整个部署包后，已有数据库先备份并在 phpMyAdmin 导入 `api/database/migrations/2026_10_05_activity_rules.sql`，再由 operator 后台设置开始日期。无需改服务器私密配置中的日期或权重，旧 activity 日期字段已不生效；有库存时按当日实际件数加权，中奖当天/两小时内核销、超时不回补。旧奖品及旧测试中奖通过后台专用确认按钮清理，不能删新七奖品记录。详见 `PRIZE_RULES_2026.md`。下方 V5.9.8/V5.9.7 说明是历史版本记录。

V5.9.8：上传新的 Application 服务/模板、app.js、runtime-config.js、styles.css、index.php 和 assets/scene6/option-*-psd-v598.webp。已有库须备份后在 operator 后台点击“同步今年七奖品方案”，保留历史库存/中奖；不要重导 schema.sql。配置新增私密 activity.draw_starts_on，日期和权重须确认后才能新增抽奖，详见 `PRIZE_RULES_2026.md`。

V5.9.7 新增用户端二维码与倒计时，`assets/js/` 的三个文件必须一起上传。无需新增 SQL；后台微信扫一扫尚待接入，详见 `CLAIM_QR.md`。下方“本轮验证”保留 V5.9.6 整理目录时的历史记录。

按用户要求，工作区根目录的 `abb20260919game/` 现在仅用于服务器上传，不再是 Git 源码仓库。Git 源码仓库移到 `source-repository/abb20260919game/`，远端仍为 `Easyobj/abb2026`，Pages 路径仍为 `/abb2026/`。`html/` 保留开发代码、文档、静态预览和构建工具；这些不需要整体上传。

## 上传清单

上传 `abb20260919game/` 内的内容到今年活动的网站目录，保持结构并开启 FTP 隐藏文件显示：

```text
Application/       控制器、视图、配置加载代码、业务服务
ThinkPHP/          完整框架代码及 LICENSE.txt，不手工裁剪框架
assets/            页面资源
api/               兼容入口、健康检查、初始化 SQL、迁移与必要 CLI 工具
index.php
app.js
runtime-config.js
styles.css
service-worker.js
favicon.svg
.htaccess
nginx-cache.conf
nginx-security-http.conf
nginx-security-php.conf
```

SQL 和 CLI 工具仍需要数据库管理员/服务器管理员执行；通过 FTP 上传不会自动初始化数据库。Apache 的 `.htaccess` 必须确认生效；Nginx 配置片段需管理员在实际配置中引用，单独上传不会生效。必须禁止 HTTP 访问 Application、ThinkPHP、api/bin、api/database、api/config*、隐藏文件和配置备份。正式首页为 `index.php`，部署包不含 Pages 用的 `index.html`。

## 配置与运行目录

部署包排除第六题已不用的四张旧 PSD 裁图 option-a.png 至 option-d.png。题目使用 option-*-psd-v598.webp，旧 option-*-v595.jpg 仅保留为历史资源，不再引用。框架许可文件保留。

- 生产数据库名仍为 `abb20260919game`。不改数据库账号或密码，不连接/修改正式数据库。
- 本地开发配置不进入上传目录。服务器已经设置好的 `api/config.local.php` 请保留，不要用本地测试配置覆盖。`ABB_CONFIG_FILE` 存在时优先使用其指定的外部私密配置。
- 私密生产配置仍在工作区 `private/abb20260919game.production.php`，不进入 Git、Pages 或本次公共代码部署包。FTP-only 配置方式需要事先确认对 api/config* 的网页访问保护，不能把私密目录整体上传。
- 新服务器需要创建 `Application/Runtime/5.9.9/`，仅让 PHP 用户对 Runtime 有写权限。已有服务器的 Runtime、日志和配置不是待清除的杂项，不应在上传时删除。日志诊断仍按 `SERVER_DEPLOYMENT.md`。
- 不上传去年数据或本地测试数据库；已有非空今年库不重复导入 schema.sql。

## 重建上传目录

在确认源码修改已完成后，从 `html/` 生成（先预演）：

```bash
php html/api/bin/build-server-release.php /Users/asimov/Downloads/abb/abb20260919game
php html/api/bin/build-server-release.php /Users/asimov/Downloads/abb/abb20260919game --execute
```

工具使用 PHP 发布白名单；排除 Git、文档、本地配置、构建/本地启动工具、静态预览、旧缓存和临时文件，保留上传目录内已有配置和 Runtime。新目录须先由用户/发布流程创建；工具拒绝对 Git 仓库或含符号链接的目录执行清理。先查看 COPY/REMOVE 变更预览核对范围，有手工修改时先备份。

本轮移出的原目录完整保留在 `source-repository/abb20260919game/`，原始内容另存于私密备份目录，非部署文件可恢复。后续文档和开发工作都在 html/ 或源码仓库完成，不能再把它们直接同步回 FTP 上传目录。

## 本轮验证（2026-10-04）

- 生成 256 个部署文件，184 个 PHP 文件语法检查通过；JS 主脚本、运行配置、Service Worker 语法检查通过。
- 精简目录作为 PHP 网站实际运行，375/390px 下首页、七站页面、抽奖页、后台共 20 项移动检查通过，没有缺图、横向溢出或 JS 错误。
- 261 项业务回归通过，业务测试写入仅发生于一次性测试数据库，不连接正式数据库。
- 构建工具验证了预演不写文件、白名单、已有私密配置/Runtime 保留、Git/工作区根目录拒绝；正式上传目录与源码、Pages 均不含去年的真实密码或公众号密钥。
- 临时运行缓存已移出，上传目录只预留空 `Application/Runtime/5.9.6/`。原目录备份位于工作区 `private/backups/ftp-cleanup-20261004/original-source/`，不要上传该备份。
- 本轮没有修改服务器配置，没有修复或确认用户正式服务器的“服务暂时不可用”原因，也没有修改日志存储方式；正式故障仍需服务器日志/预检定位。
