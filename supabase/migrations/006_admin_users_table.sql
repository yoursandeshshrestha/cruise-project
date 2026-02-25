-- Admin Users Table - RLS Configuration
-- Enable proper RLS policies for admin users table
-- Consolidated from: 015_enable_admin_users_rls.sql

-- Note: admin_users table was already created in 001_initial_schema.sql
-- This migration only adds the proper RLS policies

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- RLS is already enabled in 001_initial_schema.sql, but we'll ensure it's enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop any old policies that might exist from initial schema
DROP POLICY IF EXISTS "customers_select_authenticated" ON admin_users;
DROP POLICY IF EXISTS "customers_insert_authenticated" ON admin_users;
DROP POLICY IF EXISTS "customers_update_authenticated" ON admin_users;
DROP POLICY IF EXISTS "customers_delete_authenticated" ON admin_users;

-- Policy 1: Allow authenticated users to view all admin users
-- (Needed to check if a user is an admin during login/authorization)
CREATE POLICY "admin_users_select_authenticated"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow authenticated users to insert admin users
CREATE POLICY "admin_users_insert_authenticated"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to update admin users
CREATE POLICY "admin_users_update_authenticated"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete admin users
CREATE POLICY "admin_users_delete_authenticated"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE admin_users IS 'Admin users table - RLS enabled with authenticated role policies';
