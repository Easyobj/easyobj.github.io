<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/bootstrap.php';

$report = Health::report();
$localMode = in_array('--local', $argv, true);
$localReady = true;
foreach ($report['checks'] as $name => $check) {
    $skipped = $localMode && in_array($name, ['production', 'https', 'wechat', 'wechat_browser'], true);
    $label = $skipped ? 'SKIP' : ($check['ok'] ? 'OK' : 'FAIL');
    fwrite(STDOUT, sprintf("[%s] %-10s %s\n", $label, $name, $check['message']));
    if (!$skipped) {
        $localReady = $localReady && $check['ok'];
    }
}
$ready = $localMode ? $localReady : $report['ready'];
fwrite(STDOUT, $ready ? "Preflight passed.\n" : "Preflight failed.\n");
exit($ready ? 0 : 1);
