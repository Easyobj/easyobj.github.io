<?php
declare(strict_types=1);

const ABB_API_VERSION = '2026.3.0';

$config = require __DIR__ . '/Conf/settings.php';
date_default_timezone_set((string) $config['timezone']);

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

session_name('abb2026_session');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
header('Cache-Control: no-store');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, $config['cors_origins'], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/Service/Api.class.php';
require_once __DIR__ . '/Service/Database.class.php';
require_once __DIR__ . '/Service/BusinessError.class.php';
require_once __DIR__ . '/Service/RateLimiter.class.php';
require_once __DIR__ . '/Service/Activity.class.php';
require_once __DIR__ . '/Service/Auth.class.php';
require_once __DIR__ . '/Service/AdminAuth.class.php';
require_once __DIR__ . '/Service/AnswerService.class.php';
require_once __DIR__ . '/Service/LotteryService.class.php';
require_once __DIR__ . '/Service/Wechat.class.php';
require_once __DIR__ . '/Service/Health.class.php';
require_once __DIR__ . '/Service/PageController.class.php';

set_exception_handler(static function (Throwable $error) use ($config): void {
    error_log(sprintf('[ABB2026] %s in %s:%d', get_class($error), $error->getFile(), $error->getLine()));
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, "ABB2026 service error; check configuration and controlled server logs." . PHP_EOL);
        exit(1);
    }
    $detail = $config['app_env'] === 'development' ? $error->getMessage() : null;
    Api::error('server_error', '服务暂时不可用，请稍后重试。', 500, $detail);
});

function abbConfig(): array
{
    global $config;
    return $config;
}
