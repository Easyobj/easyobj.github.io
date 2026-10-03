<?php
declare(strict_types=1);

// Public liveness only. Do not load private settings, sessions or the DB.
const ABB_API_VERSION = '2026.3.1';
require dirname(__DIR__) . '/Application/Common/Service/RequestGuard.class.php';
require dirname(__DIR__) . '/Application/Common/Service/Api.class.php';
RequestGuard::enforce();
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$action = is_string($_GET['action'] ?? 'health') ? trim($_GET['action'] ?? 'health') : '';

if ($action === 'health') {
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)) {
        header('Allow: GET, HEAD');
        Api::error('method_not_allowed', '请求方法不支持。', 405);
    }
    Api::ok(['status' => 'alive', 'scope' => 'liveness']);
}

Api::error('not_found', '接口不存在。', 404);
