<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
$options = getopt('', ['config:', 'execute']);
$file = $options['config'] ?? '';
if (!is_string($file) || !is_file($file)) {
    fwrite(STDERR, "Usage: php api/bin/provision-database.php --config=/private/settings.php [--execute]\n");
    exit(2);
}
$settings = require $file;
$db = $settings['db'] ?? [];
if (($db['name'] ?? '') !== 'abb2026' || empty($db['user']) || empty($db['password'])) {
    fwrite(STDERR, "Requires private credentials with database name exactly abb2026.\n");
    exit(2);
}
if (!array_key_exists('execute', $options)) {
    fwrite(STDOUT, "Dry run: create abb2026 and import its schema only when it has no tables. Pass --execute on the existing server to provision.\n");
    exit;
}
try {
    $pdo = new PDO(sprintf('mysql:host=%s;port=%d;charset=utf8mb4', $db['host'], $db['port']), $db['user'], $db['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $check = $pdo->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = :name');
    $check->execute(['name' => 'abb2026']);
    if ((int) $check->fetchColumn() !== 0) {
        fwrite(STDERR, "abb2026 already contains tables; no schema or data was changed. Use reviewed migrations for upgrades.\n");
        exit(2);
    }
    $pdo->exec('CREATE DATABASE IF NOT EXISTS abb2026 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('USE abb2026');
    $schema = file_get_contents(dirname(__DIR__) . '/database/schema.sql');
    if ($schema === false) {
        throw new RuntimeException('Schema is missing.');
    }
    $pdo->exec($schema);
    fwrite(STDOUT, "Created and initialized abb2026; previous-year databases were not modified. Prize weights remain unset.\n");
} catch (Throwable $error) {
    fwrite(STDERR, "Provisioning failed. Check database connectivity/privileges and inspect only abb2026 for partially created tables. Credentials were not printed.\n");
    exit(1);
}
