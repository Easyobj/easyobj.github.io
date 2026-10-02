<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

// Run locally or over SSH; credentials are never printed or put in arguments.
$options = getopt('', ['source:', 'output:', 'app-url:']);
$source = $options['source'] ?? '';
$output = $options['output'] ?? '';
$appUrl = rtrim((string) ($options['app-url'] ?? ''), '/');
if (!is_string($source) || !is_string($output) || !is_file($source) || $output === '') {
    fwrite(STDERR, "Usage: php api/bin/import-legacy-config.php --source=/path/to/2025/config.php --output=/private/settings.php [--app-url=https://approved-domain]\n");
    exit(2);
}
if ($appUrl !== '') {
    $url = parse_url($appUrl);
    if (!is_array($url) || ($url['scheme'] ?? '') !== 'https' || empty($url['host'])
        || isset($url['user']) || isset($url['pass'])
        || isset($url['query']) || isset($url['fragment'])) {
        fwrite(STDERR, "app-url must be the approved HTTPS origin/path.\n");
        exit(2);
    }
}
$legacy = require $source;
if (!is_array($legacy) || empty($legacy['DB_USER']) || empty($legacy['DB_PWD'])
    || empty($legacy['wxconfig']['appid']) || empty($legacy['wxconfig']['secret'])) {
    fwrite(STDERR, "Legacy private configuration is incomplete.\n");
    exit(2);
}
$private = [
    'app_env' => 'production',
    'app_url' => $appUrl,
    'timezone' => 'Asia/Shanghai',
    'db' => [
        'host' => (string) ($legacy['DB_HOST'] ?? 'localhost'),
        'port' => (int) ($legacy['DB_PORT'] ?? 3306),
        'name' => 'abb2026',
        'user' => (string) $legacy['DB_USER'],
        'password' => (string) $legacy['DB_PWD'],
    ],
    'wechat' => [
        'app_id' => (string) $legacy['wxconfig']['appid'],
        'app_secret' => (string) $legacy['wxconfig']['secret'],
        'scope' => 'snsapi_userinfo',
        'browser_required' => true,
    ],
    'activity' => ['starts_at' => '', 'ends_at' => ''],
    'dev_openid' => '',
];
umask(0077);
$directory = dirname($output);
if (!is_dir($directory) && !mkdir($directory, 0700, true)) {
    fwrite(STDERR, "Unable to create private directory.\n");
    exit(1);
}
$file = @fopen($output, 'x');
if ($file === false) {
    fwrite(STDERR, "Output already exists or cannot be created; existing configuration was not changed.\n");
    exit(2);
}
$content = "<?php\n// Private production settings; never commit or publish.\nreturn " . var_export($private, true) . ";\n";
$written = fwrite($file, $content);
fclose($file);
chmod($output, 0600);
if ($written !== strlen($content)) {
    fwrite(STDERR, "Private configuration write failed.\n");
    exit(1);
}
fwrite(STDOUT, "Imported private credentials; target database is abb2026. Set the approved URL and activity dates before preflight.\n");
