<?php
declare(strict_types=1);

final class Auth
{
    public static function csrfToken(): string
    {
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return (string) $_SESSION['csrf_token'];
    }

    public static function user(bool $required = true): ?array
    {
        if (empty($_SESSION['user_id']) && abbConfig()['app_env'] === 'development' && abbConfig()['dev_openid'] !== '') {
            self::signInByWechat([
                'openid' => abbConfig()['dev_openid'],
                'nickname' => 'Development User',
                'headimgurl' => '',
            ]);
        }
        if (empty($_SESSION['user_id'])) {
            if ($required) {
                Api::error('authentication_required', '请先通过微信授权进入活动。', 401);
            }
            return null;
        }
        $statement = Database::connection()->prepare(
            'SELECT id, nickname, avatar_url FROM users WHERE id = :id AND deleted_at IS NULL LIMIT 1'
        );
        $statement->execute(['id' => (int) $_SESSION['user_id']]);
        $user = $statement->fetch();
        if (!$user) {
            unset($_SESSION['user_id']);
            if ($required) {
                Api::error('authentication_required', '用户会话无效，请重新进入活动。', 401);
            }
            return null;
        }
        $user['id'] = (int) $user['id'];
        return $user;
    }

    public static function signInByWechat(array $profile): array
    {
        $openid = trim((string) ($profile['openid'] ?? ''));
        if ($openid === '') {
            throw new InvalidArgumentException('WeChat profile is missing openid.');
        }
        $pdo = Database::connection();
        $statement = $pdo->prepare(
            'INSERT INTO users (openid, nickname, avatar_url, created_at, updated_at)
             VALUES (:openid, :nickname, :avatar_url, NOW(), NOW())
             ON DUPLICATE KEY UPDATE nickname = VALUES(nickname), avatar_url = VALUES(avatar_url), updated_at = NOW()'
        );
        $statement->execute([
            'openid' => $openid,
            'nickname' => mb_substr((string) ($profile['nickname'] ?? ''), 0, 120),
            'avatar_url' => mb_substr((string) ($profile['headimgurl'] ?? ''), 0, 1000),
        ]);
        $find = $pdo->prepare('SELECT id, nickname, avatar_url FROM users WHERE openid = :openid LIMIT 1');
        $find->execute(['openid' => $openid]);
        $user = $find->fetch();
        if (!$user) {
            throw new RuntimeException('Unable to create WeChat user.');
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        unset($_SESSION['oauth_state']);
        self::csrfToken();
        return $user;
    }
}
