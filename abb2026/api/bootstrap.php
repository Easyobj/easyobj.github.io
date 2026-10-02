<?php
declare(strict_types=1);

const ABB_API_VERSION = '2026.2.0';

$config = require __DIR__ . '/config.php';
date_default_timezone_set((string) $config['timezone']);

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

session_name('abb2026_session');
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

require_once __DIR__ . '/src/Api.php';
require_once __DIR__ . '/src/Database.php';
require_once __DIR__ . '/src/Activity.php';
require_once __DIR__ . '/src/Auth.php';
require_once __DIR__ . '/src/AdminAuth.php';
require_once __DIR__ . '/src/AnswerService.php';
require_once __DIR__ . '/src/LotteryService.php';
require_once __DIR__ . '/src/Wechat.php';
require_once __DIR__ . '/src/Health.php';

set_exception_handler(static function (Throwable $error) use ($config): void {
    error_log(sprintf('[ABB2026] %s in %s:%d', $error->getMessage(), $error->getFile(), $error->getLine()));
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, "ABB2026 API error: " . $error->getMessage() . PHP_EOL);
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
