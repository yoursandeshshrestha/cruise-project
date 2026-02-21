-- Fix RLS policies to use auth.email() instead of auth.jwt()->>'email'
-- This is the correct way to access the authenticated user's email in Supabase

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can insert cruise lines" ON cruise_lines;
DROP POLICY IF EXISTS "Admins can update cruise lines" ON cruise_lines;
DROP POLICY IF EXISTS "Admins can delete cruise lines" ON cruise_lines;

-- Recreate with correct auth function

-- Admins can insert new cruise lines
CREATE POLICY "Admins can insert cruise lines"
  ON cruise_lines
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
      AND is_active = true
    )
  );

-- Admins can update cruise lines
CREATE POLICY "Admins can update cruise lines"
  ON cruise_lines
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
      AND is_active = true
    )
  );

-- Admins can delete (soft delete) cruise lines
CREATE POLICY "Admins can delete cruise lines"
  ON cruise_lines
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
      AND is_active = true
    )
  );
