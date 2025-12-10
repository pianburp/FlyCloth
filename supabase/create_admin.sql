-- =============================================
-- FlyCloth: Admin User Management
-- =============================================

-- List all users
SELECT u.email, p.role, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- Make a user admin (replace email)
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Verify admins
SELECT u.email, p.role FROM auth.users u JOIN profiles p ON u.id = p.id WHERE p.role = 'admin';
