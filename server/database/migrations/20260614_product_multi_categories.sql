ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active,
  ADD COLUMN IF NOT EXISTS featured_order INT UNSIGNED NOT NULL DEFAULT 0 AFTER is_featured;

CREATE TABLE IF NOT EXISTS product_categories (
  product_id VARCHAR(50) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

INSERT IGNORE INTO product_categories (product_id, category_id)
SELECT id, category_id
FROM products
WHERE category_id IS NOT NULL AND category_id <> '';
