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
        if ($station < 1 || $station > 6) {
            Api::error('invalid_station', '互动站点编号无效。', 422);
        }
        $normalized = self::normalize($station, $answer);
        $passed = self::grade($station, $normalized);
        $json = json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $statement = Database::connection()->prepare(
            'INSERT INTO answers (user_id, station, answer_json, passed, attempts, submitted_at, updated_at)
             VALUES (:user_id, :station, :answer_json, :passed, 1, NOW(), NOW())
             ON DUPLICATE KEY UPDATE
               answer_json = IF(passed = 1, answer_json, VALUES(answer_json)),
               passed = GREATEST(passed, VALUES(passed)),
               attempts = attempts + 1,
               submitted_at = NOW(),
               updated_at = NOW()'
        );
        $statement->execute([
            'user_id' => $userId,
            'station' => $station,
            'answer_json' => $json,
            'passed' => $passed ? 1 : 0,
        ]);
        return [
            'station' => $station,
            'passed' => $passed,
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
            if (!is_array($answer)) {
                Api::error('invalid_answer', '请选择有效答案。', 422);
            }
            $values = array_values(array_unique(array_map('strval', $answer)));
            sort($values);
            if (count($values) < 1 || array_diff($values, ['A', 'B', 'C', 'D', 'E'])) {
                Api::error('invalid_answer', '请选择有效答案。', 422);
            }
            return $values;
        }
        if ($station === 3) {
            if (!is_array($answer) || count($answer) !== 5) {
                Api::error('invalid_answer', '请完成全部判断题。', 422);
            }
            foreach ($answer as $value) {
                if (!is_bool($value)) {
                    Api::error('invalid_answer', '判断题答案格式无效。', 422);
                }
            }
            return array_values($answer);
        }
        if ($station === 4) {
            $value = trim((string) $answer);
            if ($value === '' || mb_strlen($value) > 200) {
                Api::error('invalid_answer', '回答需为 1 至 200 个字符。', 422);
            }
            return $value;
        }
        $value = strtoupper(trim((string) $answer));
        if (!in_array($value, ['A', 'B', 'C', 'D', 'E'], true)) {
            Api::error('invalid_answer', '请选择有效答案。', 422);
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
