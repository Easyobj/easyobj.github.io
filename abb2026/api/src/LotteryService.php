<?php
declare(strict_types=1);

final class LotteryService
{
    public static function draw(int $userId): array
    {
        Activity::requireOpen();
        if (AnswerService::completedStations($userId) !== 6) {
            Api::error('not_eligible', '完成全部六个互动站点后才可抽奖。', 403);
        }

        $pdo = Database::connection();
        $pdo->beginTransaction();
        try {
            // Serialize all draw attempts for this user before checking for an
            // existing draw. This prevents two concurrent requests from both
            // passing the eligibility check.
            $lockUser = $pdo->prepare('SELECT id FROM users WHERE id = :user_id FOR UPDATE');
            $lockUser->execute(['user_id' => $userId]);
            if (!$lockUser->fetch()) {
                throw new RuntimeException('User disappeared during draw.');
            }
            $existing = $pdo->prepare(
                'SELECT d.claim_code, d.drawn_at, p.code, p.name
                 FROM draws d JOIN prizes p ON p.id = d.prize_id
                 WHERE d.user_id = :user_id LIMIT 1 FOR UPDATE'
            );
            $existing->execute(['user_id' => $userId]);
            $draw = $existing->fetch();
            if ($draw) {
                $pdo->commit();
                return self::formatDraw($draw, true);
            }

            $today = (new DateTimeImmutable('today'))->format('Y-m-d');
            $prizes = $pdo->query(
                'SELECT id, code, name, daily_stock, total_remaining, draw_weight
                 FROM prizes WHERE active = 1 ORDER BY id FOR UPDATE'
            )->fetchAll();

            if (!$prizes) {
                $pdo->rollBack();
                Api::error('prizes_not_configured', '奖品尚未配置。', 503);
            }
            foreach ($prizes as $prize) {
                if ($prize['draw_weight'] === null || (int) $prize['draw_weight'] <= 0) {
                    $pdo->rollBack();
                    Api::error('probability_not_configured', '抽奖概率尚未由活动方确认。', 503);
                }
                $seed = $pdo->prepare(
                    'INSERT IGNORE INTO prize_daily_stock (prize_id, stock_date, allocated, used)
                     VALUES (:prize_id, :stock_date, :allocated, 0)'
                );
                $seed->execute([
                    'prize_id' => (int) $prize['id'],
                    'stock_date' => $today,
                    'allocated' => (int) $prize['daily_stock'],
                ]);
            }

            $available = $pdo->prepare(
                'SELECT p.id, p.code, p.name, p.draw_weight
                 FROM prizes p
                 JOIN prize_daily_stock s ON s.prize_id = p.id AND s.stock_date = :stock_date
                 WHERE p.active = 1 AND p.total_remaining > 0 AND s.used < s.allocated
                 ORDER BY p.id FOR UPDATE'
            );
            $available->execute(['stock_date' => $today]);
            $candidates = $available->fetchAll();
            if (!$candidates) {
                $pdo->rollBack();
                Api::error('sold_out_today', '今日奖品已全部发放完毕。', 409);
            }

            $winner = self::weightedChoice($candidates);
            $claimCode = strtoupper(bin2hex(random_bytes(6)));
            $decrement = $pdo->prepare(
                'UPDATE prizes p
                 JOIN prize_daily_stock s ON s.prize_id = p.id AND s.stock_date = :stock_date
                 SET p.total_remaining = p.total_remaining - 1, s.used = s.used + 1
                 WHERE p.id = :prize_id AND p.total_remaining > 0 AND s.used < s.allocated'
            );
            $decrement->execute(['stock_date' => $today, 'prize_id' => (int) $winner['id']]);
            // A multi-table UPDATE may report two changed rows (one in each
            // table), so only zero means the guarded decrement did not occur.
            if ($decrement->rowCount() < 1) {
                throw new RuntimeException('Prize inventory changed during draw.');
            }

            $insert = $pdo->prepare(
                'INSERT INTO draws (user_id, prize_id, claim_code, drawn_at) VALUES (:user_id, :prize_id, :claim_code, NOW())'
            );
            $insert->execute([
                'user_id' => $userId,
                'prize_id' => (int) $winner['id'],
                'claim_code' => $claimCode,
            ]);
            $pdo->commit();
            return self::formatDraw([
                'claim_code' => $claimCode,
                'drawn_at' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
                'code' => $winner['code'],
                'name' => $winner['name'],
            ], false);
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $error;
        }
    }

    public static function existing(int $userId): ?array
    {
        $statement = Database::connection()->prepare(
            'SELECT d.claim_code, d.drawn_at, d.redeemed_at, p.code, p.name
             FROM draws d JOIN prizes p ON p.id = d.prize_id WHERE d.user_id = :user_id LIMIT 1'
        );
        $statement->execute(['user_id' => $userId]);
        $draw = $statement->fetch();
        return $draw ? self::formatDraw($draw, true) : null;
    }

    private static function weightedChoice(array $candidates): array
    {
        $total = array_sum(array_map(static fn(array $item): int => (int) $item['draw_weight'], $candidates));
        $ticket = random_int(1, $total);
        foreach ($candidates as $candidate) {
            $ticket -= (int) $candidate['draw_weight'];
            if ($ticket <= 0) {
                return $candidate;
            }
        }
        throw new RuntimeException('Unable to select a prize.');
    }

    private static function formatDraw(array $draw, bool $existing): array
    {
        return [
            'existing' => $existing,
            'prize' => ['code' => $draw['code'], 'name' => $draw['name']],
            'claimCode' => $draw['claim_code'],
            'drawnAt' => $draw['drawn_at'],
            'redeemedAt' => $draw['redeemed_at'] ?? null,
        ];
    }
}
