-- Debug and fix RLS policies
-- Let's try a different approach: check if user is authenticated first

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert cruise lines" ON cruise_lines;
DROP POLICY IF EXISTS "Admins can update cruise lines" ON cruise_lines;
DROP POLICY IF EXISTS "Admins can delete cruise lines" ON cruise_lines;

-- Create simpler policies that check authentication status
-- This will help us debug if the issue is with auth or with the admin_users lookup

-- Admins can insert new cruise lines
CREATE POLICY "Admins can insert cruise lines"
  ON cruise_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = (SELECT auth.email())
      AND is_active = true
    )
  );

-- Admins can update cruise lines
CREATE POLICY "Admins can update cruise lines"
  ON cruise_lines
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = (SELECT auth.email())
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = (SELECT auth.email())
      AND is_active = true
    )
  );

-- Admins can delete cruise lines
CREATE POLICY "Admins can delete cruise lines"
  ON cruise_lines
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = (SELECT auth.email())
      AND is_active = true
    )
  );
