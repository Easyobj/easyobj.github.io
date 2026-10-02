<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/bootstrap.php';

$report = Health::report();
foreach ($report['checks'] as $name => $check) {
    fwrite(STDOUT, sprintf("[%s] %-10s %s\n", $check['ok'] ? 'OK' : 'FAIL', $name, $check['message']));
}
fwrite(STDOUT, $report['ready'] ? "Preflight passed.\n" : "Preflight failed.\n");
exit($report['ready'] ? 0 : 1);
