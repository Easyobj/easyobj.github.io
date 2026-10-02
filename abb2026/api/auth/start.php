<?php
declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

if (Wechat::browserRequired() && !Wechat::isBrowser()) {
    header('Location: ' . rtrim((string) abbConfig()['app_url'], '/') . '/index.php', true, 302);
    exit;
}

header('Location: ' . Wechat::authorizationUrl(), true, 302);
exit;
