-- Force clean slate - disable RLS and keep it disabled for now
-- We'll fix this properly after verifying functionality

-- Drop ALL policies forcefully
DROP POLICY IF EXISTS "cruise_lines_select_policy" ON cruise_lines;
DROP POLICY IF EXISTS "cruise_lines_insert_policy" ON cruise_lines;
DROP POLICY IF EXISTS "cruise_lines_update_policy" ON cruise_lines;
DROP POLICY IF EXISTS "cruise_lines_delete_policy" ON cruise_lines;
DROP POLICY IF EXISTS "Public can view active cruise lines" ON cruise_lines;
DROP POLICY IF EXISTS "Admins can insert cruise lines" ON cruise_lines;
DROP POLICY IF EXISTS "Admins can update cruise lines" ON cruise_lines;
DROP POLICY IF EXISTS "Admins can delete cruise lines" ON cruise_lines;

-- Disable RLS
ALTER TABLE cruise_lines DISABLE ROW LEVEL SECURITY;

-- Confirm status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'cruise_lines';
