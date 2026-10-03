<?php
declare(strict_types=1);

/** Database-backed limits shared across PHP workers and browser sessions. */
final class RateLimiter
{
    public static function key(string $scope, string $identity): string
    {
        return hash('sha256', $scope . "\0" . $identity);
    }

    public static function consume(string $scope, string $identity, int $limit, int $windowSeconds, string $errorCode = 'rate_limited'): void
    {
        if ($limit < 1 || $limit > 1000000 || $windowSeconds < 1 || $windowSeconds > 86400) {
            throw new InvalidArgumentException('Invalid rate limit configuration.');
        }
        $pdo = Database::connection();
        if ($pdo->inTransaction()) {
            throw new LogicException('Consume rate limits before business transactions.');
        }
        $key = self::key($scope, $identity);
        $now = time();
        for ($attempt = 0; $attempt < 3; $attempt++) {
            try {
                $pdo->beginTransaction();
                // Assignment order matters: evaluate expiry before updating the
                // window start. Distinct placeholders support native prepares.
                $write = $pdo->prepare(
                    'INSERT INTO security_rate_limits (bucket_hash, window_started_at, hits, expires_at)
                     VALUES (:bucket, :now, 1, :expiry)
                     ON DUPLICATE KEY UPDATE
                       hits = IF(window_started_at <= :cutoff1, 1, LEAST(hits + 1, 1000000)),
                       expires_at = IF(window_started_at <= :cutoff2, :expiry2, expires_at),
                       window_started_at = IF(window_started_at <= :cutoff3, :now2, window_started_at)'
                );
                $write->execute([
                    'bucket' => $key, 'now' => $now, 'expiry' => $now + $windowSeconds,
                    'cutoff1' => $now - $windowSeconds, 'cutoff2' => $now - $windowSeconds,
                    'cutoff3' => $now - $windowSeconds, 'expiry2' => $now + $windowSeconds, 'now2' => $now,
                ]);
                $read = $pdo->prepare('SELECT hits, expires_at FROM security_rate_limits WHERE bucket_hash = :bucket FOR UPDATE');
                $read->execute(['bucket' => $key]);
                $row = $read->fetch();
                if (!$row) {
                    throw new RuntimeException('Rate limit row missing.');
                }
                // Rejections are counted too; commit before returning 429.
                $pdo->commit();
                if ((int) $row['hits'] > $limit) {
                    $retryAfter = max(1, (int) $row['expires_at'] - $now);
                    if (PHP_SAPI !== 'cli' && !headers_sent()) {
                        header('Retry-After: ' . $retryAfter);
                    }
                    throw new BusinessError($errorCode, '尝试过多，请稍后重试。', 429);
                }
                return;
            } catch (PDOException $error) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                if ($attempt < 2 && ($error->getCode() === '40001' || in_array((int) ($error->errorInfo[1] ?? 0), [1205, 1213], true))) {
                    usleep(random_int(1000, 10000));
                    continue;
                }
                throw $error;
            } catch (Throwable $error) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                throw $error;
            }
        }
    }

    public static function clear(string $scope, string $identity): void
    {
        $statement = Database::connection()->prepare('DELETE FROM security_rate_limits WHERE bucket_hash = :bucket');
        $statement->execute(['bucket' => self::key($scope, $identity)]);
    }
}
