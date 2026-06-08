-- Introduce a higher admin role for sensitive back-office features.
-- Existing installations should keep at least one account with full access.
UPDATE users
SET role = 'super_admin'
WHERE role = 'admin'
ORDER BY id ASC
LIMIT 1;
