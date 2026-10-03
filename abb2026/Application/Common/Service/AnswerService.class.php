<?php
declare(strict_types=1);

final class AnswerService
{
    private const CORRECT = [
        1 => ['A', 'C', 'D'],
        2 => 'C',
        3 => [false, true, false, true, true],
        5 => 'B',
        6 => 'D',
    ];

    public static function submit(int $userId, int $station, $answer): array
    {
        self::consumeLimit($userId);
        return self::save($userId, $station, $answer);
    }

    public static function submitJson(int $userId, int $station, string $json): array
    {
        self::consumeLimit($userId);
        if (strlen($json) > 2048) {
            throw new BusinessError('invalid_answer', '提交内容过长。', 422);
        }
        return self::save($userId, $station, json_decode($json, true, 8, JSON_THROW_ON_ERROR));
    }

    private static function consumeLimit(int $userId): void
    {
        $security = abbConfig()['security'];
        RateLimiter::consume('answer', (string) $userId, (int) $security['answer_limit'], (int) $security['business_window_seconds']);
    }

    private static function save(int $userId, int $station, $answer): array
    {
        Activity::requireOpen();
        if ($station < 1 || $station > 6) {
            throw new BusinessError('invalid_station', '互动站点编号无效。', 422);
        }
        $normalized = self::normalize($station, $answer);
        $previous = self::progress($userId);
        if (!empty($previous[(string) $station]['passed'])) {
            return ['station' => $station, 'passed' => true, 'completed' => self::completedStations($userId)];
        }
        $passed = self::grade($station, $normalized);
        $json = json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $statement = Database::connection()->prepare(
            'INSERT INTO answers (user_id, station, answer_json, passed, attempts, submitted_at, updated_at)
             VALUES (:user_id, :station, :answer_json, :passed, 1, NOW(), NOW())
             ON DUPLICATE KEY UPDATE
               answer_json = IF(passed = 1, answer_json, VALUES(answer_json)),
               attempts = IF(passed = 1, attempts, attempts + 1),
               submitted_at = IF(passed = 1, submitted_at, NOW()),
               updated_at = IF(passed = 1, updated_at, NOW()),
               passed = GREATEST(passed, VALUES(passed))'
        );
        $statement->execute([
            'user_id' => $userId,
            'station' => $station,
            'answer_json' => $json,
            'passed' => $passed ? 1 : 0,
        ]);
        return [
            'station' => $station,
            'passed' => self::progress($userId)[(string) $station]['passed'],
            'completed' => self::completedStations($userId),
        ];
    }

    public static function progress(int $userId): array
    {
        $statement = Database::connection()->prepare(
            'SELECT station, answer_json, passed, submitted_at FROM answers WHERE user_id = :user_id ORDER BY station'
        );
        $statement->execute(['user_id' => $userId]);
        $progress = [];
        foreach ($statement->fetchAll() as $row) {
            $progress[(string) $row['station']] = [
                'answer' => json_decode($row['answer_json'], true),
                'passed' => (bool) $row['passed'],
                'submitted' => (bool) $row['passed'],
                'submittedAt' => $row['submitted_at'],
            ];
        }
        return $progress;
    }

    public static function completedStations(int $userId): int
    {
        $statement = Database::connection()->prepare(
            'SELECT COUNT(*) FROM answers WHERE user_id = :user_id AND passed = 1'
        );
        $statement->execute(['user_id' => $userId]);
        return (int) $statement->fetchColumn();
    }

    private static function normalize(int $station, $answer)
    {
        if ($station === 1) {
            if (!is_array($answer) || count($answer) < 1 || count($answer) > 5 || array_keys($answer) !== range(0, count($answer) - 1)) {
                throw new BusinessError('invalid_answer', '请选择有效答案。', 422);
            }
            foreach ($answer as $value) {
                if (!is_string($value) || !in_array($value, ['A', 'B', 'C', 'D', 'E'], true)) {
                    throw new BusinessError('invalid_answer', '请选择有效答案。', 422);
                }
            }
            $values = array_values(array_unique($answer));
            sort($values);
            if (count($values) < 1 || array_diff($values, ['A', 'B', 'C', 'D', 'E'])) {
                throw new BusinessError('invalid_answer', '请选择有效答案。', 422);
            }
            return $values;
        }
        if ($station === 3) {
            if (!is_array($answer) || count($answer) !== 5 || array_keys($answer) !== range(0, 4)) {
                throw new BusinessError('invalid_answer', '请完成全部判断题。', 422);
            }
            foreach ($answer as $value) {
                if (!is_bool($value)) {
                    throw new BusinessError('invalid_answer', '判断题答案格式无效。', 422);
                }
            }
            return array_values($answer);
        }
        if ($station === 4) {
            if (!is_string($answer) || !mb_check_encoding($answer, 'UTF-8') || strpos($answer, "\0") !== false) {
                throw new BusinessError('invalid_answer', '回答格式无效。', 422);
            }
            $value = trim($answer);
            if ($value === '' || mb_strlen($value) > 200) {
                throw new BusinessError('invalid_answer', '回答需为 1 至 200 个字符。', 422);
            }
            return $value;
        }
        if (!is_string($answer) || strlen($answer) > 16) {
            throw new BusinessError('invalid_answer', '请选择有效答案。', 422);
        }
        $value = strtoupper(trim($answer));
        if (!in_array($value, ['A', 'B', 'C', 'D', 'E'], true)) {
            throw new BusinessError('invalid_answer', '请选择有效答案。', 422);
        }
        return $value;
    }

    private static function grade(int $station, $answer): bool
    {
        if ($station === 4) {
            return true;
        }
        return $answer === self::CORRECT[$station];
    }
}
