<?php
declare(strict_types=1);
if (!defined('ABB_TEMPLATE_RENDER')) {
    http_response_code(404);
    exit;
}
$release = '5.9.1-business-limits';
?>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="format-detection" content="telephone=no,email=no,address=no">
  <meta name="theme-color" content="#dcecff">
  <meta name="robots" content="noindex,nofollow">
  <meta name="abb-release" content="<?= htmlspecialchars($release, ENT_QUOTES, 'UTF-8') ?>">
  <title>请在微信中打开 - ABB Robotics</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/ABBvoice_CNSG_Rg.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="styles.css?v=5.9.1">
</head>
<body class="wechat-gate-page">
  <main class="wechat-gate" aria-labelledby="wechatGateTitle">
    <section class="wechat-gate__card">
      <div class="wechat-gate__brand">ABB</div>
      <div class="wechat-gate__icon" aria-hidden="true">
        <span></span><span></span><i></i><b></b>
      </div>
      <p class="wechat-gate__kicker">ABB ROBOTICS EXPERIENCE</p>
      <h1 id="wechatGateTitle">请在微信中打开</h1>
      <p>本活动仅支持微信内置浏览器。请将链接发送到微信，并在微信中重新打开。</p>
      <div class="wechat-gate__notice">进入后将自动进行微信公众号授权</div>
    </section>
  </main>
</body>
</html>
