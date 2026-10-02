<?php
declare(strict_types=1);

require __DIR__ . '/api/bootstrap.php';

$serverState = PageController::handle();
require __DIR__ . '/templates/activity.php';
