<?php
declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

header('Location: ' . Wechat::authorizationUrl(), true, 302);
exit;
