CREATE TABLE IF NOT EXISTS retailers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(500) NOT NULL,
  link VARCHAR(1000) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
WHERE NOT EXISTS (SELECT 1 FROM retailers);
