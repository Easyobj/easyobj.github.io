-- Additive migration. Never re-import schema.sql into an existing activity DB.
CREATE TABLE IF NOT EXISTS security_rate_limits (
  bucket_hash CHAR(64) NOT NULL,
  window_started_at BIGINT UNSIGNED NOT NULL,
  hits INT UNSIGNED NOT NULL,
  expires_at BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (bucket_hash),
  KEY idx_security_rate_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
