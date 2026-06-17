ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS color VARCHAR(7) NULL AFTER is_active;

UPDATE categories
SET color = CASE
  WHEN TRIM(id) = 'coffee' THEN '#8B5A2B'
  WHEN TRIM(id) = 'grains' THEN '#CA8A04'
  WHEN TRIM(id) = 'food-supplement' THEN '#16A34A'
  WHEN TRIM(id) = 'whey-protein' THEN '#2563EB'
  ELSE '#65A30D'
END
WHERE color IS NULL OR color = '';

ALTER TABLE categories
  MODIFY color VARCHAR(7) NOT NULL DEFAULT '#65A30D';
