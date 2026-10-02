<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$action = trim((string) ($_GET['action'] ?? 'health'));

if ($action === 'health') {
    $health = Health::report();
    Api::ok($health, $health['ready'] ? 200 : 503);
}

Api::error('not_found', '接口不存在。', 404);
