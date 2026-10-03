<?php
namespace Other\Controller;

use Think\Controller;

final class AuthController extends Controller
{
    public function start(): void
    {
        $this->consumeLimit('oauth-start');
        if (\Wechat::browserRequired() && !\Wechat::isBrowser()) {
            header('Location: ' . \abbConfig()['app_url'] . '/index.php', true, 302);
            exit;
        }
        header('Location: ' . \Wechat::authorizationUrl(), true, 302);
        exit;
    }

    public function callback(): void
    {
        $this->consumeLimit('oauth-callback');
        $code = is_string($_GET['code'] ?? null) ? trim($_GET['code']) : '';
        $state = is_string($_GET['state'] ?? null) ? trim($_GET['state']) : '';
        $expected = (string) ($_SESSION['oauth_state'] ?? '');
        if ($code === '' || strlen($code) > 1024 || strlen($state) > 128 || $state === '' || $expected === '' || !hash_equals($expected, $state)) {
            \Api::error('oauth_state_failed', '微信授权校验失败，请重新进入活动。', 400);
        }
        \Auth::signInByWechat(\Wechat::exchange($code));
        header('Location: ' . \abbConfig()['app_url'] . '/index.php#home', true, 302);
        exit;
    }

    private function consumeLimit(string $scope): void
    {
        $security = \abbConfig()['security'];
        try {
            \RateLimiter::consume($scope, $_SERVER['REMOTE_ADDR'] ?? 'unknown', (int) $security['oauth_ip_limit'], (int) $security['oauth_window_seconds']);
        } catch (\BusinessError $error) {
            \Api::error($error->errorCode, $error->getMessage(), $error->httpStatus);
        }
    }
}
