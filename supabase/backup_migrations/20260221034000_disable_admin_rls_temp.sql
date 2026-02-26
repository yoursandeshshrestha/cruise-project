-- Migration: Temporarily Disable RLS on admin_users for debugging
-- Description: Remove RLS to test if it's causing login issues

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can update their own last_login" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage all admin users" ON admin_users;

-- Disable RLS entirely for now
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Add comment
COMMENT ON TABLE admin_users IS 'Admin users table - RLS temporarily disabled for debugging';
