<?php
if (!defined('ABB_TEMPLATE_RENDER') || !defined('THINK_PATH')) {
    http_response_code(404);
    exit;
}
?>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>ABB 2026 活动管理</title>
  <style>
    :root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;color:#172033;background:#eef3f8}
    *{box-sizing:border-box}body{margin:0}.wrap{width:min(1180px,calc(100% - 32px));margin:32px auto}.top{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:24px}.brand{color:#ff261c;font-size:30px;font-weight:900}.sub{color:#65748a;font-size:14px}.card{background:#fff;border:1px solid #dce4ee;border-radius:16px;padding:22px;box-shadow:0 8px 24px rgba(35,62,95,.06);margin-bottom:20px}.login{max-width:440px;margin:10vh auto}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.stat strong{display:block;font-size:28px;margin-top:7px}.stat span{color:#65748a}.notice{padding:12px 16px;border-radius:10px;margin-bottom:18px}.notice.error{background:#fff0f0;color:#9b2525}.notice.success{background:#e9f8ef;color:#20683c}h1,h2{margin:0 0 16px}h1{font-size:22px}h2{font-size:18px}label{display:block;font-size:14px;font-weight:600;margin-bottom:6px}input{width:100%;height:42px;border:1px solid #c9d5e3;border-radius:8px;padding:0 11px;font:inherit}.field{margin-bottom:15px}button{border:0;border-radius:9px;background:#ff2b20;color:#fff;padding:11px 18px;font:inherit;font-weight:700;cursor:pointer}.secondary{background:#53647a}.inline{display:flex;align-items:end;gap:12px}.inline .field{flex:1;margin:0}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:780px}th,td{text-align:left;padding:11px 9px;border-bottom:1px solid #e7edf4;font-size:14px}th{color:#65748a}td input[type=number]{min-width:90px}input[type=checkbox]{width:20px;height:20px}.actions{display:flex;gap:10px;flex-wrap:wrap}.muted{color:#738197}.ok{color:#1d7840}.pending{color:#a25b00}@media(max-width:760px){.grid{grid-template-columns:repeat(2,1fr)}.top{align-items:flex-start}.wrap{width:min(100% - 20px,1180px);margin:18px auto}.card{padding:16px}.inline{display:block}.inline .field{margin-bottom:12px}}
  </style>
</head>
<body>
<main class="wrap">
<?php if ($admin === null): ?>
  <section class="card login">
    <div class="brand">ABB</div>
    <p class="sub">2026 活动运营后台</p>
    <h1>管理员登录</h1>
    <?php if ($error !== ''): ?><div class="notice error"><?= h($error) ?></div><?php endif; ?>
    <form method="post" autocomplete="on">
      <input type="hidden" name="action" value="login">
      <input type="hidden" name="csrf_token" value="<?= h($csrf) ?>">
      <div class="field"><label for="username">用户名</label><input id="username" name="username" autocomplete="username" required></div>
      <div class="field"><label for="password">密码</label><input id="password" type="password" name="password" autocomplete="current-password" required></div>
      <button type="submit">登录</button>
    </form>
  </section>
<?php else: ?>
  <header class="top">
    <div><div class="brand">ABB</div><div class="sub">2026 活动运营后台 · <?= h($admin['username']) ?></div></div>
    <form method="post"><input type="hidden" name="action" value="logout"><input type="hidden" name="csrf_token" value="<?= h($csrf) ?>"><button class="secondary" type="submit">退出</button></form>
  </header>
  <?php if ($error !== ''): ?><div class="notice error"><?= h($error) ?></div><?php endif; ?>
  <?php if (is_array($flash)): ?><div class="notice <?= h($flash['type']) ?>"><?= h($flash['message']) ?></div><?php endif; ?>
  <section class="grid card">
    <div class="stat"><span>参与用户</span><strong><?= h($stats['users']) ?></strong></div>
    <div class="stat"><span>六站通关</span><strong><?= h($stats['completed']) ?></strong></div>
    <div class="stat"><span>已抽奖</span><strong><?= h($stats['draws']) ?></strong></div>
    <div class="stat"><span>已核销</span><strong><?= h($stats['redeemed']) ?></strong></div>
  </section>
  <section class="card">
    <h2>现场核销</h2>
    <form method="post" class="inline">
      <input type="hidden" name="action" value="redeem"><input type="hidden" name="csrf_token" value="<?= h($csrf) ?>">
      <div class="field"><label for="claim_code">12 位兑奖码</label><input id="claim_code" name="claim_code" maxlength="12" pattern="[A-Fa-f0-9]{12}" required></div>
      <button type="submit">确认核销</button>
    </form>
  </section>
  <section class="card">
    <h2>奖品与抽奖权重</h2>
    <p class="muted">权重只有在活动方确认后才能填写。启用的奖品必须设置大于 0 的权重；剩余库存不得超过总库存。</p>
    <form method="post">
      <input type="hidden" name="action" value="update_prizes"><input type="hidden" name="csrf_token" value="<?= h($csrf) ?>">
      <div class="table-wrap"><table><thead><tr><th>奖品</th><th>总库存</th><th>剩余库存</th><th>每日配额</th><th>抽奖权重</th><th>启用</th></tr></thead><tbody>
      <?php foreach ($prizes as $prize): ?>
        <tr><td><?= h($prize['name']) ?><br><span class="muted"><?= h($prize['code']) ?></span></td><td><?= h($prize['total_stock']) ?></td>
        <td><input type="number" min="0" max="<?= h($prize['total_stock']) ?>" name="prizes[<?= h($prize['id']) ?>][total_remaining]" value="<?= h($prize['total_remaining']) ?>" required></td>
        <td><input type="number" min="0" name="prizes[<?= h($prize['id']) ?>][daily_stock]" value="<?= h($prize['daily_stock']) ?>" required></td>
        <td><input type="number" min="0" name="prizes[<?= h($prize['id']) ?>][draw_weight]" value="<?= h($prize['draw_weight'] ?? 0) ?>" required></td>
        <td><input type="checkbox" name="prizes[<?= h($prize['id']) ?>][active]" value="1" <?= $prize['active'] ? 'checked' : '' ?>></td></tr>
      <?php endforeach; ?>
      </tbody></table></div>
      <div class="actions" style="margin-top:16px"><button type="submit">保存配置</button></div>
    </form>
  </section>
  <section class="card">
    <div class="top"><div><h2>开放题答案</h2><div class="muted">导出内容不包含微信 OpenID。</div></div>
      <form method="post"><input type="hidden" name="action" value="export_open_answers"><input type="hidden" name="csrf_token" value="<?= h($csrf) ?>"><button class="secondary" type="submit">导出 CSV</button></form>
    </div>
  </section>
  <section class="card">
    <h2>最近 100 条中奖记录</h2>
    <div class="table-wrap"><table><thead><tr><th>时间</th><th>用户</th><th>奖品</th><th>兑奖码</th><th>状态</th></tr></thead><tbody>
    <?php if (!$draws): ?><tr><td colspan="5" class="muted">暂无中奖记录</td></tr><?php endif; ?>
    <?php foreach ($draws as $draw): ?><tr><td><?= h($draw['drawn_at']) ?></td><td><?= h($draw['nickname'] ?: '匿名用户') ?></td><td><?= h($draw['prize_name']) ?></td><td><?= h($draw['claim_code']) ?></td><td class="<?= $draw['redeemed_at'] ? 'ok' : 'pending' ?>"><?= $draw['redeemed_at'] ? '已核销 ' . h($draw['redeemed_at']) : '待核销' ?></td></tr><?php endforeach; ?>
    </tbody></table></div>
  </section>
<?php endif; ?>
</main>
</body>
</html>
