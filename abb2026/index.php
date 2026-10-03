<?php
declare(strict_types=1);

require __DIR__ . '/Application/Common/bootstrap.php';
require __DIR__ . '/Application/Common/Conf/routes.php';
define('APP_PATH', __DIR__ . '/Application/');
define('RUNTIME_PATH', APP_PATH . 'Runtime/5.9.1/');
define('APP_DEBUG', false);
require __DIR__ . '/ThinkPHP/ThinkPHP.php';
