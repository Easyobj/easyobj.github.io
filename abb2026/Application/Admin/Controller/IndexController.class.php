<?php
namespace Admin\Controller;

use Think\Controller;
use AdminAuth;
use Auth;
use Database;
use BusinessError;
use Throwable;
use InvalidArgumentException;
use DateTimeImmutable;

final class IndexController extends Controller
{
    public function index(): void
    {
        $error = '';
        $admin = AdminAuth::user();
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $action = is_string($_POST['action'] ?? null) ? trim($_POST['action']) : '';

        if ($method === 'POST' && !AdminAuth::validCsrf(is_string($_POST['csrf_token'] ?? null) ? $_POST['csrf_token'] : '')) {
            $error = '页面会话已失效，请刷新后重试。';
        } elseif ($method === 'POST' && $action === 'login' && $admin === null) {
            try {
                $username = is_string($_POST['username'] ?? null) ? $_POST['username'] : '';
                $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
                if (AdminAuth::login($username, $password)) {
                    abbAdminRedirect('success', '登录成功。');
                }
                $error = '用户名或密码错误。';
            } catch (BusinessError $exception) {
                http_response_code($exception->httpStatus);
                $error = $exception->getMessage();
            } catch (Throwable $exception) {
                error_log('[ABB2026 Admin] Login failed.');
                $error = '登录服务暂时不可用，请稍后重试。';
            }
            $admin = AdminAuth::user();
        } elseif ($method === 'POST' && $action === 'logout' && $admin !== null) {
            AdminAuth::logout();
            abbAdminRedirect('success', '已安全退出。');
        }

        if ($admin !== null && $method === 'POST' && $error === '') {
            $pdo = Database::connection();

            if ($action === 'update_prizes') {
                $submitted = is_array($_POST['prizes'] ?? null) ? $_POST['prizes'] : [];
                $pdo->beginTransaction();
                try {
                    $current = $pdo->query('SELECT id, code, name, total_stock, total_remaining, daily_stock, draw_weight, active FROM prizes ORDER BY id FOR UPDATE')->fetchAll();
                    $updated = [];
                    $statement = $pdo->prepare(
                        'UPDATE prizes SET total_remaining = :total_remaining, daily_stock = :daily_stock,
                         draw_weight = :draw_weight, active = :active, updated_at = NOW() WHERE id = :id'
                    );
                    $dailyStatement = $pdo->prepare(
                        'INSERT INTO prize_daily_stock (prize_id, stock_date, allocated, used)
                         VALUES (:prize_id, :stock_date, :allocated, 0)
                         ON DUPLICATE KEY UPDATE allocated = GREATEST(used, VALUES(allocated))'
                    );
                    foreach ($current as $prize) {
                        $id = (int) $prize['id'];
                        $row = is_array($submitted[$id] ?? null) ? $submitted[$id] : [];
                        $remaining = filter_var($row['total_remaining'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => (int) $prize['total_stock']]]);
                        $daily = filter_var($row['daily_stock'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 1000000]]);
                        $weight = filter_var($row['draw_weight'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 1000000]]);
                        $active = isset($row['active']) ? 1 : 0;
                        if ($remaining === false || $daily === false || $weight === false || ($active === 1 && $weight < 1)) {
                            throw new InvalidArgumentException($prize['name'] . ' 的库存或权重无效；启用的奖品权重必须大于 0。');
                        }
                        $statement->execute([
                            'total_remaining' => $remaining,
                            'daily_stock' => $daily,
                            'draw_weight' => $weight,
                            'active' => $active,
                            'id' => $id,
                        ]);
                        $dailyStatement->execute([
                            'prize_id' => $id,
                            'stock_date' => (new DateTimeImmutable('today'))->format('Y-m-d'),
                            'allocated' => $daily,
                        ]);
                        $updated[] = ['id' => $id, 'remaining' => $remaining, 'daily' => $daily, 'weight' => $weight, 'active' => $active];
                    }
                    AdminAuth::audit($admin['id'], 'update_prizes', ['prizes' => $updated]);
                    $pdo->commit();
                    abbAdminRedirect('success', '奖品库存和抽奖权重已更新。');
                } catch (Throwable $exception) {
                    if ($pdo->inTransaction()) {
                        $pdo->rollBack();
                    }
                    $error = $exception instanceof InvalidArgumentException ? $exception->getMessage() : '保存失败，请检查数据库状态。';
                }
            }

            if ($action === 'redeem') {
                $claimCode = strtoupper(trim((string) ($_POST['claim_code'] ?? '')));
                if (!preg_match('/^[A-F0-9]{12}$/', $claimCode)) {
                    $error = '请输入 12 位有效兑奖码。';
                } else {
                    $pdo->beginTransaction();
                    try {
                        $find = $pdo->prepare(
                            'SELECT d.id, d.redeemed_at, p.name, u.nickname
                             FROM draws d JOIN prizes p ON p.id = d.prize_id JOIN users u ON u.id = d.user_id
                             WHERE d.claim_code = :claim_code LIMIT 1 FOR UPDATE'
                        );
                        $find->execute(['claim_code' => $claimCode]);
                        $draw = $find->fetch();
                        if (!$draw) {
                            throw new InvalidArgumentException('未找到该兑奖码。');
                        }
                        if ($draw['redeemed_at'] === null) {
                            $pdo->prepare('UPDATE draws SET redeemed_at = NOW(), redeemed_by = :admin_id WHERE id = :id')
                                ->execute(['admin_id' => $admin['id'], 'id' => (int) $draw['id']]);
                            AdminAuth::audit($admin['id'], 'redeem_prize', ['draw_id' => (int) $draw['id'], 'claim_code' => $claimCode]);
                        }
                        $pdo->commit();
                        $text = $draw['redeemed_at'] === null
                            ? sprintf('核销成功：%s / %s。', $draw['name'], $draw['nickname'] ?: '匿名用户')
                            : sprintf('该奖品已于 %s 核销。', $draw['redeemed_at']);
                        abbAdminRedirect('success', $text);
                    } catch (Throwable $exception) {
                        if ($pdo->inTransaction()) {
                            $pdo->rollBack();
                        }
                        $error = $exception instanceof InvalidArgumentException ? $exception->getMessage() : '核销失败，请稍后重试。';
                    }
                }
            }

            if ($action === 'export_open_answers') {
                AdminAuth::audit($admin['id'], 'export_open_answers');
                header('Content-Type: text/csv; charset=utf-8');
                header('Content-Disposition: attachment; filename="abb2026-open-answers-' . date('Ymd-His') . '.csv"');
                echo "\xEF\xBB\xBF";
                $output = fopen('php://output', 'wb');
                fputcsv($output, ['用户编号', '昵称', '开放题回答', '提交时间'], ',', '"', '');
                $rows = $pdo->query(
                    'SELECT a.user_id, u.nickname, a.answer_json, a.submitted_at
                     FROM answers a JOIN users u ON u.id = a.user_id
                     WHERE a.station = 4 AND a.passed = 1 ORDER BY a.submitted_at ASC'
                );
                foreach ($rows as $row) {
                    fputcsv($output, array_map('abbCsvCell', [$row['user_id'], $row['nickname'], json_decode($row['answer_json'], true), $row['submitted_at']]), ',', '"', '');
                }
                fclose($output);
                exit;
            }
        }

        $flash = $_SESSION['admin_flash'] ?? null;
        unset($_SESSION['admin_flash']);
        $csrf = Auth::csrfToken();

        $stats = [];
        $prizes = [];
        $draws = [];
        if ($admin !== null) {
            $pdo = Database::connection();
            $stats = [
                'users' => (int) $pdo->query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL')->fetchColumn(),
                'completed' => (int) $pdo->query('SELECT COUNT(*) FROM (SELECT user_id FROM answers WHERE passed = 1 GROUP BY user_id HAVING COUNT(*) = 6) completed_users')->fetchColumn(),
                'draws' => (int) $pdo->query('SELECT COUNT(*) FROM draws')->fetchColumn(),
                'redeemed' => (int) $pdo->query('SELECT COUNT(*) FROM draws WHERE redeemed_at IS NOT NULL')->fetchColumn(),
            ];
            $prizes = $pdo->query(
                'SELECT id, code, name, total_stock, total_remaining, daily_stock, draw_weight, active FROM prizes ORDER BY id'
            )->fetchAll();
            $draws = $pdo->query(
                'SELECT d.claim_code, d.drawn_at, d.redeemed_at, p.name AS prize_name, u.nickname
                 FROM draws d JOIN prizes p ON p.id = d.prize_id JOIN users u ON u.id = d.user_id
                 ORDER BY d.drawn_at DESC LIMIT 100'
            )->fetchAll();
        }
        defined('ABB_TEMPLATE_RENDER') || define('ABB_TEMPLATE_RENDER', true);
        $this->assign(compact('admin', 'error', 'flash', 'csrf', 'stats', 'prizes', 'draws'));
        $this->display();
    }
}
