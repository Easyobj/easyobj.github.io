<?php
declare(strict_types=1);
// Preserve the old bookmark while administration runs through ThinkPHP.
header('Location: ../../index.php?m=Admin&c=Index&a=index', true, ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' ? 307 : 302);
exit;
