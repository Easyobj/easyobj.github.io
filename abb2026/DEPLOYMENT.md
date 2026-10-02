# ABB 2026 正式服务器部署清单

GitHub Pages 仅用于视觉验收。微信授权、答题记录、抽奖库存和现场核销必须部署到正式 PHP/MySQL 服务器。

## 运行环境

- PHP 7.4 或更高版本，启用 `pdo_mysql`、`curl`、`mbstring`、`openssl`、`json` 和 `session`
- MySQL 5.7+ 或 MySQL 8.0，数据表使用 InnoDB 与 `utf8mb4`
- 全站 HTTPS；`index.php` 与静态资源使用同一域名和目录
- Web 服务器将 `index.php` 设为默认入口（Apache 的 `DirectoryIndex index.php index.html` 或 Nginx 等价配置）
- Web 根目录支持 `.htaccess`，或在 Nginx 中等价禁止访问 `api/src/`、`api/database/`、`api/bin/` 和配置文件

## 上线前必须由活动方确认

- 正式 HTTPS 域名及服务器登录/发布方式
- 微信公众号 AppID、AppSecret 和网页授权域名
- 活动开始、结束时间与时区
- 四个奖品最终总库存、每日库存和抽奖权重
- 第一位后台管理员用户名；密码只在服务器环境变量中输入
- 今年是否沿用去年域名。若不用，必须在微信公众平台同步修改授权域名

## 部署步骤

1. 备份旧数据库；新建独立的 `abb2026` 数据库和最小权限数据库账号。
2. 执行 `api/database/schema.sql`。从早期 2026 测试版升级时，执行 `api/database/migrations/2026_10_02_admin.sql`。
3. 复制 `api/config.local.php.example` 为服务器专用的 `api/config.local.php`，填入真实配置并限制文件权限。
   正式环境必须保持 `wechat.browser_required` 为 `true`（或环境变量 `ABB_WECHAT_BROWSER_REQUIRED=true`）。
4. 使用 `ABB_ADMIN_PASSWORD='强密码' php api/bin/create-admin.php <用户名>` 创建后台账号；不要把密码写入命令历史或 Git。
5. 在后台填写活动方确认的抽奖权重。任一启用奖品缺少权重时，服务端会拒绝抽奖。
6. 执行 `php api/bin/build-static-preview.php` 刷新 Pages 验收版，再将完整 `html/` 部署到正式目录。
7. 执行 `php api/bin/preflight.php`，并访问 `/api/index.php?action=health` 验证所有检查均为 `ready`。该 JSON 端点仅供运维监控。
8. 先用非微信浏览器访问 `/index.php`，确认只显示微信打开提示；再在微信内确认首次访问立即进入 OAuth，并走通六站普通表单提交、一次抽奖、刷新后结果恢复、兑奖核销和开放题 CSV 导出。
9. 使用两个并发请求验证同一用户只生成一个兑奖码，并核对总库存和当日库存各减少一次。

## 安全要求

- 去年项目中出现过的数据库密码和公众号密钥应视为已泄露，正式上线前必须轮换。
- 不上传去年 `Application/Runtime`、访问日志、用户 OpenID、昵称或头像缓存。
- 数据库、PHP 错误日志和导出的开放题答案只能由授权人员访问。
- 正式发布后关闭 PHP 屏幕错误输出，仅保留受控服务端日志。
