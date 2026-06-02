ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP NULL DEFAULT NULL AFTER promptpay_qr_url,
  ADD COLUMN IF NOT EXISTS admin_seen_at TIMESTAMP NULL DEFAULT NULL AFTER confirmation_email_sent_at;

CREATE INDEX IF NOT EXISTS idx_orders_admin_seen_at ON orders(admin_seen_at);
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_email_sent_at ON orders(confirmation_email_sent_at);

UPDATE orders
SET admin_seen_at = CURRENT_TIMESTAMP
WHERE payment_status = 'success'
  AND admin_seen_at IS NULL;
