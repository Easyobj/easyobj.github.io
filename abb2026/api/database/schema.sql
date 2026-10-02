SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  openid VARCHAR(128) NOT NULL,
  nickname VARCHAR(120) NOT NULL DEFAULT '',
  avatar_url VARCHAR(1000) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS answers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  station TINYINT UNSIGNED NOT NULL,
  answer_json LONGTEXT NOT NULL,
  passed TINYINT(1) NOT NULL DEFAULT 0,
  attempts INT UNSIGNED NOT NULL DEFAULT 1,
  submitted_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_answers_user_station (user_id, station),
  KEY idx_answers_station_passed (station, passed),
  CONSTRAINT fk_answers_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prizes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(120) NOT NULL,
  total_stock INT UNSIGNED NOT NULL,
  total_remaining INT UNSIGNED NOT NULL,
  daily_stock INT UNSIGNED NOT NULL,
  draw_weight INT UNSIGNED NULL COMMENT 'Must be confirmed by activity owner before launch',
  active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_prizes_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prize_daily_stock (
  prize_id INT UNSIGNED NOT NULL,
  stock_date DATE NOT NULL,
  allocated INT UNSIGNED NOT NULL,
  used INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (prize_id, stock_date),
  CONSTRAINT fk_daily_stock_prize FOREIGN KEY (prize_id) REFERENCES prizes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS draws (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  prize_id INT UNSIGNED NOT NULL,
  claim_code CHAR(12) NOT NULL,
  drawn_at DATETIME NOT NULL,
  redeemed_at DATETIME NULL,
  redeemed_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_draws_user (user_id),
  UNIQUE KEY uk_draws_claim_code (claim_code),
  KEY idx_draws_drawn_at (drawn_at),
  CONSTRAINT fk_draws_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_draws_prize FOREIGN KEY (prize_id) REFERENCES prizes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prize names and inventory are sourced from resources/2026题目.docx.
-- draw_weight intentionally remains NULL until the activity owner confirms
-- the production distribution; the API refuses to draw while it is unset.
INSERT INTO prizes (code, name, total_stock, total_remaining, daily_stock, draw_weight, active, updated_at)
VALUES
  ('canvas-bag', '帆布袋', 1000, 1000, 200, NULL, 1, NOW()),
  ('blind-box', '盲盒', 240, 240, 48, NULL, 1, NOW()),
  ('robot-phone-stand', '机器人手机支架', 10, 10, 2, NULL, 1, NOW()),
  ('xiaomi-toolkit', '小米工具箱', 10, 10, 2, NULL, 1, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  total_stock = VALUES(total_stock),
  daily_stock = VALUES(daily_stock),
  updated_at = NOW();
