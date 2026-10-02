<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/bootstrap.php';

$username = trim((string) ($argv[1] ?? ''));
$password = (string) (getenv('ABB_ADMIN_PASSWORD') ?: '');
if ($username === '' || $password === '') {
    fwrite(STDERR, "Usage: ABB_ADMIN_PASSWORD='strong-password' php api/bin/create-admin.php <username>\n");
    exit(2);
}
if (!preg_match('/^[A-Za-z0-9_.-]{3,80}$/', $username)) {
    fwrite(STDERR, "Username must be 3-80 characters: letters, numbers, dot, underscore or hyphen.\n");
    exit(2);
}
if (strlen($password) < 12) {
    fwrite(STDERR, "Password must contain at least 12 characters.\n");
    exit(2);
}

$statement = Database::connection()->prepare(
    'INSERT INTO admins (username, password_hash, active, created_at, updated_at)
     VALUES (:username, :password_hash, 1, NOW(), NOW())
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), active = 1, updated_at = NOW()'
);
$statement->execute([
    'username' => $username,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
]);
fwrite(STDOUT, "Admin account created or updated.\n");
