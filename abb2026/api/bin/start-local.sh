#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_root="$(cd "$script_dir/../.." && pwd)"
local_host="${ABB_LOCAL_HOST:-127.0.0.1}"
local_port="${ABB_LOCAL_PORT:-8080}"

if ! command -v php >/dev/null 2>&1; then
  echo "PHP is not installed. Run: brew install php" >&2
  exit 1
fi
if ! command -v mariadb >/dev/null 2>&1; then
  echo "MariaDB is not installed. Run: brew install mariadb" >&2
  exit 1
fi
if ! mariadb -e 'SELECT 1' >/dev/null 2>&1; then
  brew services start mariadb
  for attempt in 1 2 3 4 5; do
    if mariadb -e 'SELECT 1' >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
fi
if ! mariadb -e 'SELECT 1' >/dev/null 2>&1; then
  echo "MariaDB did not start." >&2
  exit 1
fi
if [[ ! -f "$project_root/api/config.local.php" ]]; then
  echo "Missing api/config.local.php. See LOCAL_DEVELOPMENT.md." >&2
  exit 1
fi

php "$project_root/api/bin/preflight.php" --local
echo "ABB 2026 local site: http://$local_host:$local_port/index.php#home"
echo "Admin console:       http://$local_host:$local_port/index.php?m=Admin&c=Index&a=index"
exec php -S "$local_host:$local_port" -t "$project_root" "$script_dir/local-router.php"
