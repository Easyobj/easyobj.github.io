<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$projectRoot = dirname(__DIR__, 2);
$template = $projectRoot . '/templates/activity.php';
$target = $projectRoot . '/index.html';
$serverState = null;

ob_start();
require $template;
$html = ob_get_clean();
if (!is_string($html) || $html === '') {
    fwrite(STDERR, "Static preview generation failed.\n");
    exit(1);
}
if (file_put_contents($target, $html) === false) {
    fwrite(STDERR, "Unable to write index.html.\n");
    exit(1);
}
fwrite(STDOUT, "Generated index.html from templates/activity.php.\n");
