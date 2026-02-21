-- Re-enable RLS with clean, working policies

-- First, drop ALL existing policies to start fresh
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

-- Re-enable RLS
ALTER TABLE cruise_lines ENABLE ROW LEVEL SECURITY;

-- Create clean policies

-- 1. Public can view active cruise lines
CREATE POLICY "cruise_lines_select_policy"
  ON cruise_lines
  FOR SELECT
  USING (is_active = true);

-- 2. Authenticated users can insert cruise lines
CREATE POLICY "cruise_lines_insert_policy"
  ON cruise_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Authenticated users can update cruise lines
CREATE POLICY "cruise_lines_update_policy"
  ON cruise_lines
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Authenticated users can delete cruise lines
CREATE POLICY "cruise_lines_delete_policy"
  ON cruise_lines
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'cruise_lines'
ORDER BY policyname;
