import { query } from "~~/server/utils/db";

let schemaReady = false;

// Mirrors server/database/migrations/20261009_retailers.sql so fresh environments work without running it by hand.
export async function ensureRetailersTable() {
  if (schemaReady) return;

  await query(`
    CREATE TABLE IF NOT EXISTS retailers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(500) NOT NULL,
      link VARCHAR(1000) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed with the stores that used to be hardcoded on the About page (the commented-out ones start hidden).
  await query(`
    INSERT INTO retailers (name, image, link, sort_order, is_active)
    SELECT * FROM (
      SELECT 'Shopee' AS name, '/Swizer/Shopee.png' AS image, 'https://shopee.co.th/swizer_store' AS link, 1 AS sort_order, 1 AS is_active UNION ALL
      SELECT 'Lazada', '/Swizer/Lazada_(2019).svg.png', 'https://www.lazada.co.th/shop/swizer-store', 2, 1 UNION ALL
      SELECT 'Tops Supermarket', '/Swizer/TopLogo.png', NULL, 3, 0 UNION ALL
      SELECT 'Gourmet Market', '/Swizer/Gourmet.png', NULL, 4, 0 UNION ALL
      SELECT 'Foodland', '/Swizer/FoodlandLogo.png', NULL, 5, 0 UNION ALL
      SELECT 'Tokyu Department Store', '/Swizer/TokyuDepartmentStoreLogo.png', NULL, 6, 0 UNION ALL
      SELECT 'Baimiang', '/Swizer/Baimiang.png', NULL, 7, 0 UNION ALL
      SELECT 'Healthy Planet', '/Swizer/Healthy%20Planet.png', NULL, 8, 0 UNION ALL
      SELECT 'Watsons', '/Swizer/Watsons.png', NULL, 9, 0
    ) seed
    WHERE NOT EXISTS (SELECT 1 FROM retailers)
  `);

  schemaReady = true;
}

function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

// Validates admin input; link/image end up in href/src on the public page.
export function parseRetailerBody(body: any) {
  const name = String(body?.name || "").trim();
  const image = String(body?.image || "").trim();
  const link = String(body?.link || "").trim();

  if (!name) throw createError({ statusCode: 400, statusMessage: "กรุณากรอกชื่อร้าน" });
  if (!image || !(image.startsWith("/") || isHttpUrl(image))) {
    throw createError({ statusCode: 400, statusMessage: "กรุณาอัปโหลดโลโก้ร้าน" });
  }
  if (link && !isHttpUrl(link)) {
    throw createError({ statusCode: 400, statusMessage: "ลิงก์ร้านต้องขึ้นต้นด้วย http:// หรือ https://" });
  }

  return {
    name,
    image,
    link: link || null,
    sort_order: Number.parseInt(body?.sort_order, 10) || 0,
    is_active: body?.is_active === false || body?.is_active === 0 ? 0 : 1,
  };
}
