<?php
declare(strict_types=1);

require __DIR__ . '/api/bootstrap.php';

define('ABB_TEMPLATE_RENDER', true);
$page = PageController::handle();
if (($page['view'] ?? '') === 'wechat-required') {
    require __DIR__ . '/templates/wechat-required.php';
    exit;
}

$serverState = $page['serverState'];
require __DIR__ . '/templates/activity.php';
