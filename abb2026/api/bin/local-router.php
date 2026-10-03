<?php
declare(strict_types=1);

// Mirror the production server's private-directory and static-preview rules.
$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (preg_match('~(?:^|/)\.|^/(?:Application|ThinkPHP|templates)/|^/api/(?:src|database|bin)/|^/api/(?:config[^/]*|bootstrap\.php$)~i', $path)
    || strpos($path, "\0") !== false) {
    http_response_code(404);
    exit;
}
if ($path === '/index.html') {
    header('Location: /index.php', true, 302);
    exit;
}
return false;
