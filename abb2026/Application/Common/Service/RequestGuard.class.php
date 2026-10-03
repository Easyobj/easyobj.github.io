<?php
declare(strict_types=1);

/** Reject oversized/unsupported requests before configuration, sessions or DB. */
final class RequestGuard
{
    public static function enforce(): void
    {
        if (PHP_SAPI === 'cli') {
            return;
        }
        $method = $_SERVER['REQUEST_METHOD'] ?? '';
        if (!in_array($method, ['GET', 'HEAD', 'POST', 'OPTIONS'], true)) {
            header('Allow: GET, HEAD, POST, OPTIONS');
            self::reject(405, '请求方法不支持。');
        }
        if (strlen($_SERVER['QUERY_STRING'] ?? '') > 8192) {
            self::reject(414, '请求地址过长。');
        }
        if ($method !== 'POST') {
            return;
        }
        if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) {
            self::reject(413, '提交内容过大。');
        }
        $type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
        if ($type !== 'application/x-www-form-urlencoded') {
            self::reject(415, '请通过页面表单提交。');
        }
        // Also bound bodies without Content-Length. The web server must cap
        // requests too: PHP parses POST before application code executes.
        $input = fopen('php://input', 'rb');
        if ($input === false) {
            self::reject(400, '无法读取提交内容。');
        }
        $body = stream_get_contents($input, 16385);
        fclose($input);
        if ($body === false || strlen($body) > 16384) {
            self::reject(413, '提交内容过大。');
        }
    }

    private static function reject(int $status, string $message): void
    {
        http_response_code($status);
        header('Content-Type: text/plain; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo $message;
        exit;
    }
}
