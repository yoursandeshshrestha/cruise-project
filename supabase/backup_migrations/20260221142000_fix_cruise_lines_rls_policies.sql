-- Fix RLS policies for cruise_lines to allow admin INSERT, UPDATE, DELETE operations

-- =============================================================================
-- DROP OLD POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Admins can manage cruise lines" ON cruise_lines;

-- =============================================================================
-- CREATE SEPARATE POLICIES FOR EACH OPERATION
-- =============================================================================

-- Public can view active cruise lines (SELECT)
-- This policy already exists, but recreate it to be sure
DROP POLICY IF EXISTS "Public can view active cruise lines" ON cruise_lines;
CREATE POLICY "Public can view active cruise lines"
  ON cruise_lines
  FOR SELECT
  USING (is_active = true);

-- Admins can insert new cruise lines
CREATE POLICY "Admins can insert cruise lines"
  ON cruise_lines
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
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
      WHERE email = auth.jwt()->>'email'
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
      WHERE email = auth.jwt()->>'email'
      AND is_active = true
    )
  );

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- To verify policies:
-- SELECT * FROM pg_policies WHERE tablename = 'cruise_lines';
