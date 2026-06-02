CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  address_line2 VARCHAR(255) DEFAULT NULL,
  subdistrict VARCHAR(100) DEFAULT NULL,
  district VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  delivery_note TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_shipping_profiles (
  user_id INT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL DEFAULT '',
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(150) NOT NULL DEFAULT '',
  phone VARCHAR(20) NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  address_line2 VARCHAR(255) DEFAULT NULL,
  subdistrict VARCHAR(100) DEFAULT NULL,
  district VARCHAR(100) NOT NULL DEFAULT '',
  province VARCHAR(100) NOT NULL DEFAULT '',
  postal_code VARCHAR(10) NOT NULL DEFAULT '',
  delivery_note TEXT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  customer_id INT NOT NULL,
  status ENUM('pending','paid','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  payment_method ENUM('credit_card','promptpay') NOT NULL,
  payment_status ENUM('pending','success','failed') DEFAULT 'pending',
  omise_charge_id VARCHAR(100),
  omise_source_id VARCHAR(100),
  promptpay_qr_url VARCHAR(500),
  confirmation_email_sent_at TIMESTAMP NULL DEFAULT NULL,
  admin_seen_at TIMESTAMP NULL DEFAULT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  note TEXT,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0 AFTER price,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER stock;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promptpay_qr_url VARCHAR(500) DEFAULT NULL AFTER omise_source_id,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMP NULL DEFAULT NULL AFTER promptpay_qr_url,
  ADD COLUMN IF NOT EXISTS admin_seen_at TIMESTAMP NULL DEFAULT NULL AFTER confirmation_email_sent_at,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL DEFAULT NULL AFTER note;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_admin_seen_at ON orders(admin_seen_at);
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_email_sent_at ON orders(confirmation_email_sent_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
