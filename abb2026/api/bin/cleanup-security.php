<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/bootstrap.php';
// Bounded housekeeping; callers may repeat during their maintenance window.
$statement = Database::connection()->prepare('DELETE FROM security_rate_limits WHERE expires_at <= :now LIMIT 10000');
$statement->execute(['now' => time()]);
fwrite(STDOUT, 'Expired security buckets removed: ' . $statement->rowCount() . PHP_EOL);
