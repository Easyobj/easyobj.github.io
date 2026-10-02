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
];

$localFile = __DIR__ . '/config.local.php';
if (is_file($localFile)) {
    $local = require $localFile;
    if (!is_array($local)) {
        throw new RuntimeException('config.local.php must return an array.');
    }
    $config = array_replace_recursive($config, $local);
}

return $config;
