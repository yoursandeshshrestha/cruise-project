-- Seed Admin User and Additional Initial Data
-- Consolidated from: 20260221032600_seed_admin_user.sql

-- =============================================================================
-- SEED ADMIN USER
-- =============================================================================

-- Insert admin user into admin_users table
-- Note: This uses Supabase Auth, so the auth user needs to be created separately
-- This just creates the admin metadata record
INSERT INTO admin_users (email, role, is_active)
VALUES
  ('admin@simplecruiseparking.com', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE admin_users IS 'Admin users table - syncs with Supabase Auth users';
