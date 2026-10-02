<?php
declare(strict_types=1);

// Restrict the legacy dispatcher: inherited public Controller methods must
// never become HTTP actions. Query-string routes work with PHP-FPM and PHP CLI.
$route = [];
foreach (['m' => 'Other', 'c' => 'Index', 'a' => 'index'] as $key => $default) {
    // ThinkPHP 3 gives POST routing parameters precedence over GET.
    if (array_key_exists($key, $_POST)) {
        Api::error('not_found', '页面不存在。', 404);
    }
    $value = $_GET[$key] ?? $default;
    if (!is_string($value) || !preg_match('/^[A-Za-z][A-Za-z0-9]*$/D', $value)) {
        Api::error('not_found', '页面不存在。', 404);
    }
    $route[$key] = strtolower($value);
}
$allowed = [
    'other/index/index' => ['Other', 'Index', 'index'],
    'other/auth/start' => ['Other', 'Auth', 'start'],
    'other/auth/callback' => ['Other', 'Auth', 'callback'],
    'admin/index/index' => ['Admin', 'Index', 'index'],
];
$path = implode('/', $route);
if (!isset($allowed[$path]) || !empty($_SERVER['PATH_INFO']) || isset($_GET['s']) || isset($_POST['s'])) {
    Api::error('not_found', '页面不存在。', 404);
}
[$_GET['m'], $_GET['c'], $_GET['a']] = $allowed[$path];
$_SERVER['PATH_INFO'] = '';
$_REQUEST = array_merge($_POST, $_GET);
