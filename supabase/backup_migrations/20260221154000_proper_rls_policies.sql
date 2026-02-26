-- Proper RLS policies following Supabase best practices (2026)
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security

-- Enable RLS
ALTER TABLE cruise_lines ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'cruise_lines'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON cruise_lines';
    END LOOP;
END $$;

-- Policy 1: Allow public (anon) to view active cruise lines
CREATE POLICY "cruise_lines_select_public"
  ON cruise_lines
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy 2: Allow authenticated users to view all cruise lines
CREATE POLICY "cruise_lines_select_authenticated"
  ON cruise_lines
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow authenticated users to insert cruise lines
CREATE POLICY "cruise_lines_insert_authenticated"
  ON cruise_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to update cruise lines
-- IMPORTANT: UPDATE requires both USING (for selection) and WITH CHECK (for the new values)
CREATE POLICY "cruise_lines_update_authenticated"
  ON cruise_lines
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 5: Allow authenticated users to delete cruise lines
CREATE POLICY "cruise_lines_delete_authenticated"
  ON cruise_lines
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify the policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'cruise_lines'
ORDER BY policyname;
