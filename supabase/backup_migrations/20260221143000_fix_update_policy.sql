-- Fix UPDATE policy to include WITH CHECK clause

-- Drop the existing update policy
DROP POLICY IF EXISTS "Admins can update cruise lines" ON cruise_lines;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Admins can update cruise lines"
  ON cruise_lines
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt()->>'email'
      AND is_active = true
    )
  );
