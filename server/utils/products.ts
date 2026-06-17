import { query } from '~~/server/utils/db';

let productPricingSchemaReady = false;

export async function ensureProductPricingSchema() {
  if (productPricingSchemaReady) return;

  await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2) NULL AFTER price');
  await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active');
  await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_order INT UNSIGNED NOT NULL DEFAULT 0 AFTER is_featured');
  await query(`
    CREATE TABLE IF NOT EXISTS product_categories (
      product_id VARCHAR(50) NOT NULL,
      category_id VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (product_id, category_id),
      CONSTRAINT fk_product_categories_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      CONSTRAINT fk_product_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);
  await query(`
    INSERT IGNORE INTO product_categories (product_id, category_id)
    SELECT id, category_id FROM products WHERE category_id IS NOT NULL AND category_id <> ''
  `);
  productPricingSchemaReady = true;
}

export function normalizeProductCategoryIds(primaryCategoryId: unknown, additionalCategoryIds: unknown) {
  const ids = [
    String(primaryCategoryId || ''),
    ...(Array.isArray(additionalCategoryIds) ? additionalCategoryIds : []),
  ]
    .map((id) => String(id || ''))
    .filter((id) => Boolean(id.trim()));

  return [...new Set(ids)];
}

export async function syncProductCategories(productId: string, primaryCategoryId: unknown, additionalCategoryIds: unknown) {
  const categoryIds = normalizeProductCategoryIds(primaryCategoryId, additionalCategoryIds);
  await query('DELETE FROM product_categories WHERE product_id = ?', [productId]);
  if (!categoryIds.length) return;

  const placeholders = categoryIds.map(() => '(?, ?)').join(', ');
  await query(
    `INSERT INTO product_categories (product_id, category_id) VALUES ${placeholders}`,
    categoryIds.flatMap((categoryId) => [productId, categoryId])
  );
}

export async function getProductCategoryMap(productIds: unknown[]) {
  const ids = [...new Set(productIds.map((id) => String(id || '').trim()).filter(Boolean))];
  const map = new Map<string, string[]>();
  if (!ids.length) return map;

  const placeholders = ids.map(() => '?').join(', ');
  const rows = await query<{ product_id: string; category_id: string }>(
    `SELECT product_id, category_id FROM product_categories WHERE product_id IN (${placeholders})`,
    ids
  );

  for (const row of rows) {
    const productId = String(row.product_id);
    const categories = map.get(productId) || [];
    categories.push(String(row.category_id));
    map.set(productId, categories);
  }
  return map;
}

export function normalizeSalePrice(value: unknown, regularPrice: unknown) {
  if (value === null || value === undefined || value === '') return null;

  const salePrice = Number(value);
  const price = Number(regularPrice);
  if (!Number.isFinite(salePrice) || salePrice <= 0 || salePrice >= price) return null;
  return salePrice;
}

export function normalizeFeaturedOrder(value: unknown) {
  const order = Number(value);
  if (!Number.isFinite(order) || order <= 0) return 0;
  return Math.trunc(order);
}

export function effectiveProductPrice(price: unknown, salePrice: unknown) {
  return normalizeSalePrice(salePrice, price) ?? Number(price);
}
