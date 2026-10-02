<?php
declare(strict_types=1);

final class Api
{
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function ok(array $data = [], int $status = 200): void
    {
        self::json(['ok' => true, 'data' => $data, 'version' => ABB_API_VERSION], $status);
    }

    public static function error(string $code, string $message, int $status = 400, ?string $detail = null): void
    {
        $payload = ['ok' => false, 'error' => ['code' => $code, 'message' => $message], 'version' => ABB_API_VERSION];
        if ($detail !== null) {
            $payload['error']['detail'] = $detail;
        }
        self::json($payload, $status);
    }

    public static function input(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            self::error('invalid_json', '请求内容不是有效的 JSON。', 400);
        }
        return $data;
    }

    public static function requirePost(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            self::error('method_not_allowed', '仅支持 POST 请求。', 405);
        }
    }

    public static function requireCsrf(): void
    {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';
        if ($token === '' || $sessionToken === '' || !hash_equals($sessionToken, $token)) {
            self::error('csrf_failed', '页面会话已失效，请刷新后重试。', 419);
        }
    }
}
