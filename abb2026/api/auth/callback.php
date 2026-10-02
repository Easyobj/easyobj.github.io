<?php
declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

$code = trim((string) ($_GET['code'] ?? ''));
$state = trim((string) ($_GET['state'] ?? ''));
$expected = (string) ($_SESSION['oauth_state'] ?? '');
if ($code === '' || $state === '' || $expected === '' || !hash_equals($expected, $state)) {
    Api::error('oauth_state_failed', '微信授权校验失败，请重新进入活动。', 400);
}

Auth::signInByWechat(Wechat::exchange($code));
header('Location: ' . abbConfig()['app_url'] . '/#home', true, 302);
exit;
