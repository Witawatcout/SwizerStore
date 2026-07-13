CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_settings (setting_key, setting_value)
VALUES
  ('payment_enabled', '1'),
  ('line_url', 'https://page.line.me/swizer_superfood?openQrModal=true')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
