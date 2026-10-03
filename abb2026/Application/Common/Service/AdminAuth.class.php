<?php
declare(strict_types=1);

final class AdminAuth
{
    public static function user(): ?array
    {
        if (empty($_SESSION['admin_id'])) {
            return null;
        }
        $security = abbConfig()['security'];
        $now = time();
        $authenticatedAt = (int) ($_SESSION['admin_authenticated_at'] ?? 0);
        $lastSeenAt = (int) ($_SESSION['admin_last_seen_at'] ?? 0);
        if ($authenticatedAt <= 0 || $lastSeenAt <= 0 || $now < $authenticatedAt || $now < $lastSeenAt
            || $now - $authenticatedAt >= (int) $security['admin_absolute_seconds']
            || $now - $lastSeenAt >= (int) $security['admin_idle_seconds']) {
            self::logout();
            return null;
        }
        $statement = Database::connection()->prepare(
            'SELECT id, username, password_hash FROM admins WHERE id = :id AND active = 1 LIMIT 1'
        );
        $statement->execute(['id' => (int) $_SESSION['admin_id']]);
        $admin = $statement->fetch();
        $credentialTag = (string) ($_SESSION['admin_credential_tag'] ?? '');
        if (!$admin || $credentialTag === '' || !hash_equals($credentialTag, hash('sha256', $admin['password_hash']))) {
            self::logout();
            return null;
        }
        $_SESSION['admin_last_seen_at'] = $now;
        return ['id' => (int) $admin['id'], 'username' => $admin['username']];
    }

    public static function login(string $username, string $password): bool
    {
        $security = abbConfig()['security'];
        $window = (int) $security['admin_login_window_seconds'];
        // REMOTE_ADDR only: do not trust user-supplied X-Forwarded-For.
        RateLimiter::consume('admin-login-ip', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
            (int) $security['admin_login_ip_limit'], $window, 'login_rate_limited');
        $username = trim($username);
        // Match create-admin.php. Reject accent aliases before collation-based
        // lookup; otherwise unicode_ci may identify a different limiter key.
        if (!preg_match('/^[A-Za-z0-9_.-]{3,80}$/D', $username) || $password === '' || strlen($password) > 1024) {
            return false;
        }
        $username = strtolower($username);
        $pdo = Database::connection();
        $statement = $pdo->prepare(
            'SELECT id, username, password_hash FROM admins WHERE username = :username AND active = 1 LIMIT 1'
        );
        $statement->execute(['username' => $username]);
        $admin = $statement->fetch();
        // Account limits survive IP/browser changes. Unknown names use one
        // bounded bucket rather than generating unlimited per-name rows.
        $accountKey = $admin ? (string) $admin['id'] : 'unknown';
        RateLimiter::consume('admin-login-account', $accountKey,
            (int) $security['admin_login_account_limit'], $window, 'login_rate_limited');
        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            return false;
        }
        RateLimiter::clear('admin-login-account', $accountKey);
        if (password_needs_rehash($admin['password_hash'], PASSWORD_DEFAULT)) {
            $admin['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
            $pdo->prepare('UPDATE admins SET password_hash = :hash, updated_at = NOW() WHERE id = :id')
                ->execute(['hash' => $admin['password_hash'], 'id' => (int) $admin['id']]);
        }
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int) $admin['id'];
        $_SESSION['admin_authenticated_at'] = time();
        $_SESSION['admin_last_seen_at'] = time();
        $_SESSION['admin_credential_tag'] = hash('sha256', $admin['password_hash']);
        self::rotateCsrf();
        return true;
    }

    public static function logout(): void
    {
        unset($_SESSION['admin_id'], $_SESSION['admin_authenticated_at'], $_SESSION['admin_last_seen_at'], $_SESSION['admin_credential_tag']);
        session_regenerate_id(true);
        self::rotateCsrf();
    }

    private static function rotateCsrf(): void
    {
        unset($_SESSION['csrf_token']);
        Auth::csrfToken();
    }

    public static function validCsrf(string $token): bool
    {
        return Auth::validCsrf($token);
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
