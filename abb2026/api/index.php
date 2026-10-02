<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$action = trim((string) ($_GET['action'] ?? 'bootstrap'));

if ($action === 'health') {
    Api::ok(['status' => 'ok', 'activity' => Activity::status()]);
}

if ($action === 'bootstrap') {
    $user = Auth::user(false);
    if ($user === null) {
        Api::ok([
            'authenticated' => false,
            'loginUrl' => abbConfig()['app_url'] !== '' ? abbConfig()['app_url'] . '/api/auth/start.php' : null,
            'activity' => Activity::status(),
        ]);
    }
    Api::ok([
        'authenticated' => true,
        'csrfToken' => Auth::csrfToken(),
        'user' => $user,
        'activity' => Activity::status(),
        'progress' => AnswerService::progress($user['id']),
        'draw' => LotteryService::existing($user['id']),
    ]);
}

if ($action === 'answer') {
    Api::requirePost();
    Api::requireCsrf();
    Activity::requireOpen();
    $user = Auth::user();
    $input = Api::input();
    Api::ok(AnswerService::submit($user['id'], (int) ($input['station'] ?? 0), $input['answer'] ?? null));
}

if ($action === 'draw') {
    Api::requirePost();
    Api::requireCsrf();
    $user = Auth::user();
    Api::ok(LotteryService::draw($user['id']));
}

Api::error('not_found', '接口不存在。', 404);
