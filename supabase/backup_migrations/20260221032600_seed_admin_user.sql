-- Migration: Seed Admin User
-- Description: Creates initial admin user for the system

-- Insert admin user into admin_users table
-- Note: This uses Supabase Auth, so we'll need to create the auth user separately
-- For now, we'll insert the admin metadata record

INSERT INTO admin_users (email, role, is_active)
VALUES
  ('admin@simplecruiseparking.com', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Add comment
COMMENT ON TABLE admin_users IS 'Admin users table - syncs with Supabase Auth users';
