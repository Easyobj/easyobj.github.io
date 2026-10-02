# ABB 2026 正式服务器部署清单

V5.8.0：沿用去年 ThinkPHP 3.2.3、同一服务器、同一数据库账号及微信公众号；新建独立 `abb2026` 数据库，不复用或修改去年数据库中的表和用户数据。Pages 只提供静态视觉预览。

操作命令见 [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md)，迁移说明见 [FRAMEWORK_MIGRATION.md](FRAMEWORK_MIGRATION.md)。

## 上线前确认

- 现有服务器 SSH 地址/别名、端口、用户名及旧配置文件位置。
- 今年正式 HTTPS 域名、公众号授权域名及活动起止时间。
- 活动方确认的奖品库存和抽奖权重；未确认权重保持空值。
- 备份和回滚负责人。独立库不等于独立账号权限。

## 操作顺序

1. 检查旧服务器的 PHP 及扩展；不直接升级系统或替换旧站点。
2. 部署到独立目录，创建独立 FPM 池、日志、Session 和 Runtime。
3. 用 `import-legacy-config.php` 读取原私密配置，生成 Web 根之外的配置；数据库名自动改为 `abb2026`，账号与公众号凭据保持原值。
4. 用 `provision-database.php --config=/etc/abb2026/settings.php` 无连接预演；确认在原服务器后加 `--execute`。已有非空库拒绝初始化。
5. 填写真实域名和活动时间，FPM 通过 `ABB_CONFIG_FILE` 加载配置；保持 `app_env=production`、`dev_openid=''`、`browser_required=true`。
6. 配置 HTTPS 和源码访问限制，创建后台账号，录入已确认权重。
7. 完整预检后，用真实微信验收授权、六站答题、结果恢复与核销。并发测试只用独立测试库或获批准的测试奖品。

## 安全要求

- 密钥和密码不进入 Git、Pages、截图、命令参数或聊天记录。旧凭据的历史暴露风险仍存在；本次按活动方决定沿用，后续轮换需要协调旧活动。
- 禁止访问 `Application/`、`ThinkPHP/`、数据库脚本、CLI 脚本、私密配置和 Git 元数据。
- 不上传旧 Runtime、日志或用户缓存；新 Runtime 不进入 Git。
- PHP 保留 `Cache-Control: no-store`，关闭屏幕错误与框架调试，日志不输出异常消息中的凭据。
- 微信 User-Agent 门禁不能代替 OAuth 身份校验；必须验收真实授权往返。
