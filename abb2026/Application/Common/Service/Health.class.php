<?php
declare(strict_types=1);

final class Health
{
    public static function report(): array
    {
        $config = abbConfig();
        $checks = [];

        $production = $config['app_env'] === 'production' && $config['dev_openid'] === '';
        $checks['production'] = [
            'ok' => $production,
            'message' => $production ? '生产模式且无开发登录身份。' : '正式部署必须使用 production 并清空 dev_openid。',
        ];
        $frameworkFile = dirname(__DIR__, 3) . '/ThinkPHP/ThinkPHP.php';
        $checks['framework'] = [
            'ok' => is_file($frameworkFile),
            'message' => is_file($frameworkFile) ? 'ThinkPHP 3.2.3 内核已安装。' : '缺少 ThinkPHP 内核。',
        ];

        $requiredExtensions = ['curl', 'json', 'mbstring', 'openssl', 'pdo', 'pdo_mysql', 'session'];
        $missingExtensions = array_values(array_filter(
            $requiredExtensions,
            static fn(string $extension): bool => !extension_loaded($extension)
        ));
        $checks['php'] = [
            'ok' => PHP_VERSION_ID >= 70400 && !$missingExtensions,
            'message' => PHP_VERSION_ID < 70400
                ? '需要 PHP 7.4 或更高版本。'
                : ($missingExtensions ? '缺少扩展：' . implode(', ', $missingExtensions) : 'PHP 运行环境正常。'),
        ];

        $httpsUrl = strpos((string) $config['app_url'], 'https://') === 0;
        $checks['https'] = [
            'ok' => $httpsUrl,
            'message' => $httpsUrl ? '正式地址使用 HTTPS。' : 'ABB_APP_URL 必须是正式 HTTPS 地址。',
        ];

        $wechatReady = $config['wechat']['app_id'] !== '' && $config['wechat']['app_secret'] !== '';
        $checks['wechat'] = [
            'ok' => $wechatReady,
            'message' => $wechatReady ? '微信公众号凭据已配置。' : '微信公众号 AppID 或 AppSecret 未配置。',
        ];
        $wechatBrowserRequired = (bool) ($config['wechat']['browser_required'] ?? true);
        $checks['wechat_browser'] = [
            'ok' => $wechatBrowserRequired,
            'message' => $wechatBrowserRequired
                ? '已启用微信内置浏览器强制门禁。'
                : '微信浏览器门禁未启用，仅允许本地开发使用。',
        ];

        try {
            $activity = Activity::status();
            $activityConfigured = !in_array($activity['code'], ['configuration_required', 'configuration_invalid'], true);
            $checks['activity'] = [
                'ok' => $activityConfigured,
                'message' => $activityConfigured
                    ? '活动时间已配置。'
                    : ($activity['code'] === 'configuration_invalid' ? '活动时间格式或先后顺序无效。' : '活动开始或结束时间未配置。'),
            ];
        } catch (Throwable $error) {
            $checks['activity'] = ['ok' => false, 'message' => '活动时间格式无效。'];
        }

        try {
            $pdo = Database::connection();
            $pdo->query('SELECT 1')->fetchColumn();
            $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
            $requiredTables = ['users', 'answers', 'prizes', 'prize_daily_stock', 'draws', 'admins', 'admin_login_attempts', 'admin_audit_logs', 'security_rate_limits'];
            $missingTables = array_values(array_diff($requiredTables, $tables));
            $checks['database'] = [
                'ok' => !$missingTables,
                'message' => $missingTables ? '缺少数据表：' . implode(', ', $missingTables) : '数据库连接和表结构正常。',
            ];

            if (!$missingTables && in_array('prizes', $tables, true)) {
                $active = (int) $pdo->query('SELECT COUNT(*) FROM prizes WHERE active = 1')->fetchColumn();
                $invalid = (int) $pdo->query('SELECT COUNT(*) FROM prizes WHERE active = 1 AND (draw_weight IS NULL OR draw_weight <= 0)')->fetchColumn();
                $checks['prizes'] = [
                    'ok' => $active > 0 && $invalid === 0,
                    'message' => $active === 0
                        ? '没有启用的奖品。'
                        : ($invalid > 0 ? '仍有启用奖品未配置抽奖权重。' : '奖品与抽奖权重已配置。'),
                ];
            } else {
                $checks['prizes'] = ['ok' => false, 'message' => '奖品表尚未就绪。'];
            }
        } catch (Throwable $error) {
            $checks['database'] = ['ok' => false, 'message' => '数据库连接失败。'];
            $checks['prizes'] = ['ok' => false, 'message' => '无法检查奖品配置。'];
        }

        $ready = true;
        foreach ($checks as $check) {
            $ready = $ready && $check['ok'];
        }
        return ['status' => $ready ? 'ready' : 'configuration_required', 'ready' => $ready, 'checks' => $checks];
    }
}
