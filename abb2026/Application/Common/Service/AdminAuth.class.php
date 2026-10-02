<?php
declare(strict_types=1);

final class AdminAuth
{
    public static function user(): ?array
    {
        if (empty($_SESSION['admin_id'])) {
            return null;
        }
        $statement = Database::connection()->prepare(
            'SELECT id, username FROM admins WHERE id = :id AND active = 1 LIMIT 1'
        );
        $statement->execute(['id' => (int) $_SESSION['admin_id']]);
        $admin = $statement->fetch();
        if (!$admin) {
            unset($_SESSION['admin_id']);
            return null;
        }
        $admin['id'] = (int) $admin['id'];
        return $admin;
    }

    public static function login(string $username, string $password): bool
    {
        $username = trim($username);
        if ($username === '' || $password === '') {
            return false;
        }
        $pdo = Database::connection();
        $identifier = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '|' . mb_strtolower($username));
        $attempt = $pdo->prepare(
            'SELECT failed_count, locked_until FROM admin_login_attempts WHERE identifier_hash = :identifier LIMIT 1'
        );
        $attempt->execute(['identifier' => $identifier]);
        $rate = $attempt->fetch();
        if ($rate && $rate['locked_until'] !== null && new DateTimeImmutable($rate['locked_until']) > new DateTimeImmutable()) {
            throw new BusinessError('login_rate_limited', '登录尝试过多，请 15 分钟后再试。', 429);
        }

        $statement = $pdo->prepare(
            'SELECT id, username, password_hash FROM admins WHERE username = :username AND active = 1 LIMIT 1'
        );
        $statement->execute(['username' => $username]);
        $admin = $statement->fetch();
        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            $failed = (int) ($rate['failed_count'] ?? 0) + 1;
            $lockedUntil = $failed >= 5 ? (new DateTimeImmutable('+15 minutes'))->format('Y-m-d H:i:s') : null;
            $save = $pdo->prepare(
                'INSERT INTO admin_login_attempts (identifier_hash, failed_count, locked_until, updated_at)
                 VALUES (:identifier, :failed_count, :locked_until, NOW())
                 ON DUPLICATE KEY UPDATE failed_count = VALUES(failed_count), locked_until = VALUES(locked_until), updated_at = NOW()'
            );
            $save->execute(['identifier' => $identifier, 'failed_count' => $failed, 'locked_until' => $lockedUntil]);
            return false;
        }

        $pdo->prepare('DELETE FROM admin_login_attempts WHERE identifier_hash = :identifier')->execute(['identifier' => $identifier]);
        if (password_needs_rehash($admin['password_hash'], PASSWORD_DEFAULT)) {
            $pdo->prepare('UPDATE admins SET password_hash = :hash, updated_at = NOW() WHERE id = :id')
                ->execute(['hash' => password_hash($password, PASSWORD_DEFAULT), 'id' => (int) $admin['id']]);
        }
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $admin['id'];
        Auth::csrfToken();
        return true;
    }

    public static function logout(): void
    {
        unset($_SESSION['admin_id']);
        session_regenerate_id(true);
    }

    public static function validCsrf(string $token): bool
    {
        $sessionToken = (string) ($_SESSION['csrf_token'] ?? '');
        return $token !== '' && $sessionToken !== '' && hash_equals($sessionToken, $token);
    }

    public static function audit(int $adminId, string $action, array $details = []): void
    {
        $statement = Database::connection()->prepare(
            'INSERT INTO admin_audit_logs (admin_id, action, details_json, ip_hash, created_at)
             VALUES (:admin_id, :action, :details_json, :ip_hash, NOW())'
        );
        $statement->execute([
            'admin_id' => $adminId,
            'action' => $action,
            'details_json' => json_encode($details, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'ip_hash' => hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown')),
        ]);
    }
}
