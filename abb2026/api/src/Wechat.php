<?php
declare(strict_types=1);

final class Wechat
{
    public static function browserRequired(): bool
    {
        return (bool) (abbConfig()['wechat']['browser_required'] ?? true);
    }

    public static function isBrowser(?string $userAgent = null): bool
    {
        $agent = $userAgent ?? (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
        return $agent !== '' && stripos($agent, 'MicroMessenger') !== false;
    }

    public static function authorizationUrl(): string
    {
        $config = abbConfig();
        if ($config['app_url'] === '' || $config['wechat']['app_id'] === '') {
            throw new RuntimeException('WeChat OAuth is not configured.');
        }
        $_SESSION['oauth_state'] = bin2hex(random_bytes(24));
        $callback = $config['app_url'] . '/api/auth/callback.php';
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?' . http_build_query([
            'appid' => $config['wechat']['app_id'],
            'redirect_uri' => $callback,
            'response_type' => 'code',
            'scope' => $config['wechat']['scope'],
            'state' => $_SESSION['oauth_state'],
        ]) . '#wechat_redirect';
    }

    public static function exchange(string $code): array
    {
        $wechat = abbConfig()['wechat'];
        if ($wechat['app_id'] === '' || $wechat['app_secret'] === '') {
            throw new RuntimeException('WeChat OAuth is not configured.');
        }
        $token = self::getJson('https://api.weixin.qq.com/sns/oauth2/access_token?' . http_build_query([
            'appid' => $wechat['app_id'],
            'secret' => $wechat['app_secret'],
            'code' => $code,
            'grant_type' => 'authorization_code',
        ]));
        if (empty($token['access_token']) || empty($token['openid'])) {
            throw new RuntimeException('WeChat token exchange failed.');
        }
        if ($wechat['scope'] === 'snsapi_base') {
            return ['openid' => $token['openid'], 'nickname' => '', 'headimgurl' => ''];
        }
        return self::getJson('https://api.weixin.qq.com/sns/userinfo?' . http_build_query([
            'access_token' => $token['access_token'],
            'openid' => $token['openid'],
            'lang' => 'zh_CN',
        ]));
    }

    private static function getJson(string $url): array
    {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_USERAGENT => 'ABB2026-H5/1.0',
        ]);
        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        if ($body === false || $status !== 200) {
            throw new RuntimeException('WeChat request failed: ' . ($error ?: 'HTTP ' . $status));
        }
        $data = json_decode($body, true);
        if (!is_array($data) || isset($data['errcode'])) {
            throw new RuntimeException('WeChat returned an invalid response.');
        }
        return $data;
    }
}
