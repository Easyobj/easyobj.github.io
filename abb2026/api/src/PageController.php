<?php
declare(strict_types=1);

final class PageController
{
    public static function handle(): array
    {
        if (Wechat::browserRequired() && !Wechat::isBrowser()) {
            return ['view' => 'wechat-required'];
        }

        $user = Auth::user(false);
        if ($user === null) {
            $appUrl = abbConfig()['app_url'];
            if ($appUrl === '') {
                throw new RuntimeException('WeChat OAuth is not configured.');
            }
            header('Location: ' . $appUrl . '/api/auth/start.php', true, 302);
            exit;
        }

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
            self::handlePost($user);
        }

        $flash = $_SESSION['activity_flash'] ?? null;
        unset($_SESSION['activity_flash']);
        return [
            'view' => 'activity',
            'serverState' => [
                'serverRendered' => true,
                'csrfToken' => Auth::csrfToken(),
                'user' => $user,
                'activity' => Activity::status(),
                'progress' => AnswerService::progress($user['id']),
                'draw' => LotteryService::existing($user['id']),
                'flash' => $flash,
            ],
        ];
    }

    private static function handlePost(array $user): void
    {
        $action = trim((string) ($_POST['action'] ?? ''));
        $station = (int) ($_POST['station'] ?? 0);
        try {
            if (!Auth::validCsrf((string) ($_POST['csrf_token'] ?? ''))) {
                throw new BusinessError('csrf_failed', '页面会话已失效，请刷新后重试。', 419);
            }
            if ($action === 'answer') {
                $answer = json_decode((string) ($_POST['answer_json'] ?? ''), true, 32, JSON_THROW_ON_ERROR);
                Activity::requireOpen();
                $result = AnswerService::submit($user['id'], $station, $answer);
                $_SESSION['activity_flash'] = [
                    'type' => $result['passed'] ? 'success' : 'error',
                    'message' => $result['passed'] ? '回答正确，徽章已保存。' : '本次回答未通过，可以返回后重新作答。',
                ];
                self::redirect($result['passed'] ? 'result-correct' : 'result-fail', $station);
            }
            if ($action === 'draw') {
                $draw = LotteryService::draw($user['id']);
                $_SESSION['activity_flash'] = [
                    'type' => 'success',
                    'message' => $draw['existing'] ? '已恢复您的中奖记录。' : '抽奖成功，请查看兑奖凭证。',
                ];
                self::redirect('lottery-win');
            }
            throw new BusinessError('invalid_action', '提交操作无效。', 400);
        } catch (JsonException $error) {
            $_SESSION['activity_flash'] = ['type' => 'error', 'message' => '提交内容格式无效，请重新作答。'];
            self::redirect($station >= 1 && $station <= 6 ? 'scene-' . $station : 'home', $station);
        } catch (BusinessError $error) {
            $_SESSION['activity_flash'] = ['type' => 'error', 'message' => $error->getMessage()];
            $target = in_array($error->errorCode, ['activity_ended', 'sold_out_today'], true) ? 'activity-ended' : ($action === 'draw' ? 'lottery' : 'scene-' . $station);
            self::redirect($target, $station);
        } catch (Throwable $error) {
            error_log(sprintf('[ABB2026 Page] %s in %s:%d', $error->getMessage(), $error->getFile(), $error->getLine()));
            $_SESSION['activity_flash'] = ['type' => 'error', 'message' => '服务暂时不可用，请稍后重试。'];
            self::redirect($action === 'draw' ? 'lottery' : 'scene-' . $station, $station);
        }
    }

    private static function redirect(string $fragment, int $station = 0): void
    {
        $query = $station >= 1 && $station <= 6 ? '?scene=' . $station : '';
        header('Location: index.php' . $query . '#' . rawurlencode($fragment), true, 303);
        exit;
    }
}
