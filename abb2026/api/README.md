# ABB 2026 PHP 后端

正式活动采用去年的 ThinkPHP 3.2.3 内核。入口 `index.php` 调度 `Application/Other` 与 `Application/Admin`，使用 PHP 模板和普通表单 POST；业务类位于 `Application/Common/Service`。本目录保留 CLI 运维脚本、SQL、本地配置和旧路径兼容入口，前端不使用 JSON 业务 API。

## 已实现

- 微信 OAuth state 校验、HTTPS 回调和服务端会话
- 正式入口强制微信内置浏览器，未授权用户打开后立即进入公众号 OAuth
- 六站答案的服务端校验与进度保存
- 开放题原始回答留存，供活动结束后导出
- 用户完成六站后才获得一次抽奖资格
- MySQL 事务、行锁、每日库存和总库存双重扣减
- 防重复抽奖、不可预测的兑奖码和 CSRF 校验
- 奖品库存使用 `resources/2026题目.docx` 中的表格值
- PHP 模板会注入服务端进度，并以普通表单 POST 驱动判题、抽奖和兑奖状态
- 管理后台支持库存/权重配置、兑奖核销、开放题 CSV 导出和操作审计

## 部署

1. 建立独立数据库并执行 `database/schema.sql`。
2. 将 `config.local.php.example` 复制为 `config.local.php`，仅在服务器填写真实配置。
3. 微信公众平台网页授权域名必须与 `app_url` 一致，且生产环境必须使用 HTTPS。
   生产必须保持 `wechat.browser_required=true`；非微信浏览器只会获得打开提示页。
4. 活动方确认抽奖分配后，为四个奖品填写正整数 `draw_weight`；未配置时接口会拒绝抽奖，不会猜测线上概率。
5. Web 根目录指向项目目录，前端与 `api/` 使用同一域名，可避免第三方 Cookie 问题。

## 管理后台

- 新安装：执行完整的 `database/schema.sql`。
- 已安装 V5.4/V5.5：执行 `database/migrations/2026_10_02_admin.sql`。
- 创建或重置管理员：`ABB_ADMIN_PASSWORD='至少12位强密码' php api/bin/create-admin.php <用户名>`。
- 登录地址：`/index.php?m=Admin&c=Index&a=index`，旧 `/api/admin/` 自动跳转。连续 5 次登录失败会锁定 15 分钟。
- 后台填写的是活动方最终确认的抽奖权重；代码不会根据库存自行推断概率。
- 正式切流前运行 `php api/bin/preflight.php`；全部项目显示 `[OK]` 后再开放入口。
- 本地开发使用 `php api/bin/preflight.php --local`；启动方式见项目根目录 `LOCAL_DEVELOPMENT.md`。

真实数据库密码、公众号 AppSecret、历史用户数据和运行日志禁止提交到 Git。
