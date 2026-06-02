ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL DEFAULT NULL AFTER note;

CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
