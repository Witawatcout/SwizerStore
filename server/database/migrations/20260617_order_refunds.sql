ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS refund_status ENUM('none','partial','full') NOT NULL DEFAULT 'none' AFTER payment_status,
  ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER refund_status;

CREATE TABLE IF NOT EXISTS order_refunds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  method ENUM('omise','manual') NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'closed',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'THB',
  omise_refund_id VARCHAR(120) DEFAULT NULL,
  transaction_reference VARCHAR(160) DEFAULT NULL,
  bank_name VARCHAR(120) DEFAULT NULL,
  bank_account_name VARCHAR(160) DEFAULT NULL,
  bank_account_number VARCHAR(80) DEFAULT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_order_refunds_order_id (order_id),
  INDEX idx_order_refunds_created_at (created_at)
);

UPDATE orders o
LEFT JOIN (
  SELECT order_id, COALESCE(SUM(amount), 0) AS total_refunded
  FROM order_refunds
  GROUP BY order_id
) r ON r.order_id = o.id
SET
  o.refunded_amount = COALESCE(r.total_refunded, 0),
  o.refund_status = CASE
    WHEN COALESCE(r.total_refunded, 0) <= 0 THEN 'none'
    WHEN COALESCE(r.total_refunded, 0) >= o.total THEN 'full'
    ELSE 'partial'
  END;
