<?php
declare(strict_types=1);

/**
 * ABB 2026 PHP application configuration.
 *
 * Production secrets must be provided through environment variables or an
 * ignored config.local.php file. Never commit real credentials.
 */
$csv = static function (string $value): array {
    return array_values(array_filter(array_map('trim', explode(',', $value))));
};
$boolean = static function ($value, bool $default): bool {
    if ($value === false || $value === '') {
        return $default;
    }
    $parsed = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    return $parsed === null ? $default : $parsed;
};

$config = [
    'app_env' => getenv('ABB_APP_ENV') ?: 'production',
    'app_url' => rtrim(getenv('ABB_APP_URL') ?: '', '/'),
    'timezone' => getenv('ABB_TIMEZONE') ?: 'Asia/Shanghai',
    'db' => [
        'host' => getenv('ABB_DB_HOST') ?: '127.0.0.1',
        'port' => (int) (getenv('ABB_DB_PORT') ?: 3306),
        'name' => getenv('ABB_DB_NAME') ?: 'abb2026',
        'user' => getenv('ABB_DB_USER') ?: '',
        'password' => getenv('ABB_DB_PASSWORD') ?: '',
    ],
    'wechat' => [
        'app_id' => getenv('ABB_WECHAT_APP_ID') ?: '',
        'app_secret' => getenv('ABB_WECHAT_APP_SECRET') ?: '',
        'scope' => getenv('ABB_WECHAT_SCOPE') ?: 'snsapi_userinfo',
        'browser_required' => $boolean(getenv('ABB_WECHAT_BROWSER_REQUIRED'), true),
    ],
    'activity' => [
        'starts_at' => getenv('ABB_ACTIVITY_STARTS_AT') ?: '',
        'ends_at' => getenv('ABB_ACTIVITY_ENDS_AT') ?: '',
    ],
    'cors_origins' => $csv(getenv('ABB_CORS_ORIGINS') ?: ''),
    'dev_openid' => getenv('ABB_DEV_OPENID') ?: '',
    'security' => [
        'admin_idle_seconds' => 900,
        'admin_absolute_seconds' => 28800,
        'admin_login_account_limit' => 5,
        'admin_login_ip_limit' => 50,
        'admin_login_window_seconds' => 900,
        'answer_limit' => 12,
        'draw_limit' => 3,
        'business_window_seconds' => 60,
        'oauth_ip_limit' => 300,
        'oauth_window_seconds' => 60,
        'admin_action_limit' => 30,
        'admin_export_limit' => 2,
        'admin_action_window_seconds' => 60,
    ],
];

$privateFile = getenv('ABB_CONFIG_FILE');
$localFile = $privateFile !== false && $privateFile !== '' ? $privateFile : dirname(__DIR__, 3) . '/api/config.local.php';
if ($privateFile !== false && $privateFile !== '' && !is_file($localFile)) {
    throw new RuntimeException('ABB_CONFIG_FILE does not exist.');
}
if (is_file($localFile)) {
    $local = require $localFile;
    if (!is_array($local)) {
        throw new RuntimeException('config.local.php must return an array.');
    }
    $config = array_replace_recursive($config, $local);
}

return $config;
