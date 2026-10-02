# ABB 2026 PHP API

本目录是 2026 活动的服务端基础，目标环境为 PHP 7.4+、MySQL 5.7+/8.0、HTTPS 和微信公众号网页授权。

## 已实现

- 微信 OAuth state 校验、HTTPS 回调和服务端会话
- 六站答案的服务端校验与进度保存
- 开放题原始回答留存，供活动结束后导出
- 用户完成六站后才获得一次抽奖资格
- MySQL 事务、行锁、每日库存和总库存双重扣减
- 防重复抽奖、不可预测的兑奖码和 CSRF 校验
- 奖品库存使用 `resources/2026题目.docx` 中的表格值
- 同域前端会恢复服务端进度，并以服务端结果驱动通关、抽奖和兑奖状态
- 管理后台支持库存/权重配置、兑奖核销、开放题 CSV 导出和操作审计

## 部署

1. 建立独立数据库并执行 `database/schema.sql`。
2. 将 `config.local.php.example` 复制为 `config.local.php`，仅在服务器填写真实配置。
3. 微信公众平台网页授权域名必须与 `app_url` 一致，且生产环境必须使用 HTTPS。
4. 活动方确认抽奖分配后，为四个奖品填写正整数 `draw_weight`；未配置时接口会拒绝抽奖，不会猜测线上概率。
5. Web 根目录指向项目目录，前端与 `api/` 使用同一域名，可避免第三方 Cookie 问题。

## 管理后台

- 新安装：执行完整的 `database/schema.sql`。
- 已安装 V5.4/V5.5：执行 `database/migrations/2026_10_02_admin.sql`。
- 创建或重置管理员：`ABB_ADMIN_PASSWORD='至少12位强密码' php api/bin/create-admin.php <用户名>`。
- 登录地址：`/api/admin/`。连续 5 次登录失败会锁定 15 分钟。
- 后台填写的是活动方最终确认的抽奖权重；代码不会根据库存自行推断概率。
- 正式切流前运行 `php api/bin/preflight.php`；全部项目显示 `[OK]` 后再开放入口。

真实数据库密码、公众号 AppSecret、历史用户数据和运行日志禁止提交到 Git。
